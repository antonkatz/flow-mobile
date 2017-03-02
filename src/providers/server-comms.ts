import { Injectable } from '@angular/core';
import {Http, Headers, RequestOptionsArgs, Response} from '@angular/http';
import {Storage} from '@ionic/storage';
import 'rxjs/add/operator/map';
import {RSA} from "../app/utils/rsa";
import {Observable} from "rxjs";
import aesjs from "aes-js"

/**
  Singleton

  All communications should go through this class
*/
@Injectable()
export class ServerComms {

  private static server_ip = "127.0.0.1"
  private static server_port = "8080"
  private static server_address = "http://" + ServerComms.server_ip + ":" + ServerComms.server_port
  private static default_headers = {"Content-Type": "application/json"}

  /** current symmetric key. shared between all instances. could be invalid. */
  private static symmetric_key: Uint8Array = null
  private static self_instance: ServerComms = null
  private static rsa = null

  constructor(public http: Http, public storage: Storage) {
    console.log('Hello ServerComms Provider');
    if(ServerComms.self_instance) {
      console.log("returning existing instance")
      return ServerComms.self_instance
    }

    ServerComms.rsa = new RSA(storage);
    ServerComms.self_instance = this
  }


  /** endpoint should have leading slash */
  sendToServer(endpoint: string, payload: any, success_callback: (data: {}) => void,
                      error_callback?: (er: any) => void, force_public?: boolean) {
    let url = ServerComms.server_address + endpoint
    let json_payload = JSON.stringify(payload)

    console.log("contacting server at", url)
    console.log("with payload", json_payload)

    if (!ServerComms.symmetric_key || force_public) {
      if(ServerComms.payloadFits(json_payload)) {
        this.sendAsymmetrically(url, json_payload).then((data) => {
          data.subscribe(success_callback, error_callback)
        }, error_callback)
      } else {
        console.log("no sym key AND payload does not fit")
        if(error_callback) error_callback({error_type: "not_able_to_send"})
      }
    }
  }

  private sendAsymmetrically(url: string, payload: string): Promise<Observable<{}>> {
    let headers = ServerComms.default_headers

    return ServerComms.rsa.getPubKey().then((pub_key) => {
      headers["public_key"] = btoa(pub_key)
      let config: RequestOptionsArgs = {headers : new Headers(headers)}
      let ebody = ServerComms.rsa.parseForServer(payload)
      return this.http.post(url, ebody, config).map(response => {
        ServerComms.setSymmetricKey(ServerComms.extractSymmetricKey(response))
        return ServerComms.parseSymmetricallyEncrypted(response)
      })
    })
  }

  private static extractSymmetricKey(response: Response): Uint8Array {
    // encrypted symmetric key in hex
    let eskh = response.headers.get("sym_key")
    // decrypted symmetric key in hex
    let dskh = ServerComms.rsa.parseFromServer(eskh)
    return aesjs.utils.hex.toBytes(dskh)
  }

  /** takes a response object, deformats from hex, decrypts it using current symmetric key, and returns json
   * @return json */
  private static parseSymmetricallyEncrypted(response: Response): Object {
    let full_response_data = aesjs.utils.hex.toBytes(response.text())
    let iv = full_response_data.slice(0, 16)
    let data = full_response_data.slice(16)
    let aes = new aesjs.ModeOfOperation.cbc(ServerComms.symmetric_key, iv);
    let dbytes = aes.decrypt(data)
    // removing padding
    dbytes = dbytes.filter(v => {return v != 16})
    let dstr = aesjs.utils.utf8.fromBytes(dbytes)
    console.log("decrypted string", dstr)
    return JSON.parse(dstr)
  }

  /** this should be the only way to set the symmetric key */
  private static setSymmetricKey(key: Uint8Array) {
    ServerComms.symmetric_key = key
  }

  /** @return true if the payload can be encoded with a public key */
  private static payloadFits(payload: any) {
    let a = null
    if (typeof a === "array") {
      a = payload
    } else {
      a = new Uint8Array(payload)
    }
    return payload.length < (RSA.key_bits / 8)
  }
}

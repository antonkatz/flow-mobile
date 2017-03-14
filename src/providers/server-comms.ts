import {Injectable} from "@angular/core";
import {Http, Headers, RequestOptionsArgs, Response} from "@angular/http";
import {Storage} from "@ionic/storage";
import "rxjs/add/operator/map";
import {RSA} from "../app/utils/rsa";
import {Observable} from "rxjs";
import aesjs from "aes-js";
import {Registration} from "./registration";

/**
 Singleton

 All communications should go through this class
 */
@Injectable()
export class ServerComms {

  private static server_ip = "192.168.2.14"
  private static server_port = "8080"
  private static server_address = "http://" + ServerComms.server_ip + ":" + ServerComms.server_port
  private static default_headers = {"Content-Type": "application/json"}

  /** current symmetric key. shared between all instances. could be invalid. */
  private static symmetric_key: Uint8Array = null
  private static self_instance: ServerComms = null
  private static rsa = null
  private static user_id = null

  constructor(public http: Http, public storage: Storage) {
    console.log('Hello ServerComms Provider');
    if (ServerComms.self_instance) {
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
      if (ServerComms.payloadFits(json_payload)) {
        this.sendAsymmetrically(url, json_payload).then((data) => {
          data.subscribe(success_callback, error_callback)
        }, error_callback)
      } else if (ServerComms.user_id) {
        this.sendSymmetrically(url, json_payload).subscribe(success_callback, error_callback)
      } else {
        console.log("no sym key or user id AND payload does not fit")
        if (error_callback) error_callback({error_type: "not_able_to_send"})
      }
    }
  }

  static setUserId(id:string) {
    ServerComms.user_id = id
  }

  private sendAsymmetrically(url: string, payload: string): Promise<Observable<{}>> {
    let headers = ServerComms.default_headers

    return ServerComms.rsa.getPubKey().then((pub_key) => {
      console.log("contacting server asymmetrically")
      headers["public_key"] = btoa(pub_key)
      let config: RequestOptionsArgs = {headers: new Headers(headers)}
      let ebody = ServerComms.rsa.parseForServer(payload)
      return this.http.post(url, ebody, config).map(response => {
        ServerComms.setSymmetricKey(ServerComms.extractSymmetricKey(response))
        return ServerComms.parseSymmetricallyEncrypted(response)
      }).catch((error: Response | any) => {
        let parsed_error = {}
        if (error instanceof Response) {
          ServerComms.setSymmetricKey(ServerComms.extractSymmetricKey(error))
          console.log("sym key", ServerComms.symmetric_key)
          let body = ServerComms.parseSymmetricallyEncrypted(error)
          parsed_error = body
          // parsed_error = {"error_code": body["error_code"] || "", "error_msg": body["error_msg"] || "" }
        } else {
          parsed_error = {
            "error_code": "unknown_error" || "",
            "error_msg": "something went wrong and we don't know what happened"
          }
          console.log("unknown error during comms that is not a response", error)
        }
        return Observable.throw(parsed_error)
      })
    })
  }

  private sendSymmetrically(url: string, payload: string, first_attempt = true): Observable<{}> {
    let epayload = ServerComms.encryptSymmetrically(payload)

    let headers = ServerComms.default_headers
    headers["user_id"] = ServerComms.user_id
    headers["iv"] = epayload.iv
    let config = {headers: new Headers(headers)}
    return this.http.post(url, epayload.body, config).map(response => {
      console.log("sym response", response)
    }).catch((error: Response | any) => {
      let parsed_error = {}
      if (error instanceof Response) {
        ServerComms.setSymmetricKey(ServerComms.extractSymmetricKey(error))
        console.log("sym key", ServerComms.symmetric_key)
        let body = ServerComms.parseSymmetricallyEncrypted(error)
        parsed_error = body
        // parsed_error = {"error_code": body["error_code"] || "", "error_msg": body["error_msg"] || "" }
      } else {
        parsed_error = {
          "error_code": "unknown_error" || "",
          "error_msg": "something went wrong and we don't know what happened"
        }
        console.log("unknown error during comms that is not a response", error)
      }
      return Observable.throw(parsed_error)
    })
  }

  private static extractSymmetricKey(response: Response): Uint8Array {
    // encrypted symmetric key in hex
    let eskh = response.headers.get("sym_key")
    // decrypted symmetric key in hex
    let dskh = ServerComms.rsa.parseFromServer(eskh)
    return aesjs.utils.hex.toBytes(dskh)
  }

  /** @return symmetrically encrypted body and iv, both in hex*/
  private static encryptSymmetrically(what: string): SymmetricallyEncrypted {
    let iv = ServerComms.generateIv()
    let bytes = aesjs.utils.utf8.toBytes(what);
    let aes = new aesjs.ModeOfOperation.cbc(ServerComms.symmetric_key, iv);
    let ebytes = aes.encrypt(bytes)
    let ehex = aesjs.utils.hex.fromBytes(ebytes);
    let ivhex = aesjs.utils.hex.fromBytes(iv)
    console.log("encrypting symmetrically", ehex, ivhex)
    return {body: ehex, iv: ivhex} as SymmetricallyEncrypted
  }

  private static generateIv(): Array<number> {
    let iv = []
    for (let i=0;i<16;i++) {
      iv[i] = Math.ceil(Math.random() * 255)
    }
    return iv
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
    dbytes = dbytes.filter(v => {
      return v > 31
    })
    let dstr = aesjs.utils.utf8.fromBytes(dbytes)
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
    // return payload.length < (RSA.key_bits / 8)
    return a.length < RSA.key_bits
  }
}

interface SymmetricallyEncrypted {
  body: string
  iv: string
}

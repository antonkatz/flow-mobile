import {Injectable} from "@angular/core";
import {Http, Headers, RequestOptionsArgs, Response} from "@angular/http";
import {Storage} from "@ionic/storage";
import "rxjs/add/operator/map";
import {RSA} from "../app/utils/rsa";
import {Observable} from "rxjs";
import aesjs from "aes-js";

/**
 Singleton

 All communications should go through this class
 */
@Injectable()
export class ServerComms {

  // private static server_ip = "192.168.2.14"
  private static server_ip = "localhost"
  private static server_port = "8080"
  private static server_address = "http://" + ServerComms.server_ip + ":" + ServerComms.server_port

  /** current symmetric key. shared between all instances. could be invalid. */
  private static symmetric_key: Uint8Array = null
  private static self_instance: ServerComms = null
  private static rsa = null
  private static user_id = null

  constructor(public http: Http, public storage: Storage) {
    if (ServerComms.self_instance) {
      console.log("returning existing instance of ServerComms")
      return ServerComms.self_instance
    }

    ServerComms.rsa = new RSA(storage);
    ServerComms.self_instance = this
  }

  private static defaultHeaders(): {} {
    return {"Content-Type": "application/json"}
  }

  /** endpoint should have leading slash */
  sendToServer(endpoint: string, payload: any, success_callback: (data: {}) => void,
               error_callback?: (er: any) => void, force_public?: boolean) {
    let url = ServerComms.server_address + endpoint
    let json_payload = JSON.stringify(payload)

    console.log("contacting server at", url, "with payload", json_payload)

    if (!ServerComms.symmetric_key || force_public) {
      if (ServerComms.payloadFits(json_payload)) {
        this.sendAsymmetrically(url, json_payload).then((data) => {
          data.subscribe(success_callback, error_callback)
        }, error_callback)
      } else {
        console.log("payload does not fit")
        if (error_callback) error_callback({error_type: "not_able_to_send"})
      }
    } else if (ServerComms.user_id) {
      this.sendSymmetrically(url, json_payload).subscribe(success_callback, error_callback)
    } else {
      console.log("no sym key or user id AND payload does not fit")
      if (error_callback) error_callback({error_type: "not_able_to_send"})
    }
  }

  static setUserId(id:string) {
    ServerComms.user_id = id
  }

  private sendAsymmetrically(url: string, payload: string): Promise<Observable<{}>> {
    let headers = ServerComms.defaultHeaders()

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
          // no internet connection
          if (error.status == 0) {
            parsed_error = {"error_code": "no_connection", "error_msg": "perhaps you are not connected to the" +
            " internet" }
          } else if (error.status == 401) {
            parsed_error = {"error_code": "missing_user", "error_msg": "perhaps you are not registered"}
          } else {
            ServerComms.setSymmetricKey(ServerComms.extractSymmetricKey(error))
            console.log("sym key", ServerComms.symmetric_key)
            let body = ServerComms.parseSymmetricallyEncrypted(error)
            parsed_error = body
          }
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
    // console.log("sending symmetrically with key", ServerComms.symmetric_key)
    let epayload = ServerComms.encryptSymmetrically(payload)
    let headers = ServerComms.defaultHeaders()
    headers["user_id"] = ServerComms.user_id
    headers["iv"] = epayload.iv
    let config = {headers: new Headers(headers)}

    return this.http.post(url, epayload.body, config).map(response => {
      let key = ServerComms.extractSymmetricKey(response)
      ServerComms.setSymmetricKey(key)
      let body = ServerComms.parseSymmetricallyEncrypted(response)
      // console.log("Symmetric communications response", body)
      return body
    }).catch((error: Response | any) => {
      console.log("Error during symmetric communications", error)

      let parsed_error: {} = {
          "error_code": "unknown_error" || "",
          "error_msg": "something went wrong and we don't know what happened"
        }
      if (error instanceof Response) {
        ServerComms.setSymmetricKey(ServerComms.extractSymmetricKey(error))

        // re-run if the error is a missing symmetric key on the server side
        if (error.status == 421) {
          console.log("The server is missing symmetric key, re-running")
          if (first_attempt) return this.sendSymmetrically(url, payload, false)
        } else if (error.status == 0) {
          parsed_error = {"error_code": "no_connection", "error_msg": "perhaps you are not connected to the" +
          " internet" }
        } else {
          if (ServerComms.symmetric_key) {
            let body = ServerComms.parseSymmetricallyEncrypted(error)
            parsed_error = body
          }
        }
      } else {
        console.log("unknown error during symmetric communication that is not a response", error)
      }
      return Observable.throw(parsed_error)
    })
  }

  private static extractSymmetricKey(response: Response): Uint8Array {
    // encrypted symmetric key in hex
    let eskh = response.headers.get("sym_key")
    if (eskh) {
      // decrypted symmetric key in hex
      let dskh = ServerComms.rsa.parseFromServer(eskh)
      return aesjs.utils.hex.toBytes(dskh)
    } else {
      return null
    }
  }

  /** @return symmetrically encrypted body and iv, both in hex*/
  private static encryptSymmetrically(what: string): SymmetricallyEncrypted {
    let iv = ServerComms.generateIv()
    let bytes = aesjs.utils.utf8.toBytes(what);
    let padded = aesjs.padding.pkcs7.pad(bytes)
    let aes = new aesjs.ModeOfOperation.cbc(ServerComms.symmetric_key, iv);
    let ebytes = aes.encrypt(padded)
    let ehex = aesjs.utils.hex.fromBytes(ebytes);
    let ivhex = aesjs.utils.hex.fromBytes(iv)
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
    if (key) {
      console.log("setting symmetric key", key)
      ServerComms.symmetric_key = key
    }
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

  static errorToast(toastCtrl, given_msg?: string) {
    let msg =  given_msg || "oops... something went wrong and we don't know what"
    let toast = toastCtrl.create({
      message: msg,
      position: 'top',
      cssClass: 'error-toast',
      showCloseButton: true
    });
    toast.present()
  }
}

interface SymmetricallyEncrypted {
  body: string
  iv: string
}

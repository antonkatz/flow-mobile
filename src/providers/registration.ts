import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import {Storage} from "@ionic/storage";
import "rxjs/add/operator/map";
import {ServerComms} from "./server-comms";
import {ToastController} from "ionic-angular";

/*
 Generated class for the Registration provider.

 See https://angular.io/docs/ts/latest/guide/dependency-injection.html
 for more info on providers and Angular 2 DI.
 */
@Injectable()
export class Registration {
  static storage_user_id:string = "user_id"
  static user_id = ""

  constructor(public http: Http, public storage: Storage, public comms: ServerComms, public toastCtrl: ToastController)
  {
    this.getUserId().then(id => this.setUserId(id))
  }

  handshake(callback: (boolean)=>void) {
    console.log("Checking if registered")
    this.comms.sendToServer("/handshake", null, data => {
      if (data["response"] && data["response"]["id"] && data["response"]["id"].length > 0) {
        this.setUserId(data["response"]["id"])
        callback(true)
      } else {
        callback(false)
      }
    }, error => {
      console.log("error during a registration check", error);
      if (!(error['error_code'] && error["error_code"] == "missing_user")) {
        ServerComms.errorToast(this.toastCtrl, error["error_msg"])
      }
      callback(false)
    }, /* force public*/ true, /* timeout for android */ 5000)
  }

  tryKey(key: string, callback: (boolean)=>void, invalid_key_callback) {
    this.comms.testSetAsymmetricKey(key, (key_valid) => {
      if (key_valid) {
        this.handshake((success) => {
          if (success) {
            this.comms.testSetAsymmetricKeySuccess()
          } else {
            this.comms.testSetAsymmetricKeyFailure()
          }
          callback(success)
        })
      } else {
        invalid_key_callback()
      }
    })
  }

  register(desired_name: string, invitation_code: string, callback?: () => void) {
    console.log("Trying to register with ", desired_name, invitation_code)

    let reg_req = {"display_name": desired_name, "invitation_code": invitation_code}
    this.comms.sendToServer("/register", reg_req, data => {
      let id = data["response"]["id"]
      if (typeof id === "string" && id.length > 0) {
        this.setUserId(id)
        callback()
      } else {
        ServerComms.errorToast(this.toastCtrl)
      }
    }, error => {
      console.log("error during a registration attempt", error);
      ServerComms.errorToast(this.toastCtrl,error["error_msg"])
    }, /* force public*/ true)
  }

  /** not only stores it, but also sets it in server communications module */
  setUserId(id: string) {
    this.storage.set(Registration.storage_user_id, id)
    console.log("user id [registration]" + id)
    ServerComms.setUserId(id)
    Registration.user_id = id
  }

  getUserId(): Promise<string> {
    return this.storage.get(Registration.storage_user_id)
  }
}

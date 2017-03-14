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

  constructor(public http: Http, public storage: Storage, public comms: ServerComms, public toastCtrl: ToastController) {
  }

  isRegistered(callback: (boolean)=>void) {
    console.log("Checking if registered")
    this.comms.sendToServer("/is_registered", null, data => {
      if (data["response"] && data["response"]["id"] && data["response"]["id"].length > 0) {
        this.setUserId(data["response"]["id"])
        callback(true)
      } else {
        callback(false)
      }
    }, error => {
      console.log("error during a registration check", error);
      this.error(error["error_msg"])
    }, /* force public*/ true)
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
        this.error()
      }
    }, error => {
      console.log("error during a registration attempt", error);
      this.error(error["error_msg"])
    }, /* force public*/ true)
  }

  /** not only stores it, but also sets it in server communications module */
  setUserId(id: string) {
    this.storage.set(Registration.storage_user_id, id)
    ServerComms.setUserId(id)
  }

  getUserId(): Promise<string> {
    return this.storage.get(Registration.storage_user_id)
  }

  private error(given_msg?: string) {
    let msg =  given_msg || "oops... something went wrong and we don't know what"
    let toast = this.toastCtrl.create({
      message: msg,
      position: 'top',
      cssClass: 'error-toast',
      showCloseButton: true
    });
    toast.present()
  }
}

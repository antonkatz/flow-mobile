import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import {Storage} from "@ionic/storage";
import "rxjs/add/operator/map";
import {ServerComms} from "./server-comms";

/*
 Generated class for the Registration provider.

 See https://angular.io/docs/ts/latest/guide/dependency-injection.html
 for more info on providers and Angular 2 DI.
 */
@Injectable()
export class Registration {
  constructor(public http: Http, public storage: Storage, public comms: ServerComms) {
    console.log('Hello Registration Provider');

    let reg_req = {"desired_name": "test_name", "invitation_code": "test_code"}
    comms.sendToServer("/register", reg_req, data => {
      console.log("got back from server", data)
    }, error => {
      console.log("error during server response [registration]", error);
    }, /* force public*/ true)
  }

  isRegistered(): boolean {
    return false
  }
}

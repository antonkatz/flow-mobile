import {Component} from "@angular/core";
import {NavController, ToastController} from "ionic-angular";
import {Registration} from "../../providers/registration";
import {HomePage} from "../home/home";
import {ServerComms} from "../../providers/server-comms";
import {KeyDownloadPage} from "../key-download/key-download";

/*
 Generated class for the Register page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */

@Component({
  selector: 'page-register',
  templateUrl: 'register.html'
})
export class RegisterPage {
  has_key = false
  existing_key = ""

  constructor(public navCtrl: NavController, public toastCtrl: ToastController, public registrar: Registration) {
  }

  register(desired_name: string, invitation_code: string) {
    this.registrar.register(desired_name, invitation_code, () => {
      this.navCtrl.setRoot(HomePage)
      // setting key download
      this.navCtrl.push(KeyDownloadPage)
    })
  }

  hasKey(is_true) {
    this.has_key = is_true
  }

  registerWithKey() {
    this.registrar.tryKey(this.existing_key, (success) => {
      if (success) {
        this.navCtrl.setRoot(HomePage)
      } else {
        ServerComms.errorToast(this.toastCtrl, "this key is not registered")
      }
    }, /*invalid key*/ () => {
      ServerComms.errorToast(this.toastCtrl, "this key is not formatted properly")
    })
  }
}

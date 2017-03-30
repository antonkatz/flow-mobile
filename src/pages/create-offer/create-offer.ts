import { Component } from '@angular/core';
import {NavController, NavParams, ToastController} from 'ionic-angular';
import md5 from "md5"
import {ServerComms} from "../../providers/server-comms";
import {HomePage} from "../home/home";

/*
  Generated class for the CreateOffer page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-create-offer',
  templateUrl: 'create-offer.html'
})
export class CreateOfferPage {
  user_id = "";
  display_name = "";
  hours = 0.5;
  description = "";

  constructor(public navCtrl: NavController, public navParams: NavParams, public toastCtrl: ToastController,
              public comms: ServerComms) {
  }

  ionViewWillEnter() {
    console.log("nav params", this.navParams.data)
    this.user_id = this.navParams.get('user_id') || ""
    this.display_name = this.navParams.get('display_name') || ""
  }

  offerHelp() {
    console.log("offering help")
    console.log(this.user_id, this.hours, this.description)

    let request = {'to_user_id': this.user_id, 'hours': this.hours, 'description': this.description}
    this.comms.sendToServer("/offers/create", request, data => {
      let r = data["response"]
      console.log("on offer creation response was", r)
      if (r["offer_id"]) {
        this.navCtrl.push(HomePage)
        let toast = this.toastCtrl.create({
          message: "invoice sent to " + this.display_name,
          position: 'bottom',
          cssClass: 'success-toast',
          duration: 3000
        });
        toast.present()
      } else {
        ServerComms.errorToast(this.toastCtrl)
      }
    }, error => {
      console.log("error during a connections lookup", error);
      ServerComms.errorToast(this.toastCtrl, error["error_msg"])
    })
  }

  increaseHours() {
    this.hours += 0.5
  }
  decreaseHours() {
    if (this.hours > 0.5) {
      this.hours -= 0.5
    }
  }

  md5(what: any) {
    if (what) {
      return md5(what)
    }
  }
}

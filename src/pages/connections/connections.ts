import { Component } from '@angular/core';
import md5 from "md5"
import {ServerComms} from "../../providers/server-comms";
import {ToastController} from "ionic-angular";
import {CreateOfferPage} from "../create-offer/create-offer";

/*
  Generated class for the WebSplash page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-connections',
  templateUrl: 'connections.html'
})
export class ConnectionsPage {
  offer_page = CreateOfferPage
  fof = []
  friends = []

  constructor(public comms: ServerComms, public toastCtrl: ToastController) {
  }

  ionViewWillEnter() {
    console.log("Looking up connected users")
    this.comms.sendToServer("/connections/get", null, data => {
      let r = data["response"]
      this.fof = r["fof"]
      this.friends = r["friends"]
      console.log("connected to friends", this.friends, "and friends of friends", this.fof)
    }, error => {
      console.log("error during a connections lookup", error);
      ServerComms.errorToast(this.toastCtrl, error["error_msg"])
    })
  }

  md5(what: any) {
    if (what) {
      return md5(what)
    }
  }
}

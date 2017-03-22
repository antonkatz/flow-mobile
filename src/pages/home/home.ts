import { Component} from '@angular/core';
import md5 from "md5"
import {NavController, ToastController} from 'ionic-angular';
import {ConnectionsPage} from "../connections/connections";
import {CreateOfferPage} from "../create-offer/create-offer";
import {ServerComms} from "../../providers/server-comms";


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  // root_page = HomePage;
  offers = [];
  display_names = []

  connectionsPage;

  constructor(public navCtrl: NavController, public comms: ServerComms, public toastCtrl: ToastController) {
    this.connectionsPage = ConnectionsPage

    this.comms.sendToServer("/offers/get", null, data => {
      let r = data["response"]
      console.log("offers retrieved", r)
      this.offers = r["offers"]

      // now resolving display names
      let ids = this.offers.map(o => o["from_user_id"])
      this.comms.sendToServer("/connections/resolve-to-name", ids, data => {
        this.display_names = data["response"]
        console.log("display names resolved", this.display_names)

        this.offers.map((o, i) => o["display_name"] = this.display_names[i])

      }, error => {
        console.log("error during retrieving offers", error);
        ServerComms.errorToast(this.toastCtrl, error["error_msg"])
      })

    }, error => {
      console.log("error during retrieving offers", error);
      ServerComms.errorToast(this.toastCtrl, error["error_msg"])
    })

    // this.navCtrl.push(CreateOfferPage)
  }

  md5(what: any) {
    return md5(what)
  }

  displayAmount(amount: number) {
    var suffix = "hour"
    if (amount > 1) {
      suffix = "hours"
    }
    return amount + " " + suffix
  }
}

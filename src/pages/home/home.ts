import { Component} from '@angular/core';
import md5 from "md5"
import {NavController, ToastController, ModalController, AlertController} from 'ionic-angular';
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
  display_names = {}

  connectionsPage;

  constructor(public navCtrl: NavController, public comms: ServerComms, public toastCtrl: ToastController,
              private alertCtrl: AlertController) {
    this.connectionsPage = ConnectionsPage

    this.comms.sendToServer("/offers/get", null, data => {
      let r = data["response"]
      console.log("offers retrieved", r)
      this.offers = r["offers"]

      // now resolving display names
      let ids = this.offers.map(o => o["from_user_id"])
      this.comms.sendToServer("/connections/resolve-to-name", ids, data => {
        data["response"].map(n => this.display_names[n[0]] = n[1])
        console.log("display names resolved", this.display_names)

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

  completeOffer(id) {
    let payload = {'offer_id': id}
    let hours = this.offers.filter((o) => o["offer_id"] == id)[0]["hours"]
    let prompt_text = "you want to accept " + this.displayAmount(hours)
    let cthis = this
    let callback = function() {
      cthis.comms.sendToServer("/offers/complete", payload, data => {
        let r = data["response"]
        if (r["transaction_id"]) {
          cthis.offers = cthis.offers.filter(o => o["offer_id"] != r['offer_id'])

          let msg = "successfully transferred " + cthis.displayAmount(r['amount']) + " from '" + r["from_user_id"] + "'"
          let toast = cthis.toastCtrl.create({
            message: msg,
            position: 'bottom',
            cssClass: 'success-toast',
            duration: 3000
          });
          toast.present()
        } else {
          ServerComms.errorToast(cthis.toastCtrl, "we failed to complete this transaction")
        }
      }, error => {
        console.log("error while accepting an offer with id", id, error);
        ServerComms.errorToast(cthis.toastCtrl, error["error_msg"])
      })
    }

    this.actOnOffer(prompt_text, callback)
  }

  rejectOffer(id) {
    let payload = {'offer_id': id}
    let user_id = this.offers.find(o => o['offer_id'] == id)["from_user_id"]
    let display_name = this.display_names[user_id]
    let prompt_text = "you are rejecting offer from '" + display_name + "'"
    let cthis = this
    let callback = function() {
      cthis.comms.sendToServer("/offers/reject", payload, data => {
        let r = data["response"]
        if (r) {
          cthis.offers = cthis.offers.filter(o => o["offer_id"] != id)

          let msg = "offer from '" + display_name + "' is rejected"
          let toast = cthis.toastCtrl.create({
            message: msg,
            position: 'bottom',
            cssClass: 'success-toast',
            duration: 3000
          });
          toast.present()
        } else {
          ServerComms.errorToast(cthis.toastCtrl, "we failed to reject this offer")
        }
      }, error => {
        console.log("error while rejecting an offer with id", id, error);
        ServerComms.errorToast(cthis.toastCtrl, error["error_msg"])
      })
    }

    this.actOnOffer(prompt_text, callback)
  }

  actOnOffer(text, callback) {
    let alert = this.alertCtrl.create({
      title: 'Confirm',
      message: text,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('offer action was NOT completed');
          }
        },
        {
          text: 'Confirm',
          handler: () => {
            console.log('offer action was completed');
            callback()
          }
        }
      ]
    });
    alert.present();
  }

  offerHelp() {
    this.navCtrl.push(this.connectionsPage)
  }

  md5(what: any) {
    return md5(what)
  }

  displayAmount(amount: number) {
    var suffix = "hours"
    if (amount == 1) {
      suffix = "hour"
    }
    return amount + " " + suffix
  }
}

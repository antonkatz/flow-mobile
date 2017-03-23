import { Component} from '@angular/core';
import md5 from "md5"
import {NavController, ToastController, ModalController, AlertController} from 'ionic-angular';
import {ConnectionsPage} from "../connections/connections";
import {CreateOfferPage} from "../create-offer/create-offer";
import {ServerComms} from "../../providers/server-comms";
import {Wallet} from "../../providers/wallet";


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  // root_page = HomePage;
  offers = [];
  display_names = {}
  balance = 0
  balance_display = ""
  uncommited_interest = 0
  uncommited_interest_digits = 15

  connectionsPage;

  constructor(public navCtrl: NavController, public comms: ServerComms, public toastCtrl: ToastController,
              private alertCtrl: AlertController, public walletProv: Wallet) {
    this.connectionsPage = ConnectionsPage
    this.balance_display = Wallet.displayAmount(this.balance)

    this.walletProv.setRefresher(this.balanceRefresherGen())

    this.comms.sendToServer("/offers/get", null, data => {
      let r = data["response"]
      console.log("offers retrieved", r)
      this.offers = r["offers"]
      // dispaly operations
      this.offers = this.offers.map(o =>{
        let newo = o
        newo["display_hours"] = Wallet.displayAmount(o["hours"])
        return newo
        })

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

    this.walletProv.startInterestRateRefresher()
  }

  balanceRefresherGen() {
    let cthis = this
    return (wP) => {
      cthis.balance = wP.getBalance()
      cthis.balance_display = Wallet.displayAmount(cthis.balance)
      cthis.uncommited_interest = wP.getUncommitedInterest().toFixed(cthis.uncommited_interest_digits)
    }
  }

  completeOffer(id) {
    let hours = this.offers.filter((o) => o["offer_id"] == id)[0]["hours"]
    let prompt_text = "you want to accept " + Wallet.displayAmount(hours)

    let cthis = this
    let toast_msg_func = (resp) => {
      return "successfully transferred " + Wallet.displayAmount(resp['amount']) + " from '" + resp["from_user_id"] + "'"
    }
    let callback = (resp) => {
      cthis.offerRemoveFromResponse(resp)
    }
    let act = () => {
      cthis.walletProv.commitTransaction(id, "complete", callback, toast_msg_func)
    }

    this.actOnOffer(prompt_text, act)
  }

  offerRemoveFromResponse(resp) {
    this.offers = this.offers.filter(o => o["offer_id"] != resp['offer_id'])
  }

  rejectOffer(id) {
    let user_id = this.offers.find(o => o['offer_id'] == id)["from_user_id"]
    let display_name = this.display_names[user_id]
    let prompt_text = "you are rejecting offer from '" + display_name + "'"
    let cthis = this

    let toast_msg_func = (resp) => {
      return "offer from '" + display_name + "' is rejected"
    }
    let callback = (resp) => {
      cthis.offerRemoveFromResponse(resp)
    }
    let act = () => {
      cthis.walletProv.commitTransaction(id, "reject", callback, toast_msg_func)
    }

    this.actOnOffer(prompt_text, act)
  }

  actOnOffer(text, callback) {
    let alert = this.alertCtrl.create({
      title: 'Confirm',
      message: text,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Confirm',
          handler: () => {
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
}

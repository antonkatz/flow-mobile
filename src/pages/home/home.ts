import { Component} from '@angular/core';
import md5 from "md5"
import {NavController, ToastController, AlertController} from 'ionic-angular';
import {ConnectionsPage} from "../connections/connections";
import {ServerComms} from "../../providers/server-comms";
import {Wallet} from "../../providers/wallet";
import {WalletPage} from "../wallet/wallet";
import {Registration} from "../../providers/registration";


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  incoming_offers = [];
  outgoing_offers = [];
  all_offers = [];
  display_names = {}
  principal = 0
  principal_display = ""
  interest_digits = 15
  interest_balance: String = ""

  connectionsPage;
  wallet_page;

  constructor(public navCtrl: NavController, public comms: ServerComms, public toastCtrl: ToastController,
              private alertCtrl: AlertController, public walletProv: Wallet) {
    this.connectionsPage = ConnectionsPage
    this.principal_display = Wallet.displayAmount(this.principal)
    this.interest_balance = Number(0).toFixed(this.interest_digits)
    this.wallet_page = WalletPage
  }

  ionViewWillEnter() {
    console.log("home page entered", this.navCtrl.getViews())
    this.walletProv.setRefresher(this.balanceRefresherGen())
    this.walletProv.retrieveWallet()

    this.comms.sendToServer("/offers/get", null, data => {
      let r = data["response"]
      console.log("offers retrieved", r)
      this.all_offers = r["offers"]
      // dispaly operations
      this.all_offers = this.all_offers.map(o =>{
        let newo = o
        newo["display_hours"] = Wallet.displayAmount(o["hours"])
        return newo
      })
      this.outgoing_offers = this.all_offers.filter(o => o["from_user_id"] == Registration.user_id)
      this.incoming_offers = this.all_offers.filter(o => o["to_user_id"] == Registration.user_id)

      // now resolving display names
      let ids = this.all_offers.map(o => o["from_user_id"])
      ids = ids.concat(this.all_offers.map(o => o["to_user_id"]))
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

    this.walletProv.startInterestRefresher()
  }

  balanceRefresherGen() {
    let cthis = this
    return (wP) => {
      console.log("home page wallet callback")
      cthis.principal = wP.getPrincipal()
      cthis.principal_display = Wallet.displayAmount(cthis.principal)
      cthis.interest_balance = wP.getInterest().toFixed(cthis.interest_digits)
    }
  }

  completeOffer(id) {
    let offer = this.incoming_offers.filter((o) => o["offer_id"] == id)[0]
    let hours = offer["hours"]
    let from_user = this.display_names[offer["from_user_id"]]
    let prompt_text = "you are confirming these " + Wallet.displayAmount(hours)

    let cthis = this
    let toast_msg_func = (resp) => {
      return "successfully transferred " + Wallet.displayAmount(hours) + " from '" + from_user + "'"
    }
    let callback = (resp) => {
      cthis.incoming_offers = cthis.incoming_offers.filter(o => o["offer_id"] != offer['offer_id'])
    }
    let act = () => {
      cthis.walletProv.commitTransaction(id, "complete", callback, toast_msg_func)
    }

    this.actOnOffer(prompt_text, act)
  }

  offerRemoveFromResponse(resp) {
    this.all_offers = this.all_offers.filter(o => o["offer_id"] != resp['offer_id'])
    this.incoming_offers = this.incoming_offers.filter(o => o["offer_id"] != resp['offer_id'])
    this.outgoing_offers = this.outgoing_offers.filter(o => o["offer_id"] != resp['offer_id'])
  }

  rejectOffer(id) {
    let user_id = this.incoming_offers.find(o => o['offer_id'] == id)["from_user_id"]
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

  cancelOffer(id) {
    let user_id = this.outgoing_offers.find(o => o['offer_id'] == id)["to_user_id"]
    let display_name = this.display_names[user_id]
    let prompt_text = "you are canceling offer to '" + display_name + "'"
    let cthis = this

    let toast_msg_func = (resp) => {
      return "offer to '" + display_name + "' is cancelled"
    }
    let callback = (resp) => {
      cthis.offerRemoveFromResponse(resp)
    }
    let act = () => {
      cthis.walletProv.commitTransaction(id, "cancel", callback, toast_msg_func)
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

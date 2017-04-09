import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import {ServerComms} from "./server-comms";
import {ToastController} from "ionic-angular";

/*
  Generated class for the Wallet provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class Wallet {
  private interest_timeout = 10 // in seconds
  private wallet = {}
  private callback = null
  private interest_rate = 0

  private interval_id = null

  private display_names = {}
  private timezone_offset = (new Date()).getTimezoneOffset() * 60 * 1000

  private offers = []

  constructor(public comms: ServerComms, public toastCtrl: ToastController) {}

  // private debug_timer = (new Date()).getTime()

  startInterestRefresher()  {
    this.comms.sendToServer("/algorithm/interest", {time_unit: this.interest_timeout}, data => {
      this.interest_rate = data["response"]
      console.log("interest rate is", this.interest_rate)

      if (this.callback) {
        if (this.interval_id) {
          clearInterval(this.interval_id)
        }
        this.interval_id = setInterval(() => {
          this.intervalInterestCalculator()
          // let t = (new Date()).getTime()
          // console.log("updated interest in", (t - this.debug_timer) / 1000)
          // this.debug_timer = t
          this.callback(this)
        }, this.interest_timeout * 1000)
      }

    }, error => {
      console.log("error while getting the interest rate", error);
      ServerComms.errorToast(this.toastCtrl, error["error_msg"])
    })
  }

  intervalInterestCalculator() {
    this.wallet["uncommitted_interest"] -= this.getBalance() * (1 - this.interest_rate)
  }

  setRefresher(callback) {
    this.callback = callback
  }

  setWallet(w) {
    if (w) {
      this.wallet = w
      this.wallet["transactions"] = this.offers
      this.retrieveDisplayNames()
      this.processDates()
      if (this.callback) {
        this.callback(this)
      }
    }
  }

  processDates() {
    this.wallet["transactions"] = this.wallet["transactions"].map(t => {
      let newt = t
      newt["display_date"] = new Date(t["timestamp"] - this.timezone_offset).toISOString()
      return newt
    })

    console.log("dates ", this.wallet["transactions"])
  }

  retrieveDisplayNames() {
    // now resolving display names
    let ids = []
    this.wallet['transactions'].forEach(o => {
      ids.push(o["from_user_id"], o["to_user_id"])
    })
    this.comms.sendToServer("/connections/resolve-to-name", ids, data => {
      data["response"].map(n => this.display_names[n[0]] = n[1])
      console.log("display names resolved", this.display_names)
      this.wallet["transactions"] = this.wallet["transactions"].map(t => {
        let newt = t
        newt["from_display_name"] = this.display_names[t["from_user_id"]]
        newt["to_display_name"] = this.display_names[t["to_user_id"]]
        return newt
      })

    }, error => {
      console.log("error during retrieving offers", error);
      ServerComms.errorToast(this.toastCtrl, error["error_msg"])
    })
  }

  commitTransaction(id, action, callback, toast_msg_func) {
    let payload = {'offer_id': id}
    this.comms.sendToServer("/offers/" + action, payload, data => {
      let r = data["response"]
      console.log("transaction response", r)
      if (r["transaction_id"] || r["offer_id"] || r.length > 0) {

        let msg = toast_msg_func(r)
        callback(r)

        let toast = this.toastCtrl.create({
          message: msg,
          position: 'bottom',
          cssClass: 'success-toast',
          duration: 3000
        });
        toast.present()

        this.retrieveWallet()
      } else {
        ServerComms.errorToast(this.toastCtrl, "we failed to complete this transaction")
      }
    }, error => {
      console.log("error while accepting an offer with id", id, error);
      ServerComms.errorToast(this.toastCtrl, error["error_msg"])
    })
  }

  retrieveWallet(callback?) {
    this.comms.sendToServer("/wallet/get", null, data => {
      let wallet = data["response"]
      console.log("wallet contents", wallet)
      if (wallet) {

        // todo. hack getting offers over transacitons
        this.comms.sendToServer("/offers/get-completed", null, data => {
          let r = data["response"]
          console.log("completed offers retrieved as transactions", r)
          this.offers = r["offers"]

          this.setWallet(wallet)
          if (callback) {
            callback()
          }

        }, error => {
          console.log("error during retrieving offers", error);
          ServerComms.errorToast(this.toastCtrl, error["error_msg"])
        })

      } else {
        ServerComms.errorToast(this.toastCtrl, "we could not load your walletProv")
      }
    }, error => {
      console.log("could not get walletProv", error);
      ServerComms.errorToast(this.toastCtrl, error["error_msg"])
    })
  }

  /* getters */

  getBalance() {
    return this.wallet["balance"]
  }

  getInterest() {
    return this.wallet["interest"] + this.wallet["uncommitted_interest"]
  }

  getTransactions() {
    return this.wallet["transactions"]
    // return this.offers
  }

  static displayAmount(amount: number, fixto?: number) {
    var suffix = "hours"
    if (amount == 1) {
      suffix = "hour"
    }
    let a = amount.toString()
    if (fixto) {
      a = amount.toFixed(fixto)
    }
    return a + " " + suffix
  }
}

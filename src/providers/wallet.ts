import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
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

  private identifier = Math.round(Math.random() * 100)

  constructor(public comms: ServerComms, public toastCtrl: ToastController) {
    console.log('Hello Wallet Provider ' + this.identifier);

    // setInterval()
    this.retrieveWallet()


  }

  startInterestRateRefresher()  {
    this.comms.sendToServer("/algorithm/interest", {time_unit: this.interest_timeout}, data => {
      this.interest_rate = data["response"]
      console.log("interest rate is", this.interest_rate)

      if (this.callback) {
        setInterval(() => {
          this.intervalInterestCalculator()
          this.callback(this)
        }, this.interest_timeout * 1000)
      }

    }, error => {
      console.log("error while getting the interest rate", error);
      ServerComms.errorToast(this.toastCtrl, error["error_msg"])
    })
  }

  intervalInterestCalculator() {
    this.wallet["uncommited_interest"] = this.wallet["uncommited_interest"] * this.interest_rate
  }

  getBalance() {
    return this.wallet["committed_balance"]
  }

  getUncommitedInterest() {
    return this.wallet["uncommited_interest"]
  }

  setRefresher(callback) {
    this.callback = callback
  }

  setWallet(w) {
    if (w) {
      this.wallet = w

      /* todo REMOVE */
      this.wallet["uncommited_interest"] = 1


      if (this.callback) {
        this.callback(this)
      }
    }
  }

  commitTransaction(id, action, callback, toast_msg_func) {
    let payload = {'offer_id': id}
    this.comms.sendToServer("/offers/" + action, payload, data => {
      let r = data["response"]
      if (r["transaction_id"] || r["offer_id"]) {

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

  retrieveWallet() {
    this.comms.sendToServer("/wallet/get", null, data => {
      let wallet = data["response"]
      console.log("wallet contents", wallet)
      if (wallet) {
        this.setWallet(wallet)
      } else {
        ServerComms.errorToast(this.toastCtrl, "we could not load your walletProv")
      }
    }, error => {
      console.log("could not get walletProv", error);
      ServerComms.errorToast(this.toastCtrl, error["error_msg"])
    })
  }

  static displayAmount(amount: number) {
    var suffix = "hours"
    if (amount == 1) {
      suffix = "hour"
    }
    return amount + " " + suffix
  }
}

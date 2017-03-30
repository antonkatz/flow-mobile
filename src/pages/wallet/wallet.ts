import md5 from "md5"
import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {Wallet} from "../../providers/wallet";
import {Registration} from "../../providers/registration";

/*
  Generated class for the Wallet page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-wallet',
  templateUrl: 'wallet.html'
})
export class WalletPage {
  principal = 0
  total_balance = 0
  total_display = ""
  interest_digits = 7
  total_digits = 5
  interest = 0
  interest_display = ""
  user_id = ""

  transactions = []

  constructor(public navCtrl: NavController, public navParams: NavParams, public walletProv: Wallet,
  public registration: Registration) {
  }

  ionViewWillEnter() {
    this.registration.getUserId().then((id) => {
      this.user_id = id

      this.walletProv.setRefresher(this.balanceRefresherGen())
      this.walletProv.retrieveWallet(() => {
        this.transactions = this.walletProv.getTransactions()
      })
      this.walletProv.startInterestRefresher()
    })
  }

  balanceRefresherGen() {
    let cthis = this
    return (wP) => {
      console.log("wallet page callback")
      cthis.principal = wP.getPrincipal()
      cthis.interest = wP.getInterest()
      cthis.total_balance = this.principal + wP.getInterest()
      cthis.interest_display = cthis.interest.toFixed(cthis.interest_digits)
      cthis.total_display = Wallet.displayAmount(cthis.total_balance, cthis.total_digits)
    }
  }

  md5(what: any) {
    return md5(what)
  }
}

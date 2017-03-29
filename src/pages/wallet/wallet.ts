import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {Wallet} from "../../providers/wallet";

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
  principal_display = ""
  interest_digits = 15
  interest_balance: String = ""


  constructor(public navCtrl: NavController, public navParams: NavParams, public walletProv: Wallet) {
    this.principal_display = Wallet.displayAmount(this.principal)
    this.interest_balance = Number(0).toFixed(this.interest_digits)

    this.walletProv.retrieveWallet()
    this.walletProv.setRefresher(this.balanceRefresherGen())
    this.walletProv.startInterestRefresher()
  }

  balanceRefresherGen() {
    let cthis = this
    return (wP) => {
      cthis.principal = wP.getPrincipal()
      cthis.principal_display = Wallet.displayAmount(cthis.principal)
      cthis.interest_balance = wP.getInterest().toFixed(cthis.interest_digits)
      cthis.total_balance = this.principal + wP.getInterest
    }
  }
}

import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {Splashscreen, StatusBar} from "ionic-native";
import {RegisterPage} from "../register/register";
import {HomePage} from "../home/home";
import {Registration} from "../../providers/registration";
import {ConnectionsPage} from "../connections/connections";
import {WalletPage} from "../wallet/wallet";

/*
  Generated class for the Main page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-main',
  templateUrl: 'main.html'
})
export class MainPage {
  rootPage = null
  connectionsPage
  wallet_page

  constructor(public navCtrl: NavController, public navParams: NavParams, registration: Registration) {
    this.connectionsPage = ConnectionsPage
    this.wallet_page = WalletPage

    registration.handshake((is_registered: boolean) => {
      console.log("is registered", is_registered)
      if (is_registered) {
        this.rootPage = HomePage;
      } else {
        this.rootPage = RegisterPage;
      }

      this.navCtrl.push(WalletPage)
      StatusBar.styleDefault();
      Splashscreen.hide();
    })
  }

  openPage(page) {
    this.navCtrl.push(page)
  }
}

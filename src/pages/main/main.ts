import { Component, ViewChild} from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import {RegisterPage} from "../register/register";
import {HomePage} from "../home/home";
import {Registration} from "../../providers/registration";
import {ConnectionsPage} from "../connections/connections";
import {WalletPage} from "../wallet/wallet";
import { Storage } from '@ionic/storage';

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
  rootPage;
  connections_page
  wallet_page

  constructor(public navCtrl: NavController, public navParams: NavParams, public storage: Storage,
              public statusBar: StatusBar,
              public splashScreen: SplashScreen,
              registration: Registration) {
    this.connections_page = ConnectionsPage
    this.wallet_page = WalletPage

    // this.rootPage = RegisterPage
    console.log('main page')
    this.storage.ready().then(() => {
      console.log('main page storage')
      registration.handshake((is_registered: boolean) => {
        console.log("main page is registered " + is_registered)
        if (is_registered) {
          this.rootPage = HomePage
        } else {
          this.rootPage = RegisterPage;
        }

        this.statusBar.styleDefault();
        this.splashScreen.hide();
      })
    })
  }

  openPage(page) {
    this.navCtrl.getActiveChildNav().push(page)
  }
}

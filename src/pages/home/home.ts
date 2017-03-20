import { Component, ElementRef} from '@angular/core';
import md5 from "md5"
import { NavController } from 'ionic-angular';
import {ConnectionsPage} from "../connections/connections";


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  // root_page = HomePage;
  offers = [];

  connectionsPage;

  constructor(public navCtrl: NavController) {
    this.connectionsPage = ConnectionsPage

    this.offers = [{userId: "ooarsetndhbvktnndvaeroasnd", userName: "vasya", amount: 1},
                    {userId: "rsetndhbvktnndvaeroasnd", userName: "petya", amount: 5},
                    {userId: "taoufkviaerndn", userName: "masha", amount: 5}]

    console.log("offers", this.offers)

    this.navCtrl.push(ConnectionsPage)
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

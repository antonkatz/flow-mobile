import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  offers = [];

  constructor(public navCtrl: NavController) {
    this.offers = [{userId: "ooarsetndhbvktnndvaeroasnd", userName: "vasya", amount: 1},
                    {userId: "rsetndhbvktnndvaeroasnd", userName: "petya", amount: 5},
                    {userId: "taoufkviaerndn", userName: "masha", amount: 5}]
  }

  displayAmount(amount: number) {
    var suffix = "hour"
    if (amount > 1) {
      suffix = "hours"
    }
    return amount + " " + suffix
  }
}

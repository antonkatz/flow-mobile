import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import md5 from "md5"

/*
  Generated class for the CreateOffer page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-create-offer',
  templateUrl: 'create-offer.html'
})
export class CreateOfferPage {
  user_id = "";
  display_name = "";
  hours = 0.5;
  with_what = "";

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    console.log("nav params", navParams.data)
    this.user_id = navParams.get('user_id')
    this.display_name = navParams.get('display_name')
  }

  offerHelp() {
    console.log("offering help")
    console.log(this.hours, this.with_what)
  }

  increaseHours() {
    this.hours += 0.5
  }
  decreaseHours() {
    if (this.hours > 0.5) {
      this.hours -= 0.5
    }
  }

  md5(what: any) {
    if (what) {
      return md5(what)
    }
  }
}

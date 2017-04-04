import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {RegisterPage} from "../register/register";

/*
  Generated class for the Greeting page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-greeting',
  templateUrl: 'greeting.html'
})
export class GreetingPage {
  register_page

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.register_page = RegisterPage
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad GreetingPage');
  }

}

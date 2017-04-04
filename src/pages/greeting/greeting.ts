import { Component , ElementRef} from '@angular/core';
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

  constructor(public navCtrl: NavController, public navParams: NavParams, public element: ElementRef) {
    this.register_page = RegisterPage
  }

  continueToRegistration() {
    let audio = this.element.nativeElement.ownerDocument.getElementById("audio")
    audio.pause()
    this.navCtrl.push(this.register_page)
  }
}

import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {Registration} from "../../providers/registration";
import {HomePage} from "../home/home";

/*
 Generated class for the Register page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */

@Component({
    selector: 'page-register',
    templateUrl: 'register.html'
})
export class RegisterPage {

    constructor(public navCtrl: NavController, public navParams: NavParams, public registrar: Registration) {
    }

    register(desired_name: string, invitation_code: string) {
        this.registrar.register(desired_name, invitation_code, () => {
          this.navCtrl.push(HomePage)
        })
    }
}

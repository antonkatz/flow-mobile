import {Component} from '@angular/core';
import {Platform} from 'ionic-angular';
import {StatusBar, Splashscreen} from 'ionic-native';
import { Storage } from '@ionic/storage';

import {HomePage} from '../pages/home/home';
import {RegisterPage} from "../pages/register/register";
import {RSA} from "./utils/rsa"
import {Registration} from "../providers/registration"

@Component({
    templateUrl: 'app.html'
})
export class MyApp {
    rootPage:any;

    constructor(platform: Platform, storage: Storage, registration: Registration) {
        platform.ready().then(() => {
          console.log("platform ready")
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.

          registration.isRegistered().then(is_registered => {
            console.log("is registered", is_registered)
            if (is_registered) {
              this.rootPage = HomePage;
            } else {
              this.rootPage = RegisterPage;
            }

            StatusBar.styleDefault();
            Splashscreen.hide();
          })

        });
    }
}

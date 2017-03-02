import {Component} from '@angular/core';
import {Platform} from 'ionic-angular';
import {StatusBar, Splashscreen} from 'ionic-native';
import { Storage } from '@ionic/storage';

import {HomePage} from '../pages/home/home';
import {RegisterPage} from "../pages/register/register";
import {RSA} from "./utils/rsa"
import {Registration} from "../providers/my-data"

@Component({
    templateUrl: 'app.html'
})
export class MyApp {
    rootPage:any;

    constructor(platform: Platform, storage: Storage, registration: Registration) {
        platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.

            let rsa = new RSA(storage)
            rsa.hasKeyStored().then((registered) => {
                if (registered) {
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

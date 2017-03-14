import {Component} from '@angular/core';
import {Platform, NavController} from 'ionic-angular';
import {StatusBar, Splashscreen} from 'ionic-native';
import { Storage } from '@ionic/storage';

import {HomePage} from '../pages/home/home';
import {RegisterPage} from "../pages/register/register";
import {Registration} from "../providers/registration";
import {ConnectionsPage} from "../pages/connections/connections";
import {MainPage} from "../pages/main/main";

@Component({
    templateUrl: 'app.html'
})
export class MyApp {
    rootPage:any = MainPage;

    constructor(platform: Platform) {
      platform.ready().then(() => {

        console.log("platform ready", platform.is("cordova"), platform.is("mobile"), platform.is("core"))
          // Okay, so the platform is ready and our plugins are available.
          // Here you can do any higher level native things you might need.
      });
    }
}

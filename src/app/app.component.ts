import {Component, enableProdMode} from '@angular/core';
import {Platform} from 'ionic-angular';

import {MainPage} from "../pages/main/main";
import {GreetingPage} from "../pages/greeting/greeting";

enableProdMode();

@Component({
    templateUrl: 'app.html'
})
export class MyApp {
    rootPage:any = MainPage;

    constructor(platform: Platform) {
      platform.ready().then(() => {
        console.log("platform ready")
          // Okay, so the platform is ready and our plugins are available.
          // Here you can do any higher level native things you might need.
      });
    }
}

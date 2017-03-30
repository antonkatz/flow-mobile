import {Component} from '@angular/core';
import {Platform} from 'ionic-angular';

import {MainPage} from "../pages/main/main";

@Component({
    templateUrl: 'app.html'
})
export class MyApp {
    rootPage:any = null;

    constructor(platform: Platform) {
      platform.ready().then(() => {
        console.log("platform ready")
        this.rootPage = MainPage;
          // Okay, so the platform is ready and our plugins are available.
          // Here you can do any higher level native things you might need.
      });
    }
}

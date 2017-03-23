import { NgModule, ErrorHandler } from '@angular/core';
import { Storage } from '@ionic/storage';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import {RegisterPage} from "../pages/register/register";
import {Registration} from "../providers/registration"
import {ServerComms} from "../providers/server-comms";
import {ConnectionsPage} from "../pages/connections/connections";
import {MainPage} from "../pages/main/main";
import {CreateOfferPage} from "../pages/create-offer/create-offer";
import {Wallet} from "../providers/wallet";

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    RegisterPage,
    ConnectionsPage,
    MainPage,
    CreateOfferPage
  ],
  imports: [
    IonicModule.forRoot(MyApp, {},{
      links: [
        // { component: ConnectionsPage, name: 'Connections', segment: 'connections' }
      ]
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    RegisterPage,
    ConnectionsPage,
    MainPage,
    CreateOfferPage
  ],
  providers: [{provide: ErrorHandler, useClass: IonicErrorHandler}, Storage, Registration, ServerComms, Wallet]
})
export class AppModule {}

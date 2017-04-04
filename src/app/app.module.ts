import { NgModule, ErrorHandler } from '@angular/core';
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
import {WalletPage} from "../pages/wallet/wallet";

import { IonicStorageModule } from '@ionic/storage';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import {GreetingPage} from "../pages/greeting/greeting";
import {KeyDownloadPage} from "../pages/key-download/key-download";
import {FaqPage} from "../pages/faq/faq";

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    RegisterPage,
    ConnectionsPage,
    MainPage,
    CreateOfferPage,
    WalletPage,
    GreetingPage,
    KeyDownloadPage,
    FaqPage
  ],
  imports: [
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    RegisterPage,
    ConnectionsPage,
    MainPage,
    CreateOfferPage,
    WalletPage,
    GreetingPage,
    KeyDownloadPage,
    FaqPage
  ],
  providers: [StatusBar,
              SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler}, Registration, ServerComms, Wallet]
})
export class AppModule {

}

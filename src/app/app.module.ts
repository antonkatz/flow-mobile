import { NgModule, ErrorHandler } from '@angular/core';
import { Storage } from '@ionic/storage';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import {RegisterPage} from "../pages/register/register";
import {Registration} from "../providers/registration"
import {ServerComms} from "../providers/server-comms";

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    RegisterPage
  ],
  imports: [
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    RegisterPage
  ],
  providers: [{provide: ErrorHandler, useClass: IonicErrorHandler}, Storage, Registration, ServerComms]
})
export class AppModule {}
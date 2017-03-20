import { Component } from '@angular/core';
import md5 from "md5"
import {ServerComms} from "../../providers/server-comms";
import {ToastController} from "ionic-angular";

/*
  Generated class for the WebSplash page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-connections',
  templateUrl: 'connections.html'
})
export class ConnectionsPage {
  connections = []

  constructor(public comms: ServerComms, public toastCtrl: ToastController) {
    console.log("Looking up connected users")
    this.comms.sendToServer("/get_connections", null, data => {
      console.log("connected to", data)
    }, error => {
      console.log("error during a connections lookup", error);
      ServerComms.errorToast(this.toastCtrl, error["error_msg"])
    })

    this.connections = [{userId: "ooarsetndhbvktnndvaeroasnd", userName: "vasya"},
      {userId: "rsetndhbvktnndvaeroasnd", userName: "petya"},
      {userId: "taoufkviaerndn", userName: "masha"}]
  }

  md5(what: any) {
    return md5(what)
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad WebSplashPage');
  }

}

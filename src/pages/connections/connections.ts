import { Component } from '@angular/core';
import md5 from "md5"

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
  connections = null

  constructor() {
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

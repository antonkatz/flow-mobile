import { Component } from '@angular/core';
import { NavController} from 'ionic-angular';
import {RSA} from "../../app/utils/rsa";
import {Storage} from "@ionic/storage";
import {DomSanitizer} from "@angular/platform-browser";

/*
  Generated class for the KeyDownload page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-key-download',
  templateUrl: 'key-download.html'
})
export class KeyDownloadPage {
  private rsa
  uri_base = "data:text/plain;charset=UTF-8;base64,"
  private_key_data_uri:any = ""
  private_key=""

  constructor(public navCtrl: NavController, public storage: Storage,
              public sanitizer: DomSanitizer) {
    this.rsa = new RSA(storage);
  }

  ionViewWillLoad() {
    this.rsa.getPrivateKey().then((key) => {
      this.private_key = key
      this.private_key_data_uri = this.sanitizer.bypassSecurityTrustUrl(this.uri_base + btoa(key))
    })
  }

  backToHome() {
    this.navCtrl.pop()
  }
}

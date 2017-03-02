import {Injectable} from "@angular/core";
import {Http, RequestOptionsArgs, Headers} from "@angular/http";
import {Storage} from "@ionic/storage";
import {RSA} from "../app/utils/rsa";
import aesjs from "aes-js"
import "rxjs/add/operator/map";

/*
 Generated class for the Registration provider.

 See https://angular.io/docs/ts/latest/guide/dependency-injection.html
 for more info on providers and Angular 2 DI.
 */
@Injectable()
export class Registration {

    private server_address = "127.0.0.1:8080"
    private rsa = null

    constructor(public http: Http, public storage: Storage) {
        console.log('Hello Registration Provider');

        this.rsa = new RSA(storage);

        this.rsa.getPubKey().then((pub_key:string) => {

            let registration_request = {"name": "test_name", "invitation_code": "test_code"};
            let encrypted_body = this.rsa.sendToServer(registration_request)
            let header_vals = {"public_key": btoa(pub_key), "Content-Type": "application/json"}
            let config: RequestOptionsArgs = {method: "POST", body: encrypted_body, headers : new Headers(header_vals)}

            // console.log("config", config)
            // console.log("body", encrypted_body)

            this.http.request("http://" + this.server_address + "/register", config).subscribe(response => {
                let sym_key = response.headers.get("sym_key")
                console.log("response text", response.text())
                let full_response_data = aesjs.utils.hex.toBytes(response.text())
                let iv = full_response_data.slice(0, 16)
                let data = full_response_data.slice(16)
                console.log("full data size", full_response_data.byteLength)
                    console.log("iv", iv)
                console.log("iv size", iv.byteLength)
                    console.log("key", sym_key)

                let dsym_key = this.rsa.receiveFromServer(sym_key)
                // console.log("dsym_key", dsym_key)
                var key = aesjs.utils.hex.toBytes(dsym_key);
                // console.log("key", key)
                // console.log("key size", key.length)
                var aesCbc = new aesjs.ModeOfOperation.cbc(key, iv);
                console.log("data size", data.length)
                console.log("data size buff", response.arrayBuffer().byteLength)
                console.log("data mod 16", data.length % 16)
                console.log("data", data)
                var decryptedBytes = aesCbc.decrypt(data);

                var decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
                console.log(decryptedText);
            }, error => {
                    console.log("error during server response [registration]", error);
                });

        }, (error) => {
            console.log("could not get public key when trying to register", error)
        })

    }

}

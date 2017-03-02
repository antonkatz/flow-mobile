import {Injectable} from "@angular/core";
import {Http, RequestOptionsArgs, Headers} from "@angular/http";
import {Storage} from "@ionic/storage";
import {RSA} from "../app/utils/rsa";
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

            console.log("config", config)
            console.log("body", encrypted_body)

            this.http.request("http://" + this.server_address + "/register", config).subscribe(response => {
                    console.log("registration server response", response.text())
                    console.log("headers", response.headers.getAll("sym_key"))
                }, error => {
                    console.log("error during server response [registration]", error);
                });

        }, (error) => {
            console.log("could not get public key when trying to register", error)
        })

    }

}

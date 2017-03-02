/**
 * Created by anton on 19/01/17.
 */
import {JSEncrypt} from "jsencrypt";
import {Storage} from '@ionic/storage';


export class RSA {
    private key_bits = 1024 * 4;
    private storage_name = "rsa_key"
    private server_key: string = "-----BEGIN PUBLIC" +
    " KEY-----MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAvq7+LdGjlYwk4y8iov2xgSZElxrFNbpkJguDJVFwJDFh+GcXZOENOQ8LOEKAHFq9pLm5hxZspjE9EajT9SlDmLu89Vq82r1Rls5crPG3c2eIPlb3+IBG22WG63Sbl71AKYk90CXXmfmCfEkydacznSBpzuoUGpt7VUH5XIe4NRPT6oJqcK7GN2ZO5csguMhj+5vcNIWC3+x3oCEMrm1WB4ifU8CU4Tdf0tZ/n2rVCe0H/F42wBAgyH3Nfv3XPMpo2h9CbUpmaANARS0gIXSbrSrPwAPhrQIElJ0eWU/YAqLVjdczr6PPdiQYo1HLhb8IZFU9eanYRC+HGHjooq0AOaHbPUywzxNHwmmC/Eh17PdBIvwJe0rTy4JLDz8mDz5mQpbeB8hMCyOk9mHFu8cJW0digUadNTZMFHkMSq6pGGfdAzH7CGf7IZ5oXYt1wGVBqO2VRx2zOuoSh5cPyQozuzzJTOGCXCzOBvUXc25RvAhcHCokLVkEWOY/p+sYRmBn8IOsUXqjW437WUUsCRwQOLXe0VrofdvCtwmIEk4oriSGo6zrbFC3vqf0GmQuDpdjprM3dnXevfDWejAGWl06dBHLTGQx6kWNGkxKw5mDikVF+f/6+8g8nVetNEH34qzVduPk9+LY09T0dxaGuXoSRPCMi9MxK/SUFEPiiW02R18CAwEAAQ==-----END PUBLIC KEY-----";

    private private_key: any = null;
    private public_key: string = null;
    private has_stored_key = false;
    private load_status: PromiseLike<void>;

    private loaded = false;

    private crypt = null;
    private static self_instance: RSA = null;

    constructor(public storage: Storage) {
        console.log("constructing RSA")
        if(RSA.self_instance) {
            console.log("returning existing instance")
           return RSA.self_instance
        }

        this.privateConstructor(storage)
        RSA.self_instance = this
    }

    /** @return object encrypted with the server key in hex format */
    sendToServer(object: any) {
        let json = JSON.stringify(object)
        this.crypt.setKey(this.server_key)
        return this.crypt.getKey().encrypt(json)
    }

    /** takes a string in hex format, uses the private key of the user to decrypt; in case of error returns false */
    receiveFromServer(hex: string) {
        try {
            this.crypt.setKey(this.private_key)
            return this.crypt.getKey().decrypt(hex);
        }
        catch (ex) {
            return false;
        }
    }

    /** @return a promise with the key */
    getPubKey() {
        if (this.loaded) {
            console.log("getting key from cache")
            return Promise.resolve(this.public_key);
        }
        return this.load_status.then(() => {
            console.log("key put in cache")
            this.loaded = true;
            return this.public_key
        }, (error) => {
            console.log("there is no key", error)
            return null;
        })
    }

    /** acts doubly as a test for having been registered */
    hasKeyStored() {
        return this.load_status.then(() => {
            return this.has_stored_key;
        }, () => {return false});
    }

    private privateConstructor(storage: Storage) {
        this.crypt = new JSEncrypt({default_key_size: this.key_bits})
        this.load_status = this.loadKey().then((is_loaded) => {
            is_loaded ? console.log("key loaded from storage") : this.loadGeneratedKey()
        }, (error) => {
            console.log("error", error)
            this.loadGeneratedKey()
        });
    }

    /** for constructor use. generates and stores key. */
    private loadGeneratedKey() {
        console.log("could not load key, generating")
        this.generateKey()
        this.store()
    }

    private loadKey() {
        return this.storage.get(this.storage_name).then((stored_key) => {
            if (stored_key) {
                this.private_key = stored_key;
                this.crypt.setPrivateKey(this.private_key);
                this.public_key = this.crypt.getPublicKey();
                this.has_stored_key = true;
                return true;
            } else {
                return false;
            }
        }, (error) => {
            console.log("Perhaps no key exists", error)
            throw error;
        })
    }

    private generateKey() {
        // The length of the RSA key, in bits.
        console.log("generating key");
        this.crypt.getKey();
        this.private_key = this.crypt.getPrivateKey();
        this.public_key = this.crypt.getPublicKey();
    }

    private store() {
        console.log("storing the key")
        this.storage.set(this.storage_name, this.private_key)
    }
}

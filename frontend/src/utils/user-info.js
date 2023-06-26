import {Auth} from "../services/auth.js";
import {CustomHttp} from "../services/custom-http.js";
import config from "../../config/config.js";

export class UserInfo {
    constructor() {
        this.fullName = document.getElementById('profile-full-name');
        this.balance = document.getElementById('balance');
        this.userInfo = Auth.getUserInfo();
        this.accessToken = localStorage.getItem(Auth.accessTokenKey);
        this.getUserInfo();
        this.getBalance();
    }

    getUserInfo() {
        this.userInfo && this.accessToken ? this.fullName.innerText = this.userInfo.fullName : this.fullName.innerText = 'Нет данных';
    }

    async getBalance() {
        try {
            const result= await CustomHttp.request(config.host + '/balance');
            if (result) {
                if (result.error) {
                    throw new Error (result.error)
                }
                this.balance.innerText = result.balance;
            }
        } catch (error) {
            console.log(error)
        }
    }
}
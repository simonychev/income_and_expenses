import {CustomHttp} from "../services/custom-http.js";
import {Auth} from "../services/auth.js";
import config from "../../config/config.js";

export class CreateExpenses {

    constructor() {
        this.init();
    }

    async init() {
        const userInfo = Auth.getUserInfo();
        if (!userInfo) {
            location.href = '#/login';
        }
        const titleCreateCategory = document.getElementById('titleCreateCategory');

        const saveCategory = document.getElementById('saveCategory');
        saveCategory.onclick = async () => {
            try {
                const result = await CustomHttp.request(config.host + '/categories/expense/', 'POST', {
                    title: titleCreateCategory.value
                });
                if (result) {
                    if (result.error) {
                        throw new Error(result.error);
                    }
                    window.location.href = '#/expenses'
                }
            } catch (error) {
                console.log(error);
            }
        }

        const canselBtn = document.getElementById('cancelEdit');
        canselBtn.onclick = () => {
            window.location.href = '#/expenses'
        }
    }
}
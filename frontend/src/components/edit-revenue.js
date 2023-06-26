import {CustomHttp} from "../services/custom-http.js";
import {Auth} from "../services/auth.js";
import config from "../../config/config.js";

export class EditRevenue {

    constructor() {
        this.init();
    }

    async init() {
        const userInfo = Auth.getUserInfo();
        const cancelBtn = document.getElementById('cancelRevenue');
        const saveBtn = document.getElementById('saveRevenue');
        if (!userInfo) {
            location.href = '#/login';
        }

        const editRevenue = JSON.parse(localStorage.getItem('userEditRevenue'));
        const editInput = document.getElementById('editRevenue');
        editInput.value = editRevenue.title;
        const id = editRevenue.id;

        saveBtn.onclick = async () => {
            try {
                const result = await CustomHttp.request(config.host + '/categories/income/' + id, 'PUT', {
                    "title": editInput.value
                });
                if (result) {
                    if (result.error) {
                        throw new Error(result.error);
                    }
                    window.location.href = '#/revenue';
                    localStorage.removeItem('userEditRevenue');
                }
            } catch (error) {
                console.log(error);
            }
        }

        cancelBtn.onclick = () => {
            window.location.href = '#/revenue';
        }
    }
}
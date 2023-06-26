import {CustomHttp} from "../services/custom-http.js";
import {Auth} from "../services/auth.js";
import config from "../../config/config.js";

export class EditExpenses {

    constructor() {
        this.init();
    }

    async init() {
        const userInfo = Auth.getUserInfo();
        const cancelBtn = document.getElementById('cancelExpenses');
        const saveBtn = document.getElementById('saveCategory');
        if (!userInfo) {
            location.href = '#/login';
        }

        const editExpense = JSON.parse(localStorage.getItem('userEditExpense'));
        const editInput = document.getElementById('editExpense');
        editInput.value = editExpense.title;
        const id = editExpense.id;

        saveBtn.onclick = async () => {
            try {
                const result = await CustomHttp.request(config.host + '/categories/expense/' + id, 'PUT', {
                    "title": editInput.value
                });
                if (result) {
                    if (result.error) {
                        throw new Error(result.error);
                    }
                    window.location.href = '#/expenses';
                    localStorage.removeItem('userEditExpense');
                }
            } catch (error) {
                console.log(error);
            }
        }

        cancelBtn.onclick = () => {
            window.location.href = '#/expenses';
        }

    }
}
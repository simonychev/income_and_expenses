import {CustomHttp} from "../services/custom-http.js";
import {Auth} from "../services/auth.js";
import config from "../../config/config.js";

export class EditRevenueExpenses {

    constructor() {
        this.operations = [];
        this.type = null;
        this.amount = null;
        this.comment = null;
        this.category = null;
        this.date = null;
        this.id = null;
        this.init();
    }

    async init() {
        const userInfo = Auth.getUserInfo();
        if (!userInfo) {
            location.href = '#/login';
        }

        this.userOperation = JSON.parse(localStorage.getItem('userOperation'));
        this.type = document.getElementById('type');
        this.amount = document.getElementById('amount');
        this.comment = document.getElementById('comment');
        this.category = document.getElementById('category_id');
        this.date = document.getElementById('date');
        this.id = this.userOperation.id;
        this.type.setAttribute('disabled', 'disabled');
        this.category.setAttribute('disabled', 'disabled');

        this.type.value = this.userOperation.type === 'income' ? 'Доход' : 'Расход';
        this.amount.value = this.userOperation.amount;
        this.date.value = this.userOperation.date;
        this.comment.value = this.userOperation.comment;

        if (this.type.value === "Доход") {
            try {
                const result = await CustomHttp.request(config.host + '/categories/income/', 'GET');
                if (result) {
                    if (result.error) {
                        throw new Error(result.error);
                    }
                    this.operations = result;
                    this.processEdit();
                }
            } catch (error) {
                console.log(error);
            }
        }

        if (this.type.value === "Расход") {
            try {
                const result = await CustomHttp.request(config.host + '/categories/expense/', 'GET');
                if (result) {
                    if (result.error) {
                        throw new Error(result.error);
                    }
                    this.operations = result;
                    this.processEdit();
                }
            } catch (error) {
                console.log(error);
            }
        }
    }

    processEdit() {

        if (this.operations && this.operations.length > 0) {
            this.operations.forEach(item => {
                const optionElement = document.createElement('option');
                optionElement.setAttribute('value', item.title);
                optionElement.setAttribute('data-id', item.id);
                optionElement.innerText = item.title;
                this.category.appendChild(optionElement);
            })
        }

        const saveEdit = document.getElementById('saveEdit');
                saveEdit.onclick = async () => {
                    const operation = this.operations.find(item => item.title === this.category.value);
                    try {
                        const result = await CustomHttp.request(config.host + '/operations/' + this.id, 'PUT', {
                            "type": this.userOperation.type,
                            "amount": Number(this.amount.value),
                            "date": this.date.value,
                            "comment": this.comment.value,
                            "category_id": operation.id
                        });
                        if (result) {
                            if (result.error) {
                                throw new Error(result.error);
                            }
                            window.location.href = '#/revenue-expenses';
                            localStorage.removeItem('userOperation');
                        }
                    } catch (error) {
                        console.log(error);
                    }
                }

        const cancelEdit = document.getElementById('cancelEdit');
        cancelEdit.onclick = () => {
            window.location.href = '#/revenue-expenses';
            localStorage.removeItem('userOperation');
        }
    }
}
import {CustomHttp} from "../services/custom-http.js";
import {Auth} from "../services/auth.js";
import config from "../../config/config.js";

export class CreateRevenueExpenses {

    constructor() {
        this.operations = [];
        this.type = null;
        this.amount = null;
        this.comment = null;
        this.category = null;
        this.date = null;
        this.init();
    }

    async init() {
        const userInfo = Auth.getUserInfo();
        if (!userInfo) {
            location.href = '#/login';
        }

        this.type = document.getElementById('type');
        this.amount = document.getElementById('amount');
        this.comment = document.getElementById('comment');
        this.category = document.getElementById('category_id');
        this.date = document.getElementById('date');
        this.operation = localStorage.getItem('operation');
        this.type.value = this.operation;
        this.getOperation();
    }

    async getOperation() {
        if (this.type.value === "Доход") {
            try {
                const result = await CustomHttp.request(config.host + '/categories/income/', 'GET');
                if (result) {
                    if (result.error) {
                        throw new Error(result.error);
                    }
                    this.operations = result;
                    this.processCreate();
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
                    this.processCreate();
                }
            } catch (error) {
                console.log(error);
            }
        }
    }

    processCreate() {

        this.type.onchange = () => {
            while (this.category.options.length > 0) {
                this.category.options.remove(0)
            }
            this.getOperation();
        }

        if (this.operations && this.operations.length > 0) {
           this.operations.forEach(item => {
                const optionElement = document.createElement('option');
                optionElement.setAttribute('value', item.title);
                optionElement.innerText = item.title;
                this.category.appendChild(optionElement);
            })
        }

        const saveCreateBtn = document.getElementById('saveCreate');
        saveCreateBtn.onclick = async () => {
            const operation = this.operations.find(item => item.title === this.category.value);
            try {
                let typeSelect = this.operation === 'Доход' ? 'income' : 'expense';
                const result = await CustomHttp.request(config.host + '/operations/', 'POST', {
                    type: typeSelect,
                    category_id: operation.id,
                    amount: this.amount.value,
                    date: this.date.value,
                    comment: this.comment.value
                });

                if (result) {
                    if (result.error) {
                        throw new Error(result.error);
                    }
                    window.location.href = '#/revenue-expenses';
                    localStorage.removeItem('operation');
                }
            } catch (error) {
                console.log(error);
            }
        }

        const cancelCreateBtn = document.getElementById('cancelCreate');
        cancelCreateBtn.onclick = () => {
            window.location.href = '#/revenue-expenses';
            localStorage.removeItem('operation');
        }
    }
}
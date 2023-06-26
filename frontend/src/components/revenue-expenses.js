import {CustomHttp} from "../services/custom-http.js";
import {Auth} from "../services/auth.js";
import config from "../../config/config.js";

export class RevenueExpenses {

    constructor() {
        this.init();
    }

    async init() {
        const userInfo = Auth.getUserInfo();
        if (!userInfo) {
            location.href = '#/login';
        }

        this.dateFromValue = null;
        this.dateToValue = null;
        this.intervalButtons = null;
        this.operations = null;
        this.operationsElement = document.getElementById('content-operations');
        this.locationLS = JSON.parse(localStorage.getItem('localInfo'));
        this.selectInterval();
    }

    selectInterval() {

        if (!this.locationLS) {
            this.period = 'today';
            this.getOperations(this.period);
        } else {
            this.getOperations(this.locationLS.periodLS, this.locationLS.dateFromLS, this.locationLS.dateToLS);           
        }

        this.intervalButtons = document.querySelectorAll('button.menu-button');
        this.intervalButtons.forEach(item => {
            item.onclick = () => {
                this.intervalButtons.forEach(item => {
                    item.classList.remove('active');
                });
                item.classList.add('active');

                const intervalType = item.getAttribute('id');
                this.dateFromElement = document.getElementById('startDateTitle');
                this.dateToElement = document.getElementById('endDateTitle');
                this.dateFromElement.value = '';
                this.dateToElement.value = '';
                this.dateFromElement.setAttribute('type', 'text');                
                this.dateToElement.setAttribute('type', 'text');
                this.dateFromElement.style.borderColor = '#6c757d';
                this.dateFromElement.nextElementSibling.style.display = 'none';
                this.dateToElement.style.borderColor = '#6c757d';
                this.dateToElement.nextElementSibling.style.display = 'none';
                switch (intervalType) {
                    case 'today':
                        this.getOperations('today');
                        break;
                    case 'week':
                        this.getOperations('week');
                        break;
                    case 'month':
                        this.getOperations('month');
                        break;
                    case 'year':
                        this.getOperations('year');
                        break;
                    case 'all':
                        this.getOperations('all');
                        break;
                    case 'interval':
                        this.operationsElement.innerHTML = '';
                        if (!this.dateFromElement.value) {
                            this.dateFromElement.style.borderColor = 'red';
                            this.dateFromElement.nextElementSibling.style.display = 'block';
                        }

                        if (!this.dateToElement.value) {
                            this.dateToElement.style.borderColor = 'red';
                            this.dateToElement.nextElementSibling.style.display = 'block';
                        }

                        this.dateFromElement.onchange = () => {
                            this.dateFromElement.style.borderColor = '#ced4da';
                            this.dateFromElement.nextElementSibling.style.display = 'none';
                            this.dateFromValue = this.dateFromElement.value;
                            this.getOperationsFromInterval();
                        }

                        this.dateToElement.onchange = () => {
                            this.dateToElement.style.borderColor = '#ced4da';
                            this.dateToElement.nextElementSibling.style.display = 'none';
                            this.dateToValue = this.dateToElement.value;
                            this.getOperationsFromInterval();
                        }

                        this.getOperationsFromInterval();
                        break;
                }
            };
        });
    }

    getOperationsFromInterval() {
        if (this.dateFromValue && this.dateToValue) {
            this.getOperations('interval', this.dateFromValue, this.dateToValue);
        }
    }

    async getOperations(period = null, dateFrom = null, dateTo = null) {
        let params = '';
        let localInfo = {periodLS: period, dateFromLS: dateFrom, dateToLS: dateTo}
        if (period) {
            params = '?period=' + period;
            if (period === 'interval' && dateFrom && dateTo) {
                params += '&dateFrom=' + dateFrom + '&dateTo=' + dateTo;
            }
        }
        localStorage.setItem('localInfo', JSON.stringify(localInfo));

        try {
            const result = await CustomHttp.request(config.host + '/operations' + params);
            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }
                this.operations = result;
                this.processOperation();
            }
        } catch (error) {
            console.log(error);
        }
    }

    processOperation() {
        const myModal = new bootstrap.Modal(document.getElementById('modal'));
        this.operationsElement.innerHTML = '';
        if (this.operations && this.operations.length > 0) {
            this.operations.forEach(item => {
                const operationElement = document.createElement('div');
                operationElement.className = 'content-operation row text-center';
                operationElement.setAttribute('data-id', item.id);
                const numOperationElement = document.createElement('span');
                numOperationElement.className = 'num col';
                numOperationElement.innerText = item.id;
                const incomeOperationElement = document.createElement('span');
                incomeOperationElement.className = 'income col';
                if (item.type === 'income') {
                    incomeOperationElement.style.color = 'green';
                    incomeOperationElement.innerText = 'Доход';
                } else {
                    incomeOperationElement.style.color = 'red';
                    incomeOperationElement.innerText = 'Расход';
                }
                const salaryOperationElement = document.createElement('span');
                salaryOperationElement.className = 'salary col mx-5';
                salaryOperationElement.innerText = item.category;
                const sumOperationElement = document.createElement('span');
                sumOperationElement.className = 'sum col';
                sumOperationElement.innerText = item.amount + '$';
                const dataOperationElement = document.createElement('span');
                dataOperationElement.className = 'data col';
                dataOperationElement.innerText = new Date(item.date).toLocaleDateString();
                const commentOperationElement = document.createElement('span');
                commentOperationElement.className = 'comment col mx-5';
                commentOperationElement.innerText = item.comment;
                const iconOperationElement = document.createElement('span');
                iconOperationElement.className = 'icon col';
                const trashElement = document.createElement('img');
                trashElement.className = 'me-2';
                trashElement.setAttribute('id', 'deleteElement');
                trashElement.src = '/images/trash.png';
                trashElement.onclick = () => {
                    myModal.show();
                    const deleteOperation = document.getElementById('deleteCategory');
                    deleteOperation.onclick = async () => {
                        try {
                            myModal.hide();
                            const result = await CustomHttp.request(config.host + '/operations/' + item.id, 'DELETE');
                            if (result) {
                                if (result.error) {
                                    throw new Error(result.error);
                                }
                                window.location.href = '#/revenue-expenses'
                            }
                        } catch (error) {
                            console.log(error);
                        }
                    }
                }
                const penElement = document.createElement('img');
                penElement.src = '/images/pen.png';
                penElement.setAttribute('id', 'editElement');
                penElement.onclick = () => {
                    const userOperation = {
                        id: item.id,
                        type: item.type,
                        category_id: item.category,
                        amount: item.amount,
                        date: item.date,
                        comment: item.comment
                    };
                    window.location.href = '#/edit-revenue-expenses'
                    localStorage.setItem('userOperation', JSON.stringify(userOperation));
                }
                const hrElement = document.createElement('hr');

                operationElement.appendChild(numOperationElement);
                operationElement.appendChild(incomeOperationElement);
                operationElement.appendChild(salaryOperationElement);
                operationElement.appendChild(sumOperationElement);
                operationElement.appendChild(dataOperationElement);
                operationElement.appendChild(commentOperationElement);
                operationElement.appendChild(iconOperationElement);
                iconOperationElement.appendChild(trashElement);
                iconOperationElement.appendChild(penElement);
                this.operationsElement.appendChild(operationElement);
                this.operationsElement.appendChild(hrElement);
            })
        }

        const createRevenue = document.getElementById('createRevenue');
        createRevenue.onclick = () => {
            location.href = '#/create-revenue-expenses';
            localStorage.setItem('operation', 'Доход');
        }

        const createExpenses = document.getElementById('createExpenses');
        createExpenses.onclick = () => {
            location.href = '#/create-revenue-expenses';
            localStorage.setItem('operation', 'Расход');
        }
    }
}
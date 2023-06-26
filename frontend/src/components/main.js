import {CustomHttp} from "../services/custom-http.js";
import {Auth} from "../services/auth.js";
import config from "../../config/config.js";
import {Chart} from 'chart.js/auto'

export class Main {

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
        this.chartIncome = null;
        this.chartExpense = null;
        this.mcIncome = document.getElementById('income');
        this.mcExpence = document.getElementById('expense');
        localStorage.removeItem('localInfo');
        this.selectInterval();
    }

    selectInterval() {
        this.getOperations();

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
                        if (this.chartIncome && this.chartExpense) {
                            this.chartIncome.destroy();
                            this.chartExpense.destroy();
                        }
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
        if (period) {
            params = '?period=' + period;
            if (period === 'interval' && dateFrom && dateTo) {
                params += '&dateFrom=' + dateFrom + '&dateTo=' + dateTo;
            }
        }
        try {
            const result = await CustomHttp.request(config.host + '/operations' + params);
            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }
                this.operations = result;
                this.showDiagram();
            }
        } catch (error) {
            console.log(error);
        }
    }

    showDiagram() {
        if (this.chartIncome) this.chartIncome.destroy();
        if (this.chartExpense) this.chartExpense.destroy();

        const COLORS = [
            'rgb(220, 53, 69)',
            'rgb(253, 126, 20)',
            'rgb(255, 193, 7)',
            'rgb(32, 201, 151)',
            'rgb(13, 110, 253)',
        ];
        let incomeData = [];
        let expenseData = [];
        const incomeOperations = this.operations.filter(operation => operation.type === 'income');
        const expenseOperations = this.operations.filter(operation => operation.type === 'expense');
        const incomeCategories = incomeOperations.map(operation => operation.category);
        const incomeLabels = Array.from(new Set(incomeCategories));
        const expenseCategories = expenseOperations.map(operation => operation.category);
        const expenseLabels = Array.from(new Set(expenseCategories));

        incomeLabels.forEach(label => {
            let sum = 0;
            incomeOperations.forEach(operation => {
                if (label === operation.category) {
                    sum += operation.amount;
                }
            })
            incomeData.push(sum);
        })

        expenseLabels.forEach(label => {
            let sum = 0;
            expenseOperations.forEach(operation => {
                if (label === operation.category) {
                    sum += operation.amount;
                }
            })
            expenseData.push(sum);
        })

        if (incomeOperations && incomeOperations.length > 0) {
            const dataIncome = {
                labels: incomeLabels,
                datasets: [{
                    label: 'Доходы',
                    data: incomeData,
                    backgroundColor: COLORS,
                    hoverOffset: 4
                }]
            };

            this.chartIncome = new Chart(this.mcIncome, {
                type: 'pie',
                data: dataIncome,
                options: {
                    plugins: {
                        title: {
                            display: true,
                            text: 'Доходы',
                            font: {
                                size: 28
                            }
                        }
                    }
                }
            });
        }

        if (expenseOperations && expenseOperations.length > 0) {
            const dataExpense = {
                labels: expenseLabels,
                datasets: [{
                    label: 'Расходы',
                    data: expenseData,
                    backgroundColor: COLORS,
                    hoverOffset: 4
                }]
            };

            this.chartExpense = new Chart(this.mcExpence, {
                type: 'pie',
                data: dataExpense,
                options: {
                    plugins: {
                        title: {
                            display: true,
                            text: 'Расходы',
                            font: {
                                size: 28
                            }
                        }
                    }
                }
            });
        }
    }
}








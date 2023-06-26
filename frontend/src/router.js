import {Main} from "./components/main.js";
import {Form} from "./components/form.js";
import {Revenue} from "./components/revenue.js";
import {Expenses} from "./components/expenses.js";
import {RevenueExpenses} from "./components/revenue-expenses.js";
import {EditRevenue} from "./components/edit-revenue.js";
import {EditExpenses} from "./components/edit-expenses.js";
import {CreateRevenue} from "./components/create-revenue.js";
import {CreateExpenses} from "./components/create-expenses.js";
import {CreateRevenueExpenses} from "./components/create-revenue-expenses.js";
import {EditRevenueExpenses} from "./components/edit-revenue-expenses.js";
import {UserInfo} from "./utils/user-info.js";
import {Auth} from "./services/auth.js";


export class Router {
    constructor() {

        this.contentElement = document.getElementById('content');
        this.stylesElement = document.getElementById('styles');
        this.titleElement = document.getElementById('page-title');
        this.sidebarElement = document.getElementById('main-sidebar')
        this.profileFullNameElement = document.getElementById('profile-full-name');
        this.menuHref = document.querySelectorAll('a.nav-link');
        window.addEventListener('hashchange', () => {
            this.handleActiveLink();
        });

        this.routes = [
            {
                route: '#/',
                title: 'Главная',
                template: 'templates/main.html',
                styles: 'styles/main.css',
                load: () => {
                    new UserInfo();
                    new Main();
                    this.handleActiveLink();
                }
            },
            {
                route: '#/signup',
                title: 'Регистрация',
                template: 'templates/signup.html',
                styles: 'styles/form.css',
                load: () => {
                    new Form('signup');
                }
            },
            {
                route: '#/login',
                title: 'Вход в систему',
                template: 'templates/login.html',
                styles: 'styles/form.css',
                load: () => {
                    new Form('login');
                }
            },
            {
                route: '#/revenue',
                title: 'Доходы',
                template: 'templates/revenue.html',
                styles: 'styles/revenue.css',
                load: () => {
                    new UserInfo();
                    new Revenue();
                    this.handleActiveLink();
                }
            },
            {
                route: '#/expenses',
                title: 'Расходы',
                template: 'templates/expenses.html',
                styles: 'styles/expenses.css',
                load: () => {
                    new UserInfo();
                    new Expenses();
                    this.handleActiveLink();
                }
            },
            {
                route: '#/revenue-expenses',
                title: 'Доходы и расходы',
                template: 'templates/revenue-expenses.html',
                styles: 'styles/revenue-expenses.css',
                load: () => {
                    new UserInfo();
                    new RevenueExpenses();
                    this.handleActiveLink();
                }
            },
            {
                route: '#/edit-revenue',
                title: 'Редактировать доход',
                template: 'templates/edit-revenue.html',
                styles: 'styles/revenue-expenses.css',
                load: () => {
                    new UserInfo();
                    new EditRevenue();
                    this.handleActiveLink();
                }
            },
            {
                route: '#/edit-expenses',
                title: 'Редактировать расход',
                template: 'templates/edit-expenses.html',
                styles: 'styles/revenue-expenses.css',
                load: () => {
                    new UserInfo();
                    new EditExpenses();
                    this.handleActiveLink();
                }
            },
            {
                route: '#/create-revenue',
                title: 'Создать доход',
                template: 'templates/create-revenue.html',
                styles: 'styles/revenue-expenses.css',
                load: () => {
                    new UserInfo();
                    new CreateRevenue();
                    this.handleActiveLink();
                }
            },
            {
                route: '#/create-expenses',
                title: 'Создать категорию расходов',
                template: 'templates/create-expenses.html',
                styles: 'styles/revenue-expenses.css',
                load: () => {
                    new UserInfo();
                    new CreateExpenses();
                }
            },
            {
                route: '#/create-revenue-expenses',
                title: 'Создание дохода/расхода',
                template: 'templates/create-revenue-expenses.html',
                styles: 'styles/revenue-expenses.css',
                load: () => {
                    new UserInfo();
                    new CreateRevenueExpenses();
                }
            },
            {
                route: '#/edit-revenue-expenses',
                title: 'Редактирование дохода/расхода',
                template: 'templates/edit-revenue-expenses.html',
                styles: 'styles/revenue-expenses.css',
                load: () => {
                    new UserInfo();
                    new EditRevenueExpenses();
                }
            },
        ]
    }

    async openRoute() {
        const urlRoute = window.location.hash.split('?')[0];
        if (urlRoute === '#/logout') {
            await Auth.logout();
            window.location.href = '#/login';
            return;
        }

        const newRoute = this.routes.find(item => {
            return item.route === urlRoute;
        });

        if (!newRoute) {
            window.location.href = '#/';
            return
        }

        this.contentElement.innerHTML = await fetch(newRoute.template).then(response => response.text());
        this.stylesElement.setAttribute('href', newRoute.styles);
        this.titleElement.innerText = newRoute.title;

        const userInfo = Auth.getUserInfo();
        const accessToken = localStorage.getItem(Auth.accessTokenKey);

        if (userInfo && accessToken) {           
            this.profileFullNameElement.innerText = userInfo.fullName;
            this.sidebarElement.style.display = 'flex';
        } else {
            this.sidebarElement.style.display = 'none';
        }

        newRoute.load();
    }

    handleActiveLink() {
        const currentPath = window.location.hash;
        this.menuHref.forEach(link => {
            link.getAttribute('href') === currentPath ? link.classList.add('active') : link.classList.remove('active');
        });
    }
}
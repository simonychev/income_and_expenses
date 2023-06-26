import {CustomHttp} from "../services/custom-http.js";
import {Auth} from "../services/auth.js";
import config from "../../config/config.js";

export class Form {

    constructor(page) {
        this.agreeElement = null;
        this.processElement = null;
        this.page = page;

        this.fields = [
            {
                id: 'email',
                name: 'email',
                element: null,
                regex: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                valid: false,
            },
            {
                id: 'password',
                name: 'password',
                element: null,
                regex: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/,
                valid: false,
            },
        ];

        if (this.page === 'signup') {
            this.fields.unshift({
                    id: 'fullName',
                    name: 'fullName',
                    element: null,
                    regex: /^[А-ЯЁ][а-яё]{2,}\s[А-ЯЁ][а-яё]{2,}\s[А-ЯЁ][а-яё]{2,}$/,
                    valid: false,
                },
                {
                    id: 'passwordRepeat',
                    name: 'passwordRepeat',
                    element: null,
                    regex: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/,
                    valid: false,
                })
        };

        const that = this;
        this.fields.forEach(item => {
            item.element = document.getElementById(item.id);
            item.element.onchange = function () {
                that.validateField.call(that, item, this);
            }
        });
        this.processElement = document.getElementById('process');
        this.processElement.onclick = function () {
            that.processForm();
        };

        if (this.page === 'login') {
            this.agreeElement = document.getElementById('agree');
            this.agreeElement.onchange = function ()  {
                that.validateForm();
            }
        }
    }

    validateField(field, element) {
        if (!element.value || !element.value.match(field.regex)) {
            element.style.borderColor = 'red';
            field.valid = false;
        } else {
            element.removeAttribute('style');
            field.valid = true;
        }
        this.validateForm();
    }

    validateForm() {
        const validForm = this.fields.every(item => item.valid);
        const isValid = this.agreeElement ? this.agreeElement.checked && validForm : validForm;
        if (isValid) {
            this.processElement.removeAttribute('disabled');
        } else {
            this.processElement.setAttribute('disabled', 'disabled');
        }
        return isValid;
    }

    async processForm() {
        if (this.validateForm()) {
            const email = this.fields.find(item => item.name === 'email').element.value;
            const password = this.fields.find(item => item.name === 'password').element.value;

            if (this.page === 'signup') {
                const fullName = this.fields.find(item => item.name === 'fullName').element.value;
                const passwordRepeat = this.fields.find(item => item.name === 'passwordRepeat').element.value;
                let name = fullName.split(' ').slice(0, -1).join(' ');
                let lastName = fullName.split(' ').slice(-1).join(' ');

                try {
                    const result = await CustomHttp.request(config.host + '/signup', 'POST', {
                        name: name,
                        lastName: lastName,
                        email: email,
                        password: password,
                        passwordRepeat: passwordRepeat,
                    });

                    if (result) {
                        if (result.error || !result.user) {
                            throw new Error(result.message);
                        }
                    }
                } catch (error) {
                    return console.log(error);
                }

            }
            try {

                const result = await CustomHttp.request(config.host + '/login', 'POST', {
                    email: email,
                    password: password,
                });

                if (result) {
                    if (result.error || !result.tokens.accessToken || !result.tokens.refreshToken || !result.user.name || !result.user.lastName || !result.user.id) {
                        throw new Error(result.message);
                    }
                    Auth.setTokens(result.tokens.accessToken, result.tokens.refreshToken);
                    Auth.setUserInfo({
                        fullName: result.user.name + ' ' + result.user.lastName,
                        userId: result.userId,
                        email: email
                    })
                    location.href = '#/main';
                }
            } catch (error) {
                console.log(error);
            }
        }
    }
}
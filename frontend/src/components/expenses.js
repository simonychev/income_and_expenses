import {CustomHttp} from "../services/custom-http.js";
import {Auth} from "../services/auth.js";
import config from "../../config/config.js";

export class Expenses {
    constructor() {
        this.categories = [];
        this.init();
    }

    async init() {
        const userInfo = Auth.getUserInfo();
        if (!userInfo) {            
            location.href = '#/login';
        }

        localStorage.removeItem('localInfo');

        try {
            const result = await CustomHttp.request(config.host + '/categories/expense','GET');
            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }
                this.categories = result;
            }
        } catch (error) {
            console.log(error);
        }
        this.processCategories();
    }
    processCategories() {
        const myModal = new bootstrap.Modal(document.getElementById('modal'));
        const blocksElement = document.getElementById('blocks');
        if (this.categories && this.categories.length > 0) {
            this.categories.forEach(item => {
                const blockElement = document.createElement('div');
                blockElement.className = 'block-item border border-success rounded-3 pb-3 ps-3 pt-4 pe-5 me-3 mb-3';
                blockElement.setAttribute('data-id', item.id);
                const blockTitleElement = document.createElement('div');
                blockTitleElement.className = 'block-item-title mb-2';
                blockTitleElement.innerText = item.title;
                const blockActionElement = document.createElement('div');
                blockActionElement.className = 'block-item-action';
                const blockEditElement = document.createElement('button');
                blockEditElement.className = 'btn btn-primary me-2';
                blockEditElement.innerText = 'Редактировать';
                blockEditElement.onclick = () => {
                    const userEditExpense = {
                        id: item.id,
                        title: item.title
                    }
                    window.location.href = '#/edit-expenses';
                    localStorage.setItem('userEditExpense', JSON.stringify(userEditExpense));
                }
                const blockDeleteElement = document.createElement('button');
                blockDeleteElement.className = 'btn btn-danger';
                blockDeleteElement.innerText = 'Удалить';
                blockDeleteElement.onclick = () => {
                    myModal.show();
                    const deleteCategory = document.getElementById('deleteCategory');
                    deleteCategory.onclick = async () => {
                        try {
                            myModal.hide();
                            const result = await CustomHttp.request(config.host + '/categories/expense/' + item.id, 'DELETE');
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
                }

                blockActionElement.appendChild(blockEditElement);
                blockActionElement.appendChild(blockDeleteElement);
                blockElement.appendChild(blockTitleElement);
                blockElement.appendChild(blockActionElement);
                blocksElement.appendChild(blockElement);
            })
        }
        const createCategory = document.getElementById('createCategory');
        blocksElement.append(createCategory);
        createCategory.onclick = () => {
            window.location.href = '#/create-expenses'
        }
    }
}
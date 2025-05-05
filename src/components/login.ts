import { login } from '../api/auth';
function createLoginForm() {
    const loginForm = document.createElement('form');
    const usernameInput = document.createElement('input');
    const passwordInput = document.createElement('input');
    const submitButton = document.createElement('button');
    const errorParagraph = document.createElement('p');

    usernameInput.type = 'text';
    usernameInput.placeholder = '用户名';
    passwordInput.type = 'password';
    passwordInput.placeholder = '密码';
    submitButton.type ='submit';
    submitButton.textContent = '登录';
    errorParagraph.style.color ='red';

    loginForm.appendChild(usernameInput);
    loginForm.appendChild(passwordInput);
    loginForm.appendChild(submitButton);
    loginForm.appendChild(errorParagraph);

    return loginForm;
}
function handleLoginSubmit(loginForm: HTMLFormElement) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = (loginForm.querySelector('input[type="text"]') as HTMLInputElement).value;
        const password = (loginForm.querySelector('input[type="password"]') as HTMLInputElement).value;
        try {
            const data = await login(username, password);
            localStorage.setItem('token', data.token);
            console.log('登录成功');
            // 这里可以添加登录成功后的其他逻辑，比如跳转到首页
        } catch (error: any) {
            const errorParagraph = loginForm.querySelector('p') as HTMLParagraphElement;
            errorParagraph.textContent = error.message;
        }
    });
}
function initLogin() {
    const app = document.getElementById('app');
    if (app) {
        const loginForm = createLoginForm();
        handleLoginSubmit(loginForm);
        app.appendChild(loginForm);
    }
}

initLogin();
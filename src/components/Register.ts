// 引入注册函数
import { register } from '../api/auth';

// 创建注册表单元素
function createRegisterForm() {
    // 创建表单元素
    const registerForm = document.createElement('form');
    // 创建用户名输入框
    const usernameInput = document.createElement('input');
    // 创建密码输入框
    const passwordInput = document.createElement('input');
    // 创建提交按钮
    const submitButton = document.createElement('button');
    // 创建错误信息显示元素
    const errorParagraph = document.createElement('p');

    // 设置用户名输入框的类型和占位符
    usernameInput.type = 'text';
    usernameInput.placeholder = '用户名';
    // 设置密码输入框的类型和占位符
    passwordInput.type = 'password';
    passwordInput.placeholder = '密码';
    // 设置提交按钮的类型和文本
    submitButton.type ='submit';
    submitButton.textContent = '注册';
    // 设置错误信息显示元素的颜色
    errorParagraph.style.color ='red';

    // 将输入框、按钮和错误信息显示元素添加到表单中
    registerForm.appendChild(usernameInput);
    registerForm.appendChild(passwordInput);
    registerForm.appendChild(submitButton);
    registerForm.appendChild(errorParagraph);

    return registerForm;
}

// 处理注册表单提交事件
function handleRegisterSubmit(registerForm: HTMLFormElement) {
    registerForm.addEventListener('submit', async (e) => {
        // 阻止表单默认提交行为
        e.preventDefault();
        // 获取用户名输入框的值
        const username = (registerForm.querySelector('input[type="text"]') as HTMLInputElement).value;
        // 获取密码输入框的值
        const password = (registerForm.querySelector('input[type="password"]') as HTMLInputElement).value;
        try {
            // 调用注册函数进行注册
            await register(username, password);
            console.log('注册成功');
            // 这里可以添加注册成功后的逻辑，比如跳转到登录页面
        } catch (error: any) {
            // 获取错误信息显示元素
            const errorParagraph = registerForm.querySelector('p') as HTMLParagraphElement;
            // 在错误信息显示元素中显示错误信息
            errorParagraph.textContent = error.message;
        }
    });
}

// 初始化注册表单
function initRegister() {
    // 获取页面中的 app 元素
    const app = document.getElementById('app');
    if (app) {
        // 创建注册表单
        const registerForm = createRegisterForm();
        // 处理注册表单提交事件
        handleRegisterSubmit(registerForm);
        // 将注册表单添加到 app 元素中
        app.appendChild(registerForm);
    }
}

// 调用初始化注册表单函数
initRegister();
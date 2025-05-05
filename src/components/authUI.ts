// src/components/authUI.ts

// 导入 auth API 函数
// 注意：我们将导入的 logout 函数重命名为 apiLogout，以避免与本地的 logout 函数重名
import { login, register, logout as apiLogout, checkAuth } from '../api/auth';


// --- 获取所有需要操作的 DOM 元素 (在 initAuthUI 内部获取和检查) ---
// 这些变量在 initAuthUI 外部声明，以便在其他函数中使用
let authFormsContainer: HTMLElement | null = null;
let loginFormContainer: HTMLElement | null = null;
let signupFormContainer: HTMLElement | null = null;
let showLoginButton: HTMLButtonElement | null = null;
let hideAuthFormsButton: HTMLButtonElement | null = null;
let showSignupLink: HTMLAnchorElement | null = null;
let showLoginLink: HTMLAnchorElement | null = null;
let usernameDisplay: HTMLElement | null = null;
let logoutButton: HTMLButtonElement | null = null;

let loginUsernameInput: HTMLInputElement | null = null;
let loginPasswordInput: HTMLInputElement | null = null;
let loginButton: HTMLButtonElement | null = null;
let loginErrorMessage: HTMLElement | null = null;

let signupUsernameInput: HTMLInputElement | null = null;
let signupPasswordInput: HTMLInputElement | null = null;
let signupButton: HTMLButtonElement | null = null;
let signupErrorMessage: HTMLElement | null = null;

let authStatusElement: HTMLElement | null = null;


// === 函数：显示/隐藏认证表单 ===
function showAuthForms() {
    // 在这里，我们假设 initAuthUI 已经成功运行并找到了元素，所以使用 !
    authFormsContainer!.style.display = 'block';
    // 默认显示登录表单
    showLoginForm();
}

function hideAuthForms() {
    // 使用非空断言
    authFormsContainer!.style.display = 'none';
     // 清空错误信息
     if (loginErrorMessage) loginErrorMessage.textContent = '';
     if (signupErrorMessage) signupErrorMessage.textContent = '';
}

// === 函数：切换显示登录表单 ===
function showLoginForm() {
    // 使用非空断言
    loginFormContainer!.style.display = 'block';
    signupFormContainer!.style.display = 'none';
     // 清空错误信息和输入框 (只清空当前显示的表单，保留另一个表单的输入内容)
     if (loginErrorMessage) loginErrorMessage.textContent = '';
     if (signupErrorMessage) signupErrorMessage.textContent = ''; // 切换时清空另一个的错误
     loginUsernameInput!.value = '';
     loginPasswordInput!.value = '';
}

// === 函数：切换显示注册表单 ===
function showSignupForm() {
    // 使用非空断言
    loginFormContainer!.style.display = 'none';
    signupFormContainer!.style.display = 'block';
     // 清空错误信息和输入框 (只清空当前显示的表单，保留另一个表单的输入内容)
     if (loginErrorMessage) loginErrorMessage.textContent = ''; // 切换时清空另一个的错误
     if (signupErrorMessage) signupErrorMessage.textContent = '';
     signupUsernameInput!.value = '';
     signupPasswordInput!.value = '';
}

// === 函数：更新界面显示用户登录状态 ===
// 这个函数会在 initAuthUI 成功找到元素后被调用，所以内部可以直接使用 !
function updateAuthStatusUI(username: string | null) {
    // 使用非空断言
    if (username) {
        // 已登录状态
        usernameDisplay!.textContent = `欢迎, ${username}`;
        usernameDisplay!.style.display = 'inline';
        logoutButton!.style.display = 'inline';
        showLoginButton!.style.display = 'none'; // 隐藏登录/注册按钮
         authFormsContainer!.style.display = 'none'; // 确保认证表单在登录后隐藏
         authStatusElement!.style.display = 'inline'; // 确保状态区域显示
    } else {
        // 未登录状态
        usernameDisplay!.textContent = ''; // 清空用户名显示
        usernameDisplay!.style.display = 'none';
        logoutButton!.style.display = 'none';
        showLoginButton!.style.display = 'inline'; // 显示登录/注册按钮
         authStatusElement!.style.display = 'inline'; // 确保状态区域显示
    }
}

// === 函数：儲存 token 和 user_id, username 到 localStorage ===
function saveAuthData(token: string, user_id: number, username: string) {
    localStorage.setItem('authToken', token);
    localStorage.setItem('authUserId', user_id.toString()); // localStorage 儲存的是字符串
    localStorage.setItem('authUsername', username); // 儲存用户名
    console.log('Auth data saved to localStorage.');
}

// === 函数：从 localStorage 获取 token ===
function getAuthToken(): string | null {
    return localStorage.getItem('authToken');
}

// === 函数：获取儲存的 user_id ===
function getAuthUserId(): number | null {
    const userId = localStorage.getItem('authUserId');
    const parsedUserId = userId ? parseInt(userId, 10) : NaN;
    return isNaN(parsedUserId) ? null : parsedUserId;
}

// === 函数：获取儲存的用户名 ===
function getAuthUsername(): string | null {
     return localStorage.getItem('authUsername');
}


// === 函数：初始化认证界面及其事件监听器 ===
 function initAuthUI() {
    // === 在初始化函数内部获取 DOM 元素 ===
    authFormsContainer = document.getElementById('auth-forms');
    loginFormContainer = document.getElementById('login-form-container');
    signupFormContainer = document.getElementById('signup-form-container');
    showLoginButton = document.getElementById('show-login-button') as HTMLButtonElement | null;
    hideAuthFormsButton = document.getElementById('hide-auth-forms') as HTMLButtonElement | null;
    showSignupLink = document.getElementById('show-signup-link') as HTMLAnchorElement | null;
    showLoginLink = document.getElementById('show-login-link') as HTMLAnchorElement | null;
    usernameDisplay = document.getElementById('username-display');
    logoutButton = document.getElementById('logout-button') as HTMLButtonElement | null;

    loginUsernameInput = document.getElementById('login-username') as HTMLInputElement | null;
    loginPasswordInput = document.getElementById('login-password') as HTMLInputElement | null;
    loginButton = document.getElementById('login-button') as HTMLButtonElement | null;
    loginErrorMessage = document.getElementById('login-error-message');

    signupUsernameInput = document.getElementById('signup-username') as HTMLInputElement | null;
    signupPasswordInput = document.getElementById('signup-password') as HTMLInputElement | null;
    signupButton = document.getElementById('signup-button') as HTMLButtonElement | null;
    signupErrorMessage = document.getElementById('signup-error-message');

    authStatusElement = document.getElementById('auth-status');


    // === 确保所有关键 DOM 元素都找到了 ===
    if (!authFormsContainer || !loginFormContainer || !signupFormContainer ||
        !showLoginButton || !hideAuthFormsButton || !showSignupLink || !showLoginLink ||
        !usernameDisplay || !logoutButton || !authStatusElement ||
        !loginUsernameInput || !loginPasswordInput || !loginButton || !loginErrorMessage ||
        !signupUsernameInput || !signupPasswordInput || !signupButton || !signupErrorMessage) {
        console.error("Auth UI elements not found! Please check public/index.html IDs.");
        // If critical elements are missing, hide the entire auth status area to avoid empty space
        if(authStatusElement) authStatusElement.style.display = 'none';
        return; // Stop initialization if elements are missing
    }

    // === 如果所有元素都找到了，TypeScript 在这个点之后理论上知道它们不是 null ===
    // 但是为了更明确地告诉编译器和避免错误，我们在访问属性时使用 !

    // === 添加界面切换事件监听器 ===
    showLoginButton.addEventListener('click', showAuthForms);
    hideAuthFormsButton.addEventListener('click', hideAuthForms);

    showSignupLink.addEventListener('click', (event) => {
        event.preventDefault(); // 阻止链接默认跳转
        showSignupForm();
    });

    showLoginLink.addEventListener('click', (event) => {
        event.preventDefault(); // 阻止链接默认跳转
        showLoginForm();
    });


    // === 添加登录按钮点击事件监听器 ===
    loginButton.addEventListener('click', async () => {
        // 在获取值时使用 !
        const username = loginUsernameInput!.value.trim();
        const password = loginPasswordInput!.value.trim();
        loginErrorMessage!.textContent = ''; // 在清空错误信息时使用 !

        // 禁用按钮和输入框
        loginButton!.disabled = true;
        loginUsernameInput!.disabled = true;
        loginPasswordInput!.disabled = true;


        try {
            // 检查用户名和密码是否为空
            if (!username || !password) {
                loginErrorMessage!.textContent = '用户名和密码不能为空';
                return;
            }

            const result = await login(username, password);
            // === 登录成功 ===
            console.log('Login successful:', result);
            console.log('Received token:', result.token);

            // === 儲存 token, user_id 和 username ===
            saveAuthData(result.token, result.user_id, username);

            // === 更新界面显示为已登录状态 ===
            updateAuthStatusUI(username);
            hideAuthForms();

            // === TODO: 触发用户已登录事件 ===

        } catch (error: any) {
            // 登录失败
            console.error('Login failed:', error);
            loginErrorMessage!.textContent = `登录失败: ${error.message || '未知错误'}`; // 在显示错误信息时使用 !
        } finally {
             // 恢复按钮和输入框状态
             loginButton!.disabled = false;
             loginUsernameInput!.disabled = false;
             loginPasswordInput!.disabled = false;
        }
    });

    // === 添加注册按钮点击事件监听器 ===
    signupButton.addEventListener('click', async () => {
        // 在获取值时使用 !
        const username = signupUsernameInput!.value.trim();
        const password = signupPasswordInput!.value.trim();
        signupErrorMessage!.textContent = ''; // 在清空错误信息时使用 !

        // 禁用按钮和输入框
        signupButton!.disabled = true;
        signupUsernameInput!.disabled = true;
        signupPasswordInput!.disabled = true;

        try {
            // 检查用户名和密码是否为空
            if (!username || !password) {
                signupErrorMessage!.textContent = '用户名和密码不能为空';
                return;
            }

            const result = await register(username, password);
            // === 注册成功 ===
            console.log('Signup successful:', result);
            console.log('Received token:', result.token);

            // === 儲存 token, user_id 和 username ===
            saveAuthData(result.token, result.user_id, username);

            // === 更新界面显示为已登录状态 ===
            updateAuthStatusUI(username);
            hideAuthForms();

            // === TODO: 触发用户已登录事件 ===

        } catch (error: any) {
            // 注册失败
            console.error('Signup failed:', error);
            const displayMessage = error.message && error.message.includes('Error injected for testing purposes') ?
                                  '注册失败: 测试错误已触发，请重试' :
                                  `注册失败: ${error.message || '未知错误'}`;
            signupErrorMessage!.textContent = displayMessage; // 在显示错误信息时使用 !
        } finally {
             // 恢复按钮和输入框状态
             signupButton!.disabled = false;
             signupUsernameInput!.disabled = false;
             signupPasswordInput!.disabled = false;
        }
    });


    // === 初始化检查登录状态 ===
    checkLoginStatus();


    // === 添加登出按钮点击事件监听器 ===
    logoutButton!.addEventListener('click', () => { // 使用非空断言
         logout();
         updateAuthStatusUI(null);
         // TODO: 触发用户已登出事件
    });

}

// === 函数：检查登录状态 (从 localStorage 获取 token 并验证) ===
async function checkLoginStatus() {
    const token = getAuthToken();
    const userId = getAuthUserId();
    const username = getAuthUsername();

    // 检查我们是否在 localStorage 中有完整的认证信息
    if (token && userId !== null && username !== null) {
        console.log('Found auth data in localStorage, checking token validity...');
        try {
             const authCheckResult = await checkAuth(token);

             if (authCheckResult.user_id !== null && authCheckResult.user_id === userId) {
                 console.log('Token is valid and matches stored user ID:', userId);
                 updateAuthStatusUI(username);
                 // TODO: 触发用户已登录事件
                 return { userId: userId, username: username, token: token };
             } else {
                 console.log('Token invalid, expired, or does not match stored user ID.');
                 logout();
                 updateAuthStatusUI(null);
                 return null;
             }
        } catch (error) {
             console.error('Error checking auth token validity:', error);
             logout();
             updateAuthStatusUI(null);
             return null;
        }
    } else {
        console.log('No complete auth data found in localStorage, user is not logged in.');
        logout(); // 清除任何不完整的本地认证数据
        updateAuthStatusUI(null);
        return null;
    }
}

// === 本地登出函数 ===
 function logout() {
     localStorage.removeItem('authToken');
     localStorage.removeItem('authUserId');
     localStorage.removeItem('authUsername');
     console.log('User logged out (local data cleared).');
}


// === Export functions ===
export {
    initAuthUI,
    checkLoginStatus,
    getAuthToken,
    getAuthUserId,
    getAuthUsername,
    logout
};
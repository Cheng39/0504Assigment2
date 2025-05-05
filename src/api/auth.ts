// src/api/auth.ts

const API_BASE_URL = 'https://dae-mobile-assignment.hkit.cc/api';

// 注册用户
export async function register(username?: string, password?: string): Promise<{ user_id: number; token: string }> {
    if (!username || !password) {
        // 在发送请求前检查必填字段
        throw new Error('用户名和密码不能为空');
    }

    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });

    // === 改进点 1: 尝试解析 JSON，无论 response.ok 是否为 true ===
    // 先尝试解析 JSON，因为错误信息可能在 body 中
    const data = await response.json();

    if (!response.ok) {
        // === 改进点 1 续: 如果请求失败，优先使用服务器返回的错误信息 ===
        // 如果服务器返回了 { error: string }，则使用它，否则使用通用的 HTTP 错误状态
        const errorMessage = data.error || `HTTP error! status: ${response.status}`;
        console.error('Error registering user:', errorMessage, data); // 打印更多错误信息
        throw new Error(errorMessage);
    }

    // === 改进点 2: 检查成功回应的格式 ===
    // 注册成功后应返回 { user_id: number, token: string }
    if (typeof data.user_id !== 'number' || typeof data.token !== 'string') {
        // 如果格式不符，也抛出错误
        const errorMessage = '注册成功但响应格式不正确';
        console.error(errorMessage, data);
        throw new Error(errorMessage);
    }

    return data; // 返回包含 user_id 和 token 的对象
}

// 登录用户
export async function login(username?: string, password?: string): Promise<{ user_id: number; token: string }> {
     if (!username || !password) {
        // 在发送请求前检查必填字段
        throw new Error('用户名和密码不能为空');
    }

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });

     // === 改进点 1: 尝试解析 JSON，无论 response.ok 是否为 true ===
     const data = await response.json();


    if (!response.ok) {
         // === 改进点 1 续: 如果请求失败，优先使用服务器返回的错误信息 ===
        const errorMessage = data.error || `HTTP error! status: ${response.status}`;
        console.error('Error logging in user:', errorMessage, data); // 打印更多错误信息
        throw new Error(errorMessage);
    }

    // === 改进点 2: 检查成功回应的格式 ===
    // 登录成功后应返回 { user_id: number, token: string }
     if (typeof data.user_id !== 'number' || typeof data.token !== 'string') {
         // 如果格式不符，也抛出错误
         const errorMessage = '登录成功但响应格式不正确';
         console.error(errorMessage, data);
         throw new Error(errorMessage);
     }


    return data; // 返回包含 user_id 和 token 的对象
}


// TODO: 根据作业要求添加检查登录状态的函数 checkAuth (GET /auth/check)
export async function checkAuth(token: string): Promise<{ user_id: number | null }> {
     // API GET /auth/check 需要 Authorization Header
     const response = await fetch(`${API_BASE_URL}/auth/check`, {
         method: 'GET',
         headers: {
             'Authorization': `Bearer ${token}` // 在 Header 中附带 token
         }
     });

     // checkAuth API 在成功时返回 { user_id: number | null }
     // 如果 token 无效或过期，API 可能返回 401 Unauthenticated，body 可能是 { error: "..." }
     // 如果 token 有效，返回 200 OK 和 { user_id: number }

     const data = await response.json();

     if (!response.ok) {
         // 处理非 200 状态码，特别是 401
         const errorMessage = data.error || `HTTP error! status: ${response.status}`;
         console.error('Error checking auth:', errorMessage, data);
         // 对于 401 错误，通常意味着 token 无效，我们可以返回 { user_id: null } 或者抛出特定错误
         // API 规范说回应内容是 { user_id: number | null }，所以如果服务器返回 401 且 body 是 { error: ... }，
         // 我们可能需要根据实际情况决定如何处理，这里先按非 200 都抛错处理
         // 也可以选择在 checkAuth 中不抛出 401 错误，而是返回 { user_id: null }
         // 为了符合 API 规范的回应格式，即使是 401，也尝试返回 { user_id: null }
         if (response.status === 401) {
              console.warn('Auth check failed: Token is invalid or expired.');
              return { user_id: null }; // Token 无效时返回 null
         }
         throw new Error(errorMessage); // 其他非 200 错误则抛出
     }

     // 检查成功回应的格式
     if (typeof data.user_id === 'undefined' || (data.user_id !== null && typeof data.user_id !== 'number')) {
         const errorMessage = '认证检查响应格式不正确';
         console.error(errorMessage, data);
         throw new Error(errorMessage);
     }

     return data; // 返回 { user_id: number | null }
}

// TODO: 添加登出函数 logout (通常不需要调用特定的 API，只需清除本地儲存的 token)
// 可能还需要根据作业要求，决定是否需要调用一个服务器端的登出接口来使 token 失效 (API 规范中没有明确给出登出接口)
// 如果没有登出接口，登出函数只需要清除本地 token 即可。
export function logout() {
     // 移除本地儲存的 token 和 user_id
     localStorage.removeItem('authToken');
     localStorage.removeItem('authUserId');
     // 可能还需要更新 UI，显示为未登录状态
     console.log('User logged out (local token cleared).');
     // 触发一个事件或调用一个函数来更新认证状态相关的 UI
}
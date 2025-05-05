// 引入fetch函数用于发送HTTP请求
export async function register(username: string, password: string) {
    const baseUrl = 'https://dae-mobile-assignment.hkit.cc/api/auth/signup';
    // 构建请求体，包含用户名和密码
    const body = { username, password };
    try {
        // 使用fetch发送POST请求到注册API端点
        const response = await fetch(baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            // 将请求体转换为JSON格式发送
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            // 如果请求失败，根据响应状态码抛出错误
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // 解析响应数据为JSON格式并返回
        const data = await response.json();
        return data;
    } catch (error) {
        // 捕获错误并在控制台打印错误信息
        console.error('Error registering user:', error);
        // 重新抛出错误，让调用者处理
        throw error;
    }
}

export async function login(username: string, password: string) {
    const baseUrl = 'https://dae-mobile-assignment.hkit.cc/api/auth/login';
    const body = { username, password };
    try {
        const response = await fetch(baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error logging in user:', error);
        throw error;
    }
}
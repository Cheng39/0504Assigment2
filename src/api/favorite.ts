// 引入fetch函数用于发送HTTP请求
export async function addToFavorites(attractionId: number) {
    const baseUrl = 'https://dae-mobile-assignment.hkit.cc/api/favorites';
    const body = { attractionId };
    try {
        // 使用fetch发送POST请求到收藏API端点
        const response = await fetch(baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 假设登录后将token存储在localStorage中，这里添加token进行身份验证
                'Authorization': `Bearer ${localStorage.getItem('token')}`
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
        console.error('Error adding to favorites:', error);
        // 重新抛出错误，让调用者处理
        throw error;
    }
}

export async function getFavorites() {
    const baseUrl = 'https://dae-mobile-assignment.hkit.cc/api/favorites';
    try {
        const response = await fetch(baseUrl, {
            headers: {
                // 添加token进行身份验证
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error getting favorites:', error);
        throw error;
    }
}
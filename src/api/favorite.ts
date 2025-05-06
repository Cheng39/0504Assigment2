// src/api/favorite.ts

import { getAuthToken } from '../components/authUI'; // Import the function to get the token

const API_BASE_URL = 'https://dae-mobile-assignment.hkit.cc/api';

// 添加项目到收藏
// API: POST /bookmarks/{item_id}
 async function addToFavorites(itemId: number): Promise<{ message: 'newly bookmarked' | 'already bookmarked' }> {
    // 检查 itemId 是否是数字
    if (typeof itemId !== 'number') {
        throw new Error('Invalid item ID for adding to favorites.');
    }

    // === 获取 Token ===
    const token = getAuthToken();
    if (!token) {
        throw new Error('User not logged in. Cannot add to favorites.'); // 用户未登录不能收藏
    }

    // === 构建正确的 API 端点 URL ===
    // API 规范是 /bookmarks/{item_id}，item_id 放在 URL 路径中
    const url = `${API_BASE_URL}/bookmarks/${itemId}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                // Content-Type 不是必须的，因为没有 request body
                // 'Content-Type': 'application/json', // 可以移除或保留，但没有body时无实际作用

                // === 添加授权 Header ===
                'Authorization': `Bearer ${token}` // 使用获取到的 token
            },
            // === POST /bookmarks/{item_id} 不需要 request body ===
            // body: JSON.stringify({ attractionId }) // 移除这一行
        });

        // === 尝试解析 JSON 响应，无论成功或失败 ===
        const data = await response.json();

        if (!response.ok) {
            // 处理 API 返回的错误信息
            const errorMessage = data.error || `HTTP error! status: ${response.status}`;
            console.error('Error adding to favorites:', errorMessage, data);
            throw new Error(errorMessage);
        }

        // === 检查成功回应的格式 ===
        // 成功应返回 { message: 'newly bookmarked' | 'already bookmarked' }
        if (data.message !== 'newly bookmarked' && data.message !== 'already bookmarked') {
            const errorMessage = 'Add to favorites successful but response format incorrect.';
            console.error(errorMessage, data);
            throw new Error(errorMessage);
        }


        return data; // 返回 { message: ... } 对象

    } catch (error: any) {
        console.error('Network or unexpected error adding to favorites:', error);
        throw error; // 重新抛出错误，让调用者处理
    }
}

// 从收藏中移除项目
// API: DELETE /bookmarks/{item_id}
async function removeFromFavorites(itemId: number): Promise<{ message: 'newly deleted' | 'already deleted' }> {
     // 检查 itemId 是否是数字
    if (typeof itemId !== 'number') {
        throw new Error('Invalid item ID for removing from favorites.');
    }

     // === 获取 Token ===
    const token = getAuthToken();
    if (!token) {
        throw new Error('User not logged in. Cannot remove from favorites.'); // 用户未登录不能操作
    }

     // === 构建正确的 API 端点 URL ===
     // API 规范是 DELETE /bookmarks/{item_id}
     const url = `${API_BASE_URL}/bookmarks/${itemId}`;

     try {
         const response = await fetch(url, {
             method: 'DELETE', // 使用 DELETE 方法
             headers: {
                 // Content-Type 不是必须的，因为没有 request body
                 // 'Content-Type': 'application/json', // 可以移除或保留

                 // === 添加授权 Header ===
                 'Authorization': `Bearer ${token}` // 使用获取到的 token
             },
             // DELETE /bookmarks/{item_id} 不需要 request body
         });

         // === 尝试解析 JSON 响应，无论成功或失败 ===
         const data = await response.json();

         if (!response.ok) {
             // 处理 API 返回的错误信息
             const errorMessage = data.error || `HTTP error! status: ${response.status}`;
             console.error('Error removing from favorites:', errorMessage, data);
             throw new Error(errorMessage);
         }

         // === 检查成功回应的格式 ===
         // 成功应返回 { message: 'newly deleted' | 'already deleted' }
         if (data.message !== 'newly deleted' && data.message !== 'already deleted') {
             const errorMessage = 'Remove from favorites successful but response format incorrect.';
             console.error(errorMessage, data);
             throw new Error(errorMessage);
         }

         return data; // 返回 { message: ... } 对象

     } catch (error: any) {
         console.error('Network or unexpected error removing from favorites:', error);
         throw error; // 重新抛出错误，让调用者处理
     }
}


// 获取当前用户已收藏的项目 ID 列表
// API: GET /bookmarks
async function getFavoriteIds(): Promise<{ item_ids: number[] }> { // 返回类型是 { item_ids: number[] }
     // === 获取 Token ===
    const token = getAuthToken();
    // 注意：作业要求 "整合登入用戶的收藏項目 (5 分)"
    // 这意味着只有登录用户才能获取收藏列表。如果用户未登录，这个函数应该返回空列表或者抛出错误
    // 抛出错误会更明确，或者返回一个特定的状态表示未登录
    // 为了简单和符合 API 要求 Authorization，这里选择在未登录时抛出错误
    if (!token) {
        // 如果用户未登录，直接返回一个空的 item_ids 数组，或者抛出错误
        // 抛出错误可以通知调用者需要先登录
        // return { item_ids: [] }; // 或者返回空列表
        throw new Error('User not logged in. Cannot get favorite list.');
    }


    const url = `${API_BASE_URL}/bookmarks`; // 正确的 GET 收藏列表端点

     try {
         const response = await fetch(url, {
             method: 'GET', // GET 方法
             headers: {
                 // === 添加授权 Header ===
                 'Authorization': `Bearer ${token}` // 使用获取到的 token
             }
         });

         // === 尝试解析 JSON 响应，无论成功或失败 ===
         const data = await response.json();

         if (!response.ok) {
             // 处理 API 返回的错误信息 (包括 401 未授权)
             const errorMessage = data.error || `HTTP error! status: ${response.status}`;
             console.error('Error getting favorite IDs:', errorMessage, data);
             // 对于 401 错误，可能需要通知调用者 token 无效，考虑清除本地 token
             if (response.status === 401) {
                 console.warn('Get favorites failed: Token is invalid or expired.');
                 // TODO: 触发用户登出事件，或直接调用 authUI 的 logout 函数清除本地 token
                 // document.dispatchEvent(new CustomEvent('userLoggedOut'));
                 // 或者直接调用 authUI 的 logout 函数
                 // 这个函数本身不应该直接依赖 authUI 的 logout，
                 // 最好是抛出一个带有特定信息的错误，由调用者（如 FavoriteList 组件或 AttractionList）来处理用户登出
                 throw new Error('Authentication failed. Please log in again.'); // 抛出认证失败错误
             }
             throw new Error(errorMessage); // 其他非 200 错误则抛出
         }

         // === 检查成功回应的格式 ===
         // 成功应返回 { item_ids: number[] }
         if (!Array.isArray(data.item_ids) || !data.item_ids.every((id: any) => typeof id === 'number')) {
             const errorMessage = 'Get favorites successful but response format incorrect.';
             console.error(errorMessage, data);
             throw new Error(errorMessage);
         }

         return data as { item_ids: number[] }; // 返回 { item_ids: [...] } 对象

     } catch (error: any) {
         console.error('Network or unexpected error getting favorite IDs:', error);
         throw error; // 重新抛出错误，让调用者处理
     }
}

// 注意：这里不需要导出 addToFavorites 和 getFavorites，
// 我们需要在需要使用收藏功能的组件（如 FavoriteButton, FavoriteList）中导入并调用它们。
// 根据命名习惯和作业要求，我们可能需要一个 removeFromFavorites 函数

// 导出收藏相关的 API 函数
export {
    addToFavorites,
    removeFromFavorites, // 新增的移除函数
    getFavoriteIds // 修改了名称，更符合 API 返回 item_ids 的含义
};
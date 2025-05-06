// src/components/FavoriteButton.ts

import { showFeedback } from './Feedback';
// 导入收藏相关的 API 函数
import { addToFavorites, removeFromFavorites, getFavoriteIds } from '../api/favorite';
// 导入获取认证 token 的函数
import { getAuthToken } from './authUI';


// --- helper function (可以在这里实现或移动到其他地方) ---
// 用于检查某个景点 ID 是否在给定的已收藏 ID 列表中
function isItemFavorited(itemId: number, favoriteIds: number[]): boolean {
    if (!favoriteIds || favoriteIds.length === 0) {
        return false;
    }
    return favoriteIds.includes(itemId);
}


// --- 函数：创建和设置收藏按钮 ---
// 这个函数现在接收景点ID和该景点是否已在用户的收藏列表中作为参数
function createAndSetupFavoriteButton(attractionId: number, isInitiallyFavorited: boolean) {
    const favoriteButton = document.createElement('button');
    favoriteButton.className = 'favorite-button'; // 给按钮添加一个类名，方便后续查找和更新
    favoriteButton.dataset.attractionId = attractionId.toString(); // 将景点ID存储在data属性中

    // === 根据初始状态设置按钮文本和类名 ===
    if (isInitiallyFavorited) {
        favoriteButton.textContent = '已收藏';
        favoriteButton.classList.add('favorited'); // 添加 'favorited' 类
    } else {
        favoriteButton.textContent = '收藏';
        favoriteButton.classList.remove('favorited'); // 确保没有 'favorited' 类
    }

    // === 检查用户登录状态并设置按钮的可用性 ===
    const token = getAuthToken(); // 获取当前用户的认证 token
    if (!token) {
        // 如果用户未登录
        favoriteButton.disabled = true; // 禁用按钮
        // 可以选择改变按钮文本或样式，提示用户需要登录才能收藏
        // favoriteButton.textContent = '登录收藏';
        favoriteButton.classList.add('logged-out'); // 添加 'logged-out' 类
    } else {
         // 如果用户已登录
         favoriteButton.disabled = false; // 启用按钮
         favoriteButton.classList.remove('logged-out'); // 移除 'logged-out' 类
    }


    // === 添加点击事件监听器，实现收藏/取消收藏切换逻辑 ===
    favoriteButton.addEventListener('click', async () => {
        // 在 API 调用期间禁用按钮，防止重复点击
        favoriteButton.disabled = true;

        // 检查按钮当前的收藏状态 (通过是否有 'favorited' 类)
        const currentFavoritedStatus = favoriteButton.classList.contains('favorited');

        try {
            if (currentFavoritedStatus) {
                // 当前是“已收藏”状态，点击则执行取消收藏
                console.log(`Attempting to remove item ${attractionId} from favorites.`);
                const result = await removeFromFavorites(attractionId); // 调用取消收藏 API
                console.log('Remove from favorites successful:', result);
                showFeedback('已取消收藏', 'success', document.body); // 显示成功反馈

                // 更新按钮状态为“收藏”
                favoriteButton.textContent = '收藏';
                favoriteButton.classList.remove('favorited'); // 移除 'favorited' 类

            } else {
                // 当前是“收藏”状态，点击则执行添加到收藏
                console.log(`Attempting to add item ${attractionId} to favorites.`);
                const result = await addToFavorites(attractionId); // 调用添加到收藏 API
                console.log('Add to favorites successful:', result);
                 showFeedback('已成功添加到收藏', 'success', document.body); // 显示成功反馈

                 // 更新按钮状态为“已收藏”
                 favoriteButton.textContent = '已收藏';
                 favoriteButton.classList.add('favorited'); // 添加 'favorited' 类
            }

        } catch (error: any) {
            // 处理 API 调用中发生的错误
            console.error('Favorite action failed for item', attractionId, ':', error);
            // 显示失败反馈
            showFeedback(`收藏操作失败: ${error.message || '未知错误'}`, 'error', document.body);

            // 如果错误是由于认证失败 (例如 token 过期)，可以提示用户登录
            if (error.message.includes('User not logged in') || error.message.includes('Authentication failed')) {
                 showFeedback('请登录后进行收藏操作', 'error', document.body);
                 // 认证失败时，按钮应该保持禁用状态直到用户登录
                 favoriteButton.disabled = true;
                 favoriteButton.classList.add('logged-out'); // 确保是未登录样式
            }

        } finally {
            // API 调用完成后，重新检查登录状态并设置按钮的可用性
            const token = getAuthToken();
             if (token) {
                favoriteButton.disabled = false; // 如果已登录，重新启用按钮
            } else {
                 // 如果未登录，确保按钮仍然是禁用的
                 favoriteButton.disabled = true;
            }
        }
    });

    return favoriteButton; // 返回创建好的按钮元素
}

// --- 函数：初始化收藏按钮并添加到容器 ---
// 这个函数被 AttractionList 调用，负责创建按钮并将其添加到 DOM
// 它现在需要接收景点ID和该景点是否已收藏的初始状态
function initFavoriteButton(attractionId: number, container: HTMLElement, isInitiallyFavorited: boolean) {
    // 调用 createAndSetupFavoriteButton 创建并设置好按钮
    const favoriteButton = createAndSetupFavoriteButton(attractionId, isInitiallyFavorited);
    // 将按钮添加到指定的容器元素中
    container.appendChild(favoriteButton);
}


// === TODO: 实现用户登录/登出后批量更新按钮状态的逻辑 (可选但推荐) ===
// 当用户登录或登出时，页面上所有景点项目的收藏按钮状态可能需要刷新。
// 这可以通过监听自定义事件（如 'userLoggedIn', 'userLoggedOut'）来实现。
// 在 AttractionList.ts 或主应用入口文件中监听这些事件，然后调用一个函数来更新所有按钮。
// 这个更新函数需要重新获取所有按钮元素，然后重新检查它们的收藏状态并更新 UI。

/*
// 示例：一个用于批量更新页面上所有收藏按钮状态的函数
// 这个函数可能放在 authUI.ts 或者一个负责管理全局状态的模块中
// 它需要在用户登录和登出事件发生时被调用
async function updateAllFavoriteButtonsOnPage() {
    const token = getAuthToken();
    const buttons = document.querySelectorAll('.favorite-button') as NodeListOf<HTMLButtonElement>; // 获取页面上所有带有 'favorite-button' 类的按钮

    if (!token) {
        // 如果用户未登录，将所有按钮设置为未收藏和禁用状态
        buttons.forEach(button => {
            button.textContent = '收藏'; // 或 '登录收藏'
            button.classList.remove('favorited');
            button.disabled = true;
            button.classList.add('logged-out');
        });
         console.log('All favorite buttons updated to logged out state.');
    } else {
        // 如果用户已登录，需要获取该用户的收藏列表
        try {
            const favoriteIdsData = await getFavoriteIds(); // 获取当前用户的收藏ID列表
            const favoriteIds = favoriteIdsData.item_ids;
             console.log('Fetched favorite IDs for updating buttons:', favoriteIds);

            // 遍历所有收藏按钮，根据收藏列表更新状态
            buttons.forEach(button => {
                const attractionId = parseInt(button.dataset.attractionId || '0', 10); // 从data属性获取景点ID
                const isFavorited = favoriteIds.includes(attractionId); // 检查是否在收藏列表中

                // 启用按钮，移除未登录状态样式
                button.disabled = false;
                button.classList.remove('logged-out');

                // 根据是否收藏设置按钮状态
                if (isFavorited) {
                    button.textContent = '已收藏';
                    button.classList.add('favorited');
                } else {
                    button.textContent = '收藏';
                    button.classList.remove('favorited');
                }
            });
             console.log('All favorite buttons updated based on favorite IDs.');

        } catch (error) {
            console.error("Failed to update favorite button states after login:", error);
            // 获取收藏列表失败时，可以将所有按钮设置为未收藏，并提示用户
            buttons.forEach(button => {
                 button.textContent = '收藏'; // 或 '加载收藏失败'
                 button.classList.remove('favorited');
                 button.disabled = false; // 保持可用，但状态可能不准确
                 button.classList.remove('logged-out');
            });
             showFeedback('加载收藏状态失败', 'warning', document.body);

            // 如果错误是由于认证失败，可能需要触发登出流程
            if (error.message.includes('Authentication failed')) {
                 // TODO: Trigger user logged out event
                 // document.dispatchEvent(new CustomEvent('userLoggedOut'));
             }
        }
    }
}
*/


// === 导出函数 ===
// 导出 initFavoriteButton 供 AttractionList 使用
// 如果实现了批量更新函数，也需要导出它供登录/登出事件监听器使用
export { initFavoriteButton };
// export { initFavoriteButton, updateAllFavoriteButtonsOnPage };
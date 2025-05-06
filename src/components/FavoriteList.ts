// src/components/FavoriteList.ts

// 导入获取收藏项目 ID 列表的函数
import { getFavoriteIds } from '../api/favorite';
// 导入认证相关的函数 (获取 token, 检查登录状态等)
import { getAuthToken, checkLoginStatus } from './authUI';
// 导入获取单个景点详细信息的函数
import { getAttractionDetails } from '../api/fetchAttractions';


// --- Helper function: 创建单个收藏景点详情的 DOM 元素 ---
// 这个函数接收一个完整的景点详细信息对象，创建用于显示的 DOM 元素
function createFavoriteAttractionElement(attraction: any) {
    const attractionDiv = document.createElement('div');
    attractionDiv.className = 'favorite-item'; // 添加一个类名方便样式

    // --- 创建景点详情元素 (与 AttractionList 中的类似) ---
    const title = document.createElement('h2');
    const description = document.createElement('p');
    const image = document.createElement('img');
    const video = document.createElement('video');
    // 你可能想在这里添加一个“取消收藏”按钮
    const removeButton = document.createElement('button');


    title.textContent = attraction.title;
    // 注意：如果 description 包含 HTML，可能需要使用 innerHTML
    description.textContent = attraction.description; // 或者 description.innerHTML = attraction.description;
    image.src = attraction.imageUrl;
    image.alt = attraction.title; // 添加 alt 属性增加可访问性

    if (attraction.videoUrl) {
         video.src = attraction.videoUrl;
         video.controls = true; // 添加视频控制条
         // 如果视频加载失败则隐藏
         video.addEventListener('error', () => {
             console.warn(`Failed to load video for favorite attraction ${attraction.id}: ${attraction.videoUrl}`);
             video.style.display = 'none';
         });
    } else {
         video.style.display = 'none'; // 如果没有视频 URL，则隐藏视频元素
    }

    // TODO: 添加取消收藏按钮的逻辑
    removeButton.textContent = '取消收藏';
    // 导入 removeFromFavorites 函数
    // import { removeFromFavorites } from '../api/favorite'; // 在文件顶部导入
    removeButton.addEventListener('click', async () => {
        // 实现取消收藏逻辑
        const confirmRemove = confirm(`确定要取消收藏景点 "${attraction.title}" 吗？`);
        if (!confirmRemove) return; // 如果用户取消，则不执行

        removeButton.disabled = true; // 禁用按钮防止重复点击

        try {
            // 调用 removeFromFavorites API
            // 确保你在文件顶部导入了 removeFromFavorites
            const { removeFromFavorites } = await import('../api/favorite'); // 动态导入确保能访问到
            await removeFromFavorites(attraction.id); // 调用取消收藏 API，传入景点 ID

            console.log(`Removed item ${attraction.id} from favorites.`);
            // showFeedback('已取消收藏', 'success', document.body); // 显示成功反馈 (确保 Feedback 模块可用)

            // 从 DOM 中移除这个景点元素
            attractionDiv.remove();

             // 检查列表是否变空，显示提示信息
             checkIfFavoriteListEmpty();

        } catch (error: any) {
            console.error('Failed to remove favorite:', error);
            // showFeedback(`取消收藏失败: ${error.message || '未知错误'}`, 'error', document.body); // 显示失败反馈
             alert(`取消收藏失败: ${error.message || '未知错误'}`); // 或者使用简单的 alert

        } finally {
             removeButton.disabled = false; // 恢复按钮可用状态 (即使失败也恢复)
        }
    });


    // 将元素添加到景点项目 div 中
    attractionDiv.appendChild(title);
    attractionDiv.appendChild(description);
    attractionDiv.appendChild(image);
    if (attraction.videoUrl && video.style.display !== 'none') {
         attractionDiv.appendChild(video);
    }
     attractionDiv.appendChild(removeButton); // 添加取消收藏按钮


    return attractionDiv; // 返回创建好的 DOM 元素
}

// Helper 函数：检查收藏列表容器是否变空，并显示提示信息
function checkIfFavoriteListEmpty() {
    const app = document.getElementById('app');
    if (app) {
        const favoriteItemsContainer = app.querySelector('#favorite-items-container');
        // 如果容器存在且里面没有子元素
        if (favoriteItemsContainer && favoriteItemsContainer.children.length === 0) {
            // 检查 #app 容器中是否已经有空列表提示信息，避免重复添加
            if (!app.querySelector('#empty-favorites-message')) {
                 const emptyMessage = document.createElement('p');
                 emptyMessage.id = 'empty-favorites-message'; // 给提示信息一个 ID
                 emptyMessage.textContent = '您还没有收藏任何景点。';
                 app.appendChild(emptyMessage);
            }
        }
    }
}


// === 函数：初始化并显示收藏列表视图 ===
// 这个函数在点击“收藏列表”导航时被调用
async function initFavoriteList() {
    const app = document.getElementById('app'); // 获取 #app 容器
    if (!app) return;

    // 清空 #app 容器的所有现有内容，并显示加载指示器
    app.innerHTML = '';
    const loader = document.createElement('div');
    loader.className = 'loader'; // 需要对应的 CSS 样式
    loader.textContent = '加载收藏列表...'; // 加载文本提示
    app.appendChild(loader);

    // --- 检查用户是否登录 ---
    // 收藏列表只对登录用户可见
    const token = getAuthToken(); // 从 authUI.ts 获取 token
    if (!token) {
        // 用户未登录
        console.log('User is not logged in. Cannot display favorite list.');
        app.innerHTML = '<p>请登录后查看您的收藏列表。</p>'; // 显示登录提示信息
        // 移除加载器
        if (loader && loader.parentNode) loader.remove();
        return; // 未登录则停止执行
    }

    // --- 用户已登录，尝试获取收藏项目 ID 列表 ---
    let favoriteItemIds: number[] = [];
    try {
        console.log('Fetching favorite item IDs...');
        // 调用 API 获取当前用户已收藏的景点 ID 列表
        const favoriteIdsData = await getFavoriteIds(); // 确保你在文件顶部导入了 getFavoriteIds
        favoriteItemIds = favoriteIdsData.item_ids; // 获取 ID 数组
        console.log('Favorite item IDs fetched:', favoriteItemIds);

        // 如果用户没有收藏任何项目
        if (!favoriteItemIds || favoriteItemIds.length === 0) {
            console.log('User has no favorite items.');
            app.innerHTML = '<p>您还没有收藏任何景点。</p>'; // 显示空列表提示信息
             // 移除加载器
            if (loader && loader.parentNode) loader.remove();
            return; // 如果没有收藏项目则停止执行
        }

        // === 获取收藏的每个项目的详细信息 ===
        console.log('Fetching details for favorite items...');
        // 对于每个收藏的 ID，调用 getAttractionDetails 函数获取详细信息
        // 使用 Promise.allSettled 来并行加载所有详细信息，并处理单个加载失败的情况
        const favoriteAttractionDetailsPromises = favoriteItemIds.map(itemId =>
            // 确保你在文件顶部导入了 getAttractionDetails
            getAttractionDetails(itemId) // 调用 getAttractionDetails，传入单个项目 ID
        );

        // 等待所有详细信息获取 Promise 完成
        const results = await Promise.allSettled(favoriteAttractionDetailsPromises);

        const favoriteAttractions: any[] = []; // 存储成功获取详细信息的景点对象
        const failedFetches: { id: number; error: any }[] = []; // 存储加载详情失败的项目 ID 和错误

        // 处理 Promise.allSettled 的结果
        results.forEach((result, index) => {
            const itemId = favoriteItemIds[index]; // 获取原始的景点 ID
            if (result.status === 'fulfilled') {
                // 成功获取到景点详细信息
                favoriteAttractions.push(result.value); // 将景点详细信息添加到数组
            } else {
                // 获取景点详细信息失败
                console.error(`Failed to fetch details for favorite item ID ${itemId}:`, result.reason);
                failedFetches.push({ id: itemId, error: result.reason }); // 记录失败的项目
            }
        });

        // === 渲染收藏景点的详细信息列表 ===
        console.log('Rendering favorite attractions:', favoriteAttractions);
        app.innerHTML = ''; // 清除加载器 (或之前的任何内容)

        if (favoriteAttractions.length > 0) {
             // 如果有成功获取到详细信息的景点
             const favoriteItemsContainer = document.createElement('div');
             favoriteItemsContainer.id = 'favorite-items-container'; // 给收藏项目列表容器一个 ID
             // 遍历成功获取的景点详细信息，创建并追加 DOM 元素
             favoriteAttractions.forEach(attraction => {
                 const attractionElement = createFavoriteAttractionElement(attraction); // 调用创建元素函数
                 favoriteItemsContainer.appendChild(attractionElement); // 追加到容器
             });
             app.appendChild(favoriteItemsContainer); // 将容器添加到 #app


             // 显示加载详情失败的警告信息 (如果存在失败的项目)
             if (failedFetches.length > 0) {
                 const warningMessage = document.createElement('p');
                 warningMessage.style.color = 'orange';
                 warningMessage.textContent = `警告: 部分收藏项目 (${failedFetches.map(f => f.id).join(', ')}) 详情加载失败。`;
                 app.appendChild(warningMessage);
             }

             // 检查渲染后的列表是否为空 (虽然有成功项目，但可能所有都失败了，尽管上面 if 已经判断了 > 0)
             // 这个检查主要是为了在取消收藏后再次使用
             // checkIfFavoriteListEmpty(); // 这一步主要用于取消收藏后检查，初次渲染时不在这里调用


        } else {
             // 如果没有成功获取到任何收藏项目的详细信息 (即使 getFavoriteIds 返回了 ID 列表)
             console.warn('No favorite attraction details were successfully loaded.');
             app.innerHTML = '<p>加载收藏详情失败。</p>'; // 显示一个通用的加载失败提示
             // 如果有获取 ID 列表但加载详情全部失败的情况，可以添加更具体的错误信息
             if (failedFetches.length > 0) {
                 const warningMessage = document.createElement('p');
                 warningMessage.style.color = 'red';
                 warningMessage.textContent = `错误: 无法加载任何收藏详情。`;
                 app.appendChild(warningMessage);
             }
        }


    } catch (error: any) {
        // 处理获取收藏 ID 列表本身失败的错误
        console.error('Failed to fetch favorite list (getFavoriteIds):', error);
        app.innerHTML = '<p>加载收藏列表失败。</p>'; // 显示一个通用的加载列表失败提示
        // 如果 getFavoriteIds 抛出认证失败错误 (401)，authUI 中的 checkLoginStatus 或相应的事件监听器会处理用户登出
        // 在这里显示具体的错误信息
        const errorMessage = document.createElement('p');
         errorMessage.style.color = 'red';
         errorMessage.textContent = `错误: ${error.message || '未知错误'}`;
         app.appendChild(errorMessage);
    } finally {
        // 确保加载器在所有操作完成后被移除
         if (loader && loader.parentNode) loader.remove();
         // loader = null; // 清空引用
    }
}


// === 导出函数 ===
// 导出 initFavoriteList，供 AttractionList 或其他需要显示收藏列表的地方调用
export { initFavoriteList };
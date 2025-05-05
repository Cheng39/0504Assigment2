// src/components/FavoriteList.ts

import { getFavorites } from '../api/favorite';

// 创建收藏列表元素 - 这个函数保持不变，它负责获取数据和生成列表或错误信息
async function createFavoriteList() {
    const favoriteList = document.createElement('div');
    favoriteList.id = 'favorite-list-content'; // 给容器一个ID，方便查找
    try {
        const data = await getFavorites();
        const favorites = data.items;

        // 添加一个标题或标识
        const listTitle = document.createElement('h2');
        listTitle.textContent = '我的收藏';
        favoriteList.appendChild(listTitle);


        if (favorites.length === 0) {
            const noFavorites = document.createElement('p');
            noFavorites.textContent = '您还没有收藏任何景点。';
            favoriteList.appendChild(noFavorites);
        } else {
            favorites.forEach((favorite: any) => {
                const favoriteDiv = document.createElement('div');
                favoriteDiv.className = 'favorite-item'; // 添加类名方便样式
                const title = document.createElement('h3'); // 列表项标题用 h3
                const description = document.createElement('p');
                const image = document.createElement('img');

                title.textContent = favorite.title;
                // 注意：如果 description 包含 HTML，可能需要使用 innerHTML
                description.textContent = favorite.description; // 或者 description.innerHTML = favorite.description;
                image.src = favorite.imageUrl;
                image.alt = favorite.title;
                image.style.maxWidth = '100px'; // 示例样式，限制图片大小

                favoriteDiv.appendChild(title);
                favoriteDiv.appendChild(description);
                favoriteDiv.appendChild(image);

                favoriteList.appendChild(favoriteDiv);
            });
        }
    } catch (error: any) {
        // 处理数据获取错误，将错误信息添加到这个列表中
        const errorDiv = document.createElement('div');
        errorDiv.textContent = `错误: 加载收藏列表失败 - ${error.message}`;
        favoriteList.innerHTML = ''; // 清空之前的标题或任何内容
        favoriteList.appendChild(errorDiv); // 添加错误信息到容器中
        console.error('Failed to fetch favorites:', error); // 打印错误到控制台
    }
    return favoriteList; // 总是返回包含内容（列表或错误）的容器 div
}

// 初始化收藏列表 - 修改这里
async function initFavoriteList() {
    const app = document.getElementById('app'); // 获取 #app 容器
    if (app) {
        // === 第一步：清空 #app 容器的所有现有内容 ===
        // 这会移除之前显示的景点列表、加载指示器或任何其他内容
        app.innerHTML = ''; // 一个简单有效的方法

        // === 第二步：添加一个加载指示器（可选，用于更好的用户体验）===
        const loading = document.createElement('div');
        loading.className = 'loader'; // 假设你有一个 loader 的 CSS 样式
        loading.textContent = '加载收藏列表中...'; // 加载文本提示
        app.appendChild(loading); // 将加载器添加到 #app 中

        try {
            // === 第三步：创建收藏列表内容（等待数据获取和元素创建）===
            // createFavoriteList 函数会负责获取数据，并在出错时将错误信息放在返回的 div 里
            const favoriteListContent = await createFavoriteList();

            // === 第四步：清空加载指示器 ===
            // 因为 createFavoriteList 已经完成了，不再需要加载指示器
            app.innerHTML = '';

            // === 第五步：将创建好的收藏列表内容添加到 #app 容器中 ===
            // favoriteListContent 要么是收藏列表，要么是包含错误信息的 div
            app.appendChild(favoriteListContent);

        } catch (error: any) {
             // 这个 catch 块主要用于捕获 createFavoriteList 函数内部未能处理的异常
             // 但通常情况下，createFavoriteList 内部的 try/catch 已经处理了数据获取错误
             console.error('Unexpected error during favorite list initialization:', error);
             app.innerHTML = '<p>初始化收藏列表时发生未知错误。</p>'; // 显示一个通用的错误提示
        }
    } else {
        console.error('#app container not found');
    }
}

export { initFavoriteList };
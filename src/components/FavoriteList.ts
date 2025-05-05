import { getFavorites } from '../api/favorite';

// 创建收藏列表元素
async function createFavoriteList() {
    const favoriteList = document.createElement('div');
    try {
        const data = await getFavorites();
        const favorites = data.items;
        if (favorites.length === 0) {
            const noFavorites = document.createElement('p');
            noFavorites.textContent = '您还没有收藏任何景点。';
            favoriteList.appendChild(noFavorites);
        } else {
            favorites.forEach((favorite: any) => {
                const favoriteDiv = document.createElement('div');
                const title = document.createElement('h2');
                const description = document.createElement('p');
                const image = document.createElement('img');

                title.textContent = favorite.title;
                description.textContent = favorite.description;
                image.src = favorite.imageUrl;
                image.alt = favorite.title;

                favoriteDiv.appendChild(title);
                favoriteDiv.appendChild(description);
                favoriteDiv.appendChild(image);

                favoriteList.appendChild(favoriteDiv);
            });
        }
    } catch (error: any) {
        const errorDiv = document.createElement('div');
        errorDiv.textContent = `错误: ${error.message}`;
        favoriteList.appendChild(errorDiv);
    }
    return favoriteList;
}

// 初始化收藏列表
async function initFavoriteList() {
    const app = document.getElementById('app');
    if (app) {
        const loading = document.createElement('div');
        loading.textContent = '加载收藏列表中...';
        app.appendChild(loading);
        const favoriteList = await createFavoriteList();
        app.replaceChild(favoriteList, loading);
    }
}

export { initFavoriteList };
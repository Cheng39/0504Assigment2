import { addToFavorites } from '../api/favorite';
import { showFeedback } from './Feedback';

function createFavoriteButton(attractionId: number) {
    const favoriteButton = document.createElement('button');
    favoriteButton.textContent = '收藏';
    favoriteButton.addEventListener('click', async () => {
        try {
            await addToFavorites(attractionId);
            // 添加成功反馈提示
            showFeedback('已成功添加到收藏', 'success', document.body);
            favoriteButton.textContent = '已收藏';
            favoriteButton.disabled = true;
        } catch (error: any) {
            // 添加失败反馈提示
            showFeedback('添加到收藏失败，请重试', 'error', document.body);
            console.error('添加到收藏失败:', error.message);
        }
    });
    return favoriteButton;
}

function initFavoriteButton(attractionId: number, container: HTMLElement) {
    const favoriteButton = createFavoriteButton(attractionId);
    container.appendChild(favoriteButton);
}

export { initFavoriteButton };
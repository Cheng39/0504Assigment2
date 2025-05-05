function createShareButton(attraction: any) {
    const shareButton = document.createElement('button');
    shareButton.textContent = '分享';

    shareButton.addEventListener('click', async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: attraction.title,
                    text: attraction.description,
                    url: window.location.href // 假设当前页面链接可用于分享
                });
                console.log('分享成功');
            } catch (error) {
                console.error('分享失败:', error);
            }
        } else {
            console.log('当前浏览器不支持分享 API');
        }
    });

    return shareButton;
}

function initShareButton(attraction: any, container: HTMLElement) {
    const shareButton = createShareButton(attraction);
    container.appendChild(shareButton);
}

export { initShareButton };
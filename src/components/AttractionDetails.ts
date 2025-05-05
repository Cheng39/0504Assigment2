import { getAttractionDetails } from '../api/fetchAttractions';

async function createAttractionDetails(attractionId: number) {
    const detailsDiv = document.createElement('div');
    try {
        const data = await getAttractionDetails(attractionId);
        const title = document.createElement('h2');
        const description = document.createElement('p');
        const image = document.createElement('img');
        const video = document.createElement('video');

        title.textContent = data.title;
        description.textContent = data.description;
        image.src = data.imageUrl;
        image.alt = data.title;
        video.src = data.videoUrl;
        video.controls = true;

        detailsDiv.appendChild(title);
        detailsDiv.appendChild(description);
        detailsDiv.appendChild(image);
        detailsDiv.appendChild(video);
    } catch (error: any) {
        const errorDiv = document.createElement('div');
        errorDiv.textContent = `错误: ${error.message}`;
        detailsDiv.appendChild(errorDiv);
    }
    return detailsDiv;
}

async function initAttractionDetails(attractionId: number) {
    const app = document.getElementById('app');
    if (app) {
        const loading = document.createElement('div');
        loading.textContent = '加载景点详情中...';
        app.appendChild(loading);
        const detailsDiv = await createAttractionDetails(attractionId);
        app.replaceChild(detailsDiv, loading);
    }
}

export { initAttractionDetails };
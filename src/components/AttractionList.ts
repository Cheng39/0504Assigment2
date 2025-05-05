import { getAttractions } from '../api/fetchAttractions';
import { initFavoriteButton } from './FavoriteButton';
import { initAttractionDetails } from './AttractionDetails';
import { initPagination } from './Pagination';
import { initShareButton } from './shareButton';

function displayAttractions(attractions: any[], pagination: any) {
    const attractionList = document.createElement('div');
    attractions.forEach((attraction) => {
        const attractionDiv = document.createElement('div');
        const title = document.createElement('h2');
        const description = document.createElement('p');
        const image = document.createElement('img');
        const video = document.createElement('video');
        const detailsButton = document.createElement('button');

        title.textContent = attraction.title;
        description.textContent = attraction.description;
        image.src = attraction.imageUrl;
        image.alt = attraction.title;
        video.src = attraction.videoUrl;
        video.controls = true;
        detailsButton.textContent = '查看详情';

        detailsButton.addEventListener('click', () => {
            initAttractionDetails(attraction.id);
        });

        attractionDiv.appendChild(title);
        attractionDiv.appendChild(description);
        attractionDiv.appendChild(image);
        attractionDiv.appendChild(video);
        initFavoriteButton(attraction.id, attractionDiv);
        attractionDiv.appendChild(detailsButton);

        // 添加分享按钮
        initShareButton(attraction, attractionDiv);

        attractionList.appendChild(attractionDiv);
    });

    const paginationInfoDiv = document.createElement('div');
    const pageInfo = document.createElement('p');
    const limitInfo = document.createElement('p');
    const totalInfo = document.createElement('p');

    pageInfo.textContent = `当前页: ${pagination.page}`;
    limitInfo.textContent = `每页数量: ${pagination.limit}`;
    totalInfo.textContent = `总数量: ${pagination.total}`;

    paginationInfoDiv.appendChild(pageInfo);
    paginationInfoDiv.appendChild(limitInfo);
    paginationInfoDiv.appendChild(totalInfo);

    attractionList.appendChild(paginationInfoDiv);

    // 添加分页导航组件
    initPagination(pagination);

    return attractionList;
}

function updateAttractionList(attractions: any[], pagination: any) {
    const app = document.getElementById('app');
    if (app) {
        const attractionList = displayAttractions(attractions, pagination);
        const existingList = app.querySelector('#attraction-list');
        if (existingList) {
            app.replaceChild(attractionList, existingList);
        } else {
            app.appendChild(attractionList);
        }
    }
}

async function initAttractionList() {
    const app = document.getElementById('app');
    if (app) {
        const loader = document.createElement('div');
        loader.className = 'loader';
        loader.style.display = 'block';
        app.appendChild(loader);

        try {
            const data = await getAttractions();
            const attractions = data.items;
            const pagination = data.pagination;
            const attractionList = displayAttractions(attractions, pagination);
            app.replaceChild(attractionList, loader);
        } catch (error: any) {
            const errorDiv = document.createElement('div');
            errorDiv.textContent = `错误: ${error.message}`;
            app.replaceChild(errorDiv, loader);
        }
    }
}

export { initAttractionList, updateAttractionList };
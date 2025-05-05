import { getAttractions } from '../api/fetchAttractions';
import { updateAttractionList } from './AttractionList';

function createPagination(pagination: any) {
    const paginationDiv = document.createElement('div');
    paginationDiv.style.textAlign = 'center';
    paginationDiv.style.margin = '10px';

    const prevButton = document.createElement('button');
    prevButton.textContent = '上一页';
    prevButton.disabled = pagination.page === 1;

    const nextButton = document.createElement('button');
    nextButton.textContent = '下一页';
    nextButton.disabled = pagination.page === Math.ceil(pagination.total / pagination.limit);

    prevButton.addEventListener('click', async () => {
        const newPage = pagination.page - 1;
        try {
            const data = await getAttractions(newPage);
            const attractions = data.items;
            const newPagination = data.pagination;
            updateAttractionList(attractions, newPagination);
        } catch (error: any) {
            console.error('Error fetching previous page:', error.message);
        }
    });

    nextButton.addEventListener('click', async () => {
        const newPage = pagination.page + 1;
        try {
            const data = await getAttractions(newPage);
            const attractions = data.items;
            const newPagination = data.pagination;
            updateAttractionList(attractions, newPagination);
        } catch (error: any) {
            console.error('Error fetching next page:', error.message);
        }
    });

    paginationDiv.appendChild(prevButton);
    paginationDiv.appendChild(nextButton);
    return paginationDiv;
}

function initPagination(pagination: any) {
    const app = document.getElementById('app');
    if (app) {
        const paginationDiv = createPagination(pagination);
        app.appendChild(paginationDiv);
    }
}

export { initPagination };
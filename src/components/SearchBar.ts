import { getAttractions } from '../api/fetchAttractions';
import { showFeedback } from './Feedback';
import { updateAttractionList } from './AttractionList';

function createSearchBar() {
    const searchBar = document.createElement('div');
    const input = document.createElement('input');
    const button = document.createElement('button');

    input.type = 'text';
    input.placeholder = '搜索景点名称或特色...';
    button.textContent = '搜索';

    searchBar.appendChild(input);
    searchBar.appendChild(button);

    return searchBar;
}

function initSearchBar() {
    const app = document.getElementById('app');
    if (app) {
        const searchBar = createSearchBar();
        app.insertBefore(searchBar, app.firstChild);

        const input = searchBar.querySelector('input') as HTMLInputElement;
        const button = searchBar.querySelector('button') as HTMLButtonElement;

        button.addEventListener('click', async () => {
            const search = input.value;
            const loader = document.createElement('div');
            loader.className = 'loader';
            loader.style.display = 'block';
            app.appendChild(loader);

            try {
                const data = await getAttractions(1, search);
                const attractions = data.items;
                const pagination = data.pagination;
                if (attractions.length === 0) {
                    showFeedback('未找到相关景点，请更换关键词重试', 'error', app);
                } else {
                    updateAttractionList(attractions, pagination);
                }
            } catch (error: any) {
                showFeedback('搜索失败，请重试', 'error', app);
                const errorDiv = document.createElement('div');
                errorDiv.textContent = `错误: ${error.message}`;
                app.appendChild(errorDiv);
            } finally {
                app.removeChild(loader);
            }
        });
    }
}

export { initSearchBar };
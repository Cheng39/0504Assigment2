// src/components/AttractionList.ts

import { getAttractions } from '../api/fetchAttractions';
import { initFavoriteButton } from './FavoriteButton';
import { initAttractionDetails } from './AttractionDetails';
// 移除对 Pagination 的导入，我们将在这里处理加载更多按钮
// import { initPagination } from './Pagination';
import { initShareButton } from './shareButton';
import '../styles/styles.css'; // 引入 CSS (确保路径正确)
import { initAuthUI } from './authUI'; // 确认这一行存在且没有被注释

// --- 引入并管理当前页码状态 ---
let currentPage = 0; // 初始化页码为 0，第一次加载会将其设为 1

// --- 现有函数 displayAttractions (略有修改以返回列表容器和分页信息) ---

// 修改 displayAttractions，让它只创建景点列表项，不包含分页信息和按钮
// 返回 { listElement: div, paginationInfoElement: div }
function createAttractionListItems(attractions: any[]) {
    const attractionListContainer = document.createElement('div');
    attractionListContainer.className = 'attraction-list-items'; // 给列表项容器一个类名

    attractions.forEach((attraction) => {
        const attractionDiv = document.createElement('div');
        attractionDiv.className = 'attraction-item'; // 可以给一个类名方便样式

        // --- 创建景点详情元素 (与之前 displayAttractions 类似) ---
        const title = document.createElement('h2');
        const description = document.createElement('p');
        const image = document.createElement('img');
        const video = document.createElement('video');
        const detailsButton = document.createElement('button');

        title.textContent = attraction.title;
        description.textContent = attraction.description; // 或者 innerHTML = ...
        image.src = attraction.imageUrl;
        image.alt = attraction.title;

        if (attraction.videoUrl) {
             video.src = attraction.videoUrl;
             video.controls = true;
        } else {
             video.style.display = 'none'; // 或者不创建 video 元素
        }

        detailsButton.textContent = '查看详情';
        detailsButton.addEventListener('click', () => {
            initAttractionDetails(attraction.id);
        });
        // --- 结束景点详情元素创建 ---

        attractionDiv.appendChild(title);
        attractionDiv.appendChild(description);
        attractionDiv.appendChild(image);
        if (attraction.videoUrl && video.style.display !== 'none') { // 只添加显示的视频元素
             attractionDiv.appendChild(video);
        }

        // 初始化收藏按钮和分享按钮并添加到 div
        initFavoriteButton(attraction.id, attractionDiv);
        attractionDiv.appendChild(detailsButton);
        initShareButton(attraction, attractionDiv);

        attractionListContainer.appendChild(attractionDiv);
    });

    return attractionListContainer; // 只返回包含景点项目的容器
}

// 新增函数：创建和显示分页信息（总页数、当前页等）
function createPaginationInfo(pagination: any) {
    const paginationInfoDiv = document.createElement('div');
    paginationInfoDiv.className = 'pagination-info'; // 类名方便样式
    const pageInfo = document.createElement('p');
    const limitInfo = document.createElement('p');
    const totalInfo = document.createElement('p');

    pageInfo.textContent = `当前页: ${pagination.page}`;
    limitInfo.textContent = `每页数量: ${pagination.limit}`;
    totalInfo.textContent = `总数量: ${pagination.total}`;

    paginationInfoDiv.appendChild(pageInfo);
    paginationInfoDiv.appendChild(limitInfo);
    paginationInfoDiv.appendChild(totalInfo);

    return paginationInfoDiv;
}


// 新增函数：将新加载的景点追加到现有列表
function appendAttractions(attractions: any[], pagination: any) {
    const app = document.getElementById('app');
    if (app) {
        // 找到现有的列表容器 (如果还没有，可能需要先创建或添加到 #app)
        let attractionListItemsContainer = app.querySelector('.attraction-list-items');
        if (!attractionListItemsContainer) {
             // 如果列表容器不存在（例如，初次加载后这个函数不应该被直接调用，
             // 或者初次加载时创建列表的逻辑需要调整以确保这个容器存在）
             // 为了简单起见，这里假设它应该存在
             console.error("Attraction list items container not found for appending!");
             // 作为回退，可以尝试重新渲染整个列表，但这违背了追加的目的
             // updateAttractionList(attractions, pagination);
             return;
        }

        // 使用 createAttractionListItems 创建新的景点元素
        const newItemsFragment = createAttractionListItems(attractions);

        // 将新创建的景点元素追加到现有列表中
        attractionListItemsContainer.appendChild(newItemsFragment);

        // 更新分页信息显示 (如果需要的话)
        const paginationInfoElement = app.querySelector('.pagination-info');
        if (paginationInfoElement) {
            const newPaginationInfo = createPaginationInfo(pagination);
            paginationInfoElement.replaceWith(newPaginationInfo); // 替换旧的分页信息显示
        }

         // 检查是否是最后一页，控制“载入更多”按钮的显示
         checkAndHandleLoadMoreButton(pagination);
    }
}


// 新增函数：创建和管理“载入更多”按钮
function createAndManageLoadMoreButton() {
    const app = document.getElementById('app');
    if (!app) return;

    // 检查是否已经有加载更多按钮，避免重复创建
    let loadMoreButton = app.querySelector('#load-more-button') as HTMLButtonElement | null; // 使用类型断言并保留 null 检查
    if (loadMoreButton) {
        return loadMoreButton; // 如果已存在则直接返回
    }

    // === 修改这里：创建按钮时进行类型断言 ===
    loadMoreButton = document.createElement('button') as HTMLButtonElement; // 断言为 HTMLButtonElement
    loadMoreButton.id = 'load-more-button'; // 给一个 ID
    loadMoreButton.textContent = '载入更多';
    // === 现在可以安全访问 style 和 disabled 属性了 ===
    loadMoreButton.style.display = 'block'; // 默认显示
    loadMoreButton.style.margin = '20px auto'; // 示例样式
    loadMoreButton.style.padding = '10px 20px';
    loadMoreButton.style.fontSize = '16px';

    // 添加点击事件监听器
    loadMoreButton.addEventListener('click', handleLoadMoreClick);

    // 将按钮添加到 #app 容器的底部
    app.appendChild(loadMoreButton);

    return loadMoreButton;
}

// 新增函数：处理“载入更多”按钮点击事件
async function handleLoadMoreClick() {
    // === 修改这里：获取按钮时进行类型断言 ===
    const loadMoreButton = document.getElementById('load-more-button') as HTMLButtonElement | null; // 断言为 HTMLButtonElement，并保留 null 检查
    if (!loadMoreButton) return;

    // === 现在可以安全访问 disabled 属性了 (因为在 if 块内类型已确定) ===
    // 显示加载状态，禁用按钮
    loadMoreButton.textContent = '加载中...';
    loadMoreButton.disabled = true;

    // 页码加一
    const nextPage = currentPage + 1;

    // 移除之前的错误提示 (如果存在的话)
    const existingError = document.getElementById('load-more-error');
    if(existingError) {
        existingError.remove();
    }


    try {
        const data = await getAttractions(nextPage);
        const attractions = data.items;
        const newPagination = data.pagination;

        // === 关键：追加新数据，而不是替换 ===
        appendAttractions(attractions, newPagination);

        // 更新当前页码状态
        currentPage = newPagination.page;

        // 恢复按钮状态
        loadMoreButton.textContent = '载入更多';
        loadMoreButton.disabled = false;

        // 检查是否是最后一页，决定是否隐藏按钮
        checkAndHandleLoadMoreButton(newPagination);

    } catch (error: any) {
        console.error('Error fetching more attractions:', error);
        // 恢复按钮状态
        loadMoreButton.textContent = '载入更多';
        loadMoreButton.disabled = false;
        // 显示错误提示给用户 (在按钮下方添加一个错误文本元素)
        const app = document.getElementById('app');
        if(app && loadMoreButton.parentNode) { // 确保 app 和 按钮的父节点存在
             const errorElement = document.createElement('p');
             errorElement.id = 'load-more-error';
             errorElement.style.color = 'red';
             errorElement.textContent = `加载失败: ${error.message}`;
             // 将错误信息添加到按钮的下方
             loadMoreButton.parentNode.insertBefore(errorElement, loadMoreButton.nextSibling);
        }
        // 加载失败时，页码不应该增加，保持当前页码状态
        // currentPage = currentPage; // 保持不变
    }
}

// 新增函数：检查是否是最后一页，决定是否显示加载更多按钮
function checkAndHandleLoadMoreButton(pagination: any) {
    // === 修改这里：获取按钮时进行类型断言 ===
    const loadMoreButton = document.getElementById('load-more-button') as HTMLButtonElement | null; // 断言为 HTMLButtonElement，并保留 null 检查
    if (!loadMoreButton) return;

    const totalPages = Math.ceil(pagination.total / pagination.limit);

    // 如果当前页等于或大于总页数，则隐藏按钮
    // 注意：API 返回的 page 是当前页码，从 1 开始
    // total 是总项目数，limit 是每页限制
    // 当 page * limit >= total 时，表示当前页已经是最后一页或超过了
    // 例如：total=10, limit=3 -> totalPages = ceil(10/3) = 4
    // page 1: items 1-3
    // page 2: items 4-6
    // page 3: items 7-9
    // page 4: items 10
    // 当 page=4 时， 4 * 3 >= 10 是 true，应该隐藏按钮
    // 所以判断条件可以简单用 pagination.page >= totalPages 或者 pagination.page * pagination.limit >= pagination.total
    // 使用 pagination.page >= totalPages 更直观
    if (pagination.page >= totalPages) {
        loadMoreButton.style.display = 'none';
    } else {
        loadMoreButton.style.display = 'block'; // 确保在不是最后一页时显示
    }
}


// --- 修改 initAttractionList 来使用新的加载更多逻辑 ---

async function initAttractionList() {
    const app = document.getElementById('app');
    if (app) {
        // 清空 #app 容器，显示加载状态
        app.innerHTML = '';
        const loader = document.createElement('div');
        loader.className = 'loader'; // 确保你有 loader 的 CSS 样式
        loader.textContent = '加载中...'; // 添加文本提示
        app.appendChild(loader);

        // === 修改这里：设置初始页码，调用 API ===
        currentPage = 1; // 设置初始页码为 1
        try {
            const data = await getAttractions(currentPage); // 调用 API 获取第一页
            const attractions = data.items;
            const pagination = data.pagination;

            // === 修改这里：清除 loader，创建并添加列表和分页信息 ===
            app.innerHTML = ''; // 清空 loader

            // 创建并添加景点列表项容器
            const attractionListItemsContainer = createAttractionListItems(attractions);
            // 给这个总容器一个 ID 或者类名，方便 appendAttractions 找到它
            // 我们已经在 createAttractionListItems 中使用了类名 .attraction-list-items
            // app.appendChild(attractionListItemsContainer); // 直接添加这个容器

            // 或者像之前一样，创建一个包裹层给 ID="attraction-list"，然后把 items 和 info 都放进去
            const attractionListWrapper = document.createElement('div');
            attractionListWrapper.id = 'attraction-list'; // 列表总容器
            attractionListWrapper.appendChild(attractionListItemsContainer); // 将 items 容器放入包裹层

            // 创建并添加分页信息
            const paginationInfoElement = createPaginationInfo(pagination);
            attractionListWrapper.appendChild(paginationInfoElement); // 将分页信息放入包裹层

            app.appendChild(attractionListWrapper); // 将包裹层添加到 #app


            // === 在初次加载成功后，创建并管理“载入更多”按钮 ===
            createAndManageLoadMoreButton(); // 创建并添加到 DOM
            checkAndHandleLoadMoreButton(pagination); // 根据第一页数据判断是否显示按钮

        } catch (error: any) {
            console.error("Failed to load attractions:", error); // 打印错误到控制台
            const errorDiv = document.createElement('div');
            errorDiv.textContent = `错误: 加载景点失败 - ${error.message}`;
            app.innerHTML = ''; // 清空 loader
            app.appendChild(errorDiv); // 添加错误信息
             // 如果初次加载失败，不需要创建加载更多按钮
             const loadMoreButton = document.getElementById('load-more-button');
             if(loadMoreButton) loadMoreButton.remove();
        }
    }
}

// updateAttractionList 函数现在只用于替换整个列表，在“加载更多”模式下可能不再需要用于分页导航，
// 但它可能在其他地方（如点击导航链接“景点列表”）仍然有用，所以暂时保留并确保它清空容器
function updateAttractionList(attractions: any[], pagination: any) {
     const app = document.getElementById('app');
     if (app) {
         // 清空现有内容，然后添加新的列表
         app.innerHTML = ''; // 清空 #app 容器

         // 重新创建整个列表结构 (items + info)
         const attractionListWrapper = document.createElement('div');
         attractionListWrapper.id = 'attraction-list'; // 列表总容器

         const attractionListItemsContainer = createAttractionListItems(attractions);
         attractionListWrapper.appendChild(attractionListItemsContainer);

         const paginationInfoElement = createPaginationInfo(pagination);
         attractionListWrapper.appendChild(paginationInfoElement);

         app.appendChild(attractionListWrapper);

         // 重新创建并管理加载更多按钮
         createAndManageLoadMoreButton();
         checkAndHandleLoadMoreButton(pagination);

     }
}


// --- DOMContentLoaded 监听器 (保持不变) ---

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');
    initAuthUI(); 
    // 1. 初始化导航链接事件
    const attractionListLink = document.getElementById('attraction-list-link');
    const favoriteListLink = document.getElementById('favorite-list-link');

    if (attractionListLink) {
        attractionListLink.addEventListener('click', (event) => {
            event.preventDefault(); // 阻止默认行为
            console.log('Clicked Attraction List');
            // 调用初始化景点列表的函数来显示景点列表视图 (会重新加载第一页并显示加载更多按钮)
            initAttractionList();
        });
    }

    if (favoriteListLink) {
        favoriteListLink.addEventListener('click', async (event) => {
            event.preventDefault(); // 阻止默认行为
            console.log('Clicked Favorite List');
            // 使用 Webpack 处理的动态导入 (导入 TS 文件)
            try {
                // 注意路径是相对于当前文件 (AttractionList.ts 在 src/components)
                // 假设 FavoriteList.ts 也在 src/components 目录下
                const { initFavoriteList } = await import('./FavoriteList');
                // 调用收藏列表的初始化函数
                // 你可能需要传递一个容器元素，比如 #app
                // initFavoriteList(document.getElementById('app'));
                 initFavoriteList(); // 假设不需要参数
            } catch (error) {
                console.error('Failed to load FavoriteList module:', error);
                 const app = document.getElementById('app');
                 if(app) {
                     app.innerHTML = '<p>加载收藏列表失败。</p>'; // 显示错误提示
                 }
            }
        });
    }

    // 2. 初始化搜索栏
    (async () => {
        try {
             // 假设 SearchBar.ts 也在 src/components 目录下
            const { initSearchBar } = await import('./SearchBar');
            // 调用搜索栏的初始化函数
            // 你可能需要传递一个容器元素或者目标元素给 initSearchBar
            // initSearchBar(document.getElementById('search-container')); // 假设搜索栏有容器
            initSearchBar(); // 假设不需要参数
        } catch (error) {
            console.error('Failed to load SearchBar module:', error);
            // 可以在页面上显示搜索栏加载失败的提示
        }
    })();


    // 3. 页面加载时，调用初始化景点列表函数来显示默认视图
    initAttractionList();

});


// 导出函数 (如果其他地方需要使用的话)
export { initAttractionList, updateAttractionList };
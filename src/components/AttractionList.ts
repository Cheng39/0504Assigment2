// src/components/AttractionList.ts

// 导入获取景点列表的 API 函数
import { getAttractions } from '../api/fetchAttractions';
// 导入 FavoriteButton 的初始化函数 (用于在景点项目上创建收藏按钮)
import { initFavoriteButton } from './FavoriteButton';
// 导入景点详情的初始化函数 (用于点击“查看详情”)
import { initAttractionDetails } from './AttractionDetails';
// 导入分享按钮的初始化函数
import { initShareButton } from './shareButton';
// 导入 AuthUI 中获取认证 token 的函数 (用于检查用户是否登录)
import { getAuthToken } from './authUI';
// 导入 Favorite API 中获取收藏 ID 列表的函数 (用于显示收藏状态)
import { getFavoriteIds } from '../api/favorite';
// 导入 SearchBar 的初始化函数
import { initSearchBar } from './SearchBar';
// 导入 AuthUI 的初始化函数 (为了在 DOMContentLoaded 中初始化认证界面)
import { initAuthUI } from './authUI';


// 导入 CSS (确保路径正确)
import '../styles/styles.css';

// --- 全局状态管理 ---
let currentPage = 0; // 当前显示的页码，初始化为 0
// 定义变量来存储分页按钮元素 (上一页，下一页)。它们需要在不同的函数中访问和更新状态。
let prevPageButton: HTMLButtonElement | null = null;
let nextPageButton: HTMLButtonElement | null = null;
// 定义变量来存储加载指示器和错误/警告信息元素。它们需要在 loadPage 函数的不同部分访问。
let loaderElement: HTMLElement | null = null;
let favStatusWarningElement: HTMLElement | null = null;
let loadErrorElement: HTMLElement | null = null;


// === 核心功能函数：加载指定页码的景点数据并更新界面 ===
// 这个函数负责整个页面加载流程：显示加载器 -> 获取收藏状态 -> 获取景点数据 -> 更新页面内容
// pageNumber: 要加载的页码 (从 1 开始)
// searchTerm: 可选的搜索关键词，用于搜索功能
async function loadPage(pageNumber: number, searchTerm: string = '') {
    const app = document.getElementById('app'); // 获取 #app 容器
    if (!app) {
        console.error('#app container not found.');
        return; // 如果 #app 不存在则退出函数
    }

    // === 步骤 1: 清除当前 #app 容器中的所有现有内容，并显示加载指示器 ===
    // 清除之前显示的所有内容 (包括旧列表、加载指示器、错误信息等)
    app.innerHTML = '';
    // 创建并添加加载指示器
    loaderElement = document.createElement('div'); // 使用外部变量 loaderElement
    loaderElement.className = 'loader'; // 需要对应的 CSS 样式来显示加载动画或文本
    loaderElement.textContent = `加载第 ${pageNumber} 页...`; // 加载文本提示
    loaderElement.style.textAlign = 'center'; // 示例样式：文本居中
    loaderElement.style.margin = '20px 0'; // 示例样式：外边距
    app.appendChild(loaderElement); // 将加载器添加到 #app 中

    // 移除之前可能的错误和警告信息元素 (如果它们还在 DOM 中，确保清除)
    // 尽管 app.innerHTML = '' 已经清除了，这里再次清空引用，保持状态同步
    loadErrorElement = null;
    favStatusWarningElement = null;


    // === 步骤 2: 获取用户的已收藏 ID 列表 (如果已登录) ===
    // 收藏状态需要显示在景点列表上，所以需要在加载列表数据前获取用户的收藏列表。
    let userFavoriteIds: number[] = []; // 初始化一个空数组来存储收藏 ID
    const token = getAuthToken(); // 从 authUI.ts 获取当前用户的认证 token 来判断是否已登录
    if (token) {
        // 如果用户已登录
        try {
            console.log('Fetching favorite IDs before loading page', pageNumber, '...');
            // 调用 API 获取当前用户已收藏的景点 ID 列表
            const favoriteIdsData = await getFavoriteIds(); // 确保你在文件顶部导入了 getFavoriteIds
            userFavoriteIds = favoriteIdsData.item_ids; // 从返回数据中获取 ID 数组
            console.log('Favorite IDs fetched:', userFavoriteIds);
        } catch (error: any) {
            // 如果获取收藏列表失败 (例如 API 错误，或者 token 无效导致 401 错误)
            console.error("Failed to fetch favorite IDs:", error);
            // 显示一个警告信息给用户，表示收藏状态可能不准确，但继续加载景点列表
            const app = document.getElementById('app'); // 重新获取 app 容器 (确保存在)
            if(app) {
                 favStatusWarningElement = document.createElement('p'); // 使用外部变量 favStatusWarningElement
                 favStatusWarningElement.style.color = 'orange'; // 警告信息使用橙色
                 favStatusWarningElement.textContent = `加载收藏状态失败: ${error.message || '未知错误'}，景点收藏状态可能不准确。`;
                  // 将警告信息添加到加载器上方（如果加载器存在）或 app 容器开头
                 if (loaderElement && loaderElement.parentNode) {
                     loaderElement.parentNode.insertBefore(favStatusWarningElement, loaderElement);
                 } else {
                     app.insertBefore(favStatusWarningElement, app.firstChild);
                 }
            }
             userFavoriteIds = []; // 在获取失败时，确保使用空数组，避免后续 includes() 报错
             // 如果 error 是认证失败 (如 401)，authUI 中的 checkLoginStatus 函数或相应的事件监听器会处理用户登出。
             // 在这里我们只需要处理加载收藏列表本身失败的情况。
        }
    }
    // 如果用户未登录 (token 为 null)，userFavoriteIds 保持为 []，景点项目的收藏按钮会是禁用状态 (在 FavoriteButton.ts 中处理)。


    // === 步骤 3: 调用 API 获取指定页码的景点数据 ===
    try {
        console.log(`Workspaceing attractions for page ${pageNumber}, search term: "${searchTerm}"...`);
        // 调用 API 获取指定页码的数据，并包含搜索关键词（如果提供了的话）
        const data = await getAttractions(pageNumber, searchTerm); // 确保你在文件顶部导入了 getAttractions
        const attractions = data.items; // 获取景点项目数组
        const pagination = data.pagination; // 获取分页信息 (包含当前页、总数、每页限制等)

        // === 步骤 4: 更新全局页码状态 ===
        // 根据 API 返回的分页信息，更新全局 currentPage 状态
        currentPage = pagination.page;

        // === 步骤 5: 清除加载指示器，并调用 renderAttractionList 函数显示页面内容 ===
        // 在数据获取成功后，移除加载指示器
        if(loaderElement && loaderElement.parentNode) {
            loaderElement.remove(); // 移除加载器元素
        }
        loaderElement = null; // 清空对加载器元素的引用

        // 调用 renderAttractionList 函数来渲染景点列表、分页信息和分页按钮
        // renderAttractionList 负责创建列表容器、分页信息元素、分页按钮等 DOM 结构
        await renderAttractionList(attractions, pagination, userFavoriteIds); // 传递景点数据、分页信息和获取到的收藏 ID 列表


        // === 步骤 6: 在分页按钮创建后，为 上一页/下一页 按钮添加事件监听器 ===
        // 分页按钮是在 renderAttractionList 函数中通过 createPaginationInfo 创建并添加到 DOM 中的。
        // 我们需要在这里（loadPage 函数的 try 块末尾）获取到这些按钮的引用（使用外部变量 prevPageButton 和 nextPageButton）
        // 并为它们添加点击事件监听器。
        if (prevPageButton) {
            prevPageButton.addEventListener('click', () => {
                console.log('Clicked Previous Page');
                // 点击“上一页”，调用 loadPage 加载前一页的数据
                // currentPage 已经是当前页码，前一页是 currentPage - 1
                // 同时保留当前的搜索关键词
                loadPage(currentPage - 1, searchTerm); // 调用 loadPage，传入前一页码和当前搜索关键词
            });
        }
        if (nextPageButton) {
            nextPageButton.addEventListener('click', () => {
                console.log('Clicked Next Page');
                // 点击“下一页”，调用 loadPage 加载后一页的数据
                // 后一页是 currentPage + 1
                // 同时保留当前的搜索关键词
                loadPage(currentPage + 1, searchTerm); // 调用 loadPage，传入后一页码和当前搜索关键词
            });
        }

        // 分页按钮的初始可用状态 (disabled) 在 createPaginationInfo 中被调用 checkAndHandlePaginationButtons 时设置。


    } catch (error: any) {
        // === 处理加载景点数据失败的错误 (API 返回非 2xx 状态码或网络错误) ===
        console.error(`Failed to load page ${pageNumber}:`, error);
         // 在错误发生时也要确保加载器被移除
         if(loaderElement && loaderElement.parentNode) {
             loaderElement.remove();
         }
         loaderElement = null; // 清空引用
         // 显示错误信息给用户
         const app = document.getElementById('app'); // 重新获取 app 容器 (确保存在)
         if(app) {
             loadErrorElement = document.createElement('div'); // 使用外部变量 loadErrorElement
             loadErrorElement.textContent = `错误: 加载第 ${pageNumber} 页失败 - ${error.message || '未知错误'}`;
             loadErrorElement.style.color = 'red'; // 错误信息使用红色
             loadErrorElement.style.textAlign = 'center'; // 文本居中
             app.appendChild(loadErrorElement); // 将错误信息添加到 #app 容器
         }
         // 加载失败时，当前页码 (currentPage) 应该保持不变，因为它仍然是上一次成功加载的页码。
         // 不需要在这里修改 currentPage。
    }
}


// === 初始化景点列表视图的入口函数 ===
// 这个函数在应用初次加载、点击导航栏的“景点列表”链接、或点击“刷新列表”按钮时被调用。
// 它负责启动加载第一页的数据。
// searchTerm: 可选的搜索关键词，用于在初始化时进行搜索
async function initAttractionList(searchTerm: string = '') {
    console.log('Initializing Attraction List...');
    // 调用 loadPage 函数来加载第一页的数据。
    // 如果 initAttractionList 是因为搜索而被调用，则会带上搜索关键词。
    await loadPage(1, searchTerm); // 调用 loadPage 函数来加载第一页，并传入搜索关键词
}


// === DOMContentLoaded 事件监听器：确保 DOM 加载完成后执行初始化 ===
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');

    // 1. 初始化认证 UI 和检查登录状态
    // initAuthUI 内部会调用 checkLoginStatus 来验证是否有本地 Token。
    // 使用动态导入 AuthUI 模块，可以避免如果 AuthUI 模块又导入了 AttractionList 导致出现循环依赖。
    import('./authUI').then(({ initAuthUI }) => {
        initAuthUI(); // 初始化认证界面和逻辑
    }).catch(error => {
        console.error('Failed to load AuthUI module:', error);
        // 如果认证模块加载失败，可能需要隐藏认证相关的 UI 元素或显示错误信息
        const authStatusArea = document.getElementById('auth-status');
        if(authStatusArea) authStatusArea.style.display = 'none';
        const authFormsArea = document.getElementById('auth-forms');
        if(authFormsArea) authFormsArea.style.display = 'none';
        const app = document.getElementById('app');
        if(app) app.innerHTML = '<p>加载认证模块失败。</p>'; // 在页面上显示错误提示
    });


    // 2. 初始化导航链接事件 (包括新的刷新按钮)
    // 获取导航栏的三个按钮/链接元素
    const attractionListLink = document.getElementById('attraction-list-link');
    const favoriteListLink = document.getElementById('favorite-list-link');
    const refreshButton = document.getElementById('refresh-attraction-list-button'); // 获取新的刷新按钮 (在 public/index.html 中添加)

    if (attractionListLink) {
        attractionListLink.addEventListener('click', (event) => {
            event.preventDefault(); // 阻止链接默认的跳转行为
            console.log('Clicked Attraction List');
            // 点击“景点列表”导航链接，总是回到第一页，清除任何搜索关键词
            initAttractionList(''); // 调用初始化函数，加载第一页，不带搜索关键词
        });
    }

    if (favoriteListLink) {
        favoriteListLink.addEventListener('click', async (event) => {
            event.preventDefault(); // 阻止链接默认的跳转行为
            console.log('Clicked Favorite List');
            // 动态导入 FavoriteList 模块，然后调用其初始化函数
            import('./FavoriteList').then(({ initFavoriteList }) => {
                initFavoriteList(); // 调用收藏列表的初始化函数。FavoriteList 模块自己负责其加载和显示逻辑。
            }).catch(error => {
                console.error('Failed to load FavoriteList module:', error);
                 const app = document.getElementById('app'); // 获取 #app 容器
                 if(app) {
                     app.innerHTML = '<p>加载收藏列表失败。</p>'; // 在页面上显示错误提示
                 }
            });
        });
    }

    // === 为新的“刷新列表”按钮添加点击事件监听器 ===
    if (refreshButton) {
        refreshButton.addEventListener('click', () => {
            console.log('Clicked Refresh Button');
            // 点击“刷新列表”按钮，总是重新加载第一页，清除任何搜索关键词
            // 如果需要保留搜索关键词，这里的逻辑需要调整，并在 SearchBar 中管理搜索状态并传递给 initAttractionList
            initAttractionList(''); // 调用初始化函数，加载第一页，不带搜索关键词
        });
    }


    // 3. 初始化搜索栏
    // 动态导入 SearchBar 模块，并初始化它
    import('./SearchBar').then(({ initSearchBar }) => {
         initSearchBar(); // 调用搜索栏的初始化函数。
         // SearchBar 模块应该负责获取用户的搜索输入，并在用户点击搜索按钮时，
         // 调用 initAttractionList 函数并传递搜索关键词，例如： initAttractionList(searchTerm);
         // 这需要在 SearchBar.ts 中实现。initAttractionList 已经被导出，可以在 SearchBar 中导入使用。
    }).catch(error => {
        console.error('Failed to load SearchBar module:', error);
        // 如果搜索栏模块加载失败，可以不显示搜索栏或显示错误信息
    });


    // 4. 在 DOM 加载完毕后，初次初始化景点列表视图
    // 这是应用启动时显示的默认视图。它会触发调用 initAttractionList，进而加载第一页。
    initAttractionList();


    // === TODO: 添加登录和登出事件监听器来更新收藏按钮状态 ===
    // 当用户通过认证界面登录成功或点击登出按钮后，需要更新页面上已显示的收藏按钮状态。
    // 这可以通过监听在 authUI.ts 中可能触发的自定义事件 (如 'userLoggedIn', 'userLoggedOut') 来实现。
    // 这些事件的监听器需要找到页面上所有带有 'favorite-button' 类的按钮，并更新它们的状态。
    // 如果 FavoriteButton.ts 中实现了 updateAllFavoriteButtonsOnPage 函数并导出，可以在这里导入并调用它。
    /*
    import('./FavoriteButton').then(({ updateAllFavoriteButtonsOnPage }) => {
        // 监听用户登录事件
        document.addEventListener('userLoggedIn', () => {
            console.log('AttractionList: User Logged In event received.');
            // 如果 updateAllFavoriteButtonsOnPage 函数存在，调用它来更新所有收藏按钮的状态
            if (updateAllFavoriteButtonsOnPage) {
                updateAllFavoriteButtonsOnPage(); // 调用更新函数
            } else { console.warn('updateAllFavoriteButtonsOnPage not found in FavoriteButton.ts'); }
        });
        // 监听用户登出事件
        document.addEventListener('userLoggedOut', () => {
             console.log('AttractionList: User Logged Out event received.');
             if (updateAllFavoriteButtonsOnPage) {
                 updateAllFavoriteButtonsOnPage(); // 调用更新函数
             } else { console.warn('updateAllFavoriteButtonsOnPage not found in FavoriteButton.ts'); }
             // 登出后可能需要重新加载第一页，以确保只有非登录用户可见的项目被显示 (如果作业有这个要求)
             initAttractionList(''); // 重新加载第一页，清除搜索关键词
        });
    }).catch(error => { console.error('Failed to load FavoriteButton module for event listeners:', error); });
    */
});


// --- 导出函数 ---
// 导出 initAttractionList 函数，供其他模块需要回到景点列表视图时调用 (如导航链接或搜索栏)
// renderAttractionList 是内部 helper 函数，通常不需要导出
export { initAttractionList };

// Note: createAttractionItemElement, createAttractionListItemsContainer, createPaginationInfo,
// checkAndHandlePaginationButtons 都是内部 Helper 函数，不需要在这里导出。


// === 在这里粘贴所有 Helper 函数的完整定义 ===
// 包括：
// createAttractionItemElement
// createAttractionListItemsContainer
// createPaginationInfo
// checkAndHandlePaginationButtons
// renderAttractionList (我们上面定义了它的签名和部分逻辑，这里需要完整的函数体)


// Helper 函数：创建单个景点项目的 DOM 元素
function createAttractionItemElement(attraction: any, userFavoriteIds: number[] = []) {
    const attractionDiv = document.createElement('div');
    attractionDiv.className = 'attraction-item'; // 添加一个类名方便样式

    // --- 创建景点详情元素 (标题、描述、图片、视频、详情按钮) ---
    const title = document.createElement('h2');
    const description = document.createElement('p');
    const image = document.createElement('img');
    const video = document.createElement('video'); // === 修正为 document.createElement ===
    const detailsButton = document.createElement('button');

    title.textContent = attraction.title;
    // 注意：如果 description 包含 HTML，可能需要使用 innerHTML
    description.textContent = attraction.description; // 或者 description.innerHTML = attraction.description;
    image.src = attraction.imageUrl;
    image.alt = attraction.title; // 添加 alt 属性增加可访问性

    if (attraction.videoUrl) {
         video.src = attraction.videoUrl;
         video.controls = true; // 添加视频控制条
         // 可以添加一个简单的错误监听，如果视频加载失败则隐藏视频元素
         video.addEventListener('error', () => {
             console.warn(`Failed to load video for attraction ${attraction.id}: ${attraction.videoUrl}`);
             video.style.display = 'none'; // 隐藏视频元素
         });
    } else {
         video.style.display = 'none'; // 如果没有视频 URL，则隐藏视频元素
    }

    detailsButton.textContent = '查看详情';

    // 添加详情按钮的点击事件监听器
    detailsButton.addEventListener('click', () => {
        initAttractionDetails(attraction.id); // 调用景点详情初始化函数
    });
    // --- 结束创建详情元素 ---

    // 将详情元素添加到景点项目 div 中
    attractionDiv.appendChild(title);
    attractionDiv.appendChild(description);
    attractionDiv.appendChild(image);
    if (attraction.videoUrl && video.style.display !== 'none') { // 只在视频存在且没有被隐藏时添加 video 元素
         attractionDiv.appendChild(video);
    }

    // === 初始化并添加收藏按钮 ===
    // 判断当前景点 ID 是否在用户的已收藏 ID 列表中
    const isInitiallyFavorited = userFavoriteIds.includes(attraction.id);
    // 调用 initFavoriteButton，并传递景点 ID、容器元素和初始收藏状态
    initFavoriteButton(attraction.id, attractionDiv, isInitiallyFavorited); // 确保你在文件顶部导入了 initFavoriteButton

    // 添加详情按钮
    attractionDiv.appendChild(detailsButton);

    // 添加分享按钮
    initShareButton(attraction, attractionDiv); // 确保你在文件顶部导入了 initShareButton

    return attractionDiv; // 返回创建好的景点项目 div 元素
}

// Helper 函数：创建景点列表项目容器
function createAttractionListItemsContainer(attractions: any[], userFavoriteIds: number[] = []) {
    const attractionListContainer = document.createElement('div');
    attractionListContainer.id = 'attraction-list-items'; // 给包含所有景点项目的容器一个 ID
    attractionListContainer.className = 'attraction-list-items'; // 也给一个类名

    // 遍历景点数组，创建并追加每个景点项目元素
    attractions.forEach((attraction) => {
        const attractionItemElement = createAttractionItemElement(attraction, userFavoriteIds); // 调用 helper 函数创建单个项目，并传递收藏 ID 列表
        attractionListContainer.appendChild(attractionItemElement);
    });

    return attractionListContainer; // 返回包含所有景点项目的容器
}


// Helper 函数：创建和显示分页信息以及上一页/下一页按钮
function createPaginationInfo(pagination: any) {
    const paginationInfoDiv = document.createElement('div');
    paginationInfoDiv.className = 'pagination-controls'; // 给分页控制区域一个类名
    paginationInfoDiv.style.textAlign = 'center'; // 示例样式：内容居中
    paginationInfoDiv.style.margin = '20px 0'; // 示例样式：外边距

    // === 创建 上一页 和 下一页 按钮 ===
    prevPageButton = document.createElement('button'); // 使用外部变量 prevPageButton
    prevPageButton.id = 'prev-page-button'; // 给按钮一个 ID
    prevPageButton.textContent = '上一页';
    prevPageButton.style.marginRight = '10px'; // 示例样式：按钮之间的间距

    nextPageButton = document.createElement('button'); // 使用外部变量 nextPageButton
    nextPageButton.id = 'next-page-button'; // 给按钮一个 ID
    nextPageButton.textContent = '下一页';

    // 创建文本信息 (当前页码 / 总页数)
    const totalPages = Math.ceil(pagination.total / pagination.limit); // 计算总页数
    const pageInfo = document.createElement('span'); // 使用 span 元素用于内联显示
    pageInfo.textContent = `第 ${pagination.page} 页 / 共 ${totalPages} 页`; // 显示当前页码和总页数
    pageInfo.style.margin = '0 10px'; // 示例样式：文本和按钮之间的间距

    // 将元素添加到分页控制区域 div 中
    paginationInfoDiv.appendChild(prevPageButton); // 添加上一页按钮
    paginationInfoDiv.appendChild(pageInfo);      // 添加页码信息
    paginationInfoDiv.appendChild(nextPageButton); // 添加下一页按钮

    // === 根据当前页码设置按钮的可用状态 ===
    checkAndHandlePaginationButtons(pagination); // 调用函数来设置按钮的初始可用状态

    return paginationInfoDiv; // 返回创建好的分页控制区域 div
}


// Helper 函数：根据分页信息检查并处理 上一页/下一页 按钮的可用状态
function checkAndHandlePaginationButtons(pagination: any) {
    // 确保 prevPageButton 和 nextPageButton 元素存在
    if (!prevPageButton || !nextPageButton) return;

    const totalPages = Math.ceil(pagination.total / pagination.limit); // 计算总页数

    // 如果当前页码 <= 1，则禁用“上一页”按钮；否则启用
    if (pagination.page <= 1) {
        prevPageButton.disabled = true;
    } else {
        prevPageButton.disabled = false;
    }

    // 如果当前页码 >= 总页数，则禁用“下一页”按钮；否则启用
    if (pagination.page >= totalPages) {
        nextPageButton.disabled = true;
    } else {
        nextPageButton.disabled = false;
    }
}

// The core rendering function (renders loaded data)
// This function is called by loadPage to render the fetched attractions and pagination controls.
// It takes the fetched attractions array, pagination data, and user's favorite IDs.
async function renderAttractionList(attractions: any[], pagination: any, userFavoriteIds: number[] = []) {
     const app = document.getElementById('app');
     if (app) {
         // Clear existing list wrapper if it exists (important when replacing list, e.g., search results)
         const existingListWrapper = app.querySelector('#attraction-list');
         if(existingListWrapper) existingListWrapper.remove();

         // Create the main wrapper for the list content (items + pagination)
         const attractionListWrapper = document.createElement('div');
         attractionListWrapper.id = 'attraction-list'; // Give the wrapper a unique ID

         // Create and append attraction item elements using the helper function
         const attractionListItemsContainer = createAttractionListItemsContainer(attractions, userFavoriteIds); // Pass favorite IDs
         attractionListWrapper.appendChild(attractionListItemsContainer);

         // Create and append pagination info and buttons using the helper function
         const paginationControlsElement = createPaginationInfo(pagination); // This creates Prev/Next buttons and info
         attractionListWrapper.appendChild(paginationControlsElement); // Append pagination controls

         // Append the main list wrapper to the app container
         app.appendChild(attractionListWrapper);

         // === Add event listeners to the pagination buttons ===
         // This must be done *after* the buttons are created and added to the DOM by createPaginationInfo
         // We use the external variables prevPageButton and nextPageButton
         if (prevPageButton) {
             prevPageButton.addEventListener('click', () => {
                 console.log('Clicked Previous Page');
                 // Call loadPage with the previous page number (currentPage is global)
                 // Assuming search term is not preserved across pagination clicks unless explicitly handled
                 loadPage(currentPage - 1, ''); // Load previous page, clear search term
             });
         }
         if (nextPageButton) {
             nextPageButton.addEventListener('click', () => {
                 console.log('Clicked Next Page');
                 // Call loadPage with the next page number (currentPage is global)
                 // Assuming search term is not preserved across pagination clicks unless explicitly handled
                 loadPage(currentPage + 1, ''); // Load next page, clear search term
             });
         }

         // The initial state of the pagination buttons (enabled/disabled) is set within createPaginationInfo

     }
}
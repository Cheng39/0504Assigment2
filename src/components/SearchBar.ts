// src/components/SearchBar.ts

// 导入显示反馈消息的函数 (如果 SearchBar 需要显示反馈)
import { showFeedback } from './Feedback'; // 确保 Feedback.ts 存在并导出了 showFeedback

// === 导入 initAttractionList 函数 ===
// SearchBar 现在只需要调用 initAttractionList 并传递搜索关键词来触发列表更新
import { initAttractionList } from './AttractionList';

// === 导入 AuthUI 中获取认证 token 的函数 (如果搜索栏的某些行为依赖用户登录状态) ===
// 根据你提供的代码，SearchBa r本身不直接依赖认证状态，所以这个导入可能是多余的，但如果后续功能需要可以保留。
// import { getAuthToken } from './authUI';
// import { getFavoriteIds } from '../api/favorite'; // 搜索栏不直接获取收藏列表


// Helper 函数：创建搜索栏的 DOM 元素
// 这个函数本身创建元素的部分看起来是正确的
function createSearchBar() {
    const searchBar = document.createElement('div');
    // 注意：我们已经在 index.html 中有了 <div id="search-bar-container">
    // 这个 createSearchBar 函数创建的 div 可以是 search-bar-container 内部的结构，或者我们修改下面的 initSearchBar 来直接获取 #search-bar-container 并往里面添加 input 和 button。
    // 为了和你的现有代码结构更一致，我们保留 createSearchBar，但要注意 id="search-bar" 这个 ID 可能与 #search-bar-container 的意图重叠。
    // 更好的做法是 createSearchBar 函数只创建 input 和 button，然后 initSearchBar 获取 #search-bar-container 并添加这些元素。
    // 或者，createSearchBar 创建一个 div，但这个 div 不需要 id="search-bar"，它是 #search-bar-container 的直接子元素。

    // 让我们修改 createSearchBar 函数，让它创建一个包含 input 和 button 的 div，但没有 ID
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-bar-content'; // 可以给一个类名用于样式控制

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = '搜索景点名称或特色...';
    // 注意：这里设置的行内样式会被 CSS 文件中的样式覆盖或影响。推荐在 CSS 文件中统一管理样式。
    // input.style.padding = '10px';
    // input.style.marginRight = '10px';
    // input.style.border = '1px solid #ccc';
    // input.style.borderRadius = '4px';
    // input.style.fontSize = '16px';


    const button = document.createElement('button');
    button.textContent = '搜索';
    // 注意：这里的行内样式会被 CSS 文件中的样式覆盖或影响。推荐在 CSS 文件中统一管理样式。
    // button.style.padding = '10px 20px';
    // button.style.backgroundColor = '#007bff';
    // button.style.color = 'white';
    // button.style.border = 'none';
    // button.style.borderRadius = '4px';
    // button.style.cursor = 'pointer';
    // button.style.fontSize = '16px';


    searchContainer.appendChild(input); // 将输入框添加到容器
    searchContainer.appendChild(button); // 将按钮添加到容器

    return { container: searchContainer, input, button }; // 返回创建的容器和元素引用
}

// 初始化搜索栏功能
function initSearchBar() {
    // === 获取搜索栏的容器元素 <div id="search-bar-container"> ===
    const searchBarContainer = document.getElementById('search-bar-container');
    if (!searchBarContainer) {
        console.error('#search-bar-container not found for search bar initialization.');
        // 如果容器不存在，可能是 HTML 结构有问题，或者 SearchBar.ts 在 DOM 加载完成前就运行了。
        // 如果是在 DOMContentLoaded 中调用的，容器应该已经存在。
        return;
    }

    // === 检查 #search-bar-container 是否已经有内容，防止重复初始化 ===
    // 如果容器里已经有子元素，说明搜索栏已经被渲染过了
    if (searchBarContainer.hasChildNodes()) {
         console.warn('Search bar container already has content. Skipping re-initialization.');
         // 如果需要，可以在这里获取现有的 input 和 button 元素，然后重新绑定事件监听器
         // 或者如果你的组件设计确保 initSearchBar 只调用一次，这个检查可以简化或移除。
         // 但为了避免重复添加 UI，保留检查是好的。
         // 如果你希望每次都清空容器并重新添加，可以 uncomment 下面的行
         // searchBarContainer.innerHTML = '';
         // 但通常我们希望 SearchBar 只初始化一次 UI。
         return; // 如果容器不为空，则不重复初始化 UI
    }


    const { container, input, button } = createSearchBar(); // 创建搜索栏元素 (现在只创建内部结构)

    // === 将创建的搜索栏元素添加到正确的容器 <div id="search-bar-container"> 中 ===
    // 注意：不再添加到 #app 中了
    searchBarContainer.appendChild(container); // 将创建的搜索栏内部容器添加到 #search-bar-container 中

    // 获取搜索输入框和按钮的引用 (如果它们不是通过 createSearchBar 返回的话，这里需要重新获取)
    // const input = searchBarContainer.querySelector('input') as HTMLInputElement;
    // const button = searchBarContainer.querySelector('button') as HTMLButtonElement;
    // 因为 createSearchBar 已经返回了引用，所以上面的获取就不需要了。

    // === 添加搜索按钮的点击事件监听器 ===
    button.addEventListener('click', () => { // 不需要 async
        const search = input.value.trim(); // 获取输入框的值并去除首尾空格

        // 调用 initAttractionList 函数，并将搜索关键词作为参数传递。
        // initAttractionList (通过调用内部的 loadPage 函数) 会负责：
        // - 清空 #app 容器 (这不会影响在 header 里的搜索栏)
        // - 显示加载指示器
        // - 获取用户收藏 ID 列表
        // - 调用 API (getAttractions) 获取第 1 页的数据，并带上搜索关键词
        // - 渲染景点列表、分页信息和按钮
        // - 处理 API 返回的成功或错误
        // - 管理分页按钮的状态
        console.log(`Search button clicked. Searching for: "${search}"`);
        initAttractionList(search); // 调用 initAttractionList，传递搜索关键词

        // 搜索相关的加载指示器、按钮禁用/启用、错误显示等逻辑现在都由 loadPage/initAttractionList 处理。
        // SearchBar 只负责触发搜索动作。
    });

    // 可选：为输入框添加回车键监听器
    input.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // 阻止表单默认提交行为
            button.click(); // 触发搜索按钮的点击事件
        }
    });

    // 可以在这里显示反馈消息，例如 "搜索功能已准备就绪"
    // showFeedback('搜索功能已加载', 'success'); // 确保 Feedback.ts 存在
}

// 导出 initSearchBar 函数，供 AttractionList 或其他需要初始化搜索栏的地方调用
export { initSearchBar };
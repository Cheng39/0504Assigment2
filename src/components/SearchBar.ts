// src/components/SearchBar.ts

// 不再直接在 SearchBar 中调用 getAttractions，所以可以移除导入，除非 SearchBar 需要它做其他事情（例如输入验证）
// import { getAttractions } from '../api/fetchAttractions';

// 导入显示反馈消息的函数
import { showFeedback } from './Feedback';

// === 导入 initAttractionList 函数 ===
// SearchBar 现在只需要调用 initAttractionList 并传递搜索关键词来触发列表更新
import { initAttractionList } from './AttractionList';

// 不再在 SearchBar 中直接获取收藏状态，所以可以移除相关导入
// import { getAuthToken } from './authUI';
// import { getFavoriteIds } from '../api/favorite';


// Helper 函数：创建搜索栏的 DOM 元素
function createSearchBar() {
    const searchBar = document.createElement('div');
    searchBar.id = 'search-bar'; // 给搜索栏容器一个唯一的 ID
    searchBar.style.margin = '20px 0'; // 示例样式：设置外边距
    searchBar.style.textAlign = 'center'; // 示例样式：内容居中

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = '搜索景点名称或特色...';
    input.style.padding = '10px'; // 示例样式：内边距
    input.style.marginRight = '10px'; // 示例样式：输入框和按钮之间的间距
    input.style.border = '1px solid #ccc'; // 示例样式：边框
    input.style.borderRadius = '4px'; // 示例样式：圆角
    input.style.fontSize = '16px'; // 示例样式：字体大小


    const button = document.createElement('button');
    button.textContent = '搜索';
    button.style.padding = '10px 20px'; // 示例样式：内边距
    button.style.backgroundColor = '#007bff'; // 示例样式：背景颜色
    button.style.color = 'white'; // 示例样式：文字颜色
    button.style.border = 'none'; // 示例样式：无边框
    button.style.borderRadius = '4px'; // 示例样式：圆角
    button.style.cursor = 'pointer'; // 示例样式：鼠标悬停时显示手型
    button.style.fontSize = '16px'; // 示例样式：字体大小


    searchBar.appendChild(input); // 将输入框添加到搜索栏容器
    searchBar.appendChild(button); // 将按钮添加到搜索栏容器

    return searchBar; // 返回创建好的搜索栏 DOM 元素
}

// 初始化搜索栏功能
function initSearchBar() {
    const app = document.getElementById('app'); // 获取 #app 容器
    if (!app) {
        console.error('#app container not found for search bar initialization.');
        return; // 如果 #app 不存在则退出
    }

    // === 检查是否已经存在搜索栏，防止重复初始化 ===
    // 如果 initSearchBar 被多次调用（例如在 AttractionList 视图切换时），这个检查很重要
    if (app.querySelector('#search-bar')) {
         console.warn('Search bar already exists in the DOM. Skipping re-initialization.');
         // 可以选择将现有的搜索栏移到顶部，如果它被 app.innerHTML = '' 移到了其他位置
         // const existingSearchBar = app.querySelector('#search-bar') as HTMLElement;
         // app.insertBefore(existingSearchBar, app.firstChild);
         return; // 如果搜索栏已存在，则不重复初始化
    }


    const searchBar = createSearchBar(); // 创建搜索栏元素
    // 将搜索栏插入到 #app 容器的开头 (在第一个子元素之前)
    app.insertBefore(searchBar, app.firstChild);

    // 获取搜索输入框和按钮的引用
    const input = searchBar.querySelector('input') as HTMLInputElement;
    const button = searchBar.querySelector('button') as HTMLButtonElement;

    // === 添加搜索按钮的点击事件监听器 ===
    button.addEventListener('click', () => { // 不需要 async，因为我们只调用 initAttractionList
        const search = input.value.trim(); // 获取输入框的值并去除首尾空格

        // 调用 initAttractionList 函数，并将搜索关键词作为参数传递。
        // initAttractionList (通过调用内部的 loadPage 函数) 会负责：
        // - 清空 #app 容器
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

    // 可选：为输入框添加回车键监听器，按下回车键时触发搜索按钮的点击事件
    input.addEventListener('keypress', (event) => {
         if (event.key === 'Enter') {
             event.preventDefault(); // 阻止表单默认提交行为 (如果输入框在 form 内的话)
             button.click(); // 触发搜索按钮的点击事件
         }
    });
}

// 导出 initSearchBar 函数，供 AttractionList 或其他需要初始化搜索栏的地方调用
export { initSearchBar };
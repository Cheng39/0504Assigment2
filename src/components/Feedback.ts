// src/components/Feedback.ts

// 函数：创建反馈消息的 DOM 元素
function createFeedbackDiv(message: string, type: 'success' | 'error') {
    const feedbackDiv = document.createElement('div');
    feedbackDiv.style.padding = '10px';
    feedbackDiv.style.margin = '10px';
    // 添加一些样式，让反馈消息更容易看到和区分
    feedbackDiv.style.position = 'fixed'; // 固定位置
    feedbackDiv.style.top = '10px'; // 距离顶部 10px
    feedbackDiv.style.right = '10px'; // 距离右侧 10px
    feedbackDiv.style.zIndex = '1000'; // 确保在其他内容之上
    feedbackDiv.style.borderRadius = '5px'; // 圆角
    feedbackDiv.style.opacity = '0.9'; // 半透明

    if (type ==='success') {
        feedbackDiv.style.backgroundColor = '#d4edda'; // 浅绿色背景
        feedbackDiv.style.color = '#155724'; // 深绿色文字
         feedbackDiv.style.border = '1px solid #c3e6cb'; // 绿色边框
    } else { // type === 'error'
        feedbackDiv.style.backgroundColor = '#f8d7da'; // 浅红色背景
        feedbackDiv.style.color = '#721c24'; // 深红色文字
         feedbackDiv.style.border = '1px solid #f5c6cb'; // 红色边框
    }
    feedbackDiv.textContent = message; // 设置文本内容
    return feedbackDiv; // 返回创建好的元素
}

// 函数：显示反馈消息
// message: 要显示的消息文本
// type: 'success' 或 'error'
// container: 将反馈消息添加到哪个 DOM 元素中 (通常是 document.body 或 #app)
function showFeedback(message: string, type: 'success' | 'error', container: HTMLElement) {
    const feedbackDiv = createFeedbackDiv(message, type); // 创建反馈元素
    container.appendChild(feedbackDiv); // 将反馈元素添加到容器中

    // 设置定时器，在 3 秒后自动移除反馈元素
    const timeoutId = setTimeout(() => {
        // === 关键修改：在移除元素之前，检查它是否仍然连接到父元素 ===
        // 使用 parentNode 属性来检查元素是否还在 DOM 中
        if (feedbackDiv.parentNode) {
             feedbackDiv.parentNode.removeChild(feedbackDiv); // 如果还在 DOM 中，则移除它
        }
        // 如果 feedbackDiv.parentNode 是 null，说明元素已经被移除了 (例如因为容器被清空)，
        // 此时不会尝试调用 removeChild，避免了错误。
    }, 3000);

    // 注意：如果你需要在其他地方（如清除 #app 时）手动取消这个反馈消息
    // 并清除定时器，你需要存储 timeoutId 和 feedbackDiv 的引用，并提供一个取消函数。
    // 但对于解决当前的 removeChild 错误，上面的检查是足够的。
}

// 导出 showFeedback 函数，供其他模块使用
export { showFeedback };
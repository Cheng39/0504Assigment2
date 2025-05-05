function createFeedbackDiv(message: string, type: 'success' | 'error') {
    const feedbackDiv = document.createElement('div');
    feedbackDiv.style.padding = '10px';
    feedbackDiv.style.margin = '10px';
    if (type ==='success') {
        feedbackDiv.style.backgroundColor = '#d4edda';
        feedbackDiv.style.color = '#155724';
    } else {
        feedbackDiv.style.backgroundColor = '#f8d7da';
        feedbackDiv.style.color = '#721c24';
    }
    feedbackDiv.textContent = message;
    return feedbackDiv;
}

function showFeedback(message: string, type: 'success' | 'error', container: HTMLElement) {
    const feedbackDiv = createFeedbackDiv(message, type);
    container.appendChild(feedbackDiv);
    // 3秒后自动移除提示框
    setTimeout(() => {
        container.removeChild(feedbackDiv);
    }, 3000);
}

export { showFeedback };
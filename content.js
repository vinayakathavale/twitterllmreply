// Function to add reply button to tweets
function addReplyButton(tweet) {
  if (tweet.querySelector('.gpt-reply-btn')) return;

  const replyButton = document.createElement('button');
  replyButton.className = 'gpt-reply-btn';
  replyButton.innerHTML = '🤖 GPT Reply';
  replyButton.style.cssText = `
    background-color: #1DA1F2;
    color: white;
    border: none;
    border-radius: 20px;
    padding: 8px 16px;
    margin-left: 8px;
    cursor: pointer;
    font-size: 14px;
  `;

  replyButton.addEventListener('click', async () => {
    const tweetText = tweet.querySelector('[data-testid="tweetText"]')?.textContent;
    if (!tweetText) return;

    replyButton.disabled = true;
    replyButton.textContent = 'Generating...';

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'generateReply',
        tweetText: tweetText
      });

      if (response.reply) {
        // Find the reply input and insert the generated text
        const replyInput = document.querySelector('[data-testid="tweetTextarea_0"]');
        if (replyInput) {
          replyInput.focus();
          document.execCommand('insertText', false, response.reply);
        }
      }
    } catch (error) {
      console.error('Error generating reply:', error);
    } finally {
      replyButton.disabled = false;
      replyButton.textContent = '🤖 GPT Reply';
    }
  });

  const actionsBar = tweet.querySelector('[role="group"]');
  if (actionsBar) {
    actionsBar.appendChild(replyButton);
  }
}

// Observer to watch for new tweets
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const tweets = node.querySelectorAll('[data-testid="tweet"]');
        tweets.forEach(addReplyButton);
      }
    });
  });
});

// Start observing
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Initial scan for existing tweets
document.querySelectorAll('[data-testid="tweet"]').forEach(addReplyButton); 
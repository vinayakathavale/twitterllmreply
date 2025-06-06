chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'generateReply') {
    generateReply(request.tweetText)
      .then(reply => sendResponse({ reply }))
      .catch(error => {
        console.error('Error:', error);
        sendResponse({ error: error.message });
      });
    return true; // Required for async sendResponse
  }
});

async function generateReply(tweetText) {
  // Get API key from storage
  const { openaiApiKey } = await chrome.storage.sync.get(['openaiApiKey']);
  if (!openaiApiKey) {
    throw new Error('Please set your OpenAI API key in the extension popup');
  }

  const prompt = `Generate a thoughtful and engaging reply to this tweet: "${tweetText}"
The reply should be:
- Natural and conversational
- Under 280 characters
- Relevant to the tweet's content
- Professional but friendly
- Avoid controversial or offensive content`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openaiApiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that generates engaging Twitter replies.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 150,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to generate reply');
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
} 
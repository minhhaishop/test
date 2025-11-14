(function() { // Báº¯t Ä‘áº§u IIFE
    let conversationId = null;
    let isOpen = false;

    function toggleAIChat() {
        isOpen = !isOpen;
        const chatWindow = document.getElementById('aiChatWindow');
        const aiButton = document.getElementById('aiButton');
        
        if (isOpen) {
            chatWindow.classList.add('show');
            aiButton.classList.add('hidden');
            document.getElementById('aiChatInput').focus();
        } else {
            chatWindow.classList.remove('show');
            aiButton.classList.remove('hidden');
        }
    }

    // HÃ m cuá»™n xuá»‘ng cuá»‘i (sá»­ dá»¥ng scrollTo thay vÃ¬ scrollTop)
    function scrollMessagesToBottom(behavior = 'smooth') {
        const messagesDiv = document.getElementById('aiChatMessages');
        if (!messagesDiv) return;
        
        // Sá»­ dá»¥ng scrollTo Ä‘á»ƒ cuá»™n mÆ°á»£t vÃ  Ä‘Ã¡ng tin cáº­y
        messagesDiv.scrollTo({
            top: messagesDiv.scrollHeight,
            behavior: behavior
        });
    }

    function addAIMessage(content, role) {
        const messagesDiv = document.getElementById('aiChatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `ai_message ${role}`;
        
        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'ai_message_bubble';
        bubbleDiv.textContent = content;
        
        messageDiv.appendChild(bubbleDiv);
        messagesDiv.appendChild(messageDiv);
        
        // Gá»i hÃ m cuá»™n xuá»‘ng (mÆ°á»£t hÆ¡n)
        scrollMessagesToBottom('smooth');
    }

    function showAITyping() {
        document.getElementById('aiTyping').classList.add('active');
        // Cuá»™n xuá»‘ng khi hiá»ƒn thá»‹ "typing"
        scrollMessagesToBottom('auto');
    }

    function hideAITyping() {
        document.getElementById('aiTyping').classList.remove('active');
    }

    function updateRateLimit(remaining) {
        const warningDiv = document.getElementById('rateLimitWarning');
        const remainingSpan = document.getElementById('remainingRequests');
        
        if (remaining !== undefined) {
            remainingSpan.textContent = remaining;
            if (remaining < 20) {
                warningDiv.style.display = 'block';
                warningDiv.style.background = remaining < 5 ? '#f8d7da' : '#fff3cd';
                warningDiv.style.color = remaining < 5 ? '#721c24' : '#856404';
            } else {
                warningDiv.style.display = 'none';
            }
        }
    }

    async function sendAIMessage() {
        const input = document.getElementById('aiChatInput');
        const sendBtn = document.getElementById('aiSendBtn');
        const message = input.value.trim();
        
        if (!message) return;

        addAIMessage(message, 'user');
        input.value = '';
        sendBtn.disabled = true;
        showAITyping();

        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    conversationId: conversationId
                })
            });

            const data = await response.json();

            if (response.status === 429) {
                addAIMessage('âš ï¸ Báº¡n Ä‘Ã£ háº¿t lÆ°á»£t há»i hÃ´m nay (100 cÃ¢u/ngÃ y). Vui lÃ²ng quay láº¡i vÃ o ngÃ y mai hoáº·c liÃªn há»‡ Ä‘á»ƒ nÃ¢ng cáº¥p.', 'assistant');
                updateRateLimit(0);
            } else if (data.success) {
                conversationId = data.conversationId;
                addAIMessage(data.response, 'assistant');
                updateRateLimit(data.remaining);
            } else {
                addAIMessage('âš ï¸ ' + (data.message || 'ÄÃ£ cÃ³ lá»—i xáº£y ra. Vui lÃ²ng thá»­ láº¡i.'), 'assistant');
            }
        } catch (error) {
            console.error('AI Chat Error:', error);
            addAIMessage('âš ï¸ KhÃ´ng thá»ƒ káº¿t ná»‘i Ä‘áº¿n server. Vui lÃ²ng kiá»ƒm tra káº¿t ná»‘i máº¡ng.', 'assistant');
        } finally {
            hideAITyping();
            sendBtn.disabled = false;
            input.focus();
            // Cuá»™n xuá»‘ng láº§n ná»¯a sau khi hoÃ n thÃ nh Ä‘á»ƒ Ä‘áº£m báº£o hiá»ƒn thá»‹ Ä‘á»§
            scrollMessagesToBottom('auto');
        }
    }

    // Enter Ä‘á»ƒ gá»­i tin nháº¯n
    document.addEventListener('DOMContentLoaded', function() {
        const input = document.getElementById('aiChatInput');
        const aiButton = document.getElementById('aiButton');
        
        if (input) {
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    sendAIMessage();
                }
            });
        }
        
        // ThÃªm sá»± kiá»‡n click cho nÃºt AI
        if (aiButton) {
            aiButton.querySelector('a').addEventListener('click', toggleAIChat);
        }
    });
})(); // Káº¿t thÃºc vÃ  thá»±c thi IIFE

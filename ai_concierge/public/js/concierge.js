const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const sessionId = 'web-' + Math.random().toString(36).substr(2, 9);
const roomNumber = localStorage.getItem('guest_room_number') || '103'; // Default to room 103 if not set
const guestName = localStorage.getItem('guest_name');
const guestEmail = localStorage.getItem('guest_email');
let isFirstMessage = true;

console.log('🏨 Room number:', roomNumber);
console.log('👤 Guest name:', guestName);

// Personalize welcome message with guest name
if (guestName) {
    const welcomeHeader = document.querySelector('.welcome-message h2');
    if (welcomeHeader) {
        welcomeHeader.textContent = `Welcome, ${guestName}!`;
    }
}

function addMessage(content, role) {
    if (isFirstMessage) {
        chatMessages.innerHTML = '';
        isFirstMessage = false;
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    const icon = document.createElement('div');
    icon.className = 'message-icon';
    icon.textContent = role === 'user' ? '👤' : '🏨';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = content;
    
    messageDiv.appendChild(icon);
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message assistant';
    typingDiv.id = 'typing-indicator';
    
    const icon = document.createElement('div');
    icon.className = 'message-icon';
    icon.textContent = '🏨';
    
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator active';
    indicator.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    
    typingDiv.appendChild(icon);
    typingDiv.appendChild(indicator);
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
        indicator.remove();
    }
}

async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    // Show restart button after first message
    const restartBtn = document.getElementById('restart-chat-btn');
    if (restartBtn && !restartBtn.classList.contains('visible')) {
        restartBtn.classList.add('visible');
    }

    // Add user message
    addMessage(message, 'user');
    messageInput.value = '';
    sendButton.disabled = true;
    
    showTypingIndicator();

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message, sessionId, roomNumber, guestName, guestEmail }),
        });

        if (!response.ok) {
            throw new Error('Failed to send message');
        }

        const data = await response.json();
        
        hideTypingIndicator();
        
        // Only show assistant message if there's a response (escalated sessions may return null)
        if (data.response) {
            addMessage(data.response, 'assistant');
        }
        
        // Check if chat should end (server automatically detects service tools)
        if (data.chatEnded) {
            // Chat has ended - show overlay and disable input
            console.log('✅ Chat ended. Task ID:', data.taskId);
            setTimeout(() => {
                showChatEndedOverlay();
            }, 6000); // 6 second delay for better UX
        }
        
    } catch (error) {
        hideTypingIndicator();
        addMessage('Sorry, I encountered an error. Please try again.', 'assistant');
        console.error('Error:', error);
    } finally {
        sendButton.disabled = false;
        messageInput.focus();
    }
}

function sendQuickMessage(message) {
    messageInput.value = message;
    sendMessage();
}

function showChatEndedOverlay() {
    const overlay = document.getElementById('chat-ended-overlay');
    const inputContainer = document.querySelector('.chat-input-container');
    
    overlay.classList.add('active');
    inputContainer.classList.add('disabled');
    messageInput.disabled = true;
    sendButton.disabled = true;
}

function restartChat() {
    // Clear session on server
    fetch(`/api/session/${sessionId}`, {
        method: 'DELETE'
    }).catch(err => console.error('Error clearing session:', err));
    
    // Reload the page to start fresh
    window.location.reload();
}

// New chat button event listener
document.addEventListener('DOMContentLoaded', () => {
    const newChatBtn = document.getElementById('new-chat-btn');
    if (newChatBtn) {
        newChatBtn.addEventListener('click', restartChat);
    }
});

sendButton.addEventListener('click', sendMessage);

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Focus input on load
messageInput.focus();

// Poll for new staff messages every 3 seconds
let pollingInterval = null;

function startPollingForMessages() {
    // Clear any existing interval
    if (pollingInterval) {
        clearInterval(pollingInterval);
    }
    
    pollingInterval = setInterval(async () => {
        try {
            const response = await fetch(`/api/check-messages/${sessionId}`);
            const data = await response.json();
            
            if (data.newMessages && data.newMessages.length > 0) {
                // Display each new message from staff
                for (const message of data.newMessages) {
                    addMessage(message, 'assistant');
                }
            }
        } catch (error) {
            console.error('Error polling for messages:', error);
        }
    }, 3000); // Poll every 3 seconds
}

// Start polling when page loads
startPollingForMessages();

// Stop polling when page is closed
window.addEventListener('beforeunload', () => {
    if (pollingInterval) {
        clearInterval(pollingInterval);
    }
});
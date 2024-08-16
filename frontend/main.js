window.global ||= window;


import { Amplify } from 'aws-amplify';
import outputs from './amplify_outputs.json';
import { Interactions } from '@aws-amplify/interactions';


Amplify.configure(outputs);
Amplify.configure({
  ...Amplify.getConfig(),
  Interactions: {
        LexV2: {
          'LexBot': {
            aliasId: 'TSTALIASID',
            botId: 'E4SWEVDU28',
            localeId: 'en_US',
            region: 'us-east-1'
          }
        }
      }
});

let sessionId = null; 

//Show chat
document.getElementById('chat-bubble').addEventListener('click', function() {
  const chatContainer = document.getElementById('chat-container');
  chatContainer.style.display = 'block';
  document.getElementById('chat-bubble').style.display='none';
  displayMessage("Agent", "Hello, thank you for contacting AnyCompany's AI Assistant. How can I help you today?")

});

//Hide chat
document.getElementById('close-button').addEventListener('click', function() {
  document.getElementById('chat-messages').innerHTML = '';
  const chatContainer = document.getElementById('chat-container');
  chatContainer.style.display = 'none';

});

function showLoadingAnimation() {
  // Create the loading animation div
  const chatMessages = document.getElementById('chat-messages');
  const loadingElement = document.createElement('div');
  loadingElement.classList.add('loading');
  
  // Add dots for loading animation
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement('span');
    dot.classList.add('dot');
    loadingElement.appendChild(dot);
  }
  
  // Append loading element to chatMessages
  chatMessages.appendChild(loadingElement);
  
  // Optional: Scroll to the loading element
  loadingElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

function hideLoadingAnimation() {
  const loadingElement = document.querySelector('.loading');
  if (loadingElement) {
    loadingElement.remove();
  }
}

//Format message into html
function convertToHTML(text) {

  // Convert newlines to <br> for paragraphs
  text = text.replace(/\n\n+/g, '</p><p>');
  text = '<p>' + text + '</p>';

  // Convert Markdown-like lists to HTML lists
  text = text.replace(/- (.+)/g, '<li>$1</li>'); 
  text = text.replace(/(<p>(?:<li>.+<\/li>\s*)+)<\/p>/g, '<ul>$1</ul>'); 

  return text;
}

function getSessionId() {
  if (!sessionId) {
    // Generate a new 15 digit session ID if it doesn't exist
    sessionId = (Math.floor(Math.random() * 900000000000000) + 100000000000000).toString();
  }
  return sessionId;
}

// Function to send message to Lex
async function sendMessageToLex(message) {

  try {
    const response = await Interactions.send({
      botName: "LexBot",
      message: message
    });

    console.log(response);
    // Hide Loading Animation
    hideLoadingAnimation();

    // Display Agent's message
    if (response && response['messages'] && response['messages'][0] && response['messages'][0]['content']){
      displayMessage('Agent', response['messages'][0]['content']);
    }
    else{
      displayMessage('Agent',"There's been an error please try again.");
    }
  } catch (error) {
    console.error('Error sending message to Lex:', error);
    // Handle error as needed
  }
 
 
}

// Function to handle user input
function handleUserInput(event) {
  // Get User Input
  event.preventDefault();
  const userInput = document.getElementById('user-input').value.trim();
  console.log(userInput);
  
  if (userInput === '') {
    return;
  }
  //Display User's message
  displayMessage('User', userInput);

  sendMessageToLex(userInput);
  document.getElementById('user-input').value = ''; // Clear input field after sending
}

// Event listener for form submission
document.getElementById('lex-form').addEventListener('submit', handleUserInput);

// Function to display messages in the chat
function displayMessage(sender, message) {
  const chatMessages = document.getElementById('chat-messages');
  const messageElement = document.createElement('div');
  if(sender=='User'){
    messageElement.classList.add('user-message');
    messageElement.textContent = `${message}`;
    chatMessages.appendChild(messageElement);
    //Make loading animation visible
    showLoadingAnimation();
    // console.log(`Current time is: ${new Date().toLocaleTimeString()}`);
  }
  else{
    //Format message and display
    messageElement.classList.add('agent-message');
    const htmlMessage = convertToHTML(message);
    messageElement.innerHTML = htmlMessage;
    chatMessages.appendChild(messageElement);
    
    // Scroll to top of the last user message 
    let userMessages = chatMessages.querySelectorAll('.user-message');
    let lastUserMessage = userMessages[userMessages.length - 1];
    if (lastUserMessage) {
      lastUserMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // console.log(`Current time is: ${new Date().toLocaleTimeString()}`);
  }
 
}

// Log message when DOM content is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('JavaScript loaded');
});

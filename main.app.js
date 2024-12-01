const API_KEY = config.API_KEY; // Use the API key from config.js
        const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
        const OPENAI_API_KEY = config.OPENAI_API_KEY;
        const OPENAI_API_URL = 'https://api.openai.com/v1/images/generations';
    
        const sidebar = document.getElementById('sidebar');
        const toggleSidebar = document.getElementById('toggle-sidebar');
        const modeToggle = document.getElementById('mode-toggle');
        const chatContainer = document.getElementById('chat-container');
        const userInput = document.getElementById('user-input');
        const sendButton = document.getElementById('send-button');
        const modal = document.getElementById('codeModal');
        const closeModal = document.getElementsByClassName('close')[0];
        const previewContainer = document.getElementById('preview-container');
    

        //modal-advanced
        const expandBtn = document.getElementById("expandBtn");
        const maximizeBtn = document.getElementById("maximizeBtn");
        const minimizeBtn = document.getElementById("minimizeBtn");
        const modalContent = document.querySelector(".modal-content");
        const header = document.querySelector(".header");
        const resizeHandles = document.querySelectorAll(".resize-handle");

        let isExpanded = false;
        let isMaximized = false;
        let originalSize = { width: modalContent.style.width, height: modalContent.style.height };
        let isDragging = false;
        let startX, startY, startLeft, startTop, startWidth, startHeight;
        let currentResizeHandle;

        // Expand button functionality
        expandBtn.onclick = function() {
            if (!isExpanded) {
                originalSize = { width: modalContent.style.width, height: modalContent.style.height };
                modalContent.style.width = "90%";
                modalContent.style.height = "90%";
                isExpanded = true;
            } else {
                modalContent.style.width = originalSize.width;
                modalContent.style.height = originalSize.height;
                isExpanded = false;
            }
        }

        // Maximize button functionality
        maximizeBtn.onclick = function() {
            if (!isMaximized) {
                originalSize = { width: modalContent.style.width, height: modalContent.style.height };
                modalContent.style.width = "100%";
                modalContent.style.height = "100%";
                modalContent.style.top = "0";
                modalContent.style.left = "0";
                modalContent.style.transform = "none";
                isMaximized = true;
            } else {
                modalContent.style.width = originalSize.width;
                modalContent.style.height = originalSize.height;
                modalContent.style.top = "50%";
                modalContent.style.left = "50%";
                modalContent.style.transform = "translate(-50%, -50%)";
                isMaximized = false;
            }
        }

        // Minimize button functionality
        minimizeBtn.onclick = function() {
            modal.style.display = "none";
        }

        // Dragging functionality
        header.onmousedown = function(e) {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startLeft = modalContent.offsetLeft;
            startTop = modalContent.offsetTop;
        }

        // Resizing functionality
        resizeHandles.forEach(handle => {
            handle.addEventListener('mousedown', (e) => {
                isResizing = true;
                currentResizeHandle = handle;
                startX = e.clientX;
                startY = e.clientY;
                startWidth = parseInt(document.defaultView.getComputedStyle(modalContent).width, 10);
                startHeight = parseInt(document.defaultView.getComputedStyle(modalContent).height, 10);
                document.addEventListener('mousemove', resize);
                document.addEventListener('mouseup', stopResize);
                e.preventDefault();
            });
        });

        function resize(e) {
            if (isResizing) {
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
        
                if (currentResizeHandle.classList.contains('bottom-right')) {
                    modalContent.style.width = `${startWidth + dx}px`;
                    modalContent.style.height = `${startHeight + dy}px`;
                } else if (currentResizeHandle.classList.contains('bottom-left')) {
                    modalContent.style.width = `${startWidth - dx}px`;
                    modalContent.style.height = `${startHeight + dy}px`;
                    modalContent.style.left = `${startLeft + dx}px`;
                } else if (currentResizeHandle.classList.contains('top-right')) {
                    modalContent.style.width = `${startWidth + dx}px`;
                    modalContent.style.height = `${startHeight - dy}px`;
                    modalContent.style.top = `${startTop + dy}px`;
                } else if (currentResizeHandle.classList.contains('top-left')) {
                    modalContent.style.width = `${startWidth - dx}px`;
                    modalContent.style.height = `${startHeight - dy}px`;
                    modalContent.style.top = `${startTop + dy}px`;
                    modalContent.style.left = `${startLeft + dx}px`;
                }
            }
        }

        function stopResize() {
            isResizing = false;
            document.removeEventListener('mousemove', resize);
        }

        document.onmousemove = function(e) {
            if (isDragging) {
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                modalContent.style.left = startLeft + dx + "px";
                modalContent.style.top = startTop + dy + "px";
            }
        }

        document.onmouseup = function() {
            isDragging = false;
        }


        toggleSidebar.addEventListener('click', () => {
            sidebar.classList.toggle('closed');
        });
    
        modeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            updateModeIcon();
        });
    
        function updateModeIcon() {
            const icon = modeToggle.querySelector('i');
            if (document.body.classList.contains('dark-mode')) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        }
    
        sendButton.addEventListener('click', sendMessage);
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    
        closeModal.onclick = function() {
            modal.style.display = "none";
        }
    
        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }


        //send message
        async function sendMessage() {
            const message = userInput.value.trim();
            if (!message) return;
        
            // Only add the message once at the beginning
            addMessageToChat('user', message);
            userInput.value = '';
        
            if (isExploringMusic) {
                await exploreMusicResults(message);
                isExploringMusic = false;
            } else {
                if (message.startsWith('search: ')) {
                    const searchQuery = message.replace('search: ', '').trim();
                    if (searchQuery) {
                        // Remove this line as we already added the message
                        // addMessageToChat('user', message);
                        await performWebSearch(searchQuery);
                        userInput.value = '';
                        searchInputActive = false;
                    }
                } else {
                    if (message || uploadedImage) {
                        let messageContent;
                        
                        if (uploadedImage) {
                            console.log("Uploaded image URL:", uploadedImage);
                    
                            const imgElement = document.createElement('img');
                            imgElement.src = `data:image/jpeg;base64,${uploadedImage}`;
                            imgElement.style.maxWidth = '100px';
                            imgElement.style.maxHeight = '100px';
                            imgElement.style.objectFit = 'contain';
                            imgElement.style.marginLeft = '10px';
                          
                            imgElement.onerror = function() {
                                console.error("Error loading image:", uploadedImage);
                                imgElement.alt = "Error loading image";
                            };
                    
                            const wrapper = document.createElement('div');
                            wrapper.style.display = 'flex';
                            wrapper.style.alignItems = 'center';
                            
                            if (message) {
                                const textSpan = document.createElement('span');
                                textSpan.textContent = message;
                                wrapper.appendChild(textSpan);
                            }
                            
                            wrapper.appendChild(imgElement);
                            messageContent = wrapper;
                    
                            fetchAIResponse(message || "Analyze this image and describe what you see:", uploadedImage);
                            uploadedImage = null;
                        } else {
                            messageContent = message;
                            fetchAIResponse(message);
                        }
                    
                        // Remove this line as we already added the message
                        // addMessageToChat('user', messageContent);
                        userInput.value = '';
                    }
                }
            
                chatContainer.scrollTop = chatContainer.scrollHeight;
            
                sendButton.disabled = true;
                setTimeout(() => {
                    sendButton.disabled = false;
                    userInput.focus();
                }, 1000);
            } 
        }
       
        // Add event listeners for sending messages
        sendButton.addEventListener('click', sendMessage);
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        // Helper function to check if string is base64
        function isBase64Image(str) {
            try {
                return btoa(atob(str)) == str;
            } catch (err) {
                return false;
            }
        }
      

     
        
        
        
    
    
        function generateAvatar(name) {
            const initials = name.split('').map(word => 
            word[0].toUpperCase()).join('').slice(0, 3);
    
            const color = generateColorFromName(name);
    
            return {
                initials,
                color
            };
        }
    
        function generateColorFromName(name) {
            let hash = 0;
            for (let i = 0; i < name.length; i++) {
                hash = name.charCodeAt(i) + ((hash << 5) - hash);
            }
            const color = ((hash & 0x00FFFFFF) ^ 0xAA).toString(16).toUpperCase();
            return `#${'00000'.slice(0, 6 - color.length)}${color}`;
        }
    
        //Updat themes
        const Modal =  document.getElementById("themeModal");
        const btn = document.getElementById("open-theme-modal");
        const span = document.getElementsByClassName("close")[0];
        const themeOptions = document.querySelectorAll(".theme-option");

        btn.onclick = function() {
            Modal.style.display = "block";
        }

        span.onclick = function() {
            Modal.style.display = "none";
        }

        window.onclick = function(event) {
            if (event.target == modal) {
                Modal.style.display = "none";
            }
        }

        themeOptions.forEach(option => {
            option.addEventListener("click", function() {
                const theme = this.getAttribute("data-theme");
                applyTheme(theme);
                themeOptions.forEach(opt => opt.classList.remove("selected"));
                this.classList.add("selected");
            });
        });

        function applyTheme(theme) {
            const svgContent = document.querySelector(`[data-theme="${theme}"] svg`).outerHTML;
            chatContainer.style.background = `url('data:image/svg+xml;charset=utf8,${encodeURIComponent(svgContent)}')`;
            chatContainer.style.backgroundSize = "cover";
            chatContainer.style.backgroundRepeat = "no-repeat";
            chatContainer.style.backgroundPosition = "center";
            
            // حفظ الثيم المختار في localStorage
            localStorage.setItem("selectedTheme", theme);
        }

        // استرجاع الثيم المحفوظ عند تحميل الصفحة
        document.addEventListener("DOMContentLoaded", function() {
            const savedTheme = localStorage.getItem("selectedTheme");
            if (savedTheme) {
                applyTheme(savedTheme);
                document.querySelector(`[data-theme="${savedTheme}"]`).classList.add("selected");
            }
        });

        
        let uploadedImage = null;
        //addMessage to chat
        function addMessageToChat(sender, message, videoResults = []) {
            const messageWrapper = document.createElement('div');
            messageWrapper.classList.add('message-wrapper');
            
            const avatarElement = document.createElement('img');
            avatarElement.classList.add('avatar');
        
            if (sender === 'user') {
                avatarElement.src = 'https://s.gravatar.com/avatar/0e984cbe5384a4cb7e3c2a2c1f6b1267?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fur.png';
                messageWrapper.classList.add('user-message-wrapper');
            } else {
                avatarElement.src = 'https://s.gravatar.com/avatar/0e984cbe5384a4cb7e3c2a2c1f6b1267?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fai.png';
                messageWrapper.classList.add('ai-message-wrapper');
            }
        
            const messageElement = document.createElement('div');
            messageElement.classList.add('message', `${sender}-message`);
        
            //
            
        if (typeof message === 'string') {
            messageElement.innerHTML = sender === 'user' ? message : formatResponse(message);
        } else if (message instanceof HTMLElement) {
            messageElement.appendChild(message);
        } else {
            console.error("Unexpected message type:", typeof message);
            messageElement.textContent = "Error displaying message";
        }
            // Add YouTube videos if available
            if (videoResults.length > 0) {
                const videoContainer = document.createElement('div');
                videoContainer.classList.add('video-container');
                videoContainer.innerHTML = '<h3>Related Videos</h3>';
                videoResults.forEach(video => {
                    videoContainer.innerHTML += `
                        <div class="video-item">
                            <h4>${video.title}</h4>
                            <iframe width="100%" height="315" src="https://www.youtube.com/embed/${video.videoId}" frameborder="0" allowfullscreen></iframe>
                        </div>
                    `;
                });
                messageElement.appendChild(videoContainer);
            }
        
            const messageActions = document.createElement('div');
            messageActions.classList.add('message-actions');
            
            const copyIcon = document.createElement('i');
            copyIcon.classList.add('fas', 'fa-copy', 'copy-icon');
            copyIcon.onclick = function() { copyMessage(messageElement); };
            
            const speakIcon = document.createElement('i');
            speakIcon.classList.add('fas', 'fa-volume-up', 'speak-icon');
            speakIcon.onclick = function() { speakMessage(messageElement); };
            
            messageActions.appendChild(copyIcon);
            messageActions.appendChild(speakIcon);
            
            messageElement.appendChild(messageActions);
        
            if (sender === 'user') {
                messageWrapper.appendChild(messageElement);
                messageWrapper.appendChild(avatarElement);
            } else {
                messageWrapper.appendChild(avatarElement);
                messageWrapper.appendChild(messageElement);
            }
        
            chatContainer.appendChild(messageWrapper);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        
            if (sender === 'ai') {
                hljs.highlightAll();
                setupCodeButtons();
            }
        }
          
      
    
   
      
        function copyMessage(messageElement) {
            const range = document.createRange();
            range.selectNode(messageElement);
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(range);
            document.execCommand('copy');
            window.getSelection().removeAllRanges();
            alert('Message copied to clipboard!');
        }

        function speakMessage(messageElement) {
            const textToSpeak = messageElement.innerText.replace(/[^\w\s.,?!]/gi, '');
            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            window.speechSynthesis.speak(utterance);
        }

      
        //ai answers
        async function fetchAIResponse(message, imageBase64 = null) {
            try {
                const body = {
                    contents: [{
                        parts: [{ text: message }]
                    }]
                };
        
                if (imageBase64) {
                    body.contents[0].parts.push({
                        inline_data: { mime_type: "image/jpeg", data: imageBase64 }
                    });
                }
        
                const response = await fetch(`${API_URL}?key=${API_KEY}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(body)
                });
        
                if (!response.ok) {
                    throw new Error('API request failed');
                }
        
                const data = await response.json();
                const aiResponse = data.candidates[0].content.parts[0].text;
        
                // Search for relevant YouTube videos
                const videoResults = await searchYouTubeVideos(aiResponse);
        
                addMessageToChat('ai', aiResponse, videoResults);
            } catch (error) {
                console.error('Error:', error);
                addMessageToChat('ai', 'Sorry, an error occurred while processing your request.');
            }
        }

        
        async function searchYouTubeVideos(query) {
            const YOUTUBE_API_KEY = config.YOUTUBE_API; // Replace with your actual YouTube API key
            const maxResults = 2; // Number of video results to fetch
        
            try {
                const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&key=${YOUTUBE_API_KEY}&type=video&maxResults=${maxResults}`);
                
                if (!response.ok) {
                    throw new Error('YouTube API request failed');
                }
        
                const data = await response.json();
                return data.items.map(item => ({
                    title: item.snippet.title,
                    videoId: item.id.videoId
                }));
            } catch (error) {
                console.error('Error searching YouTube:', error);
                return [];
            }
        }
       
        
        //generat image by open ai
        async function generateImage(prompt) {
            try {
                const response = await fetch(OPENAI_API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${OPENAI_API_KEY}`
                    },
                    body: JSON.stringify({
                        prompt: prompt,
                        n: 1,
                        size: "512x512"
                    })
                });
        
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`API request failed: ${errorData.error.message}`);
                }
        
                const data = await response.json();
                const imageUrl = data.data[0].url;
                addImageToChat(imageUrl);
            } catch (error) {
                console.error('Error:', error);
                addMessageToChat('ai', `An error occurred while creating the image: ${error.message}`);
            }
        }
       
        //add file image to analyse
        const fileUpload = document.getElementById('file-upload');
        const uploadButton = document.getElementById('upload-button');

        uploadButton.addEventListener('click', () => {
            fileUpload.click();
        });
        

        fileUpload.addEventListener('change', handleFileUpload);

        //Uploadign image
        function handleFileUpload(event) {
            const file = event.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    uploadedImage = e.target.result.split(',')[1];
                    addImageToChat(e.target.result);
                };
                reader.readAsDataURL(file);
            } else {
                alert('Please upload an image file.');
            }
        }

       

        async function analyzeImage(base64Image) {
            try {
                const response = await fetch(`${API_URL}?key=${API_KEY}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [
                                { text: "Analyze this image and describe what you see:" },
                                { inline_data: { mime_type: "image/jpeg", data: base64Image } }
                            ]
                        }]
                    })
                });
        
                if (!response.ok) {
                    throw new Error('API request failed');
                }
        
                const data = await response.json();
                const aiResponse = data.candidates[0].content.parts[0].text;
                addMessageToChat('ai', aiResponse);
            } catch (error) {
                console.error('Error:', error);
                addMessageToChat('ai', 'Sorry, an error occurred while analyzing the image.');
            }
        }
        
        //add image to chat
        function addImageToChat(imageUrl) {
            const messageWrapper = document.createElement('div');
            messageWrapper.classList.add('message-wrapper', 'user-message-wrapper');
            
            const avatarElement = document.createElement('img');
            avatarElement.classList.add('avatar');
            avatarElement.src = 'https://s.gravatar.com/avatar/0e984cbe5384a4cb7e3c2a2c1f6b1267?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fur.png';
            
            const messageElement = document.createElement('div');
            messageElement.classList.add('message', 'user-message');
            
            const imageElement = document.createElement('img');
            imageElement.src = imageUrl;
            imageElement.alt = 'Uploaded Image';
            imageElement.style.maxWidth = '100%';
            imageElement.style.height = 'auto';
            
            messageElement.appendChild(imageElement);
            messageWrapper.appendChild(messageElement);
            messageWrapper.appendChild(avatarElement);
            
            chatContainer.appendChild(messageWrapper);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
        
       
    
        function formatResponse(response) {
            response = response.replace(/\n\n/g, '</p><p>');
            response = '<p>' + response + '</p>';
            response = response.replace(/^### (.*$)/gim, '<h3>$1</h3>');
            response = response.replace(/^## (.*$)/gim, '<h2>$1</h2>');
            response = response.replace(/^# (.*$)/gim, '<h1>$1</h1>');
            response = response.replace(/^\s*(\d+\.|\*|\-)\s/gm, '<li>');
            response = response.replace(/<\/li>\s*<li>/g, '</li><li>');
            response = response.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
            response = response.replace(/\n?(\|[^\n]+\|)\n(\|[-:| ]+\|)(\n\|[^\n]+\|)+/g, match => {
                const rows = match.trim().split('\n');
                let table = '<div class="table-container"><div class="table-controls"><button onclick="downloadPDF(this)"> <i class="fas fa-download"></i> <i class="fas fa-file-pdf"></i> PDF</button> <button onclick="downloadCSV(this)"><i class="fas fa-download"></i> CSV  <i class="fa fa-file-csv"></i> </button><input type="color" id="color-picker" onchange="changeTableColor(this)"></div><table>';
                rows.forEach((row, index) => {
                    const cells = row.split('|').filter(cell => cell.trim() !== '');
                    const cellType = index === 0 ? 'th' : 'td';
                    table += `<tr>${cells.map(cell => `<${cellType}>${cell.trim()}</${cellType}>`).join('')}</tr>`;
                });
                table += '</table></div>';
                return table;
            });
            response = response.replace(/```(\w+)?\n([\s\S]+?)```/g, (match, language, code) => {
                return `<pre><code class="language-${language || ''}">${code.trim()}</code></pre>`;
            });
            response = response.replace(/`([^`]+)`/g, '<code>$1</code>');
            response = response.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            response = response.replace(/\*(.*?)\*/g, '<em>$1</em>');
            response = response.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
            response = response.replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>');
            response = response.replace(/^\-{3,}/gim, '<hr>');
            response = response.replace(/:([\w+-]+):/g, (match, emoji) => {
                return `<span class="emoji" title="${emoji}">&#x${emojiMap[emoji] || '2753'};</span>`;
            });
            return response;
            // التعامل مع عناصر iframe الخاصة بفيديوهات يوتيوب
            response = response.replace(/<iframe.*?<\/iframe>/g, match => `<div class="video-container">${match}</div>`);
            return response;
        }
    
        function setupCodeButtons() {
            const codeBlocks = document.querySelectorAll('pre');
            codeBlocks.forEach(block => {
                if (!block.querySelector('.copy-button')) {
                    const copyButton = document.createElement('button');
                    copyButton.textContent = 'Copy';
                    copyButton.className = 'copy-button';
                    copyButton.onclick = function() { copyCode(this); };
                    block.appendChild(copyButton);
                }
    
                if (!block.querySelector('.run-button')) {
                    const runButton = document.createElement('button');
                    runButton.textContent = 'Run';
                    runButton.className = 'run-button';
                    runButton.onclick = function() { runCode(this); };
                    block.appendChild(runButton);
                }
            });
        }
    
        function copyCode(button) {
            const pre = button.parentElement;
            const code = pre.querySelector('code');
            const range = document.createRange();
            range.selectNode(code);
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(range);
            document.execCommand('copy');
            window.getSelection().removeAllRanges();
            button.textContent = 'Copied!';
            setTimeout(() => { button.textContent = 'Copy'; }, 2000);
        }
    
        function runCode(button) {
            const pre = button.parentElement;
            const code = pre.querySelector('code').textContent;
            previewContainer.innerHTML = code;
            modal.style.display = "block";
        }
    
        function downloadPDF(button) {
            const table = button.closest('.table-container').querySelector('table');
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            doc.autoTable({ html: table });
            doc.save('table.pdf');
        }
    
        function downloadCSV(button) {
            const table = button.closest('.table-container').querySelector('table');
            const data = [];
            const rows = table.querySelectorAll('tr');
            rows.forEach(row => {
                const rowData = [];
                const cells = row.querySelectorAll('th, td');
                cells.forEach(cell => rowData.push(cell.textContent));
                data.push(rowData);
            });
            const csv = Papa.unparse(data);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            if (navigator.msSaveBlob) {
                navigator.msSaveBlob(blob, 'table.csv');
            } else {
                link.href = URL.createObjectURL(blob);
                link.download = 'table.csv';
                link.click();
            }
        }
    
        function changeTableColor(input) {
            const table = input.closest('.table-container').querySelector('table');
            table.style.backgroundColor = input.value;
        }

        let conversationContext = [];


    
        const emojiMap = {
            'smile': '1F604',
            'laugh': '1F606',
            'wink': '1F609',
            'heart': '2764',
            'thumbsup': '1F44D',
            'thumbsdown': '1F44E',
            'fire': '1F525',
            'rocket': '1F680',
            'star': '2B50',
        };
    
        // Initial welcome message
        addMessageToChat('ai', 'Hello! How can I assist you today?\n\nI\'m an advanced AI assistant capable of helping with a wide range of tasks, including:\n\n1. Answering questions\n2. Providing detailed explanations\n3. Offering creative suggestions\n4. Helping with complex analysis\n5. Explanation Youtube videos\n6. Image Analysis 📷\n7. Assisting with coding tasks\n8. Creating and formatting tables\n9. Using emojis for expressive communication :smile:\n\nFeel free to ask me anything, and I\'ll do my best to help! :rocket:');

        let searchInputActive = false;

        const GOOGLE_CUSTOM_SEARCH_API = 'AIzaSyBBUwMprkZMbvnwREN4ftVjGazslWfa1J8';
        const SEARCH_ENGINE_ID = 'cx=27c1f70699449462f';

        userInput.addEventListener('input', function(e) {
            if (e.target.value === '/') {
                showSearchSuggestion();
            }
        });
        
        function showSearchSuggestion() {
            const searchSuggestion = document.createElement('div');
            searchSuggestion.className = 'search-suggestion';
            searchSuggestion.innerHTML = `
                <div class="search-option">
                    <i class="fas fa-search"></i>
                    <span>Search by web</span>
                </div>
            `;
            
            // Position the suggestion below the input
            const inputRect = userInput.getBoundingClientRect();
            searchSuggestion.style.position = 'absolute';
            searchSuggestion.style.left = `${inputRect.left}px`;
            searchSuggestion.style.top = `${inputRect.bottom - 200}px`;
            searchSuggestion.style.backgroundColor = 'var(--music-content)'; 
            searchSuggestion.style.padding = '10px';
            searchSuggestion.style.borderRadius = '10px';
            searchSuggestion.style.cursor = 'pointer'
            
            document.body.appendChild(searchSuggestion);
            
            searchSuggestion.onclick = function() {
                searchInputActive = true;
                userInput.value = 'search: ';
                userInput.style.color = '#2196f3'
                userInput.focus();
                searchSuggestion.remove();
            };
            
            // Remove suggestion when clicking outside
            document.addEventListener('click', function removeSuggestion(e) {
                if (!searchSuggestion.contains(e.target) && e.target !== userInput) {
                    searchSuggestion.remove();
                    document.removeEventListener('click', removeSuggestion);
                }
            });
        }
        async function performWebSearch(query) {
            try {
                addMessageToChat('ai', '<div class="loading">Searching...</div>');
        
                // Get AI Summary from Gemini API
                const aiSummaryResponse = await fetch(`${API_URL}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${API_KEY}`
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: `Search query: ${query}\nProvide a brief summary and analysis of this topic.`
                            }]
                        }]
                    })
                });
                const aiSummaryData = await aiSummaryResponse.json();
                const aiSummary = aiSummaryData.candidates[0].content.parts[0].text;
        
                // Web Search Results
                const webResponse = await fetch(
                    `https://customsearch.googleapis.com/customsearch/v1?key=${GOOGLE_CUSTOM_SEARCH_API}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}`
                );
                const webData = await webResponse.json();
                const webResults = webData.items || [];
        
                // Image Search Results
                const imageResponse = await fetch(
                    `https://customsearch.googleapis.com/customsearch/v1?key=${GOOGLE_CUSTOM_SEARCH_API}&cx=${SEARCH_ENGINE_ID}&searchType=image&q=${encodeURIComponent(query)}`
                );
                const imageData = await imageResponse.json();
                const imageResults = imageData.items || [];
        
                // YouTube Search Results using your existing YouTube API function
                const videoResults = await searchYouTubeVideos(query);
        
                // Remove loading message
                const loadingMessages = document.querySelectorAll('.loading');
                loadingMessages.forEach(msg => msg.remove());
        
                // Display formatted results
                const resultHTML = `
                    <div class="search-results">
                        <div class="ai-summary">
                            <h3>AI Analysis</h3>
                            <p>${aiSummary}</p>
                        </div>
        
                        ${imageResults.length ? `
                            <div class="image-results">
                                <h3>Images</h3>
                                <div class="image-grid">
                                    ${imageResults.slice(0, 4).map(img => `
                                        <div class="image-item">
                                            <img src="${img.link}" alt="${img.title || 'Search result'}" 
                                                 onerror="this.onerror=null;this.src='placeholder.jpg';">
                                            <div class="image-caption">${img.title || ''}</div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
        
                        ${webResults.length ? `
                            <div class="web-results">
                                <h3>Web Results</h3>
                                ${webResults.slice(0, 5).map(result => `
                                    <div class="web-result">
                                        <a href="${result.link}" target="_blank" rel="noopener noreferrer">
                                            <h4>${result.title}</h4>
                                        </a>
                                        <p class="result-url">${result.displayLink}</p>
                                        <p class="snippet">${result.snippet}</p>
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
        
                        ${videoResults.length ? `
                            <div class="video-results">
                                <h3>Videos</h3>
                                <div class="video-grid">
                                    ${videoResults.slice(0, 3).map(video => `
                                        <div class="video-item">
                                            <iframe 
                                                width="100%" 
                                                height="200" 
                                                src="https://www.youtube.com/embed/${video.videoId}"
                                                frameborder="0" 
                                                allowfullscreen>
                                            </iframe>
                                            <h4>${video.title}</h4>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                `;
        
                // Add the formatted results to the chat
                addMessageToChat('ai', resultHTML);
        
            } catch (error) {
                console.error('Search error:', error);
                addMessageToChat('ai', `
                    <div class="error-message">
                        Sorry, an error occurred during the search. Please try again later.
                        <br>Error details: ${error.message}
                    </div>
                `);
            }
        }
        async function searchWeb(query) {
            const response = await fetch(
                `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_CUSTOM_SEARCH_API}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}`
            );
            const data = await response.json();
            return data.items || [];
        }
        
        async function searchImages(query) {
            const response = await fetch(
                `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_CUSTOM_SEARCH_API}&cx=${SEARCH_ENGINE_ID}&searchType=image&q=${encodeURIComponent(query)}`
            );
            const data = await response.json();
            return data.items || [];
        }
        
        function displaySearchResults(query, webResults, imageResults, videoResults) {
            const resultHTML = `
                <div class="search-results">
                    <div class="ai-summary">
                        <h3>AI Summary</h3>
                        <p>Here are the search results for: "${query}"</p>
                    </div>
                    
                    ${imageResults.length ? `
                        <div class="image-results">
                            <h3>Images</h3>
                            <div class="image-grid">
                                ${imageResults.slice(0, 4).map(img => `
                                    <img src="${img.link}" alt="${img.title}" 
                                         onclick="openImageModal('${img.link}')"
                                         loading="lazy">
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${webResults.length ? `
                        <div class="web-results">
                            <h3>Web Results</h3>
                            ${webResults.slice(0, 5).map(result => `
                                <div class="web-result">
                                    <a href="${result.link}" target="_blank" rel="noopener">
                                        <h4>${result.title}</h4>
                                    </a>
                                    <p class="snippet">${result.snippet}</p>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                    
                    ${videoResults.length ? `
                        <div class="video-results">
                            <h3>Related Videos</h3>
                            <div class="video-grid">
                                ${videoResults.map(video => `
                                    <div class="video-item">
                                        <h4>${video.title}</h4>
                                        <iframe width="100%" height="215" 
                                                src="https://www.youtube.com/embed/${video.videoId}" 
                                                frameborder="0" 
                                                allowfullscreen></iframe>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
            
            addMessageToChat('ai', resultHTML);
        }
        
     
        // Add this CSS to your stylesheet
const searchStyles = `

    :root {
      
        --music-primary: #1DB954;
        --music-secondary: #191414;
        --music-gradient-1: #1DB954;
        --music-gradient-2: #169144;
        --music-card-bg: #ffffff;
        --music-content: #fff;
        --music-text: #333333;
        --music-hover: #f0f0f0;
        --music-overlay: rgba(0, 0, 0, 0.7);
    }

    .dark-mode {

        --music-primary: #1ed760;
        --music-secondary: #282828;
        --music-gradient-1: #1ed760;
        --music-gradient-2: #169144;
        --music-card-bg: #181818;
        --music-content: #191919;
        --music-text: #ffffff;
        --music-hover: #282828;
        --music-overlay: rgba(0, 0, 0, 0.85);
    }

    .search-suggestion{
        background-color:  var(--music-content);
        padding: 10px;
    }
    
    .search-results {
        max-width: 100%;
        background-color: var(--music-content);
        color: var(--text-color);
        padding: 15px;
        background: #fff;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .search-results h3 {
        color: #1a73e8;
        margin-bottom: 15px;
        padding-bottom: 5px;
        border-bottom: 2px solid #e8eaed;
    }

    .ai-summary {
        background: #f8f9fa;
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 20px;
    }

    .image-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 15px;
        margin-bottom: 20px;
    }

    .image-item {
        position: relative;
        overflow: hidden;
        border-radius: 8px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }

    .image-item img {
        width: 100%;
        height: 150px;
        object-fit: cover;
        transition: transform 0.3s ease;
    }

    .image-item:hover img {
        transform: scale(1.05);
    }

    .image-caption {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(0,0,0,0.7);
        color: white;
        padding: 5px;
        font-size: 12px;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
    }

    .web-result {
        padding: 15px;
        margin-bottom: 15px;
        border-bottom: 1px solid #e8eaed;
    }

    .web-result:last-child {
        border-bottom: none;
    }

    .web-result a {
        text-decoration: none;
        color: #1a0dab;
    }

    .web-result h4 {
        margin: 0 0 5px 0;
    }

    .result-url {
        color: #006621;
        font-size: 14px;
        margin: 0 0 5px 0;
    }

    .snippet {
        color: #545454;
        font-size: 14px;
        line-height: 1.4;
        margin: 0;
    }

    .video-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
        margin-top: 15px;
    }

    .video-item {
        background: #f8f9fa;
        border-radius: 8px;
        overflow: hidden;
    }

    .video-item h4 {
        padding: 10px;
        margin: 0;
        font-size: 14px;
    }

    .loading {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px;
        color: #666;
    }

    .error-message {
        color: #d32f2f;
        padding: 15px;
        background: #fde8e8;
        border-radius: 8px;
        margin-top: 10px;
    }

    @media (max-width: 768px) {
        .image-grid {
            grid-template-columns: repeat(2, 1fr);
        }
        
        .video-grid {
            grid-template-columns: 1fr;
        }
    }
`;


      

// Add to your existing variables
let isExploringMusic = false;
const SPOTIFY_CLIENT_ID = '0af62921a92b42fa9e16f9cb39c3afe5';
const SPOTIFY_CLIENT_SECRET = 'fda4a3f29ded406987108e337b176bed';



//handleCommands to properly handle music exploration
function handleCommands(input) {
    if (input === '/') {
        const suggestions = `
            <div class="command-suggestions">
                <div class="command-item" onclick="selectCommand('explore music')" style=" color: #2196f3;">
                    <i class="fas fa-music"></i>
                    <span>Explore Music</span>
                    <small>Discover and play music</small>
                </div>
            </div>
        `;
        
        // Remove any existing suggestions
        document.querySelector('.suggestions-container')?.remove();
        
        const suggestionBox = document.createElement('div');
        suggestionBox.className = 'suggestions-container';
        suggestionBox.innerHTML = suggestions;
        
        const inputRect = userInput.getBoundingClientRect();
        suggestionBox.style.position = 'absolute';
        suggestionBox.style.left = `${inputRect.left}px`;
        suggestionBox.style.bottom = `${window.innerHeight - inputRect.top + 5}px`;
        
        document.body.appendChild(suggestionBox);
        
        document.addEventListener('click', function removeSuggestions(e) {
            if (!suggestionBox.contains(e.target) && e.target !== userInput) {
                suggestionBox.remove();
                document.removeEventListener('click', removeSuggestions);
            }
        });
    }
}

// Function to select a command
function selectCommand(command) {
    userInput.value = command;
    document.querySelector('.suggestions-container')?.remove();
    if (command === 'explore music') {
        isExploringMusic = true;
        addMessageToChat('ai', `
            <div class="music-explore-prompt">
                <i class="fas fa-music pulse"></i>
                <h3>Music Explorer</h3>
                <p>What kind of music would you like to explore?</p>
                <div class="music-suggestions">
                    <span onclick="setMusicQuery('Pop hits')">Pop</span>
                    <span onclick="setMusicQuery('Rock classics')">Rock</span>
                    <span onclick="setMusicQuery('Jazz')">Jazz</span>
                    <span onclick="setMusicQuery('Classical')">Classical</span>
                    <span onclick="setMusicQuery('Hip hop')">Hip Hop</span>
                    <span onclick="setMusicQuery('Educational')">Educational</span>
                    <span onclick="setMusicQuery('Workout')">Workout</span>
                    <span onclick="setMusicQuery('Phonk')">Phonk</span>
                    <span onclick="setMusicQuery('TV & Movies')">TV & Movies</span>
                    <span onclick="setMusicQuery('Anime')">Anime</span>
                    <span onclick="setMusicQuery('Travel')">Travel</span>
                    <span onclick="setMusicQuery('Gaming')">Gaming</span>
                </div>
                <small>Or type your own music preference...</small>
            </div>
        `);
    }
}

// Function to set music query
function setMusicQuery(query) {
    userInput.value = query;
    sendMessage();
}



// Function to get Spotify access token
async function getSpotifyToken() {
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET)
        },
        body: 'grant_type=client_credentials'
    });
    const data = await response.json();
    return data.access_token;
}

// Function to explore music
async function exploreMusicResults(query) {
    try {
        addMessageToChat('ai', '<div class="loading-music">🎵 Searching for amazing music...</div>');

        const token = await getSpotifyToken();
        const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=12`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();

        const musicResults = `
            <div class="music-results">
                <h3>🎵 Music Recommendations for "${query}"</h3>
                <div class="music-grid">
                    ${data.tracks.items.map(track => `
                        <div class="music-card">
                            <div class="music-image">
                                <img src="${track.album.images[0].url}" alt="${track.name}">
                                <div class="play-overlay">
                                    <audio class="audio-player" controls>
                                        <source src="${track.preview_url}" type="audio/mpeg">
                                    </audio>
                                </div>
                            </div>
                            <div class="music-info">
                                <h4>${track.name}</h4>
                                <p>${track.artists.map(artist => artist.name).join(', ')}</p>
                                <a href="${track.external_urls.spotify}" target="_blank" class="spotify-link">
                                    <i class="fab fa-spotify"></i> Open in Spotify
                                </a>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="music-footer">
                    <button onclick="exploreSimilar('${query}')">Show Similar</button>
                    <button onclick="exploreNewGenre()">New Genre</button>
                </div>
            </div>
        `;

        // Remove loading message
        document.querySelector('.loading-music')?.remove();
        
        addMessageToChat('ai', musicResults);

    } catch (error) {
        console.error('Music exploration error:', error);
        addMessageToChat('ai', `
            <div class="error-message">
                Sorry, I couldn't fetch music recommendations at the moment.
                Please try again later.
            </div>
        `);
    }
}

// Add these new functions
function exploreNewGenre() {
    isExploringMusic = true;
    addMessageToChat('ai', `
        <div class="music-explore-prompt">
            <i class="fas fa-music pulse"></i>
            <h3>Music Explorer</h3>
            <p>What kind of music would you like to explore?</p>
            <div class="music-suggestions">
                <span onclick="setMusicQuery('Pop hits')">Pop</span>
                <span onclick="setMusicQuery('Rock classics')">Rock</span>
                <span onclick="setMusicQuery('Jazz')">Jazz</span>
                <span onclick="setMusicQuery('Classical')">Classical</span>
                <span onclick="setMusicQuery('Hip hop')">Hip Hop</span>
            </div>
            <small>Or type your own music preference...</small>
        </div>
    `);
}

async function exploreSimilar(query) {
    isExploringMusic = true;
    await exploreMusicResults(`Similar to ${query}`);
}


// Add these styles to your CSS
const musicStyles = `
:root {
    --primary: #1db954;
    --secondary: #121212;
    --text: #ffffff;
    --text-secondary: #b3b3b3;
    --shadow: rgba(0, 0, 0, 0.2);
    --card-bg: #181818;
    --hover-bg: #282828;

    --music-primary: #1DB954;
    --music-secondary: #191414;
    --music-gradient-1: #1DB954;
    --music-gradient-2: #169144;
    --music-card-bg: #ffffff;
    --music-text: #333333;
    --music-hover: #f0f0f0;
    --music-content: #fff;
    --music-overlay: rgba(0, 0, 0, 0.7);
    --music-shadow: rgba(0, 0, 0, 0.1);
    --music-border: rgba(0, 0, 0, 0.1);
  }

    .dark-mode {
    --primary: #1db954;
    --secondary: #121212;
    --text: #ffffff;
    --text-secondary: #b3b3b3;
    --shadow: rgba(0, 0, 0, 0.2);
    --card-bg: #181818;
    --hover-bg: #282828;
    --music-primary: #1ed760;
    --music-primary: #1ed760;
    --music-secondary: #282828;
    --music-gradient-1: #1ed760;
    --music-gradient-2: #169144;
    --music-card-bg: #333;
    --music-content: #191919;
    --music-text: #ffffff;
    --music-hover: #282828;
    --music-overlay: rgba(0, 0, 0, 0.85);
    --music-shadow: rgba(0, 0, 0, 0.3);
    --music-border: rgba(255, 255, 255, 0.1);
    }

  .command-suggestions {
        background: var(--music-card-bg);
        border-radius: 12px;
        box-shadow: 0 4px 20px var(--music-shadow);
        padding: 10px;
        box-shadow: var(--shadow);
        background-color: var(--music-content);
        width: 100%;
        border: 1px solid var(--music-border);
    }
    
    .command-item {
        display: block; 
        align-items: center;
        padding: 14px;
        cursor: pointer;
        border-radius: 8px;
        transition: all 0.3s ease;
        color: var(--music-text);
        border: 1px solid transparent;
    }
    
    .command-item:hover {
        background: var(--music-hover);
        border-color: var(--music-primary);
    }
    
    .command-item i {
    margin-right: 14px;
    font-size: 22px;
    color: var(--music-primary);
    transition: transform 0.3s ease;
    }
    
    .command-item:hover i {
    transform: scale(1.1);
    }
    
    .command-item span {
    font-weight: 500;
    font-size: 15px;
    }
    
    .command-item small {
    color: var(--music-text);
    opacity: 0.7;
    display: block;
    font-size: 13px;
    margin-top: 4px;
    }
    
    .music-explore-prompt {
    text-align: center;
    padding: 25px;
    background: linear-gradient(135deg, var(--music-gradient-1), var(--music-gradient-2));
    border-radius: 16px;
    color: #ffffff;
    box-shadow: 0 8px 32px var(--music-shadow);
    }
    
    .music-explore-prompt i {
    font-size: 48px;
    margin-bottom: 20px;
    text-shadow: 0 2px 10px var(--music-overlay);
    }
    
    .music-explore-prompt h3 {
    font-size: 24px;
    margin-bottom: 15px;
    font-weight: 600;
    }
  .music-results {
    width: 90%;
    max-width: 1100px;
    margin: 0 auto;
    color: var(--text-color);
    padding: 15px;
    background-color: var(--music-card-bg);
    border-radius: 8px;
  }
  
  .music-results h3 {
    font-size: 1.2rem;
    color: var(--text-color);
    margin-bottom: 15px;
    text-align: center;
  }
  
  .music-grid {
    display: grid;
    width: 90%;
    max-width: 1100px;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    bckground-color:  var(--music-content);
    gap: 15px;
  }
  
  .music-card {
    background: var(--card-bg);
    border-radius: 12px;
    overflow: hidden;
    padding: 10px;
    transition: transform 0.2s ease;
  }
  
  .music-card:hover {
    transform: translateY(-3px);
  }
  
  .music-image {
    position: relative;
    padding-top: 100%;
  }
  
  .music-image img {
    position: absolute;
    top: 0;
    border-radius: 12px;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .play-overlay {
    position: absolute;
    bottom: 0;
    width: 100%;
    background: rgba(0, 0, 0, 0.8);
    padding: 8px;
    transform: translateY(100%);
    transition: transform 0.2s ease;
  }
  
  .music-card:hover .play-overlay {
    transform: translateY(0);
  }
  
  .audio-player {
    width: 90%;
    height: 30px;
    margin: 0 auto;
    color: var(--text-color);
  }
  
  .music-info {
    padding: 10px;
  }
  
  .music-info h4 {
    font-size: 0.9rem;
    color: var(--text);
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .music-info p {
    font-size: 0.8rem;
    color: var(--text-secondary);
    margin: 5px 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .spotify-link {
    display: inline-flex;
    align-items: center;
    font-size: 0.8rem;
    color: var(--primary);
    text-decoration: none;
    padding: 5px 10px;
    border-radius: 15px;
    background: rgba(29, 185, 84, 0.1);
  }
  
  .spotify-link i {
    margin-right: 5px;
  }
  
  .music-footer {
    margin-top: 15px;
    display: flex;
    justify-content: center;
    gap: 10px;
  }
  
  .music-footer button {
    padding: 8px 16px;
    border: none;
    border-radius: 20px;
    background: var(--primary);
    color: var(--text);
    font-size: 0.9rem;
    cursor: pointer;
  }
  
  .music-explore-prompt {
    background: linear-gradient(135deg, var(--primary), #168f47);
    padding: 15px;
    border-radius: 8px;
    text-align: center;
    color: var(--text);
  }
  
  .music-suggestions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
    margin: 10px 0;
  }
  
  .music-suggestions span {
    padding: 5px 12px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 15px;
    cursor: pointer;
    font-size: 0.9rem;
  }
  
  @media (max-width: 600px) {
    .music-grid {
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    }
    
    .music-info h4 {
      font-size: 0.8rem;
    }
    
    .music-info p {
      font-size: 0.7rem;
    }
    
    .spotify-link {
      font-size: 0.7rem;
    }
  }
`;

// Add the styles to the document
if (!document.querySelector('#music-styles')) {
    const styleSheet = document.createElement("style");
    styleSheet.id = 'music-styles';
    styleSheet.textContent = musicStyles;
    document.head.appendChild(styleSheet);
}

// Add event listener for commands
userInput.addEventListener('input', (e) => {
    handleCommands(e.target.value);
});

function showLoadingIndicator() {
    const loadingDiv = document.createElement('div');
    loadingDiv.classList.add('loading-indicator');
    loadingDiv.innerHTML = 'AI is thinking...';
    chatContainer.appendChild(loadingDiv);
    return loadingDiv;
}

function removeLoadingIndicator(loadingDiv) {
    if (loadingDiv && loadingDiv.parentNode) {
        loadingDiv.parentNode.removeChild(loadingDiv);
    }
}

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
        function sendMessage() {
            const message = userInput.value.trim();
            if (message || uploadedImage) {
                let messageContent;
                
                if (uploadedImage) {
                    console.log("Uploaded image URL:", uploadedImage); // للتحقق من الصحة
        
                    // Create an image element
                    const imgElement = document.createElement('img');
                    imgElement.src = `data:image/jpeg;base64,${uploadedImage}`; // تعديل هنا
                    imgElement.style.maxWidth = '100px';
                    imgElement.style.maxHeight = '100px';
                    imgElement.style.objectFit = 'contain';
                    imgElement.style.marginLeft = '10px';
                  
        
                    // Add error handling for image loading
                    imgElement.onerror = function() {
                        console.error("Error loading image:", uploadedImage);
                        imgElement.alt = "Error loading image";
                    };
        
                    // Create a wrapper for text and image
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
        
                addMessageToChat('user', messageContent);
                userInput.value = '';
            }
        }
      

        sendButton.addEventListener('click', sendMessage);
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
        
        
    
    
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

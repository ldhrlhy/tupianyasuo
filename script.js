// 获取DOM元素
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const previewContainer = document.getElementById('previewContainer');
const originalImage = document.getElementById('originalImage');
const compressedImage = document.getElementById('compressedImage');
const originalSize = document.getElementById('originalSize');
const compressedSize = document.getElementById('compressedSize');
const qualitySlider = document.getElementById('qualitySlider');
const qualityValue = document.getElementById('qualityValue');
const downloadBtn = document.getElementById('downloadBtn');

let currentFile = null;

// 处理文件上传
function handleFileSelect(file) {
    if (!file.type.match('image.*')) {
        alert('请上传图片文件！');
        return;
    }

    currentFile = file;
    originalSize.textContent = formatFileSize(file.size);

    const reader = new FileReader();
    reader.onload = function(e) {
        originalImage.src = e.target.result;
        compressImage(file, qualitySlider.value / 100);
    };
    reader.readAsDataURL(file);
    previewContainer.style.display = 'block';
}

// 压缩图片
async function compressImage(file, quality) {
    try {
        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            quality: quality
        };

        const compressedFile = await imageCompression(file, options);
        compressedSize.textContent = formatFileSize(compressedFile.size);

        const reader = new FileReader();
        reader.onload = function(e) {
            compressedImage.src = e.target.result;
        };
        reader.readAsDataURL(compressedFile);

        // 更新下载按钮
        downloadBtn.onclick = () => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(compressedFile);
            link.download = `compressed_${file.name}`;
            link.click();
        };
    } catch (error) {
        console.error('压缩失败:', error);
        alert('图片压缩失败，请重试！');
    }
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 事件监听
dropZone.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) {
        handleFileSelect(e.target.files[0]);
    }
});

qualitySlider.oninput = (e) => {
    qualityValue.textContent = e.target.value + '%';
    if (currentFile) {
        compressImage(currentFile, e.target.value / 100);
    }
};

// 拖拽上传
dropZone.ondragover = (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#007AFF';
};

dropZone.ondragleave = () => {
    dropZone.style.borderColor = '#E5E5E5';
};

dropZone.ondrop = (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#E5E5E5';
    if (e.dataTransfer.files.length) {
        handleFileSelect(e.dataTransfer.files[0]);
    }
};

// 标签切换功能
const tabBtns = document.querySelectorAll('.tab-btn');
const toolPanels = document.querySelectorAll('.tool-panel');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // 更新标签按钮状态
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // 显示对应的工具面板
        const toolId = btn.dataset.tool + '-panel';
        toolPanels.forEach(panel => {
            panel.style.display = panel.id === toolId ? 'block' : 'none';
        });
    });
});

// JSON格式化功能
const jsonInput = document.getElementById('jsonInput');
const jsonOutput = document.getElementById('jsonOutput');
const formatBtn = document.getElementById('formatBtn');

// 添加防抖函数
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}

// 格式化 JSON 的函数
function formatJSON(value) {
    try {
        if (!value.trim()) {
            jsonOutput.textContent = '';
            return;
        }
        // 解析并格式化 JSON
        const jsonObj = JSON.parse(value);
        // 使用语法高亮格式化 JSON
        const formattedJson = syntaxHighlight(JSON.stringify(jsonObj, null, 4));
        jsonOutput.innerHTML = formattedJson;
        jsonOutput.style.color = '#1D1D1F';
    } catch (error) {
        // 显示错误信息
        jsonOutput.textContent = '错误：无效的 JSON 格式\n' + error.message;
        jsonOutput.style.color = '#FF3B30';
    }
}

// JSON 语法高亮函数
function syntaxHighlight(json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        let cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}

// 使用防抖处理实时输入
const debouncedFormat = debounce(formatJSON, 300);

// 监听输入变化
jsonInput.addEventListener('input', (e) => {
    debouncedFormat(e.target.value);
});

// 时间戳转换功能
const currentTimeEl = document.getElementById('currentTime');
const timestampInput = document.getElementById('timestampInput');
const timeInput = document.getElementById('timeInput');
const timestamp2timeBtn = document.getElementById('timestamp2timeBtn');
const time2timestampBtn = document.getElementById('time2timestampBtn');
const timestamp2timeResult = document.getElementById('timestamp2timeResult');
const time2timestampResult = document.getElementById('time2timestampResult');

// 更新当前时间显示
function updateCurrentTime() {
    const now = new Date();
    currentTimeEl.textContent = now.toLocaleString('zh-CN', { 
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
}

// 初始化当前时间并每秒更新
updateCurrentTime();
setInterval(updateCurrentTime, 1000);

// 时间戳转时间
timestamp2timeBtn.addEventListener('click', () => {
    try {
        const timestamp = parseInt(timestampInput.value);
        const unit = document.querySelector('input[name="timestampUnit"]:checked').value;
        if (isNaN(timestamp)) {
            throw new Error('请输入有效的时间戳');
        }
        const timestampMs = unit === 's' ? timestamp * 1000 : timestamp;
        const date = new Date(timestampMs);
        if (date.toString() === 'Invalid Date') {
            throw new Error('无效的时间戳');
        }
        timestamp2timeResult.textContent = '转换结果：' + date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
        timestamp2timeResult.style.color = '#1D1D1F';
    } catch (error) {
        timestamp2timeResult.textContent = '错误：' + error.message;
        timestamp2timeResult.style.color = '#FF3B30';
    }
});

// 时间转时间戳
time2timestampBtn.addEventListener('click', () => {
    try {
        const timeStr = timeInput.value;
        if (!timeStr) {
            throw new Error('请选择时间');
        }
        const timestamp = new Date(timeStr).getTime();
        const unit = document.querySelector('input[name="timestampUnit"]:checked').value;
        const result = unit === 's' ? Math.floor(timestamp / 1000) : timestamp;
        time2timestampResult.textContent = `转换结果：${result} （${unit === 's' ? '秒' : '毫秒'}）`;
        time2timestampResult.style.color = '#1D1D1F';
    } catch (error) {
        time2timestampResult.textContent = '错误：' + error.message;
        time2timestampResult.style.color = '#FF3B30';
    }
});

// 设置时间输入框的默认值为当前时间
const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, '0');
const day = String(now.getDate()).padStart(2, '0');
const hours = String(now.getHours()).padStart(2, '0');
const minutes = String(now.getMinutes()).padStart(2, '0');
const seconds = String(now.getSeconds()).padStart(2, '0');
timeInput.value = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;

// 正则表达式工��功能
const regexInput = document.getElementById('regexInput');
const testInput = document.getElementById('testInput');
const matchResult = document.getElementById('matchResult');
const matchCount = document.getElementById('matchCount');
const flagGlobal = document.getElementById('flagGlobal');
const flagCase = document.getElementById('flagCase');
const flagMultiline = document.getElementById('flagMultiline');

// 更新正则匹配结果
function updateRegexMatch() {
    try {
        const pattern = regexInput.value;
        const text = testInput.value;
        
        if (!pattern || !text) {
            matchResult.textContent = '';
            matchCount.textContent = '0';
            return;
        }
        
        // 构建正则表达式标志
        let flags = '';
        if (flagGlobal.checked) flags += 'g';
        if (flagCase.checked) flags += 'i';
        if (flagMultiline.checked) flags += 'm';
        
        const regex = new RegExp(pattern, flags);
        
        // 处理全局匹配
        if (flags.includes('g')) {
            const matches = text.match(regex) || [];
            matchCount.textContent = matches.length;
            
            // 高亮显示匹配结果
            let highlightedText = text;
            matches.forEach(match => {
                highlightedText = highlightedText.replace(match, `<mark>${match}</mark>`);
            });
            matchResult.innerHTML = highlightedText || '无匹配结果';
        } else {
            // 处理单次匹配
            const match = regex.exec(text);
            matchCount.textContent = match ? '1' : '0';
            if (match) {
                const highlightedText = text.replace(match[0], `<mark>${match[0]}</mark>`);
                matchResult.innerHTML = highlightedText;
            } else {
                matchResult.textContent = '无匹配结果';
            }
        }
        
        matchResult.style.color = '#1D1D1F';
    } catch (error) {
        matchResult.textContent = '错误：' + error.message;
        matchResult.style.color = '#FF3B30';
        matchCount.textContent = '0';
    }
}

// 使用防抖处理实时输入
const debouncedRegexMatch = debounce(updateRegexMatch, 300);

// 监听输入和选项变化
regexInput.addEventListener('input', debouncedRegexMatch);
testInput.addEventListener('input', debouncedRegexMatch);
flagGlobal.addEventListener('change', debouncedRegexMatch);
flagCase.addEventListener('change', debouncedRegexMatch);
flagMultiline.addEventListener('change', debouncedRegexMatch);

// 处理正则模板点击
document.querySelectorAll('.template-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        regexInput.value = btn.dataset.pattern;
        updateRegexMatch();
    });
});

// Base64 编解码功能
const textInput = document.getElementById('textInput');
const base64Input = document.getElementById('base64Input');
const encodeBtn = document.getElementById('encodeBtn');
const decodeBtn = document.getElementById('decodeBtn');
const encodeResult = document.getElementById('encodeResult');
const decodeResult = document.getElementById('decodeResult');
const fileToBase64 = document.getElementById('fileToBase64');
const selectFileBtn = document.getElementById('selectFileBtn');
const selectedFileName = document.getElementById('selectedFileName');
const fileEncodeResult = document.getElementById('fileEncodeResult');
const previewArea = document.getElementById('previewArea');
const previewContent = document.getElementById('previewContent');
const downloadBase64Btn = document.getElementById('downloadBase64Btn');

// 文本编码
encodeBtn.addEventListener('click', () => {
    try {
        const text = textInput.value;
        if (!text) {
            throw new Error('请输入需要编码的文本');
        }
        const encoded = btoa(unescape(encodeURIComponent(text)));
        encodeResult.textContent = encoded;
    } catch (error) {
        encodeResult.textContent = '错误：' + error.message;
    }
});

// Base64解码
decodeBtn.addEventListener('click', () => {
    try {
        const base64 = base64Input.value.trim();
        if (!base64) {
            throw new Error('请输入Base64字符串');
        }
        
        // 尝试检测是否为文件
        if (base64.includes('data:')) {
            // 是文件，显示预览
            previewBase64File(base64);
        } else {
            // 是文本，直接解码
            const decoded = decodeURIComponent(escape(atob(base64)));
            decodeResult.textContent = decoded;
            previewArea.style.display = 'none';
        }
    } catch (error) {
        decodeResult.textContent = '错误：' + error.message;
        previewArea.style.display = 'none';
    }
});

// 预览Base64文件
function previewBase64File(base64Str) {
    const matches = base64Str.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
        throw new Error('无效的文件格式');
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    
    previewArea.style.display = 'block';
    previewContent.innerHTML = '';
    
    if (mimeType.startsWith('image/')) {
        const img = document.createElement('img');
        img.src = base64Str;
        previewContent.appendChild(img);
    } else if (mimeType.startsWith('video/')) {
        const video = document.createElement('video');
        video.src = base64Str;
        video.controls = true;
        previewContent.appendChild(video);
    } else if (mimeType.startsWith('audio/')) {
        const audio = document.createElement('audio');
        audio.src = base64Str;
        audio.controls = true;
        previewContent.appendChild(audio);
    } else {
        previewContent.textContent = '此文件类型不支持预览';
    }
    
    // 设置下载按钮
    downloadBase64Btn.onclick = () => {
        const link = document.createElement('a');
        link.href = base64Str;
        link.download = 'decoded_file.' + mimeType.split('/')[1];
        link.click();
    };
}

// 文件转Base64
selectFileBtn.addEventListener('click', () => fileToBase64.click());

fileToBase64.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    selectedFileName.textContent = file.name;
    const reader = new FileReader();
    
    reader.onload = function(e) {
        fileEncodeResult.textContent = e.target.result;
    };
    
    reader.readAsDataURL(file);
});

// 复制结果功能
document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;
        const text = document.getElementById(targetId).textContent;
        navigator.clipboard.writeText(text).then(() => {
            const originalText = btn.textContent;
            btn.textContent = '已复制！';
            setTimeout(() => {
                btn.textContent = originalText;
            }, 2000);
        });
    });
}); 
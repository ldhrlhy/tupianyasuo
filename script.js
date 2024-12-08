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
        time2timestampResult.textContent = `转换结果��${result} （${unit === 's' ? '秒' : '毫秒'}）`;
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
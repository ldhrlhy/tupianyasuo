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
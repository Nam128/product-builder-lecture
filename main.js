document.addEventListener('DOMContentLoaded', () => {
    const URL = "https://teachablemachine.withgoogle.com/models/IYDsrD5z_/";
    let model, maxPredictions;

    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const body = document.body;
    
    // UI Elements
    const uploadArea = document.getElementById('upload-area');
    const imageUpload = document.getElementById('image-upload');
    const uploadPlaceholder = document.getElementById('upload-placeholder');
    const imagePreview = document.getElementById('image-preview');
    const predictBtn = document.getElementById('predict-btn');
    const loadingSpinner = document.getElementById('loading-spinner');
    const resultContainer = document.getElementById('result-container');
    const labelContainer = document.getElementById('label-container');
    const resultMessage = document.querySelector('.result-message');

    // Load theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
        themeToggleBtn.textContent = '라이트 모드';
    } else {
        themeToggleBtn.textContent = '다크 모드';
    }

    themeToggleBtn.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        if (body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
            themeToggleBtn.textContent = '라이트 모드';
        } else {
            localStorage.setItem('theme', 'light');
            themeToggleBtn.textContent = '다크 모드';
        }
    });

    // Initialize Model
    async function init() {
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";

        try {
            model = await tmImage.load(modelURL, metadataURL);
            maxPredictions = model.getTotalClasses();
            console.log("Model Loaded");
        } catch (e) {
            console.error("Error loading model:", e);
            alert("모델을 불러오는데 실패했습니다.");
        }
    }

    init();

    // Image Upload Handling
    uploadArea.addEventListener('click', () => {
        imageUpload.click();
    });

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--button-bg-color)';
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = 'var(--sub-text-color)';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--sub-text-color)';
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImage(file);
        }
    });

    imageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleImage(file);
        }
    });

    function handleImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
            uploadPlaceholder.style.display = 'none';
            predictBtn.style.display = 'inline-block';
            resultContainer.style.display = 'none';
            labelContainer.innerHTML = '';
        };
        reader.readAsDataURL(file);
    }

    // Prediction
    predictBtn.addEventListener('click', async () => {
        if (!model) {
            alert("모델이 아직 로딩되지 않았습니다. 잠시만 기다려주세요.");
            return;
        }

        predictBtn.disabled = true;
        predictBtn.textContent = '분석 중...';
        loadingSpinner.style.display = 'block';

        // Small delay to allow UI to update
        setTimeout(async () => {
            await predict();
            loadingSpinner.style.display = 'none';
            predictBtn.disabled = false;
            predictBtn.textContent = '다른 사진 분석하기';
            predictBtn.onclick = () => {
                imageUpload.value = '';
                imagePreview.style.display = 'none';
                uploadPlaceholder.style.display = 'flex';
                predictBtn.style.display = 'none';
                resultContainer.style.display = 'none';
                // Reset click handler
                predictBtn.onclick = null; 
            };
        }, 500);
    });

    async function predict() {
        const prediction = await model.predict(imagePreview);
        prediction.sort((a, b) => b.probability - a.probability);

        const bestPrediction = prediction[0];
        const probability = (bestPrediction.probability * 100).toFixed(1);

        resultMessage.textContent = `당신의 이미지는 ${probability}% 확률로 "${bestPrediction.className}"에 가깝습니다.`;
        
        resultContainer.style.display = 'block';
        labelContainer.innerHTML = '';

        for (let i = 0; i < maxPredictions; i++) {
            const classPrediction =
                prediction[i].className + ": " + (prediction[i].probability * 100).toFixed(1) + "%";
            
            const barContainer = document.createElement('div');
            barContainer.className = 'bar-container';
            
            const label = document.createElement('div');
            label.className = 'bar-label';
            label.textContent = prediction[i].className;
            
            const barBg = document.createElement('div');
            barBg.className = 'bar-bg';
            
            const barFill = document.createElement('div');
            barFill.className = 'bar-fill';
            barFill.style.width = (prediction[i].probability * 100) + "%";
            
            // Color coding based on class (assuming Male/Female or similar)
            // You can customize colors here based on className if needed
            if (i === 0) {
                 barFill.style.backgroundColor = 'var(--button-bg-color)';
            } else {
                 barFill.style.backgroundColor = 'var(--sub-text-color)';
            }

            const percent = document.createElement('div');
            percent.className = 'bar-percent';
            percent.textContent = (prediction[i].probability * 100).toFixed(1) + "%";

            barBg.appendChild(barFill);
            barContainer.appendChild(label);
            barContainer.appendChild(barBg);
            barContainer.appendChild(percent);
            labelContainer.appendChild(barContainer);
        }
    }

    // Form submission feedback
    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');

    if (contactForm) {
        contactForm.addEventListener('submit', () => {
            submitBtn.disabled = true;
            submitBtn.textContent = '보내는 중...';
        });
    }
});
document.addEventListener('DOMContentLoaded', () => {
    const URL = "https://teachablemachine.withgoogle.com/models/IYDsrD5z_/";
    let model, webcam, maxPredictions;

    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const body = document.body;
    
    // Tab Elements
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    // UI Elements
    const uploadArea = document.getElementById('upload-area');
    const imageUpload = document.getElementById('image-upload');
    const uploadPlaceholder = document.getElementById('upload-placeholder');
    const imagePreview = document.getElementById('image-preview');
    const webcamBtn = document.getElementById('webcam-btn');
    const webcamContainer = document.getElementById('webcam-container');
    const predictBtn = document.getElementById('predict-btn');
    const loadingSpinner = document.getElementById('loading-spinner');
    const resultContainer = document.getElementById('result-container');
    const labelContainer = document.getElementById('label-container');
    const resultMessage = document.querySelector('.result-message');
    
    // Lotto Elements
    const lottoNumbersContainer = document.getElementById('lotto-numbers');
    const generateBtn = document.getElementById('generate-btn');

    let isWebcamMode = false;

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

    // Tab Switching Logic
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active class to clicked button and target content
            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
            
            // Stop webcam if switching away from Teeto tab
            if (tabId !== 'teeto' && webcam && isWebcamMode) {
                 webcam.stop();
                 isWebcamMode = false;
                 webcamContainer.style.display = 'none';
                 uploadPlaceholder.style.display = 'flex';
                 webcamBtn.disabled = false;
                 webcamBtn.textContent = '웹캠 사용하기';
            }
        });
    });

    // --- Lotto Logic ---
    if (generateBtn) {
        generateBtn.addEventListener('click', () => {
            generateBtn.disabled = true;
            generateBtn.style.opacity = '0.7';
            generateBtn.textContent = '추첨 중...';
            
            lottoNumbersContainer.innerHTML = '';
            const numbers = generateUniqueNumbers(1, 45, 6);
            numbers.sort((a, b) => a - b);

            numbers.forEach((number, index) => {
                setTimeout(() => {
                    const numberElement = document.createElement('div');
                    numberElement.className = 'lotto-number';
                    numberElement.textContent = number;
                    lottoNumbersContainer.appendChild(numberElement);

                    if (index === numbers.length - 1) {
                        setTimeout(() => {
                            generateBtn.disabled = false;
                            generateBtn.style.opacity = '1';
                            generateBtn.textContent = '번호 생성하기';
                        }, 500);
                    }
                }, index * 200);
            });
        });
    }

    function generateUniqueNumbers(min, max, count) {
        const numbers = new Set();
        while (numbers.size < count) {
            const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
            numbers.add(randomNumber);
        }
        return Array.from(numbers);
    }

    // --- Teachable Machine Logic ---
    async function init() {
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";

        try {
            model = await tmImage.load(modelURL, metadataURL);
            maxPredictions = model.getTotalClasses();
            console.log("Model Loaded");
        } catch (e) {
            console.error("Error loading model:", e);
        }
    }

    init();

    // Webcam Handling
    if (webcamBtn) {
        webcamBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (!model) {
                alert("모델이 아직 로딩되지 않았습니다.");
                return;
            }

            loadingSpinner.style.display = 'block';
            webcamBtn.disabled = true;
            webcamBtn.textContent = '웹캠 준비 중...';

            try {
                const flip = true;
                webcam = new tmImage.Webcam(400, 300, flip);
                await webcam.setup();
                await webcam.play();
                
                isWebcamMode = true;
                loadingSpinner.style.display = 'none';
                uploadPlaceholder.style.display = 'none';
                webcamContainer.style.display = 'block';
                webcamContainer.innerHTML = ''; 
                webcamContainer.appendChild(webcam.canvas);
                
                resultContainer.style.display = 'block';
                window.requestAnimationFrame(loop);
            } catch (err) {
                console.error(err);
                alert("웹캠을 시작할 수 없습니다. 권한을 확인해주세요.");
                loadingSpinner.style.display = 'none';
                webcamBtn.disabled = false;
                webcamBtn.textContent = '웹캠 사용하기';
            }
        });
    }

    async function loop() {
        if (!isWebcamMode) return;
        webcam.update();
        await predict(webcam.canvas);
        window.requestAnimationFrame(loop);
    }

    // Image Upload Handling
    if (uploadArea) {
        uploadArea.addEventListener('click', () => {
            if (isWebcamMode) return;
            imageUpload.click();
        });

        uploadArea.addEventListener('dragover', (e) => {
            if (isWebcamMode) return;
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--button-bg-color)';
        });

        uploadArea.addEventListener('dragleave', () => {
            if (isWebcamMode) return;
            uploadArea.style.borderColor = 'var(--sub-text-color)';
        });

        uploadArea.addEventListener('drop', (e) => {
            if (isWebcamMode) return;
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--sub-text-color)';
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                handleImage(file);
            }
        });
    }

    if (imageUpload) {
        imageUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                handleImage(file);
            }
        });
    }

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
    if (predictBtn) {
        predictBtn.addEventListener('click', async () => {
            if (!model) return;

            predictBtn.disabled = true;
            predictBtn.textContent = '분석 중...';
            loadingSpinner.style.display = 'block';

            setTimeout(async () => {
                await predict(imagePreview);
                loadingSpinner.style.display = 'none';
                predictBtn.disabled = false;
                predictBtn.textContent = '다른 사진 분석하기';
                predictBtn.onclick = () => {
                    imageUpload.value = '';
                    imagePreview.style.display = 'none';
                    uploadPlaceholder.style.display = 'flex';
                    predictBtn.style.display = 'none';
                    resultContainer.style.display = 'none';
                    predictBtn.onclick = null; 
                };
            }, 500);
        });
    }

    async function predict(inputElement) {
        const prediction = await model.predict(inputElement);
        prediction.sort((a, b) => b.probability - a.probability);

        const bestPrediction = prediction[0];
        const probability = (bestPrediction.probability * 100).toFixed(1);

        resultMessage.textContent = isWebcamMode 
            ? `실시간 분석: ${bestPrediction.className} (${probability}%)`
            : `당신의 이미지는 ${probability}% 확률로 "${bestPrediction.className}"에 가깝습니다.`;
        
        resultContainer.style.display = 'block';
        
        if (labelContainer.childNodes.length === 0) {
            for (let i = 0; i < maxPredictions; i++) {
                const barContainer = createBarElement(prediction[i], i);
                labelContainer.appendChild(barContainer);
            }
        } else {
            for (let i = 0; i < maxPredictions; i++) {
                updateBarElement(labelContainer.childNodes[i], prediction[i], i);
            }
        }
    }

    function createBarElement(pred, index) {
        const barContainer = document.createElement('div');
        barContainer.className = 'bar-container';
        barContainer.innerHTML = `
            <div class="bar-label">${pred.className}</div>
            <div class="bar-bg"><div class="bar-fill" style="width: ${pred.probability * 100}%"></div></div>
            <div class="bar-percent">${(pred.probability * 100).toFixed(1)}%</div>
        `;
        const barFill = barContainer.querySelector('.bar-fill');
        barFill.style.backgroundColor = index === 0 ? 'var(--button-bg-color)' : 'var(--sub-text-color)';
        return barContainer;
    }

    function updateBarElement(container, pred, index) {
        const barFill = container.querySelector('.bar-fill');
        const barPercent = container.querySelector('.bar-percent');
        const barLabel = container.querySelector('.bar-label');
        
        barLabel.textContent = pred.className;
        barFill.style.width = (pred.probability * 100) + "%";
        barPercent.textContent = (pred.probability * 100).toFixed(1) + "%";
        barFill.style.backgroundColor = index === 0 ? 'var(--button-bg-color)' : 'var(--sub-text-color)';
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
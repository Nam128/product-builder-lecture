document.addEventListener('DOMContentLoaded', () => {
    const lottoNumbersContainer = document.getElementById('lotto-numbers');
    const generateBtn = document.getElementById('generate-btn');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const body = document.body;

    // Load theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
        themeToggleBtn.textContent = '라이트 모드';
    } else {
        themeToggleBtn.textContent = '다크 모드';
    }

    generateBtn.addEventListener('click', () => {
        // Disable button during animation
        generateBtn.disabled = true;
        generateBtn.style.opacity = '0.7';
        generateBtn.textContent = '추첨 중...';
        
        lottoNumbersContainer.innerHTML = '';
        const numbers = generateUniqueNumbers(1, 45, 6);
        numbers.sort((a, b) => a - b);

        // Animate numbers appearing one by one
        numbers.forEach((number, index) => {
            setTimeout(() => {
                const numberElement = document.createElement('div');
                numberElement.className = 'lotto-number';
                numberElement.textContent = number;
                
                // Add specific style based on number range (optional visual flair)
                // This preserves the CSS nth-child logic but ensures consistency if we wanted specific colors per range
                
                lottoNumbersContainer.appendChild(numberElement);

                // Re-enable button after last number
                if (index === numbers.length - 1) {
                    setTimeout(() => {
                        generateBtn.disabled = false;
                        generateBtn.style.opacity = '1';
                        generateBtn.textContent = '번호 생성하기';
                    }, 500);
                }
            }, index * 200); // 200ms delay between each ball
        });
    });

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

    function generateUniqueNumbers(min, max, count) {
        const numbers = new Set();
        while (numbers.size < count) {
            const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
            numbers.add(randomNumber);
        }
        return Array.from(numbers);
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
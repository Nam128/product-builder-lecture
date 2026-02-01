document.addEventListener('DOMContentLoaded', () => {
    const lottoNumbersContainer = document.getElementById('lotto-numbers');
    const generateBtn = document.getElementById('generate-btn');

    generateBtn.addEventListener('click', () => {
        lottoNumbersContainer.innerHTML = ''; // Clear previous numbers
        const numbers = generateUniqueNumbers(1, 45, 6);
        numbers.sort((a, b) => a - b);
        numbers.forEach(number => {
            const numberElement = document.createElement('div');
            numberElement.className = 'lotto-number';
            numberElement.textContent = number;
            lottoNumbersContainer.appendChild(numberElement);
        });
    });

    function generateUniqueNumbers(min, max, count) {
        const numbers = new Set();
        while (numbers.size < count) {
            const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
            numbers.add(randomNumber);
        }
        return Array.from(numbers);
    }
});

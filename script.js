document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('start-btn');
    const timeSelect = document.getElementById('time-select');
    const cells = document.querySelectorAll('.cell');
    const wordInput = document.getElementById('word-input');
    const submitWordBtn = document.getElementById('submit-word');
    const wordList = document.getElementById('word-list');
    const scoreDisplay = document.getElementById('score');
    const timerDisplay = document.getElementById('timer');
    let timer;
    let score = 0;
    let dictionary = ["casa", "casamiento", "mesa", "sombrero"]; // Diccionario de ejemplo

    startBtn.addEventListener('click', startGame);
    submitWordBtn.addEventListener('click', submitWord);

    function startGame() {
        clearInterval(timer);
        resetGame();
        generateGrid();
        let gameTime = parseInt(timeSelect.value) * 60;
        timer = setInterval(() => {
            gameTime--;
            updateTimerDisplay(gameTime);
            if (gameTime <= 0) {
                clearInterval(timer);
                alert('Tiempo terminado');
            }
        }, 1000);
    }

    function resetGame() {
        score = 0;
        wordList.innerHTML = '';
        scoreDisplay.textContent = score;
        timerDisplay.textContent = 'Tiempo restante: 00:00';
    }

    function generateGrid() {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        cells.forEach(cell => {
            const randomLetter = letters.charAt(Math.floor(Math.random() * letters.length));
            cell.textContent = randomLetter;
        });
    }

    function submitWord() {
        const word = wordInput.value.trim().toLowerCase();
        if (isValidWord(word)) {
            addWordToList(word);
            updateScore(word);
        } else {
            alert('Palabra no válida');
        }
        wordInput.value = '';
    }

    function isValidWord(word) {
        return word.length >= 3 && dictionary.includes(word);
    }

    function addWordToList(word) {
        const li = document.createElement('li');
        li.textContent = word;
        wordList.appendChild(li);
    }

    function updateScore(word) {
        score += word.length;
        scoreDisplay.textContent = score;
    }

    function updateTimerDisplay(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        timerDisplay.textContent = `Tiempo restante: ${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
});

'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('start-btn');
    const timeSelect = document.getElementById('time-select');
    const cells = document.querySelectorAll('.cell');
    const submitWordBtn = document.getElementById('submit-word');
    const wordList = document.getElementById('word-list');
    const scoreDisplay = document.getElementById('score');
    const timerDisplay = document.getElementById('timer');
    const selectedWordDisplay = document.getElementById('selected-word');
    const showRankingBtn = document.getElementById('show-ranking');
    const rankingModal = document.getElementById('ranking-modal');
    const closeRankingBtn = document.getElementById('close-ranking');
    const rankingTableBody = document.querySelector('#ranking-table tbody');
    const playerNameInput = document.getElementById('player-name');
    const messageModal = document.getElementById('message-modal');
    const modalMessage = document.getElementById('modal-message');
    const closeMessageBtn = document.getElementById('close-message');
    let timer;
    let score = 0;
    let selectedWord = '';
    let selectedCells = [];
    let playerName = '';

    startBtn.addEventListener('click', () => {
        playerName = playerNameInput.value.trim();
        if (playerName === '') {
            showMessage('Por favor, ingresa tu nombre antes de comenzar el juego.');
        } else {
            resetGame();
            const timeLimit = parseInt(timeSelect.value) * 60;
            startTimer(timeLimit);
            generateGrid();
        }
    });

    submitWordBtn.addEventListener('click', submitWord);
    showRankingBtn.addEventListener('click', showRanking);
    closeRankingBtn.addEventListener('click', closeRanking);
    closeMessageBtn.addEventListener('click', closeMessage);

    function startTimer(duration) {
        let timeRemaining = duration;
        timer = setInterval(() => {
            timeRemaining--;
            updateTimerDisplay(timeRemaining);
            if (timeRemaining <= 10) {
                timerDisplay.style.color = '#FF5722'; // Color de alerta
                // Aquí podrías reproducir un sonido de alerta si lo deseas
            }
            if (timeRemaining <= 0) {
                clearInterval(timer);
                timerDisplay.style.color = '#fff'; // Color normal
                showMessage('Tiempo terminado');
                saveGameResult();
            }
        }, 1000);
    }

    function resetGame() {
        score = 0;
        selectedWord = '';
        selectedCells = [];
        wordList.innerHTML = '';
        scoreDisplay.textContent = score;
        timerDisplay.textContent = 'Tiempo restante: 00:00';
        selectedWordDisplay.textContent = '';
        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('selected', 'last-selected', 'can-select');
        });
    }

    function generateGrid() {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const vowels = 'AEIOU';
        const numVowels = 5;

        // Colocar las vocales aleatoriamente
        const vowelIndices = [];
        while (vowelIndices.length < numVowels) {
            const randomIndex = Math.floor(Math.random() * cells.length);
            if (!vowelIndices.includes(randomIndex)) {
                vowelIndices.push(randomIndex);
            }
        }

        vowelIndices.forEach(index => {
            const randomVowel = vowels.charAt(Math.floor(Math.random() * vowels.length));
            cells[index].textContent = randomVowel;
        });

        // Colocar las consonantes en las casillas restantes
        cells.forEach((cell, index) => {
            if (!vowelIndices.includes(index)) {
                const randomLetter = letters.charAt(Math.floor(Math.random() * letters.length));
                cell.textContent = randomLetter;
            }
        });

        updateSelectableCells();
    }

    function selectCell(event) {
        const cell = event.target;
        if (!cell.classList.contains('selected')) {
            if (selectedCells.length > 0) {
                selectedCells[selectedCells.length - 1].classList.remove('last-selected');
            }
            cell.classList.add('selected');
            selectedCells.push(cell);
            selectedWord += cell.textContent.toLowerCase();
            selectedWordDisplay.textContent = selectedWord;
            cell.classList.add('last-selected');
            updateSelectableCells();
        }
    }

    function updateSelectableCells() {
        cells.forEach(cell => {
            cell.classList.remove('can-select');
        });
        // Aquí se pueden agregar reglas para determinar qué celdas pueden ser seleccionadas a continuación
    }

    function submitWord() {
        if (selectedWord.length >= 3) {
            fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${selectedWord}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Palabra no encontrada');
                    }
                    return response.json();
                })
                .then(data => {
                    addWordToList(selectedWord);
                    updateScore(selectedWord);
                    selectedWord = '';
                    selectedWordDisplay.textContent = '';
                    selectedCells.forEach(cell => cell.classList.remove('selected', 'last-selected'));
                    selectedCells = [];
                    updateSelectableCells();
                })
                .catch(error => {
                    showMessage('Palabra no válida');
                    selectedWord = '';
                    selectedWordDisplay.textContent = '';
                    selectedCells.forEach(cell => cell.classList.remove('selected', 'last-selected'));
                    selectedCells = [];
                    updateSelectableCells();
                });
        } else {
            showMessage('Palabra demasiado corta');
            selectedWord = '';
            selectedWordDisplay.textContent = '';
            selectedCells.forEach(cell => cell.classList.remove('selected', 'last-selected'));
            selectedCells = [];
            updateSelectableCells();
        }
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

    function saveGameResult() {
        const result = {
            name: playerName,
            score: score,
            date: new Date().toLocaleString()
        };
        let rankings = JSON.parse(localStorage.getItem('boggleRankings')) || [];
        rankings.push(result);
        rankings.sort((a, b) => b.score - a.score);
        localStorage.setItem('boggleRankings', JSON.stringify(rankings));
    }

    function showRanking() {
        const rankings = JSON.parse(localStorage.getItem('boggleRankings')) || [];
        rankingTableBody.innerHTML = '';
        rankings.forEach(rank => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${rank.name}</td>
                <td>${rank.score}</td>
                <td>${rank.date}</td>
            `;
            rankingTableBody.appendChild(row);
        });
        rankingModal.style.display = 'flex';
    }

    function closeRanking() {
        rankingModal.style.display = 'none';
    }

    function showMessage(message) {
        modalMessage.textContent = message;
        messageModal.style.display = 'flex';
    }

    function closeMessage() {
        messageModal.style.display = 'none';
    }

    cells.forEach(cell => {
        cell.addEventListener('click', selectCell);
    });
});

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
    let isGameStarted = false; // Variable de control para saber si el juego ha comenzado
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
            startBtn.disabled = true; // Deshabilitar el botón "Iniciar juego"
            resetGame();
            const timeLimit = parseInt(timeSelect.value) * 60;
            startTimer(timeLimit);
            generateGrid();
            isGameStarted = true; // Marcar que el juego ha comenzado
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
                timerDisplay.style.color = '#FF5722'; //alerta color naranja
            }
            if (timeRemaining <= 0) {
                clearInterval(timer);
                timerDisplay.style.color = '#fff';
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
        if (!isGameStarted) return; // Asegúrate de que el juego haya comenzado
        const cell = event.target;
    
        if (selectedCells.length > 0) {
            const lastCell = selectedCells[selectedCells.length - 1];
            const lastIndex = Array.from(cells).indexOf(lastCell);
            const currentIndex = Array.from(cells).indexOf(cell);
    
            const lastRow = Math.floor(lastIndex / 4);
            const lastCol = lastIndex % 4;
            const currentRow = Math.floor(currentIndex / 4);
            const currentCol = currentIndex % 4;
    
            const isAdjacent = Math.abs(lastRow - currentRow) <= 1 && Math.abs(lastCol - currentCol) <= 1;
    
            if (!isAdjacent) {
                return; // No permitir la selección si no está adyacente
            }
        }
    
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

document.getElementById('contact-btn').addEventListener('click', () => {
    window.location.href = 'contacto.html';
});

document.addEventListener("DOMContentLoaded", function () {
    const board = document.querySelectorAll(".board td");
    let selectedCells = [];
    let isGameStarted = false;

    document.getElementById("start-button").addEventListener("click", function () {
        isGameStarted = true;
        selectedCells = [];
        document.getElementById("word-display").textContent = "";
    });

    board.forEach(cell => {
        cell.addEventListener("click", function () {
            if (!isGameStarted) return; // No permitir la selección antes de que empiece el juego

            const [row, col] = this.id.split("-").map(Number);

            if (selectedCells.length > 0) {
                const lastCell = selectedCells[selectedCells.length - 1];
                const [lastRow, lastCol] = lastCell.split("-").map(Number);

                const isAdjacent = Math.abs(row - lastRow) <= 1 && Math.abs(col - lastCol) <= 1;

                if (!isAdjacent) {
                    return; // No permitir la selección si no está adyacente
                }
            }

            if (!selectedCells.includes(this.id)) {
                selectedCells.push(this.id);
                this.classList.add("selected");

                document.getElementById("word-display").textContent += this.textContent;
            }
        });
    });
});

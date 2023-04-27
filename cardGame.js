// Isolated DOM nodes referenced in functions
const startButton = document.querySelector('#startButton');
const scoreElement = document.querySelector('#scoreValue');
const cardContainer = document.querySelector('#cardContainer');
const timerElement = document.querySelector('#timerValue');

// Test data
let values = [
    'A',
    'A',
    'B',
    'B',
    'C',
    'C',
    'D',
    'D',
    'E',
    'E',
];

/**
 * Function produces nested node architecture for card on client side
 * @returns {HTMLDivElement}
 */
const drawCard = () => {
    const card = document.createElement('div');
    const cardContent = document.createElement('p');
    card.classList.add('card');
    card.append(cardContent);
    const cardSpacing = document.createElement('div');
    cardSpacing.classList.add('cardSpacing');
    cardSpacing.append(card);
    return cardSpacing;
};

/**
 * Function generates 10 cards on client side and randomly assigns a value to each card
 */
const generateDeck = () => {
    for (let i = 0; i < 10; i++) {
        cardContainer.append(drawCard());

        const allCards = Array.from(document.querySelectorAll('.card'));
        let randomIndex = Math.floor(Math.random() * values.length);

        const currentValue = allCards[i].firstElementChild
        currentValue.innerHTML = values[randomIndex];
        currentValue.classList.add('hidden');

        values.splice(randomIndex, 1);
    }
};

/**
 * Function toggles visibility of card's data
 * @param {EventTarget} eventTarget - card div that was clicked to trigger event
 */
const toggleVisibility = (eventTarget) => {
    const data = eventTarget.firstElementChild;
    if (data.classList.contains('hidden')) {
        data.classList.remove('hidden');
        eventTarget.classList.add('revealed');
    } else {
        data.classList.add('hidden');
        eventTarget.classList.remove('revealed');
    }
};

/**
 * Function resets card deck on client side
 * @param {[HTMLDivElement]} allCards - array of all nodes with the card class
 */
const resetDeck = (allCards) => {
    allCards.forEach(card => {
        card.classList.remove('revealed');
        card.firstElementChild.classList.add('hidden');
    });
};

/**
 * Function checks if two revealed cards are matching
 * @param {[HTMLDivElement]} revealedCards - array of all nodes with the revealed class
 * @returns {boolean} - value correlates with whether or not the two cards match
 */
const isSolved = (revealedCards) => {
    const cardA = revealedCards[0].firstElementChild.innerHTML;
    const cardB = revealedCards[1].firstElementChild.innerHTML;

    if (cardA === cardB) {
        return true;
    } else {
        return false;
    }
};

/**
 * Function takes two matching cards and gives them class of solved
 * @param {[HTMLDivElement]} revealedCards - array of all nodes with the revealed class 
 */
const renderSolution = (revealedCards) => {
    revealedCards.forEach(card => {
        card.classList.remove('card', 'revealed');
        card.classList.add('solved');
    })
};

/**
 * Function orchestrates matching card outcome on client side if cards are matching
 */
const resolutionHandler = (revealedPair) => {
    if (isSolved(revealedPair)) { 
        renderSolution(revealedPair);
    }
};

/**
 * Function decides output of clicking on a card by looking at the number of revealed cards.
 * @param {EventTarget} eventTarget - card div that was clicked to trigger event
 */
const cardClickHandler = (eventTarget) => {
    const currentDeck = Array.from(document.querySelectorAll('.card'));
    const revealedCards = Array.from(document.querySelectorAll('.revealed'));

    switch (revealedCards.length) {
        case 1:
            toggleVisibility(eventTarget);
            const revealedPair = Array.from(document.querySelectorAll('.revealed'));
            resolutionHandler(revealedPair);
            break;
    
        case 2:
            resetDeck(currentDeck);
            toggleVisibility(eventTarget);
            break;
        
        default:
            toggleVisibility(eventTarget);
            break;
    }
};

/**
 * Function removes all child elements from card container
 */
const clearDeck = () => {
    while (cardContainer.firstElementChild) {
        cardContainer.firstElementChild.remove();
    };
}

/**
 * Function to display game over message
 */

function gameOverDisplay() {
    const gameOverDiv = document.createElement("div");
    gameOverDiv.innerHTML = "Game Over";
    gameOverDiv.classList.add("gameOver");
    cardContainer.appendChild(gameOverDiv);
};

/**
 * Function checks whether all matches have been found
 * @returns {boolean} - value correlates with whether or not all pairs are solved
 */
const isComplete = () => {
    const currentUnsolved = Array.from(document.querySelectorAll('.card'));
    if (currentUnsolved.length === 0) {
        return true;
    } else {
        return false;
    }
};

/**
 * Function starts and runs the countdown timer
 */
const countdown = () => {
    let remainingTime = 30;
  
    const timerInterval = setInterval(() => {
        remainingTime--;

        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;

        timerElement.textContent = `${minutes}:${seconds
        .toString()
        .padStart(2, "0")}`;

        scoreElement.innerHTML = remainingTime;

        if (remainingTime <= 0 || isComplete()) {
            gameOverDisplay();
            startButton.disabled = false;
            clearInterval(timerInterval);
        }
    }, 1000);
};

/**
 * Main function that orchestrates mini-game flow
 */
const startGame = () => {
    const gameOver = cardContainer.querySelector('.gameOver');
    if (gameOver) {
        clearDeck();
        scoreElement.innerHTML = 30;
        timerElement.innerHTML = '0:30';
    }
    startButton.disabled = true;
    generateDeck();
    countdown();
};

document.addEventListener('click', (event) => {
    event.preventDefault();

    if (event.target === startButton) {
        startGame();
        return;
    }
    if (Array.from(document.querySelectorAll('.card')).includes(event.target)) {
        cardClickHandler(event.target);
        return;
    }
});

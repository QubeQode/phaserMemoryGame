const memoryGame = new Phaser.Scene('Game');

// Asset load logic
memoryGame.preload = function () {
    this.load.image('background', 'assets/background.png');
    this.load.image('cardBack', 'assets/cardBack.png');
    this.load.image('pinkAlienCard', 'assets/pinkAlienCard.png');
    this.load.image('darkBlueAlienCard', 'assets/darkBlueAlienCard.png');
    this.load.image('greenAlienCard', 'assets/greenAlienCard.png');
    this.load.image('lightBlueAlienCard', 'assets/lightBlueAlienCard.png');
    this.load.image('venusCard', 'assets/venusCard.png');
};

const WIDTH = 800;
const HEIGHT = 600;

const PRESET_POSITIONS = [
    [WIDTH/9.4, HEIGHT/3],
    [WIDTH/3.3, HEIGHT/3],
    [WIDTH/2, HEIGHT/3],
    [WIDTH/1.43, HEIGHT/3],
    [WIDTH/1.115, HEIGHT/3],
    [WIDTH/9.4, HEIGHT/1.4],
    [WIDTH/3.3, HEIGHT/1.4],
    [WIDTH/2, HEIGHT/1.4],
    [WIDTH/1.43, HEIGHT/1.4],
    [WIDTH/1.115, HEIGHT/1.4],
];

const ASSET_VALUES = [
    'darkBlueAlienCard',
    'darkBlueAlienCard',
    'greenAlienCard',
    'greenAlienCard',
    'lightBlueAlienCard',
    'lightBlueAlienCard',
    'pinkAlienCard',
    'pinkAlienCard',
    'venusCard',
    'venusCard'
];

const gameState = [
    [],
    []
]

/**
 * Function randomly indexes ASSET_VALUES array holding loaded texture names
 * @returns {String} - texture name
 */
const getRandomCard = () => {
    const randomIndex = Math.floor(Math.random() * ASSET_VALUES.length);
    const cardRetrieved = ASSET_VALUES[randomIndex];
    ASSET_VALUES.splice(randomIndex, 1);
    return cardRetrieved;
};

// Initialize Assets
memoryGame.create = function () {

    /**
     * Function creates a random card at the card position
     * @param {[Number, Number]} cardPosition - tuple of card's x, y co-ords 
     * @returns {Sprite} Sprite class object for the card
     */
    const createCard = (cardPosition) => {
        const textureType = getRandomCard();
        const card = this.add.sprite(cardPosition[0], cardPosition[1], textureType);
        card.setScale(0.15);
        return card;
    }

    /**
     * Function creates a deck
     * @returns {[Sprite]} Array of all card Sprite class objects
     */
    const createDeck = () => {
        const deckArrangement = [];
        PRESET_POSITIONS.forEach(cardPosition => {
            deckArrangement.push(createCard(cardPosition));
        })
        return deckArrangement;
    };

    /**
     * Function generates copy of current deck in memory
     * @param {[Sprite]} deckArray - Array of all card Sprite class objects
     */
    const saveGameState = (deckArray) => {
        for (let i = 0; i < 10; i++) {
            const cardData = {
                name: deckArray[i].texture.key,
                isActive: false,
            };

            i < 5 ? gameState[0].push(cardData) : gameState[1].push(cardData);
        };
    }

    /**
     * Function generates card back at each card position
     */
    const hideCards = () => {
        PRESET_POSITIONS.forEach(cardPosition => {
            const card = this.add.sprite(cardPosition[0], cardPosition[1], 'cardBack');
            card.setScale(0.15);
        })
    }

    /**
     * Function orchestrates functions to generate starting deck
     */
    const initializeDeck = () => {
        const deck = createDeck();
        saveGameState(deck);
        hideCards();
    }

    // Initialize Background
    const background = this.add.sprite(WIDTH/2, HEIGHT/2, 'background');

    // Initialize Deck
    initializeDeck();
};

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: memoryGame,
    pixelArt: true,   
}

const game = new Phaser.Game(config);

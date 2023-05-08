const memoryGame = new Phaser.Scene('Game');

let justRunOnceYouLittleShit = false;
let gameIsStarted = false;

/**
 * Main Class that orchestrates the game flow;
 */
class GameHandler {
    // Phaser Game Class 
    #gameScene;

    // Deck Handler Class
    #deckRenderer;

    // Timer Handler Class
    #timerRenderer;

    // Score Handler Class
    #scoreRenderer;

    // Symbolic Constants
    #WIDTH;
    #HEIGHT;

    // Class Constructor
    constructor (width, height, gameScene) {
        this.#WIDTH = width;
        this.#HEIGHT = height;
        this.#gameScene = gameScene;
        this.#deckRenderer = new DeckRenderer(
            this.#gameScene,
            this.#WIDTH, 
            this.#HEIGHT,
        );
        this.#timerRenderer = new TimerRenderer(
            this.#gameScene,
        );
        this.#scoreRenderer = new ScoreRenderer(
            this.#gameScene,
        )
    };

    // Methods
    /**
     * Function defines the preload execution sequence for Phaser
     * @param {[String]} assetNameArray - Array of asset names as strings 
     */
    definePreload = (assetNameArray) => {
        this.#gameScene.preload = () => {
            assetNameArray.forEach(asset => {
                this.#gameScene.sys.load.image(asset, `assets/${asset}.png`);
            });
        }
    };

    /**
     * Helper function calls background render process
     */
    #renderBackground = () => {
        this.#gameScene.sys.add.sprite(this.#WIDTH/2, this.#HEIGHT/2, 'background');
    };

    /**
     * Function defines the create execution sequence for Phaser
     */
    defineCreate = () => {
        this.#gameScene.create = () => {
            gameIsStarted = true;
            this.#gameScene.sys.cardBacks = this.#gameScene.sys.add.group();
            this.#gameScene.sys.cardFaces = this.#gameScene.sys.add.group();

            this.#renderBackground();
            this.#deckRenderer.createDeck();
            this.#deckRenderer.createCardBacks();
            this.#deckRenderer.addCardBackEventListeners();
            const stateHandler = StateHandler.getInstance();
            stateHandler.representDeck(this.#gameScene.sys.cardFaces.children.entries);
            this.#timerRenderer.renderTimer();
            this.#timerRenderer.createTimerEvent();
            this.#scoreRenderer.renderScore();
            this.#scoreRenderer.addEventListeners();
        }
    };

    /**
     * Function orchestrates game initialization sequence.
     * @param {[String]} assetNameArray - Array of asset names as strings 
     */
    initializeGame = (assetNameArray) => {
        this.definePreload(assetNameArray);
        this.defineCreate();
    };

    addEventListeners = () => {
        const deckRenderer = this.#deckRenderer;
        this.#gameScene.update = () => {
            const emitter = EventDispatcher.getInstance()
            /**
             * Listener waits till deck is solved to refresh the available deck
             */
            emitter.addListener('deckSolved', () => {
                if (!justRunOnceYouLittleShit) {
                    this.#gameScene.sys.cardFaces.children.entries = [];
                    this.#gameScene.sys.cardBacks.children.entries = [];
                    deckRenderer.createDeck();
                    deckRenderer.createCardBacks();
                    deckRenderer.addCardBackEventListeners();
                    
                    const stateHandler = StateHandler.getInstance();
                    stateHandler.representDeck(this.#gameScene.sys.cardFaces.children.entries);
                    
                    justRunOnceYouLittleShit = true;
                }
            });

            emitter.addListener('gameOver', () => {
                emitter.destroy();
                if (gameIsStarted) {
                    this.#gameScene.gameOverText = this.#gameScene.add.text(
                        this.#gameScene.sys.game.config.width / 2,
                        this.#gameScene.sys.game.config.height / 2,
                        "Game Over")
                    this.#gameScene.gameOverText.setOrigin(0.5);
                    this.#gameScene.gameOverText.setScale(2);
                    this.#gameScene.gameOverText.depth = 2;

                    gameIsStarted = false;
                }
            })
        };
    }
};

/**
 * Class handles the rendering of a new deck
 */
class DeckRenderer {
    // Phaser Game Class
    #gameScene;

    // Symbolic Constants
    #WIDTH;
    #HEIGHT;
    #CARD_KEYS = [
        'darkBlueAlienCard',
        'greenAlienCard',
        'lightBlueAlienCard',
        'pinkAlienCard',
        'venusCard',
        'darkBlueAlienCard',
        'greenAlienCard',
        'lightBlueAlienCard',
        'pinkAlienCard',
        'venusCard',
    ];
    #PRESET_POSITIONS = [];

    constructor (gameScene, width, height) {
        this.#gameScene = gameScene;
        this.#WIDTH = width;
        this.#HEIGHT = height;
        this.#PRESET_POSITIONS = [
            [this.#WIDTH/9.4, this.#HEIGHT/3],
            [this.#WIDTH/3.3, this.#HEIGHT/3],
            [this.#WIDTH/2, this.#HEIGHT/3],
            [this.#WIDTH/1.43, this.#HEIGHT/3],
            [this.#WIDTH/1.115, this.#HEIGHT/3],
            [this.#WIDTH/9.4, this.#HEIGHT/1.4],
            [this.#WIDTH/3.3, this.#HEIGHT/1.4],
            [this.#WIDTH/2, this.#HEIGHT/1.4],
            [this.#WIDTH/1.43, this.#HEIGHT/1.4],
            [this.#WIDTH/1.115, this.#HEIGHT/1.4],
        ]
    };

    /**
     * Function randomly indexes ASSET_VALUES
     * @returns {String} texture name
     */
    #getRandomCard = () => {
        const randomIndex = Math.floor(Math.random() * this.#CARD_KEYS.length);
        const cardRetrieved = this.#CARD_KEYS[randomIndex];
        this.#CARD_KEYS.splice(randomIndex, 1);
        if (this.#CARD_KEYS.length === 0) {
            this.#CARD_KEYS = [
                'darkBlueAlienCard',
                'greenAlienCard',
                'lightBlueAlienCard',
                'pinkAlienCard',
                'venusCard',
                'darkBlueAlienCard',
                'greenAlienCard',
                'lightBlueAlienCard',
                'pinkAlienCard',
                'venusCard',
            ];
        }
        return cardRetrieved;
    };

    /**
     * Function generates Sprite object for pre-loaded assets
     * @param {[Number, Number]} cardPosition - coordinates for card
     * @param {String} textureName  - asset name for card
     * @returns {Sprite} Sprite class object for newly generated asset
     */
    #createSprite = (cardPosition, textureName) => {
        const card = this.#gameScene.sys.add.sprite(cardPosition[0], cardPosition[1], textureName);
        card.setScale(0.15);
        return card;
    }

    /**
     * Function creates a random card at the card position
     * @param {[Number, Number]} cardPosition - tuple of card's coordinates 
     * @returns {Sprite} Sprite class object for the card
     */
    #createCardFace = (cardPosition) => {
        const textureType = this.#getRandomCard();
        return this.#createSprite(cardPosition, textureType);
    };

    /**
     * Function generates card back at each preset card position
     */
    createCardBacks = () => {
        this.#PRESET_POSITIONS.forEach(cardPosition => {
            const card = this.#createSprite(cardPosition, 'cardBack');
            card.setInteractive()
            this.#gameScene.sys.cardBacks.add(card);
        })
    };

    /**
     * Function creates a deck by generating random card at preset position
     */
    createDeck = () => {
        this.#PRESET_POSITIONS.forEach(cardPosition => {
            const card = this.#createCardFace(cardPosition);
            this.#gameScene.sys.cardFaces.add(card);
        })
    };

    /**
     * Function creates an event listener on cardBacks hiding cardFaces to reveal them when clicked
     */
    addCardBackEventListeners = () => {
        const allCardBacks = this.#gameScene.sys.cardBacks.children.entries;

        /**
         * Converts user click into custom event
         */
        this.#gameScene.sys.cardBacks.getChildren().forEach (cardBack => {
            cardBack.on('pointerdown', function () {
                let cardIndex = allCardBacks.indexOf(cardBack);
                if (cardIndex > 4) {
                    cardIndex = cardIndex - 5;
                }
                let cardRow = null;
                if (cardBack.y === 200) {
                    cardRow = 0;
                } else {
                    cardRow = 1;
                }
                this.emitter = EventDispatcher.getInstance();
                this.emitter.emit('userClicksCardBack', {cardBack, cardIndex, cardRow});
            });
        });

        this.emitter = EventDispatcher.getInstance();

        /**
         * Listener toggles cardBack visibility on flipCard event
         */
        this.emitter.addListener('flipCard', (event) => {
            event.cardBack.visible = false;
        });

        /**
         * Listener makes all cardBacks visible on resetDeck event
         */
        this.emitter.addListener('resetDeck', () => {
            this.#gameScene.sys.cardBacks.children.entries.forEach(cardBack => {
                if (cardBack !== null) {
                    cardBack.visible = true;
                }
            })
        });

        /**
         * Listener destroys matching cards whilst maintaining array length
         */
        this.emitter.addListener('handleMatch', (event) => {
            const card1BackIndex = this.#gameScene.sys.cardBacks.children.entries.indexOf(event.card1Back);
            const card1Index = this.#gameScene.sys.cardFaces.children.entries.indexOf(event.card1);
            const card2BackIndex = this.#gameScene.sys.cardBacks.children.entries.indexOf(event.card2Back);
            const card2Index = this.#gameScene.sys.cardFaces.children.entries.indexOf(event.card2);

            this.#gameScene.sys.cardFaces.children.entries[card1Index] = null;
            event.card1.destroy();
            this.#gameScene.sys.cardFaces.children.entries[card2Index] = null;
            event.card2.destroy();
            this.#gameScene.sys.cardBacks.children.entries[card1BackIndex] = null;
            event.card1Back.destroy();
            this.#gameScene.sys.cardBacks.children.entries[card2BackIndex] = null;
            event.card2Back.destroy();
        })
    };
};

class TimerRenderer {
    #gameTimeLimit = 30;
    #gameScene

    constructor (gameScene) {
        this.#gameScene = gameScene;
    }

    renderTimer = () => {
        this.#gameScene.sys.timer = this.#gameScene.sys.add.text(660, 10, `Timer: ${this.#gameTimeLimit}`);
        this.#gameScene.sys.timer.depth = 1;
        this.#gameScene.sys.timer.setScale(1.4);
        this.#gameScene.sys.myTime = this.#gameTimeLimit;
    };

    createTimerEvent = () => {
        this.#gameScene.sys.timerEvent = this.#gameScene.sys.time.addEvent({
          delay: 1000,
          loop: true,
          callback: () => {
            this.#countdown(this.#gameScene.sys.timer);
          },
          callbackScope: this,
        });
    };

    #countdown = (timer) => {
        if (gameIsStarted && this.#gameScene.sys.myTime > 0) {
            this.#gameScene.sys.myTime--;
        }
        timer.setText(`Timer: ${this.#gameScene.sys.myTime}`)
        if (this.#gameScene.sys.myTime === 0) {
            this.emitter = EventDispatcher.getInstance();
            this.emitter.emit('gameOver');
        };
    };
};

class ScoreRenderer {
    #score = 0;
    #gameScene;

    constructor (gameScene) {
        this.#gameScene = gameScene;
    };
    
    renderScore = () => {
        this.#gameScene.sys.scoreText = this.#gameScene.sys.add.text(20, 10, `Score: ${this.#score}`);
        this.#gameScene.sys.scoreText.setScale(1.4);
    };

    addEventListeners = () => {
        this.emitter = EventDispatcher.getInstance();
        this.emitter.addListener('handleMatch', () => {
            this.#score++;
            this.#gameScene.sys.scoreText.setText(`Score: ${this.#score}`);
        })
    };
}

// Global scope variable to ensure there is only ever one instance of EventDispatcher class
let eventDispatcherInstance = null;
/**
 * Singleton class handles the dispatching of custom events
 */
class EventDispatcher extends Phaser.Events.EventEmitter {
    constructor () {
        super();
    }

    static getInstance = () => {
        if (eventDispatcherInstance === null) {
            eventDispatcherInstance = new EventDispatcher();
        }
        return eventDispatcherInstance;
    };
};

// Global scope variable to ensure there is only ever one instance of StateHandler class
let stateHandlerInstance = null;
/**
 * Singleton class handles the updating of game state representation
 */
class StateHandler {
    #currentDeck = [[], []];
    #currentlySelected = [];
    #currentlySolved = 0;

    static getInstance = () => {
        if (stateHandlerInstance === null) {
            stateHandlerInstance = new StateHandler();
        }
        return stateHandlerInstance;
    };

    /**
     * Function updates the currentDeck property so that it matches the current rendering of the deck
     * @param {[Sprite]} allCards - Array of all cardFace sprites
     */
    representDeck = (allCards) => {
        allCards.map((card) => {
            if (card.y === 200) {
                this.#currentDeck[0].push(card);
            } else {
                this.#currentDeck[1].push(card);
            }
        });
        this.#currentDeck.forEach(row => {
            row.sort((a, b) => a.x - b.x);
        })
    };

    /**
     * Function retrieves data from event and determines how to interpret the user click event
     * @param {Event} event - Event generated by user clicking a card back
     */
    #handleUserClicksCardBack = (event) => {
        this.emitter = EventDispatcher.getInstance();

        const currentCardFace = this.#currentDeck[event.cardRow][event.cardIndex];

        if (this.#currentlySelected.length === 2) {
            this.#currentlySelected = [];
            this.emitter.emit('resetDeck');
        }

        this.#currentlySelected.push([currentCardFace, event.cardBack]);

        if (this.#currentlySelected.length === 2) {
            const card1 = this.#currentlySelected[0][0];
            const card1Back = this.#currentlySelected[0][1];
            const card2 = this.#currentlySelected[1][0];
            const card2Back = this.#currentlySelected[1][1];

            if (card1.texture.key === card2.texture.key) {
                this.#currentlySolved++;
                setTimeout(() => {
                    this.emitter.emit('handleMatch', {
                        card1,
                        card1Back,
                        card2,
                        card2Back,
                    })
                }, 250);
            }
        }
        this.emitter.emit('flipCard', {cardBack: event.cardBack});

        if (this.#currentlySolved === 5) {
            justRunOnceYouLittleShit = false;
            this.#currentDeck.shift();
            this.#currentDeck.shift();
            this.#currentDeck.unshift([]);
            this.#currentDeck.unshift([]);
            this.#currentlySelected = [];
            this.#currentlySolved = 0;
            this.emitter.emit('deckSolved');
        }
    };

    addEventListeners = () => {
        this.emitter = EventDispatcher.getInstance();
        this.emitter.addListener('userClicksCardBack',this.#handleUserClicksCardBack);
    }
};

const gameHandler = new GameHandler(
    800, 
    600, 
    memoryGame
);
gameHandler.addEventListeners();
gameHandler.initializeGame([
    'background',
    'darkBlueAlienCard',
    'greenAlienCard',
    'lightBlueAlienCard',
    'pinkAlienCard',
    'venusCard',
    'cardBack',
]);

const stateHandler = StateHandler.getInstance();
stateHandler.addEventListeners();

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: memoryGame,
    pixelArt: true,   
};

const game = new Phaser.Game(config);

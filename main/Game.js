const MENU_SCENE = 'menu';
const RADIO_SCENE = 'radio';
const IN_GAME_SCENE = 'drive';

const FPS = 60;

var controlCount = 0;

function GameModel() {
    this.scene = MENU_SCENE;
    this.renderSize = 300;
    this.playable = false;
    this.startDelay = 0;
    this.gameWorld = null;
}

GameModel.prototype.startNewWorld = function () {
    this.gameWorld = new GameWorld();
}

function GameView(model) {
    this.model = model;
}

GameView.prototype.drawLoading = function () {
    Canvas.fill('#008BFF');
    Canvas.canvasContext.fillStyle = "#000000";
    Canvas.canvasContext.fillRect(99, 126, 121, 12);
    Canvas.canvasContext.fillStyle = "#F7F700";
    Canvas.canvasContext.fillRect(99, 126, 121 * (loading / maxLoading), 12);
    Canvas.drawStaticImage(sprites['loading-box'], 98, 125, 124, 15);
    Canvas.drawStaticImage(sprites['loading-text'], 106, 84, 109, 28);
}

GameView.prototype.drawMenu = function () {
    Radio.draw();
}

GameView.prototype.drawGame = function () {
    if (this.model.gameWorld != null) {
        this.model.gameWorld.draw();
    }
}

function Game() {
    this.model = new GameModel();
    this.view = new GameView(this.model);
    this.eventListener = null;
}

Object.defineProperties(Game.prototype, {
    scene: {
        get: function () { return this.model.scene; },
        set: function (value) { this.model.scene = value; }
    },
    renderSize: {
        get: function () { return this.model.renderSize; },
        set: function (value) { this.model.renderSize = value; }
    },
    playable: {
        get: function () { return this.model.playable; },
        set: function (value) { this.model.playable = value; }
    },
    startDelay: {
        get: function () { return this.model.startDelay; },
        set: function (value) { this.model.startDelay = value; }
    },
    gameWorld: {
        get: function () { return this.model.gameWorld; },
        set: function (value) { this.model.gameWorld = value; }
    }
});

var time = null;
var currentTime = null;

Game.prototype.init = function () {
    time = new Date().getTime();
    loadAssets();
    this.eventListener = new EventListener();
}

Game.prototype.newGame = function () {
    this.model.startNewWorld();
}

Game.prototype.start = function () {
    Outrun.init();
    Outrun.mainLoop();
}

Game.prototype.mainLoop = function () {
    currentTime = new Date().getTime();
    var milliseconds = currentTime - time;
    if (milliseconds >= 1000 / FPS) {
        time = currentTime;
        if (loading < maxLoading) {
            this.view.drawLoading();
        } else {
            Radio.update();
            if (this.scene == MENU_SCENE | this.scene == RADIO_SCENE) {
                this.view.drawMenu();
            } else if (this.scene == IN_GAME_SCENE) {
                if (!this.playable) {
                    this.startDelay = (this.startDelay + 1) % FPS;
                    if (!this.startDelay)
                        this.gameWorld.road.nextLight();
                }
                this.gameWorld.play();
                this.gameWorld.update();
                this.view.drawGame();
            }
        }
        Canvas.fix();
    }

    requestAnimationFrame(this.mainLoop.bind(this));
}

Game.prototype.drawLoading = function () {
    this.view.drawLoading();
}

let Outrun = new Game();

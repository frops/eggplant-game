const { all } = require("promise-polyfill");

const RESOURCE_PATH = "spritesheet.json";

let App = PIXI.Application,
    Sprite = PIXI.Sprite;

let app = new App({
    width: 512, 
    height: 512,
    antialias: true
});

let id, state, score, value = 0, life = 100, target, gameScene,
    bg, timer = 10, tragetClick = true;

app.renderer.backgroundCoolor = 0xfff;
app.renderer.view.style.position = 'absolute';

let lifeBackMap = [
    {"min": 90, "img": "ep2.png"},
    {"min": 70, "img": "ep3.png"},
    {"min": 50, "img": "ep4.png"},
    {"min": 20, "img": "ep5.png"},
    {"min": 0, "img": "ep6.png"},
];

document.body.appendChild(app.view);

const loader = new PIXI.Loader();
loader
    .add(RESOURCE_PATH)
    .load(setup);


function setup() {
    id = loader.resources[RESOURCE_PATH].textures

    gameScene = new PIXI.Container();
    app.stage.addChild(gameScene);

    // Background
    bg = new PIXI.Sprite(id["background.png"]);
    bg.anchor.set(0, 0);
    gameScene.addChild(bg);

    // Scorebar
    let scoreBar = new PIXI.Container();
    gameScene.addChild(scoreBar);

    let rectangle = new PIXI.Graphics();
    rectangle.beginFill(0x312259)
        .drawRect(0,0, gameScene.width, 40)
        .endFill();
    scoreBar.addChild(rectangle);
    

    let style = new PIXI.TextStyle({
        fontFamily: "Helvetica Neue",
        fontSize: 20,
        fill: "#fff"
    });

    score = new PIXI.Text("❤️ 100", style);
    score.x = (gameScene.width / 2) - score.width/2;
    score.y = (scoreBar.height / 2) - score.height / 2;

    scoreBar.addChild(score);

    // Target - eggplant
    target = new PIXI.Sprite(id["ep1.png"])
    target.anchor.set(0.5);
    target.width *= 1.3;
    target.height *= 1.3;
    target.x = (gameScene.width / 2);
    target.y = (gameScene.height / 2);
    target.interactive = true;
    target.buttonMode = true;
    target.on("pointerdown", handlerClick);

    // Loading all eggplants
    lifeBackMap.forEach(function callback(val, index, array) {
         lifeBackMap[index].sprite = new PIXI.Sprite(id[val.img])
     });
    
    gameScene.addChild(target);

    state = play;

    app.ticker.add(delta => gameLoop(delta))
}

function gameLoop(delta) {
    state(delta);
}

function play() {
    if (timer == 0) {
        tragetClick = true;

        target.scale.x = 1.3;
        target.scale.y = 1.3;
    } else if (timer > 0) {
        timer--;
    }
}

function handlerClick() {
    if (tragetClick == true) {
        value++;
        life -= rand(1, 4);
        score.text = "❤️ " + life;

        target.scale.x = 1.25;
        target.scale.y = 1.25;

        tragetClick = false;
        timer = 10;
        
        changeTargetTexture();
    }
}

function rand(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

function changeTargetTexture() {
    lifeBackMap.forEach(function callback(val, index, array) {
        if (life <= val.min) {
            console.log(life, val.min);
            target.texture = val.sprite.texture;
        }
    });
}
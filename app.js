const RESOURCE_PATH = "spritesheet.json";
const MIN_DAMAGE = 1;
const MAX_DAMAGE = 5;
const RAY_COUNT = 20;
const RAY_MAX_WAY = 100;
const RAY_SPEED = 0.1;
const RAY_TIMER = 40;
const POINT_FLOW_TIMER = 100;

let App = PIXI.Application,
    Sprite = PIXI.Sprite;

let app = new App({
    width: 512,
    height: 512,
    antialias: true
});

let id, state, score, ray = 0, value = 0, life = 100, target, gameScene,
    bg, timer = 10, timerRay = 0, timerPointFlow = 0, tragetClick = true, lines = [];

let pointFlowConfig = {
    sin: null,
    cos: null,
};

app.renderer.backgroundCoolor = 0xaaa;
app.renderer.view.style.position = 'absolute';

let lifeBackMap = [
    { "min": 0, "img": "ep6.png", "text": "Ееее! Баклажан повержен!" },
    { "min": 20, "img": "ep5.png", "text": "Почти потрачено" },
    { "min": 50, "img": "ep4.png", "text": "Половина пути уже пройдено" },
    { "min": 70, "img": "ep3.png", "text": "Да, детка! Жми быстрей!" },
    { "min": 90, "img": "ep2.png", "text": "Начало положено. Уничтожь его!" },
];

document.body.appendChild(app.view);

loadingText = new PIXI.Text("Загрузка..", new PIXI.TextStyle({
    fontFamily: "Verdana",
    fontSize: 25,
    fill: "#fff"
}));
app.stage.addChild(loadingText);
loadingText.anchor.set(0.5);
loadingText.position.set(240);

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
        .drawRect(0, 0, gameScene.width, 40)
        .endFill();
    scoreBar.addChild(rectangle);

    score = new PIXI.Text("❤️ 100", new PIXI.TextStyle({
        fontFamily: "Verdana",
        fontSize: 18,
        fill: "#fff"
    }));
    score.anchor.set(0.5);
    score.x = (gameScene.width / 2) - score.width / 4;
    score.y = (scoreBar.height / 2);

    scoreBar.addChild(score);

    //Finish text
    finishText = new PIXI.Text("ИГРА ЗАВЕРШЕНА", new PIXI.TextStyle({
        fontFamily: "Verdana",
        fontSize: 34,
        fill: "#fff",
        dropShadow: "#000",
        dropShadowBlur: 10,
        dropShadowDistance: 3
    }));
    finishText.anchor.set(0.5);
    finishText.x = (gameScene.width / 2);
    finishText.y = 110;
    finishText.alpha = 0;

    gameScene.addChild(finishText);

    // Version Text
    finishText = new PIXI.Text("Версия 1.2", new PIXI.TextStyle({
        fontFamily: "Verdana",
        fontSize: 12,
        fill: "#fff",
        dropShadow: "#000",
        dropShadowBlur: 4,
        dropShadowDistance: 2
    }));
    finishText.anchor.set(0.5);
    finishText.x = gameScene.width - finishText.width + 25;
    finishText.y = gameScene.height - finishText.height - 2;

    gameScene.addChild(finishText);

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

    // Text bottom
    let bottomBar = new PIXI.Graphics();
    bottomBar.beginFill(0x312259, 0.5)
        .drawRect(0, 0, gameScene.width, 70)
        .endFill();
    bottomBar.y = 400;

    gameScene.addChild(bottomBar);

    textBottom = new PIXI.Text("Кликай на баклажан и убей его!", new PIXI.TextStyle({
        fontFamily: "Verdana",
        fontSize: 18,
        fill: "#fff",
        dropShadow: "#000",
        dropShadowBlur: 5,
        dropShadowDistance: 3
    }));
    textBottom.anchor.set(0.5);
    textBottom.x = (gameScene.width / 2);
    textBottom.y = bottomBar.y + bottomBar.height / 2;

    gameScene.addChild(textBottom);

    // Loading all eggplants
    lifeBackMap.forEach(function callback(val, index, array) {
        lifeBackMap[index].sprite = new PIXI.Sprite(id[val.img])
    });

    gameScene.addChild(target);

    // Loading rays
    loadRays();
    loadPointFlow();

    state = play;

    app.ticker.add(delta => gameLoop(delta))
}

function gameLoop(delta) {
    state(delta);
}

function loadPointFlow() {
    pointFlow = new PIXI.Text("", new PIXI.TextStyle({
        fontFamily: "Verdana",
        fontSize: 24,
        fill: "#fff"
    }));
    pointFlow.anchor.set(0.5);
    gameScene.addChild(pointFlow);
}

function loadRays() {
    for (let i = 0; i < RAY_COUNT; i++) {
        let degree = (360 / RAY_COUNT) * i;
        let theta = degree * Math.PI / 180;
        let sin = Math.sin(theta);
        let cos = Math.cos(theta);

        lines[i] = {
            graphics: new PIXI.Graphics(),
            sin: sin,
            cos: cos,
        }

        gameScene.addChild(lines[i].graphics);

        lines[i].graphics.lineStyle(2, 0xe2da9c)
            .moveTo(0, 0)
            .lineTo(sin * 15, cos * 15)
            .endFill();
        lines[i].graphics.alpha = 0;
    }
}

function play() {
    if (timer == 0) {
        tragetClick = true;

        target.scale.x = 1.3;
        target.scale.y = 1.3;

        score.scale.x = 1.1;
        score.scale.y = 1.1;
    } else if (timer > 0) {
        timer--;
    }

    runRays();
    runPointFlow();
}

function handlerClick(e) {
    if (tragetClick == true) {
        if (life > 0) {
            let damage = rand(MIN_DAMAGE, MAX_DAMAGE);
            life = Math.max(0, life - damage);

            if (life > 0) {
                score.text = "❤️ " + life;
            } else {
                score.text = "💔 0";
                finishText.alpha = 1;
            }

            target.scale.x = 1.25;
            target.scale.y = 1.25;

            score.scale.x = 1;
            score.scale.y = 1;

            tragetClick = false;
            timer = 10;

            changeTargetTexture();
            resetRayLines(e);
            resetPointFlow(e, damage)
        } else if (life == 0) {
            score.text = "💔 0";
        }
    }

    resetRayLines(e);
}

function changeTargetTexture() {
    lifeBackMap.forEach(function callback(val, index, array) {
        nextVal = typeof lifeBackMap[index + 1] !== 'undefined' ? lifeBackMap[index + 1].min : 100;

        let isAccept = life <= val.min && (index == 0 || life > lifeBackMap[index - 1].min)
        console.log(life, val.min, isAccept);
        if (isAccept) {
            target.texture = val.sprite.texture;
            textBottom.text = val.text;
        }
    });
    console.log("====");
}

function runRays() {
    if (timerRay > 0) {
        speed = 6;
        for (let i = 0; i < RAY_COUNT; i++) {
            lines[i].graphics.position.x += lines[i].sin * speed;
            lines[i].graphics.position.y += lines[i].cos * speed;
            lines[i].graphics.alpha -= 0.05;
        }

        timerRay--;
    }
}

function runPointFlow() {
    if (timerPointFlow > 0) {
        pointFlow.alpha -= 0.01;
        pointFlow.position.x += pointFlowConfig.sin * 2;
        pointFlow.position.y += pointFlowConfig.cos * 2;
        timerPointFlow--;
    }
}

function resetRayLines(e) {
    if (timerRay > RAY_TIMER / 3) {
        return;
    }

    timerRay = RAY_TIMER;

    for (let i = 0; i < RAY_COUNT; i++) {
        lines[i].graphics.position.x = e.data.global.x;
        lines[i].graphics.position.y = e.data.global.y;
        lines[i].graphics.alpha = 1;
    }
}

function resetPointFlow(e, damage) {
    timerPointFlow = POINT_FLOW_TIMER;

    pointFlow.position.x = e.data.global.x;
    pointFlow.position.y = e.data.global.y;
    pointFlow.alpha = 1;
    pointFlow.text = "+" + damage;

    let degree = rand(0, 360);
    pointFlowConfig.sin = Math.sin(degree);
    pointFlowConfig.cos = Math.cos(degree);
}

function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}
let imgPaths;
let streets;
let images = {};
let popImages = {};
let overlayImages = {};
let bgImg;
let sorted;
let iconList;
let LVICON;
let assetsLoaded = false;
let imgPathsCache = null;
let isFinished = true;

const headingDelays = {
    "cuisine": 26000,
    "houses": 18000,
    "library": 15000,
    "supermarket": 28000,
    "above_blue": 0,
    "above_map": 32000,
    "arch": 5000,
    "below_blue": 39000,
    "houseFade": 40000,
    "icon": 30000,
    "BG": 39000,
    "effect": 41000,
    "label": 42000,
    "stripRes": 0,
    "ds": 19000
};

const bgDelays = {
    3 : 31000,
    7 : 73000,
    4 : 22000,
    8 : 18000,
}

let popHeadings = ["houses", "library", "supermarket"];

const iconAudioData = {
    'icon-0-LVICON': {
        audio: null,
        path: ["assets/audio/audio_1.mp3", "assets/audio/audio_2.mp3"],
        snippet: [1, 2],
        bgPaths: [null, null],
        bgAudios: null,
    },
    'icon-CHICON': {
        audio: null,
        path: ["assets/audio/audio_7.mp3", "assets/audio/audio_6.mp3"],
        snippet: [7, 6],
        bgPaths: ["assets/audio/ctown-sounds.mp3", null],
        bgAudios: null
    },
    'icon-SMICON': {
        audio: null,
        path: ["assets/audio/audio_9.mp3"],
        snippet: [9],
        bgPaths: [null],
        bgAudios: null
    },
    'icon-house2': {
        audio: null,
        path: ["assets/audio/audio_5.mp3"],
        snippet: [5],
        bgPaths: [null],
        bgAudios: null
    },
    'icon-DSICON': {
        audio: null,
        path: ["assets/audio/audio_4.mp3"],
        snippet: [4],
        bgPaths: ["assets/audio/ds-sounds.mp3"],
        bgAudios: null
    },  
    'icon-LIBICON': {
        audio: null,
        path: ["assets/audio/audio_8.mp3"],
        snippet: [8],
        bgPaths: ["assets/audio/lib-sounds.mp3"],
        bgAudios: null
    },
    'icon-alt-STRICON': {
        audio: null,
        path: ["assets/audio/audio_3.mp3"],
        snippet: [3],
        bgPaths: ["assets/audio/casino-sounds.mp3"],
        bgAudios: null
    }
}

const colorKeys = {
    "white" : "255, 255, 255, 1",
    "yellow": "255, 233, 77, 1",
    "blue": "77, 216, 255, 1",
    "pink": "255, 171, 149, 1"
}

let snippetsData;

let activeSubs = null;
let subIndex = -1;
let subStartTime = 0;
let subRecordedTime = -1;

let bgStack = [];
const BG_VOLUME = 0.6;
const BG_DUCKED_VOLUME = 0.2;

class imgContainer{
    constructor(meta, img, isVis, delay = 15000, speed = 0.01){
        this.name = meta.nameNoExt;
        this.heading = meta.heading;
        this.label = meta.label;
        this.img = img;
        this.w = img.width;
        this.h = img.height;
        this.ogX = meta.x;
        this.ogY = meta.y;
        this.x = meta.x;
        this.y = meta.y;

        this.triggered = false;

        this.moveMode = meta.moveMode;
        this.isIcon = (this.heading === "icon");

        this.headingList = meta.headingList;
        //this.headingQueue = meta.headingQueue ?? [meta.headingList]
        this.iconNameList = meta.iconNextList;
        this.glowColors = meta.glowColors;
        this.queueIndex = 0;

        //transform shit
        this.scale = meta.scale;
        this.flipX = meta.flipX;
        this.zIndex = meta.zIndex;
        this.angle = radians(meta.angle ?? 0);

        //used to time all movement types
        // this.startTimer = 1000;
        // this.starting = false;
        this.timer = 0;
        this.delay = delay;

        // smooth spin variables
        this.spinSpeed = 0;
        this.targetSpinSpeed = 0;
        this.spinAccel = 0.002;
        this.maxSpinSpeed = random(0.08, 0.5);
        this.spinDuration = 0;

        
        if (isVis){
            this.isVis = true;
            this.alpha = 255;
            this.targetAlpha = 255;
        }
        else {
            this.isVis = false;
            this.alpha = 0;
            this.targetAlpha = 0;  
        }
        
        this.speed = speed;

        if (this.moveMode === 0){ //smooth spin
            //this.isSpinning = true;
            this._scheduleNextSpin();
        }
        else if (this.moveMode === 1){ //snap spin
            //this.isSnapSpinning = true;
            this._scheduleNextMovement();
        }
        else if (this.moveMode === 2){ //flash around
            //this.isFlash = true;
            this._scheduleNextMovement();
        }

    }

    fadeIn() {
        this.triggerTime = millis() + this.delay + random(4,7) * 1000;
        this.targetAlpha = 255; 
        this.isVis = true; 
        //this.triggered = true;
    }
    fadeOut() {
        this.triggerTime = millis() + this.delay + random(4, 7) * 1000;
        this.targetAlpha = 0; 
        this.isVis = false;
    }

    //general non smooth spin movement
    _scheduleNextMovement(){
        this.timer = int(random(30, 180));
    }

    // --- smooth spin ---
    _scheduleNextSpin() {
        this.timer = int(random(75, 300));
        this.spinDuration = int(random(30, 100));
        this.maxSpinSpeed = random(0.08, 0.5);
    }

    // --- snap spin ---
    _snap() {
        this.angle = random(-PI/4, PI/4);
    }

    // --flash--
    _flash(){
        //tint(255, 0);
        this.x = int(random(this.ogX-20, this.ogX + 20));
        this.y = int(random(this.ogY-25, this.ogY + 20));
        //tint(255, 255);
    }

    inBounds() {
        if (!this.isIcon || !this.isVis || this.triggered) return false; // reemmebr to put back in ||!isfinished
        let hw = (this.w * this.scale) / 2;
        let hh = (this.h * this.scale) / 2;
        return mouseX > this.x - hw &&
            mouseX < this.x + hw &&
            mouseY > this.y - hh &&
            mouseY < this.y + hh;
    }

    update() {
        if (this.triggerTime !== null && millis() < this.triggerTime) return;

        this.alpha = lerp(this.alpha, this.targetAlpha, this.speed);

        // smooth spin
        if (this.moveMode === 0) {
            if (this.timer > 0) {
                this.timer--;
                this.targetSpinSpeed = 0;
            } else if (this.spinDuration > 0) {
                this.spinDuration--;
                this.targetSpinSpeed = this.maxSpinSpeed;
                if (this.spinDuration === 0) this._scheduleNextSpin();
            }
            this.spinSpeed = lerp(this.spinSpeed, this.targetSpinSpeed, this.spinAccel * 10);
            this.angle += this.spinSpeed;
        }

        // snap spin
        if (this.moveMode === 1) {
            this.timer--;
            if (this.timer <= 0) {
                this._snap();
                this._scheduleNextMovement();
            }
        }

        if (this.moveMode === 2){
            this.timer--;
            if (this.timer <= 0) {
                this._flash();
                this._scheduleNextMovement();
            }
        }
    }

    draw() {
        if (this.alpha < 1 && this.targetAlpha === 0) return;

        push();
        translate(this.x, this.y); 
        if (this.heading === "effect"){blendMode(OVERLAY);}
        else if (this.name.includes("effect")){blendMode(SCREEN);}
        if (this.heading === "ds"){
            if (this.name.includes("0")){
                blendMode(HARD_LIGHT);
            }
            else if (this.name.includes("1")){
                blendMode(OVERLAY);
            }
            else {
                blendMode(MULTIPLY);
            }
        }
        tint(255, this.alpha);
        scale(this.flipX ? -this.scale : this.scale, this.scale);
        rotate(this.angle);
        
        if (this.inBounds()) {
            let glow = this.glowColors[this.queueIndex];
            drawingContext.shadowBlur = 50;
            drawingContext.shadowColor = `rgba(${glow}, 1)`;
            
        } else {
            drawingContext.shadowBlur = 0;
        }

        image(this.img, 0, 0, this.w, this.h);

        blendMode(BLEND);
        noTint();
        pop();
    }


}

class PopImage {
  constructor(img, name, heading, relScale, x, y, w, h, delay) {
    this.img = img;
    this.name = name;
    this.heading = heading;
    this.relScale = relScale;
    this.x = x; this.y = y;
    this.w = w; this.h = h;

    this.delay = delay; // ms before this one pops}

    this.isVis = false;
    this.scale = 0;
    this.popped = false;
    this.triggerTime = null;
  }

  trigger(startTime) {
    if (this.popped){return;} //dont re-trigger pop
    this.triggerTime = startTime + this.delay;
    this.popped = false;
    this.isVis = false;
    this.scale = 0;
  }

  update(now) {
    if (this.triggerTime === null) return;
    if (!this.popped && now >= this.triggerTime) {
      this.isVis = true;
      this.scale = 0.80*this.relScale;
      this.popped = true;
    }
    if (this.popped && this.scale*this.relScale > 0.75*this.relScale) {
      this.scale = lerp(this.scale*this.relScale, 0.75*this.relScale, 0.2);
    }
  }

  draw() {
    if (!this.isVis) return;

    push();
    translate(this.x, this.y); 
    scale(this.scale);
    image(this.img, 0, 0, this.w, this.h);

    pop();
  }
}

function setLoadingStatus(text) {
    document.getElementById('loading-status').textContent = text;
}

function onAssetsReady() {
    let btn = document.getElementById('play-btn');
    btn.textContent = 'Play';
    btn.classList.add('ready');
    btn.disabled = false;
    document.getElementById('loading-status').textContent = '';

    btn.addEventListener('click', () => {
        let overlay = document.getElementById('start-overlay');
        overlay.style.opacity = '0';
        setTimeout(() => overlay.style.display = 'none', 800);
    });
}

function mousePressed() {
    for (let icon of iconList) {
        if (icon.inBounds()) {
            icon.onClick();
            console.log(`${icon.name} clicked`);
            if (icon.headingList.length === 1 || icon.queueIndex === icon.headingList.length){
                icon.triggered = true;
            }
            //console.log(icon.triggered);
            break;
        }
    }

    console.log(`{ x: ${mouseX}, y: ${mouseY} }`);
}

function showImage(headingList) {

    console.log("triggered");
    console.log(`${headingList}`)

    if (headingList === null || headingList.length === 0) {return;}

    for (let label of headingList){
        if (popHeadings.includes(label)){
            for (let key in popImages){
                let img = popImages[key];
                if (img.heading === label){
                    img.trigger(millis());
                }
            }
        }
        else if (label === "ds"){
            for (let key in overlayImages){
                let img = overlayImages[key];
                img.fadeIn();
            }
        }
        else {
            for (let key in images) {
                let img = images[key];
                if (img.heading === label){
                    if (img.isVis){ img.fadeOut();}
                    else{img.fadeIn(); }
                } 
            }
        }
        
    }
}

function showIcons(iconNameList) {
    for (let icon of iconList) {
        if (iconNameList.includes(icon.name)) {
            console.log("showIcon triggered");
            if (icon.isVis){ icon.fadeOut();}
            else{icon.fadeIn(); }
        }
    }
}

function addBgSound(sound) {
    console.log("in addbgsound");
    // duck all existing tracks
    for (let s of bgStack) {
        s.amp(BG_DUCKED_VOLUME, 1);
    }
    // add and play new one at full volume
    sound.amp(BG_VOLUME);
    sound.play();
    sound.loop();
    console.log("is sound playing?", sound.isPlaying());
    bgStack.push(sound);
}

function playIconAudio(iconName, stepIndex) {
    let data = iconAudioData[iconName];
    if (!data || !snippetsData) return;

    if (activeSubs && activeSubs.audio.isPlaying()) {
        activeSubs.audio.stop();
    }

    let bgAudio = data.bgAudios?.[stepIndex];
    console.log(`playing this icon data`);
    console.log(data);
    if (bgAudio) {
        console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(bgAudio)));
        let delayInt = bgDelays[data.snippet];
        setTimeout(() => {
            addBgSound(bgAudio);
        }, delayInt); // delay in ms before bg sound plays
    }

    // find the matching snippet
    let snippet = snippetsData.find(s => s.snippet === data.snippet[stepIndex]);
    
    activeSubs = {
        audio: data.audio[stepIndex],
        subtitles: snippet.meta.map(m => m.subtitle),
        cues: snippet.meta.map(m => m.time),
        colors: snippet.meta.map(m => m.color),
        finished: false 
    };


    activeSubs.audio.onended(() => {
        activeSubs.finished = true; 
    });

    subIndex = -1;
    subStartTime = millis();
    subRecordedTime = -1;
    data.audio[stepIndex].play();
}

function timeSubtitles() {
    if (!activeSubs) return;
    let cues = activeSubs.cues;
    for (let i = 0; i < cues.length; i++) {
        if (subRecordedTime < cues[i]) {
            subIndex = i - 1;
            return;
        }
    }
    subIndex = cues.length - 1;
}


function loadImageAsync(path) {
  return new Promise((resolve, reject) => {
        loadImage(path, 
            (img) => resolve(img),
            (err) => {
                console.error(`❌ Failed to load image: ${path}`, err);
                reject(err);
            }
        );
    });
}

let visibleHeadings = ["stripRes", "effect", "above_blue", "above_map", "below_blue", "BG"];

//let visibleHeadings = ["stripRes", "above_blue", "above_map", "cuisine", "arch", "icon", "houseFade", "houses", "label"];
let houseDelay = 5570;
let lastInterval = 0;
async function loadByHeading(heading) {
    if (!imgPathsCache){
        const response = await fetch('assets/images/imgPaths.json');
        imgPathsCache = await response.json();
    }

    const group = imgPathsCache.filter(i => i.heading === heading);
    let headCheck = false;
    if (visibleHeadings.includes(heading)) {headCheck = true;}

    let delayInterval = headingDelays[heading];
    const results = await Promise.all(
        group.map(async (meta, i) => {
            let isVis = false;
            const img = await loadImageAsync(meta.path);
            //console.log(meta.path, img.width, img.height);
            if (popHeadings.includes(heading)) {
                let interval = 0;
                if (heading === "houses"){
                    interval = lastInterval + houseDelay;
                    lastInterval = interval;
                    houseDelay = houseDelay*0.85;
                }
                else if (heading === "library"){
                    interval = 5750*(Math.floor(i/2)) + 150*(i&1);
                }
                else {
                    interval = 3000*(Math.floor((i+1)/2)) + 150*(i&1);
                }
                return new PopImage(img, meta.nameNoExt, meta.heading, meta.scale, meta.x, meta.y, meta.w, meta.h, delayInterval + interval);
            }
            // else if (heading === "ds"){
            //     img.resize(img.width * 0.75, img.height * 0.75);
            //     return new imgContainer(meta, img, isVis, delayInterval);
            // }
            img.resize(img.width * 0.75, img.height * 0.75);
            if (headCheck || meta.nameNoExt === "icon-0-LVICON"){isVis = true;}
            return new imgContainer(meta, img, isVis, delayInterval);
        })

    );
    console.log(`All ${heading} assets loaded:`, results);
    return results;
}

async function setup() {
    createCanvas(1920, 1080);
    imageMode(CENTER);
    textSize(40);
    textAlign(CENTER, CENTER);

    setLoadingStatus('audio data loading');
    const res = await fetch('assets/audio/subtitleData.json');
    snippetsData = await res.json();

    for (let key in iconAudioData) {
        let data = iconAudioData[key];
        data.audio = await Promise.all(data.path.map(p => loadSound(p)));
        data.bgAudios = await Promise.all(
        data.bgPaths.map(p => p ? loadSound(p) : null)
    );
    }
    console.log(iconAudioData);
    setLoadingStatus("audio data loaded, background loading");

    bgImg = await loadImage("assets/images/BACKGROUND.png");
    setLoadingStatus('background loaded, houses loading');

    //// --loading popimages-- headings are houses, library, and supermarket
    const houses = await loadByHeading('houses');
    setLoadingStatus('houses loaded, libraries loading')
    const libraries = await loadByHeading('library');
    setLoadingStatus('libraries loaded, supermarkets loading')
    const supermarkets = await loadByHeading('supermarket');

    for (let asset of houses){
        popImages[asset.name] = asset;
    }
    
    for (let asset of libraries){
        popImages[asset.name] = asset;
    }
    
    for (let asset of supermarkets){
        popImages[asset.name] = asset;
    }
    setLoadingStatus('supermarkets loaded, cuisine loading')

    // // //--loading fadeimages---
    const cuisine = await loadByHeading('cuisine');

    for (let asset of cuisine) {
        images[asset.name] = asset; //perhaps put images into separate arrays depending on heading?
    }
    setLoadingStatus('cuisine loaded, desert loading');

    const ds = await loadByHeading('ds');

    for (let asset of ds) {
        overlayImages[asset.name] = asset;
    }
    setLoadingStatus("desert loaded, architecture loading");

    const arch = await loadByHeading('arch');

    for (let asset of arch) {
        images[asset.name] = asset; //perhaps put images into separate arrays depending on heading?
    }
    setLoadingStatus('architecture loaded, stripres loading')
    
    const stripRes = await loadByHeading('stripRes');

    for (let asset of stripRes){
        images[asset.name] = asset;
    }
    setLoadingStatus('stripres loaded, strip-1 assets loading')

    const aboveBlue = await loadByHeading('above_blue');
    for (let asset of aboveBlue){
        images[asset.name] = asset;
    }
    setLoadingStatus('strip-1 assets loaded, strip-2 assets loading')

    const belowBlue = await loadByHeading('below_blue');
    for (let asset of belowBlue){
        images[asset.name] = asset;
    }
    setLoadingStatus('strip-2 assets loaded, strip-2a loading')

    const effect = await loadByHeading('effect');
    for (let asset of effect){
        images[asset.name] = asset;
    }
    setLoadingStatus('strip-2a loaded, bg loading')

    const BG = await loadByHeading('BG');
    for (let bg of BG ){
        images[bg.name] = bg;
    }
    setLoadingStatus('bg loaded, strip-3 assets loading')

    const aboveMap = await loadByHeading('above_map');
    for (let asset of aboveMap){
        images[asset.name] = asset;
    }
    setLoadingStatus('strip-3 assets loaded, house other assets loading')

    const houseFade = await loadByHeading('houseFade');
    for (let asset of houseFade){
        images[asset.name] = asset;
    }
    setLoadingStatus('house other assets loaded, icons loading')

    const icons = await loadByHeading('icon');
    for (let asset of icons){
        images[asset.name] = asset;
    }
    setLoadingStatus('icons loaded, final assets loading')

    const labels = await loadByHeading('label');
    for (let asset of labels){
        images[asset.name] = asset;
    }
    setLoadingStatus('labels loaded')

    sorted = Object.values(images).sort((a, b) => a.zIndex - b.zIndex);

    iconList = Object.values(images).filter(img => img.isIcon);

    iconList.forEach(icon => {
        icon.onClick = () => {
            let current = icon.headingList[icon.queueIndex];
            
            if (icon.iconNameList !== null && icon.queueIndex < icon.iconNameList.length){
                showIcons(icon.iconNameList[icon.queueIndex]);
            }
            playIconAudio(icon.name, icon.queueIndex);

            //await ensureLoaded(current);
            showImage(current);


            if (icon.queueIndex < icon.headingList.length) {
                icon.queueIndex++; // advance to next interaction
            } 
        }
    });

    console.log(images);
    onAssetsReady();
}

function draw() {

    background(220);
    image(bgImg, 960, 540, 1920, 1080);
    //console.log(bgStack);
    //image(streets, 960, 540, 1920*0.94, 1080*0.94);
    //images["arch-roof-99"].draw();

    let anyHovered = false;
    for (let key in sorted) {
        sorted[key].update();
        sorted[key].draw();
        if (sorted[key].heading ==="icon" && sorted[key].inBounds()) {
            anyHovered = true;
        }
    }

    for (let key in popImages) {
        popImages[key].update(millis());
        popImages[key].draw();
    }

    for (let key in overlayImages) {
        overlayImages[key].update();
        overlayImages[key].draw();
    }

    cursor(anyHovered ? HAND : ARROW);

    noStroke;
    fill("black");
    rect(0, 965, 1920, 115);

    if (activeSubs) {
        subRecordedTime = millis() - subStartTime;
        timeSubtitles();
        if (subIndex > -1) {
            let colorStr = colorKeys[activeSubs.colors[subIndex]];
            fill(`rgba(${colorStr})`); // ← uses color from json
            text(activeSubs.subtitles[subIndex], 960, 1022.5);
        }
        isFinished = activeSubs.finished;
        //console.log(activeSubs.finished)

        if (isFinished){
            activeSubs = null;
            subIndex = -1
        }
    }
}

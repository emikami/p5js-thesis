let imgPaths;
let streets;
let images = {};
let popImages = {};
let bgImg;
let sorted;
let iconList;
let LVICON;
let assetsLoaded = false;

let popHeadings = ["houses", "library", "supermarket"];

class imgContainer{
    constructor(meta, img, isVis, speed = 0.05 ){
        this.name = meta.nameNoExt;
        this.heading = meta.heading;
        this.label = meta.label;
        this.img = img;
        this.w = img.width * 0.75;
        this.h = img.height * 0.75;
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

        //transform shit
        this.scale = meta.scale;
        this.flipX = meta.flipX;
        this.zIndex = meta.zIndex;
        this.angle = radians(meta.angle ?? 0);

        //used to time all movement types
        this.timer = 0;

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
        //if (this.triggered === true) {return;}
        this.targetAlpha = 255; 
        this.isVis = true; 
        //this.triggered = true;
    }
    fadeOut() {
        //if (this.triggered === true) {return;}
        this.targetAlpha = 0; 
        this.isVis = false;
        //this.triggered = true;
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
        if (!this.isIcon || !this.isVis || this.triggered) return false;
        let hw = (this.w * this.scale) / 2;
        let hh = (this.h * this.scale) / 2;
        return mouseX > this.x - hw &&
            mouseX < this.x + hw &&
            mouseY > this.y - hh &&
            mouseY < this.y + hh;
    }

    update() {
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
        push();
        translate(this.x, this.y); 
        if (this.heading === "effect"){blendMode(SCREEN);}
        tint(255, this.alpha);
        scale(this.flipX ? -this.scale : this.scale, this.scale);
        rotate(this.angle);
        
        if (this.inBounds()) {
            drawingContext.shadowBlur = 50;
            drawingContext.shadowColor = 'rgba(255, 215, 0, 1)';
            
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

function mousePressed() {
    //showImage("cuisine");
    // let now = millis();

    // for (let thing in popImages){
    //     popImages[thing].trigger(now);
    // }
    for (let icon of iconList) {
        if (icon.inBounds()) {
            icon.onClick();
            console.log(`${icon.name} clicked`);
            icon.triggered = true;
            break;
        }
        //console.log(`no icon clicked`);
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
    if (iconNameList === null){return;}

    for (let icon of iconList) {
        if (iconNameList.includes(icon.name)) {
            console.log("showIcon triggered");
            icon.fadeIn();
        }
    }
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

async function loadByHeading(heading) {
    const response = await fetch('assets/images/imgPaths.json');
    const imgPaths = await response.json();
    const group = imgPaths.filter(i => i.heading === heading);
    let headCheck = false;
    if (visibleHeadings.includes(heading)) {headCheck = true;}

    const results = await Promise.all(
        group.map(async (meta, i) => {
            let isVis = false;
            const img = await loadImageAsync(meta.path);
            if (popHeadings.includes(heading)) {
                let interval = i*350;
                if (!heading === "houses" && meta.name.includes("label")){interval = i*50;}
                return new PopImage(img, meta.nameNoExt, meta.heading, meta.scale, meta.x, meta.y, meta.w, meta.h, interval);
            }
            if (headCheck || meta.nameNoExt === "icon-0-LVICON"){isVis = true;}
            return new imgContainer(meta, img, isVis);
        })

    );
    console.log(`All ${heading} assets loaded:`, results);
    return results;
}

async function setup() {
    createCanvas(1920, 1080);
    imageMode(CENTER);

    bgImg = await loadImage("assets/images/BACKGROUND.png");
    streets = await loadImage("assets/streets-real.png");

    //--loading popimages-- headings are houses, library, and supermarket
    // const houses = await loadByHeading('houses');
    // const libraries = await loadByHeading('library');
    // const supermarkets = await loadByHeading('supermarket');

    // for (let asset of houses){
    //     popImages[asset.name] = asset;
    // }
    // for (let asset of libraries){
    //     popImages[asset.name] = asset;
    // }
    // for (let asset of supermarkets){
    //     popImages[asset.name] = asset;
    // }

    // //--loading fadeimages---
    // const cuisine = await loadByHeading('cuisine');

    // for (let asset of cuisine) {
    //     images[asset.name] = asset; //perhaps put images into separate arrays depending on heading?
    // }

    const arch = await loadByHeading('arch');

    for (let asset of arch) {
        images[asset.name] = asset; //perhaps put images into separate arrays depending on heading?
    }
    
    const stripRes = await loadByHeading('stripRes');

    for (let asset of stripRes){
        images[asset.name] = asset;
    }

    const aboveBlue = await loadByHeading('above_blue');
    for (let asset of aboveBlue){
        images[asset.name] = asset;
    }

    const belowBlue = await loadByHeading('below_blue');
    for (let asset of belowBlue){
        images[asset.name] = asset;
    }

    const effect = await loadByHeading('effect');
    for (let asset of effect){
        images[asset.name] = asset;
    }

    const BG = await loadByHeading('BG');
    for (let bg of BG ){
        images[bg.name] = bg;
    }

    const aboveMap = await loadByHeading('above_map');
    for (let asset of aboveMap){
        images[asset.name] = asset;
    }

    const houseFade = await loadByHeading('houseFade');
    for (let asset of houseFade){
        images[asset.name] = asset;
    }

    const icons = await loadByHeading('icon');
    for (let asset of icons){
        images[asset.name] = asset;
    }

    const labels = await loadByHeading('label');
    for (let asset of labels){
        images[asset.name] = asset;
    }

    sorted = Object.values(images).sort((a, b) => a.zIndex - b.zIndex);

    iconList = Object.values(images).filter(img => img.isIcon);

    iconList.forEach(icon => {
        icon.onClick = () => {
            showImage(icon.headingList);
            showIcons(icon.iconNameList);
            // showIcons(icon.iconNameList);
            // let current = icon.headingList[icon.queueIndex];
            // showImage(current);
            // 
            // if (icon.queueIndex < icon.headingQueue.length - 1) {
            //     icon.queueIndex++; // advance to next interaction
            // } 
        }
    });

    console.log(images);
}

function draw() {

    background(220);
    image(bgImg, 960, 540, 1920, 1080);

    image(streets, 960, 540, 1920*0.94, 1080*0.94);
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

    cursor(anyHovered ? HAND : ARROW);

    noStroke;
    fill("black");
    rect(0, 965, 1920, 115);
}

const fs = require('fs');
const path = require('path');

let imgNames = "'";

const ASSETS_DIR = './assets/images';
const IMAGE_EXTENSIONS = /\.(png|jpg|jpeg|gif|webp|svg)$/i;

const headingMaps = {
    'icon-0-LVICON': ["effect", "BG", "houseFade", "label"],
    'icon-CHICON': ["arch", "below_blue"],
    'icon-SMICON': ["supermarket", "cuisine"],
    'icon-house2': ["houses", "above_map"],
    'icon-DSICON': [],  
    'icon-LIBICON': ["library"]
};

// const headingMaps = {
//     'icon-0-LVICON': [["effect", "BG", "houseFade", "label"], [], []],
//     'icon-CHICON': [["below_blue"], ["arch"]],
//     'icon-SMICON': [["supermarket", "cuisine"]],
//     'icon-house2': [["houses", "above_map"]],
//     'icon-DSICON': [[]],  
//     'icon-LIBICON': [["library"]]
// };

const iconNextLists = {
  'icon-0-LVICON': ["icon-CHICON", "icon-house2", "icon-DSICON", "icon-LIBICON"],
  'icon-CHICON': ["icon-SMICON"]
}

const coordinates = {
    'arch-roof-99': {x:-60, y:176.8, moveMode:2, zIndex:0, scale:1, flipX:false, angle:0}, 
    'arch-roof1': {x:1385, y:973.2, moveMode:1, zIndex:0, scale:1, flipX:false, angle:0},
    'arch-roof2': {x:351.8, y:934.8, moveMode:-2, zIndex:1, scale:1, flipX:false, angle:0},
    'arch-roof2-2': {x:1967.8, y:639.8, moveMode:1, zIndex:0, scale:1, flipX:false, angle:0},
    'arch-roof3': {x:1898.4, y:140.4, moveMode:2, zIndex:0, scale:1, flipX:false, angle:0},
    'arch-roof3-2': {x:1661.4, y:874.4, moveMode:2, zIndex:0, scale:1, flipX:false, angle:90},
    'arch-roof4': {x:578.4, y:1010.8, moveMode:1, zIndex:-1, scale:1, flipX:false, angle:0},
    'arch-roof4-2': {x:25.8, y:80.4, moveMode:2, zIndex:-1, scale:1, flipX:false, angle:90},
    'arch-roof5': {x:1661.6, y:25.8, moveMode:2, zIndex:-1, scale:1, flipX:false, angle:180},
    'arch-statue-blue': {x:184.6, y:783.6, moveMode:1, zIndex:2, scale:1, flipX:false, angle:0},
    'arch-statue-red': {x:1844.6, y:842, moveMode:2, zIndex:0, scale:1, flipX:false, angle:0},
    'BG-FAKEBG': {x:960, y:540, moveMode:-1, zIndex:-15, scale:1.25, flipX:false, angle:0},
    'chinatownplaza': {x:0, y:0, moveMode:-1, zIndex:0, scale:1, flipX:false, angle:0},
    'cuisine-choisum-blue-1': {x:117.6, y:796.4, moveMode:1, zIndex:1, scale:1, flipX:false, angle:-25},
    'cuisine-choisum-blue': {x:1787, y:120.4, moveMode:2, zIndex:1, scale:1, flipX:false, angle:0},
    'cuisine-choisum-orange-2': {x:1540, y:833.2, moveMode:2, zIndex:-1, scale:1, flipX:true, angle:0},
    'cuisine-choisum-orange': {x:1760.6, y:945.2, moveMode:1, zIndex:1, scale:1, flipX:false, angle:0},
    'cuisine-napa-blue-1': {x:677.6, y:136.4, moveMode:0, zIndex:0, scale:0.45, flipX:false, angle:190},
    'cuisine-napa-blue': {x:792.2, y:920.4, moveMode:2, zIndex:3, scale:1, flipX:false, angle:0},
    'cuisine-napa-green-2': {x:1842.6, y:500.4, moveMode:1, zIndex:0, scale:1, flipX:true, angle:0},
    'cuisine-napa-green-3': {x:1696.8, y:212.4, moveMode:1, zIndex:-1, scale:0.65, flipX:true, angle:70},
    'cuisine-napa-green': {x:54.6, y:660, moveMode:0, zIndex:1, scale:1, flipX:false, angle:0},
    'cuisine-shaoxing-2': {x:368.8, y:767.2, moveMode:1, zIndex:-1, scale:0.7, flipX:false, angle:10},
    'cuisine-shaoxing-3': {x:396.8, y:51.6, moveMode:2, zIndex:0, scale:0.55, flipX:false, angle:-15},
    'cuisine-shaoxing': {x:1633, y:681.6, moveMode:0, zIndex:1, scale:1, flipX:false, angle:0},
    'cuisine-soysauce-dark-1': {x:93.6, y:737.2, moveMode:2, zIndex:1, scale:0.45, flipX:false, angle:82},
    'cuisine-soysauce-dark': {x:1671, y:54, moveMode:1, zIndex:0, scale:1, flipX:false, angle:0},
    'cuisine-soysauce-light-2': {x:1777.6, y:720.8, moveMode:2, zIndex:0, scale:0.65, flipX:false, angle:10},
    'cuisine-soysauce-light': {x:258.6, y:788.4, moveMode:3, zIndex:4, scale:1, flipX:false, angle:0},
    'cuisine-tangerine-up': {x:665.4, y:21.6, moveMode:2, zIndex:1, scale:1, flipX:false, angle:0},
    'cuisine-tangerine-down': {x:521.4, y:883.2, moveMode:2, zIndex:3, scale:1, flipX:false, angle:0},
    'strip-icon': {x:0, y:0, moveMode:-1, zIndex:0, scale:1, flipX:false, angle:0},
    'strip-poker': {x:0, y:0, moveMode:-1, zIndex:0, scale:1, flipX:false, angle:0},
    'strip-poker2': {x:0, y:0, moveMode:-1, zIndex:0, scale:1, flipX:false, angle:0},
    'stripRes-dice-blue': {x:660, y:231.6, moveMode:1, zIndex:-2, scale:1, flipX:false, angle:0},
    'stripRes-dice-green': {x:1314.4, y:185.2, moveMode:1, zIndex:-1, scale:1, flipX:false, angle:0},
    'stripRes-dice-red': {x:1588, y:129.2, moveMode:1, zIndex:-2, scale:1, flipX:false, angle:0},
    'stripRes-dice-red2': {x:482.4, y:772.4, moveMode:1, zIndex:-2, scale:1, flipX:false, angle:0},
    'stripRes-dice': {x:1628, y:858.8, moveMode:1, zIndex:5, scale:1, flipX:false, angle:0},
    'stripRes-hand': {x:981.6, y:196.8, moveMode:-1, zIndex:-2, scale:1, flipX:false, angle:0},
    'stripRes-sign-blue': {x:1412, y:414, moveMode:2, zIndex:-2, scale:1, flipX:false, angle:0},
    'stripRes-sign-green2': {x:575.2, y:346.8, moveMode:1, zIndex:-3, scale:1, flipX:false, angle:0},
    'stripRes-sign-green': {x:908, y:786.8, moveMode:2, zIndex:-2, scale:1, flipX:false, angle:0},
    'stripRes-striplabel': {x:0, y:0, moveMode:-1, zIndex:-2, scale:1, flipX:false, angle:0},
    'above_blue-glass': {x:1325.6, y:196.4, moveMode:-1, zIndex:7, scale:1, flipX:false, angle:0}, 
    'above_map-poker-chips1': {x:1786, y:834, moveMode:-1, zIndex:4, scale:1.25, flipX:false, angle:0},
    'above_map-poker-chips2': {x:142, y:0, moveMode:-1, zIndex:4, scale:1, flipX:false, angle:90},
    'above_map-sign-big': {x:645, y:792, moveMode:-1, zIndex:-3, scale:1.25, flipX:false, angle:0},
    'above_map-static': {x:960, y:540, moveMode:-1, zIndex:4, scale:1.25, flipX:false, angle:0},
    'below_blue-static': {x:960, y:540, moveMode:-1, zIndex:-10, scale:1.15, flipX:false, angle:0},
    'strip4-hand': {x:0, y:0, moveMode:-1, zIndex:0, scale:1, flipX:false, angle:0},
    'stripRes-poker-chips2-2': {x:1869.6,y:334, moveMode:-1, zIndex:10, scale:1.25, flipX:false, angle:0},
    'stripRes-poker-chips1': {x:1645, y:15, moveMode:-1, zIndex:7, scale:1, flipX:false, angle:180},
    'stripRes-poker-chips1-2': {x:733.6, y:919.6, moveMode:-1, zIndex:10, scale:1, flipX:false, angle:0},
    'stripRes-poker-chips2': {x:21.6, y:318, moveMode:-1, zIndex:-3, scale:1.25, flipX:false, angle:180},
    'above_blue-elvis1': {x:177, y:780, moveMode:-1, zIndex:7, scale:1.25, flipX:false, angle:0},
    'above_blue-elvis2': {x:1816.8, y:434, moveMode:-1, zIndex:7, scale:1.25, flipX:false, angle:0},
    'above_blue-elvis3': {x:1389, y:47, moveMode:-1, zIndex:7, scale:1.25, flipX:false, angle:0},
    'above_blue-poker1': {x:1567, y:260, moveMode:2, zIndex:-2, scale:1, flipX:false, angle:0},
    'above_blue-poker2': {x:1700, y:764, moveMode:2, zIndex:-7, scale:0.75, flipX:false, angle:0},
    'effect-FAKEBG': {x:960, y:540, moveMode:-1, zIndex:-1, scale:1.25, flipX:false, angle:0},
    'icon-0-LVICON': {x:1427, y:583, moveMode:-1, zIndex:3, scale:1, flipX:false, angle:0},
    'icon-CHICON': {x:1170, y:510, moveMode:-1, zIndex:2, scale:0.9, flipX:false, angle:0},
    'icon-SMICON': {x:1128, y:352, moveMode:-1, zIndex:-1, scale:0.9, flipX:false, angle:0},
    'alt-LIBICON': {x:0, y:0, moveMode:-1, zIndex:0, scale:1, flipX:false, angle:0}, 
    'icon-DSICON': {x:960, y:105, moveMode:-1, zIndex:0, scale:1, flipX:false, angle:0},  
    'icon-LIBICON': {x:1560, y:236, moveMode:-1, zIndex:0, scale:0.9, flipX:false, angle:0}, 
    'houseFade-house1': {x:1152, y:689, moveMode:-1, zIndex:1, scale:0.3, flipX:false, angle:0},
    'icon-house2': {x:1386, y:355, moveMode:-1, zIndex:2, scale:0.3, flipX:false, angle:0},
    'houseFade-house3': {x:1396, y:838, moveMode:-1, zIndex:4, scale:0.3, flipX:false, angle:0},
    'houseFade-house4': {x:1530, y:390, moveMode:-1, zIndex:1, scale:0.3, flipX:false, angle:0},
    'lvsign': {x:0, y:0, moveMode:-1, zIndex:0, scale:1, flipX:false, angle:0}, 
    'poker-chips-3': {x:0, y:0, moveMode:-1, zIndex:0, scale:1, flipX:false, angle:0}, 
    'streets-real': {x:0, y:0, moveMode:-1, zIndex:0, scale:1, flipX:false, angle:0}, 
    'supermarket-label-168': {x:960, y:540, moveMode:-1, zIndex:0, scale:1, flipX:false, angle:0},
    'supermarket-3label-nsf': {x:960, y:540, moveMode:-1, zIndex:0, scale:1, flipX:false, angle:0},
    'supermarket-1label-osf': {x:960, y:540, moveMode:-1, zIndex:0, scale:1, flipX:false, angle:0},
    'supermarket-0SF1': {x:826, y:538, moveMode:-1, zIndex:0, scale:0.6, flipX:false, angle:0},
    'supermarket-2SF2': {x:812, y:425, moveMode:-1, zIndex:0, scale:0.5, flipX:false, angle:0},
    'supermarket-4z168': {x:484, y:371, moveMode:-1, zIndex:0, scale:0.8, flipX:false, angle:0},
    'houses-2label-streets': {x:960, y:540, moveMode:-1, zIndex:0, scale:1, flipX:false, angle:0},
    'houses-2label-summerlin': {x:960, y:540, moveMode:-1, zIndex:0, scale:1, flipX:false, angle:0},
    'houses-2label-sv': {x:960, y:540, moveMode:-1, zIndex:0, scale:1, flipX:false, angle:0},
    'houses-1rect-1': {x:960, y:540, moveMode:-1, zIndex:0, scale:1, flipX:false, angle:0},
    'houses-1rect-2': {x:960, y:540, moveMode:-1, zIndex:0, scale:1, flipX:false, angle:0},
    'houses-1rect-3': {x:960, y:540, moveMode:-1, zIndex:0, scale:1, flipX:false, angle:0},
    'houses-1rect-4': {x:960, y:540, moveMode:-1, zIndex:0, scale:1, flipX:false, angle:0},
    'houses-1rect-5': {x:960, y:540, moveMode:-1, zIndex:0, scale:1, flipX:false, angle:0},
    'houseFade-rect-0': {x:960, y:540, moveMode:-1, zIndex:0, scale:1, flipX:false, angle:0},
    'library-1label-svlib': {x:960, y:540, moveMode:-1, zIndex:0, scale:1, flipX:false, angle:0},
    'library-label-swlib': {x:960, y:540, moveMode:-1, zIndex:0, scale:1, flipX:false, angle:0},
    'library-0sv': {x:824.8, y:714, moveMode:-1, zIndex:0, scale:0.3, flipX:false, angle:0},
    'library-2sw': {x:204, y:284, moveMode:-1, zIndex:0, scale:0.3, flipX:false, angle:0},
    'supermarket-0label-99r': {x:960, y:540, moveMode:-1, zIndex:10, scale:1, flipX:false, angle:0},
    'label-ct': {x:960, y:540, moveMode:-1, zIndex:10, scale:1, flipX:false, angle:0},
    'label-lvlib': {x:960, y:540, moveMode:-1, zIndex:10, scale:1, flipX:false, angle:0},
    'label-rrocks': {x:960, y:540, moveMode:-1, zIndex:10, scale:1, flipX:false, angle:0},
    'label-strip': {x:960, y:540, moveMode:-1, zIndex:10, scale:1, flipX:false, angle:0},

};

const files = fs.readdirSync(ASSETS_DIR)
  .filter(f => IMAGE_EXTENSIONS.test(f))
  .map(f => {
    const nameNoExt = path.parse(f).name;  
    let name = nameNoExt;       // "heading-name"
    const [heading, ...rest] = nameNoExt.split('-');
    const label = rest.join('-');
    const coords = coordinates[nameNoExt] ?? { x: 0, y: 0 };      
    const headingMap = headingMaps[nameNoExt] ?? null;
    const nextList = iconNextLists[nameNoExt] ?? null;
    imgNames += name;
    imgNames += "': {x:0, y:0, moveMode:-1, zIndex:0, scale:1, flipX:false, angle:0}, \n \t '";
    //for "heading-some-long-name"
    return {
      name: f,
      nameNoExt,
      heading,
      label,
      path: `assets/images/${f}`,
      x: coords.x,
      y: coords.y,
      scale:coords.scale,
      zIndex: coords.zIndex,
      flipX: coords.flipX, 
      angle: coords.angle,
      moveMode: coords.moveMode,
      headingList: headingMap,
      iconNextList: nextList
    };
  });

fs.writeFileSync(
  path.join(ASSETS_DIR, 'imgPaths.json'),
  JSON.stringify(files, null, 2)
);
console.log(imgNames);
console.log(`Generated image paths with ${files.length} images.`);
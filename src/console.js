import { loopAsync, randInt, pick, clamp, rand, lerp, wait } from './utils.js';
import { loadFonts, fontsArray, fontsSizeArray } from './fonts.js';
import { colorArray, rgbToHexColor, correctColors } from './colors.js';
import splash from './splash.js';
import launcher from './launcher.js';
import zzfx from './libs/ZzFXMicro.esm.min.js';

const MAX_SPRITES = 64;
const MAX_BACKGROUNDS = 4;
const SCREEN_WIDTH = 256;
const SCREEN_HEIGHT = 224;
const IMAGE_WIDTH = 256, IMAGE_HEIGHT = 256;
const BUTTON_A = 4, BUTTON_B = 5,
	BUTTON_UP = 2, BUTTON_RIGHT = 1, BUTTON_DOWN = 3, BUTTON_LEFT = 0,
	BUTTON_START = 6, BUTTON_SELECT = 7;
const BUTTON_NAME = [
	'left',
	'right',
	'up',
	'down',
	'a',
	'b',
	'start',
	'select',
];
const DEFAULT_KEYMAP = {
	'w': BUTTON_UP,
	'a': BUTTON_LEFT,
	's': BUTTON_DOWN,
	'd': BUTTON_RIGHT,
	'e': BUTTON_A,
	'q': BUTTON_B,
	// ' ': BUTTON_START,
	'Tab': BUTTON_SELECT,
	'z': BUTTON_B,
	'x': BUTTON_A,
	'f': BUTTON_SELECT,
	'r': BUTTON_START,
	'ArrowUp': BUTTON_UP,
	'ArrowLeft': BUTTON_LEFT,
	'ArrowDown': BUTTON_DOWN,
	'ArrowRight': BUTTON_RIGHT,
	'[': BUTTON_SELECT,
	']': BUTTON_START,
	'h': BUTTON_SELECT,
	'j': BUTTON_START,
	'\'': BUTTON_A,
	';': BUTTON_B,
	'm': BUTTON_A,
	'n': BUTTON_B,
	'v': BUTTON_A,
	'c': BUTTON_B,
};
const KEY_DOWN = 1, KEY_UP = 0;
const NOT_DOWN = 0;
const DOWN_FIRST = 1;
const DOWN_REPEAT = 2;
const COLORS = colorArray;
const NOOP = () => {};
const NIL = null, nil = null; // For pico-8 compatibility
const BG_NO_REPEAT = 0, BG_REPEAT = 1, BG_REPEAT_X = 2, BG_REPEAT_Y = 3;
const pxOffset = 0;

const { round, sin, cos, atan2, min, max, ceil, floor, abs, sqrt, sign } = Math;

function getColor(colorParam) {
	let colorIndex = 0;
	if (colorParam) {
		if (typeof colorParam === 'number') colorIndex = colorParam;
		else if (typeof colorParam === 'string') {
			if (colorParam.substring(0, 1) === '#') return colorParam;
			colorIndex = parseInt(colorParam, 16);
		}
	}
	return colorArray[colorIndex] || colorArray[0];
}

function getScopedFn(scope, script, scriptHeader = '') {
	if (typeof script === 'function') return script.bind(scope);
	if (typeof script !== 'string') throw new Error('Invalid script');
	Function(`"use strict"; ${scriptHeader} ${script}`).bind(scope);
}

function loadImageSrc(src) {
	return new Promise((resolve) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.src = src;
	});
}

async function loadCartImages(arr = []) {
	const loadPromises = arr.map((imgStr) => {
		if (typeof imgStr !== 'string') throw new Error('Non string images not supported yet');
		if (imgStr.substring(0, 5) !== 'data:') throw new Error('Non data uri not yet supported');
		return loadImageSrc(imgStr);
	});
	const loadSettledPromises = await Promise.allSettled(loadPromises);
	const images = loadSettledPromises.map((a) => a.value);
	return images;
}

async function splitSheetIntoSprites(sheetImg) {
	// TODO: allow different sized spritesheets
	const sheetSize = { x: SCREEN_WIDTH, y: SCREEN_HEIGHT };
	const spriteSize = { x: 16, y: 16 };
	const spritesPerWidth = floor(sheetSize.x / spriteSize.x);
	const spritesPerHeight = floor(sheetSize.y / spriteSize.y);
	const canvas = document.createElement('canvas');
	canvas.setAttribute('id', 'tempSpriteLoader');
	canvas.width = spriteSize.x;
	canvas.height = spriteSize.y;
	const ctx = canvas.getContext('2d');
	// ctx.drawImage(sheetImg, 0, 0);
	const spriteImageUrls = [];
	for (let y = 0; y < spritesPerHeight; y += 1) {
		for (let x = 0; x < spritesPerWidth; x += 1) {
			// Get a clip of the sprite image and write it to the temp sprite canvas
			// https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
			const sx = x * spriteSize.x;
			const sy = y * spriteSize.y;
			ctx.drawImage(sheetImg, sx, sy, spriteSize.x, spriteSize.y, 0, 0, spriteSize.x, spriteSize.y);
			correctColors(ctx, 0, 0, canvas.width, canvas.height);
			spriteImageUrls.push(canvas.toDataURL());
			ctx.clearRect(0, 0, canvas.width, canvas.height);
		}
	}
	const spriteLoadPromises = spriteImageUrls.map((url) => loadImageSrc(url));
	const spriteLoadResults = await Promise.allSettled(spriteLoadPromises);
	return spriteLoadResults.map((p) => p.value);
}

function err(e) {
	console.error(e);
}

function anyBtn() {
	const buttonDownKeys = Object.keys(core.buttonDown);
	for (let i = 0; i < buttonDownKeys.length; i++) {
		if (core.buttonDown[buttonDownKeys[i]]) return true;
	}
	return false;
}


/** Clears the screen */
function cls(color = 0) {
	const { ctx } = core;
	ctx.fillStyle = getColor(color);
	ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
}

function spr(n, x = 0, y = 0, w = 16, h = 16, flipX = false, flipY = false) {
	if (n === undefined) throw new Error('Please provide a sprite index number as 1st param');
	if (core.spriteCount >= MAX_SPRITES) return 0;
	const sprite = core.runningProgram.sprites[n];
	core.ctx.drawImage(sprite, x, y);
	core.spriteCount += 1;
	return MAX_SPRITES - core.spriteCount;
}

function print(text, x = 0, y = 0, color = 15, font = 0) {
	const { ctx } = core;
	ctx.font = fontsArray[font] || font || fontsArray[0];
	ctx.fillStyle = getColor(color) || color;
	const offsetY = fontsSizeArray[font] || fontsSizeArray[0];
	ctx.fillText(text, x + pxOffset, y + pxOffset + offsetY);
	ctx.textBaseline = 'alphabetic';
}

function map(celX, celY, screenX, screenY, celW, celH, layer) {
	// TODO
}

function rect(x0, y0, x1, y1, color = 15) {
	const { ctx } = core;
	ctx.strokeStyle = (typeof color === 'number') ? getColor(color) : color;
	ctx.lineWidth = 1;
	ctx.lineJoin = 'round';
	ctx.strokeRect(round(x0), round(y0), round(x1 - x0), round(y1 - y0));
}

function rectfill(x0, y0, x1, y1, color = 15) {
	const { ctx } = core;
	ctx.fillStyle = (typeof color === 'number') ? getColor(color) : color;
	ctx.fillRect(round(x0), round(y0), round(x1 - x0), round(y1 - y0));
}


// ---------- Controls

function btn(button = undefined, player = 0) {
	if (button === undefined) return anyBtn();
	let buttonIndex = (typeof button === 'number') ? button : -1;
	if (typeof button === 'string') buttonIndex = BUTTON_NAME.indexOf(button);
	if (buttonIndex === -1) {
		err(`Invalid button ${button}`);
		return false;
	}
	return core.buttonDown[buttonIndex];
}

/** checks if a button has been pressed but not during the previous frame */
function btnp(button = undefined, player = 0) {
	return (btn(button) === 1);
}

// ---------- Math



const API = {
	cls,
	
	print,

	// ---------- Tables
	// ???
	// ---------- Loops
	// ???

	// ---------- Shrink Code
	// foreach
	// ???

	// ---------- Cartridge Data
	// ???

	// ---------- Memory Manipulation
	// ???

	// ---------- CoRoutines
	// ???

	// ---------- Sprites
	spr,
	/** Unlike spr(), this function uses pixel locations on the sprite sheet instead of sprite numbers */
	// sspr
	/** Get color value of pixel on the sprite sheet */
	sget(x, y) {
		// TODO
	},
	/** Sets color value of pixel on the sprite sheet */
	sset(x, y, c) {
		// TODO
	},
	/** New (non-pico-8) - Set the background with an image - WIP */
	bg(n = 0, x = 0, y = 0, repeat = BG_NO_REPEAT, w, h, flipX = false, flipY = false) {
		if (n === undefined) throw new Error('Please provide a bg index number as 1st param');
		if (core.backgroundCount >= MAX_BACKGROUNDS) return 0;
		const { runningProgram, ctx } = core;
		const bg = runningProgram.backgrounds[n];
		if (x < 0) x = IMAGE_WIDTH + (x % IMAGE_WIDTH);
		if (y < 0) y = IMAGE_HEIGHT + (y % IMAGE_HEIGHT);
		x = x % SCREEN_WIDTH;
		y = y % IMAGE_HEIGHT;
		ctx.drawImage(bg, x, y);
		if ((repeat === BG_REPEAT || repeat === BG_REPEAT_X) && x !== 0) {
			ctx.drawImage(bg, x - IMAGE_WIDTH, y);
		}
		if ((repeat === BG_REPEAT || repeat === BG_REPEAT_Y) && y !== 0) {
			ctx.drawImage(bg, x, y - IMAGE_HEIGHT);
		}
		if (repeat === BG_REPEAT && y !== 0 && x !== 0) {
			ctx.drawImage(bg, x - IMAGE_WIDTH, y - IMAGE_HEIGHT);
		}
		return MAX_BACKGROUNDS - core.backgroundCount;
	},

	// ---------- Colors
	pal(c0, c1, p) {
		// ???
	},
	palt(col, t) {
		// ???
	},

	// ---------- Pixels
	pget(x, y) {
		// TODO
	},
	pset(x, y, col) {
		rectfill(x, y, x + 1, y + 1, col);
	},

	// ---------- Sprite Flag
	fget(n, f) {

	},
	fset(n, f, v) {

	},

	// ---------- Shapes
	rect,
	rectfill,
	circ(x, y, r, col) {

	},
	circfill(x, y, r, col) {

	},
	line(x0, y0, x1, y1, col) {

	},

	// ---------- Screen
	camera(x, y) {
		// TODO
	},
	clip(x, y, w, h) {
		// TODO
	},
	color(col) {
		// TODO
	},
	// ---------- Map
	map,
	mget(x, y) {
		// TODO
	},
	mset(x, y, v) {
		// TODO
	},
	
	// ---------- Controls
	btn,
	btnp,

	// ---------- String Manipulation and Types
	sub(str, from, to) { return str.substring(from, to); },
	type(x) { return typeof x; },
	tostr(x) { return String(x); },
	tonum(x) { return Number(x); },

	// ---------- Sound
	sfx(n, channel, offset, length) {
		const soundArr = core.runningProgram.sounds[n];
		// play a default sound if
		if (!soundArr || !(soundArr instanceof Array)) {
			console.log('Sound', n, 'not found. Playing default sound instead');
			zzfx(...[,,,.08,,0,2,2.92,4.8,,,,,.1,,.1,,.76]);
			return;
		}
		zzfx(...soundArr);
		// TODO: Handle channel, offset, length
	},
	music(n, fade, mask) {
		// TODO
	},

	// ---------- Math
	// Math (native in the Math object)
	abs,
	sin,
	atan2,
	cos,
	round,
	min,
	max,
	floor,
	flr: floor, // alias to match pico-8
	sqrt,
	ceil,
	sign,
	sgn: sign, // alias to match pico-8
	// Math extra (not in the js Math object)
	band(a, b) { return a & b; },
	bnot(num) { return ~num; },
	bor(a, b) { return a | b; },
	bxor(a, b) { return a ^ b; },
	shl(num, bits) { return num << bits; },
	shr(num, bits) { return num >> bits; },
	mid(a, b, c) {
		[a, b, c] = [a, b, c].sort((x, y) => x - y);
		return b;
	},
	rnd(n) { return rand(n, 0); },
	srand() {
		// TODO - seeded random
	},
	

	// ---------- Constants
	COLORS,
	NIL, // aka. null
	SCREEN_WIDTH,
	SCREEN_HEIGHT,

	// ---------- New methods
	clamp,
	lerp,
	rand,
	randInt,
	pick,
	/** Returns first parm modulo the second param, but adjusted so negative numbers work as expected */
	mod(dividend, divisor = 1) {
		return ((dividend % divisor) + divisor) % divisor;
	},
	log(...args) {
		if (core.logCount < 100) console.log(...args);
		core.logCount += 1;
	},
	aabb([x1, y1, w1, h1], [x2, y2, w2, h2]) {
		return (x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2);
	}
};

const core = {
	ctx: null, // main canvas / screen context
	spriteCount: 0,
	backgroundCount: 0,
	logCount: 0, // TODO: need a way to reset this
	keyDown: {},
	buttonDown: {},
	domButtons: {},
	keyMap: { ...DEFAULT_KEYMAP },
	mouseDownButton: null,
	drawId: null,
	updateId: null,
	loadedCart: null,
	runningProgram:  null,
	updateTime: 1000 / 60, // Every 16.67 ms = 60 updates per second
	defaultLaunchCartName: null,
	installedCarts: {},
	installCart(cart, options = {}) {
		if (!cart) throw new Error('Missing cart param');
		const name = cart.name || options.name || `Cart-${round(Math.random() * 9999)}`;
		this.installedCarts[name] = { ...cart, loadOptions: { ...options } };
		return this;
	},
	async unloadProgram() {
		cls();
		this.stop();
		this.loadedCart = null;
		this.runningProgram = null;
		// Wait should not be needed to allow the last draw and updates to run, but a slight delay
		// feels nice
		await wait(50);
	},
	async loadProgramByName(name) {
		await this.unloadProgram();
		cls();
		console.log('Loading cart', name);
		const cart = this.installedCarts[name];
		if (!cart || !cart.program) {
			this.loadedCart = null;
			throw new Error(`Error loading cart ${name}`);
		}
		return this.loadProgram(cart, cart.loadOptions || {});
	},
	/** Will mutate the the running program to fill in the sprites array */
	async loadProgramSprites(runningProgram, cart) {
		const sheets = cart.spritesheets || cart.sheets;
		if (!sheets) return;
		const { sprites } = runningProgram;
		const sheetImages = await loadCartImages(sheets);
		const splitPromises = sheetImages.map((img) => splitSheetIntoSprites(img));
		const splitPromiseResults = await Promise.allSettled(splitPromises);
		splitPromiseResults.forEach((r) => {
			const spriteArr = r.value;
			if (!spriteArr) {
				console.warn(r.status, r.reason);
				return;
			}
			spriteArr.forEach((s) => sprites.push(s));
		});
		return sprites;
	},
	/** Will mutate the the running program to fill in the backgrounds array */
	async loadProgramBackgrounds(runningProgram, cart) {
		const bgs = cart.backgrounds || cart.bgs || cart.bg;
		if (!bgs) return;
		const { backgrounds } = runningProgram;
		const sheetImages = await loadCartImages(bgs);
		sheetImages.forEach((img) => backgrounds.push(img));
		return backgrounds;
	},
	async loadProgramSounds(runningProgram, cart) {
		(cart.sounds || [])
			.filter((s) => (s && s instanceof Array))
			.forEach((s) => runningProgram.sounds.push(s));
	},
	async loadProgramMusic(runningProgram, cart) {
		(cart.music || [])
			.filter((s) => (s && s instanceof Array))
			.forEach((s) => runningProgram.music.push(s));
	},
	async loadProgram(cart, options = {}) {
		await this.unloadProgram();
		cls();
		if (!cart) throw new Error('Unknown cart');
		this.loadedCart = cart;
		const api = { ...API };
		if (options.includeLaunch) api.launch = (name) => this.loadProgramByName(name || this.defaultLaunchCartName);

		const { ctx } = this;
		const nextUpdateCore = () => this.nextUpdate();
		const nextDrawCore = () => this.nextDraw();
		const coreUpdateButtons = () => this.updateButtons();

		const scriptHeader = 'const $ = this; console.log(api);';
		const scope = (options.scope) ? { ...options.scope } : {};
		const p = this.runningProgram = {
			scope,
			sprites: [],
			backgrounds: [],
			sounds: [],
			music: [],
			_init: getScopedFn(scope, cart.program.init, scriptHeader),
			_draw: getScopedFn(scope, cart.program.draw, scriptHeader),
			_update: getScopedFn(scope, cart.program.update, scriptHeader),
			init() {
				const returnedObj = this._init(api, this.scope);
				if (returnedObj) {
					Object.keys(returnedObj).forEach((key) => this.scope[key] = returnedObj[key]);
				}
				console.log('Init returned', returnedObj);
				correctColors(ctx, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
			},
			draw() {
				core.backgroundCount = 0;
				core.spriteCount = 0;
				this._draw(api, this.scope);
				correctColors(ctx, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
				nextDrawCore();
			},
			update() {
				this._update(api, this.scope);
				coreUpdateButtons();
				// We could do a correctColors here in case the program draws in the update fn
				// but this is not recommended, and will be quickly overwritten by the draw method
				nextUpdateCore();
			},
		};
		await this.loadProgramSprites(p, cart);
		await this.loadProgramBackgrounds(p, cart);
		await this.loadProgramSounds(p, cart);
		await this.loadProgramMusic(p, cart);
		p.init();
		this.start();
	},
	setupButtons() {
		const buttons = document.getElementsByClassName('cc-button');
		Array.from(buttons).forEach((elt) => {
			if (!elt.dataset.buttonname) return;
			const i = BUTTON_NAME.indexOf(elt.dataset.buttonname);
			if (i === -1) return;
			if (!this.domButtons[i]) this.domButtons[i] = [];
			this.domButtons[i].push(elt);
			const handleHit = (e) => {
				this.pushButton(i);
				this.mouseDownButton = i;
			};
			elt.ontouchstart = handleHit;
			elt.onmousedown = handleHit;
		});
	},
	updateButtons() {
		Object.keys(this.buttonDown).forEach((buttonId) => {
			if (this.buttonDown[buttonId] === DOWN_FIRST) this.buttonDown[buttonId] = 2;
			// TODO? - should we update the --active class here too?
		});
	},
	pushButton(buttonId, player = 0) {
		if (buttonId === undefined) return;
		if (!this.buttonDown[buttonId]) this.buttonDown[buttonId] = DOWN_FIRST;
		else if (this.buttonDown[buttonId] >= 2) this.buttonDown[buttonId] += 1;
		// Note that if the value is 1 then we do nothing to the value (this is only incremented by the update function)
		if (this.domButtons[buttonId]) {
			this.domButtons[buttonId].forEach((elt) => elt.classList.add('cc-button--active'));
		}
	},
	liftButton(button) {
		if (button === undefined) return;
		this.buttonDown[button] = NOT_DOWN;
		if (this.domButtons[button]) {
			this.domButtons[button].forEach((elt) => elt.classList.remove('cc-button--active'));
		}
	},
	setupKeyboard() {
		const fkey = (e) => (e.key.length === 1) ? e.key.toLowerCase() : e.key;
		window.onkeydown = (e) => {
			// treat all single keys as lowercase
			const key = fkey(e);
			this.keyDown[key] = KEY_DOWN;
			this.pushButton(this.keyMap[key]);
			if (this.keyMap[key] === undefined) console.log('Unmapped key:', key);
			e.preventDefault();
			// if (!e.repeat) console.log(this.buttonDown, this.keyDown);
		};
		window.onkeyup = (e) => {
			const key = fkey(e);
			this.keyDown[key] = KEY_UP;
			this.liftButton(this.keyMap[key])
		};
		const handleHitDone = (e) => {
			this.liftButton(this.mouseDownButton);
			this.mouseDownButton = null;
		};
		window.onmouseup = handleHitDone;
		window.ontouchend = handleHitDone;
		window.ontouchcancel = handleHitDone;
	},
	setupCanvas() {
		const canvas = document.getElementsByClassName('console-monitor-canvas')[0];
		const ctx = canvas.getContext('2d', { willReadFrequently: true });
		ctx.imageSmoothingEnabled = false;
		ctx.translate(pxOffset, pxOffset);
		this.ctx = ctx;
	},
	async setup() {
		await loadFonts();
		this.setupKeyboard();
		this.setupButtons();
		this.setupCanvas();
	},
	start() {
		this.runningProgram.update();
		// this.nextUpdate();
		this.nextDraw();
	},
	isProgramRunning() {
		return Boolean(this.runningProgram);
	},
	nextUpdate() {
		if (!this.isProgramRunning()) return;
		this.updateId = window.setTimeout(() => {
			if (this.isProgramRunning()) this.runningProgram.update();
		}, this.updateTime);
	},
	nextDraw() {
		if (!this.isProgramRunning()) return;
		this.drawId = window.requestAnimationFrame(
			(timeStamp) => {
				if (this.isProgramRunning()) this.runningProgram.draw(timeStamp);
			}
		);
	},
	stopDraw() {
		window.cancelAnimationFrame(this.drawId);
	},
	stopUpdate() {
		window.clearTimeout(this.updateId);
	},
	stop() {
		this.stopUpdate();
		this.stopDraw();
	},
};

function test(ctx) {
	loopAsync(1000, async (i) => {
		const c = pick(colorArray);
		const x = randInt(0, SCREEN_WIDTH);
		const y = randInt(0, SCREEN_HEIGHT);
		const size = randInt(1, ceil(i / 200));
		ctx.fillStyle = c;
		ctx.fillRect(x, y, size, size);
		// await wait(1);
	});
}

/** The exposed functionality for the console */
const owls = {
	installCart(cart) {
		core.installCart(cart);
		core.defaultLaunchCartName = cart.name;
	},
	ready(fn) {
		addEventListener('DOMContentLoaded', async () => {
			await core.setup();
			const privilegedOptions = { includeLaunch: true };
			core.installCart(splash, privilegedOptions)
				.installCart(launcher, privilegedOptions);
			await fn();
			await core.loadProgram(splash, { includeLaunch: true });
		});
	}
};

// Debugging
window.core = core;
window.owls = owls;

export { owls };

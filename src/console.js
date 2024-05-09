import { loopAsync, randInt, pick, clamp, rand, lerp, wait } from './utils.js';
import { loadFonts, fontsArray, fontsSizeArray } from './fonts.js';
import { colorArray, rgbToHexColor, correctColors } from './colors.js';
import splash from './splash.js';
import launcher from './launcher.js';

const SCREEN_WIDTH = 256;
const SCREEN_HEIGHT = 224;
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
const NOT_DOWN = 0;
const DOWN_FIRST = 1;
const DOWN_REPEAT = 2;
const COLORS = colorArray;
const NOOP = () => {};
const NIL = null, nil = null; // For pico-8 compatibility
const pxOffset = 0;

const { round, sin, cos, min, max } = Math;

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

function loadImageSrc(src) {
	return new Promise((resolve) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.src = src;
	});
}

async function splitSheetIntoSprites(sheetImg) {
	const sprites = [];
	// TODO: allow different sized spritesheets
	const sheetSize = { x: SCREEN_WIDTH, y: SCREEN_HEIGHT };
	const spriteSize = { x: 16, y: 16 };
	const spritesPerWidth = Math.floor(sheetSize.x / spriteSize.x);
	const spritesPerHeight = Math.floor(sheetSize.y / spriteSize.y);
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
			spriteImageUrls.push(canvas.toDataURL());
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
	// const count = Object.keys(core.buttonDown).reduce(
	// 	(sum, key) => sum + (core.buttonDown[key] ? 1 : 0),
	// 	0,
	// );
	// return (count > 0);
}

function btn(button = undefined) {
	if (button === undefined) return anyBtn();
	let buttonIndex = (typeof button === 'number') ? button : -1;
	if (typeof button === 'string') buttonIndex = BUTTON_NAME.indexOf(button);
	if (buttonIndex === -1) {
		err(`Invalid button ${button}`);
		return false;
	}
	return core.buttonDown[buttonIndex];
}

function cls(color = 0) {
	const { ctx } = core;
	ctx.fillStyle = getColor(color);
	ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
}

function spr(n, x = 0, y = 0, w = 16, h = 16, flipX = false, flipY = false) {
	if (n === undefined) throw new Error('Please provide a sprite index number as 1st param');
	const sprite = core.runningProgram.sprites[n];
	core.ctx.drawImage(sprite, x, y);
}

function print(text, x = 0, y = 0, color = 15, font = 0) {
	const { ctx } = core;
	ctx.font = fontsArray[font] || font || fontsArray[0];
	ctx.fillStyle = getColor(color) || color;
	const offsetY = fontsSizeArray[font] || fontsSizeArray[0];
	ctx.fillText(text, x + pxOffset, y + pxOffset + offsetY);
	ctx.textBaseline = 'alphabetic';
}

function rect(x0, y0, x1, y1, color = 15) {
	const { ctx } = core;
	// ctx.rect(x0, y0, x1 - x0, y1 - y0);
	ctx.fillStyle = (typeof color === 'number') ? getColor(color) : color;
	// ctx.fill();
	ctx.fillRect(round(x0), round(y0), round(x1 - x0), round(y1 - y0));
}

function map(celX, celY, screenX, screenY, celW, celH, layer) {
	// TODO
}

const API = {
	btn,
	cls,
	spr,
	print,
	rect,
	map,
	// Math
	sin,
	cos,
	round,
	min,
	max,
	// Constants
	COLORS,
	// New
	clamp,
	lerp,
	rand,
	randInt,
};


const testCart = {
	sheets: [
		['0000000000000000000000000000000000000000000000000000000']
	],
	program: {
		init: "function z() { }; const y = () => {}; return { z };",
		draw: "cls(); rect(0, 0, 50, 50);",
		update: "",
	},
};

const core = {
	ctx: null, // main canvas / screen context
	keyDown: {},
	buttonDown: {},
	domButtons: {},
	keyMap: {
		'w': BUTTON_UP,
		'a': BUTTON_LEFT,
		's': BUTTON_DOWN,
		'd': BUTTON_RIGHT,
		'e': BUTTON_A,
		'q': BUTTON_B,
		' ': BUTTON_START,
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
	},
	mouseDownButton: null,
	drawId: null,
	updateId: null,
	loadedCart: null,
	runningProgram: null,
	updateTime: 1000 / 60,
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
		const sheetPromises = sheets.map((sheet) => {
			if (typeof sheet !== 'string') throw new Error('Non string sheets not supported yet');
			if (sheet.substring(0, 5) !== 'data:') throw new Error('Non data uri not yet supported');
			return loadImageSrc(sheet);
		});
		const sheetSettledPromises = await Promise.allSettled(sheetPromises);
		const sheetImages = sheetSettledPromises.map((a) => a.value);
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
	async loadProgram(cart, options = {}) {
		await this.unloadProgram();
		cls();
		if (!cart) throw new Error('Unknown cart');
		this.loadedCart = cart;
		const api = { ...API };
		if (options.includeLaunch) api.launch = (name) => this.loadProgramByName(name || this.defaultLaunchCartName);

		// function runCode(txt) {
		// 	if (!txt) return;
		// 	if (typeof txt === 'function') return txt(api);
		// 	// TODO: clean the string
		// 	return eval(txt);
		// }
		const { ctx } = this;
		const nextUpdateCore = () => this.nextUpdate();
		const nextDrawCore = () => this.nextDraw();
		

		function getScopedFn(scope, script) {
			if (typeof script === 'function') return script.bind(scope);
			if (typeof script !== 'string') throw new Error('Invalid script');
			Function(`"use strict"; const $ = this; ${script}`).bind(scope);
		}
		const scope = (options.scope) ? { ...options.scope } : {};
		const p = this.runningProgram = {
			scope,
			sprites: [],
			_init: getScopedFn(scope, cart.program.init),
			_draw: getScopedFn(scope, cart.program.draw),
			_update: getScopedFn(scope, cart.program.update),
			init() {
				const returnedObj = this._init(api, this.scope);
				if (returnedObj) {
					Object.keys(returnedObj).forEach((key) => this.scope[key] = returnedObj[key]);
				}
				console.log('Init returned', returnedObj);
				// runCode(cart.program.init);
				correctColors(ctx, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
			},
			draw() {
				this._draw(api, this.scope);
				correctColors(ctx, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
				// runCode(cart.program.draw);
				nextDrawCore();
			},
			update() {
				this._update(api, this.scope);
				nextUpdateCore();
			},
		};
		
		await this.loadProgramSprites(p, cart);
		p.init();


		// p.sprites = 
		// p.init = function programInit() {
		// 	const returnedObj = p._init(api, scope);
		// 	Object.keys(returnedObj).forEach((key) => scope[key] = returnedObj[key]);
		// 	console.log('Init returned', returnedObj);
		// 	// runCode(cart.program.init);
		// 	correctColors(ctx, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
		// };
		// p.draw = function programDraw() {
		// 	p._draw(api, scope);
		// 	// runCode(cart.program.draw);
		// 	nextDraw();
		// };
		// p.update = function programUpdate() {
		// 	// runCode(cart.program.update);
		// 	p._update(api, scope);
		// 	nextUpdate();
		// };

		
		/*
		const getFnText = (script) => `"use strict"; const { g } = this; ${script}`;
		const scopedEvalFn = (scope, script) => Function(getFnText(script)).bind(scope);
		const scope = { a: 0, g: {} }; // TODO
		const initFn = scopedEvalFn(scope, cart.program.init)
		*/
		this.start();
	},
	testProgram(cart) {
		this.loadedCart = cart;
		// this.runCode(this.loadedCart.program.init);
		// eval(this.loadedCart.program.init);
		const indirectEval = (js) => {
			const iEval = eval;
			// iEval(`"use strict";${js}`);
			iEval(js);
		};
		const fn = Function('test', '"use strict";var x = 1; return { x };');
		let z = fn();
		console.log(typeof x, z);
		const scopedEval = (scope, script) => Function(`"use strict"; const { g } = this; ${script}`).bind(scope)();
		const scope = { a: 0, g: {} };
		const s2 = scopedEval(scope, `console.log('g', g); this.a += 1; return this;`)
		console.log(scope, s2);

		indirectEval('x = 1;');
		console.log(typeof x);
		// indirectEval(this.loadedCart.program.draw);


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
			elt.onmousedown = (e) => {
				this.pushButton(i, DOWN_FIRST);
				this.mouseDownButton = i;
			};
		});
	},
	pushButton(button, down = DOWN_FIRST) {
		if (button === undefined) return;
		this.buttonDown[button] = down;
		if (this.domButtons[button]) {
			this.domButtons[button].forEach((elt) => elt.classList.add('cc-button--active'));
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
			const down = e.repeat ? DOWN_REPEAT : DOWN_FIRST;
			this.keyDown[key] = down;
			this.pushButton(this.keyMap[key], down);
			if (this.keyMap[key] === undefined) console.log('Unmapped key:', key);
			e.preventDefault();
			// if (!e.repeat) console.log(this.buttonDown, this.keyDown);
		};
		window.onkeyup = (e) => {
			const key = fkey(e);
			this.keyDown[key] = NOT_DOWN;
			this.liftButton(this.keyMap[key])
		};
		window.onmouseup = (e) => {
			this.liftButton(this.mouseDownButton);
			this.mouseDownButton = null;
		};
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
}

function test(ctx) {
	loopAsync(1000, async (i) => {
		const c = pick(colorArray);
		const x = randInt(0, SCREEN_WIDTH);
		const y = randInt(0, SCREEN_HEIGHT);
		const size = randInt(1, Math.ceil(i / 200));
		ctx.fillStyle = c;
		ctx.fillRect(x, y, size, size);
		// await wait(1);
	});
}

function checkPixels() {
	const imageData = core.ctx.getImageData(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
	const { data } = imageData;
	let c = 0;
	let ok = 0;
	let notOk = [];
	for (let i = 0; i < data.length; i += 4) {
		const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
		const color = rgbToHexColor(r, g, b);
		c++;
		if (colorArray.includes(color)) ok++;
		else notOk.push(color);
	}
	console.log('Color check:', ok, '/', c); //  notOk);
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

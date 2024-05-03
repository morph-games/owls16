import { loopAsync, randInt, pick, wait } from './utils.js';
import { loadFonts, fontsArray, fontsSizeArray } from './fonts.js';
import { colorArray, rgbToHexColor, correctColors } from './colors.js';

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
const NIL = null, nil = null; // For pico-8 compatibility
const pxOffset = 0;

function err(e) {
	console.error(e);
}

function btn(button) {
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
	ctx.fillStyle = colorArray[color];
	ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
}

function spr(n, x, y, w, h, flipX, flipY) {
	// TODO: draw sprite at x y
}

function print(text, x = 0, y = 0, color = 15, font = 0) {
	const { ctx } = core;
	ctx.font = fontsArray[font] || font || fontsArray[0];
	ctx.fillStyle = colorArray[color] || color;
	const offsetY = fontsSizeArray[font] || fontsSizeArray[0];
	ctx.fillText(text, x + pxOffset, y + pxOffset + offsetY);
	ctx.textBaseline = 'alphabetic';
}

// Note this is different from Pico-8, where the 3rd and 4th params are x1, y1
function rect(x0, y0, x1, y1, color) {
	const { ctx } = core;
	// ctx.rect(x0, y0, x1 - x0, y1 - y0);
	ctx.fillStyle = (typeof color === 'number') ? colorArray[color] : color;
	// ctx.fill();
	ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
}


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
		'x': BUTTON_B,
		'z': BUTTON_A,
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
		';': BUTTON_A,
		'\'': BUTTON_B,
		'n': BUTTON_A,
		'm': BUTTON_B,
		'c': BUTTON_A,
		'v': BUTTON_B,
	},
	mouseDownButton: null,
	drawId: null,
	updateId: null,
	loadedCart: null,
	updateTime: 1000 / 60,
	runCode(txt) {
		if (!txt) return;
		if (typeof txt === 'function') return txt();
		// TODO: clean the string
		return eval(txt);
	},
	loadProgram(cart) {
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
	setup() {
		this.setupKeyboard();
		this.setupButtons();
	},
	start() {
		this.drawId = window.requestAnimationFrame(() => this.update());
		this.updateId = window.setTimeout(() => this.update(), this.updateTime);
	},
	stop() {
		window.cancelAnimationFrame(this.drawId);
		window.clearTimeout(this.updateId);
	},
	draw() {
		this.runCode(this.loadedCart.program.draw);
	},
	update() {
		this.runCode(this.loadedCart.program.update);
		this.updateId = window.setTimeout(() => this.update(), this.updateTime);
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

addEventListener('DOMContentLoaded', async () => {
	await loadFonts();
	const canvas = document.getElementsByClassName('console-monitor-canvas')[0];
	const ctx = canvas.getContext('2d', { willReadFrequently: true });
	ctx.imageSmoothingEnabled = false;
	ctx.translate(pxOffset, pxOffset);
	core.ctx = ctx;
	cls(0);
	print('LS16', 35, 110, 6, '70px BMJapan');
	print('OWLS v0.0.0-alpha.1 2024', 75, 200);
	print('THE SPACE AGE IS YOURS', 50, 130, 14, 1);
	colorArray.forEach((color, i) => {
		const x = 16 * i;
		rect(x, 20, x + 8, 30, color);
	});

	
	checkPixels();
	correctColors(ctx, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
	checkPixels();
	core.setup();
	core.loadProgram(testCart);
});

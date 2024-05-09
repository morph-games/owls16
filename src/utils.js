function loop(n, fn) {
	for (let i = 0; i < n; i += 1) { fn(i, n); }
}

async function loopAsync(n, fn) {
	for (let i = 0; i < n; i += 1) { await fn(i, n); }
}

// Some functions here from LittleJS utilities
function clamp(value, min=0, max=1) { return value < min ? min : value > max ? max : value; }
function lerp(percent, valueA, valueB) { return valueA + clamp(percent) * (valueB-valueA); }
function rand(valueA=1, valueB=0) { return valueB + Math.random() * (valueA-valueB); }
function randInt(valueA, valueB=0) { return Math.floor(rand(valueA,valueB)); }

function pick(arr) { return arr[randInt(0, arr.length)];  }
const wait = (ms) => (new Promise((resolve) => setTimeout(resolve, ms)));

export {
	clamp,
	lerp,
	loop,
	loopAsync,
	wait,
	rand,
	randInt,
	pick,
};

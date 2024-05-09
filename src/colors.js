
// Ordered like CGA: https://en.wikipedia.org/wiki/Color_Graphics_Adapter#Color_palette
const colorArray = Object.freeze([
	// Darker colors
	'#000000', // 0 Black
	'#2d006e', // 1 purple (stand-in for dark blue)
	'#007062', // 2 forest green
	'#3c80db', // 3 sky blue (stand in for dark cyan)
	'#800034', // 4 dark red
	'#6e0085', // 5 plum
	'#ff8f00', // 6 Orange (stand in for brown)
	'#7d7da3', // 7 gray
	// Lighter colors
	'#260a34', // 8 deep purple (stand in for dark gray)
	'#2929ff', // 9 royal blue
	'#0aff0a', // 10 green
	'#0dffff', // 11 cyan
	'#ff032b', // 12 red
	'#ff08ff', // 13 pink
	'#ffff0d', // 14 Yellow
	'#ffffff', // 15 White
]);
const rgbColorArray = Object.freeze(colorArray.map((c) => hexToRGB(c)));

function hexToRGB(hexColor) {
	const hexStr = hexColor;
	// TODO: make this more flexible, allowing no "#" leading, and 3-digit colors
	if (hexStr.length !== 7) throw new Error('invalid hex color');
	return [
		parseInt(hexStr.substring(1, 3), 16),
		parseInt(hexStr.substring(3, 5), 16),
		parseInt(hexStr.substring(5, 7), 16),
	];
}

function rgbToHexColor(r, g, b) {
	const hex = (n) => (n).toString(16).padStart(2, '0');
	return '#' + hex(r) + hex(g) + hex(b);
}

function getClosestColor(r, g, b) {
	let closestColor = null;
	let closestDist = Infinity;
	const myColorArr = [r, g, b];
	const dist = ([r0, g0, b0], [r1, g1, b1]) => (r1 - r0) ** 2 + (g1 - g0) ** 2 + (b1 - b0) ** 2;
	rgbColorArray.forEach((cArr) => {
		const d = dist(cArr, myColorArr);
		if (d < closestDist) {
			closestDist = d;
			closestColor = cArr;
		}
	});
	return [ ...closestColor ];
}

function correctColors(ctx, x, y, w, h) {
	const imageData = ctx.getImageData(x, y, w, h);
	const { data } = imageData;
	let fixed = 0;
	for (let i = 0; i < data.length; i += 4) {
		const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
		const color = rgbToHexColor(r, g, b);
		if (!colorArray.includes(color)) {
			fixed++;
			const [newR, newG, newB] = getClosestColor(r, g, b);
			data[i] = newR;
			data[i + 1] = newG;
			data[i + 2] = newB;
			data[i + 3] = 255;
			// ctx.fillStyle = correctedColor;
			// ctx.fillRect()
		}
	}
	// ctx.clearRect(0, 0, w, h);
	ctx.putImageData(imageData, x, y);
	// console.log('Corrected', fixed, 'pixels');
}

export { colorArray, rgbColorArray, rgbToHexColor, correctColors };


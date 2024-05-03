
const fontsArray = [
	'8px LS04b03',
	'9px BMSpace',
	'12px BMJapan',
];
const fontsSizeArray = [8, 9, 12];

// Not entirely sure how this all works
async function loadFonts() {
	await document.fonts.ready;
	const promises = fontsArray.map((font) => {
		return document.fonts.load(font);
		// if (document.fonts.check(font)) {
		// 	return document.fonts.load(font);
		// }
		// console.warn('Font not found:', font);
		// return Promise.resolve();
	});
	await document.fonts.ready;
	await Promise.allSettled(promises);
}

export { fontsArray, fontsSizeArray, loadFonts };

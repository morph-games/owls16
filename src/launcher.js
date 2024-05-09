export default {
	name: 'launcher',
	program: {
		init({ }) {
			// TODO: Get list of installed carts, ignoring launcher itself
			return {
				selected: 0, // index of selected cart
			};
		},
		update({ sin, launch, btn }, { blocks }) {
			launch();
		},
		draw({ cls, print, rect }, { blocks }) {
			cls(0);
			// blocks.forEach((b) => {
			// 	rect(b.x, b.y, b.x + b.w, b.y + b.h, b.color);
			// });
			// print('LS16', 35, 140, 6, '70px BMJapan');
			// print('THE SPACE AGE IS YOURS', 50, 160, 14, 1);
			// print('OWLS v0.0.0-alpha.1 2024', 75, 200, 7);
		},
	},
};
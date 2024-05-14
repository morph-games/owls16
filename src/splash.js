export default {
	name: 'splash',
	// sheets: [ 'test.png' ],
	program: {
		init({ COLORS }) {
			const tick = 0;
			const blocks = COLORS.map((color, i) => ({
				color: i,
				x: 16 * i,
				y: 20,
				w: 12,
				h: 20,
			}));
			return { blocks, tick };
		},
		update({ sin, launch, btn }, { blocks }) {
			this.tick += 1;
			blocks.forEach((b, i) => {
				const curveOffset = sin(this.tick / 100) * 2;
				// const offsetX = sin(this.tick / 50) * 2;
				// b.x += offsetX / 20;
				b.y = 30 + sin((this.tick / 12) + (i * (20 + curveOffset))) * 20;
				// b.color = (i + round(this.tick / 100)) % 16;
				// b.w = 8 + offsetX;
			});
			if (btn() && launch) launch('launcher');
		},
		draw({ cls, print, rectfill }, { blocks }) {
			cls(0);
			blocks.forEach((b) => {
				rectfill(b.x, b.y, b.x + b.w, b.y + b.h, b.color);
			});
			print('LS16', 35, 140, 6, '70px BMJapan');
			print('THE SPACE AGE IS YOURS', 50, 160, 14, 1);
			print('Press any button to continue', 75, 180, 3);
			print('OWLS v0.1.0-alpha.1 2024', 75, 200, 1);
		},
	},
};

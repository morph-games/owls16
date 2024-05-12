export default {
	name: 'invaders',
	sounds: [ // Zzfx arrays in index order
		[.5,,628,.04,.07,.58,2,.32,,.9,,,.09,.2,,.9,,.36,.2,.26], // intro
		[1.03,,242,.02,,.01,,2.92,4.8,,,,,.1,,.1,,.76,.01], // player shoot
		[.8,,242,.02,,.01,2,2.92,4.8,,,,,.1,,.1,,.76,.01], // enemy shoot
		[,,813,.05,.19,.4,3,3.04,,.7,,,,1.3,,.5,,.45,.13], // 3 explosion
	],
	songs: [ // ??? TBD -- Not implemented yet

	],
	backgrounds: [ // Data URLs in index order
		'data:image/png;base64,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',
		'data:image/png;base64,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',
	],
	spritesheets: [ // Data URLs in index order
		'data:image/png;base64,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AxAQJoAAhJNP6BBAANQABIQJIADh5BM6BBAANQABYQIIQDj5hA4BBEANQECYAAIQTj6hQwABUAMQECaAAISTT+gQQADUAASECSAA4eQTOgQQADUAAWECCEA4+YQOAQRADUBAmAACEE4+oUMAAVADEBAmgACEk0/oEEAA1AAEhAkgAOHkEzoEEAA1AAFhAghAOPmEDgEEQA1AQJgAAhBOPqFDAAFQAxAQJoAAhJNP6BBAANQABIQJIADh5BM6BBAANQABYQIIQDj5hA4BBEANQECYAAIQTj6hQwABUAMQECaAAISTT+gQQADUAASECSAA4eQTOgQQADUAAWECCEA4+YQOAQRADUBAmAACEE4+oUMAAVADEBAmgACEk0/oEEAA1AAEhAkgAOHkEzoEEAA1AAFhAghAOPmEDgEEQA1AQJgAAhBOPqFDAAFQAxAQJoAAhJNP6BBAANQABIQJIADh5BM6BBAANQABYQIIQDj5hA4BBEANQECYAAIQTj6hQwABUAMQECaAAISTT+gQQADUAASECSAA4eQTOgQQADUAAWECCEA4+YQOAQRADUBAmAACEE4+oUMAAVADEBAmgACEk0/oEEAA1AAEhAkgAOHkEzoEEAA1AAFhAghAOPmEDgEEQA1AQJgAAhBOPqFDAAFQAxAQJoAAhJNP6BBAANQABIQJIADh5BM6BBAANQABYQIIQDj5hA4BBEANQECYAAIQTj6hQ+B/mFV4W/riEBkAAAAASUVORK5CYII=',
	],
	spritemaps: [ // Give a name to all the sprites in a spritesheet -- Not implemented yet
		['ship', 'shipTurn', /* etc. */ ]
	],
	// `program` is an object containing three functions: `init`, `update`, and `draw`.
	// Each function has two parameters: an `api` object containing all the built-in functions
	// and constants, and a `scope` object (often abbreviated as `$`), which is an alias for `this`,
	// and contains all the data or functions that you want to be maintained in your game's state.
	program: {
		init({ sfx, SCREEN_WIDTH, SCREEN_HEIGHT }, $) {
			$.drawTick = 0;
			$.level = 1; // difficulty multiplier
			$.menu = 1;
			$.over = 0;
			$.ship = { hp: 5, maxHp: 5, shields: 2, x: 50, y: 190, hitbox: [2, 1, 12, 14], s: 0 };
			$.score = 0;
			$.enemies = Array(20).fill(0).map(() => ({ x: -16, y: 0, dirX: 0, dirY: 0, dead: 1, hitbox: [1, 1, 14, 12], s: 3 }));
			$.heroProjectiles = Array(20).fill(0).map(() => ({ x: -16, y: 0, dirX: 0, dirY: 0, dead: 1, hitbox: [7, 5, 2, 6], s: 16 }));
			$.enemyProjectiles = Array(20).fill(0).map(() => ({ x: -16, y: 0, dirX: 0, dirY: 0, dead: 1, hitbox: [5, 5, 6, 5], s: 17 }));
			$.explosions = Array(20).fill(0).map(() => ({ x: 0, y: 0, dead: 1, hitbox: [0, 0, 16, 16], s: 32, f: 0, frames: 8 }))
			$.spawnCooldown = 0;
			$.updatePositions = (arr) => {
				arr.forEach((p) => {
					if (p.dead) return;
					p.x += p.dirX;
					p.y += p.dirY;
					if (p.x <= -16 || p.x > SCREEN_WIDTH || p.y <= -16 || p.y > SCREEN_HEIGHT) p.dead = 1
				});
			};
			sfx(0);
		},
		update(api, $) {
			const {
				aabb, btn, btnp, max, min, sfx, pick, floor, randInt, SCREEN_WIDTH, SCREEN_HEIGHT
			} = api;
			const {
				ship, enemies, heroProjectiles, enemyProjectiles, explosions, updatePositions
			} = $;
			if ($.menu) {
				if (btnp(6)) {
					$.menu = 0;
					$.over = 0;
					$.score = 0;
					function reset(arr) {
						arr.forEach((a) => { a.dead = 1; a.x = -16; });
					}
					reset(enemies);
					reset(heroProjectiles);
					reset(enemyProjectiles);
					reset(explosions);
					ship.hp = ship.maxHp;
				}
				return;
			}
			if (btnp(6)) {
				$.menu = 1;
				return;
			}
			const spd = 3;
			if (btn(0)) $.ship.x = max($.ship.x -= spd, 0);
			if (btn(1)) $.ship.x = min($.ship.x += spd, SCREEN_WIDTH - 16);
			if (btn(2)) $.ship.y = max($.ship.y -= 1, 0);
			if (btn(3)) $.ship.y = min($.ship.y += 2, SCREEN_HEIGHT - 24);
			if (btnp(4)) {
				sfx(1);
				const p = heroProjectiles.find((a) => a.dead);
				if (!p) return;
				p.x = $.ship.x;
				p.y = $.ship.y - 8;
				p.dirY = -3;
				p.dirX = (btn(0)) ? -1 : (btn(1) ? 1: 0);
				p.dead = 0;
			}

			// Update positions ("physics")
			updatePositions(enemies);
			updatePositions(heroProjectiles);
			updatePositions(enemyProjectiles);

			// Spawn enemies
			const enemyChance = max(5, 60 - $.level);
			if (randInt(enemyChance) === 0) {
				const en = enemies.find((en) => en.dead);
				if (!en) return;
				const dir = (randInt(2) === 0 ? -1 : 1);
				en.x = dir === 1 ? 0 : SCREEN_WIDTH;
				en.y = (dir === 1 ? pick([20, 60]) : pick([40, 80])) + pick([2, 1, 0, -1, -2]);
				en.dirX = dir;
				en.dirY = pick([-.1, 0, 0, 0, 0, .5]);
				en.dead = 0;
				$.spawnCooldown = 18;
			} else {
				$.spawnCooldown = max($.spawnCooldown - 1, 0);
			}
			function spawnAttack() {
				const liveEnemies = enemies.filter((en) => !en.dead);
				if (!liveEnemies.length) return;
				const attacker = pick(liveEnemies);
				const p = enemyProjectiles.find((a) => a.dead);
				if (!p) return;
				p.x = attacker.x;
				p.y = attacker.y;
				p.dirY = pick([1, 1.5, 2, 3]);
				p.dirX = 0;
				p.dead = 0;
			}
			function spawnExplosion(x, y) {
				const ex = explosions.find((a) => a.dead);
				sfx(3);
				if (!ex) return;
				ex.x = x;
				ex.y = y;
				ex.dead = 0;
				ex.f = 0;
			}

			const attackChance = max(3, 30 - $.level);
			if (randInt(attackChance) === 0) spawnAttack();

			// Check for hits
			function collide(a, b) {
				if (a.dead || b.dead) return false;
				return aabb(
					[a.x + a.hitbox[0], a.y + a.hitbox[1], a.hitbox[2], a.hitbox[3]],
					[b.x + b.hitbox[0], b.y + b.hitbox[1], b.hitbox[2], b.hitbox[3]]
				);
			}
			const liveEnemies = enemies.filter((en) => !en.dead);
			heroProjectiles.forEach((p) => {
				if (p.dead) return;
				liveEnemies.forEach((en) => {
					if (!collide(p, en)) return;
					en.dead = 1;
					p.dead = 1;
					$.score += 1;
					spawnExplosion(en.x, en.y);
				});
			});
			enemyProjectiles.forEach((p) => {
				if (p.dead) return;
				if (!collide(p, ship)) return;
				ship.hp -= 1;
				p.dead = 1;
				spawnExplosion(p.x, p.y);
			});
			explosions.forEach((ex) => {
				if (ex.dead) return;
				ex.f += 0.5;
				if (ex.f >= ex.frames) {
					ex.dead = 1;
					return;
				}
			});
			$.level = $.level + 0.001;
			$.level = max($.level, 1 + floor($.score / 10));
			// Is game over?
			if (ship.hp <= 0) {
				$.over = 1;
				$.menu = 1;
			}
		},
		draw({ cls, print, floor, rect, spr, map, bg }, $) {
			cls(8);
			const { menu, ship, score, enemies, heroProjectiles, enemyProjectiles, explosions } = $;
			// map(0);
			// map(1);
			if (menu) {
				bg(0);
				bg(1);
				print('L A S E R  S T A R', 70, 50, 14, 2);
				print('I N V A D E R S', 75, 70, 14, 2);
				if ($.over) print('GAME OVER', 80, 140, 12, 1);
				print('Press START to fly', 70, 160, 6, 1);
				return;
			}
			$.drawTick += 1;
			bg(0, 0, floor($.drawTick / 20), 3);
			bg(1, 0, floor($.drawTick / 6), 3);
			print(`Health: ${String(ship.hp).padStart(3, '0')}`, 200, 0, (ship.hp <= 1) ? 12 : 3);
			print(`Score: ${String(score).padStart(9, '0')}    Level: ${floor($.level)}`, 6);
			// console.log(ship.x);
			// rect(ship.x, ship.y, shiap.x + 16, ship.y + 16, 6);
			spr(0, ship.x, ship.y);
			function drawThings(arr) {
				arr.forEach((a) => {
					if (a.dead) return;
					const spriteId = (a.s + floor(a.f || 0));
					spr(spriteId, a.x, a.y);
				});
			}
			drawThings(enemies);
			drawThings(heroProjectiles);
			drawThings(enemyProjectiles);
			drawThings(explosions);
		}
	}
};

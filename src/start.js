import { owls } from './console.js';
import invaders from './system-carts/invaders.js';

owls.ready(() => {
	owls.installCart(invaders);
});

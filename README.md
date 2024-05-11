# OWLS16 - Open Web LS16 Fantasy Console

Made for https://itch.io/jam/lospec-jam-2 and maybe also https://itch.io/jam/the-tool-jam-4

Try it out: https://morph-games.github.io/owls16

## Fantasy Console Limitations

### Required

- 256x224 resolution
- 16 color palette: https://lospec.com/palette-list/console16
- Colors are not allowed to be mixed, post processing effects are not allowed
- 8 button controller: 4-way direction page, A, B, Start, Select

### Optional

- 2 Player support
- 4-channel sound ship with Triangle, Pulse, Saw, and Noise generators
- 3 built-in fonts
- 16x16 px sprites, 64 on screen at once
- 4 scrolling tiled background layers
- 256x256 px sprite sheets

## To Do
### Core Features

- [X] Screen 256x224 with color palette enforcement
- [x] Program
- [x] Controller
- [x] Game loop
- [x] Spritesheet format
- [x] Spritesheet loading
- [x] Draw spite
- [ ] Sample sprites for splash screen
- [ ] Backgrounds
- [ ] tilemaps
- [ ] Sample Space-Invaders-clone Game (cartridge in js)
- [ ] Limit to 64 sprites on screen

### Wishlist / Ideas

- [ ] Music
- [ ] Draw to buffer before color correction and final draw
- Allow `btnp` function to get retriggered if button is held down after some delay
- System UI
	- [ ] Show cartridge in system UI (center)
	- [ ] Show controller cord connection
- [ ] Fast tap recognition (for mobile)
- Command line interface
- 3D console using CSS (see OWL-BAT)
- cartridges as JSON
- cartridges as images
- Different carts based on how they're saved: "T" = Temp cart (in memory, in development), "B" = Browser (IndexedDB), "M" = Local machine / drive, "S" = Cloud backed-up. Maybe a different color for each?
- Show cartridges in a library
- Ability to share cartridges
- Lua
- Compatibility with pico-8

## Credits

- LS16 console designed by skeddles, Pixelsnorf, Ty.mp3
- Palette: [Console16](https://lospec.com/palette-list/console16) by [adamPhoebe](https://lospec.com/adamphoebe)
- Fonts: [BM Space](https://www.dafont.com/bm-space.font) by [BitmapMania](https://www.dafont.com/bitmapmania.d283), [BM Japan](https://www.dafont.com/bm-japan.font) by [BitmapMania](https://www.dafont.com/bitmapmania.d283), [04b03](http://04.jp.org/) by [Yuji Oshimoto](http://04.jp.org/)

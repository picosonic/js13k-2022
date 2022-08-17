# Dev Diary / Postmortem

This is my fifth game jam entry.

Like in previous years, just before the theme was announced I created a new project template with updated build and minify steps from my entry last year.

As soon as the theme was announced I had some thoughts as to what kind of game I want to create to fit the theme, here as some of my inital thoughts/notes/ideas ..

DEATH
-----
* The irreversable cessation of all biological functions that sustain an organism
* End of consciousness
* The grim reaper
* Human skull as a representaion / symbol
* The opposite of life
* Point in time representing the end of a timeline which started with birth
* Ageing
* Heart stopping
* Breathing stopping
* End of neural activity
* Decomposing
* Corpse / Body
* Fossil / Skeleton
* Diagnosis of the end of life
* Myriad of causes of death
* Leads to an afterlife
* End of a species due to inability to reproduce
* Immortality
* Cryo preservation / Life extension
* Mortuary / Crematorium / Burial
* Last rites
* Funeral
* Extreme form of punishment
* Murder / Suicide / Kamikaze
* Evolution / Natural selection / Extinction
* Judgement day
* Fake death
* Russian roulette

Game ideas
----------
* Stopping an invading species kill off an important one (like bees)
* Playing a set of challenges against the Grim Reaper (like in [Bill & Ted's Bogus Journey](https://en.wikipedia.org/wiki/Bill_%26_Ted%27s_Bogus_Journey))
* Trying to kill yourself but not being able to
* A Halloween themed game
* Skeleton based game
* Travelling inside a body to repair it (like in [Fantastic Voyage](https://en.wikipedia.org/wiki/Fantastic_Voyage))
* Get multiple power ups to become immortal
* Detective game where you have to solve a murder
* Preventing nuclear war by hacking launch systems
* Playing as death trying to capture beings who's number is up
* Rolling 3D cube over a course, but with a limited set of moves

Here is a rough diary of progress as posted on [Twitter](https://twitter.com/femtosonic) and taken from notes and [commit logs](https://github.com/picosonic/js13k-2022/commits/)..

13th August
-----------
Volunteering with my son at [RMCRetro museum](https://www.rmcretro.com/), playing on retro consoles, computers, cabinets and gaming devices to get some inspiration. Looking back at some of my previous JS13k entries the one which did the best was a 2D platformer which used vector graphics.

Prior to the theme announcement I did have some genres which I wanted to code a game for but haven't yet, including: driving, puzzle, fighting, 3D platformer.

Having said that it's been way too hot to do too much thinking or coding yet.

14th August
-----------
Still too hot to think or code, but ultimately I've decided to go with a 2D platformer based on saving bees from extinction, and want to use the tilemap from Kenney ["Pixel Line Platformer"](https://kenney.nl/assets/pixel-line-platformer).

I've added the assets to the project and created a way to draw individual tiles to the canvas. Due to the pixel nature of the assets, I'm going to limit the play area to 16:9 aspect ratio at 640x360 ([nHD](https://en.wikipedia.org/wiki/Graphics_display_resolution#640_%C3%97_360_(nHD))), that will auto centre in a reactive way to browser resizing.

I want to put together some maps using [Tiled](https://www.mapeditor.org/) next so that I can get a feel for the physics required.

15th August
-----------
Added an initial [Tiled](https://www.mapeditor.org/) level to get the ball rolling.

Updated "run" action in VSCode to also rebuild assets if required but not build .zip file before starting browser.

Added my timeline library as used in previous years, since it proved so useful. I'll use it to schedule things to happen on a timeline, for animations and game progression.

Updated build/run script to auto build levels if Tiled level files are modified.

Created a sample map in Tiled. Using most of the available tiles and chars. Then fixed Tiled version compatibility issue with build script where I was being restrictively specific.

Updated to draw level to canvas rather than just available tiles.

Added loading of levels (to be used for switching levels), this splits chars and adds them as objects to gamestate.

16th August
-----------
Added radix to parseInt() due to complaints by closure compiler.

Decided the resolution was too high for a pixel art feel, so reduced to 320x180.

Added 8-bit font (used in previous competitions) and a writer library.

Moved sprites onto a separate canvas than the tiles.

Draw characters to sprite canvas, and moved sprite drawing to vsync handler.

Added some test levels, 2d platformer scratch level, top down maze and spritesheet test.

Looked up how to do flipped drawImage, seems a bit hacky.

Added initial platformer movement system.

Added sprite animation.

Fixed issue where sprite x or y with fractional values would render slightly blurry.

17th August
-----------
Improved feel of player hit detection, by making the collision box smaller. It's now 1/3rd of a tile wide (centered), and 3/5th of a tile high (clamped to the bottom).

Reduce CPU load by not doing movement hit detection when not moving.

Made all tiles in chars[] visible and not solid, interactions will come later (if required). This means all defined tiles in tiles[] are now solid. The player tile is still treated separately.

Testing the platformer physics, collision detection and animations.

![Testing platformer physics](bees.gif?raw=true "Testing platformer physics")

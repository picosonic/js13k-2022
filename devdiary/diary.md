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

Prior to the theme announcement I did have some genres which I wanted to code a game for but haven't yet, including: driving, puzzle, fighting, 3D platformer. I'm thinking puzzle suits the theme best.

Having said that it's been way too hot to do too much thinking or coding yet.

14th August
-----------
Still too hot to think or code, but ultimately I've decided to go with a 2D platformer based on saving bees from extinction, and want to use the tilemap from Kenney ["Pixel Line Platformer"](https://kenney.nl/assets/pixel-line-platformer).

I've added the assets to the project and created a way to draw individual tiles to the canvas. Due to the pixel nature of the assets, I'm going to limit the play area to 16:9 aspect ratio at 640x360 ([nHD](https://en.wikipedia.org/wiki/Graphics_display_resolution#640_%C3%97_360_(nHD))), that will auto centre in a reactive way to browser resizing.

I want to put together some maps using [Tiled](https://www.mapeditor.org/) next so that I can get a feel for the physics required.

15th August
-----------
Added an initial [Tiled](https://www.mapeditor.org/) level to get the ball rolling.

Updated "run" action in VSCode to also rebuild assets if required but not build .zip file before starting browser. This makes it much quicker to prototype and debug as I don't have to wait for the slow job of making the zip file and then optimising it.

Added my timeline library as used in previous years, since it proved so useful. I'll use it to schedule things to happen on a timeline, for animations and game progression.

Updated build/run script to auto build levels if Tiled level files are modified.

Created a sample map in Tiled. Using most of the available tiles and chars. Then fixed Tiled version compatibility issue with build script where I was being restrictively specific.

Updated to draw level to canvas rather than just available tiles.

Added loading of levels (to be used for switching levels), this splits chars and adds them as objects to gamestate.

16th August
-----------
Added decimal radix to parseInt() due to complaints by closure compiler.

Decided the resolution was too high for a pixel art feel, so reduced to 320x180. This is closer to some old games from DOS days which ran in 320x200, but in a 16:9 aspect ratio to suit modern monitors.

Added 8-bit font and a writer library (used in previous competitions). May change later, but just wanted to maintain the low res pixel feel.

Moved sprites onto a separate canvas than the tiles. Draw characters to sprite canvas, and moved sprite drawing to vsync handler. I have an optimisation idea where the tiles can be kept still while the sprites are moved on a foreground transparent canvas.

Added some test levels, 2D platformer scratch level, top down maze and a spritesheet test.

Looked up how to do flipped drawImage, seems a bit hacky. You need to save canvas context state, scale to negative in the x axis, draw the image (but at a negative x position and with a negative width), lastly restore canvas state. The alternative seems to be to generate all the sprites in a flipped tilesheet.

Added initial platformer movement system. To get feel for jump ability, speed of level traversal, e.t.c.

Added sprite animation, every 8 frames (7.5 x per second @ 60Hz) it moves on to the next character.

Fixed issue where sprite x or y with fractional values would render slightly blurry. The canvas pixelated render would do some kind of sub-pixel sampling or anti-aliasing making it look blurry depending on the fractional value.

17th August
-----------
Improved feel of player hit detection, by making the collision box smaller. It's now 1/3rd of a tile wide (centered), and 3/5th of a tile high (clamped to the bottom). This smaller size means it's easier to navigate single-tile-wide spaces. It also means that the player's body/legs are the collision area, so the head/arms are not included, this gives a nice sprite overlap when against solid edges.

Reduce CPU load by not doing movement hit detection when not moving.

Made all tiles in chars[] visible and not solid, interactions will come later (if required). This means all defined tiles in tiles[] are now solid. The player tile is still treated separately.

Testing the platformer physics, collision detection and animations. I borrowed code from my first game jam entry to reduce the learning curve.

![Testing platformer physics](bees.gif?raw=true "Testing platformer physics")

Added player animation cycling. This depends on if the player is holding the gun or not.

Added player/char collision testing, and ability to pick up gun.

To improve readability, changed constants to uppercase and added keystate bitmask constants.

Changed jump from SPACE/ENTER to UP, which seems more intuitve, leaving those free for actions.

Edited tilemap to change "gate" into "bee hive". This is so bees have somewhere to return to, plus I wanted the tile to be full height so when the player stands on it they don't appear to hover.

Added scrolling of map to player including multiple scroll speeds and dampening. A delta value is worked out from where the level is currently scrolled at to where it wants to be, to keep the player in the centre. Scrolling starts off slow, but goes to a higher speed if the player is getting near the edges of the screen (a high delta value). It won't scroll past the edges of the screen meaning the player won't be in the centre any more when near the edges. Turning off dampening does and instant scroll to keep the player in the centre.

![Player animation and scrolling](bees2.gif?raw=true "Player animation and scrolling")

18th August
-----------
Added ability to shoot the gun. It has a cool down timer so you don't get too many shots at once and they don't overlap on screen. Shots are destroyed when then hit something shootable, otherwise they travel until their time-to-live counter elapses (currently 40 frames).

Added shot collision detection. Allow grub and fly to be shot, with health values rather than 1-shot death. Currently grub takes 3 shots and fly takes 8.

Do a deep copy of the level's tile list so that it can be modified during gameplay. I'm thinking certain solid tiles could have a high health value and so be destroyed with heavy fire.

Prevent player going off the left/right of the level. Previously all my test levels didn't have solid edges at left/right meaning the player could fall off the level and would respawn at the start point.

Added predictable random number generator using Wichmann-Hill algorithm. I've used this in previous game jam entries and had good success with it.

Added particle system. Initally used for exploding enemies. They get drawn last so are always visible. Currently 32 particles are generated in a specified RGB colour and scattered around a specified central point at random polar coordinates (angle and distance). They are then reduced in alpha value (become more transparent) as they decay, once 0 is reached for alpha the particle is deleted. Particles travel outwards away from their central point but are subject to a fixed (non-accelerating) gravity.

![Shooting and particle explosions](bees3.gif?raw=true "Shooting and particle explosions")

Added grub movements, just left/right for now, turning when blocked or reaching an edge.

Needed to sort char array so that sprites come last, otherwise the grub could go behind non-solid tiles. I didn't want to have another array of objects for the sprites, so I'm thinking of the tiles as being solid and the chars as being squashy so you can collide with them.

Added a transition tile to switch between 2D platformer and top-down so a level can be a combination of both. You need to go through this invisible gateway with a negative vertical speed (i.e. going upwards as part of a jump). Colliding with the tile in any other direction will set 2D platformer mode and re-enable gravity.

![Metamorphosis](bees4.gif?raw=true "Metamorphosis")

Added muzzle flash, so for the first few frames a shot will have a muzzle sprite.

19th August
-----------
Decided on the name **Bee Kind** for the game.

Created a roughly ordered todo list. For things I'd like to implement in the game.

Changed spritesheet to remove background colour, this is so that I can change the background colour on the fly or have gradients, parallax or particle effects.

Added spawning of toadstools and flowers. A spawn check is made every 8 seconds. First it looks in the current tile map to create a list of horizontal, flat-topped, solid platforms where there is nothing above and it is at least 2 tiles away from other entities. Then if the list is not empty it randomly chooses one of these spawn points, and randomly chooses either a toadstool or flower to spawn there.

Added some entropy to the random number generator by using milliseconds + seconds of the time that the game was started to advance random seeds.

Found some keyboards are worse than others at rollover, and so often only 2 keys can be detected as held at once, however this can vary between keyboards. For example, holding Up+Left arrows, then pressing Space might fail where pressing Enter would work. So I've decided to add Shift as an action key since this works better in combination with other keys. I used a [key rollover test page](https://www.mechanical-keyboard.org/key-rollover-test/) to determine what worked best.

Also on the topic of keyboards, in terms of the events generated by keypresses, I was using **event.which**. While this worked, it is considered deprecated. So I've switched to using **event.code** which should mean that keyboard layouts shouldn't matter as it maps to physical layout.

Toadstools can now be destroyed, bigger ones take twice as many hits.

Updated particle system to allow specifying radius and number of particles to spawn. This is so every damaging hit lets of a smaller amount of particles and the final shot lets off a big burst of particles.

20th August
-----------
Made plants grow a bit quicker, 30 seconds seemed a bit long compared to the rest of the action.

Added a dwell time to chars, when set the AI will prevent them moving until it has expired. This allows for things like grubs to pause whilst eating toadstools.

Made grubs start moving in a random direction, previously they always went right. Gives it a bit more of a natural feel, and makes gameplay more varied. They also leave a toadstool after eating in a random direction.

When grubs eat they gain health as the toadstools loose it. Large toadstools will get smaller, small ones will disappear. Once it's finished eating all of a toadstool, if a grub gets enough health it turns into a killer fly to cause more mischief elsewhere.

![Metamorphosis](bees5.gif?raw=true "Metamorphosis")

Made particles randomly include up to 5% larger particles to represent chunks.

My next JS13k challenge is to get pathfinding working. I found a really in depth and useful 6-page article in [issue 48 of Wireframe magazine](https://wireframe.raspberrypi.com/issues/48) written by Paul Roberts. It goes in to some detail about the algorithm

21st August
-----------
Made the bees alternate between flowers and hives depending on amount of pollen that they are carrying. Each flower or hive can only be visited by a single bee at a time meaning they will seek out other resources rather than end up on top of each other.

![Bee AI debug](beedebug.png?raw=true "Bee AI debug")

Added a debug indicator of pollen carried (bees/hives) and remaining health (plants/characters). This is so that I can verify the bee's descisions when moving around prior to implementing the pathfinding. Since when the pathfinding is enabled I won't as easily know where the bees are going because they won't be travelling line of sight anymore.

Just about to turn in for the night, when I thought I'd test the minified version that Google Closure is outputting, however it failed to run citing undefined variables. It turned out that the 2 arrays of level data for tiles and characters within the levels was getting assigned a new variable name that wasn't in the data. By changing the way I access these it started working again. So *levels[gs.level].tiles* needed to be changed to *levels[gs.level]['tiles']* for the Closure output to be valid.

After doing a bit more digging, this is a known "feature" of Google Closure when run with ADVANCED compilation level. It turned out that my levels were defined using Javascript object that had string keys, but in the code I was accessing those keys using dot notation. So changing the object accessing as described above or by making the object declaration use identifiers rather than keys also fixed it. This feature is documented on the Google Closure website [here](https://developers.google.com/closure/compiler/docs/api-tutorial3#propnames), and says there will be issues with the resultant code if mixing key types and access methods.

![Mixed keys](closure.png?raw=true "Mixed keys")

This gets optimised to something which doesn't work (because *g* doesn't exist) ..

    for(var a=[{tiles:[]}],b=0;b<a.length;b++)console.log(a[b].g[0]||0);

22nd August
-----------
Implemented a rough pathfinder algorithm to test how it works with dummy data. This is based on the [A* pathfinder algorithm](https://en.wikipedia.org/wiki/A*_search_algorithm).

I wasn't able to see any path reductions so took that bit of code out. This is when more than one way to get to the same point is found and the more recently found one is shorter to get to and is the closer to the target (so ends up with a smaller overall cost).

![Path finder](pathfinder.png?raw=true "Path finder")

23rd August
-----------
Tested out pathfinder algorithm on a moderate sized maze with good results.

![Path through maze](maze_pathfinder.png?raw=true "Path through maze")

Had a go at creating a webworker from an in-line function. To be used for the path finder to lighten the load.

24th August
-----------
Added an FPS counter in debug mode to see how much difference code changes are making. This was based on some code I adapated from [here](https://www.growingwiththeweb.com/2017/12/fast-simple-js-fps-counter.html).

Added the pathfinder algorithm to bee movements. Bees also now have a fixed speed rather than being based on distance to destination. When bees find they have nowhere of interest to go, they will follow the player.

Keep looking for points of interest whilst en-route, and deviate if necessary. This is incase the intended destination becomes in use by another char, or gets used up entirely.

![Jump dust, rainbow particles and pathfinding bees](bees6.gif?raw=true "Jump dust, rainbow particles and pathfinding bees")

Added dust when hitting the ground after jumping, gradient background and made metamorphosis use rainbow particles.

Flies now chase down bees and hives. If they collide with a bee they steal some pollen. If they collide with a hive that has pollen then they break it and it looses half its pollen.

When hives are added to, if the pollen content is over a threshold a new bee spawns. However I've limited spawning of bees and flies if there are already a few on the level.

Added some parallax clouds, randomly dispersed when the level is loaded.

25th August
-----------
Added gamepad support, for "default" gamepad and a set of known common ones (with mappings).

Noticed some oddities with the entity AI, so doing some investigations and making code alterations.

Spent ages debugging a wierd issue cause by an assignment which was incorrectly using "==" instead of "=", due to a cut-and-paste oversight.

Removed inuse flags on flowers and hives, may add again later, but for now it was causing issues.

Started working on state machine and intro animation, put a framework in place to use timelines.

26th August
-----------
Did some more work on the intro animation, added a rabbit going across the screen with the letters to spell out the game name appears above it as it passes, and some bees going the other way at the same speed so they cross in the middle.

![WIP intro sequence](bk_intro.gif?raw=true "WIP intro sequence")
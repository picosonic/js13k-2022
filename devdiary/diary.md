# Dev Diary / Postmortem

This is my fifth game jam entry.

Like in previous years, just before the theme was announced I created a new project template with updated build and minify steps from my entry last year.

As soon as the theme was announced I had some thoughts as to what kind of game I want to create to fit the theme, here as some of my initial thoughts/notes/ideas ..

DEATH
-----
* The irreversible cessation of all biological functions that sustain an organism
* End of consciousness
* The grim reaper
* Human skull as a representation / symbol
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
Improved feel of player hit detection, by making the collision box smaller. It's now 1/3rd of a tile wide (centred), and 3/5th of a tile high (clamped to the bottom). This smaller size means it's easier to navigate single-tile-wide spaces. It also means that the player's body/legs are the collision area, so the head/arms are not included, this gives a nice sprite overlap when against solid edges.

Reduce CPU load by not doing movement hit detection when not moving.

Made all tiles in chars[] visible and not solid, interactions will come later (if required). This means all defined tiles in tiles[] are now solid. The player tile is still treated separately.

Testing the platformer physics, collision detection and animations. I borrowed code from my first game jam entry to reduce the learning curve.

![Testing platformer physics](bees.gif?raw=true "Testing platformer physics")

Added player animation cycling. This depends on if the player is holding the gun or not.

Added player/char collision testing, and ability to pick up gun.

To improve readability, changed constants to uppercase and added keystate bitmask constants.

Changed jump from SPACE/ENTER to UP, which seems more intuitive, leaving those free for actions.

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

Added particle system. Initially used for exploding enemies. They get drawn last so are always visible. Currently 32 particles are generated in a specified RGB colour and scattered around a specified central point at random polar coordinates (angle and distance). They are then reduced in alpha value (become more transparent) as they decay, once 0 is reached for alpha the particle is deleted. Particles travel outwards away from their central point but are subject to a fixed (non-accelerating) gravity.

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

Added a debug indicator of pollen carried (bees/hives) and remaining health (plants/characters). This is so that I can verify the bee's decisions when moving around prior to implementing the pathfinding. Since when the pathfinding is enabled I won't as easily know where the bees are going because they won't be travelling line of sight any more.

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
Added an FPS counter in debug mode to see how much difference code changes are making. This was based on some code I adapted from [here](https://www.growingwiththeweb.com/2017/12/fast-simple-js-fps-counter.html).

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

Spent ages debugging a weird issue cause by an assignment which was incorrectly using "==" instead of "=", due to a cut-and-paste oversight.

Removed inuse flags on flowers and hives, may add again later, but for now it was causing issues.

Started working on state machine and intro animation, put a framework in place to use timelines.

26th August
-----------
Did some more work on the intro animation, added a rabbit going across the screen with the letters to spell out the game name appears above it as it passes, and some bees going the other way at the same speed so they cross in the middle.

![WIP intro sequence](bk_intro.gif?raw=true "WIP intro sequence")

Created a base set of 7 bee-pun named levels. The name is done as a custom map property within Tiled.

Updated build script to extract level name when building new levels.js file.

Added new level screen when changing levels, it shows the level number and name for 2 seconds, then launches into the game.

Did some fixes on my timeline library. What I found was that if a timeline entry cleared out the timeline with a view to creating a new one it could mess up the calculations for how many entries remain to be run on the timeline.

Added tiny JS13k logo to tileset.

28th August
-----------
Added detection of level completion, to then progress to the next level. Or if you get to the end of all the levels go back to the intro screen.

Re-entering the intro screen caused an issue where the title and bees were displayed but not the bunny. It turned out that it depends where the level was scrolled to when the intro screen was entered. The default when the intro is entered for the first time is 0,0 but when entering at the end of the last level would leave the offsets as they were during gameplay. It took a lot of heads cratching to realise this.

Made some changes to the timeline library. You can now tell if the timeline has finished. Callback timelines will get called at 0% rather than only after the next frame.

Decided to make the number of bees needed to complete a level dependant on the level number, so 5 for level 1, 6 for level 2, e.t.c. Also raised the maximum number of bees and zombees active in any given level from 10 to 20.

Added more stats to debug, so now under the FPS it shows the number of grubs, zombees and bees to give an idea of what it required to complete a level.

Refactored the code for detecting if a level is complete, as I already had a library to count the number of active chars of a given set of tiles. Not sure it it helped keep the size down, but every little trim down is always good.

Added controls to intro screen including use of WASD or ZQSD (for AZERTY keyboards) with SPACE/ENTER/SHIFT or gamepad.

3rd September
-------------
After a little coding break for a holiday, getting back on to js13k with only 10 days remaining.

Added hurt timer functionality, so that if the player collides with a grub or zombee they start flashing. Whilst hurt the player moves slower, cannot jump and cannot pick up the gun. If the player collides with a zombee the hurt period is longer and if they are carrying the gun that is dropped at the point of collision.

Did some more work on the levels.

5th September
-------------
Made a vertical level as wide as the viewport. Where you constantly switch between top down and platformer modes to ascend to the top to get the weapon. This feels a bit tricky so will put this as one of the later levels.

Shuffled order of levels around to vaguely match increasing difficulty.

Indicate on new level screen how many bees are required to progress to next level. This is in conjunction with removing threats.

Added message box function with timeout. This is to give indication of things going on and what may be left to do.

6th September
-------------
Made 8-bit font a const and added dimensions to aid readability and cut down on hard-coded repeated numbers.

Added optional icon to be shown on message boxes, which makes them look a bit better.

![Message box with icon](messagebox.png?raw=true "Message box with icon")

I didn't really like the way that the sprites were being flipped, so I found [another way to do it](https://stackoverflow.com/questions/21610321/javascript-horizontally-flip-an-image-object-and-save-it-into-a-new-image-objec) which seems better. This creates a flipped version of the image by drawing it flipped to a canvas and then turning that canvas into the source for a new image via a dataURL.

7th September
-------------
Improve vertical centring on message boxes when an icon is used and only 1 line of text is shown.

Fix message box icon requiring x and y scroll offsets to place the icon correctly.

![Health bar](healthbar.gif?raw=true "Health bar")

Show health bars above enemies and toadstools whilst being hurt. It only shows for the enemy being hurt or ones which were hurt recently.

Added music playback using part of Harp Solo from "[Blue Danube](https://en.wikipedia.org/wiki/The_Blue_Danube)" (Op.314) by [Johann Strauss II](https://en.wikipedia.org/wiki/Johann_Strauss_II) (in the public domain since it was composed in 1866 - before 1924).

8th September
-------------
Added some pop-up hints at the start of the first level, so that it acts as a trainer.

![Roll up](rollup.gif?raw=true "Roll up")

Added message box rollup, so that near the end of the display time, the messagebox rolls up to disappear.

Updated timeline library to return this in the member functions. Doing this allows chaining multiple calls together without specifying the variable each time, e.g.

    timeline.add(0, function() {console.log("A");});
    timeline.add(1000, function() {console.log("A");});
    timeline.begin();

becomes

    timeline.add(0, function() {console.log("A");}).add(1000, function() {console.log("A");}).begin();

Made message boxes less transparent, 50% was a bit too see-through. Also spaced out better vertically.

Removed predictive random number generator as we are not going to need anything other than standard random. Saves about 140 bytes in .zip size.

Removed \n characters from Google Closure output, which saves about another 140 bytes in the .zip size. It would seem that it adds these every 500 or so characters to [fix issues with some firewalls and proxies](https://developers.google.com/closure/compiler/faq#linefeeds) which intentionally break JS with long lines

9th September
-------------
Some levels could be "cheated" by abusing the topdown/platformer switches. Enforced that switching to topdown only happens when only up is pressed.

More level editing, trying to make sure all the existing levels are completable and that the difficulty ramps up. Also added some visual variety in the levels.

Added a "secret" underground section to one of the levels, hard to get to and traverse but well worth the risk.

Made plants grow more randomly so they don't all sprout up at the same time.

Added workaround for collision issue where player could get stuck and the browser could hang in a tight loop.

Allow message boxes to be queued up to be shown one at a time. Used in the hint system.

10th September
--------------
Added payment pointer for Web Monetization. Thought I'd take a look at a different category this year. I've previously made entries in the  **Desktop**, **Mobile** and **Decentralized** categories. When monetization detected, player can still jump when hurt and bees move faster.

Space is starting to get tight, so removed the subtle background gradient which saved about 71 bytes. Removed spaces in rgb() declarations but didn't make much difference. Tested removing OSD debug metrics code, this saved about 169 bytes.

Added completion animation with CONGRATULATIONS, the bunny and loads of bees swarming round happily.

11th September
--------------
Created small and large screenshots which are needed for the game submission process. Also added a manifest.json file.

Expanded the text of the game completion message to include a message from the Queen Bee, as a nod to her majesty Queen Elizabeth II.

Changed gravity toggles to allow horizontal movement when passing through, but to only switch to top-down if moving upwards and tile above toggle is empty.

![JS13k power up](powerup.gif?raw=true "JS13k power up")

Added JS13k logo to levels, which when collected affords temporary invulnerability.

Spent some time making the levels more "complicated" so that they would look nicer and therefore take up more space, got it down to 4 bytes left.

Thought I'd better submit the game now.

12th September
--------------
My game is [now live](https://js13kgames.com/entries/bee-kind) on the JS13k website.

![Code layout](codelayout.png?raw=true "Code layout")

I've created a small graphic to visualise the layout of the code and data in my JS13k game. Where pink=HTML/CSS, green=JS, yellow=music, red=levels and light blue=tilemap.

Added link on [JS13k resources page](https://js13kgames.github.io/resources/) to this dev diary / postmortem page.

Postmortem
----------
I found the theme quite tricky this year, despite many many games having some aspect of death in them, I felt that concentrating on death felt challenging.

Given that Bees are so vital to life, my thoughts regarding not only keeping them alive but also upping their numbers felt like a suitable goal, but that so save them, sacrifices need to be made.

I really enjoy playing 2D platform games, such as [Chuckie Egg](https://en.wikipedia.org/wiki/Chuckie_Egg), [Mario](https://en.wikipedia.org/wiki/Mario), [Sonic](https://en.wikipedia.org/wiki/Sonic_the_Hedgehog), [Dizzy](https://en.wikipedia.org/wiki/Dizzy_(series)), [Prince of Persia](https://en.wikipedia.org/wiki/Prince_of_Persia), [Another World](https://en.wikipedia.org/wiki/Another_World_(video_game)), [Titus the Fox](https://en.wikipedia.org/wiki/Titus_the_Fox), [Thomas Was Alone](https://en.wikipedia.org/wiki/Thomas_Was_Alone) and [Celeste](https://en.wikipedia.org/wiki/Celeste_(video_game)) to name but a few.

Plus I had previously made a 2D platformer in my first JS13k entry in 2018 - [Planet Figadore has gone offline](https://js13kgames.com/entries/planet-figadore-has-gone-offline), which came in 28th place overall, and I wanted to revist the genre, and improve on the formula.

I'm not a very good graphic designer, so for that first JS13k entry I used graphics that were designed by Kenney in the form of his [Abstract Platformer](https://kenney.nl/assets/abstract-platformer) set. That game was all vector based and used div elements that moved around the DOM rather than pixels on canvas.

I quite like the pixelated look of retro games and their small colour palettes and low resolutions, so had a look in the Kenney releases for one I liked the look of that I might be able to use in my 2022 entry. I came across the [Pixel Line Platformer](https://kenney.nl/assets/pixel-line-platformer) which was small and compact (the spritesheet is only 1.4 kb) and fitted with the ideas I had for my new game.

Next I wanted to give the Bees a hive that they could take the pollen back to so that they could make honey and ultimately new bees. So I redesigned the spritesheet slightly to remove the background colour and changed the crate to a hive.

I wanted to target a low retro type resolution but one which was widescreen so it would look better on modern TVs/monitors, so settled on 320x180. This made the 16x16 tiles feel about the right size when shown on a map and allowed about the right amount of the map to be visible. I found that showing too much map meant the player wanted to explore less.

Last year I made the decision to make 2 games for JS13k at the same time, which was certainly challenging, but I wanted to have one which targeted [mobile gaming](https://js13kgames.com/entries/crater-space) alongside a more feature-rich [desktop](https://js13kgames.com/entries/airspace-alpha-zulu) game. This was very stressful and took up a lot of my spare time, which didn't leave much downtime. So I decided that given I was doing another 2D platformer, I would reuse as much of my previous games engines and libraries as possible so that I could concentrate on the levels and playability.

Since I'd not done any sprite stuff onto canvas before, I had to ditch the way my first platformer did rendering and work out from first principles how to draw sprites from a spritesheet. I was very surprised to find out that there wasn't a neat method for drawing flipped sprites and ended up going through two iterations of code snippets which I'd found on the internet. Ultimately I settled on a method which generated a second flipped version of the tilesheet that I could draw from.

I used VSCode more heavily this year for editing where previously I'd used almost exclusively vim on the linux command line, I set up some nice workflows and hotkeys which ran scripts that were able to build/minify/package for seeing how much space was left, and also a quick launcher which didn't do as much so that I could iterate quicker. The build process checks the timestamp of some output/packed files and rebuilds them if/when the source equivalent is changed. I used this for the level files and spritesheet regeneration.

To save time, I added a low res font which I'd used previously and an accompanying font renderer. I like the look of this font and it worked well with the low resolution theme.

By the 4th day (so quite early on) I had a reasonably good workflow going with coding/level design and a basic platformer up and running. I made the decision to separate the tiles and characters into separate layers on the tiled maps, which may have been a contributing factor into how large they are when viewed as a percentage of the minified size. Maybe some investigation would be good to determine best way of representing them.

My first platformer used the browsers in-built capability to scroll around the DOM because all the on-screen elements were divs, but I needed to come up with a new way to scroll my platformer once I started making bigger levels. I ended up using an X and Y scrolling offset but that would not fix on the character directly, instead if would slow catch up with the player. Then if the player was moving too fast the scroll speed would increase to try to keep them in view. I quite like the way this ended up.

Next, since I wanted this to be a shooter rather than a jump on enemies heads, I had to be able to pick up the gun and for it to be able to shoot. This worked reasonably well and I added particle effects to the enemies being shot.

As part of my test levels I drew up a maze (based on one at a castle I have visited), then one of the ideas I had, which I thought would be a good game mechanic is the ability to switch between 2D platformer and a kind of top-down mode to allow the maze to be completed, essentially turning off gravity. This felt quite cool so I put in an invisible toggle to the maze level, and some of the later ones which would allow for some more variety to the gameplay other than just shooting enemies.

When I was thinking of a name for the game I came up with lots of bee related puns, I settle on "Bee Kind" as you have to be kind to the bees in this game and it's been a motto throughout covid of being kind to other people. The unused game names ultimately got used for the level names.

To add a bit more variety I made existing small plants (toadstools / flowers) grow slightly randomly and to spawn from the ground where there is space on a flat platform with nothing above or too near it.
There is a slight bias towards making flowers, to help the player out because some of the levels you end up waiting for bees to increase their numbers after all the enemies are removed.

I found that some of the moving characters wouldn't carry out the whole of their function when they got to their destination and so wanted a way to slow them out whilst they are busy. This led me to introduce a dwell timer such that when a character gets somewhere it wants to go, it waits before deciding what to do next.

Initially the AI for the grubs was coded using similar logic to the enemies in my first platform game, so it was pretty easy. But with the addition of flying characters I didn't want them to just use line of sight to move towards their next target. I found an article in Wireframe magazine (issue 48), which detailed how to implement the A* pathfinding algorithm. So I coded that up and now the flying characters go around solid objects and are able to navigate the large maze by themselves. Which I thought was pretty neat.

I spent quite a bit of time debugging odd behaviour of the characters movements, so ended up adding a debug switch so I could get a better idea of where they were going and why. A lot of the initial rules were ditched because I didn't like their effect on the AI. Such as only a single visitor to toadstools, flowers and hives.

At one point I had a gradient background, but decided this didn't really fix the low colour palette theme, plus it took up valuable bytes I could use elsewhere, so that went.

I like the way characters spawn with a release of particles so kept that in. I made a lot more of the particle system as I went on, and use it heavily on the intro screen, enemy damage, spawning, dust when hitting floor and later on the invulnerability power up.

The clouds are randomly added on to the level and drawn first to make them appear in the background, they tend to appear only in the top half of the level and move in a subtle parallax way. Some of the later levels make use of solid clouds for you to stand on (like the Dizzy series) but it's meant as something you can discover rather than being told about.

Another important aspect for me in terms of what makes a good game is being able to play it with a gamepad, as it then feels much more like it's a game. I borrowed the library I'd written and added to over the years and added that on. I changed using a button for jump to pressing up on the stick because I wanted the button to be for shooting and the mazes needed an up and down capability. So to highlight this to the player I added a JS1k gamepad logo to the spritesheet which I could use to notify the user. This sprite ended up becoming a power up which gives invulnerability for a short time, whilst in this mode the player emits a lot of particles.

I started adding some polish to the game towards the end, such as an intro screen, an in-between levels screen and a completion screen. This is something that some of my previous entries to JS13k didn't do very well, so I wanted to improve upon. The pop-up message boxes are something I ended up really liking. I used these for hints in the trainer level and to let the player know the progress of the bee population.

I did other improvements to the game engine libraries I'd previously written including timelines so I could make more use of them in animation and game progression. Plus I decided to target a new platform this year in the form of web monetization. I don't know much about this or how it worked, but the lure of swag got me going. I looked at some entries in this category from previous years and went ahead and set up all the accounts and got a payment pointer to add to the header.

I did have a week holiday camping with my kids in the middle of JS13k and this took a lot of dev time away. I did try to do some coding in the tent but ultimately I failed and ended up going to bed when the kids did. Still it was a welcome break. Plus I have 2 family birthdays (including my own) in the middle of JS13k which also gives a welcome break.

Allowing the player to be hurt (like my first platformer) seemed a good mechanic so I added that in, with the player flashing whilst hurt and unable to jump. The Zombees also steal your gun when they hit you and that was something else which I liked as it meant you often had to go and get it back.

Given the space dwindling towards the end, the last few levels are quite sparse and focus mostly on jumping between platforms, including some that require coyote-time jumps to be able to make it. One piece of feedback I had from my previous 2D game was that the difficulty started quite hard and got harder. So with the re-arragement of levels to ramp up difficulty and the addition of hints and messages I hope it's a more enjoyable experience.

Music and sound for me are something else which adds to the game experience, I originally intended to use jsfxr for sound effects as I had done previously but bailed on this due to space. Instead I added a music track which is based on the harp solo from the Blue Danube. It sounds pretty peaceful and graceful, but does get a little repetitive after a while though.

I thoroughly enjoyed making my entry this year, and look forward to playing and voting on all the other entries, not to mention entering again next year!
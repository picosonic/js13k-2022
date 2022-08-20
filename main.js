// JS 13k 2022 entry

// Global constants
const XMAX=320;
const YMAX=180;
const TILESIZE=16;
const TILESPERROW=10;
const BGCOLOUR="rgb(252, 223, 205)";

const STATEINTRO=0;
const STATEMENU=1;
const STATEPLAYING=2;
const STATECOMPLETE=3;

const KEYNONE=0;
const KEYLEFT=1;
const KEYUP=2;
const KEYRIGHT=4;
const KEYDOWN=8;
const KEYACTION=16;

const HEALTHFLY=10;
const HEALTHGRUB=5;
const HEALTHPLANT=2;
const GROWTIME=(15*60); // Time to grow plant from small to big

const SPAWNTIME=(8*60); // Time between spawns

const STARTED=new Date(); // Time at which the game was started

// Tiles list
//
// blanks
//   0, 10, 14, 17
// clouds
//   1, 2 (big)
//   11 (small)
//   12 (double)
// lines
//  3 (top left)
//  4 (top)
//  5 (top right)
//  13 (left)
//  15 (right)
//  6 (earth top left)
//  7 (earth top)
//  8 (earth top right)
//  9 (small top fade)
//  16 (left fade)
//  18 (right fade)
//  19 (small top)
//  20 (thick top 1)
//  21 (thick top 2)
//  22 (thick top 3)
//  23 (bottom left)
//  24 (bottom right)
//  25 (earth bottom left)
//  26 (earth bottom right)
//  27 (top left fade)
//  28 (top right fade)
//  29 (small bottom fade)
// toadstool
//   30 (tall)
//   31 (short)
// flower
//   32 (double)
//   33
// plant
//   34 (double)
//   35 (tall)
// hive
//   36
//   37 (broken)
// tree
//   38 (big crown)
//   39 (dual branch)
//   47 (branch left)
//   48 (trunk)
//   49 (branch right)
//   57 (root left)
//   58 (root)
//   59 (root right)
// gun
//   50
// bee
//   51, 52
// fly
//   53, 54
// grub
//   55, 56
// player
//   40, 41, 42 (with gun)
//   45, 46
// muzzle flash
//   43
// projectile
//   44

// Game state
var gs={
  // animation frame of reference
  step:(1/60), // target step time @ 60 fps
  acc:0, // accumulated time since last frame
  lasttime:0, // time of last frame

  // physics in pixels per frame @ 60fps
  gravity:0.25,
  terminalvelocity:10,
  friction:1,

  // Canvas
  canvas:null, // Tiles
  ctx:null,
  scanvas:null, // Sprites
  sctx:null,
  scale:1, // Changes when resizing window

  // Tilemap image
  tilemap:null,

  // Main character
  keystate:KEYNONE,
  x:0, // x position
  y:0, // y position
  px:0, // previous x position
  py:0, // previous y position
  sx:0, // start x position (for current level)
  sy:0, // start y position (for current level)
  vs:0, // vertical speed
  hs:0, // horizontal speed
  jump:false, // jumping
  fall:false, // falling
  duck:false, // ducking (for defence)
  htime:0, // hurt timer following enemy collision
  dir:0, //direction (-1=left, 0=none, 1=right)
  hsp:1, // max horizontal speed
  vsp:1, // max vertical speed
  speed:2, // walking speed
  jumpspeed:5, // jumping speed
  coyote:0, // coyote timer (time after leaving ground where you can still jump)
  life:100, // remaining "life force" as percentage
  tileid:45, // current player tile
  flip:false, // if player is horizontally flipped
  gun:false, // if the player holds the gun
  shots:[], // an array of shots from the gun
  gunheat:0, // countdown to next shot

  // Level attributes
  level:0, // Level number (0 based)
  width:0, // Width in tiles
  height:0, // height in tiles
  xoffset:0, // current view offset from left
  yoffset:0, // current view offset from top
  topdown:false, // is the level in top-down mode, otherwise it's 2D platformer
  spawntime:SPAWNTIME, // time in frames until next spawn event

  // Tiles
  tiles:[], // copy of current level (to allow destruction)

  // Characters
  chars:[],
  anim:8, // time until next character animation frame

  // Particles
  particles:[], // an array of particles for explosion frage, footprint / jump dust

  // Game state
  state:2, // state machine, 0=intro, 1=menu, 2=playing, 3=complete

  // Debug flag
  debug:false
};

// Clear keyboard input state
function clearinputstate()
{
  gs.keystate=KEYNONE;
}

// Check if an input is set in keyboard input state
function ispressed(keybit)
{
  return ((gs.keystate&keybit)!=0);
}

// Update the player key state
function updatekeystate(e, dir)
{
  var a=rng(); // advance rng

  switch (e.code)
  {
    case "ArrowLeft": // cursor left
    case "KeyA": // A
    case "KeyZ": // Z
      if (dir==1)
        gs.keystate|=KEYLEFT;
      else
        gs.keystate&=~KEYLEFT;

      e.preventDefault();
      break;

    case "ArrowUp": // cursor up
    case "KeyW": // W
    case "Semiolon": // semicolon
      if (dir==1)
        gs.keystate|=KEYUP;
      else
        gs.keystate&=~KEYUP;

      e.preventDefault();
      break;

    case "ArrowRight": // cursor right
    case "KeyD": // D
    case "KeyX": // X
      if (dir==1)
        gs.keystate|=KEYRIGHT;
      else
        gs.keystate&=~KEYRIGHT;

      e.preventDefault();
      break;

    case "ArrowDown": // cursor down
    case "KeyS": // S
    case "Period": // dot
      if (dir==1)
        gs.keystate|=KEYDOWN;
      else
        gs.keystate&=~KEYDOWN;

      e.preventDefault();
      break;

    case "Enter": // enter
    case "ShiftLeft": // L shift
    case "ShiftRight": // R shift
    case "Space": // space
      if (dir==1)
        gs.keystate|=KEYACTION;
      else
        gs.keystate&=~KEYACTION;

      e.preventDefault();
      break;

    case 73: // I (for info/debug)
      if (dir==1)
        gs.debug=(!gs.debug);

      e.preventDefault();
      break;

    default:
      break;
  }
}

// Handle resize events
function playfieldsize()
{
  var height=window.innerHeight;
  var ratio=XMAX/YMAX;
  var width=Math.floor(height*ratio);
  var top=0;
  var left=Math.floor((window.innerWidth/2)-(width/2));

  if (width>window.innerWidth)
  {
    width=window.innerWidth;
    ratio=YMAX/XMAX;
    height=Math.floor(width*ratio);

    left=0;
    top=Math.floor((window.innerHeight/2)-(height/2));
  }
  
  gs.scale=(height/YMAX);

  // Tiles
  gs.canvas.style.top=top+"px";
  gs.canvas.style.left=left+"px";
  gs.canvas.style.transformOrigin='0 0';
  gs.canvas.style.transform='scale('+gs.scale+')';

  // Sprites
  gs.scanvas.style.top=top+"px";
  gs.scanvas.style.left=left+"px";
  gs.scanvas.style.transformOrigin='0 0';
  gs.scanvas.style.transform='scale('+gs.scale+')';
}

// Draw tile
function drawtile(tileid, x, y)
{
  // Don't draw tile 0 (background)
  if (tileid==0) return;

  // Clip to what's visible
  if (((x-gs.xoffset)<-TILESIZE) && // clip left
      ((x-gs.xoffset)>XMAX) && // clip right
      ((y-gs.yoffset)<-TILESIZE) && // clip top
      ((y-gs.yoffset)>YMAX))   // clip bottom
    return;

  // to draw flipped
  //
  // gs.ctx.save();
  // gs.ctx.scale(-1, 1);
  // gs.ctx.drawImage(gs.tilemap, (tileid*tilesize) % (tilesperrow*tilesize), Math.floor((tileid*tilesize) / (tilesperrow*tilesize))*tilesize, tilesize, tilesize, x*-1, y, tilesize*-1, tilesize);
  // gs.ctx.restore();

  gs.ctx.drawImage(gs.tilemap, (tileid*TILESIZE) % (TILESPERROW*TILESIZE), Math.floor((tileid*TILESIZE) / (TILESPERROW*TILESIZE))*TILESIZE, TILESIZE, TILESIZE, x-gs.xoffset, y-gs.yoffset, TILESIZE, TILESIZE);
}

// Draw sprite
function drawsprite(sprite)
{
  // Clip to what's visible
  if (((Math.floor(sprite.x)-gs.xoffset)<-TILESIZE) && // clip left
      ((Math.floor(sprite.x)-gs.xoffset)>XMAX) && // clip right
      ((Math.floor(sprite.y)-gs.yoffset)<-TILESIZE) && // clip top
      ((Math.floor(sprite.y)-gs.yoffset)>YMAX))   // clip bottom
    return;

  if (sprite.flip)
  {
   gs.sctx.save();
   gs.sctx.scale(-1, 1);
   gs.sctx.drawImage(gs.tilemap, (sprite.id*TILESIZE) % (TILESPERROW*TILESIZE), Math.floor((sprite.id*TILESIZE) / (TILESPERROW*TILESIZE))*TILESIZE, TILESIZE, TILESIZE,
      (Math.floor(sprite.x)-gs.xoffset)*-1, (Math.floor(sprite.y)-gs.yoffset), TILESIZE*-1, TILESIZE);
   gs.sctx.restore();
  }
  else
    gs.sctx.drawImage(gs.tilemap, (sprite.id*TILESIZE) % (TILESPERROW*TILESIZE), Math.floor((sprite.id*TILESIZE) / (TILESPERROW*TILESIZE))*TILESIZE, TILESIZE, TILESIZE,
      Math.floor(sprite.x)-gs.xoffset, Math.floor(sprite.y)-gs.yoffset, TILESIZE, TILESIZE);
}

// Sort the chars so sprites are last (so they appear in front of non-solid tiles)
function sortChars(a, b)
{
  if (a.id!=b.id) // extra processing if they are different ids
  {
    var aspr=(((a.id>=40) && (a.id<=46)) || ((a.id>=50) && (a.id<=56))); // see if a is a sprite
    var bspr=(((b.id>=40) && (b.id<=46)) || ((b.id>=50) && (b.id<=56))); // see if b is a sprite

    if (aspr==bspr) return 0; // both sprites, so don't swap

    if (aspr)
      return 1; // sort a after b
    else
      return -1; // sort a before b
  }

  return 0; // same id
}

// Load level
function loadlevel(level)
{
  gs.level=level;

  // Deep copy tiles list to allow changes
  gs.tiles=JSON.parse(JSON.stringify(levels[gs.level].tiles));

  gs.width=parseInt(levels[gs.level].width, 10);
  gs.height=parseInt(levels[gs.level].height, 10);

  gs.chars=[];

  // Populate chars (non solid tiles)
  for (var y=0; y<gs.height; y++)
  {
    for (var x=0; x<gs.width; x++)
    {
      var tile=parseInt(levels[gs.level].chars[(y*gs.width)+x]||0, 10);

      if (tile!=0)
      {
        var obj={id:(tile-1), x:(x*TILESIZE), y:(y*TILESIZE), flip:false, hs:0, vs:0, dwell:0, del:false};

        switch (tile-1)
        {
          case 40: // Player
          case 41:
          case 42:
          case 45:
          case 46:
            gs.x=obj.x; // Set current position
            gs.y=obj.y;

            gs.sx=obj.x; // Set start position
            gs.sy=obj.y;

            gs.vs=0; // Start not moving
            gs.hs=0;
            gs.jump=false;
            gs.fall=false;
            gs.dir=0;
            gs.flip=false;
            gs.gun=false;
            gs.shots=[];
            gs.gunheat=0;
            gs.particles=[];
            gs.topdown=false;
            gs.spawntime=SPAWNTIME;
            break;

          case 30: // toadstool
          case 31:
            obj.health=HEALTHPLANT;
            obj.growtime=GROWTIME;
            gs.chars.push(obj);
            break;

          case 32: // flower
          case 33:
            obj.health=HEALTHPLANT;
            obj.growtime=GROWTIME;
            gs.chars.push(obj);
            break;

          case 53: // fly
          case 54:
            obj.health=HEALTHFLY;
            gs.chars.push(obj);
            break;

          case 55: // grub
          case 56:
            obj.health=HEALTHGRUB;
            obj.hs=(rng()<0.5)?0.25:-0.25;
            obj.flip=(obj.hs<0);
            gs.chars.push(obj);
            break;

          default:
            gs.chars.push(obj); // Everything else
            break;
        }
      }
    }
  }

  // Sort chars such sprites are at the end (so are drawn last, i.e on top)
  gs.chars.sort(sortChars);

  scrolltoplayer(false);
}

// Draw level
function drawlevel()
{
  for (var y=0; y<gs.height; y++)
  {
    for (var x=0; x<gs.width; x++)
    {
      var tile=parseInt(gs.tiles[(y*gs.width)+x]||1, 10);
      drawtile(tile-1, x*TILESIZE, y*TILESIZE);
    }
  }

  write(gs.ctx, 10, 10, "Level "+(gs.level+1), 1, "rgb(0,0,0)");
}

// Draw chars
function drawchars()
{
  for (var id=0; id<gs.chars.length; id++)
    drawsprite(gs.chars[id]);
}

// Draw shots
function drawshots()
{
  for (var i=0; i<gs.shots.length; i++)
  {
    if (gs.shots[i].ttl<35)
      drawsprite(gs.shots[i]); // normal
    else
      drawsprite({id:43, x:gs.shots[i].x, y:gs.shots[i].y, flip:gs.shots[i].flip}); // muzzle flash
  }
}

// Draw single particle
function drawparticle(particle)
{
  var x=particle.x+(particle.t*Math.cos(particle.ang));
  var y=particle.y+(particle.t*Math.sin(particle.ang));

  // Clip to what's visible
    if (((Math.floor(x)-gs.xoffset)<0) && // clip left
    ((Math.floor(x)-gs.xoffset)>XMAX) && // clip right
    ((Math.floor(y)-gs.yoffset)<0) && // clip top
    ((Math.floor(y)-gs.yoffset)>YMAX))   // clip bottom
  return;

  gs.ctx.fillStyle="rgba("+particle.r+","+particle.g+","+particle.b+","+particle.a+")";
  gs.ctx.fillRect(Math.floor(x)-gs.xoffset, Math.floor(y)-gs.yoffset, 1, 1);
}

// Draw particles
function drawparticles()
{
  for (var i=0; i<gs.particles.length; i++)
    drawparticle(gs.particles[i]);
}

// Check if player has left the map
function offmapcheck()
{
  if ((gs.x<(0-TILESIZE)) || ((gs.x+1)>gs.width*TILESIZE) || (gs.y>gs.height*TILESIZE))
  {
    gs.x=gs.sx;
    gs.y=gs.sy;

    scrolltoplayer(false);
  }
}

// Check if area a overlaps with area b
function overlap(ax, ay, aw, ah, bx, by, bw, bh)
{
  // Check horizontally
  if ((ax<bx) && ((ax+aw))<=bx) return false; // a too far left of b
  if ((ax>bx) && ((bx+bw))<=ax) return false; // a too far right of b

  // Check vertically
  if ((ay<by) && ((ay+ah))<=by) return false; // a too far above b
  if ((ay>by) && ((by+bh))<=ay) return false; // a too far below b

  return true;
}

function collide(px, py, pw, ph)
{
  // Check for screen edge collision
  if (px<=(0-(TILESIZE/5))) return true;
  if ((px+(TILESIZE/3))>=(gs.width*TILESIZE)) return true;

  // Look through all the tiles for a collision
  for (var y=0; y<gs.height; y++)
  {
    for (var x=0; x<gs.width; x++)
    {
      var tile=parseInt(gs.tiles[(y*gs.width)+x]||1, 10);

      if ((tile-1)!=0)
      {
        if (overlap(px, py, pw, ph, x*TILESIZE, y*TILESIZE, TILESIZE, TILESIZE))
          return true;
      }
    }
  }

  return false;
}

// Collision check with player hitbox
function playercollide(x, y)
{
  return collide(x+(TILESIZE/3), y+((TILESIZE/5)*2), TILESIZE/3, (TILESIZE/5)*3);
}

// Check if player on the ground or falling
function groundcheck()
{
  // Check for coyote time
  if (gs.coyote>0)
    gs.coyote--;

  // Check we are on the ground
  if (playercollide(gs.x, gs.y+1))
  {
    gs.vs=0;
    gs.jump=false;
    gs.fall=false;
    gs.coyote=15;

    // Check for jump pressed, when not ducking
    if ((ispressed(KEYUP)) && (!gs.duck))
    {
      gs.jump=true;
      gs.vs=-gs.jumpspeed;
    }
  }
  else
  {
    // Check for jump pressed, when not ducking, and coyote time not expired
    if ((ispressed(KEYUP)) && (!gs.duck) && (gs.jump==false) && (gs.coyote>0))
    {
      gs.jump=true;
      gs.vs=-gs.jumpspeed;
    }

    // We're in the air, increase falling speed until we're at terminal velocity
    if (gs.vs<gs.terminalvelocity)
      gs.vs+=gs.gravity;

    // Set falling flag when vertical speed is positive
    if (gs.vs>0)
      gs.fall=true;
  }
}

// Process jumping
function jumpcheck()
{
  // When jumping ..
  if (gs.jump)
  {
    // Check if loosing altitude
    if (gs.vs>=0)
    {
      gs.jump=false;
      gs.fall=true;
    }
  }
}

// Move player by appropriate amount, up to a collision
function collisioncheck()
{
  // Check for horizontal collisions
  if ((gs.hs!=0) && (playercollide(gs.x+gs.hs, gs.y)))
  {
    // A collision occured, so move the character until it hits
    while (!playercollide(gs.x+(gs.hs>0?1:-1), gs.y))
      gs.x+=(gs.hs>0?1:-1);

    // Stop horizontal movement
    gs.hs=0;
  }
  gs.x+=Math.floor(gs.hs);

  // Check for vertical collisions
  if ((gs.vs!=0) && (playercollide(gs.x, gs.y+gs.vs)))
  {
    // A collision occured, so move the character until it hits
    while (!playercollide(gs.x, gs.y+(gs.vs>0?1:-1)))
      gs.y+=(gs.vs>0?1:-1);

    // Stop vertical movement
    gs.vs=0;
  }
  gs.y+=Math.floor(gs.vs);
}

// If no input detected, slow the player using friction
function standcheck()
{
  // Check for ducking, or injured
  if ((ispressed(KEYDOWN)) || (gs.htime>0))
    gs.duck=true;
  else
    gs.duck=false;

  // When no horizontal movement pressed, slow down by friction
  if (((!ispressed(KEYLEFT)) && (!ispressed(KEYRIGHT))) ||
      ((ispressed(KEYLEFT)) && (ispressed(KEYRIGHT))))
  {
    // Going left
    if (gs.dir==-1)
    {
      if (gs.hs<0)
      {
        gs.hs+=gs.friction;
      }
      else
      {
        gs.hs=0;
        gs.dir=0;
      }
    }

    // Going right
    if (gs.dir==1)
    {
      if (gs.hs>0)
      {
        gs.hs-=gs.friction;
      }
      else
      {
        gs.hs=0;
        gs.dir=0;
      }
    }
  }

  // Extra checks for top-down levels
  if (gs.topdown)
  {
    // When no horizontal movement pressed, slow down by friction
    if (((!ispressed(KEYUP)) && (!ispressed(KEYDOWN))) ||
    ((ispressed(KEYUP)) && (ispressed(KEYDOWN))))
    {
      // Going up
      if (gs.vs<0)
      {
        gs.vs+=gs.friction;
      }

      // Going down
      if (gs.vs>0)
      {
        gs.vs-=gs.friction;
      }
    }
  }
}

// Move animation frame onwards
function updateanimation()
{
  if (gs.anim==0)
  {
    // Player animation
    if ((gs.hs!=0) || ((gs.topdown) && (gs.vs!=0)))
    {
      if (gs.gun)
      {
        gs.tileid++;

        if (gs.tileid>42)
          gs.tileid=40;
      }
      else
        gs.tileid==45?gs.tileid=46:gs.tileid=45;
    }
    else
    {
      if (gs.gun)
        gs.tileid=40;
      else
        gs.tileid=45;
    }

    // Char animation
    for (var id=0; id<gs.chars.length; id++)
    {
      switch (gs.chars[id].id)
      {
        case 51:
          gs.chars[id].id=52;
          break;

        case 52:
          gs.chars[id].id=51;
          break;

        case 53:
          gs.chars[id].id=54;
          break;

        case 54:
          gs.chars[id].id=53;
          break;

        case 55:
          gs.chars[id].id=56;
          break;

        case 56:
          gs.chars[id].id=55;
          break;

        default:
          break;
      }
    }

    gs.anim=8;
  }
  else
    gs.anim--;
}

// Generate some particles around an origin
function generateparticles(cx, cy, mt, count, r, g, b)
{
  for (var i=0; i<count; i++)
  {
    var ang=(Math.floor(rng()*360)); // angle to eminate from
    var t=Math.floor(rng()*mt); // travel from centre

    gs.particles.push({x:cx, y:cy, ang:ang, t:t, r:r, g:g, b:b, a:1.0});
  }
}

// Do processing for gun
function guncheck()
{
  var i;

  // Cool gun down
  if (gs.gunheat>0) gs.gunheat--;

  // Check for having gun and want to use it
  if ((gs.gun==true) && (gs.gunheat==0) && (gs.keystate!=KEYNONE) && (ispressed(KEYACTION)))
  {
    var velocity=(gs.flip?-5:5);
    var shot={x:gs.x+velocity, y:gs.y+3, dir:velocity, flip:gs.flip, ttl:40, id:44, del:false};

    gs.shots.push(shot);

    gs.gunheat=10; // Set time until next shot
  }

  // Move shots onwards / check for collisions
  for (i=0; i<gs.shots.length; i++)
  {
    // Move shot onwards
    gs.shots[i].x+=gs.shots[i].dir;

    // Check shot collisions
    for (var id=0; id<gs.chars.length; id++)
    {
      // Check for collision with this char
      if ((gs.shots[i].dir!=0) && (overlap(gs.shots[i].x, gs.shots[i].y, TILESIZE, TILESIZE, gs.chars[id].x, gs.chars[id].y, TILESIZE, TILESIZE)))
      {
        switch (gs.chars[id].id)
        {
          case 30: // toadstool
          case 31:
            gs.chars[id].health--;
            if (gs.chars[id].health<=0)
            {
              if (gs.chars[id].id==30) // If it's tall, change to small toadstool
              {
                gs.chars[id].health=HEALTHPLANT;
                gs.chars[id].growtime=GROWTIME;
                gs.chars[id].id=31;
              }
              else
                gs.chars[id].del=true;
            }

            generateparticles(gs.chars[id].x+(TILESIZE/2), gs.chars[id].y+(TILESIZE/2), 8, (gs.chars[id].health<=0)?16:2, 252, 104, 59);

            gs.shots[i].dir=0;
            gs.shots[i].ttl=3;
            break;

          case 53: // fly
          case 54:
            gs.chars[id].health--;
            if (gs.chars[id].health<=0)
              gs.chars[id].del=true;

            generateparticles(gs.chars[id].x+(TILESIZE/2), gs.chars[id].y+(TILESIZE/2), 16, (gs.chars[id].health<=0)?32:4, 44, 197, 246);

            gs.shots[i].dir=0;
            gs.shots[i].ttl=3;
            break;

          case 55: // grub
          case 56:
            gs.chars[id].health--;
            if (gs.chars[id].health<=0)
              gs.chars[id].del=true;

            generateparticles(gs.chars[id].x+(TILESIZE/2), gs.chars[id].y+(TILESIZE/2), 16, (gs.chars[id].health<=0)?32:4, 252, 104, 59);

            gs.shots[i].dir=0;
            gs.shots[i].ttl=3;
            break;

          default:
            break;
        }
      }
    }

    // Decrease time-to-live, mark for deletion when expired
    gs.shots[i].ttl--;
    if (gs.shots[i].ttl<=0) gs.shots[i].del=true;
  }

  // Remove shots marked for deletion
  i=gs.shots.length;
  while (i--)
  {
    if (gs.shots[i].del)
      gs.shots.splice(i, 1);
  }
}

// Do processing for particles
function particlecheck()
{
  var i=0;

  // Process particles
  for (i=0; i<gs.particles.length; i++)
  {
    // Move particle
    gs.particles[i].t+=0.5;
    gs.particles[i].y+=(gs.gravity*2);

    // Decay particle
    gs.particles[i].a-=0.007;
  }

  // Remove particles which have decayed
  i=gs.particles.length;
  while (i--)
  {
    if (gs.particles[i].a<=0)
      gs.particles.splice(i, 1);
  }
}

// Update player movements
function updatemovements()
{
  // Check if player has left the map
  offmapcheck();

  // Only apply 2D physics when not in top-down mode
  if (!gs.topdown)
  {
    // Check if player on the ground or falling
    groundcheck();

    // Process jumping
    jumpcheck();
  }

  // Move player by appropriate amount, up to a collision
  collisioncheck();

  // If no input detected, slow the player using friction
  standcheck();

  // Check for gun usage
  guncheck();

  // Check for particle usage
  particlecheck();

  // When a movement key is pressed, adjust players speed and direction
  if (gs.keystate!=KEYNONE)
  {
    // Left key
    if ((ispressed(KEYLEFT)) && (!ispressed(KEYRIGHT)))
    {
      gs.hs=gs.htime==0?-gs.speed:-2;
      gs.dir=-1;
      gs.flip=true;
    }

    // Right key
    if ((ispressed(KEYRIGHT)) && (!ispressed(KEYLEFT)))
    {
      gs.hs=gs.htime==0?gs.speed:2;
      gs.dir=1;
      gs.flip=false;
    }

    // Extra processing for top-down levels
    if (gs.topdown)
    {
      // Up key
      if ((ispressed(KEYUP)) && (!ispressed(KEYDOWN)))
      {
        gs.vs=gs.htime==0?-gs.speed:-2;
      }

      // Down key
      if ((ispressed(KEYDOWN)) && (!ispressed(KEYUP)))
      {
        gs.vs=gs.htime==0?gs.speed:2;
      } 
    }
  }

  // Decrease hurt timer
  if (gs.htime>0) gs.htime--;

  // Update any animation frames
  updateanimation();
}

// Check for collision between player and character/collectable
function updateplayerchar()
{
  // Generate player hitbox
  var px=gs.x+(TILESIZE/3);
  var py=gs.y+((TILESIZE/5)*2);
  var pw=(TILESIZE/3);
  var ph=(TILESIZE/5)*3;
  var id=0;

  for (id=0; id<gs.chars.length; id++)
  {
    // Check for collision with this char
    if (overlap(px, py, pw, ph, gs.chars[id].x, gs.chars[id].y, TILESIZE, TILESIZE))
    {
      switch (gs.chars[id].id)
      {
        case 0: // flip between 2D and topdown
          gs.topdown=(gs.vs<0); // pass over moving up for topdown, otherwise 2D
          break;

        case 50: // gun
          gs.gun=true;
          gs.tileid=40;
          gs.chars[id].del=true;
          break;

        default:
          break;
      }
    }
  }

  // Remove anything marked for deletion
  id=gs.chars.length;
  while (id--)
  {
    if (gs.chars[id].del)
      gs.chars.splice(id, 1);
  }
}

function updatecharAI()
{
  var id=0;
  var nx=0; // new x position
  var ny=0; // new y position

  for (id=0; id<gs.chars.length; id++)
  {
    switch (gs.chars[id].id)
    {
      case 31: // toadstool
      case 33: // flower
        gs.chars[id].growtime--;
        if (gs.chars[id].growtime<=0)
          gs.chars[id].id--; // Switch tile to bigger version of plant
        break;

      case 55: // grub
      case 56:
        var eaten=false;

        // Check if overlapping a toadstool, if so stop and eat some
        for (var id2=0; id2<gs.chars.length; id2++)
        {
          if ((((gs.chars[id2].id==30) || (gs.chars[id2].id==31)) && overlap(gs.chars[id].x+(TILESIZE/2), gs.chars[id].y+(TILESIZE/2), 1, 1, gs.chars[id2].x, gs.chars[id2].y, TILESIZE, TILESIZE)))
          {
            if (gs.chars[id].hs!=0)
              gs.chars[id].dwell=(3*60); // wait here for a bit

            gs.chars[id].hs=0; // Stop moving

            gs.chars[id].dwell--;

            if (gs.chars[id].dwell<0)
            {
              gs.chars[id].health++; // Increase grub health

              gs.chars[id2].health--; // Decrease toadstool health
              if (gs.chars[id2].health<=0)
              {
                if (gs.chars[id2].id==30) // If it's tall, change to small toadstool, then eat a bit more
                {
                  gs.chars[id2].health=HEALTHPLANT;
                  gs.chars[id2].growtime=GROWTIME;
                  gs.chars[id2].id=31;

                  gs.chars[id].dwell=(3*60);
                }
                else
                  gs.chars[id2].del=true;
              }
            }

            eaten=true;

            break;
          }
        }

        if (eaten==false)
        {
          if (gs.chars[id].hs==0)
          {
            gs.chars[id].hs=(rng()<0.5)?-0.25:0.25; // Nothing eaten so move onwards
            gs.chars[id].flip=(gs.chars[id].hs<0);

            // If this grub is well fed, turn it into a fly
            if (gs.chars[id].health>(HEALTHGRUB*1.5))
            {
              gs.chars[id].id=53;
              return;
            }
          }

          nx=(gs.chars[id].x+=gs.chars[id].hs); // calculate new x position
          if ((collide(nx, gs.chars[id].y, TILESIZE, TILESIZE)) || // blocked by something
              (
                (!collide(nx+(gs.chars[id].flip?(TILESIZE/2)*-1:(TILESIZE)/2), gs.chars[id].y, TILESIZE, TILESIZE)) && // not blocked forwards
                (!collide(nx+(gs.chars[id].flip?(TILESIZE/2)*-1:(TILESIZE)/2), gs.chars[id].y+(TILESIZE/2), TILESIZE, TILESIZE)) // not blocked forwards+down (i.e. edge)
              ))
          {
            // Turn around
            gs.chars[id].hs*=-1;
            gs.chars[id].flip=!gs.chars[id].flip;
          }
          else
            gs.chars[id].x=nx;
        }
        break;

      default:
        break;
    }
  }
}

// Determine distance (Hypotenuse) between two lengths in 2D space (using Pythagoras)
function calcHypotenuse(a, b)
{
  return(Math.sqrt((a * a) + (b * b)));
}

function checkspawn()
{
  gs.spawntime--;
  if (gs.spawntime<=0)
  {
    var sps=[];

    // Create list of all possible spawn points
    for (var y=1; y<gs.height; y++)
    {
      for (var x=0; x<gs.width; x++)
      {
        var tile=parseInt(gs.tiles[(y*gs.width)+x]||1, 10);
        var tileabove=parseInt(gs.tiles[((y-1)*gs.width)+x]||1, 10);
        var skip=false;

        // Must be above flat edge
        switch (tile-1)
        {
          case 3:
          case 4:
          case 5:
          case 6:
          case 7:
          case 8:
          case 9:
          case 19:
          case 20:
          case 21:
          case 22:
          case 27:
          case 28:
            // Must have no tile above it
            if ((tileabove-1)==0)
            {
              // Must be certain distance away from all other chars
              for (var id=0; id<gs.chars.length; id++)
              {
                if (calcHypotenuse(Math.abs((x*TILESIZE)-gs.chars[id].x), Math.abs((y*TILESIZE)-gs.chars[id].y))<(2*TILESIZE))
                  skip=true;
              }

              // Add to list of potential spawn points
              if (!skip)
                sps.push({x:x, y:y-1});
            }
            break;

          default:
            break;
        }
      }
    }

    if (sps.length>0)
    {
      var spid=Math.floor(rng()*sps.length); // Pick random spawn point from list
      var spawnid=(rng()<0.5)?31:33; // Pick randomly between flowers and toadstools

      // Add spawned item to front of chars
      gs.chars.unshift({id:spawnid, x:(sps[spid].x*TILESIZE), y:(sps[spid].y*TILESIZE), flip:false, hs:0, vs:0, health:HEALTHPLANT, growtime:GROWTIME, del:false});
    }

    gs.spawntime=SPAWNTIME; // Set up for next spawn check
  }
}

// Update function called once per frame
function update()
{
  var a=rng(); // advance rng

  // Apply keystate/physics to player
  updatemovements();

  // Update other character movements / AI
  updatecharAI();

  // Check for player/character/collectable collisions
  updateplayerchar();

  // Check for spawn event
  checkspawn();
}

// Scroll level to player
function scrolltoplayer(dampened)
{
  var xmiddle=Math.floor((XMAX-TILESIZE)/2);
  var ymiddle=Math.floor((YMAX-TILESIZE)/2);
  var maxxoffs=((gs.width*TILESIZE)-XMAX);
  var maxyoffs=((gs.height*TILESIZE)-YMAX);

  // Work out where x and y offsets should be
  var newxoffs=gs.x-xmiddle;
  var newyoffs=gs.y-ymiddle;

  if (newxoffs>maxxoffs) newxoffs=maxxoffs;
  if (newyoffs>maxyoffs) newyoffs=maxyoffs;

  if (newxoffs<0) newxoffs=0;
  if (newyoffs<0) newyoffs=0;

  // Determine if xoffset should be changed
  if (newxoffs!=gs.xoffset)
  {
    if (dampened)
    {
      var xdelta=1;

      if (Math.abs(gs.xoffset-newxoffs)>(XMAX/5)) xdelta=4;

      gs.xoffset+=newxoffs>gs.xoffset?xdelta:-xdelta;
    }
    else
      gs.xoffset=newxoffs;
  }

  // Determine if xoffset should be changed
  if (newyoffs!=gs.yoffset)
  {
    if (dampened)
    {
      var ydelta=1;

      if (Math.abs(gs.yoffset-newyoffs)>(YMAX/5)) ydelta=4;

      gs.yoffset+=newyoffs>gs.yoffset?ydelta:-ydelta;
    }
    else
      gs.yoffset=newyoffs;
  }
}

// Redraw the game world
function redraw()
{
  // Scroll to keep player in view
  scrolltoplayer(true);

  // Clear the tile canvas
  gs.ctx.fillStyle=BGCOLOUR;
  gs.ctx.fillRect(0, 0, gs.canvas.width, gs.canvas.height);

  // Draw the level
  drawlevel();

  // Clear the sprites canvas
  gs.sctx.clearRect(0, 0, gs.scanvas.width, gs.scanvas.height);

  // Draw the chars
  drawchars();

  // Draw the player
  drawsprite({id:gs.tileid, x:gs.x, y:gs.y, flip:gs.flip});

  // Draw the shots
  drawshots();

  // Draw the particles
  drawparticles();
}

// Request animation frame callback
function rafcallback(timestamp)
{
  // First time round, just save epoch
  if (gs.lasttime>0)
  {
    // Determine accumulated time since last call
    gs.acc+=((timestamp-gs.lasttime) / 1000);

    // If it's more than 15 seconds since last call, reset
    if ((gs.acc>gs.step) && ((gs.acc/gs.step)>(60*15)))
      gs.acc=gs.step*2;

    // Process "steps" since last call
    while (gs.acc>gs.step)
    {
      update();
      gs.acc-=gs.step;
    }

    redraw();

    // If the update took us out of play state then stop now
    if (gs.state!=STATEPLAYING)
      return;
  }

  // Remember when we were last called
  gs.lasttime=timestamp;

  // Request we are called on the next frame, but only if still playing
  if (gs.state==STATEPLAYING)
    window.requestAnimationFrame(rafcallback);
}

// Entry point
function init()
{
  // Initialise stuff
  document.onkeydown=function(e)
  {
    e = e || window.event;
    updatekeystate(e, 1);
  };

  document.onkeyup=function(e)
  {
    e = e || window.event;
    updatekeystate(e, 0);
  };

  // Stop things from being dragged around
  window.ondragstart=function(e)
  {
    e = e || window.event;
    e.preventDefault();
  };

  // Set up tiles canvas
  gs.canvas=document.getElementById("tiles");
  gs.ctx=gs.canvas.getContext("2d");

  // Set up sprites canvas
  gs.scanvas=document.getElementById("sprites");
  gs.sctx=gs.scanvas.getContext("2d");

  window.addEventListener("resize", function() { playfieldsize(); });

  playfieldsize();

  // Add a bit of entropy to the rng
  var ms=STARTED.getMilliseconds()+STARTED.getSeconds();
  while (ms>=0)
  {
    var a=rng(); // advance rng
    ms--;
  }

  gs.tilemap=new Image;
  gs.tilemap.onload=function() {loadlevel(0); window.requestAnimationFrame(rafcallback);};
  gs.tilemap.src=tilemap;
}

// Run the init() once page has loaded
window.onload=function() { init(); };

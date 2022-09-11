// JS 13k 2022 entry

// Global constants
const XMAX=320;
const YMAX=180;
const TILESIZE=16;
const TILESPERROW=10;
const BGCOLOUR="rgb(252,223,205)";

const STATEINTRO=0;
const STATEMENU=1;
const STATEPLAYING=2;
const STATENEWLEVEL=3;
const STATECOMPLETE=4;

const KEYNONE=0;
const KEYLEFT=1;
const KEYUP=2;
const KEYRIGHT=4;
const KEYDOWN=8;
const KEYACTION=16;

const HEALTHZOMBEE=10;
const HEALTHGRUB=5;
const HEALTHPLANT=2;
const GROWTIME=(15*60); // Time to grow plant from small to big
const SPEEDBEE=0.5;
const SPEEDZOMBEE=0.25;
const SPEEDGRUB=0.25;

const SPAWNTIME=(8*60); // Time between spawns
const MAXFLIES=15;
const MAXBEES=20;

// Tiles list
//
// blanks
//   14, 17
// switcheroo
//   0
// JS13k logo
//   10
// clouds
//   1, 2 (big)
//   11 (small)
//   12 (double)
// lines
//   3 (top left)
//   4 (top)
//   5 (top right)
//   13 (left)
//   15 (right)
//   6 (earth top left)
//   7 (earth top)
//   8 (earth top right)
//   9 (small top fade)
//   16 (left fade)
//   18 (right fade)
//   19 (small top)
//   20 (thick top 1)
//   21 (thick top 2)
//   22 (thick top 3)
//   23 (bottom left)
//   24 (bottom right)
//   25 (earth bottom left)
//   26 (earth bottom right)
//   27 (top left fade)
//   28 (top right fade)
//   29 (small bottom fade)
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
// zombee
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
  fps:0, // current FPS
  frametimes:[], // array of frame times

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
  tilemapflip:null,

  // Main character
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
  xoffset:0, // current view offset from left (horizontal scroll)
  yoffset:0, // current view offset from top (vertical scroll)
  topdown:false, // is the level in top-down mode, otherwise it's 2D platformer
  spawntime:SPAWNTIME, // time in frames until next spawn event

  // Input
  keystate:KEYNONE,
  padstate:KEYNONE,
  gamepadbuttons:[], // Button mapping
  gamepadaxes:[], // Axes mapping
  gamepadaxesval:[], // Axes values

  // Tiles
  tiles:[], // copy of current level (to allow destruction)

  // Characters
  chars:[],
  anim:8, // time until next character animation frame

  // Particles
  particles:[], // an array of particles for explosion frage, footprint / jump dust

  // Parallax
  parallax:[], // an array of particles placed at random x, y, z

  // Game state
  state:STATEINTRO, // state machine, 0=intro, 1=menu, 2=playing, 3=complete

  // Timeline for animation
  timeline:new timelineobj(),

  // Messagebox popup
  msgboxtext:"", // text to show in current messagebox
  msgboxtime:0, // timer for showing current messagebox
  msgqueue:[],// Message box queue

  // Debug flag
  debug:false,

  // True when music has been started (by user interaction)
  music:false 
};

// Random number generator
function rng()
{
  return Math.random();
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

  gs.ctx.drawImage(gs.tilemap, (tileid*TILESIZE) % (TILESPERROW*TILESIZE), Math.floor((tileid*TILESIZE) / (TILESPERROW*TILESIZE))*TILESIZE, TILESIZE, TILESIZE, x-gs.xoffset, y-gs.yoffset, TILESIZE, TILESIZE);
}

// Draw sprite
function drawsprite(sprite)
{
  // Don't draw sprite 0 (background)
  if (sprite.id==0) return;

  // Clip to what's visible
  if (((Math.floor(sprite.x)-gs.xoffset)<-TILESIZE) && // clip left
      ((Math.floor(sprite.x)-gs.xoffset)>XMAX) && // clip right
      ((Math.floor(sprite.y)-gs.yoffset)<-TILESIZE) && // clip top
      ((Math.floor(sprite.y)-gs.yoffset)>YMAX))   // clip bottom
    return;

  if (sprite.flip)
  /*
  {
   gs.sctx.save();
   gs.sctx.scale(-1, 1);
   gs.sctx.drawImage(gs.tilemap, (sprite.id*TILESIZE) % (TILESPERROW*TILESIZE), Math.floor((sprite.id*TILESIZE) / (TILESPERROW*TILESIZE))*TILESIZE, TILESIZE, TILESIZE,
      (Math.floor(sprite.x)-gs.xoffset)*-1, (Math.floor(sprite.y)-gs.yoffset), TILESIZE*-1, TILESIZE);
   gs.sctx.restore();
  }
  */
    gs.sctx.drawImage(gs.tilemapflip, ((TILESPERROW*TILESIZE)-((sprite.id*TILESIZE) % (TILESPERROW*TILESIZE)))-TILESIZE, Math.floor((sprite.id*TILESIZE) / (TILESPERROW*TILESIZE))*TILESIZE, TILESIZE, TILESIZE,
      Math.floor(sprite.x)-gs.xoffset, Math.floor(sprite.y)-gs.yoffset, TILESIZE, TILESIZE);
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
  // Make sure it exists
  if ((level>=0) && (levels.length-1<level)) return;

  // Set current level to new one
  gs.level=level;

  // Deep copy tiles list to allow changes
  gs.tiles=JSON.parse(JSON.stringify(levels[gs.level].tiles));

  // Get width/height of new level
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
        var obj={id:(tile-1), x:(x*TILESIZE), y:(y*TILESIZE), flip:false, hs:0, vs:0, dwell:0, htime:0, del:false};

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
            obj.growtime=(GROWTIME+Math.floor(rng()*120));
            gs.chars.push(obj);
            break;

          case 32: // flower
          case 33:
            obj.health=HEALTHPLANT;
            obj.growtime=(GROWTIME+Math.floor(rng()*120));
            gs.chars.push(obj);
            break;

          case 53: // zombee
          case 54:
            obj.health=HEALTHZOMBEE;
            obj.pollen=0;
            obj.dx=-1;
            obj.dy=-1;
            obj.path=[];
            gs.chars.push(obj);
            break;

          case 51: // bee
          case 52:
            obj.pollen=0;
            obj.dx=-1;
            obj.dy=-1;
            obj.path=[];
            gs.chars.push(obj);
            break;

          case 36: // hive
          case 37:
            obj.pollen=0;
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

  // Populate parallax field
  gs.parallax=[];
  for (var i=0; i<4; i++)
    for (var z=1; z<=2; z++)
      gs.parallax.push({t:Math.floor(rng()*3), x:Math.floor((rng()*gs.width)*TILESIZE), y:Math.floor((rng()*(gs.height/2))*TILESIZE), z:(z*10)});

  // Move scroll offset to player with damping disabled
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
  {
    drawsprite(gs.chars[id]);

    // Draw health bar
    if (((gs.chars[id].health||0)>0) && ((gs.chars[id].htime||0)>0))
    {
      var hmax=0;

      switch (gs.chars[id].id)
      {
        case 30:
        case 31:
          hmax=HEALTHPLANT;
          break;

        case 53:
        case 54:
          hmax=HEALTHZOMBEE;
          break;

        case 55:
        case 56:
          hmax=HEALTHGRUB;
          break;

        default:
          break;
      }

      if (hmax>0)
      {
        gs.sctx.fillStyle="rgba(0,255,0,0.75)";
        gs.sctx.fillRect(gs.chars[id].x-gs.xoffset, gs.chars[id].y-gs.yoffset, Math.ceil(TILESIZE*(gs.chars[id].health/hmax)), 2);
        gs.sctx.stroke();
      }
    }

    if (gs.debug)
    {
      // Draw health above it
      if (gs.chars[id].health||0!=0)
        write(gs.sctx, gs.chars[id].x-gs.xoffset, (gs.chars[id].y-gs.yoffset)-8, ""+gs.chars[id].health, 1, "rgb(0,0,0)");

      // Draw pollen above it
      if (gs.chars[id].pollen||0!=0)
        write(gs.sctx, gs.chars[id].x-gs.xoffset+(TILESIZE*0.75), (gs.chars[id].y-gs.yoffset)-8, ""+gs.chars[id].pollen, 1, "rgb(255,0,255)");

      // Draw dwell below it
      if (gs.chars[id].dwell||0!=0)
        write(gs.sctx, gs.chars[id].x-gs.xoffset+(TILESIZE*0.75), (gs.chars[id].y-gs.yoffset)+TILESIZE, ""+gs.chars[id].dwell, 1, "rgb(0,255,0)");
    }
  }
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

  gs.sctx.fillStyle="rgba("+particle.r+","+particle.g+","+particle.b+","+particle.a+")";
  gs.sctx.fillRect(Math.floor(x)-gs.xoffset, Math.floor(y)-gs.yoffset, particle.s, particle.s);
}

// Draw particles
function drawparticles()
{
  for (var i=0; i<gs.particles.length; i++)
    drawparticle(gs.particles[i]);
}

// Draw parallax
function drawparallax()
{
  for (var i=0; i<gs.parallax.length; i++)
  {
    switch (gs.parallax[i].t)
    {
      case 0:
      case 1:
        drawtile(11+gs.parallax[i].t, gs.parallax[i].x-Math.floor(gs.xoffset/gs.parallax[i].z), gs.parallax[i].y-Math.floor(gs.yoffset/gs.parallax[i].z));
        break;

      case 2:
        drawtile(1, gs.parallax[i].x-Math.floor(gs.xoffset/gs.parallax[i].z), gs.parallax[i].y-Math.floor(gs.yoffset/gs.parallax[i].z));
        drawtile(2, gs.parallax[i].x-Math.floor(gs.xoffset/gs.parallax[i].z)+TILESIZE, gs.parallax[i].y-Math.floor(gs.yoffset/gs.parallax[i].z));
        break;

      default:
        break;
    }      
  }
}

// https://stackoverflow.com/questions/1255512/how-to-draw-a-rounded-rectangle-using-html-canvas
CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r)
{
  if (w<(2*r)) r=w/2;
  if (h<(2*r)) r=h/2;

  this.beginPath();
  this.moveTo(x+r, y);
  this.arcTo(x+w, y,   x+w, y+h, r);
  this.arcTo(x+w, y+h, x,   y+h, r);
  this.arcTo(x,   y+h, x,   y,   r);
  this.arcTo(x,   y,   x+w, y,   r);
  this.closePath();

  return this;
};

// Draw messagebox if required
function drawmsgbox()
{
  if (gs.msgboxtime>0)
  {
    var i;
    var width=0;
    var height=0;
    var top=0;
    var icon=-1;
    const boxborder=1;

    // Draw box //
    // Split on \n
    const txtlines=gs.msgboxtext.split("\n");

    // Determine width (length of longest string + border)
    for (i=0; i<txtlines.length; i++)
    {
      // Check for and remove icon from first line
      if ((i==0) && (txtlines[i].indexOf("[")==0))
      {
        var endbracket=txtlines[i].indexOf("]");
        if (endbracket!=-1)
        {
          icon=parseInt(txtlines[i].substring(1, endbracket), 10);
          txtlines[i]=txtlines[i].substring(endbracket+1);
        }
      }

      if (txtlines[i].length>width)
        width=txtlines[i].length;
    }

    width+=(boxborder*2);

    // Determine height (number of lines + border)
    height=txtlines.length+(boxborder*2);

    // Convert width/height into pixels
    width*=font_width;
    height*=(font_height+1);

    // Add space if sprite is to be drawn
    if (icon!=-1)
    {
      // Check for centering text when only one line and icon pads height
      if (txtlines.length==1)
        top=0.5;
    
      width+=(TILESIZE+(font_width*2));

      if (height<(TILESIZE+(2*font_height)))
        height=TILESIZE+(2*font_height);
    }

    // Roll-up
    if (gs.msgboxtime<8)
      height=Math.floor(height*(gs.msgboxtime/8));

    // Draw box
    gs.sctx.fillStyle="rgba(255,255,255,0.75)";
    gs.sctx.strokeStyle="rgba(0,0,0,0)";
    gs.sctx.roundRect(XMAX-(width+(boxborder*font_width)), 1*font_height, width, height, font_width).fill();

    if (gs.msgboxtime>=8)
    {
      // Draw optional sprite
      if (icon!=-1)
        drawsprite({id:icon, x:(XMAX-width)+gs.xoffset, y:((boxborder*2)*font_height)+gs.yoffset, flip:false});

      // Draw text //
      for (i=0; i<txtlines.length; i++)
        write(gs.sctx, XMAX-width+(icon==-1?0:TILESIZE+font_width), (i+(boxborder*2)+top)*(font_height+1), txtlines[i], 1, "rgba(0,0,0,0.75)");
    }

    gs.msgboxtime--;
  }
  else
  {
    // Check if there are any message boxes queued up
    if ((gs.state==STATEPLAYING) && (gs.msgqueue.length>0))
    {
      showmessagebox(gs.msgqueue[0].text, gs.msgqueue[0].duration);
      gs.msgqueue.shift();
    }
  }
}

// Show messsage box
function showmessagebox(text, timing)
{
  if ((gs.msgboxtime==0) && (gs.state==STATEPLAYING))
  {
    // Set text to display
    gs.msgboxtext=text;

    // Set time to display messagebox
    gs.msgboxtime=timing;
  }
  else
    gs.msgqueue.push({text:text, duration:timing});
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
    // If we just hit the ground after falling, create a few particles under foot
    if (gs.fall==true)
      generateparticles(gs.x+(TILESIZE/2), gs.y+TILESIZE, 4, 4, {r:170, g:170, b:170});

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
  var loop;

  // Check for horizontal collisions
  if ((gs.hs!=0) && (playercollide(gs.x+gs.hs, gs.y)))
  {
    loop=TILESIZE;
    // A collision occured, so move the character until it hits
    while ((!playercollide(gs.x+(gs.hs>0?1:-1), gs.y)) && (loop>0))
    {
      gs.x+=(gs.hs>0?1:-1);
      loop--;
    }

    // Stop horizontal movement
    gs.hs=0;
  }
  gs.x+=Math.floor(gs.hs);

  // Check for vertical collisions
  if ((gs.vs!=0) && (playercollide(gs.x, gs.y+gs.vs)))
  {
    loop=TILESIZE;
    // A collision occured, so move the character until it hits
    while ((!playercollide(gs.x, gs.y+(gs.vs>0?1:-1))) && (loop>0))
    {
      gs.y+=(gs.vs>0?1:-1);
      loop--;
    }

    // Stop vertical movement
    gs.vs=0;
  }
  gs.y+=Math.floor(gs.vs);
}

// If no input detected, slow the player using friction
function standcheck()
{
  // Check for ducking, or injured
  if ((ispressed(KEYDOWN)) || ((gs.htime>0) && (!monetized)))
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
function generateparticles(cx, cy, mt, count, rgb)
{
  for (var i=0; i<count; i++)
  {
    var ang=(Math.floor(rng()*360)); // angle to eminate from
    var t=Math.floor(rng()*mt); // travel from centre
    var r=rgb.r||(rng()*255);
    var g=rgb.g||(rng()*255);
    var b=rgb.b||(rng()*255);

    gs.particles.push({x:cx, y:cy, ang:ang, t:t, r:r, g:g, b:b, a:1.0, s:(rng()<0.05)?2:1});
  }
}

// Do processing for gun
function guncheck()
{
  var i;

  // Cool gun down
  if (gs.gunheat>0) gs.gunheat--;

  // Check for having gun and want to use it
  if ((gs.gun==true) && (gs.gunheat==0) && ((gs.keystate!=KEYNONE) || ((gs.padstate!=KEYNONE))) && (ispressed(KEYACTION)))
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
            gs.chars[id].htime=(2*60);
            gs.chars[id].health--;
            if (gs.chars[id].health<=0)
            {
              if (gs.chars[id].id==30) // If it's tall, change to small toadstool
              {
                gs.chars[id].health=HEALTHPLANT;
                gs.chars[id].growtime=(GROWTIME+Math.floor(rng()*120));
                gs.chars[id].id=31;
              }
              else
                gs.chars[id].del=true;
            }

            generateparticles(gs.chars[id].x+(TILESIZE/2), gs.chars[id].y+(TILESIZE/2), 8, (gs.chars[id].health<=0)?16:2, {r:252, g:104, b:59});

            gs.shots[i].dir=0;
            gs.shots[i].ttl=3;
            break;

          case 53: // zombee
          case 54:
            gs.chars[id].htime=(2*60);
            gs.chars[id].health--;
            if (gs.chars[id].health<=0)
              gs.chars[id].del=true;

            generateparticles(gs.chars[id].x+(TILESIZE/2), gs.chars[id].y+(TILESIZE/2), 16, (gs.chars[id].health<=0)?32:4, {r:44, g:197, b:246});

            gs.shots[i].dir=0;
            gs.shots[i].ttl=3;
            break;

          case 55: // grub
          case 56:
            gs.chars[id].htime=(2*60);
            gs.chars[id].health--;
            if (gs.chars[id].health<=0)
              gs.chars[id].del=true;

            generateparticles(gs.chars[id].x+(TILESIZE/2), gs.chars[id].y+(TILESIZE/2), 16, (gs.chars[id].health<=0)?32:4, {r:252, g:104, b:59});

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
  if ((gs.keystate!=KEYNONE) || (gs.padstate!=KEYNONE))
  {
    // Left key
    if ((ispressed(KEYLEFT)) && (!ispressed(KEYRIGHT)))
    {
      gs.hs=gs.htime==0?-gs.speed:-1;
      gs.dir=-1;
      gs.flip=true;
    }

    // Right key
    if ((ispressed(KEYRIGHT)) && (!ispressed(KEYLEFT)))
    {
      gs.hs=gs.htime==0?gs.speed:1;
      gs.dir=1;
      gs.flip=false;
    }

    // Extra processing for top-down levels
    if (gs.topdown)
    {
      // Up key
      if ((ispressed(KEYUP)) && (!ispressed(KEYDOWN)))
      {
        gs.vs=gs.htime==0?-gs.speed:-1;
      }

      // Down key
      if ((ispressed(KEYDOWN)) && (!ispressed(KEYUP)))
      {
        gs.vs=gs.htime==0?gs.speed:1;
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
          gs.topdown=((gs.hs==0) && (gs.vs<0)); // pass over moving up for topdown, otherwise 2D
          break;

        case 53: // Zombee
        case 54:
          if (gs.htime==0)
            gs.htime=(5*60); // Set hurt timer

          if (gs.gun)
          {
            // Drop gun
            gs.chars.push({id:50, x:gs.x, y:gs.y, flip:false, path:[], del:false});
            gs.gun=false;
          }
          break;

        case 55: // Grub
        case 56:
          if (gs.htime==0)
            gs.htime=(2*60); // Set hurt timer
            break;

        case 50: // gun
          if (gs.htime==0)
          {
            gs.gun=true;
            gs.tileid=40;
            gs.chars[id].del=true;
          }
          break;

        default:
          break;
      }
    }
  }
}

// Find the nearst char of type included in tileids to given x, y point or -1
function findnearestchar(x, y, tileids)
{
  var closest=(gs.width*gs.height*TILESIZE);
  var charid=-1;
  var dist;

  for (var id=0; id<gs.chars.length; id++)
  {
    if (tileids.includes(gs.chars[id].id))
    {
      dist=calcHypotenuse(Math.abs(x-gs.chars[id].x), Math.abs(y-gs.chars[id].y));

      if (dist<closest)
      {
        charid=id;
        closest=dist;
      }
    }
  }

  return charid;
}

function countchars(tileids)
{
  var found=0;

  for (var id=0; id<gs.chars.length; id++)
    if (tileids.includes(gs.chars[id].id))
      found++;

  return found;
}

function updatecharAI()
{
  var id=0;
  var nx=0; // new x position
  var ny=0; // new y position

  for (id=0; id<gs.chars.length; id++)
  {
    // Decrease hurt timer
    if ((gs.chars[id].htime||0)>0) gs.chars[id].htime--;

    switch (gs.chars[id].id)
    {
      case 31: // toadstool
      case 33: // flower
        gs.chars[id].growtime--;
        if (gs.chars[id].growtime<=0)
        {
          gs.chars[id].health=HEALTHPLANT;
          gs.chars[id].id--; // Switch tile to bigger version of plant
        }
        break;

      case 51: // bee
      case 52:
        var nid=-1; // next target id
        var hid=-1; // next hive id
        var fid=-1; // next flower id

        // Check if dwelling
        if (gs.chars[id].dwell>0)
        {
          gs.chars[id].dwell--;

          continue;
        }

        // Check if following a path, then move to next node
        if (gs.chars[id].path.length>0)
        {
          var nextx=Math.floor(gs.chars[id].path[0]%gs.width)*TILESIZE;
          var nexty=Math.floor(gs.chars[id].path[0]/gs.width)*TILESIZE;
          var deltax=Math.abs(nextx-gs.chars[id].x);
          var deltay=Math.abs(nexty-gs.chars[id].y);

          // Check if we have arrived at the current path node
          if ((deltax<=(TILESIZE/2)) && (deltay<=(TILESIZE/2)))
          {
            // We are here, so move on to next path node
            gs.chars[id].path.shift();

            // Check for being at end of path
            if (gs.chars[id].path.length==0)
            {
              // If following player, wait a bit here
              if (gs.chars[id].dx==-1)
                gs.chars[id].dwell=(2*60);

              // Set a null destination
              gs.chars[id].dx=-1;
              gs.chars[id].dy=-1;
            }
          }
          else
          {
            var beespeed=SPEEDBEE*(monetized?2:1);

            // Move onwards, following path
            if (deltax!=0)
            {
              gs.chars[id].hs=(nextx<gs.chars[id].x)?-beespeed:beespeed;
              gs.chars[id].x+=gs.chars[id].hs;
              gs.chars[id].flip=(gs.chars[id].hs<0);

              if (gs.chars[id].x<0)
                gs.chars[id].x=0;
            }

            if (deltay!=0)
            {
              gs.chars[id].y+=(nexty<gs.chars[id].y)?-beespeed:beespeed;

              if (gs.chars[id].x<0)
                gs.chars[id].x=0;
            }
          }
        }
        else
        {
          // Not following a path

          // Check if overlapping hive or flowers not in use or already being used by this bee
          for (var id2=0; id2<gs.chars.length; id2++)
          {
            if (((gs.chars[id2].id==32) || (gs.chars[id2].id==33) || (gs.chars[id2].id==36) || (gs.chars[id2].id==37)) &&
                (overlap(gs.chars[id].x, gs.chars[id].y, TILESIZE, TILESIZE, gs.chars[id2].x, gs.chars[id2].y, TILESIZE, TILESIZE)))
            {
              switch (gs.chars[id2].id)
              {
                case 32: // flower
                case 33:
                  gs.chars[id].dwell=(2*60);

                  gs.chars[id].pollen++; // Increase pollen that the bee is carrying

                  gs.chars[id2].health--; // Decrease flower health
                  if (gs.chars[id2].health<=0)
                  {
                    if (gs.chars[id2].id==32) // If it's big flower, change to small flower, then the bee can get a bit more pollen
                    {
                      gs.chars[id2].health=HEALTHPLANT;
                      gs.chars[id2].growtime=(GROWTIME+Math.floor(rng()*120));
                      gs.chars[id2].id=33;
                    }
                    else
                      gs.chars[id2].del=true; // Remove plant
                  }
                  break;

                case 36: // hive
                case 37:
                  // Only use this hive if this bee has pollen
                  if (gs.chars[id].pollen>0)
                  {
                    gs.chars[id].dwell=(2*60);

                    // Transfer pollen from bee to hive
                    gs.chars[id2].pollen+=gs.chars[id].pollen;
                    gs.chars[id].pollen=0;

                    // If hive has enough pollen, spawn another bee
                    if ((gs.chars[id2].pollen>10) && (countchars([51, 52])<MAXBEES))
                    {
                      gs.chars[id2].pollen-=10;
                      gs.chars.push({id:51, x:gs.chars[id2].x, y:gs.chars[id2].y, flip:false, hs:0, vs:0, dwell:(5*60), htime:0, pollen:0, dx:-1, dy:-1, path:[], del:false});

                      generateparticles(gs.chars[id].x+(TILESIZE/2), gs.chars[id].y+(TILESIZE/2), 16, 16, {});
                      
                      var beesneeded=((gs.level+5)-countchars([51, 52]));

                      if (beesneeded<=0)
                      {
                        if (!islevelcompleted())
                          showmessagebox("[53]Remove all threats", 3*60);
                      }
                      else
                        showmessagebox("[51]"+beesneeded+" more bees needed", 3*60);
                    }
                  }

                  break;

                default: // Something we are not interested in
                  break;
              }
            }
          }

          // Only look for some place to go if not dwelling due to collision
          if (gs.chars[id].dwell==0)
          {
            // Find nearest hive
            hid=findnearestchar(gs.chars[id].x, gs.chars[id].y, [36, 37]);
    
            // Find nearest flower
            fid=findnearestchar(gs.chars[id].x, gs.chars[id].y, [32, 33]);
    
            // If we have any pollen, go to nearest hive (if there is one)
            if ((hid!=-1) && (gs.chars[id].pollen>0))
              nid=hid;
    
            // However, if we need more pollen and there is a flower available, go there first
            if ((fid!=-1) && (gs.chars[id].pollen<5))
              nid=fid;
  
            // If something was found, check if we are already going there
            if (nid!=-1)
            {
              // If our next point of interest is not where we are already headed, then re-route
              if ((gs.chars[id].dx!=gs.chars[nid].x) && (gs.chars[id].dy!=gs.chars[nid].y))
              {
                gs.chars[id].path=pathfinder(
                  (Math.floor(gs.chars[id].y/TILESIZE)*gs.width)+Math.floor(gs.chars[id].x/TILESIZE)
                  ,
                  (Math.floor(gs.chars[nid].y/TILESIZE)*gs.width)+Math.floor(gs.chars[nid].x/TILESIZE)
                  );
    
                gs.chars[id].dx=gs.chars[nid].x;
                gs.chars[id].dy=gs.chars[nid].y;
              }
            }
            else
            {
              // No new targets found
              if (gs.chars[id].path.length==0)
              {
                // Go to player
                gs.chars[id].path=pathfinder(
                  (Math.floor(gs.chars[id].y/TILESIZE)*gs.width)+Math.floor(gs.chars[id].x/TILESIZE)
                  ,
                  (Math.floor(gs.y/TILESIZE)*gs.width)+Math.floor(gs.x/TILESIZE)
                  );
    
                // Check if we didn't find the player on the map
                if (gs.chars[id].path.length<=1)
                {
                  // If not, dwell a bit to stop pathfinder running constantly
                  gs.chars[id].dwell=(2*60);
                }
              }
            }
          }
        }
        break;

      case 53: // zombee
      case 54:
        var nid=-1; // next target id

        // If we are allowed to collide
        if (gs.chars[id].dwell==0)
        {
          // Check for collision
          for (var id2=0; id2<gs.chars.length; id2++)
          {
            if (((gs.chars[id2].id==51) || (gs.chars[id2].id==52) || (gs.chars[id2].id==36) || (gs.chars[id2].id==37)) &&
                (overlap(gs.chars[id].x, gs.chars[id].y, TILESIZE, TILESIZE, gs.chars[id2].x, gs.chars[id2].y, TILESIZE, TILESIZE)) &&
                (gs.chars[id].dwell==0))
            {
              switch (gs.chars[id2].id)
              {
                case 51: // bee
                case 52:
                  // Steal some pollen if it has any
                  if (gs.chars[id2].pollen>0)
                  {
                    gs.chars[id2].pollen--;
                    gs.chars[id].pollen++;

                    // Don't allow further collisions for a while
                    gs.chars[id].dwell=(5*60);
                  }
                  break;

                case 36: // hive
                  // Break hive
                  gs.chars[id2].id++;

                  // See if there is any pollen in the hive
                  if (gs.chars[id2].pollen>0)
                  {
                    // Loose half the pollen in the hive
                    gs.chars[id2].pollen=Math.floor(gs.chars[id2].pollen/2);
                  }

                  // Don't allow further collisions for a while
                  gs.chars[id].dwell=(10*60);
                  break;

                default:
                  break;
              }
            }
          }
        }
        else
        {
          gs.chars[id].dwell--; // Reduce collision preventer

          continue; // Stop further processing, we are still dwelling
        }

        // Find nearest hive/bee
        nid=findnearestchar(gs.chars[id].x, gs.chars[id].y, [36, 51, 52]);

        // If something was found, check if we are already going there
        if (nid!=-1)
        {
          // If our next point of interest is not where we are already headed, then re-route
          if ((gs.chars[id].dx!=gs.chars[nid].x) && (gs.chars[id].dy!=gs.chars[nid].y))
          {
            gs.chars[id].path=pathfinder(
              (Math.floor(gs.chars[id].y/TILESIZE)*gs.width)+Math.floor(gs.chars[id].x/TILESIZE)
              ,
              (Math.floor(gs.chars[nid].y/TILESIZE)*gs.width)+Math.floor(gs.chars[nid].x/TILESIZE)
              );

            gs.chars[id].dx=gs.chars[nid].x;
            gs.chars[id].dy=gs.chars[nid].y;
          }
        }
        else
        {
          // Nowhere to go next, dwell a bit to stop pathfinder running constantly
          gs.chars[id].dwell=(2*60);
        }

        // Check if following a path, if so do move to next node
        if (gs.chars[id].path.length>0)
        {
          var nextx=Math.floor(gs.chars[id].path[0]%gs.width)*TILESIZE;
          var nexty=Math.floor(gs.chars[id].path[0]/gs.width)*TILESIZE;
          var deltax=Math.abs(nextx-gs.chars[id].x);
          var deltay=Math.abs(nexty-gs.chars[id].y);

          // Check if we have arrived at the current path node
          if ((deltax<=(TILESIZE/2)) && (deltay<=(TILESIZE/2)))
          {
            // We are here, so move on to next path node
            gs.chars[id].path.shift();

            // Check for being at end of path
            if (gs.chars[id].path.length==0)
            {
              // Path completed so wait a bit
              gs.chars[id].dwell=(2*60);

              // Set a null destination
              gs.chars[id].dx=-1;
              gs.chars[id].dy=-1;
            }
          }
          else
          {
            // Move onwards, following path
            if (deltax!=0)
            {
              if (nextx!=gs.chars[id].x)
              {
                gs.chars[id].hs=(nextx<gs.chars[id].x)?-SPEEDZOMBEE:SPEEDZOMBEE;
                gs.chars[id].x+=gs.chars[id].hs;
                gs.chars[id].flip=(gs.chars[id].hs<0);
              }

              if (gs.chars[id].x<0)
                gs.chars[id].x=0;
            }

            if (deltay!=0)
            {
              gs.chars[id].y+=(nexty<gs.chars[id].y)?-SPEEDZOMBEE:SPEEDZOMBEE;

              if (gs.chars[id].x<0)
                gs.chars[id].x=0;
            }
          }
        }
        break;

      case 55: // grub
      case 56:
        var eaten=false;

        // If dwelling, don't process any further
        if (gs.chars[id].dwell>0)
        {
          gs.chars[id].dwell--;
          gs.chars[id].hs=0; // Prevent movement

          continue;
        }

        // Check if overlapping a toadstool, if so stop and eat some
        for (var id2=0; id2<gs.chars.length; id2++)
        {
          if ((eaten==false) && ((gs.chars[id2].id==30) || (gs.chars[id2].id==31)) &&
               (overlap(gs.chars[id].x+(TILESIZE/2), gs.chars[id].y+(TILESIZE/2), 1, 1, gs.chars[id2].x, gs.chars[id2].y, TILESIZE, TILESIZE)))
          {
            gs.chars[id].health++; // Increase grub health
            eaten=true;
            gs.chars[id].dwell=(3*60);

            gs.chars[id2].health--; // Decrease toadstool health
            if (gs.chars[id2].health<=0)
            {
              if (gs.chars[id2].id==30) // If it's a tall toadstool, change to small toadstool, then eat a bit more
              {
                gs.chars[id2].health=HEALTHPLANT;
                gs.chars[id2].growtime=(GROWTIME+Math.floor(rng()*120));
                gs.chars[id2].id=31;
              }
              else
                gs.chars[id2].del=true;
            }

            break;
          }
        }

        if (((gs.chars[id].dwell==0)) && (eaten==false))
        {
          // Not eating, nor moving
          if (gs.chars[id].hs==0)
          {
            gs.chars[id].hs=(rng()<0.5)?-SPEEDGRUB:SPEEDGRUB; // Nothing eaten so move onwards
            gs.chars[id].flip=(gs.chars[id].hs<0);

            // If this grub is well fed, turn it into a zombee
            if ((gs.chars[id].health>(HEALTHGRUB*1.5)) && (countchars([53, 54])<MAXFLIES))
            {
              gs.chars[id].id=53;
              gs.chars[id].health=HEALTHZOMBEE;
              gs.chars[id].pollen=0;

              generateparticles(gs.chars[id].x+(TILESIZE/2), gs.chars[id].y+(TILESIZE/2), 16, 16, {});

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

  // Remove anything marked for deletion
  id=gs.chars.length;
  while (id--)
  {
    if (gs.chars[id].del)
      gs.chars.splice(id, 1);
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
                if (calcHypotenuse(Math.abs((x*TILESIZE)-gs.chars[id].x), Math.abs((y*TILESIZE)-gs.chars[id].y))<(((rng()<0.5)?3:4)*TILESIZE))
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
      var spawnid=(rng()<0.6)?33:31; // Pick randomly between flowers and toadstools

      // Add spawned item to front of chars
      gs.chars.unshift({id:spawnid, x:(sps[spid].x*TILESIZE), y:(sps[spid].y*TILESIZE), flip:false, hs:0, vs:0, health:HEALTHPLANT, growtime:GROWTIME, del:false});
    }

    gs.spawntime=SPAWNTIME; // Set up for next spawn check
  }
}

// Update function called once per frame
function update()
{
  // Apply keystate/physics to player
  updatemovements();

  // Update other character movements / AI
  updatecharAI();

  // Check for player/character/collectable collisions
  updateplayerchar();

  // Check for spawn event
  checkspawn();
}

// Check for level being completed
function islevelcompleted()
{
  // This is defined as ..
  //   no grubs
  //   no flies
  //   5 or more bees for level 1, then 6, 7, 8, e.t.c.

  return ((countchars([55, 56])==0) && (countchars([53, 54])==0) && (countchars([51, 52])>=(5+gs.level)));
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

  // Draw the parallax
  drawparallax();

  // Draw the level
  drawlevel();

  // Clear the sprites canvas
  gs.sctx.clearRect(0, 0, gs.scanvas.width, gs.scanvas.height);

  // Draw the chars
  drawchars();

  // Draw the player
  if ((gs.htime==0) || ((gs.htime%30)<=15)) // Flash when hurt
    drawsprite({id:gs.tileid, x:gs.x, y:gs.y, flip:gs.flip});

  // Draw the shots
  drawshots();

  // Draw the particles
  drawparticles();

  // Draw any visible messagebox
  drawmsgbox();

  // Draw FPS and stats
  if (gs.debug)
  {
    var dtop=1;
    var textcol="rgba(0,0,0,0.5)";
    write(gs.sctx, XMAX-(12*font_width), font_height*(dtop++), "FPS : "+gs.fps, 1, textcol);

    write(gs.sctx, XMAX-(12*font_width), font_height*(dtop++), "GRB : "+countchars([55, 56]), 1, textcol);
    write(gs.sctx, XMAX-(12*font_width), font_height*(dtop++), "ZOM : "+countchars([53, 54]), 1, textcol);
    write(gs.sctx, XMAX-(12*font_width), font_height*(dtop++), "BEE : "+countchars([51, 52]), 1, textcol);
  }
}

// Request animation frame callback
function rafcallback(timestamp)
{
  if (gs.debug)
  {
    // Calculate FPS
    while ((gs.frametimes.length>0) && (gs.frametimes[0]<=(timestamp-1000)))
      gs.frametimes.shift(); // Remove all entries older than a second

    gs.frametimes.push(timestamp); // Add current time
    gs.fps=gs.frametimes.length; // FPS = length of times in array
  }

  // First time round, just save epoch
  if (gs.lasttime>0)
  {
    // Determine accumulated time since last call
    gs.acc+=((timestamp-gs.lasttime) / 1000);

    // If it's more than 15 seconds since last call, reset
    if ((gs.acc>gs.step) && ((gs.acc/gs.step)>(60*15)))
      gs.acc=gs.step*2;

    // Gamepad support
    try
    {
      if (!!(navigator.getGamepads))
        gamepadscan();
    }
    catch(e){}

    // Process "steps" since last call
    while (gs.acc>gs.step)
    {
      update();
      gs.acc-=gs.step;
    }

    redraw();

    // Check for level completed
    if ((gs.state==STATEPLAYING) && (islevelcompleted()))
    {
      gs.xoffset=0;
      gs.yoffset=0;

      if ((gs.level+1)==levels.length)
      {
        // End of game
        gs.state=STATECOMPLETE;

        gs.timeline.reset().add(10*1000, undefined).addcallback(endgame).begin(0);
      }
      else
        newlevel(gs.level+1);
    }

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

// New level screen
function newlevel(level)
{
  var hints=[];

  if ((level<0) || (level>=levels.length))
    return;

  // Ensure timeline is stopped
  gs.timeline.end().reset();
  gs.timeline=new timelineobj();

  gs.state=STATENEWLEVEL;

  // Clear any messageboxes left on screen
  gs.msgqueue=[];
  gs.msgboxtime=0;

  gs.timeline.add(0, function()
  {
    gs.level=level;

    gs.ctx.clearRect(0, 0, gs.canvas.width, gs.canvas.height);
    gs.sctx.clearRect(0, 0, gs.canvas.width, gs.canvas.height);
  
    // Write level number and title
    write(gs.ctx, (3*3)*13, 40, "Level "+(gs.level+1), 3, "rgb(255,191,0)");
    write(gs.ctx, (XMAX/2)-((levels[gs.level].title.length/2)*8), YMAX/2, levels[gs.level].title, 2, "rgb(255,255,255)");

    // Indicate what is required to progress to next level
    write(gs.ctx, 9*12, YMAX-20, "Increase colony to "+(gs.level+5)+" bees", 1, "rgb(255,191,0)");
  }).add(3*1000, function()
  {
    gs.state=STATEPLAYING;
    loadlevel(gs.level);
    window.requestAnimationFrame(rafcallback);
  });

  // Add hints depending on level
  switch (level)
  {
    case 0:
      hints.push("[10]Welcome to JS13K entry\nby picosonic",
        "[50]Shoot enemies\nwith the honey gun",
        "[55]Grubs turn into Zombees\nwhen they eat toadstools",
        "[53]Zombees chase bees\nsteal pollen and honey\nand break hives",
        "[51]Bees collect pollen from flowers\nto make pollen in their hives",
        "[30]Clear away toadstools to prevent\ngrubs turning into ZomBees and\nmake space for flowers to grow");

      if (monetized)
        hints.push("[10]Web Monetization detected..\nBees move faster and you can still\njump when hurt");
      break;

    case 1:
      hints.push("[45]Watch out for gravity toggles");
      break;

    case 2:
      hints.push("[50]Solve the maze\nto find your prize");
      break;

    case 3:
      hints.push("[50]Use gravity toggle\nto get honey gun");
      break;

    case 4:
      hints.push("[45]Race to the top\nwith care");
      break;

    case 5:
      hints.push("[55]Hop to it before the\ngrubs change to Zombees");
      break;

    default:
      break;
  }

  // Queue up all the hints as message boxes one after the other
  for (var n=0; n<hints.length; n++)
    showmessagebox(hints[n], 3*60);

  gs.timeline.begin();
}

function resettointro()
{
  gs.timeline.reset().add(10*1000, undefined).addcallback(intro).begin(0);
}

// End game animation
function endgame(percent)
{
  if (gs.state!=STATECOMPLETE)
    return;

  // Check if done or control key/gamepad pressed
  if ((percent>=98) || (gs.keystate!=KEYNONE) || (gs.padstate!=KEYNONE))
  {
    gs.state=STATEINTRO;
    gs.ctx.clearRect(0, 0, gs.scanvas.width, gs.scanvas.height);
    gs.sctx.clearRect(0, 0, gs.scanvas.width, gs.scanvas.height);
    setTimeout(resettointro, 300);
  }
  else
  {
    if (percent==0)
    {
      gs.ctx.clearRect(0, 0, gs.canvas.width, gs.canvas.height);
      write(gs.ctx, 35, 30, "CONGRATULATIONS", 4, "rgb(255,191,0)");
      write(gs.ctx, 15, (YMAX/2)+20, "The Queen Bee thanks you for helping", 2, "rgb(255,255,255)");
      write(gs.ctx, 50, (YMAX/2)+40, "to save the bees and planet", 2, "rgb(255,255,255)");

      // Add Bees
      gs.chars=[];

      for (var n=0; n<50; n++)
        gs.chars.push({id:51, x:Math.floor(Math.random()*XMAX), y:Math.floor(Math.random()*XMAX), flip:false, hs:Math.random()<0.5?-SPEEDBEE*2:SPEEDBEE*2, vs:Math.random()<0.5?-SPEEDBEE*2:SPEEDBEE*2});
    }

    // Clear sprite canvas
    gs.sctx.clearRect(0, 0, gs.scanvas.width, gs.scanvas.height);

    // Draw rabbit
    drawsprite({id:((Math.floor(percent/2)%2)==1)?45:46, x:XMAX/2, y:Math.floor((YMAX/2)-(TILESIZE/2)), flip:false});

    // Draw bees
    for (var i=0; i<gs.chars.length; i++)
    {
      drawsprite({id:((Math.floor(percent/2)%2)==1)?51:52, x:gs.chars[i].x, y:gs.chars[i].y, flip:false});

      // move bee onwards
      gs.chars[i].x+=gs.chars[i].hs;
      if ((gs.chars[i].x<0) || (gs.chars[i].x+TILESIZE>XMAX))
        gs.chars[i].hs*=-1;

      gs.chars[i].y+=gs.chars[i].vs;
      if ((gs.chars[i].y<0) || (gs.chars[i].y+TILESIZE>YMAX))
        gs.chars[i].vs*=-1;
    }
  }
}

// Intro animation
function intro(percent)
{
  // Check if done or control key/gamepad pressed
  if ((percent>=98) || (gs.keystate!=KEYNONE) || (gs.padstate!=KEYNONE))
  {
    newlevel(0);
  }
  else
  {
    var tenth=Math.floor(percent/10);
    var curchar=" BEE KIND ".charAt(tenth);
    var textcol="rgb(240,240,240)";

    if (tenth==0)
      gs.ctx.clearRect(0, 0, gs.canvas.width, gs.canvas.height);

    write(gs.ctx, tenth*(8*4), 30, curchar, 5, "rgb(255,191,0)");

    if (curchar!=" ")
      generateparticles((tenth+0.4)*(8*4), 30, 4, 8, {r:255, g:191, b:0});

    // Clear sprite canvas
    gs.sctx.clearRect(0, 0, gs.scanvas.width, gs.scanvas.height);

    // Introduce characters
    // grub
    drawsprite({id:((Math.floor(percent/2)%2)==1)?55:56, x:XMAX-Math.floor((percent/100)*XMAX)+50, y:Math.floor((YMAX/2)+(TILESIZE*2)), flip:true});
    write(gs.sctx, XMAX-Math.floor((percent/100)*XMAX)+50+TILESIZE, Math.floor((YMAX/2)+(TILESIZE*2.5)), "GRUB - eats toadstools, becomes ZOMBEE", 1, textcol);

    // zombee
    drawsprite({id:((Math.floor(percent/2)%2)==1)?53:54, x:XMAX-Math.floor((percent/100)*XMAX)+TILESIZE+50, y:Math.floor((YMAX/2)+TILESIZE), flip:true});
    write(gs.sctx, XMAX-Math.floor((percent/100)*XMAX)+(TILESIZE*2)+50, Math.floor((YMAX/2)+(TILESIZE*1.3)), "ZOMBEE - steals pollen, breaks hives", 1, textcol);

    // Draw rabbit
    drawsprite({id:((Math.floor(percent/2)%2)==1)?45:46, x:Math.floor((percent/100)*XMAX), y:Math.floor((YMAX/2)-(TILESIZE/2)), flip:false});

    // Draw bees
    drawsprite({id:((Math.floor(percent/2)%2)==1)?51:52, x:XMAX-Math.floor((percent/100)*XMAX), y:Math.floor((YMAX/2)+(TILESIZE*2)), flip:true});
    drawsprite({id:((Math.floor(percent/2)%2)==1)?52:51, x:XMAX-Math.floor((percent/100)*XMAX)+TILESIZE, y:Math.floor((YMAX/2)+TILESIZE), flip:true});

    // Draw controls
    if ((Math.floor(percent)%16)<=8)
    {
      var keys=((Math.floor(percent/2)%32)<16)?"WASD":"ZQSD";
      write(gs.sctx, (XMAX/4)+(TILESIZE*2), YMAX-20, keys+"/CURSORS + ENTER/SPACE/SHIFT", 1, textcol);
      write(gs.sctx, (XMAX/4)+(TILESIZE*2), YMAX-10, "or use GAMEPAD", 1, textcol);

      // Draw JS13k gamepad
      drawsprite({id:10, x:(XMAX/4)+(TILESIZE/2), y:YMAX-TILESIZE, flip:false});
    }

    // Animate the particles
    drawparticles();
    particlecheck();
  }
}

// Entry point
function init()
{
  // Initialise stuff
  document.onkeydown=function(e)
  {
    e = e || window.event;
    updatekeystate(e, 1);

    if (!gs.music)
    {
      gs.music=true;
      music_play();
    }
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

  // Start music if clicked and not already started
  window.onmousedown=function(e)
  {
    e.preventDefault();

    if (!gs.music)
    {
      gs.music=true;
      music_play();
    }
  };

  // Web Monetization
  setupmonetization();

  // Set up tiles canvas
  gs.canvas=document.getElementById("tiles");
  gs.ctx=gs.canvas.getContext("2d");

  // Set up sprites canvas
  gs.scanvas=document.getElementById("sprites");
  gs.sctx=gs.scanvas.getContext("2d");

  window.addEventListener("resize", function() { playfieldsize(); });

  playfieldsize();

  // Set up intro animation callback
  gs.timeline.reset().add(10*1000, undefined).addcallback(intro);

  // Once image has loaded, start timeline for intro
  gs.tilemap=new Image;
  gs.tilemap.onload=function()
  {
    // Create a flipped version of the spritesheet
    // https://stackoverflow.com/questions/21610321/javascript-horizontally-flip-an-image-object-and-save-it-into-a-new-image-objec
    var c=document.createElement('canvas');
    var ctx=c.getContext('2d');
    c.width=gs.tilemap.width;
    c.height=gs.tilemap.height;
    ctx.scale(-1, 1);
    ctx.drawImage(gs.tilemap, -gs.tilemap.width, 0);

    gs.tilemapflip=new Image;
    gs.tilemapflip.onload=function()
    {
      // Start intro
      gs.timeline.begin(0);
    };
    gs.tilemapflip.src=c.toDataURL();
  };
  gs.tilemap.src=tilemap;
}

// Run the init() once page has loaded
window.onload=function() { init(); };

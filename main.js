// JS 13k 2022 entry

// Global constants
const XMAX=320;
const YMAX=180;
const TILESIZE=16;
const TILESPERROW=10;

const KEYLEFT=1;
const KEYUP=2;
const KEYRIGHT=4;
const KEYDOWN=8;
const KEYACTION=16;

const HEALTHFLY=8;
const HEALTHGRUB=3;

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
// mushroom
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
  keystate:0,
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

  // Tiles
  tiles:[], // copy of current level (to allow destruction)

  // Characters
  chars:[],
  anim:8, // time until next character animation frame

  // Game state
  state:2, // state machine, 0=intro, 1=menu, 2=playing, 3=complete

  // Debug flag
  debug:false
};

// Clear keyboard input state
function clearinputstate()
{
  gs.keystate=0;
}

// Check if an input is set in keyboard input state
function ispressed(keybit)
{
  return ((gs.keystate&keybit)!=0);
}

// Update the player key state
function updatekeystate(e, dir)
{
  switch (e.which)
  {
    case 37: // cursor left
    case 65: // A
    case 90: // Z
      if (dir==1)
        gs.keystate|=KEYLEFT;
      else
        gs.keystate&=~KEYLEFT;

      e.preventDefault();
      break;

    case 38: // cursor up
    case 87: // W
    case 59: // semicolon
      if (dir==1)
        gs.keystate|=KEYUP;
      else
        gs.keystate&=~KEYUP;

      e.preventDefault();
      break;

    case 39: // cursor right
    case 68: // D
    case 88: // X
      if (dir==1)
        gs.keystate|=KEYRIGHT;
      else
        gs.keystate&=~KEYRIGHT;

      e.preventDefault();
      break;

    case 40: // cursor down
    case 83: // S
    case 190: // dot
      if (dir==1)
        gs.keystate|=KEYDOWN;
      else
        gs.keystate&=~KEYDOWN;

      e.preventDefault();
      break;

    case 13: // enter
    case 32: // space
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
        var obj={id:(tile-1), x:(x*TILESIZE), y:(y*TILESIZE), flip:false, del:false};

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
            break;

          case 53: // fly
          case 54:
            obj.health=HEALTHFLY;
            gs.chars.push(obj);
            break;

          case 55: // grub
          case 56:
            obj.health=HEALTHGRUB;
            gs.chars.push(obj);
            break;

          default:
            gs.chars.push(obj); // Everything else
            break;
        }
      }
    }
  }

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
    drawsprite(gs.shots[i]);
}

// Check if player has left the map
function offmapcheck()
{
  if ((gs.x<0) || (gs.x>gs.width*TILESIZE) || (gs.y>gs.height*TILESIZE))
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
}

// Move animation frame onwards
function updateanimation()
{
  if (gs.anim==0)
  {
    // Player animation
    if (gs.hs!=0)
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

function guncheck()
{
  var i;

  // Cool gun down
  if (gs.gunheat>0) gs.gunheat--;

  // Check for having gun and want to use it
  if ((gs.gun==true) && (gs.gunheat==0) && (gs.keystate!=0) && (ispressed(KEYACTION)))
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
          case 53: // fly
          case 54:
            gs.chars[id].health--;
            if (gs.chars[id].health<=0)
              gs.chars[id].del=true;

            gs.shots[i].dir=0;
            gs.shots[i].ttl=3;
            break;

          case 55: // grub
          case 56:
            gs.chars[id].health--;
            if (gs.chars[id].health<=0)
              gs.chars[id].del=true;

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

// Update player movements
function updatemovements()
{
  // Check if player has left the map
  offmapcheck();

  // Check if player on the ground or falling
  groundcheck();

  // Process jumping
  jumpcheck();

  // Move player by appropriate amount, up to a collision
  collisioncheck();

  // If no input detected, slow the player using friction
  standcheck();

  // Check for gun usage
  guncheck();

  // When a horizontal movement key is pressed, adjust players horizontal speed and direction
  if (gs.keystate!=0)
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

// Update function called once per frame
function update()
{
  // Apply keystate/physics to player
  updatemovements();

  // Update other character movements / AI
  // TODO
  // updatecharAI();

  // Check for player/character/collectable collisions
  updateplayerchar();
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
  gs.ctx.clearRect(0, 0, gs.canvas.width, gs.canvas.height);

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
    if (gs.state!=2)
      return;
  }

  // Remember when we were last called
  gs.lasttime=timestamp;

  // Request we are called on the next frame, but only if still playing
  if (gs.state==2)
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

  gs.tilemap=new Image;
  gs.tilemap.onload=function() {loadlevel(0); window.requestAnimationFrame(rafcallback);};
  gs.tilemap.src=tilemap;
}

// Run the init() once page has loaded
window.onload=function() { init(); };

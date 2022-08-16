// JS 13k 2022 entry

// Global constants
const xmax=320;
const ymax=180;
const tilesize=16;
const tilesperrow=10;

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
// gate
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
  sx:0, // start x position (for current level)
  sy:0, // start y position (for current level)
  vs:0, // vertical speed
  hs:0, // horizontal speed
  jump:false, // jumping
  fall:false, // falling
  dir:0, //direction (-1=left, 0=none, 1=right)

  // Level attributes
  level:0, // Level number (0 based)
  width:0, // Width in tiles
  height:0, // height in tiles

  // Characters
  chars:[],

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
        gs.keystate|=1;
      else
        gs.keystate&=~1;

      e.preventDefault();
      break;

    case 38: // cursor up
    case 87: // W
    case 59: // semicolon
      if (dir==1)
        gs.keystate|=2;
      else
        gs.keystate&=~2;

      e.preventDefault();
      break;

    case 39: // cursor right
    case 68: // D
    case 88: // X
      if (dir==1)
        gs.keystate|=4;
      else
        gs.keystate&=~4;

      e.preventDefault();
      break;

    case 40: // cursor down
    case 83: // S
    case 190: // dot
      if (dir==1)
        gs.keystate|=8;
      else
        gs.keystate&=~8;

      e.preventDefault();
      break;

    case 13: // enter
    case 32: // space
      if (dir==1)
        gs.keystate|=16;
      else
        gs.keystate&=~16;

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
  var ratio=xmax/ymax;
  var width=Math.floor(height*ratio);
  var top=0;
  var left=Math.floor((window.innerWidth/2)-(width/2));

  if (width>window.innerWidth)
  {
    width=window.innerWidth;
    ratio=ymax/xmax;
    height=Math.floor(width*ratio);

    left=0;
    top=Math.floor((window.innerHeight/2)-(height/2));
  }
  
  gs.scale=(height/ymax);

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
  // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
  gs.ctx.drawImage(gs.tilemap, (tileid*tilesize) % (tilesperrow*tilesize), Math.floor((tileid*tilesize) / (tilesperrow*tilesize))*tilesize, tilesize, tilesize,
    x, y, tilesize, tilesize);
}

// Load level
function loadlevel(level)
{
  gs.level=level;

  gs.width=parseInt(levels[gs.level].width, 10);
  gs.height=parseInt(levels[gs.level].height, 10);

  gs.chars=[];

  // Find chars
  for (var y=0; y<gs.height; y++)
  {
    for (var x=0; x<gs.width; x++)
    {
      var tile=parseInt(levels[gs.level].chars[(y*gs.width)+x]||0, 10);

      if (tile!=0)
      {
        var obj={id:(tile-1), x:(x*tilesize), y:(y*tilesize)};

        switch (tile-1)
        {
          case 51: // Bee
          case 52:
          case 53: // Fly
          case 54:
          case 55: // Grub
          case 56:
            gs.chars.push(obj);
            break;

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
            break;

          default:
            break;
        }
      }
    }
  }
}

// Draw level
function drawlevel()
{
  for (var y=0; y<gs.height; y++)
  {
    for (var x=0; x<gs.width; x++)
    {
      var tile=parseInt(levels[gs.level].tiles[(y*gs.width)+x]||1, 10);
      drawtile(tile-1, x*tilesize, y*tilesize);
    }
  }

  write(gs.ctx, 10, 10, "Level "+(gs.level+1), 1, "rgb(0,0,0)");
}

// Draw chars
function drawchars()
{
  for (var id=0; id<gs.chars.length; id++)
    drawtile(gs.chars[id].id, gs.chars[id].x, gs.chars[id].y);
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
  gs.sctx=gs.canvas.getContext("2d");

  window.addEventListener("resize", function() { playfieldsize(); });

  playfieldsize();

  gs.tilemap=new Image;
  gs.tilemap.onload=function() {loadlevel(0); drawlevel(); drawchars();};
  gs.tilemap.src=tilemap;
}

// Run the init() once page has loaded
window.onload=function() { init(); };

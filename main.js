// JS 13k 2022 entry

// Global constants
const xmax=640;
const ymax=360;
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
  canvas:null,
  ctx:null,
  scale:1,
  tilemap:null,

  // Main character
  keystate:0,
  x:0, // x position
  y:0, // y position
  vs:0, // vertical speed
  hs:0, // horizontal speed
  jump:false, // jumping
  fall:false, // falling
  dir:0, //direction (-1=left, 0=none, 1=right)

  level:0,

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
  var aspectratio=xmax/ymax;
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

  gs.canvas.style.top=top+"px";
  gs.canvas.style.left=left+"px";
  gs.canvas.style.transformOrigin='0 0';
  gs.canvas.style.transform='scale('+gs.scale+')';
}

// Draw tile
function drawtile(tileid, x, y)
{
  // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
  gs.ctx.drawImage(gs.tilemap, (tileid*tilesize) % (tilesperrow*tilesize), Math.floor((tileid*tilesize) / (tilesperrow*tilesize))*tilesize, tilesize, tilesize,
    x, y, tilesize, tilesize);
}

// Draw level
function drawlevel()
{
  var width=parseInt(levels[gs.level].width);
  var height=parseInt(levels[gs.level].height);

  for (var y=0; y<height; y++)
  {
    for (var x=0; x<width; x++)
    {
      var tile=parseInt(levels[gs.level].tiles[(y*width)+x]||1);
      drawtile(tile-1, x*tilesize, y*tilesize);

      tile=parseInt(levels[gs.level].chars[(y*width)+x]||0);
      if (tile!=0)
        drawtile(tile-1, x*tilesize, y*tilesize);
    }
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

  // Set up canvas
  gs.canvas=document.getElementById("canvas");
  gs.ctx=gs.canvas.getContext("2d");

  window.addEventListener("resize", function() { playfieldsize(); });

  playfieldsize();

  gs.tilemap=new Image;
  gs.tilemap.onload=function() {drawlevel();};
  gs.tilemap.src=tilemap;
}

// Run the init() once page has loaded
window.onload=function() { init(); };

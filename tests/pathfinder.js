// A* algorithm from pseudocode in Wireframe magazine issue 48, by Paul Roberts

var level={width:4, height:4, data:[0,0,0,0, 1,1,0,0, 0,0,0,0, 0,0,0,0]};
var openlist=[];
var closedlist=[];
var usedlist=[];
var source=-1;
var destination=-1;
var dx=-1;
var dy=-1;

function issolid(x, y)
{
  // Out of bounds check
  if ((x<0) || (x>=level.width) || (y<0) || (y>=level.height))
    return true;

  // Solid check
  return (level.data[(y*level.width)+x]==1);
}

function manhattan_cost(x1, y1, x2, y2)
{
  return (Math.abs(x1-x2)+Math.abs(y1-y2));
}

function addnode(id, x, y, prev, acc)
{
  var g=acc; // Cost to get here
  var h=manhattan_cost(x, y, dx, dy);
  var f=g+h; // Final cost

  openlist.push({id:id, x:x, y:y, p:prev, g:g, h:h, f:f});

  usedlist[(y*level.width)+x]=1;
}

function findcheapestopenlist()
{
  var cost=-1;
  var idx=-1;

  for (var i=0; i<openlist.length; i++)
  {
    if ((cost==-1) || (openlist[i].f<cost))
    {
      cost=openlist[i].f;
      idx=i;
    }
  }

  return openlist[idx];
}

// Is given node id in the openlist list
function isopen(id)
{
  for (var i=0; i<openlist.length; i++)
    if (openlist[i].id==id) return true;

  return false;
}

// Is given node id in the closedlist list
function isclosed(id)
{
  for (var i=0; i<closedlist.length; i++)
    if (closedlist[i].id==id) return true;

  return false;
}

function movetoclosedlist(id)
{
  // Find id in openlist list
  for (var i=0; i<openlist.length; i++)
    if (openlist[i].id==id)
    {
      usedlist[(openlist[i].y*level.width)+openlist[i].x]=2;
      closedlist.push(JSON.parse(JSON.stringify(openlist[i])));
      openlist.splice(i, 1);

      return;
    }
}

function findparent(id)
{
  var i;

  for (i=0; i<closedlist.length; i++)
    if (closedlist[i].id==id)
      return closedlist[i].p;

  for (i=0; i<openlist.length; i++)
    if (openlist[i].id==id)
      return openlist[i].p;

  return -1;
}

function retracepath()
{
  var path=""+destination;
  var prev=findparent(destination);
  
  while (prev!=-1)
  {
    path=""+prev+"->"+path;
    prev=findparent(prev);
  }

  document.write(path);

  path="<table>";
  for (y=0; y<level.height; y++)
  {
    path+="<tr>";
    for (x=0; x<level.width; x++)
    {
      path+="<td style='font-weight:bold; text-align:center; background-color:";
      if (issolid(x, y))
      {
        path+="black; color:magenta; background:repeating-linear-gradient(45deg,black,black 2px, white 2px, white 4px)";
      }
      else
      {
        switch (usedlist[(y*level.width)+x]||0)
        {
          case 1: path+="green"; break;
          case 2: path+="red"; break;
          default: path+="gray"; break;
        }
      }
      path+=";'>"+(y*level.width+x)+"</td>";
    }
    path+="</tr>";
  }
  path+="</table>";
  document.write(path);
}

function init(src, dest)
{
  var n={};
  var nx=Math.floor(src%level.width);
  var ny=Math.floor(src/level.width);
  var c=-1;
  var cx=-1;
  var cy=-1;

  openlist=[];
  closedlist=[];
  usedlist=[];

  dx=Math.floor(dest%level.width);
  dy=Math.floor(dest/level.width);

  source=src;
  destination=dest;

  // Add source to openlist list
  addnode(source, nx, ny, -1, 0);
  n=findcheapestopenlist();

  // While openlist list has nodes to search
  while ((n.id!=dest) && (openlist.length>0))
  {
    // Set n to cheapest node from openlist list
    n=findcheapestopenlist();

    // Check if n is the target node
    if (n.id==dest) break;

    // Check for unexplored nodes connecting to n
    c=n.id-level.width; // Above
    cx=n.x;
    cy=n.y-1;
    if ((!issolid(cx, cy)) && (!isopen(c)) && (!isclosed(c)))
      addnode(c, cx, cy, n.id, n.f+1);

    c=n.id+1; // Right
    cx=n.x+1;
    cy=n.y;
    if ((!issolid(cx, cy)) && (!isopen(c)) && (!isclosed(c)))
      addnode(c, cx, cy, n.id, n.f+1);

    c=n.id+level.width; // Below
    cx=n.x;
    cy=n.y+1;
    if ((!issolid(cx, cy)) && (!isopen(c)) && (!isclosed(c)))
      addnode(c, cx, cy, n.id, n.f+1);

    c=n.id-1; // Left
    cx=n.x-1;
    cy=n.y;
    if ((!issolid(cx, cy)) && (!isopen(c)) && (!isclosed(c)))
      addnode(c, cx, cy, n.id, n.f+1);

    // Move n to the closedlist list
    movetoclosedlist(n.id);
  }

  document.body.innerHTML="";

  if (n.id==dest)
  {
    document.write("Path found<br/>");
    retracepath();
  }
  else
    document.write("No path found");
}

window.onload=function() { init(12, 0); };

// A* algorithm from pseudocode in Wireframe magazine issue 48, by Paul Roberts

var level={width:8, height:9, tiles:[
  0,0,0,0,0,0,0,0,
  0,1,1,0,1,1,1,1,
  0,1,0,0,0,0,0,0,
  0,1,1,1,1,0,1,1,
  0,1,0,0,0,0,0,0,
  0,1,0,1,1,1,1,1,
  0,1,0,0,0,0,0,0,
  0,1,1,1,1,1,1,0,
  0,0,0,0,0,0,0,0]};
var openlist=[];
var closedlist=[];
var usedlist=[];
var dx=-1;
var dy=-1;

function issolid(x, y)
{
  // Out of bounds check
  if ((x<0) || (x>=level.width) || (y<0) || (y>=level.height))
    return true;

  // Solid check
  return (level.tiles[(y*level.width)+x]==1);
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

// Get index on given list
function getidx(givenlist, id)
{
  for (var i=0; i<givenlist.length; i++)
  if (givenlist[i].id==id) return i;

  return -1;
}

// Is given node id on the openlist
function isopen(id)
{
  for (var i=0; i<openlist.length; i++)
    if (openlist[i].id==id) return true;

  return false;
}

// Is given node id on the closedlist
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
    {
      usedlist[closedlist[i].x+(closedlist[i].y*level.width)]=3;
      return closedlist[i].p;
    }

  for (i=0; i<openlist.length; i++)
    if (openlist[i].id==id)
    {
      usedlist[openlist[i].x+(openlist[i].y*level.width)]=3;
      return openlist[i].p;
    }

  return -1;
}

function retracepath(dest)
{
  var path=""+dest;
  var prev=findparent(dest);
  var steps=0;
  
  while (prev!=-1)
  {
    steps++;
    path=""+prev+"->"+path;
    prev=findparent(prev);
  }

  document.write("In "+steps+" step(s) <br/>"+path);

  path="<table>";
  for (y=0; y<level.height; y++)
  {
    path+="<tr>";
    for (x=0; x<level.width; x++)
    {
      path+="<td style='font-weight:bold; text-align:center; background-color:";
      if (issolid(x, y))
      {
        path+="black; color:rgba(0,0,0,0); background:repeating-linear-gradient(45deg,black,black 2px, white 2px, white 4px)";
      }
      else
      {
        switch (usedlist[(y*level.width)+x]||0)
        {
          case 1: path+="lightblue"; break; // Open list
          case 2: path+="tomato"; break; // Closed list
          case 3: path+="lightgreen"; break; // Found path
          default: path+="lightgray"; break; // Unvisited
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

  document.body.innerHTML="";
  document.write("Looking for path from "+src+" to "+dest+"<br/><br/>");

  // Add source to openlist list
  addnode(src, nx, ny, -1, 0);
  n=findcheapestopenlist();

  // While openlist list has nodes to search
  while ((n.id!=dest) && (openlist.length>0))
  {
    // Set n to cheapest node from openlist list
    n=findcheapestopenlist();

    // Check if n is the target node
    if (n.id==dest) break;

    // Check for unexplored nodes connecting to n
    [
      [0, -1], // Above
      [1, 0],  // Right
      [0, 1],  // Below
      [-1 , 0] // Left
    ].forEach(function(dir)
    {
      c=n.id+(dir[0]+(dir[1]*level.width));
      cx=n.x+dir[0];
      cy=n.y+dir[1];

      // If it's a valid square, not solid, nor on any list, then add it
      if (!issolid(cx, cy) && (!isopen(c)) && (!isclosed(c)))
        addnode(c, cx, cy, n.id, n.f+1); // Add to open list

      // NOTE : No cheaper path replacements done. This is when a cheaper path
      // is found to get to a certain point already visited. If found the costs
      // and parent data should be updated.
    });

    // Move n to the closedlist list
    movetoclosedlist(n.id);
  }

  if (n.id==dest)
  {
    document.write("Path found<br/>");
    retracepath(dest);
  }
  else
    document.write("No path found");
}

window.onload=function() { init(69, 7); };

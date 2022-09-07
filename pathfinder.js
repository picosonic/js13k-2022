// A* algorithm from pseudocode in Wireframe magazine issue 48
// by Paul Roberts
function pathfinder(src, dest)
{
  var openlist=[]; // List of node ids yet to visit
  var closedlist=[]; // List of visited node ids
  const dx=Math.floor(dest%gs.width); // Destination X grid position
  const dy=Math.floor(dest/gs.width); // Destination Y grid position

  var n={}; // Next node
  const nx=Math.floor(src%gs.width); // Next node X grid position
  const ny=Math.floor(src/gs.width); // Next node Y grid position
  var c=-1; // Check node id
  var cx=-1; // Check node X grid position
  var cy=-1; // Check node Y grid position

  // Check if this grid position is solid (out of bounds to path)
  function issolid(x, y)
  {
    // Out of bounds check
    if ((x<0) || (x>=gs.width) || (y<0) || (y>=gs.height))
      return true;
  
    // Solid check
    return (gs.tiles[(y*gs.width)+x]||0!=0);
  }

  // Determine cost (rough distance) from x1,y1 to x2,y2
  function manhattan_cost(x1, y1, x2, y2)
  {
    return (Math.abs(x1-x2)+Math.abs(y1-y2));
  }

  // Add node to open list
  function addnode(id, x, y, prev, acc)
  {
    var g=acc; // Cost to get here
    var h=manhattan_cost(x, y, dx, dy);
    var f=g+h; // Final cost
  
    openlist.push({id:id, x:x, y:y, p:prev, g:g, h:h, f:f});
  }

  // Find the node on the open list with the lowest value
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

  // Get index to node id on given list
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

  // Move given node from open to closed list
  function movetoclosedlist(id)
  {
    // Find id in openlist list
    for (var i=0; i<openlist.length; i++)
      if (openlist[i].id==id)
      {
        closedlist.push(JSON.parse(JSON.stringify(openlist[i])));
        openlist.splice(i, 1);
  
        return;
      }
  }

  // Find parent of given node, to backtrace path
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

  // Retrace path back to start position
  function retracepath(dest)
  {
    var finalpath=[];

    // Check for path being found
    if (n.id==dest)
    {
      var prev=findparent(dest);
      finalpath.unshift(dest);

      while (prev!=-1)
      {
        finalpath.unshift(prev);

        prev=findparent(prev);
      }
    }

    return finalpath;
  }

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
      c=n.id+(dir[0]+(dir[1]*gs.width));
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

  return retracepath(dest);
}

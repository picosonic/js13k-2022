// JS 13k 2022 entry

// Handle resize events
function playfieldsize()
{
  // TODO
}

// Update the player key state
function updatekeystate(e, dir)
{
  // TODO
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

  window.addEventListener("resize", function() { playfieldsize(); });

  playfieldsize();
}

// Run the init() once page has loaded
window.onload=function() { init(); };

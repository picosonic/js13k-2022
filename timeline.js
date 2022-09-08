// Timeline object
class timelineobj
{

  constructor()
  {
    this.timeline=[]; // Array of actions
    this.timelinepos=0; // Point in time of last update
    this.timelineepoch=0; // Epoch when timeline was started
    this.callback=null; // Optional callback on each timeline "tick"
    this.running=false; // Start in non-running state
    this.looped=0; // Completed iterations
    this.loop=1; // Number of times to loop, 0 means infinite
  }

  // Add a new function to timeline with a given start time
  add(itemstart, newitem)
  {
    var newobj={start:itemstart, item:newitem, done:false};

    this.timeline.push(newobj);

    // Keep timeline sorted by start time of items
    this.timeline.sort(function(a,b) {return ((b.start<a.start)?1:(b.start==a.start)?0:-1)});

    // Allow chaining
    return this;
  }

  // Add a timeline callback
  addcallback(item)
  {
    this.callback=item;

    // Allow chaining
    return this;
  }

  // Animation frame callback
  timelineraf(timestamp)
  {
    var remain=0;

    // Stop further processing if we're not running
    if (!this.running) return;

    // If this is the first call then record the epoch
    if (this.timelinepos==0)
      this.timelineepoch=timestamp;

    // Calculate delta time since timeline start
    var delta=timestamp-this.timelineepoch;

    // Look through timeline array for jobs not run which should have
    for (var i=0; i<this.timeline.length; i++)
    {
      if ((!this.timeline[i].done) && (this.timeline[i].start<delta))
      {
        this.timeline[i].done=true;

        // Only call function if it is defined
        if (this.timeline[i].item!=undefined)
          this.timeline[i].item();
      }

      // Keep a count of all remaining jobs if still running
      if ((this.running==true) && ((this.timeline.length-1)>=i) && (!this.timeline[i].done))
        remain++;
    }

    // If a callback was requested, then call it
    if (this.callback!=null)
    {
      // If there's only a single undefined function on the timeline and it doesn't start at 0, then call with percentage
      if ((this.timeline.length==1) && (this.timeline[0].item==undefined) && (this.timeline[0].start>0))
        this.callback((delta/this.timeline[0].start)*100);
      else
        this.callback();
    }

    // Record new timeline position
    this.timelinepos=timestamp;

    // If there is more jobs then request another callback
    if ((this.timelinepos==this.timelineepoch) || (remain>0))
    {
      window.requestAnimationFrame(this.timelineraf.bind(this));
    }
    else
    {
      this.looped++;

      // Check for more iterations
      if ((this.loop==0) || (this.looped<this.loop))
      {
        this.running=false; // Prevent running until we've reset

        this.timelinepos=0;
        this.timelineepoch=0;

        // Look through timeline, resetting done flag
        for (var i=0; i<this.timeline.length; i++)
          this.timeline[i].done=false;

        this.running=true; // Start next iteration
        window.requestAnimationFrame(this.timelineraf.bind(this));
      }
      else
        this.running=false;
    }
  }

  // Start the timeline running
  begin(loop=1)
  {
    this.looped=0;
    this.loop=(loop==undefined?1:loop);

    this.running=true;

    window.requestAnimationFrame(this.timelineraf.bind(this));
  }

  // Stop the timeline running
  end()
  {
    this.running=false;

    // Allow chaining
    return this;
  }

  // Reset the timeline to be used again
  reset()
  {
    this.running=false; // Start in non-running state

    this.timeline=[]; // Array of actions
    this.timelinepos=0; // Point in time of last update
    this.timelineepoch=0; // Epoch when timeline was started
    this.callback=null; // Optional callback on each timeline "tick"
    this.looped=0; // Completed iterations
    this.loop=1; // Number of times to loop, 0 means infinite

    // Allow chaining
    return this;
  }
}

// Wichmann-Hill pseudorandom number generator
function rng()
{
  // Create/initialise static seeds if they don't exist
  if (typeof rng.s1=='undefined')
  {
    // Ideally these should be fairly random, based on clock or higher entropy source
    //   these are from GC sploosh kaboom
    rng.s1=100;
    rng.s2=100;
    rng.s3=100;
  }

  // Advance linear congruential generators
  rng.s1=(171*rng.s1) % 30269;
  rng.s2=(172*rng.s2) % 30307;
  rng.s3=(170*rng.s3) % 30323;

  // Sum the generators to get a fractional number between 0 and 1
  //   from a pseudorandom sequence with a period of 6,953,607,871,644 cycles
  return ((rng.s1/30269) + (rng.s2/30307) + (rng.s3/30323)) % 1;
}

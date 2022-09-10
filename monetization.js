// Web monetization

var monetized=false;

function setupmonetization()
{
  // Check if browser supports it
  if (document['monetization'])
  {
    // Check for monetization being started
    if (document['monetization'].state==='started')
      monetized=true;
    
    // Set up event listeners
    document['monetization'].addEventListener('monetizationstart', function() { monetized=true; });
    document['monetization'].addEventListener('monetizationstop', function() { monetized=false; });
  }
}
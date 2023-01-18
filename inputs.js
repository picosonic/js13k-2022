// Input processing

// Clear input state
function clearinputstate()
{
  gs.keystate=KEYNONE;
  gs.padstate=KEYNONE;
}

// Check if an input is set in keyboard input state
function ispressed(keybit)
{
  return (((gs.keystate&keybit)!=0) || ((gs.padstate&keybit)!=0));
}

///////////
// Keyboard
///////////

// Update the player key state
function updatekeystate(e, dir)
{
  switch (e.code)
  {
    case "ArrowLeft": // cursor left
    case "KeyA": // A
    case "KeyZ": // Z
      if (dir==1)
        gs.keystate|=KEYLEFT;
      else
        gs.keystate&=~KEYLEFT;

      e.preventDefault();
      break;

    case "ArrowUp": // cursor up
    case "KeyW": // W
    case "Semicolon": // semicolon
      if (dir==1)
        gs.keystate|=KEYUP;
      else
        gs.keystate&=~KEYUP;

      e.preventDefault();
      break;

    case "ArrowRight": // cursor right
    case "KeyD": // D
    case "KeyX": // X
      if (dir==1)
        gs.keystate|=KEYRIGHT;
      else
        gs.keystate&=~KEYRIGHT;

      e.preventDefault();
      break;

    case "ArrowDown": // cursor down
    case "KeyS": // S
    case "Period": // dot
      if (dir==1)
        gs.keystate|=KEYDOWN;
      else
        gs.keystate&=~KEYDOWN;

      e.preventDefault();
      break;

    case "Enter": // enter
    case "ShiftLeft": // L shift
    case "ShiftRight": // R shift
    case "Space": // space
      if (dir==1)
        gs.keystate|=KEYACTION;
      else
        gs.keystate&=~KEYACTION;

      e.preventDefault();
      break;

    case "KeyI": // I (for info/debug)
      if (dir==1)
        gs.debug=(!gs.debug);

      e.preventDefault();
      break;

    case "KeyM": // M (for music off)
      if (dir==1)
        music.nomore=true;

      e.preventDefault();
      break;

    default:
      break;
  }
}

///////////
// Gamepad
///////////

// Scan for any connected gamepads
function gamepadscan()
{
  var gamepads=navigator.getGamepads();
  var found=0;

  var gleft=false;
  var gright=false;
  var gup=false;
  var gdown=false;
  var gjump=false;

  for (var padid=0; padid<gamepads.length; padid++)
  {
    // Only support first found gamepad
    if ((found==0) && (gamepads[padid] && gamepads[padid].connected))
    {
      found++;

      // If we don't already have this one, add mapping for it
      if (gs.gamepad!=padid)
      {
        //console.log("Found new gamepad "+padid+" '"+gamepads[padid].id+"'");

        gs.gamepad=padid;

        if (gamepads[padid].mapping==="standard")
        {
          // Browser supported "standard" gamepad
          gs.gamepadbuttons[0]=14; // left (left) d-left
          gs.gamepadbuttons[1]=15; // right (left) d-right
          gs.gamepadbuttons[2]=12; // top (left) d-up
          gs.gamepadbuttons[3]=13; // bottom (left) d-down
          gs.gamepadbuttons[4]=0;  // bottom button (right) x

          gs.gamepadaxes[0]=0; // left/right axis
          gs.gamepadaxes[1]=1; // up/down axis
          gs.gamepadaxes[2]=2; // cam left/right axis
          gs.gamepadaxes[3]=3; // cam up/down axis
        }
        else
        if (gamepads[padid].id=="054c-0268-Sony PLAYSTATION(R)3 Controller")
        {
          // PS3 DualShock 3
          gs.gamepadbuttons[0]=15; // left (left) d-left
          gs.gamepadbuttons[1]=16; // right (left) d-right
          gs.gamepadbuttons[2]=13; // top (left) d-up
          gs.gamepadbuttons[3]=14; // bottom (left) d-down
          gs.gamepadbuttons[4]=0;  // bottom button (right) x

          gs.gamepadaxes[0]=0; // left/right axis
          gs.gamepadaxes[1]=1; // up/down axis
          gs.gamepadaxes[2]=3; // cam left/right axis
          gs.gamepadaxes[3]=4; // cam up/down axis
        }
        else
        if (gamepads[padid].id=="045e-028e-Microsoft X-Box 360 pad")
        {
          // XBOX 360
          // 8Bitdo GBros. Adapter (XInput mode)
          gs.gamepadbuttons[0]=-1; // left (left) d-left
          gs.gamepadbuttons[1]=-1; // right (left) d-right
          gs.gamepadbuttons[2]=-1; // top (left) d-up
          gs.gamepadbuttons[3]=-1; // bottom (left) d-down
          gs.gamepadbuttons[4]=0;  // bottom button (right) x

          gs.gamepadaxes[0]=6; // left/right axis
          gs.gamepadaxes[1]=7; // up/down axis
          gs.gamepadaxes[2]=3; // cam left/right axis
          gs.gamepadaxes[3]=4; // cam up/down axis
        }
        else
        if (gamepads[padid].id=="0f0d-00c1-  Switch Controller")
        {
          // Nintendo Switch
          gs.gamepadbuttons[0]=-1; // left (left) d-left
          gs.gamepadbuttons[1]=-1; // right (left) d-right
          gs.gamepadbuttons[2]=-1; // top (left) d-up
          gs.gamepadbuttons[3]=-1; // bottom (left) d-down
          gs.gamepadbuttons[4]=1;  // bottom button (right) x

          gs.gamepadaxes[0]=4; // left/right axis
          gs.gamepadaxes[1]=5; // up/down axis
          gs.gamepadaxes[2]=2; // cam left/right axis
          gs.gamepadaxes[3]=3; // cam up/down axis
        }
        else
        if ((gamepads[padid].id=="054c-05c4-Sony Computer Entertainment Wireless Controller") || (gamepads[padid].id=="045e-02e0-8Bitdo SF30 Pro") || (gamepads[padid].id=="045e-02e0-8BitDo GBros Adapter"))
        {
          // PS4 DualShock 4
          // 8Bitdo SF30 Pro GamePad (XInput mode)
          // 8Bitdo GBros. Adapter (XInput mode)
          gs.gamepadbuttons[0]=-1; // left (left) d-left
          gs.gamepadbuttons[1]=-1; // right (left) d-right
          gs.gamepadbuttons[2]=-1; // top (left) d-up
          gs.gamepadbuttons[3]=-1; // bottom (left) d-down
          gs.gamepadbuttons[4]=0;  // bottom button (right) x

          gs.gamepadaxes[0]=0; // left/right axis
          gs.gamepadaxes[1]=1; // up/down axis
          gs.gamepadaxes[2]=3; // cam left/right axis
          gs.gamepadaxes[3]=4; // cam up/down axis
        }
        else
        if ((gamepads[padid].id=="054c-0ce6-Sony Interactive Entertainment Wireless Controller") || (gamepads[padid].id=="054c-0ce6-Wireless Controller"))
        {
          // PS5 DualSense
          gs.gamepadbuttons[0]=-1; // left (left) d-left
          gs.gamepadbuttons[1]=-1; // right (left) d-right
          gs.gamepadbuttons[2]=-1; // top (left) d-up
          gs.gamepadbuttons[3]=-1; // bottom (left) d-down
          gs.gamepadbuttons[4]=1;  // bottom button (right) x

          gs.gamepadaxes[0]=0; // left/right axis
          gs.gamepadaxes[1]=1; // up/down axis
          gs.gamepadaxes[2]=2; // cam left/right axis
          gs.gamepadaxes[3]=5; // cam up/down axis
        }
        else
        if ((gamepads[padid].id=="057e-2009-Pro Controller") || (gamepads[padid].id=="18d1-9400-Google Inc. Stadia Controller") || (gamepads[padid].id=="18d1-9400-StadiaZYSW-7992"))
        {
          // Nintendo Switch Pro Controller
          // 8Bitdo SF30 Pro GamePad (Switch mode)
          // 8Bitdo GBros. Adapter (Switch mode)
          // Google Stadia Controller (Wired and Bluetooth)
          gs.gamepadbuttons[0]=-1; // left (left) d-left
          gs.gamepadbuttons[1]=-1; // right (left) d-right
          gs.gamepadbuttons[2]=-1; // top (left) d-up
          gs.gamepadbuttons[3]=-1; // bottom (left) d-down
          gs.gamepadbuttons[4]=0;  // bottom button (right) x

          gs.gamepadaxes[0]=0; // left/right axis
          gs.gamepadaxes[1]=1; // up/down axis
          gs.gamepadaxes[2]=2; // cam left/right axis
          gs.gamepadaxes[3]=3; // cam up/down axis
        }
        else
        if (gamepads[padid].id=="2dc8-6100-8Bitdo SF30 Pro")
        {
          // 8Bitdo SF30 Pro GamePad (DInput mode)
          gs.gamepadbuttons[0]=-1; // left (left) d-left
          gs.gamepadbuttons[1]=-1; // right (left) d-right
          gs.gamepadbuttons[2]=-1; // top (left) d-up
          gs.gamepadbuttons[3]=-1; // bottom (left) d-down
          gs.gamepadbuttons[4]=1;  // bottom button (right) x

          gs.gamepadaxes[0]=0; // left/right axis
          gs.gamepadaxes[1]=1; // up/down axis
          gs.gamepadaxes[2]=2; // cam left/right axis
          gs.gamepadaxes[3]=3; // cam up/down axis
        }
        else
        {
          // Unknown non-"standard" mapping
          gs.gamepadbuttons[0]=-1; // left (left) d-left
          gs.gamepadbuttons[1]=-1; // right (left) d-right
          gs.gamepadbuttons[2]=-1; // top (left) d-up
          gs.gamepadbuttons[3]=-1; // bottom (left) d-down
          gs.gamepadbuttons[4]=-1;  // bottom button (right) x

          gs.gamepadaxes[0]=-1; // left/right axis
          gs.gamepadaxes[1]=-1; // up/down axis
          gs.gamepadaxes[2]=-1; // cam left/right axis
          gs.gamepadaxes[3]=-1; // cam up/down axis
        }
      }

      // Check analog axes
      for (var i=0; i<gamepads[padid].axes.length; i++)
      {
        var val=gamepads[padid].axes[i];

        if (i==gs.gamepadaxes[0])
        {
          gs.gamepadaxesval[0]=val;

          if (val<-0.5) // Left
            gleft=true;

          if (val>0.5) // Right
            gright=true;
        }

        if (i==gs.gamepadaxes[1])
        {
          gs.gamepadaxesval[1]=val;

          if (val<-0.5) // Up
            gup=true;

          if (val>0.5) // Down
            gdown=true;
        }

        if (i==gs.gamepadaxes[2])
          gs.gamepadaxesval[2]=val;

        if (i==gs.gamepadaxes[3])
          gs.gamepadaxesval[3]=val;
      }

      // Check buttons
      for (i=0; i<gamepads[padid].buttons.length; i++)
      {
        var val=gamepads[padid].buttons[i];
        var pressed=(val==1.0);

        if (typeof(val)=="object")
        {
          pressed=val.pressed;
          val=val.value;
        }

        if (pressed)
        {
          switch (i)
          {
            case gs.gamepadbuttons[0]: gleft=true; break;
            case gs.gamepadbuttons[1]: gright=true; break;
            case gs.gamepadbuttons[2]: gup=true; break;
            case gs.gamepadbuttons[3]: gdown=true; break;
            case gs.gamepadbuttons[4]: gjump=true; break;
            default: break;
          }
        }
      }

      // Update padstate
      if (gup)
        gs.padstate|=KEYUP;
      else
        gs.padstate&=~KEYUP;

      if (gdown)
        gs.padstate|=KEYDOWN;
      else
        gs.padstate&=~KEYDOWN;

      if (gleft)
        gs.padstate|=KEYLEFT;
      else
        gs.padstate&=~KEYLEFT;

      if (gright)
        gs.padstate|=KEYRIGHT;
      else
        gs.padstate&=~KEYRIGHT;

      if (gjump)
        gs.padstate|=KEYACTION;
      else
        gs.padstate&=~KEYACTION;
    }
  }

  // Detect disconnect
  if ((found==0) && (gs.gamepad!=-1))
  {
    //console.log("Disconnected gamepad "+padid);
    
    gs.gamepad=-1;
  }
}

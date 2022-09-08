var music={
  audioCtx:null,
  gainNode:null,
  panNode:null,
  f:[],
  notelen:(1/7),
  clocktime:1,
  nomore:false
};

// Note table as per BBC Micro user guide p.156
const B1 = 0;
const C1 = 4;
const Cs1 = 8;
const D1 = 12;
const Ds1 = 16;
const E1 = 20;
const F1 = 24;
const Fs1 = 28;
const G1 = 32;
const Gs1 = 36;
const A1 = 40;
const Bb1 = 44;

const B2 = 48;
const C2 = 52; // Middle C
const Cs2 = 56;
const D2 = 60;
const Ds2 = 64;
const E2 = 68;
const F2 = 72;
const Fs2 = 76;
const G2 = 80;
const Gs2 = 84;
const A2 = 88;
const Bb2 = 92;

const B3 = 96;
const C3 = 100;
const Cs3 = 104;
const D3 = 108;
const Ds3 = 112;
const E3 = 116;
const F3 = 120;
const Fs3 = 124;
const G3 = 128;
const Gs3 = 132;
const A3 = 136;
const Bb3 = 140;

const B4 = 144;
const C4 = 148;
const Cs4 = 152;
const D4 = 156;
const Ds4 = 160;
const E4 = 164;
const F4 = 168;
const Fs4 = 172;
const G4 = 176;
const Gs4 = 180;
const A4 = 184;
const Bb4 = 188;

const B5 = 192;
const C5 = 196;
const Cs5 = 200;
const D5 = 204;
const Ds5 = 208;
const E5 = 212;
const F5 = 216;
const Fs5 = 220;
const G5 = 224;
const Gs5 = 228;
const A5 = 232;
const Bb5 = 236;

const B6 = 240;
const C6 = 244;
const Cs6 = 248;
const D6 = 252;

function music_init()
{
  try
  {
    const AudioContext=window.AudioContext || window.webkitAudioContext;
    music.audioCtx=new AudioContext();

    // Add volume control
    music.gainNode=music.audioCtx.createGain();
    music.gainNode.connect(music.audioCtx.destination);
    music.gainNode.gain.setValueAtTime(0.050, music.audioCtx.currentTime);

    // Add audio panning
    music.panNode=music.audioCtx.createStereoPanner();
    music.panNode.connect(music.gainNode);

    // Create song based on Harp solo
    //  within Blue Danube (Op.314) by Johann Strauss II
    var ct=1; // clock time
    var i;

    for (i=0; i<2; i++)
    {
      music.f.push([D4, ct],[Bb2, ct++]);
      music.f.push([F4, ct++],[Bb4, ct++],[D5, ct++],[Bb4, ct++],[F4, ct++]);
    }

    for (i=0; i<2; i++)
    {
      music.f.push([C4, ct],[Ds2, ct++]);
      music.f.push([Ds4, ct++],[G4, ct++],[C5, ct++],[G4, ct++],[Ds4, ct++]);
    }

    for (i=0; i<2; i++)
    {
      (i==0)?music.f.push([A2, ct],[Ds4, ct++]):music.f.push([F2, ct],[Ds4, ct++]);
      music.f.push([F4, ct++],[A4, ct++],[C5, ct++],[A4, ct++],[F4, ct++]);
    }

    music.f.push([D4, ct],[Bb2, ct++]);
    music.f.push([F4, ct++],[Bb4, ct++],[D5, ct++],[Bb4, ct++],[F4, ct++]);
  
    music.f.push([C4, ct],[Ds4, ct]); ct+=2;
    music.f.push([Bb3, ct],[D4, ct]); ct+=2;
    music.f.push([F3, ct],[C4, ct]); ct+=2;

    for (i=0; i<2; i++)
    {
      music.f.push([D4, ct],[Bb2, ct++]);
      music.f.push([F4, ct++],[Bb4, ct++],[D5, ct++],[Bb4, ct++],[F4, ct++]);
    }

    music.f.push([C4, ct],[Ds2, ct++]);
    music.f.push([Ds4, ct++],[G4, ct++],[C5, ct++],[G4, ct++],[Ds4, ct++]);

    music.f.push([Cs4, ct],[E2, ct++]);
    music.f.push([E4, ct++],[G4, ct++],[Cs5, ct++],[G4, ct++],[E4, ct++]);

    music.f.push([D4, ct],[D2, ct++]);
    music.f.push([Fs4, ct++],[A4, ct++],[D5, ct++],[A4, ct++],[Fs4, ct++]);

    music.f.push([D4, ct],[D2, ct++]);
    music.f.push([G4, ct++],[Bb4, ct++],[D5, ct++],[Bb4, ct++],[G4, ct++]);

    music.f.push([D5, ct],[D2, ct]); ct+=2;
    music.f.push([Fs4, ct]); ct+=2;

    // Store how far time has progressed, to allow for looping
    music.clocktime=ct+2;
  }

  catch (e) {}
}

function music_play()
{
  try
  {
    // Inspired by https://github.com/xem/miniMusic

    // Do the init if it hasn't been done already
    if (music.audioCtx==null)
      music_init();

    // Process all the notes in the song
    for (var i in music.f)
    {
      var e=music.audioCtx.currentTime+(music.f[parseInt(i,10)][1]*music.notelen);
      var osc=music.audioCtx.createOscillator();

      // Pan the note to where it would sound like if played on a piano
      osc.connect(music.panNode);
      music.panNode.pan.setValueAtTime(((music.f[parseInt(i,10)][0]/245)*2)-1, e);

      osc.type='triangle';

      // Convert the note from BBC Micro "pitch" to frequency in Hz
      osc.frequency.value=65.41*Math.pow(2, ((music.f[parseInt(i,10)][0]-5)/4)/12);

      // Set the start and stop times for the oscillator
      osc.start(e);
      osc.stop(e+music.notelen);
    }

    if (!music.nomore)
      setTimeout(music_play, (music.notelen*1000)*(music.clocktime));
  }

  catch (e) {}
}

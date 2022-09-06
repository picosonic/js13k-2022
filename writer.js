// Text writer
function write(ctx, x, y, text, size, style)
{
  ctx.save();

  // Set fill style
  ctx.fillStyle=style;

  // Iterate through characters to write
  for (var i=0; i<text.length; i++)
  {
    var offs=(text.charCodeAt(i)-32);

    // Don't try to draw characters outside our font set
    if ((offs<0) || (offs>94))
      continue;

    // Draw "pixels"
    var px=0;
    var py=0;

    // Iterate through the 4 bytes (columns) used to define character
    for (var j=0; j<font_width; j++)
    {
      var dual=font_8bit[(offs*font_width)+j]||0;

      // Iterate through bits in byte
      for (var k=0; k<font_height; k++)
      {
        if (dual&(1<<(font_height-k)))
          ctx.fillRect(Math.floor(x+(i*font_width*size)+(px*size)), Math.floor(y+(size*py)), Math.ceil(size), Math.ceil(size));

        px++;
        if (px==font_width)
        {
          px=0;
          py++;
        }
      }
      ctx.stroke();
    }
  }

  ctx.restore();
}

function shadowwrite(ctx, x, y, text, size, style)
{
  write(ctx, x+(size/2), y+(size/2), text, size, "rgba(64,64,64,0.5)");
  write(ctx, x, y, text, size, style);
}


var colors = [

            // background, line, highlight line

            // red
            ["F5F0EA", "D1604E", "D1604E"],

            // graphite
            ["F5F0EA", "393D41", "393D41"],

            // blue
            ["F5F0EA", "4C739B", "4C739B"],
];

var paletteIndex;

function rb(a, b) {
    return a + (b - a) * fxrand();
}

function randomColor() {
  let r2 = int(rb(0, colors[paletteIndex].length));
  return ('#' + colors[paletteIndex][r2]);
}

// all the state that needs to be set/initialized before calling setup for the first time
function init() {
    fxrand = sfc32(...hashes)
    paletteIndex = Math.floor(rb(0, colors.length));
}

init();

function setup() {

  let chosenPalette;
  if (paletteIndex === 0) {
    chosenPalette = 'Red';
  } else if (paletteIndex === 1) {
    chosenPalette = 'Black';
  } else if (paletteIndex === 2) {
    chosenPalette = 'Blue';
  } else {
    chosenPalette = 'Unknown';
  }

  randomSeed(fxrand());

  var h = window.innerHeight;
  var w = h;

  // flip it if window is narrow width
  if (window.innerWidth < w) {
    w = window.innerWidth;
    h = w;
  }

  //console.log('width ' + w);
  //console.log('height ' + h);

  let block = w / (1 + 8 + 4*9 + 1);
  //console.log('block ' + block);
  let smalldim = (w / 200.0);
  //console.log('small dim ' + smalldim);

  createCanvas(w, h);

  //var smalldim =  Math.floor(Math.min(w, h));
  //console.log('small dim: ' + smalldim);
  //  I ve had to fuss with that on other projects too. Basically limit the canvas size slightly by a modulo of window size.
  // I tend to work in proportions, so dividing by 2, 4, 10, etc.

  background('#' + colors[paletteIndex][0]);
  stroke('#' + colors[paletteIndex][1]);
  noFill();
  //fill('#D1604E');
  strokeWeight(smalldim);

  let outer = block;

  // we start a rect at 0
  // and we have 8 more places we could possibly start other rects
  // choose a random number between 8 and 0, for how many more rectangls we will create
  // 1, 2, 3, 4, 5, 6, 7
  let numExtraRectsArr = [2,2,2,2,2,2,2,2,2,2,4,6,8];
  //console.log(numExtraRectsArr);
  shuffleArray(numExtraRectsArr);
  //console.log(numExtraRectsArr);
  let numExtraRects = numExtraRectsArr.pop();
  //console.log('total rects = ' + (numExtraRects+1));

  let startingPositions = [];
  for (let i  = 1; i <= 8; i++) {
    startingPositions.push(i);
  }

  let choices = [];
  for (let i = 0; i < numExtraRects; i++) {
    //console.log(startingPositions);
    shuffleArray(startingPositions);
    let chosen = startingPositions.pop();
    choices.push(chosen);
    //console.log('chosen = ' + chosen);
    //console.log(startingPositions);
  }

  //console.log(choices);
  choices.sort();
  //console.log(choices);

  let numRectsFilled = 0;
  if (choices.length === 0) {
    let numLinesDrawn = randomLines(outer, outer, 9*5*block-block, h - 2*outer, block, outer, smalldim);
    if (numLinesDrawn > 0) {
        numRectsFilled++;
    }
  } else {
      choices.push(9);
  
      let start = 0;
      let prev = 0;
      for (let i = 0; i < choices.length; i++) {
        let next = choices[i];
        let width = next - prev;
        //console.log('next rect start = ' + start);
        //console.log('next rect width = ' + width);
        // draw a rect from previous to 1 block before next
        let numLinesDrawn = randomLines(outer + start, outer, width*5*block-block, h - 2*outer, block, outer, smalldim);
        if (numLinesDrawn > 0) {
            numRectsFilled++;
        }

        start += width*5*block;
        prev = next;
      }
  }

  let filled = 'unknown';
  let totalRects = numExtraRects + 1;
  let percentFilled = numRectsFilled/((float)(totalRects));
  if (numRectsFilled === 0) {
    filled = 'None (rare)';
  } else if (numRectsFilled === totalRects) {
    filled = 'All';
  } else if (percentFilled >= 0.5) {
    filled = '> Half';
  } else {
    filled = '< Half';
  }

  options = {
  'Color': chosenPalette,
  '# of Columns': (numExtraRects+1),
  '# of Rectangles Filled': filled
  // none, low, high, all
  }

  //console.log(options);

  window.$fxhashFeatures = {
    ...options
  }
}

function randomLines(x, y, w, h, block, outer, smalldim) {
    let numLinesDrawn = 0;
    //smalldim = block/4;
    smalldim = block/4;
    // draw rect
    //fill('#F5F0EA');
    rect(x, y, w, h);

    let prev = false;
    let solid = fxrand() < 0.5;
    let alt = false;
    let solidStart = -1;
    // draw random lines going down
    for (let i = y; y < h + outer - smalldim/2; y+=smalldim) {
        if (!prev) {
            // it's blank above
            if (fxrand() < 0.0125) {
            //if (true) {
                // jackspot, start an alt
                if (alt) {
                    line(x, y, x+w,y);
                    numLinesDrawn++;
                }

                // jackpot, start a solid
                if (solid) {
                    if (solidStart === -1) {
                        //console.log('start solid ' + y);
                        solidStart = y;
                    }
                    line(x, y, x+w,y);
                    numLinesDrawn++;
                }

                // if you drew alt, flip it so you don't draw it next time
                alt = !alt;

                // currently drawing
                prev = true;
            }
        } else {
            // continue drawing the block 95% of the time
            if (fxrand() < 0.95) {

                // continue drawing alt
                if (alt) {
                    line(x, y, x+w,y);
                    numLinesDrawn++;
                } 

                // continue drawing solid
                if (solid) {
                    line(x, y, x+w,y);
                    numLinesDrawn++;
                }

                // if you drew alt, flip it so you don't draw it next time
                alt = !alt;

                // currently drawing
                prev = true;
            } else {

                // end this block
                prev = false;
                if (solid) {
                    //console.log('end solid ' + y);
                    // TODO: close the rectangle
                    //fill('#D1604E');
                    //rect(x, solidStart, w, y-solidStart);
                    //noFill();
                    solidStart = -1;
                }

                solid = fxrand() < 0.5;
            }
        }
    }
    if (solid && solidStart !== -1) {
        //console.log('end solid ' + y);
        // TODO: close the rectangle
        //fill('#D1604E');
        //rect(x, solidStart, w, y-solidStart);
        //noFill();
        solidStart = -1;
    }

    return numLinesDrawn;

}

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(fxrand() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

function windowResized() {
    clear();
    init();
    setup();
}


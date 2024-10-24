let rows = 4;
let cols = 16;
let grid = [];
let currentStep = 0;
let oscs = [];
let isPlaying = false;

let notes = ['C4', 'E4', 'G4', 'B4', 'G3'];

let sequencerWidth = 800;
let sequencerHeight = 200;
let cellWidth, cellHeight;

let sequencerX;
let sequencerY;
let sliderOffset = 100; // Distance between sliders
let sliderY = 500;

let playButton;
let tempoSlider;
let tempoValue = 120;

let harmSliders = [];
let pitchSliders = [];
let filterSliders = [];
let ampSliders = [];

function setupSynths() {
  for (let i = 0; i < rows; i++) {
    let osc = new Tone.FMOscillator(440, 'square');
    let lowpassFilter = new Tone.Filter(1000, "lowpass").toDestination();
    let gain = new Tone.Gain(0).connect(lowpassFilter); // Initial volume is zero
    osc.connect(gain);

    oscs.push({ osc, gain, lowpassFilter });

    // Initialize sliders for each oscillator
    let harmSlider = createSlider(0, 1, 0.5, 0.01);
    harmSlider.position(width / 2 - 300, sliderY + i * sliderOffset);
    harmSlider.addClass("slider");
    harmSliders.push(harmSlider);

    let pitchSlider = createSlider(50, 1000, 440, 1);
    pitchSlider.position(width / 2 - 150, sliderY + i * sliderOffset);
    pitchSlider.addClass("slider");
    pitchSliders.push(pitchSlider);

    let filterSlider = createSlider(50, 5000, 1000, 1);
    filterSlider.position(width / 2, sliderY + i * sliderOffset);
    filterSlider.addClass("slider");
    filterSliders.push(filterSlider);

    let ampSlider = createSlider(0, 1, 0.5, 0.01);
    ampSlider.position(width / 2 + 150, sliderY + i * sliderOffset);
    ampSlider.addClass("slider");
    ampSliders.push(ampSlider);
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  cellWidth = sequencerWidth / cols;
  cellHeight = sequencerHeight / rows;

  sequencerX = width / 2 - sequencerWidth / 2;
  sequencerY = 100;

  for (let i = 0; i < rows; i++) {
    let row = [];
    for (let j = 0; j < cols; j++) {
      row.push(false);
    }
    grid.push(row);
  }

  setupSynths();

  playButton = createButton('Play');
  playButton.position(width / 2 - 150 / 2, 400);
  playButton.mousePressed(togglePlay);
  playButton.addClass("button");

  tempoSlider = createSlider(60, 240, tempoValue);
  tempoSlider.position(sequencerX + sequencerWidth / 2 - 100, sequencerY + sequencerHeight + 60);
  tempoSlider.style('width', '200px');
  tempoSlider.addClass("slider");

  Tone.Transport.scheduleRepeat(time => {
    playStep(time);
    currentStep = (currentStep + 1) % cols;
  }, "16n");
}

function draw() {
  background(240);

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (grid[i][j]) {
        fill(255, 0, 0);
      } else {
        fill(255);
      }
      stroke(0);
      rect(sequencerX + j * cellWidth, sequencerY + i * cellHeight, cellWidth, cellHeight);
    }
  }

  fill(20, 255, 100, 100);
  noStroke();
  rect(sequencerX + currentStep * cellWidth, sequencerY, cellWidth, sequencerHeight);

  let newTempo = tempoSlider.value();
  if (newTempo !== tempoValue) {
    Tone.Transport.bpm.value = newTempo;
    tempoValue = newTempo;
  }

  // Add text labels for sliders
  textSize(15);
  fill(0); // Set text color to black

  // Update sliders in real time for each row's oscillator
  for (let i = 0; i < rows; i++) {
    //label each slider
    let harmValue = harmSliders[i].value();
    let pitchValue = pitchSliders[i].value();
    let filterValue = filterSliders[i].value();
    let ampValue = ampSliders[i].value();

    text('Harmonicity: ' + harmValue, width / 2 - 300, sliderY - 20 + i * sliderOffset);
    text('Pitch: ' + pitchValue, width / 2 - 150, sliderY - 20 + i * sliderOffset);
    text('Filter: ' + filterValue, width / 2, sliderY - 20 + i * sliderOffset);
    text('Amplitude: ' + ampValue, width / 2 + 150, sliderY - 20 + i * sliderOffset);

    oscs[i].osc.harmonicity.value = harmSliders[i].value();
    oscs[i].osc.frequency.value = pitchSliders[i].value();
    oscs[i].lowpassFilter.frequency.value = filterSliders[i].value();
    oscs[i].gain.gain.value = ampSliders[i].value();
  }
}

function mousePressed() {
  let col = floor((mouseX - sequencerX) / cellWidth);
  let row = floor((mouseY - sequencerY) / cellHeight);

  if (col >= 0 && col < cols && row >= 0 && row < rows) {
    grid[row][col] = !grid[row][col];
  }
}

function playStep(time) {
  for (let i = 0; i < rows; i++) {
    if (grid[i][currentStep]) {
      oscs[i].osc.start(time);
      oscs[i].osc.stop(time + 0.1);  // Play a short note
    }
  }
}

function togglePlay() {
  if (isPlaying) {
    Tone.Transport.stop();
    playButton.html('Play');
  } else {
    Tone.Transport.start();
    playButton.html('Stop');
  }
  isPlaying = !isPlaying;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

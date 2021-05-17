/*
  This is a simple script imitating the 'Stars' screensaver from Windows XP - can be readily used
  in 'Lively Wallpaper' as an animated background.

  As a feature, scrolling the mousewheel controls the amount of stars present, or moving the mouse
  away from the center of the screen speeds up the 'animation'. Unfortunately, I wasn't able to
  make both of them work at the same time, see my "non-official" comment below.

  Made using p5.js and VStudio; I hope you will have some fun with this!

  Non-official note: JavaScript is not my main language. These methods are not necessarily the
  most effective - also, the logic in this language is sometimes just...questionnable.

  Author: Mátyás Tóth; 2021
  Github: https://github.com/Matyastoth
  E-mail: tothmatyas92@gmail.com
*/


//System variables storing the width and height of the window frame.
//  A bit wonky in a browser, as there it takes the monitors width and height.
let width = innerWidth;
let height = innerHeight;
let stars_count = 200;


//Controls how fast the stars scroll through the screen. Base value -> 1.0001
let speed_factor = 1.0001;
let base_sp_f = 1.0001;

//Controls how fast the stars grow. Base value -> 1.01
let size_factor = 1.01;
let base_si_f = 1.01;

//Creating the canvas object (to attach mouse listeners later).
let cnv;

//Center of canvas; note: this is incorrect in WebGL rendering mode -
//  there, the center is 0, 0.
let centerX = width / 2;
let centerY = height / 2;

//Variables for calculations regarding the mouse moving.
let x_dist;
let y_dist;
let dist;
let max_dist;

let stars = [];

function setup () {

  //Creating the drawing canvas, and determining the center.
  cnv = createCanvas(width, height);
  max_dist = sqrt(pow(centerX,2) + pow(centerY,2));
  
  //Unfortunately, the mouseWheel() function doesn't like to cooperate with the mouseMoved().
  // It's still included there - if you want to check how it works, comment out the other command.
  //cnv.mouseWheel(array_push_pop);
  cnv.mouseMoved(adjust_speed_size);
  
  frameRate(60);

  //Filling the stars array; while quite 'slow', this needs to be done only once.
  for (let i = 0; i < stars_count; i++) {
    stars.push(new Star);
  }
}

//Drawing function, nothing particularly interesting happens there.
function draw () {
  background(0);
  for (let i = 0; i < stars.length; i++) {
    stars[i].update();
  }
}

//A pretty standard class - nothing really exceptional to see there.
// The stars are drawn by a class method, which also updates the information regarding
// an individual instance of a class object.
class Star {
  
  constructor () {
    this.x = width - 2*random(0,width);
    this.y = height - 2*random(0,height);
    this.speed = 1.0;
    this.size = 1.0;
  }
  
  update() {
    //The star speeds up exponentially and moves straight away from the center;
    //  this gives the illusion of moving through a 3D space.
    this.x *= this.speed;
    this.y *= this.speed;
    this.speed *= speed_factor;
    this.size *= size_factor;
    
    //If out of the screen...
    if(4*this.x*this.x > width*width || 4*this.y*this.y > height*height) {
      //Resetting the star. I guess this could be more elegant...
      this.x = width - 2*random(0,width);
      this.y = height - 2*random(0,height);
      this.speed = 1.0;
      this.size = 1.0;
    }
    //Draw the star.
    fill(255);
    noStroke();
    circle(width/2+this.x, height/2+this.y, this.size);
  }
}


//This function is attached to the mousewheel listener of the canvas;
// controls how stars show up when the mousewheel is rolled up and down.
function array_push_pop(event) {
  //The number '125' is a hard-coded number corresponding to 1 tick, based on my mouse.
  //  Depending on the mouse used, deltaY might return a different number.
  stars_count -= event.deltaY / 125;
  while (stars.length > stars_count) {
    //This makes sure that the script doesn't crash when the 'stars' array is empty.
    if (stars.length - stars_count > 25) {
      stars.pop();
    }
  }
  while (stars.length < stars_count) {
    //Setting a hard limit of 1000 to the number of stars;
    // of course, depends on the system how many it can handle at once.
    if (stars.length < 1000) {
      stars.push(new Star);
    }
  }

  //This prevents the window/browser from scrolling.
  return false;
}


//This function is attached to the mouse listener of the canvas;
// controls how fast the stars move (and their size).
//Additional comment: unfortunately, this contains quite a lot of hard-coded
// numbers with little to no further explanation - reason:
// simply it doesn't look good.
//Additional warning: wonky names.

let dist_ratio;

//This ratio guarantees that the stars don't grow too fast compared to their speed.
let size_speed_ratio = 4;
//This number sets how 'fast' can the stars move.
let step_fineness = 200;
function adjust_speed_size(event) {
  //Calculating X and Y distance from center
  x_dist = abs(centerX - mouseX);
  y_dist = abs(centerY - mouseY);

  //Absolute distance from center
  dist = sqrt(pow(x_dist,2) + pow(y_dist,2));

  //...getting back a number between 0-1000, expressing how far are we from the center.
  dist_ratio = 1000 * dist / max_dist;
  
  //This way, it's guaranteed that we don't have collapsing stars :)
  speed_factor = base_sp_f + 0.0001 * (dist_ratio/step_fineness);
  size_factor = base_si_f + 0.01 * (dist_ratio/(step_fineness*size_speed_ratio));

  //Done!
}
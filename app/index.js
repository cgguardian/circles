import clock from "clock";
import { display } from "display";
import * as document from "document";
import { preferences } from "user-settings";
import * as util from "../common/utils";
import { me as appbit } from "appbit";
import { user } from "user-profile";

import { battery } from "power";
import { charger } from "power";

import { HeartRateSensor } from "heart-rate";
import { BodyPresenceSensor } from "body-presence";
import { today } from "user-activity";
import { goals } from "user-activity";

// Update the clock every second
clock.granularity = "seconds";

const timeLabel = document.getElementById("timeLabel");
const timeLabelSecs = document.getElementById("timeLabelSecs");
const heartLabel = document.getElementById("heartLabel");
const heartIcon = document.getElementById("heartIcon");
const batLabel = document.getElementById("batLabel");

let heartAnim = document.getElementById("heartAnim");

const sensors = [];

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Clock
clock.ontick = (evt) => {
  let todayD = evt.date;
  let hours = todayD.getHours();
  if (preferences.clockDisplay === "12h") {
    // 12h format
    hours = hours % 12 || 12;
  } else {
    // 24h format
    hours = util.zeroPad(hours);
  }
  let mins = util.zeroPad(todayD.getMinutes());
  let secs = util.zeroPad(todayD.getSeconds());
  timeLabel.text = `${hours}:${mins}`;
  timeLabelSecs.text = `:${secs}`;
  
  var trGroup = document.getElementById("movingSecs");
  if (timeLabel.getBBox().width < 200) {
    trGroup.groupTransform.translate.x = 50 + timeLabel.getBBox().width;
  } else {
    trGroup.groupTransform.translate.x = 30 + timeLabel.getBBox().width;
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Heart Rate

const hrm = new HeartRateSensor;

if (HeartRateSensor) {
  hrm.addEventListener("reading", () => {
    heartLabel.text = JSON.stringify(
      hrm.heartRate ? hrm.heartRate : 0
    );
    heartAnim.dur = (60.00/hrm.heartRate);
  });
  sensors.push(hrm);
  hrm.start();
  
  //console.log("Boop");
  //console.log("Heart rate: " + hrm.heartRate);
  //console.log("Zone: " + user.heartRateZone(hrm.heartRate));
  
} else {
  heartLabel.style.display = "none";
  heartIcon.style.display = "none";
}

if (BodyPresenceSensor) {
  const body = new BodyPresenceSensor();
  body.addEventListener("reading", () => {
    if (!body.present) {
      hrm.stop();
    } else {
      hrm.start();
    }
  });
  body.start();
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Battery
const batSize = document.getElementById("batBar");
const batPic = document.getElementById("batIcon");
const batCharging = document.getElementById("chargingIcon");

battery.onchange = (charger, evt) => {
  if (battery.chargeLevel > 90) {
    batSize.width = 24;
  } else if (battery.chargeLevel > 78) {
    batSize.width = 22;
  } else if (battery.chargeLevel > 65) {
    batSize.width = 19;
  } else if (battery.chargeLevel > 53) {
    batSize.width = 16;
  } else if (battery.chargeLevel > 40) {
    batSize.width = 13;
  } else if (battery.chargeLevel > 28) {
    batSize.width = 10;
  } else if (battery.chargeLevel > 15) {
    batSize.width = 7;
  } else if (battery.chargeLevel > 8){
    batSize.width = 4;
    batSize.style.fill="white";
    batPic.href="img/bat_icon_e.png";
    batLabel.style.fill="white";
    batCharging.href="img/charging_icon_w.png";
  } else if (battery.chargeLevel > 0) {
    batSize.width = 2;
    batSize.style.fill="firebrick";
    batPic.href="img/bat_icon_e_r.png";
    batLabel.style.fill="firebrick";
    batCharging.href="img/charging_icon_red.png";
  } else {
    batSize.width = 0;
  }
  batLabel.text = (Math.floor(battery.chargeLevel) + "%");
}

  if (battery.charging ? true : false){
    batCharging.style.display = "inline";
  } else {
    batCharging.style.display = "none";
  }
  //console.log("The battery " + (battery.charging ? "is" : "is not") + " charging");

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Steps and Floors
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//I'm only going to include full comments for the steps stat, since comments will apply the same way to all stats
//and because it's messy and a lot
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//I tried wrapping everything in this and it broke regardless of where it was placed.
//Tried the same with the other stats in case elevation gain was the problem.
if (appbit.permissions.granted("access_activity")) {
   //console.log(`${today.adjusted.steps} steps taken`);
   //console.log(`Goal: ${goals.steps} steps`);
   if (today.local.elevationGain !== undefined) {
   }
}

//It may seem redundant
//and it does feel redundant
//but it's doing something, I just don't know *what*
clock.granularity = "seconds";

//I don't know why variables have to be arranged like this; see stepsIcon and stepsTot below.
//Despite there being no difference in what's called, they break if I don't put them where they are instead of at the top with stepsB and stepsZ.
//It's like that for the other four stat trackers, too.
//I dunno.

//references to the arcs around the steps icon
const stepsB = document.getElementById("stepsA");
const stepsZ = document.getElementById("stepsZ");
//I did try just having stepsZ circle twice at 0.8 opacity in order to overlap at full, and it didn't work
//so stepsB gets its own place in the code

//variable that will grab and store the total from the function below
var counterS;

//function to figure out how far we are into our goal, and then put it into a number more useable by an arc
function stepCounter(stepRatio) {
  stepRatio = Math.floor((today.adjusted.steps/goals.steps)*720);
  return stepRatio;
}

//Call the function to count our position on the goal table, out of 360
//or more
//the thing that references it falls off at 360 anyways
counterS = stepCounter();

//reference the steps icon, and also the number of steps already taken today by the user
let stepsIcon = document.getElementById("stepsIcon");
const stepsTot = document.getElementById("stepsTot");

//change what's visible based on how close user is to their step goal
//if user is less than 50% of the way there
if (counterS < 360) {
  //white icon shows, this is the default
  stepsIcon.href="img/steps_icon_w.png";
  //colour from 1 to 359 degrees will be at half opacity
  stepsB.sweepAngle = stepCounter();
  
//if user is between 50% and 99% of the way there
} else if (counterS < 719 && counterS >= 360) {
  //icon matching lighter colour shows
  //there is no opacity option for images, so had to include lighter-coloured versions of the colourful icons
  stepsIcon.href="img/steps_icon_l.png";
  //arc should be fully-coloured with the lower-opacity/lighter colour now
  stepsB.sweepAngle = 360;
  //full opacity colour starts creeping up from 0 to 359 degrees
  stepsZ.sweepAngle = stepCounter() - 360;
  
//if user has completed step goal for the day
} else if (counterS >= 720){
  //full colour icon shows
  stepsIcon.href="img/steps_icon.png";
  //half-opacity arc is full
  stepsB.sweepAngle = 360;
  //full-opacity arc is full
  stepsZ.sweepAngle = 360;
} else{}

//today's step total, for viewing on the clockface
stepsTot.text = today.adjusted.steps;
//this is the container for the steps icon
var sG = document.getElementById("moS");

//circle that floats in behind the step icon and step total, very faintly
//originally I just wanted something there for the user to interact with so they wouldn't have to try to press on the tiny visible portions of the icon or number
//but then it looked nice so now it's slightly visible
let stepsC = document.getElementById("stepsC");
//when one of the three elements inside the circle is touched, call the function below
stepsC.onclick = onTouchClickS;
stepsIcon.onclick = onTouchClickS; 
stepsTot.onclick = onTouchClickS;
//it's like "i" without being "i"
var S = 0;
//function to check if something inside the circle is touched
function onTouchClickS() {
  //if S is 0, meaning the icon is visible and not the number
  if (S == 0){
    //make the step total fully opaque
    stepsTot.style.opacity = 1.0;
    //move the icon off-screen
    //I know there has to be a better way but changing the element from hidden to inline wasn't working
    sG.groupTransform.translate.y = 200;
    //S is no longer 0
    S++
  //if S is not 0, meaning the text is visible and not the icon
  } else if (S !== 0){
    //make the step total fully transparent
    stepsTot.style.opacity = 0.0;
    //move the icon back to where it was originally
    sG.groupTransform.translate.y = 0;
    //S is now 0 again
    S--
  } else{
  }
};

/////////////////////

const floorsB = document.getElementById("floorsA");
const floorsZ = document.getElementById("floorsZ");
var counterF;
function floorsCounter(floorsRatio) {
  floorsRatio = Math.floor((today.adjusted.elevationGain/goals.elevationGain)*720);
  return floorsRatio;
}

counterF = floorsCounter();

const floorsIcon = document.getElementById("floorsIcon");
const floorsTot = document.getElementById("floorsTot");

if (counterF < 360) {
  floorsIcon.href="img/floors_icon_w.png";
  floorsB.sweepAngle = floorsCounter();
} else if (counterF < 719 && floorsB.sweepAngle >= 360) {
  floorsIcon.href="img/floors_icon_l.png";
  floorsB.sweepAngle = 360;
  floorsZ.sweepAngle = floorsCounter() - 360;
} else if (counterF >= 720) {
  floorsIcon.href="img/floors_icon.png";
  floorsB.sweepAngle = 360;
  floorsZ.sweepAngle = floorsCounter() - 360;
} else {}

floorsTot.text = today.adjusted.elevationGain;
var fG = document.getElementById("moF");
let floorsC = document.getElementById("floorsC");
floorsC.onclick = onTouchClickF;
floorsIcon.onclick = onTouchClickF; 
floorsTot.onclick = onTouchClickF;
var F = 0;
function onTouchClickF() {
  if (F == 0){
    floorsTot.style.opacity = 1.0;
    fG.groupTransform.translate.y = 200;
    F++
  } else if (F !== 0){
    floorsTot.style.opacity = 0.0;
    fG.groupTransform.translate.y = 0;
    F--
  } else{
  }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Distance
if (appbit.permissions.granted("access_activity")) {
}

const distB = document.getElementById("distA");
const distZ = document.getElementById("distZ");
var counterD;
function distanceCounter(distanceRatio) {
  distanceRatio = Math.floor((today.adjusted.distance/goals.distance)*720);
  return distanceRatio;
}

counterD = distanceCounter();

const distIcon = document.getElementById("distIcon");
const distTot = document.getElementById("distTot");

if (counterD < 360) {
  distIcon.href="img/distance_icon_w.png";
  distB.sweepAngle = distanceCounter();
} else if (counterD < 719 && distB.sweepAngle >= 360) {
  distIcon.href="img/distance_icon_l.png";
  distB.sweepAngle = 360;
  distZ.sweepAngle = distanceCounter() - 360;
} else if (counterD >= 720) {
  distIcon.href="img/distance_icon.png";
  distB.sweepAngle = 360;
  distZ.sweepAngle = distanceCounter() - 360;
} else {}

distTot.text = today.adjusted.distance;
var dG = document.getElementById("moD");
let distC = document.getElementById("distC");
distC.onclick = onTouchClickD;
distIcon.onclick = onTouchClickD; 
distTot.onclick = onTouchClickD;
var D = 0;
function onTouchClickD() {
  if (D == 0){
    distTot.style.opacity = 1.0;
    dG.groupTransform.translate.y = 200;
    D++
  } else if (D !== 0){
    distTot.style.opacity = 0.0;
    dG.groupTransform.translate.y = 0;
    D--
  } else{
  }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Active Minutes
if (appbit.permissions.granted("access_activity")) {
}

const actMinsB = document.getElementById("actMinsA");
const actMinsZ = document.getElementById("actMinsZ");
var counterA;
function actMinsCounter(actMinsRatio) {
  actMinsRatio = Math.floor((today.adjusted.activeZoneMinutes.total/goals.activeZoneMinutes.total)*720);
  return actMinsRatio;
}

counterA = actMinsCounter();

const actMinsIcon = document.getElementById("actMinsIcon");
const actMinsTot = document.getElementById("actMinsTot");
if (counterA < 360) {
  actMinsIcon.href="img/activeMins_icon_w.png";
  actMinsB.sweepAngle = actMinsCounter();
} else if (counterA < 719 && actMinsB.sweepAngle >= 360) {
  actMinsIcon.href="img/activeMins_icon_l.png";
  actMinsB.sweepAngle = 360;
  actMinsZ.sweepAngle = actMinsCounter() - 360;
} else if (counterA >= 720) {
  actMinsIcon.href="img/activeMins_icon.png";
  actMinsB.sweepAngle = 360;
  actMinsZ.sweepAngle = actMinsCounter() - 360;
} else{}

actMinsTot.text = JSON.stringify(today.adjusted.activeZoneMinutes.total);
var aG = document.getElementById("moA");
let actMinsC = document.getElementById("actMinsC");
actMinsC.onclick = onTouchClickA;
actMinsIcon.onclick = onTouchClickA; 
actMinsTot.onclick = onTouchClickA;
var A = 0;
function onTouchClickA() {
  if (A == 0){
    actMinsTot.style.opacity = 1.0;
    aG.groupTransform.translate.y = 200;
    A++
  } else if (A !== 0){
    actMinsTot.style.opacity = 0.0;
    aG.groupTransform.translate.y = 0;
    A--
  } else{
  }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Calories
if (appbit.permissions.granted("access_activity")) {
}

const calsB = document.getElementById("calsA");
const calsZ = document.getElementById("calsZ");
var counterC;
function calsCounter(calsRatio) {
  calsRatio = Math.floor((today.adjusted.calories/goals.calories)*720);
  return calsRatio;
}

counterC = calsCounter();

const calsIcon = document.getElementById("calsIcon");
const calsTot = document.getElementById("calsTot");
if (counterC < 360) {
  calsIcon.href="img/cals_icon_w.png";
  calsB.sweepAngle = calsCounter();
} else if (counterC < 719 && calsB.sweepAngle >= 360) {
  calsIcon.href="img/cals_icon_l.png";
  calsB.sweepAngle =  360;
  calsZ.sweepAngle = calsCounter() - 360;
} else if (counterC >= 720) {
  calsIcon.href="img/cals_icon.png";
  calsB.sweepAngle =  360;
  calsZ.sweepAngle = calsCounter() - 360;
} else{}

calsTot.text = today.adjusted.calories;
var cG = document.getElementById("moC");
let calsC = document.getElementById("calsC");
calsC.onclick = onTouchClickC;
calsIcon.onclick = onTouchClickC; 
calsTot.onclick = onTouchClickC;
var C = 0;
function onTouchClickC() {
  if (C == 0){
    calsTot.style.opacity = 1.0;
    cG.groupTransform.translate.y = 200;
    C++
  } else if (C !== 0){
    calsTot.style.opacity = 0.0;
    cG.groupTransform.translate.y = 0;
    C--
  } else{
  }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Refresh stat data
//Original from paulera888 here: https://community.fitbit.com/t5/SDK-Development/Stats-refresh-interval/td-p/2628458

// Refresh data on the screen
function refresh_myActivity() {
  stepsB.sweepAngle = stepCounter();
  floorsB.sweepAngle = floorsCounter();
  distB.sweepAngle = distanceCounter();
  actMinsB.sweepAngle = actMinsCounter();
  calsB.sweepAngle = calsCounter();
  
  stepsTot.text = today.adjusted.steps;
  floorsTot.text = today.adjusted.elevationGain;
  distTot.text = today.adjusted.distance;
  actMinsTot.text = JSON.stringify(today.adjusted.activeZoneMinutes.total);
  calsTot.text = today.adjusted.calories;
  
  if (counterS < 360) {
    stepsIcon.href="img/steps_icon_w.png";
    stepsB.sweepAngle = stepCounter();
  } else if (counterS < 719 && counterS >= 360) {
    stepsIcon.href="img/steps_icon_l.png";
    stepsB.sweepAngle = 360;
    stepsZ.sweepAngle = stepCounter() - 360;
  } else if (counterS >= 720){
    stepsIcon.href="img/steps_icon.png";
    stepsB.sweepAngle = 360;
    stepsZ.sweepAngle = stepCounter() - 360;
  } else{}
  
  if (counterF < 360) {
    floorsIcon.href="img/floors_icon_w.png";
    floorsB.sweepAngle = floorsCounter();
  } else if (counterF < 719 && floorsB.sweepAngle >= 360) {
    floorsIcon.href="img/floors_icon_l.png";
    floorsB.sweepAngle = 360;
    floorsZ.sweepAngle = floorsCounter() - 360;
  } else if (counterF >= 720) {
    floorsIcon.href="img/floors_icon.png";
    floorsB.sweepAngle = 360;
    floorsZ.sweepAngle = floorsCounter() - 360;
  } else {}

  if (counterD < 360) {
    distIcon.href="img/distance_icon_w.png";
    distB.sweepAngle = distanceCounter();
  } else if (counterD < 719 && distB.sweepAngle >= 360) {
    distIcon.href="img/distance_icon_l.png";
    distB.sweepAngle = 360;
    distZ.sweepAngle = distanceCounter() - 360;
  } else if (counterD >= 720) {
    distIcon.href="img/distance_icon.png";
    distB.sweepAngle = 360;
    distZ.sweepAngle = distanceCounter() - 360;
  } else {}
  
  if (counterA < 360) {
    actMinsIcon.href="img/activeMins_icon_w.png";
    actMinsB.sweepAngle = actMinsCounter();
  } else if (counterA < 719 && actMinsB.sweepAngle >= 360) {
    actMinsIcon.href="img/activeMins_icon_l.png";
    actMinsB.sweepAngle = 360;
    actMinsZ.sweepAngle = actMinsCounter() - 360;
  } else if (counterA >= 720) {
    actMinsIcon.href="img/activeMins_icon.png";
    actMinsB.sweepAngle = 360;
    actMinsZ.sweepAngle = actMinsCounter() - 360;
  } else{}
  
  if (counterC < 360) {
    calsIcon.href="img/cals_icon_w.png";
    calsB.sweepAngle = calsCounter();
  } else if (counterC < 719 && calsB.sweepAngle >= 360) {
    calsIcon.href="img/cals_icon_l.png";
    calsB.sweepAngle =  360;
    calsZ.sweepAngle = calsCounter() - 360;
  } else if (counterC >= 720) {
    calsIcon.href="img/cals_icon.png";
    calsB.sweepAngle =  360;
    calsZ.sweepAngle = calsCounter() - 360;
  } else{}

}

let timerId = 0; // Keeps the timer id, so we can kill it.

// Kills the timer (if it is running)
function stopTimer() {
  if (timerId != 0) {
    clearInterval (timerId);
    timerId = 0;
  }
}

// Starts the timer. If there is one running, kills and replaces it.
function startTimer() {
  stopTimer();
  if (timerId == 0) {
    timerId = setInterval(refresh_myActivity, 700); /* refresh rate in ms */
  }
}

// Event handler for changes in the display status
function displayChanged() {
  if (display.on) {
    startTimer();
  } else {
    stopTimer();
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Sensors
display.addEventListener("change", displayChanged, () => {
  // Automatically stop all sensors when the screen is off to conserve battery
  display.on ? sensors.map(sensor => sensor.start()) : sensors.map(sensor => sensor.stop());
});
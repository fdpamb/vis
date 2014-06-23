/**
 * @constructor  DataStep
 * The class DataStep is an iterator for data for the lineGraph. You provide a start data point and an
 * end data point. The class itself determines the best scale (step size) based on the
 * provided start Date, end Date, and minimumStep.
 *
 * If minimumStep is provided, the step size is chosen as close as possible
 * to the minimumStep but larger than minimumStep. If minimumStep is not
 * provided, the scale is set to 1 DAY.
 * The minimumStep should correspond with the onscreen size of about 6 characters
 *
 * Alternatively, you can set a scale by hand.
 * After creation, you can initialize the class by executing first(). Then you
 * can iterate from the start date to the end date via next(). You can check if
 * the end date is reached with the function hasNext(). After each step, you can
 * retrieve the current date via getCurrent().
 * The DataStep has scales ranging from milliseconds, seconds, minutes, hours,
 * days, to years.
 *
 * Version: 1.2
 *
 * @param {Date} [start]         The start date, for example new Date(2010, 9, 21)
 *                               or new Date(2010, 9, 21, 23, 45, 00)
 * @param {Date} [end]           The end date
 * @param {Number} [minimumStep] Optional. Minimum step size in milliseconds
 */
function DataStep(start, end, minimumStep, containerHeight, forcedStepSize) {
  // variables
  this.current = 0;

  this.autoScale = true;
  this.stepIndex = 0;
  this.step = 1;
  this.scale = 1;

  this.marginStart;
  this.marginEnd;

  this.majorSteps = [1,     2,    5,  10];
  this.minorSteps = [0.25,  0.5,  1,  2];

  this.setRange(start, end, minimumStep, containerHeight, forcedStepSize);
}



/**
 * Set a new range
 * If minimumStep is provided, the step size is chosen as close as possible
 * to the minimumStep but larger than minimumStep. If minimumStep is not
 * provided, the scale is set to 1 DAY.
 * The minimumStep should correspond with the onscreen size of about 6 characters
 * @param {Number} [start]      The start date and time.
 * @param {Number} [end]        The end date and time.
 * @param {Number} [minimumStep] Optional. Minimum step size in milliseconds
 */
DataStep.prototype.setRange = function(start, end, minimumStep, containerHeight, forcedStepSize) {
  this._start = start;
  this._end = end;
  this.setFirst();
  if (this.autoScale) {
    this.setMinimumStep(minimumStep, containerHeight, forcedStepSize);
  }
};

/**
 * Automatically determine the scale that bests fits the provided minimum step
 * @param {Number} [minimumStep]  The minimum step size in milliseconds
 */
DataStep.prototype.setMinimumStep = function(minimumStep, containerHeight) {
  // round to floor
  var size = this._end - this._start;
  var safeSize = size * 1.1;
  var minimumStepValue = minimumStep * (safeSize / containerHeight);
  var orderOfMagnitude = Math.round(Math.log(safeSize)/Math.LN10);

  var minorStepIdx = -1;
  var magnitudefactor = Math.pow(10,orderOfMagnitude);

  var solutionFound = false;
  for (var i = 0; i <= orderOfMagnitude; i++) {
    magnitudefactor = Math.pow(10,i);
    for (var j = 0; j < this.minorSteps.length; j++) {
      var stepSize = magnitudefactor * this.minorSteps[j];
      if (stepSize >= minimumStepValue) {
        solutionFound = true;
        minorStepIdx = j;
        break;
      }
    }
    if (solutionFound == true) {
      break;
    }
  }
  this.stepIndex = minorStepIdx;
  this.scale = magnitudefactor;
  this.step = magnitudefactor * this.minorSteps[minorStepIdx];
};


/**
 * Set the range iterator to the start date.
 */
DataStep.prototype.first = function() {
  this.setFirst();
};

/**
 * Round the current date to the first minor date value
 * This must be executed once when the current date is set to start Date
 */
DataStep.prototype.setFirst = function() {
  var niceStart = this._start - (this.scale * this.minorSteps[this.stepIndex]);
  var niceEnd = this._end + (this.scale * this.minorSteps[this.stepIndex]);

  this.marginEnd = this.roundToMinor(niceEnd);
  this.marginStart = this.roundToMinor(niceStart);
  this.marginRange = this.marginEnd - this.marginStart;

  this.current = this.marginEnd;

};

DataStep.prototype.roundToMinor = function(value) {
  var rounded = value - (value % (this.scale * this.minorSteps[this.stepIndex]));
  if (value % (this.scale * this.minorSteps[this.stepIndex]) > 0.5 * (this.scale * this.minorSteps[this.stepIndex])) {
    return rounded + (this.scale * this.minorSteps[this.stepIndex]);
  }
  else {
    return rounded;
  }
}


/**
 * Check if the there is a next step
 * @return {boolean}  true if the current date has not passed the end date
 */
DataStep.prototype.hasNext = function () {
  return (this.current >= this.marginStart);
};

/**
 * Do the next step
 */
DataStep.prototype.next = function() {
  var prev = this.current;
  this.current -= this.step;

  // safety mechanism: if current time is still unchanged, move to the end
  if (this.current == prev) {
    this.current = this._end;
  }
};

/**
 * Do the next step
 */
DataStep.prototype.previous = function() {
  this.current += this.step;
  this.marginEnd += this.step;
  this.marginRange = this.marginEnd - this.marginStart;
};



/**
 * Get the current datetime
 * @return {Date}  current The current date
 */
DataStep.prototype.getCurrent = function() {
  return this.current;
};



/**
 * Snap a date to a rounded value.
 * The snap intervals are dependent on the current scale and step.
 * @param {Date} date   the date to be snapped.
 * @return {Date} snappedDate
 */
DataStep.prototype.snap = function(date) {

};

/**
 * Check if the current value is a major value (for example when the step
 * is DAY, a major value is each first day of the MONTH)
 * @return {boolean} true if current date is major, else false.
 */
DataStep.prototype.isMajor = function() {
  return (this.current % (this.scale * this.majorSteps[this.stepIndex]) == 0);
};

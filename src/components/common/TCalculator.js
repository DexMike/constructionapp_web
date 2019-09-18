import React, { /* Component */ } from 'react';
import moment from 'moment-timezone';
import NumberFormat from 'react-number-format';

const defaultUnloadTime = 0.25;
const defaultLoadTime = 0.25;

class TCalculator {

  /* returns one way cost / ton / mile (per ton per mile) for rate type of ton */

  static oneWayTonCostPerTonPerMile(ratePerTon, avgDistance) {
    const cost = (avgDistance > 0 && ratePerTon > 0)
      ? (ratePerTon / avgDistance).toFixed(2)
      : 0;
    return cost;
  }

  /* Returns one way cost / ton / mile (per ton per mile) for rate type of hour */

  static oneWayHourCostPerTonPerMile(
    loadTime = defaultLoadTime,
    unloadTime = defaultUnloadTime,
    travelTimeEnroute,
    travelTimeReturn,
    hourRate,
    truckCapacity,
    avgDistanceEnroute
  ) {
    const oneLoad = loadTime + unloadTime
      + travelTimeReturn + travelTimeEnroute;

    const cost = (oneLoad > 0 && hourRate > 0 && truckCapacity > 0 && avgDistanceEnroute > 0)
      ? (oneLoad * hourRate / truckCapacity / avgDistanceEnroute).toFixed(2)
      : 0;

    return cost;
  }
}

export default TCalculator;

import React, { /* Component */} from 'react';

const defaultUnloadTime = 0.25;
const defaultLoadTime = 0.25;

class TCalculator {
  /*
    Calculates round trip time of a load.
    Uses default load and unload times.
  */

  /* returns total tonnage moved by number of loads */
  static getTotalTonAmountByLoads(
    numLoads,
    truckCapacity
  ) {
    return parseFloat(numLoads) * parseFloat(truckCapacity);
  }

  /* returns total hours worked by number of loads */
  static getTotalHourAmountByLoads(
    numLoads,
    tripTime
  ) {
    return parseFloat(numLoads) * parseFloat(tripTime);
  }

  /* returns one way cost / ton / mile (per ton per mile) for rate type of ton */
  static getRoundTripTime(
    travelTimeEnroute,
    travelTimeReturn,
    loadTime,
    unloadTime
  ) {
    return travelTimeEnroute + travelTimeReturn
      + loadTime + unloadTime;
  }

  /* returns one way cost / ton / mile (per ton per mile) for rate type of ton */
  static getOneWayTripTime(
    travelTimeEnroute,
    loadTime,
    unloadTime
  ) {
    return travelTimeEnroute
      + loadTime + unloadTime;
  }


  /*
    Calculates number of trips required based on tonnage amount to be moved.
    Uses truck capacity.
  */

  static getNumTripsByTons(
    estimatedTons,
    truckCapacity,
    roundUp
  ) {
    if (estimatedTons > 0 && truckCapacity > 0) {
      const numTrips = roundUp
        ? Math.ceil(estimatedTons / truckCapacity)
        : Math.floor(estimatedTons / truckCapacity);
      return numTrips;
    }
    return 0;
  }

  /*
    Calculates number of trips required based on hours to be worked.
    Uses round trip time.
  */

  static getNumTripsByHours(
    estimatedHours,
    tripTime,
    roundUp,
  ) {
    if (estimatedHours > 0 && tripTime > 0) {
      const numTrips = roundUp
        ? Math.ceil(estimatedHours / tripTime)
        : Math.floor(estimatedHours / tripTime);
      return numTrips;
    }
    return 0;
  }

  /*
    Calculates number of hours worked equivalent to the
    tonnage to be moved.
    Uses estimatedTons, truck capacity and travel times.
  */

  static getHoursByTonAmount(
    travelTimeEnroute,
    travelTimeReturn,
    loadTime,
    unloadTime,
    estimatedTons,
    truckCapacity,
    roundUp
  ) {
    let oneLoad;
    if (!travelTimeReturn) {
      oneLoad = this.getOneWayTripTime(
        travelTimeEnroute,
        loadTime,
        unloadTime
      );
    } else {
      oneLoad = this.getRoundTripTime(
        travelTimeEnroute,
        travelTimeReturn,
        loadTime,
        unloadTime
      );
    }
    const numTrips = this.getNumTripsByTons(estimatedTons, truckCapacity, roundUp);
    const hours = parseFloat((numTrips * oneLoad).toFixed(2));
    return hours;
  }

  /*
    Calculates number of tons moved equivalent to the
    hours to be worked.
    Uses estimatedHours, truck capacity and travel times.
  */

  static getTonsByHourAmount(
    travelTimeEnroute,
    travelTimeReturn,
    loadTime,
    unloadTime,
    estimatedHours,
    truckCapacity,
    roundUp,
  ) {
    let oneLoad;
    if (!travelTimeReturn) {
      oneLoad = this.getOneWayTripTime(
        travelTimeEnroute,
        loadTime,
        unloadTime
      );
    } else {
      oneLoad = this.getRoundTripTime(
        travelTimeEnroute,
        travelTimeReturn,
        loadTime,
        unloadTime
      );
    }
    const numTrips = this.getNumTripsByHours(estimatedHours, oneLoad, roundUp);
    const tons = parseFloat((numTrips * truckCapacity).toFixed(2));
    return tons;
  }

  /*
    Calculates hourly rate based on tonnage rate.
    Uses estimatedHours, estimatedHours and rate per ton.
  */

  static getHourRateByTonRate(
    estimatedHours,
    estimatedTons,
    rateTon
  ) {
    const hourRate = estimatedHours > 0
      ? parseFloat((
        (rateTon * estimatedTons) / estimatedHours).toFixed(2))
      : 0;
    return hourRate;
  }

  /*
    Calculates tonnage rate based on hourly rate.
    Uses estimatedHours, estimatedHours and rate per hours.
  */

  static getTonRateByHourRate(
    estimatedHours,
    estimatedTons,
    rateHour
  ) {
    const tonRate = estimatedTons > 0
      ? parseFloat(((rateHour * estimatedHours) / estimatedTons).toFixed(2))
      : 0;
    return tonRate;
  }


  /* returns ton rate from one way cost / ton / mile.
  Rate type: ton */

  static getTonRateByOneWayCost(
    oneWayCost,
    avgDistance
  ) {
    const rate = (oneWayCost * avgDistance).toFixed(2);
    return parseFloat(rate);
  }

  /* returns hour rate from one way cost / ton / mile.
  Rate type: ton */

  static getHourRateByOneWayCost(
    travelTimeEnroute,
    travelTimeReturn,
    loadTime,
    unloadTime,
    oneWayCost,
    truckCapacity,
    avgDistanceEnroute
  ) {
    let oneLoad;
    if (!travelTimeReturn) {
      oneLoad = this.getOneWayTripTime(
        travelTimeEnroute,
        loadTime,
        unloadTime
      );
    } else {
      oneLoad = this.getRoundTripTime(
        travelTimeEnroute,
        travelTimeReturn,
        loadTime,
        unloadTime
      );
    }
    const rate = oneLoad > 0
      ? ((oneWayCost * truckCapacity * avgDistanceEnroute) / oneLoad).toFixed(2)
      : 0;
    return parseFloat(rate);
  }

  /* returns hour rate from two way cost / mile. */

  static getHourRateByTwoWayCost(
    travelTimeEnroute,
    travelTimeReturn,
    loadTime,
    unloadTime,
    twoWayCost,
    truckCapacity,
    avgDistanceEnroute,
    avgDistanceReturn
  ) {
    const oneWayCost = TCalculator.getOneWayCostByTwoWayCost(
      twoWayCost,
      truckCapacity,
      avgDistanceEnroute,
      avgDistanceReturn
    );
    const hourRate = this.getHourRateByOneWayCost(
      travelTimeEnroute,
      travelTimeReturn,
      loadTime,
      unloadTime,
      oneWayCost,
      truckCapacity,
      avgDistanceEnroute
    );
    return hourRate;
  }

  /* returns ton rate from two way cost / mile. */

  static getTonRateByTwoWayCost(
    twoWayCost,
    truckCapacity,
    avgDistanceEnroute,
    avgDistanceReturn
  ) {
    const oneWayCost = TCalculator.getOneWayCostByTwoWayCost(
      twoWayCost,
      truckCapacity,
      avgDistanceEnroute,
      avgDistanceReturn
    );
    const tonRate = this.getTonRateByOneWayCost(
      oneWayCost,
      avgDistanceEnroute
    );
    return tonRate;
  }


  /* returns one way cost / ton / mile (per ton per mile).
  Rate type: ton */

  static getOneWayCostByTonRate(ratePerTon, avgDistance) {
    const cost = (avgDistance > 0 && ratePerTon > 0)
      ? (ratePerTon / avgDistance).toFixed(2)
      : 0;
    return parseFloat(cost);
  }

  /* returns two way cost / mile by ton rate.
  Rate type: ton */

  static getTwoWayCostByTonRate(
    tonRate,
    truckCapacity,
    distanceEnroute,
    distanceReturn
  ) {
    const cost = (
      tonRate > 0
      && truckCapacity > 0
      && distanceEnroute > 0
      && distanceReturn > 0
    )
      ? ((tonRate * truckCapacity) / (distanceEnroute + distanceReturn)).toFixed(2)
      : 0;
    return parseFloat(cost);
  }

  /* returns two way cost / mile by one way cost / ton / mile . */

  static getTwoWayCostByOneWayCost(
    oneWayCost,
    truckCapacity,
    avgDistanceEnroute,
    avgDistanceReturn
  ) {
    const twoWay = ((avgDistanceEnroute + avgDistanceReturn) > 0)
      ? ((oneWayCost * truckCapacity * avgDistanceEnroute)
        / (avgDistanceEnroute + avgDistanceReturn)).toFixed(2)
      : 0;
    return parseFloat(twoWay);
  }

  /* returns one way cost / ton / mile by two way cost / mile. */

  static getOneWayCostByTwoWayCost(
    twoWayCost,
    truckCapacity,
    avgDistanceEnroute,
    avgDistanceReturn
  ) {
    const oneWay = ((truckCapacity * avgDistanceEnroute) > 0)
      ? ((twoWayCost * (avgDistanceEnroute + avgDistanceReturn))
        / (truckCapacity * avgDistanceEnroute)).toFixed(2)
      : 0;
    return parseFloat(oneWay);
  }

  /* returns two way cost / mile by hour rate.
  Rate type: hour */

  static getTwoWayCostByHourRate(
    travelTimeEnroute,
    travelTimeReturn,
    loadTime,
    unloadTime,
    hourRate,
    distanceEnroute,
    distanceReturn
  ) {
    const oneLoad = this.getRoundTripTime(
      travelTimeEnroute,
      travelTimeReturn,
      loadTime,
      unloadTime
    );

    const cost = (
      hourRate > 0
      && distanceEnroute > 0
      && distanceReturn > 0
    )
      ? ((hourRate * oneLoad) / (distanceEnroute + distanceReturn)).toFixed(2)
      : 0;
    return parseFloat(cost);
  }

  /* Returns one way cost / ton / mile (per ton per mile).
  Rate type: hour */

  static getOneWayCostByHourRate(
    travelTimeEnroute,
    loadTime,
    unloadTime,
    hourRate,
    truckCapacity,
    avgDistanceEnroute
  ) {
    const oneLoad = this.getOneWayTripTime(
      travelTimeEnroute,
      loadTime,
      unloadTime
    );

    const cost = (oneLoad > 0 && hourRate > 0 && truckCapacity > 0 && avgDistanceEnroute > 0)
      ? (oneLoad * hourRate / truckCapacity / avgDistanceEnroute).toFixed(2)
      : 0;
    return parseFloat(cost);
  }

  /* Returns delivered price per ton
  Rate type: ton */

  static getDelPricePerTonByTonRate(
    estMaterialPricing,
    tonRate
  ) {
    const deliveredPricePerTon = (estMaterialPricing + tonRate).toFixed(2);
    return parseFloat(deliveredPricePerTon);
  }

  /* Returns delivered price per ton
  Rate type: hour
  Quantity type: ton
  */


  static getDelPricePerTonByHourRateByTonAmount(
    estMaterialPricing,
    travelTimeEnroute,
    travelTimeReturn,
    loadTime,
    unloadTime,
    estimatedTons,
    truckCapacity,
    rateHour,
    roundUp
  ) {
    // first get hour amount
    const estimatedHours = this.getHoursByTonAmount(
      travelTimeEnroute,
      travelTimeReturn,
      loadTime,
      unloadTime,
      estimatedTons,
      truckCapacity,
      roundUp
    );
    // second get ton rate
    const tonRate = this.getTonRateByHourRate(
      estimatedHours,
      estimatedTons,
      rateHour
    );
    // return delivered price per ton
    const deliveredPricePerTon = (estMaterialPricing + tonRate).toFixed(2);
    return parseFloat(deliveredPricePerTon);
  }

  static getDelPricePerTonByHourRateByHourAmount(
    estMaterialPricing,
    travelTimeEnroute,
    travelTimeReturn,
    loadTime,
    unloadTime,
    estimatedHours,
    truckCapacity,
    rateHour,
    roundUp
  ) {
    // first get ton amount
    const estimatedTons = this.getTonsByHourAmount(
      travelTimeEnroute,
      travelTimeReturn,
      loadTime,
      unloadTime,
      estimatedHours,
      truckCapacity,
      roundUp
    );
    // second get ton rate
    const tonRate = this.getTonRateByHourRate(
      estimatedHours,
      estimatedTons,
      rateHour
    );
    // return delivered price per ton
    const deliveredPricePerTon = (estMaterialPricing + tonRate).toFixed(2);
    return parseFloat(deliveredPricePerTon);
  }

  static getJobCostSameRateAndAmount(
    rate,
    amount
  ) {
    const estimatedCostForJob = (parseFloat(rate) * parseFloat(amount)).toFixed(2);
    return parseFloat(estimatedCostForJob);
  }

  static getJobCostHourRateTonAmount(
    hourRate,
    travelTimeEnroute,
    travelTimeReturn,
    loadTime,
    unloadTime,
    estimatedTons,
    truckCapacity,
    roundUp
  ) {
    // first get hour amount
    const hourAmount = this.getHoursByTonAmount(
      travelTimeEnroute,
      travelTimeReturn,
      loadTime,
      unloadTime,
      estimatedTons,
      truckCapacity,
      roundUp
    );
    const estimatedCostForJob = (parseFloat(hourRate) * hourAmount).toFixed(2);
    return parseFloat(estimatedCostForJob);
  }

  static getJobCostTonRateHourAmount(
    tonRate,
    travelTimeEnroute,
    travelTimeReturn,
    loadTime,
    unloadTime,
    estimatedHours,
    truckCapacity,
    roundUp
  ) {
    // first get hour amount
    const tonAmount = this.getTonsByHourAmount(
      travelTimeEnroute,
      travelTimeReturn,
      loadTime,
      unloadTime,
      estimatedHours,
      truckCapacity,
      roundUp
    );
    const estimatedCostForJob = (parseFloat(tonRate) * tonAmount).toFixed(2);
    return parseFloat(estimatedCostForJob);
  }

  static getDelPricePerJobByTonAmount(
    estimatedTons,
    deliveredPricePerTon
  ) {
    const delPricePerJob = (parseFloat(deliveredPricePerTon)
      * parseFloat(estimatedTons)).toFixed(2);
    return delPricePerJob;
  }

  static getDelPricePerJobByHourAmount(
    travelTimeEnroute,
    travelTimeReturn,
    loadTime,
    unloadTime,
    estimatedHours,
    truckCapacity,
    deliveredPricePerTon,
    roundUp
  ) {
    const estimatedTons = this.getTonsByHourAmount(
      travelTimeEnroute,
      travelTimeReturn,
      loadTime,
      unloadTime,
      estimatedHours,
      truckCapacity,
      roundUp
    );
    const delPricePerJob = (parseFloat(deliveredPricePerTon)
      * estimatedTons).toFixed(2);
    return delPricePerJob;
  }
}

export default TCalculator;

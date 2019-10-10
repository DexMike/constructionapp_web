import React, { /* Component */} from 'react';
import moment from 'moment-timezone';
import NumberFormat from 'react-number-format';

const defaultUnloadTime = 0.25;
const defaultLoadTime = 0.25;

class TCalculator {

  /*
    Calculates round trip time of a load.
    Uses default load and unload times.
  */

  static getRoundTripTime(
    travelTimeEnroute,
    travelTimeReturn,
    loadTime,
    unloadTime
  ) {
    return travelTimeEnroute + travelTimeReturn
      + loadTime + unloadTime;
  }

  /*
    Calculates number of trips required based on tonnage amount to be moved.
    Uses truck capacity.
    Here we assume that a trip is equivalent to a round trip.
  */

  static getNumTripsByTons(
    estimatedTons,
    truckCapacity
  ) {
    const numTrips = Math.ceil(estimatedTons / truckCapacity);
    return numTrips;
  }

  /*
    Calculates number of trips required based on hours to be worked.
    Uses round trip time.
    Here we assume that a trip is equivalent to a round trip.
  */

  static getNumTripsByHours(
    estimatedHours,
    roundTripTime
  ) {
    const numTrips = Math.ceil(estimatedHours / roundTripTime);
    return numTrips;
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
  ) {
    const oneLoad = this.getRoundTripTime(
      travelTimeEnroute,
      travelTimeReturn,
      loadTime,
      unloadTime
    );
    const numTrips = this.getNumTripsByTons(estimatedTons, truckCapacity);
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
  ) {
    const oneLoad = this.getRoundTripTime(
      travelTimeEnroute,
      travelTimeReturn,
      loadTime,
      unloadTime
    );
    const numTrips = this.getNumTripsByHours(estimatedHours, oneLoad);
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
    const hourRate = parseFloat((
      (rateTon * estimatedTons) / estimatedHours).toFixed(2));
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









  /* returns one way cost / ton / mile (per ton per mile).
  Rate type: ton */

  static getOneWayCostByTonRate(ratePerTon, avgDistance) {
    const cost = (avgDistance > 0 && ratePerTon > 0)
      ? (ratePerTon / avgDistance).toFixed(2)
      : 0;
    return parseFloat(cost);
  }

  /* Returns one way cost / ton / mile (per ton per mile).
  Rate type: hour */

  static getOneWayCostByHourRate(
    travelTimeEnroute,
    travelTimeReturn,
    loadTime,
    unloadTime,
    hourRate,
    truckCapacity,
    avgDistanceEnroute
  ) {
    const oneLoad = this.getRoundTripTime(
      travelTimeEnroute,
      travelTimeReturn,
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
    rateHour
  ) {
    // first get hour amount
    const estimatedHours = this.getHoursByTonAmount(
      travelTimeEnroute,
      travelTimeReturn,
      loadTime,
      unloadTime,
      estimatedTons,
      truckCapacity
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
    rateHour
  ) {
    // first get ton amount
    const estimatedTons = this.getTonsByHourAmount(
      travelTimeEnroute,
      travelTimeReturn,
      loadTime,
      unloadTime,
      estimatedHours,
      truckCapacity
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
    truckCapacity
  ) {
    // first get hour amount
    const hourAmount = this.getHoursByTonAmount(
      travelTimeEnroute,
      travelTimeReturn,
      loadTime,
      unloadTime,
      estimatedTons,
      truckCapacity
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
    truckCapacity
  ) {
    // first get hour amount
    const tonAmount = this.getTonsByHourAmount(
      travelTimeEnroute,
      travelTimeReturn,
      loadTime,
      unloadTime,
      estimatedHours,
      truckCapacity
    );
    const estimatedCostForJob = (parseFloat(tonRate) * tonAmount).toFixed(2);
    return parseFloat(estimatedCostForJob);
  }


}

export default TCalculator;

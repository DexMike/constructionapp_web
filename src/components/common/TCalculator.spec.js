import TCalculator from './TCalculator';

describe('TCalculator', () => {
  it('should calculate getRoundTripTime', () => {
    const travelTimeEnroute = 10.56;
    const travelTimeReturn = 10.53;
    const loadTime = 0.25;
    const unloadTime = 0.25;
    const actual = TCalculator.getRoundTripTime(
      travelTimeEnroute,
      travelTimeReturn,
      loadTime,
      unloadTime
    );
    const expected = 21.59;
    expect(expected).toBe(actual);
  });

  it('should calculate getNumTripsByTons', () => {
    const estimatedTons = 10;
    const truckCapacity = 4;
    const actual = TCalculator.getNumTripsByTons(estimatedTons, truckCapacity);
    const expected = 3;
    expect(expected).toBe(actual);
  });

  it('should calculate getHoursByTonAmount', () => {
    const estimatedTons = 10;
    const truckCapacity = 4;
    const travelTimeEnroute = 10.56;
    const travelTimeReturn = 10.53;
    const loadTime = 0.25;
    const unloadTime = 0.25;
    const actual = TCalculator.getHoursByTonAmount(
      travelTimeEnroute,
      travelTimeReturn,
      loadTime,
      unloadTime,
      estimatedTons,
      truckCapacity
    );
    const expected = 64.77;
    expect(expected).toBe(actual);
  });

  it('should calculate getTonsByHourAmount', () => {
    const estimatedHours = 3;
    const truckCapacity = 22;
    const travelTimeEnroute = 0.51;
    const travelTimeReturn = 0.51;
    const loadTime = 0.25;
    const unloadTime = 0.25;
    const actual = TCalculator.getTonsByHourAmount(
      travelTimeEnroute,
      travelTimeReturn,
      loadTime,
      unloadTime,
      estimatedHours,
      truckCapacity,
    );
    const expected = 44;
    expect(expected).toBe(actual);
  });

  it('should calculate getHourRateByTonRate', () => {
    const estimatedHours = 6.40;
    const estimatedTons = 76;
    const rateTon = 56.00;
    const actual = TCalculator.getHourRateByTonRate(
      estimatedHours,
      estimatedTons,
      rateTon
    );
    const expected = 665.00;
    expect(expected).toBe(actual);
  });

  it('should calculate getTonRateByHourRate', () => {
    const estimatedHours = 1.04;
    const estimatedTons = 33;
    const rateHour = 1726.2;
    const actual = TCalculator.getTonRateByHourRate(
      estimatedHours,
      estimatedTons,
      rateHour
    );
    const expected = 54.40;
    expect(expected).toBe(actual);
  });

  it('should calculate getOneWayCostByTonRate', () => {
    const ratePerTon = 32;
    const avgDistance = 10.76;
    const actual = TCalculator.getOneWayCostByTonRate(
      ratePerTon,
      avgDistance
    );
    const expected = 2.97;
    expect(expected).toBe(actual);
  });

  it('should calculate getOneWayCostByHourRate', () => {
    const travelTimeEnroute = 0.51;
    const travelTimeReturn = 0.53;
    const loadTime = 0.25;
    const unloadTime = 0.25;
    const hourRate = 54;
    const truckCapacity = 22;
    const avgDistanceEnroute = 12.04;
    const actual = TCalculator.getOneWayCostByHourRate(
      travelTimeEnroute,
      travelTimeReturn,
      loadTime,
      unloadTime,
      hourRate,
      truckCapacity,
      avgDistanceEnroute
    );
    const expected = 0.31;
    expect(expected).toBe(actual);
  });


});

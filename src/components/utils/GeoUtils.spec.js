import GeoUtils from './GeoUtils';

describe('GeoUtils', () => {
  it('gets the distance', async () => {
    const expectedResult = {
      distance: 32946
    };
    const waypoint1 = '37.7397,-121.4252';
    const waypoint2 = '37.9577,-121.2908';
    const actualResult = await GeoUtils.getDistance(waypoint1, waypoint2);
    expect(actualResult.distance).toEqual(expectedResult.distance);
  }, 15000);
});

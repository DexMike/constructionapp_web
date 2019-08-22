describe('env', () => {
  it('should have a here maps app id', () => {
    expect(process.env.HERE_MAPS_APP_ID).toBeDefined();
  });
  it('should have a here maps app code', () => {
    expect(process.env.HERE_MAPS_APP_CODE).toBeDefined();
  });
  it('should have a here maps api key', () => {
    expect(process.env.HERE_MAPS_API_KEY).toBeDefined();
  });
});

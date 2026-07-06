/// <reference types="detox/globals" />

describe('SmartCamera accessibility labels', () => {
  beforeAll(async () => {
    await device.launchApp({newInstance: true});
    await waitFor(element(by.id('home.screen'))).toBeVisible().withTimeout(5000);
  });

  it('exposes Hebrew accessibility labels on home actions', async () => {
    await expect(element(by.label('התחל הקלטה'))).toBeVisible();
    await expect(element(by.label('התחל צילום'))).toBeVisible();
  });

  it('can navigate to scene select via accessible video button', async () => {
    await element(by.label('התחל הקלטה')).tap();
    await waitFor(element(by.id('sceneSelect.screen')))
      .toBeVisible()
      .withTimeout(3000);
    await expect(element(by.label('בחירת סצנה'))).toBeVisible();
  });
});

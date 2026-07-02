/// <reference types="detox/globals" />

describe('SmartCamera flow', () => {
  beforeAll(async () => {
    await device.launchApp({newInstance: true});
  });

  it('lands on home after splash', async () => {
    await waitFor(element(by.id('home.screen')))
      .toBeVisible()
      .withTimeout(5000);
    await expect(element(by.id('home.startVideo'))).toBeVisible();
    await expect(element(by.id('home.startPhoto'))).toBeVisible();
  });

  it('opens scene selection for video', async () => {
    await element(by.id('home.startVideo')).tap();
    await waitFor(element(by.id('sceneSelect.screen')))
      .toBeVisible()
      .withTimeout(3000);
    await expect(element(by.text('בחירת סצנה'))).toBeVisible();
  });

  it('can skip tripod and reach camera permission gate', async () => {
    await device.launchApp({newInstance: true});
    await waitFor(element(by.id('home.screen'))).toBeVisible().withTimeout(5000);
    await element(by.id('home.startPhoto')).tap();
    await waitFor(element(by.id('sceneSelect.screen'))).toBeVisible().withTimeout(3000);

    const firstScene = element(by.id('sceneSelect.scene.0'));
    await waitFor(firstScene).toBeVisible().withTimeout(3000);
    await firstScene.tap();

    await element(by.id('sceneSelect.continue')).tap();
    await waitFor(element(by.id('tripodConnect.screen')))
      .toBeVisible()
      .withTimeout(3000);

    await element(by.id('tripodConnect.skip')).tap();
    await waitFor(element(by.id('camera.screen')))
      .toBeVisible()
      .withTimeout(5000);
  });
});

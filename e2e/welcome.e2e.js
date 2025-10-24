describe('Welcome flow', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('navigates between welcome, sign-up, and sign-in screens', async () => {
    await waitFor(element(by.id('welcome-screen')))
      .toBeVisible()
      .withTimeout(15000);
    await expect(element(by.text('CommUnity'))).toBeVisible();
    await expect(element(by.id('welcome-get-started'))).toBeVisible();
    await element(by.id('welcome-get-started')).tap();

    await waitFor(element(by.id('sign-up-screen')))
      .toBeVisible()
      .withTimeout(10000);
    await element(by.id('sign-up-back')).tap();

    await waitFor(element(by.id('welcome-screen')))
      .toBeVisible()
      .withTimeout(10000);
    await element(by.id('welcome-sign-in')).tap();

    await waitFor(element(by.id('sign-in-screen')))
      .toBeVisible()
      .withTimeout(10000);
    await element(by.id('sign-in-back')).tap();

    await waitFor(element(by.id('welcome-screen')))
      .toBeVisible()
      .withTimeout(10000);
  });
});

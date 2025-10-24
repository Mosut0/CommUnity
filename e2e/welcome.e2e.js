describe('Authentication Flow Integration', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('completes a basic authentication navigation cycle', async () => {
    // Start at welcome screen
    await waitFor(element(by.id('welcome-screen')))
      .toBeVisible()
      .withTimeout(15000);
    await expect(element(by.text('CommUnity'))).toBeVisible();

    // Welcome → Sign Up
    await element(by.id('welcome-get-started')).tap();
    await waitFor(element(by.id('sign-up-screen')))
      .toBeVisible()
      .withTimeout(10000);

    // Sign Up → Sign In
    await element(by.id('sign-up-to-sign-in')).tap();
    await waitFor(element(by.id('sign-in-screen')))
      .toBeVisible()
      .withTimeout(10000);

    // Sign In → Forgot Password
    await element(by.id('forgot-password-btn')).tap();
    await waitFor(element(by.id('reset-password-screen')))
      .toBeVisible()
      .withTimeout(10000);

    // Reset Password → Sign In
    await element(by.id('reset-password-back')).tap();
    await waitFor(element(by.id('sign-in-screen')))
      .toBeVisible()
      .withTimeout(10000);

    // Sign In → Welcome
    await element(by.id('sign-in-back')).tap();
    await waitFor(element(by.id('welcome-screen')))
      .toBeVisible()
      .withTimeout(10000);
  });
});


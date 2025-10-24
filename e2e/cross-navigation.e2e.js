describe('Cross-Navigation Between Sign In and Sign Up', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('navigates from sign up to sign in and back', async () => {
    // Start at sign up
    await waitFor(element(by.id('welcome-screen')))
      .toBeVisible()
      .withTimeout(15000);

    await element(by.id('welcome-get-started')).tap();
    await waitFor(element(by.id('sign-up-screen')))
      .toBeVisible()
      .withTimeout(10000);

    // Navigate to sign in
    await element(by.id('sign-up-to-sign-in')).tap();
    await waitFor(element(by.id('sign-in-screen')))
      .toBeVisible()
      .withTimeout(10000);

    // Navigate back to sign up
    await element(by.id('sign-in-to-sign-up')).tap();
    await waitFor(element(by.id('sign-up-screen')))
      .toBeVisible()
      .withTimeout(10000);
  });

  it('navigates from sign in to sign up and back', async () => {
    // Start at sign in
    await waitFor(element(by.id('welcome-screen')))
      .toBeVisible()
      .withTimeout(15000);

    await element(by.id('welcome-sign-in')).tap();
    await waitFor(element(by.id('sign-in-screen')))
      .toBeVisible()
      .withTimeout(10000);

    // Navigate to sign up
    await element(by.id('sign-in-to-sign-up')).tap();
    await waitFor(element(by.id('sign-up-screen')))
      .toBeVisible()
      .withTimeout(10000);

    // Navigate back to sign in
    await element(by.id('sign-up-to-sign-in')).tap();
    await waitFor(element(by.id('sign-in-screen')))
      .toBeVisible()
      .withTimeout(10000);
  });

  it('maintains navigation state during cross-navigation', async () => {
    // Start at sign up
    await waitFor(element(by.id('welcome-screen')))
      .toBeVisible()
      .withTimeout(15000);

    await element(by.id('welcome-get-started')).tap();
    await waitFor(element(by.id('sign-up-screen')))
      .toBeVisible()
      .withTimeout(10000);

    // Navigate to sign in
    await element(by.id('sign-up-to-sign-in')).tap();
    await waitFor(element(by.id('sign-in-screen')))
      .toBeVisible()
      .withTimeout(10000);

    // Verify we're on sign in screen
    await expect(element(by.text('Sign In'))).toBeVisible();
    await expect(element(by.text("Don't have an account?"))).toBeVisible();

    // Navigate back to sign up
    await element(by.id('sign-in-to-sign-up')).tap();
    await waitFor(element(by.id('sign-up-screen')))
      .toBeVisible()
      .withTimeout(10000);

    // Verify we're back on sign up screen
    await expect(element(by.text('Sign Up'))).toBeVisible();
    await expect(element(by.text('Already have an account?'))).toBeVisible();
  });
});

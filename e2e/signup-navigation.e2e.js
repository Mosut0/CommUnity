describe('Sign Up Screen Navigation', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('navigates from sign up to sign in via existing account link', async () => {
    // Navigate to sign up first
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
  });

  it('returns to welcome from sign up via back button', async () => {
    // Navigate to sign up first
    await waitFor(element(by.id('welcome-screen')))
      .toBeVisible()
      .withTimeout(15000);
    
    await element(by.id('welcome-get-started')).tap();
    await waitFor(element(by.id('sign-up-screen')))
      .toBeVisible()
      .withTimeout(10000);
    
    // Go back to welcome
    await element(by.id('sign-up-back')).tap();
    
    await waitFor(element(by.id('welcome-screen')))
      .toBeVisible()
      .withTimeout(10000);
  });

  it('displays sign up form elements correctly', async () => {
    // Navigate to sign up first
    await waitFor(element(by.id('welcome-screen')))
      .toBeVisible()
      .withTimeout(15000);
    
    await element(by.id('welcome-get-started')).tap();
    await waitFor(element(by.id('sign-up-screen')))
      .toBeVisible()
      .withTimeout(10000);
    
    // Verify form elements are visible
    await expect(element(by.text('Sign Up'))).toBeVisible();
    await expect(element(by.text('Already have an account?'))).toBeVisible();
    await expect(element(by.id('sign-up-to-sign-in'))).toBeVisible();
  });
});

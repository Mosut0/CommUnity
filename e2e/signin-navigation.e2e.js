describe('Sign In Screen Navigation', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('navigates from sign in to sign up via create account link', async () => {
    // Navigate to sign in first
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
  });

  it('navigates from sign in to forgot password', async () => {
    // Navigate to sign in first
    await waitFor(element(by.id('welcome-screen')))
      .toBeVisible()
      .withTimeout(15000);
    
    await element(by.id('welcome-sign-in')).tap();
    await waitFor(element(by.id('sign-in-screen')))
      .toBeVisible()
      .withTimeout(10000);
    
    // Navigate to forgot password
    await element(by.id('forgot-password-btn')).tap();
    
    await waitFor(element(by.id('reset-password-screen')))
      .toBeVisible()
      .withTimeout(10000);
  });

  it('returns to welcome from sign in via back button', async () => {
    // Navigate to sign in first
    await waitFor(element(by.id('welcome-screen')))
      .toBeVisible()
      .withTimeout(15000);
    
    await element(by.id('welcome-sign-in')).tap();
    await waitFor(element(by.id('sign-in-screen')))
      .toBeVisible()
      .withTimeout(10000);
    
    // Go back to welcome
    await element(by.id('sign-in-back')).tap();
    
    await waitFor(element(by.id('welcome-screen')))
      .toBeVisible()
      .withTimeout(10000);
  });

  it('displays sign in form elements correctly', async () => {
    // Navigate to sign in first
    await waitFor(element(by.id('welcome-screen')))
      .toBeVisible()
      .withTimeout(15000);
    
    await element(by.id('welcome-sign-in')).tap();
    await waitFor(element(by.id('sign-in-screen')))
      .toBeVisible()
      .withTimeout(10000);
    
    // Verify form elements are visible
    await expect(element(by.text('Sign In'))).toBeVisible();
    await expect(element(by.text("Don't have an account?"))).toBeVisible();
    await expect(element(by.id('sign-in-to-sign-up'))).toBeVisible();
    await expect(element(by.id('forgot-password-btn'))).toBeVisible();
  });
});

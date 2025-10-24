describe('Reset Password Screen Navigation', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('navigates to reset password from sign in', async () => {
    // Navigate to sign in first
    await waitFor(element(by.id('welcome-screen')))
      .toBeVisible()
      .withTimeout(15000);
    
    await element(by.id('welcome-sign-in')).tap();
    await waitFor(element(by.id('sign-in-screen')))
      .toBeVisible()
      .withTimeout(10000);
    
    // Navigate to reset password
    await element(by.id('forgot-password-btn')).tap();
    
    await waitFor(element(by.id('reset-password-screen')))
      .toBeVisible()
      .withTimeout(10000);
  });

  it('returns to sign in from reset password via back button', async () => {
    // Navigate to reset password first
    await waitFor(element(by.id('welcome-screen')))
      .toBeVisible()
      .withTimeout(15000);
    
    await element(by.id('welcome-sign-in')).tap();
    await waitFor(element(by.id('sign-in-screen')))
      .toBeVisible()
      .withTimeout(10000);
    
    await element(by.id('forgot-password-btn')).tap();
    await waitFor(element(by.id('reset-password-screen')))
      .toBeVisible()
      .withTimeout(10000);
    
    // Go back to sign in
    await element(by.id('reset-password-back')).tap();
    
    await waitFor(element(by.id('sign-in-screen')))
      .toBeVisible()
      .withTimeout(10000);
  });

  it('displays reset password form elements correctly', async () => {
    // Navigate to reset password first
    await waitFor(element(by.id('welcome-screen')))
      .toBeVisible()
      .withTimeout(15000);
    
    await element(by.id('welcome-sign-in')).tap();
    await waitFor(element(by.id('sign-in-screen')))
      .toBeVisible()
      .withTimeout(10000);
    
    await element(by.id('forgot-password-btn')).tap();
    await waitFor(element(by.id('reset-password-screen')))
      .toBeVisible()
      .withTimeout(10000);
    
    // Verify form elements are visible
    await expect(element(by.text('Reset Password'))).toBeVisible();
    await expect(element(by.text('Please enter your new password below'))).toBeVisible();
    await expect(element(by.id('reset-password-back'))).toBeVisible();
  });
});

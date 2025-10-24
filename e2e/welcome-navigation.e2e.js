describe('Welcome Screen Navigation', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('navigates from welcome to sign up via get started button', async () => {
    await waitFor(element(by.id('welcome-screen')))
      .toBeVisible()
      .withTimeout(15000);
    
    await expect(element(by.text('CommUnity'))).toBeVisible();
    await expect(element(by.id('welcome-get-started'))).toBeVisible();
    
    await element(by.id('welcome-get-started')).tap();
    
    await waitFor(element(by.id('sign-up-screen')))
      .toBeVisible()
      .withTimeout(10000);
  });

  it('navigates from welcome to sign in via existing account button', async () => {
    await waitFor(element(by.id('welcome-screen')))
      .toBeVisible()
      .withTimeout(15000);
    
    await expect(element(by.text('CommUnity'))).toBeVisible();
    await expect(element(by.id('welcome-sign-in'))).toBeVisible();
    
    await element(by.id('welcome-sign-in')).tap();
    
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
});

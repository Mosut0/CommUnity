# CommUnity Website

This folder contains the static website for the CommUnity mobile app. The website includes all necessary pages for app store submission and user support.

## Pages

- **index.html** - Home/landing page with app features and download links
- **privacy-policy.html** - Comprehensive Privacy Policy (required for app stores)
- **terms-of-service.html** - Terms of Service (required for app stores)
- **email-confirmation.html** - Landing page for Supabase email confirmation links
- **reset-password.html** - Landing page for Supabase password reset links
- **contact.html** - Contact and support page with FAQ

## Deployment

### Option 1: GitHub Pages (Free)

1. Create a new GitHub repository
2. Push the website folder contents to the repository
3. Go to Settings > Pages
4. Select the main branch and `/` (root) folder
5. Your site will be available at `https://yourusername.github.io/repository-name/`

### Option 2: Netlify (Free)

1. Sign up at [netlify.com](https://netlify.com)
2. Drag and drop the website folder or connect your Git repository
3. Your site will be automatically deployed

### Option 3: Vercel (Free)

1. Sign up at [vercel.com](https://vercel.com)
2. Import your Git repository or upload the website folder
3. Your site will be automatically deployed

### Option 4: Traditional Web Hosting

Upload all files to your web hosting provider's public HTML directory.

## Configuration

### Update Email Addresses

Before deploying, update the email addresses in the following files:

- `privacy-policy.html` - Replace `communityappuo@gmail.com` and `communityappuo@gmail.com`
- `terms-of-service.html` - Replace `communityappuo@gmail.com`
- `contact.html` - Replace `communityappuo@gmail.com` and `communityappuo@gmail.com`
- `index.html` - Replace `communityappuo@gmail.com`

### Update Supabase Redirect URLs

In your Supabase project settings, add these redirect URLs:

1. **Email Confirmation:**
   - `https://yourdomain.com/email-confirmation.html`
   - `myapp://sign-in` (for deep linking)

2. **Password Reset:**
   - `https://yourdomain.com/reset-password.html`
   - `myapp://reset-password` (for deep linking)

### Update App Store Links

In `index.html`, update the download buttons with your actual App Store and Google Play Store links:

- Replace `#` in the iOS download button with your App Store URL
- Replace `#` in the Android download button with your Google Play Store URL

## App Store Submission

When submitting to app stores, you'll need to provide:

1. **Privacy Policy URL:** `https://yourdomain.com/privacy-policy.html`
2. **Terms of Service URL:** `https://yourdomain.com/terms-of-service.html`

Make sure these URLs are:

- Accessible via HTTPS
- Publicly accessible (no login required)
- Mobile-friendly

## Customization

### Colors and Styling

Edit `styles.css` to customize:

- Color scheme (CSS variables at the top)
- Fonts
- Spacing and layout
- Dark mode support

### Content

All content is in HTML files and can be edited directly. The Privacy Policy and Terms of Service match the content in the mobile app.

## Testing

Before deploying:

1. Test all links and navigation
2. Verify email confirmation page works with Supabase links
3. Verify password reset page works with Supabase links
4. Test on mobile devices
5. Check that all email addresses are correct
6. Verify HTTPS is enabled (required for app stores)

## Support

For questions or issues, contact: communityappuo@gmail.com

# CommUnity

A crowd-powered mobile application that enables users to report and access real-time, local information. CommUnity combines safety, convenience, and community engagement, allowing users to collaborate on solving everyday problems and stay informed about their local community.

## Features

### Core Functionality

- **Interactive Map View**: Browse community reports on an interactive map with location-based filtering
- **Report Creation**: Submit four types of reports:
  - **Events**: Community events with date/time information
  - **Hazards**: Safety hazards and warnings
  - **Lost Items**: Report lost items with contact information
  - **Found Items**: Report found items with contact information
- **Forums View**: List-based view of all reports with category filtering
- **Report Details**: Detailed view of individual reports with images and location information
- **Real-time Updates**: Push notifications for nearby reports based on user preferences
- **User Authentication**: Secure sign-up, sign-in, and password reset functionality

### User Features

- **Customizable Distance Radius**: Set your preferred radius (km or miles) for viewing reports
- **Category Filtering**: Filter reports by type (All, Events, Hazards, Lost, Found)
- **User Profile & Settings**: Manage account settings, email, password, and notification preferences
- **Image Uploads**: Attach photos to reports for better context
- **Location-based Filtering**: View reports within your specified distance radius
- **Dark Mode Support**: Automatic theme switching based on system preferences

### Moderation & Safety

- **User Moderation System**: Shadowbanning and strike system for content moderation
- **Report Flagging**: Users can flag inappropriate content
- **Content Filtering**: Shadowbanned users' content is automatically filtered from public views

## Tech Stack

### Frontend

- **React Native** (0.81.5) with **Expo** (54.0.25)
- **TypeScript** (5.9.2)
- **Expo Router** (6.0.15) - File-based routing
- **React Navigation** - Navigation library
- **React Native Maps** (1.20.1) - Map integration
- **React Native Paper** (5.14.5) - UI components

### Backend & Database

- **Supabase** - Backend-as-a-Service (authentication, database, storage)
- **PostgreSQL** - Database (via Supabase)
- **Supabase Storage** - Image storage

### Key Libraries

- **expo-location** - Location services
- **expo-notifications** - Push notifications
- **expo-image-picker** - Image selection
- **expo-secure-store** - Secure storage
- **react-native-reanimated** - Animations

### Development Tools

- **Jest** (29.7.0) - Unit testing
- **Detox** (20.43.0) - End-to-end testing
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking

## Project Structure

```
CommUnity/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation screens
│   ├── home.tsx           # Main map view
│   ├── forums.tsx        # List view of reports
│   ├── report-details.tsx # Individual report details
│   ├── sign-in.tsx        # Authentication screens
│   ├── sign-up.tsx        # Authentication screens
│   └── welcome.tsx        # Welcome screen
├── components/             # Reusable React components
│   ├── Events/            # Event-related components
│   ├── Hazards/           # Hazard-related components
│   ├── Home/              # Home screen components
│   ├── LostAndFound/      # Lost/Found item components
│   ├── MapScreen.tsx      # Main map component
│   └── ui/                # UI primitives
├── services/              # Business logic services
│   ├── eventService.ts    # Event report operations
│   ├── hazardService.ts  # Hazard report operations
│   ├── lostAndFoundService.ts # Lost/Found operations
│   ├── reportService.ts   # General report operations
│   ├── imageService.ts   # Image upload handling
│   └── pinReportService.ts # Report flagging
├── hooks/                 # Custom React hooks
│   ├── usePushNotifications.ts # Push notification logic
│   └── useReports.ts      # Report data fetching
├── types/                 # TypeScript type definitions
│   └── report.ts          # Report-related types
├── utils/                 # Utility functions
├── lib/                   # Library configurations
│   ├── supabase.ts       # Supabase client setup
│   └── uiTheme.ts        # Theme utilities
├── constants/             # App constants
├── config/                # Configuration files
├── __tests__/             # Unit tests
├── e2e/                   # End-to-end tests
└── schema.sql            # Database schema reference
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for iOS development) or Android Emulator (for Android development)
- Supabase account and project

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd CommUnity
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:

   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npx expo start -c
   ```

## Database Schema

The application uses PostgreSQL with the following main tables:

- `reports` - Main report table
- `events` - Event-specific data
- `hazards` - Hazard-specific data
- `lostitems` - Lost item data
- `founditems` - Found item data
- `notification_preferences` - User notification settings
- `user_moderation` - User moderation and shadowbanning
- `pin_reports` - Report flagging system

See `schema.sql` for the complete database schema.

## Testing

### Unit Tests

Unit tests are written with Jest and React Native Testing Library:

```bash
npm test
```

### End-to-End Tests

E2E tests use Detox:

```bash
# Build and run iOS tests
npm run test:e2e:build:ios
npm run test:e2e:ios

# Build and run Android tests
npm run test:e2e:build:android
npm run test:e2e:android
```

## CI/CD

The project includes GitHub Actions workflows for:

- Running tests on push/PR
- Type checking
- Linting
- Expo Doctor checks

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Team Members

- **Mostafa Yassine**: myass025@uottawa.ca, 300233320
- **Vivek Bhandari**: vbhan095@uottawa.ca, 300247090
- **Teddy-Michael Sannan**: tsann010@uottawa.ca, 300227605
- **Jonathan Colasante**: jcola037@uottawa.ca, 300234532

## Customer Information

- **Name**: Shrenil Patel
- **Email**: patel.shrenil@gmail.com
- **Affiliation**: University of Waterloo Software Engineering Alumni

## Documentation

- **Wiki**: https://github.com/Mosut0/CommUnity/wiki
- **Security Policy**: See [SECURITY.md](SECURITY.md)

## Acknowledgments

Built with [Expo](https://expo.dev/) and [Supabase](https://supabase.com/).

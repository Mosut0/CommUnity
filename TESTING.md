# Testing Strategy for CommUnity

This document outlines the comprehensive testing strategy for the CommUnity React Native application.

## Testing Approaches

### 1. Unit Testing (Jest)
**Purpose**: Test individual functions, components, and utilities in isolation.

**Coverage**: 38.19% (187 tests passing)

**Files Tested**:
- ✅ Services (`eventService`, `hazardService`, `lostAndFoundService`, `imageService`)
- ✅ Utilities (`distance.ts`, `formStyles.ts`, `uiTheme.ts`)
- ✅ Hooks (`useColorScheme`, `useThemeColor`)
- ✅ Simple Components (`ThemedText`, `ThemedView`, `Auth`, `Collapsible`)
- ✅ App Pages (`welcome.tsx`, `sign-in.tsx`, `sign-up.tsx`, `+not-found.tsx`)

**Files Excluded** (due to complex dependencies):
- ❌ `app/_layout.tsx` - Deep linking, fonts, splash screen
- ❌ `app/(tabs)/_layout.tsx` - Tab navigation
- ❌ `app/(tabs)/explore.tsx` - ParallaxScrollView
- ❌ `components/MapScreen.tsx` - Native maps, location services
- ❌ `components/Home/ProfileSheet.tsx` - Animated modals
- ❌ `components/ui/TabBarBackground.ios.tsx` - expo-blur
- ❌ `lib/supabase.ts` - react-native-url-polyfill

**Run**: `npm run test:unit`

### 2. E2E Testing (Detox)
**Purpose**: Test complete user flows and real device interactions.

**Files Tested**:
- ✅ `app/_layout.tsx` - App initialization, deep linking, theme switching
- ✅ `components/MapScreen.tsx` - Map interactions, location permissions, markers
- ✅ `components/Home/ProfileSheet.tsx` - Modal interactions, form submissions

**Test Files**:
- `e2e/appLayout.e2e.test.js`
- `e2e/mapScreen.e2e.test.js`
- `e2e/profileSheet.e2e.test.js`

**Run**: 
```bash
npm run test:e2e:build  # Build app for testing
npm run test:e2e       # Run E2E tests
```

### 3. Visual Testing (Storybook)
**Purpose**: Test UI components in isolation with different props and states.

**Files Tested**:
- ✅ `components/Home/ProfileSheet.tsx` - Different states, themes, props
- ✅ `components/ui/TabBarBackground.ios.tsx` - Visual variations
- ✅ `app/_layout.tsx` - Layout variations

**Story Files**:
- `components/Home/ProfileSheet.stories.tsx`
- `components/ui/TabBarBackground.stories.tsx`
- `app/_layout.stories.tsx`

**Run**: 
```bash
npm run storybook      # Start Storybook dev server
npm run storybook:build # Build static Storybook
```

### 4. Integration Testing
**Purpose**: Test component interactions and service integrations.

**Files Tested**:
- ✅ `lib/supabase.ts` - Supabase configuration and app state handling
- ✅ `components/MapScreen.tsx` - Component integration with mocked dependencies

**Test Files**:
- `integration/supabase.integration.test.ts`
- `integration/mapScreen.integration.test.tsx`

**Run**: `npm run test:integration`

## Test Commands

```bash
# Run all unit tests
npm run test:unit

# Run E2E tests (requires app build)
npm run test:e2e:build
npm run test:e2e

# Run integration tests
npm run test:integration

# Run all tests
npm run test:all

# Start Storybook
npm run storybook
```

## Coverage Goals

- **Unit Tests**: 38.19% (achieved)
- **E2E Tests**: Critical user flows covered
- **Visual Tests**: All UI components covered
- **Integration Tests**: Service integrations covered

## Testing Best Practices

### Unit Testing
- Mock external dependencies
- Test pure functions and simple components
- Focus on business logic and utilities

### E2E Testing
- Test complete user journeys
- Use real device interactions
- Test native module functionality

### Visual Testing
- Test different component states
- Verify UI consistency
- Test theme variations

### Integration Testing
- Test component interactions
- Test service integrations
- Use realistic mock data

## Limitations

### Jest Unit Testing
- Cannot test native modules (`expo-location`, `react-native-maps`, `expo-blur`)
- Cannot test complex animations (`Animated.Value`)
- Cannot test deep linking and navigation
- Cannot test Supabase real-time subscriptions

### E2E Testing
- Requires app build and device/simulator
- Slower execution than unit tests
- More complex setup and maintenance

### Visual Testing
- Requires manual verification
- Cannot test user interactions
- Limited to UI appearance

## Recommendations

1. **Use Unit Tests** for:
   - Business logic
   - Utility functions
   - Simple components
   - Service functions

2. **Use E2E Tests** for:
   - Critical user flows
   - Native module functionality
   - Complex user interactions

3. **Use Visual Tests** for:
   - UI component variations
   - Theme testing
   - Design system validation

4. **Use Integration Tests** for:
   - Component interactions
   - Service integrations
   - Complex state management

## Future Improvements

1. **Add Maestro** for cross-platform E2E testing
2. **Add Chromatic** for visual regression testing
3. **Add Playwright** for web testing
4. **Add Performance Testing** for map and animation components
5. **Add Accessibility Testing** for screen reader support

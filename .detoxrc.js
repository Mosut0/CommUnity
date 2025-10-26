module.exports = {
  testRunner: {
    args: {
      $0: 'jest',
      config: 'e2e/jest.config.js',
    },
    jest: {
      setupFilesAfterEnv: ['<rootDir>/e2e/setup.js'],
    },
  },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath:
        'ios/build/Build/Products/Debug-iphonesimulator/CommUnity.app',
      build:
        'xcodebuild -workspace ios/CommUnity.xcworkspace -scheme CommUnity -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build',
    },
    'ios.release': {
      type: 'ios.app',
      binaryPath:
        'ios/build/Build/Products/Release-iphonesimulator/CommUnity.app',
      build:
        'xcodebuild -workspace ios/CommUnity.xcworkspace -scheme CommUnity -configuration Release -sdk iphonesimulator -derivedDataPath ios/build',
    },
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build:
        'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',
    },
    'android.release': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/release/app-release.apk',
      build:
        'cd android && ./gradlew assembleRelease assembleAndroidTest -DtestBuildType=release',
    },
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 14',
      },
    },
    attached: {
      type: 'android.attached',
      device: {
        adbName: '.*',
      },
    },
  },
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug',
    },
    'ios.sim.release': {
      device: 'simulator',
      app: 'ios.release',
    },
    'android.emu.debug': {
      device: 'attached',
      app: 'android.debug',
    },
    'android.emu.release': {
      device: 'attached',
      app: 'android.release',
    },
  },
};

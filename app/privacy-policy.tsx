import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { Colors, type ThemeName } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

type ThemeConfig = (typeof Colors)[ThemeName];

export default function PrivacyPolicy() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const themeName: ThemeName = scheme === 'dark' ? 'dark' : 'light';
  const uiTheme = Colors[themeName];
  const styles = useStyles(uiTheme);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons
            name='arrow-back'
            size={24}
            color={uiTheme.textPrimary}
          />
        </TouchableOpacity>
        <ThemedText style={[styles.headerTitle, { color: uiTheme.textPrimary }]}>
          Privacy Policy
        </ThemedText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <ThemedText style={[styles.title, { color: uiTheme.textPrimary }]}>
          Privacy Policy
        </ThemedText>
        <ThemedText style={[styles.lastUpdated, { color: uiTheme.textSecondary }]}>
          Last Updated: {new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </ThemedText>

        <ThemedText style={[styles.paragraph, { color: uiTheme.textSecondary }]}>
          CommUnity ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application ("App"). Please read this Privacy Policy carefully. By using the App, you consent to the data practices described in this policy.
        </ThemedText>

        <ThemedText style={[styles.sectionTitle, { color: uiTheme.textPrimary }]}>
          1. Information We Collect
        </ThemedText>
        <ThemedText style={[styles.subsectionTitle, { color: uiTheme.textPrimary }]}>
          1.1 Information You Provide
        </ThemedText>
        <ThemedText style={[styles.paragraph, { color: uiTheme.textSecondary }]}>
          We collect information that you provide directly to us, including:
        </ThemedText>
        <ThemedText style={[styles.listItem, { color: uiTheme.textSecondary }]}>
          • Account Information: Email address, password (stored securely and hashed), and any other information you provide during registration
        </ThemedText>
        <ThemedText style={[styles.listItem, { color: uiTheme.textSecondary }]}>
          • User-Generated Content: Reports, descriptions, images, and other content you post through the App
        </ThemedText>
        <ThemedText style={[styles.listItem, { color: uiTheme.textSecondary }]}>
          • Contact Information: Contact details you provide when reporting lost or found items
        </ThemedText>
        <ThemedText style={[styles.listItem, { color: uiTheme.textSecondary }]}>
          • Preferences: Notification preferences, distance radius settings, and unit preferences (kilometers or miles)
        </ThemedText>

        <ThemedText style={[styles.subsectionTitle, { color: uiTheme.textPrimary }]}>
          1.2 Automatically Collected Information
        </ThemedText>
        <ThemedText style={[styles.paragraph, { color: uiTheme.textSecondary }]}>
          We automatically collect certain information when you use the App:
        </ThemedText>
        <ThemedText style={[styles.listItem, { color: uiTheme.textSecondary }]}>
          • Location Data: GPS coordinates and location information when you use location-based features
        </ThemedText>
        <ThemedText style={[styles.listItem, { color: uiTheme.textSecondary }]}>
          • Device Information: Device type, operating system, unique device identifiers, and mobile network information
        </ThemedText>
        <ThemedText style={[styles.listItem, { color: uiTheme.textSecondary }]}>
          • Usage Information: How you interact with the App, features you use, reports you view, and time spent in the App
        </ThemedText>
        <ThemedText style={[styles.listItem, { color: uiTheme.textSecondary }]}>
          • Push Notification Tokens: Device tokens used to send push notifications
        </ThemedText>
        <ThemedText style={[styles.listItem, { color: uiTheme.textSecondary }]}>
          • Log Data: IP address, access times, app crashes, and other diagnostic data
        </ThemedText>

        <ThemedText style={[styles.subsectionTitle, { color: uiTheme.textPrimary }]}>
          1.3 Information from Third-Party Services
        </ThemedText>
        <ThemedText style={[styles.paragraph, { color: uiTheme.textSecondary }]}>
          We use third-party services that may collect information:
        </ThemedText>
        <ThemedText style={[styles.listItem, { color: uiTheme.textSecondary }]}>
          • Supabase: We use Supabase for authentication and database services. Supabase's privacy practices are governed by their own privacy policy.
        </ThemedText>
        <ThemedText style={[styles.listItem, { color: uiTheme.textSecondary }]}>
          • Expo: We use Expo services for push notifications, location services, and other app functionality. Expo's privacy practices are governed by their own privacy policy.
        </ThemedText>

        <ThemedText style={[styles.sectionTitle, { color: uiTheme.textPrimary }]}>
          2. How We Use Your Information
        </ThemedText>
        <ThemedText style={[styles.paragraph, { color: uiTheme.textSecondary }]}>
          We use the information we collect to:
        </ThemedText>
        <ThemedText style={[styles.listItem, { color: uiTheme.textSecondary }]}>
          • Provide, maintain, and improve the App and its features
        </ThemedText>
        <ThemedText style={[styles.listItem, { color: uiTheme.textSecondary }]}>
          • Authenticate your identity and manage your account
        </ThemedText>
        <ThemedText style={[styles.listItem, { color: uiTheme.textSecondary }]}>
          • Process and display user-generated content, including reports and images
        </ThemedText>
        <ThemedText style={[styles.listItem, { color: uiTheme.textSecondary }]}>
          • Provide location-based services and filter content based on your location
        </ThemedText>
        <ThemedText style={[styles.listItem, { color: uiTheme.textSecondary }]}>
          • Send you push notifications based on your preferences and location
        </ThemedText>
        <ThemedText style={[styles.listItem, { color: uiTheme.textSecondary }]}>
          • Respond to your inquiries, comments, and requests
        </ThemedText>
        <ThemedText style={[styles.listItem, { color: uiTheme.textSecondary }]}>
          • Monitor and analyze usage patterns and trends
        </ThemedText>
        <ThemedText style={[styles.listItem, { color: uiTheme.textSecondary }]}>
          • Detect, prevent, and address technical issues, fraud, and security threats
        </ThemedText>
        <ThemedText style={[styles.listItem, { color: uiTheme.textSecondary }]}>
          • Comply with legal obligations and enforce our Terms of Service
        </ThemedText>

        <ThemedText style={[styles.sectionTitle, { color: uiTheme.textPrimary }]}>
          3. How We Share Your Information
        </ThemedText>
        <ThemedText style={[styles.paragraph, { color: uiTheme.textSecondary }]}>
          We do not sell your personal information. We may share your information in the following circumstances:
        </ThemedText>
        <ThemedText style={[styles.subsectionTitle, { color: uiTheme.textPrimary }]}>
          3.1 Public Content
        </ThemedText>
        <ThemedText style={[styles.paragraph, { color: uiTheme.textSecondary }]}>
          Reports, descriptions, images, and location data you post are publicly visible to other App users within your selected distance radius. This information is shared to enable community features.
        </ThemedText>
        <ThemedText style={[styles.subsectionTitle, { color: uiTheme.textPrimary }]}>
          3.2 Service Providers
        </ThemedText>
        <ThemedText style={[styles.paragraph, { color: uiTheme.textSecondary }]}>
          We may share information with third-party service providers who perform services on our behalf, including:
        </ThemedText>
        <ThemedText style={[styles.listItem, { color: uiTheme.textSecondary }]}>
          • Cloud hosting and database services (Supabase)
        </ThemedText>
        <ThemedText style={[styles.listItem, { color: uiTheme.textSecondary }]}>
          • Push notification services (Expo)
        </ThemedText>
        <ThemedText style={[styles.listItem, { color: uiTheme.textSecondary }]}>
          • Analytics and crash reporting services
        </ThemedText>
        <ThemedText style={[styles.paragraph, { color: uiTheme.textSecondary }]}>
          These service providers are contractually obligated to protect your information and use it only for the purposes we specify.
        </ThemedText>
        <ThemedText style={[styles.subsectionTitle, { color: uiTheme.textPrimary }]}>
          3.3 Legal Requirements
        </ThemedText>
        <ThemedText style={[styles.paragraph, { color: uiTheme.textSecondary }]}>
          We may disclose your information if required by law, court order, or governmental authority, or if we believe disclosure is necessary to protect our rights, protect your safety or the safety of others, investigate fraud, or comply with a legal process.
        </ThemedText>
        <ThemedText style={[styles.subsectionTitle, { color: uiTheme.textPrimary }]}>
          3.4 Business Transfers
        </ThemedText>
        <ThemedText style={[styles.paragraph, { color: uiTheme.textSecondary }]}>
          In the event of a merger, acquisition, reorganization, or sale of assets, your information may be transferred as part of that transaction. We will notify you of any such change in ownership or control of your information.
        </ThemedText>

        <ThemedText style={[styles.sectionTitle, { color: uiTheme.textPrimary }]}>
          4. Data Security
        </ThemedText>
        <ThemedText style={[styles.paragraph, { color: uiTheme.textSecondary }]}>
          We implement appropriate technical and organizational measures to protect your information against unauthorized access, alteration, disclosure, or destruction. These measures include:
        </ThemedText>
        <ThemedText style={[styles.listItem, { color: uiTheme.textSecondary }]}>
          • Encryption of data in transit using SSL/TLS
        </ThemedText>
        <ThemedText style={[styles.listItem, { color: uiTheme.textSecondary }]}>
          • Secure password storage using industry-standard hashing algorithms
        </ThemedText>
        <ThemedText style={[styles.listItem, { color: uiTheme.textSecondary }]}>
          • Access controls and authentication mechanisms
        </ThemedText>
        <ThemedText style={[styles.listItem, { color: uiTheme.textSecondary }]}>
          • Regular security assessments and updates
        </ThemedText>
        <ThemedText style={[styles.paragraph, { color: uiTheme.textSecondary }]}>
          However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
        </ThemedText>

        <ThemedText style={[styles.sectionTitle, { color: uiTheme.textPrimary }]}>
          5. Your Rights and Choices
        </ThemedText>
        <ThemedText style={[styles.paragraph, { color: uiTheme.textSecondary }]}>
          Depending on your location, you may have certain rights regarding your personal information:
        </ThemedText>
        <ThemedText style={[styles.subsectionTitle, { color: uiTheme.textPrimary }]}>
          5.1 Access and Portability
        </ThemedText>
        <ThemedText style={[styles.paragraph, { color: uiTheme.textSecondary }]}>
          You have the right to access the personal information we hold about you and to receive a copy of your data in a portable format.
        </ThemedText>
        <ThemedText style={[styles.subsectionTitle, { color: uiTheme.textPrimary }]}>
          5.2 Correction
        </ThemedText>
        <ThemedText style={[styles.paragraph, { color: uiTheme.textSecondary }]}>
          You can update your account information, including email address and preferences, directly through the App settings.
        </ThemedText>
        <ThemedText style={[styles.subsectionTitle, { color: uiTheme.textPrimary }]}>
          5.3 Deletion
        </ThemedText>
        <ThemedText style={[styles.paragraph, { color: uiTheme.textSecondary }]}>
          You may request deletion of your account and associated data by contacting us or using account deletion features in the App. We will delete your information except where we are required to retain it for legal purposes.
        </ThemedText>
        <ThemedText style={[styles.subsectionTitle, { color: uiTheme.textPrimary }]}>
          5.4 Opt-Out of Notifications
        </ThemedText>
        <ThemedText style={[styles.paragraph, { color: uiTheme.textSecondary }]}>
          You can manage push notification preferences in the App settings or disable notifications through your device settings.
        </ThemedText>
        <ThemedText style={[styles.subsectionTitle, { color: uiTheme.textPrimary }]}>
          5.5 Location Services
        </ThemedText>
        <ThemedText style={[styles.paragraph, { color: uiTheme.textSecondary }]}>
          You can disable location services through your device settings, though this may limit App functionality.
        </ThemedText>
        <ThemedText style={[styles.subsectionTitle, { color: uiTheme.textPrimary }]}>
          5.6 Do Not Track
        </ThemedText>
        <ThemedText style={[styles.paragraph, { color: uiTheme.textSecondary }]}>
          The App does not currently respond to "Do Not Track" signals. We continue to review and may implement such signals in the future.
        </ThemedText>

        <ThemedText style={[styles.sectionTitle, { color: uiTheme.textPrimary }]}>
          6. Children's Privacy
        </ThemedText>
        <ThemedText style={[styles.paragraph, { color: uiTheme.textSecondary }]}>
          The App is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately. If we become aware that we have collected information from a child under 13, we will take steps to delete such information.
        </ThemedText>

        <ThemedText style={[styles.sectionTitle, { color: uiTheme.textPrimary }]}>
          7. International Data Transfers
        </ThemedText>
        <ThemedText style={[styles.paragraph, { color: uiTheme.textSecondary }]}>
          Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that differ from those in your country. By using the App, you consent to the transfer of your information to these countries.
        </ThemedText>

        <ThemedText style={[styles.sectionTitle, { color: uiTheme.textPrimary }]}>
          8. Data Retention
        </ThemedText>
        <ThemedText style={[styles.paragraph, { color: uiTheme.textSecondary }]}>
          We retain your information for as long as necessary to provide the App, comply with legal obligations, resolve disputes, and enforce our agreements. When you delete your account, we will delete or anonymize your personal information, except where we are required to retain it for legal purposes.
        </ThemedText>

        <ThemedText style={[styles.sectionTitle, { color: uiTheme.textPrimary }]}>
          9. California Privacy Rights
        </ThemedText>
        <ThemedText style={[styles.paragraph, { color: uiTheme.textSecondary }]}>
          If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA):
        </ThemedText>
        <ThemedText style={[styles.listItem, { color: uiTheme.textSecondary }]}>
          • Right to know what personal information is collected, used, shared, or sold
        </ThemedText>
        <ThemedText style={[styles.listItem, { color: uiTheme.textSecondary }]}>
          • Right to delete personal information
        </ThemedText>
        <ThemedText style={[styles.listItem, { color: uiTheme.textSecondary }]}>
          • Right to opt-out of the sale of personal information (we do not sell personal information)
        </ThemedText>
        <ThemedText style={[styles.listItem, { color: uiTheme.textSecondary }]}>
          • Right to non-discrimination for exercising your privacy rights
        </ThemedText>
        <ThemedText style={[styles.paragraph, { color: uiTheme.textSecondary }]}>
          To exercise these rights, please contact us using the information provided in Section 12.
        </ThemedText>

        <ThemedText style={[styles.sectionTitle, { color: uiTheme.textPrimary }]}>
          10. European Privacy Rights (GDPR)
        </ThemedText>
        <ThemedText style={[styles.paragraph, { color: uiTheme.textSecondary }]}>
          If you are located in the European Economic Area (EEA), you have additional rights under the General Data Protection Regulation (GDPR):
        </ThemedText>
        <ThemedText style={[styles.listItem, { color: uiTheme.textSecondary }]}>
          • Right to access your personal data
        </ThemedText>
        <ThemedText style={[styles.listItem, { color: uiTheme.textSecondary }]}>
          • Right to rectification of inaccurate data
        </ThemedText>
        <ThemedText style={[styles.listItem, { color: uiTheme.textSecondary }]}>
          • Right to erasure ("right to be forgotten")
        </ThemedText>
        <ThemedText style={[styles.listItem, { color: uiTheme.textSecondary }]}>
          • Right to restrict processing
        </ThemedText>
        <ThemedText style={[styles.listItem, { color: uiTheme.textSecondary }]}>
          • Right to data portability
        </ThemedText>
        <ThemedText style={[styles.listItem, { color: uiTheme.textSecondary }]}>
          • Right to object to processing
        </ThemedText>
        <ThemedText style={[styles.listItem, { color: uiTheme.textSecondary }]}>
          • Right to withdraw consent
        </ThemedText>
        <ThemedText style={[styles.listItem, { color: uiTheme.textSecondary }]}>
          • Right to lodge a complaint with a supervisory authority
        </ThemedText>
        <ThemedText style={[styles.paragraph, { color: uiTheme.textSecondary }]}>
          To exercise these rights, please contact us using the information provided in Section 12.
        </ThemedText>

        <ThemedText style={[styles.sectionTitle, { color: uiTheme.textPrimary }]}>
          11. Changes to This Privacy Policy
        </ThemedText>
        <ThemedText style={[styles.paragraph, { color: uiTheme.textSecondary }]}>
          We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the updated Privacy Policy in the App and updating the "Last Updated" date. Your continued use of the App after such modifications constitutes your acceptance of the updated Privacy Policy.
        </ThemedText>

        <ThemedText style={[styles.sectionTitle, { color: uiTheme.textPrimary }]}>
          12. Contact Us
        </ThemedText>
        <ThemedText style={[styles.paragraph, { color: uiTheme.textSecondary }]}>
          If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at:
        </ThemedText>
        <ThemedText style={[styles.paragraph, { color: uiTheme.textSecondary }]}>
          Email: privacy@communityuo.com
        </ThemedText>
        <ThemedText style={[styles.paragraph, { color: uiTheme.textSecondary }]}>
          For general support: support@communityuo.com
        </ThemedText>

        <View style={styles.spacer} />
      </ScrollView>
    </View>
  );
}

const useStyles = (uiTheme: ThemeConfig) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: uiTheme.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: uiTheme.divider,
    },
    backButton: {
      padding: 4,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      flex: 1,
      textAlign: 'center',
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      marginBottom: 8,
    },
    lastUpdated: {
      fontSize: 12,
      marginBottom: 24,
      fontStyle: 'italic',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginTop: 24,
      marginBottom: 12,
    },
    subsectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginTop: 16,
      marginBottom: 8,
    },
    paragraph: {
      fontSize: 14,
      lineHeight: 22,
      marginBottom: 12,
    },
    listItem: {
      fontSize: 14,
      lineHeight: 22,
      marginBottom: 8,
      marginLeft: 16,
    },
    spacer: {
      height: 40,
    },
  });


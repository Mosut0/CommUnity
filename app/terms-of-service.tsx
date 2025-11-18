import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { Colors, type ThemeName } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

type ThemeConfig = (typeof Colors)[ThemeName];

export default function TermsOfService() {
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
        <ThemedText
          style={[styles.headerTitle, { color: uiTheme.textPrimary }]}
        >
          Terms of Service
        </ThemedText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <ThemedText style={[styles.title, { color: uiTheme.textPrimary }]}>
          Terms of Service
        </ThemedText>
        <ThemedText
          style={[styles.lastUpdated, { color: uiTheme.textSecondary }]}
        >
          Last Updated:{' '}
          {new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </ThemedText>

        <ThemedText
          style={[styles.sectionTitle, { color: uiTheme.textPrimary }]}
        >
          1. Acceptance of Terms
        </ThemedText>
        <ThemedText
          style={[styles.paragraph, { color: uiTheme.textSecondary }]}
        >
          By accessing or using the CommUnity mobile application ("App"), you
          agree to be bound by these Terms of Service ("Terms"). If you do not
          agree to these Terms, you may not access or use the App. These Terms
          constitute a legally binding agreement between you and CommUnity
          ("we," "us," or "our").
        </ThemedText>

        <ThemedText
          style={[styles.sectionTitle, { color: uiTheme.textPrimary }]}
        >
          2. Description of Service
        </ThemedText>
        <ThemedText
          style={[styles.paragraph, { color: uiTheme.textSecondary }]}
        >
          CommUnity is a community-powered mobile application that enables users
          to report and access real-time, local information. The App allows
          users to:
        </ThemedText>
        <ThemedText style={[styles.listItem, { color: uiTheme.textSecondary }]}>
          • Report safety concerns, infrastructure issues, wildlife sightings,
          health alerts, and other community matters
        </ThemedText>
        <ThemedText style={[styles.listItem, { color: uiTheme.textSecondary }]}>
          • Report and search for lost and found items
        </ThemedText>
        <ThemedText style={[styles.listItem, { color: uiTheme.textSecondary }]}>
          • Share and discover local events
        </ThemedText>
        <ThemedText style={[styles.listItem, { color: uiTheme.textSecondary }]}>
          • Receive location-based notifications about community reports
        </ThemedText>
        <ThemedText
          style={[styles.paragraph, { color: uiTheme.textSecondary }]}
        >
          The App uses location services to provide relevant,
          geographically-based information to users.
        </ThemedText>

        <ThemedText
          style={[styles.sectionTitle, { color: uiTheme.textPrimary }]}
        >
          3. User Accounts and Registration
        </ThemedText>
        <ThemedText
          style={[styles.paragraph, { color: uiTheme.textSecondary }]}
        >
          To use certain features of the App, you must register for an account.
          You agree to:
        </ThemedText>
        <ThemedText style={[styles.listItem, { color: uiTheme.textSecondary }]}>
          • Provide accurate, current, and complete information during
          registration
        </ThemedText>
        <ThemedText style={[styles.listItem, { color: uiTheme.textSecondary }]}>
          • Maintain and update your account information to keep it accurate
        </ThemedText>
        <ThemedText style={[styles.listItem, { color: uiTheme.textSecondary }]}>
          • Maintain the security of your account credentials
        </ThemedText>
        <ThemedText style={[styles.listItem, { color: uiTheme.textSecondary }]}>
          • Accept responsibility for all activities that occur under your
          account
        </ThemedText>
        <ThemedText
          style={[styles.paragraph, { color: uiTheme.textSecondary }]}
        >
          You must be at least 13 years old to use the App. If you are under 18,
          you represent that you have obtained parental or guardian consent to
          use the App.
        </ThemedText>

        <ThemedText
          style={[styles.sectionTitle, { color: uiTheme.textPrimary }]}
        >
          4. User Conduct and Content
        </ThemedText>
        <ThemedText
          style={[styles.paragraph, { color: uiTheme.textSecondary }]}
        >
          You agree not to use the App to:
        </ThemedText>
        <ThemedText style={[styles.listItem, { color: uiTheme.textSecondary }]}>
          • Post false, misleading, or fraudulent information
        </ThemedText>
        <ThemedText style={[styles.listItem, { color: uiTheme.textSecondary }]}>
          • Post content that is illegal, harmful, threatening, abusive,
          harassing, defamatory, vulgar, obscene, or otherwise objectionable
        </ThemedText>
        <ThemedText style={[styles.listItem, { color: uiTheme.textSecondary }]}>
          • Violate any applicable laws or regulations
        </ThemedText>
        <ThemedText style={[styles.listItem, { color: uiTheme.textSecondary }]}>
          • Infringe upon the rights of others, including intellectual property
          rights
        </ThemedText>
        <ThemedText style={[styles.listItem, { color: uiTheme.textSecondary }]}>
          • Post spam, unsolicited messages, or advertisements
        </ThemedText>
        <ThemedText style={[styles.listItem, { color: uiTheme.textSecondary }]}>
          • Impersonate any person or entity or falsely state or misrepresent
          your affiliation with any person or entity
        </ThemedText>
        <ThemedText style={[styles.listItem, { color: uiTheme.textSecondary }]}>
          • Interfere with or disrupt the App or servers or networks connected
          to the App
        </ThemedText>
        <ThemedText
          style={[styles.paragraph, { color: uiTheme.textSecondary }]}
        >
          You retain ownership of any content you post through the App. However,
          by posting content, you grant us a worldwide, non-exclusive,
          royalty-free license to use, reproduce, modify, adapt, publish,
          translate, distribute, and display such content for the purpose of
          operating and promoting the App.
        </ThemedText>

        <ThemedText
          style={[styles.sectionTitle, { color: uiTheme.textPrimary }]}
        >
          5. Location Services
        </ThemedText>
        <ThemedText
          style={[styles.paragraph, { color: uiTheme.textSecondary }]}
        >
          The App requires access to your device's location services to provide
          location-based features. By using the App, you consent to the
          collection and use of your location data as described in our Privacy
          Policy. You may disable location services through your device
          settings, but this may limit or prevent certain features of the App
          from functioning.
        </ThemedText>

        <ThemedText
          style={[styles.sectionTitle, { color: uiTheme.textPrimary }]}
        >
          6. Intellectual Property Rights
        </ThemedText>
        <ThemedText
          style={[styles.paragraph, { color: uiTheme.textSecondary }]}
        >
          The App, including its original content, features, and functionality,
          is owned by CommUnity and is protected by international copyright,
          trademark, patent, trade secret, and other intellectual property laws.
          You may not copy, modify, distribute, sell, or lease any part of the
          App without our prior written consent.
        </ThemedText>

        <ThemedText
          style={[styles.sectionTitle, { color: uiTheme.textPrimary }]}
        >
          7. Disclaimers and Limitations of Liability
        </ThemedText>
        <ThemedText
          style={[styles.paragraph, { color: uiTheme.textSecondary }]}
        >
          THE APP IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF
          ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
          IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
          PURPOSE, AND NON-INFRINGEMENT.
        </ThemedText>
        <ThemedText
          style={[styles.paragraph, { color: uiTheme.textSecondary }]}
        >
          We do not guarantee the accuracy, completeness, or usefulness of any
          information on the App. User-generated content reflects the views of
          individual users and not necessarily our views. We are not responsible
          for the content, accuracy, or opinions expressed in user-generated
          content.
        </ThemedText>
        <ThemedText
          style={[styles.paragraph, { color: uiTheme.textSecondary }]}
        >
          TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, WE SHALL NOT BE
          LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
          PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED
          DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER
          INTANGIBLE LOSSES RESULTING FROM YOUR USE OF THE APP.
        </ThemedText>
        <ThemedText
          style={[styles.paragraph, { color: uiTheme.textSecondary }]}
        >
          The App is not intended to replace emergency services. In case of an
          emergency, please contact your local emergency services immediately.
        </ThemedText>

        <ThemedText
          style={[styles.sectionTitle, { color: uiTheme.textPrimary }]}
        >
          8. Indemnification
        </ThemedText>
        <ThemedText
          style={[styles.paragraph, { color: uiTheme.textSecondary }]}
        >
          You agree to indemnify, defend, and hold harmless CommUnity, its
          officers, directors, employees, agents, and affiliates from and
          against any claims, liabilities, damages, losses, and expenses,
          including reasonable attorneys' fees, arising out of or in any way
          connected with your access to or use of the App, your violation of
          these Terms, or your violation of any rights of another.
        </ThemedText>

        <ThemedText
          style={[styles.sectionTitle, { color: uiTheme.textPrimary }]}
        >
          9. Termination
        </ThemedText>
        <ThemedText
          style={[styles.paragraph, { color: uiTheme.textSecondary }]}
        >
          We reserve the right to suspend or terminate your account and access
          to the App at any time, with or without cause or notice, for any
          reason, including if you breach these Terms. Upon termination, your
          right to use the App will immediately cease. We may also remove or
          delete any content you have posted.
        </ThemedText>
        <ThemedText
          style={[styles.paragraph, { color: uiTheme.textSecondary }]}
        >
          You may terminate your account at any time by contacting us or using
          the account deletion features within the App.
        </ThemedText>

        <ThemedText
          style={[styles.sectionTitle, { color: uiTheme.textPrimary }]}
        >
          10. Modifications to Terms
        </ThemedText>
        <ThemedText
          style={[styles.paragraph, { color: uiTheme.textSecondary }]}
        >
          We reserve the right to modify these Terms at any time. We will notify
          users of any material changes by posting the updated Terms in the App
          and updating the "Last Updated" date. Your continued use of the App
          after such modifications constitutes your acceptance of the modified
          Terms.
        </ThemedText>

        <ThemedText
          style={[styles.sectionTitle, { color: uiTheme.textPrimary }]}
        >
          11. Governing Law and Dispute Resolution
        </ThemedText>
        <ThemedText
          style={[styles.paragraph, { color: uiTheme.textSecondary }]}
        >
          These Terms shall be governed by and construed in accordance with the
          laws of the jurisdiction in which CommUnity operates, without regard
          to its conflict of law provisions. Any disputes arising out of or
          relating to these Terms or the App shall be resolved through binding
          arbitration in accordance with the rules of the applicable arbitration
          association, except where prohibited by law.
        </ThemedText>

        <ThemedText
          style={[styles.sectionTitle, { color: uiTheme.textPrimary }]}
        >
          12. Severability
        </ThemedText>
        <ThemedText
          style={[styles.paragraph, { color: uiTheme.textSecondary }]}
        >
          If any provision of these Terms is found to be unenforceable or
          invalid, that provision shall be limited or eliminated to the minimum
          extent necessary, and the remaining provisions shall remain in full
          force and effect.
        </ThemedText>

        <ThemedText
          style={[styles.sectionTitle, { color: uiTheme.textPrimary }]}
        >
          13. Entire Agreement
        </ThemedText>
        <ThemedText
          style={[styles.paragraph, { color: uiTheme.textSecondary }]}
        >
          These Terms, together with our Privacy Policy, constitute the entire
          agreement between you and CommUnity regarding the use of the App and
          supersede all prior agreements and understandings.
        </ThemedText>

        <ThemedText
          style={[styles.sectionTitle, { color: uiTheme.textPrimary }]}
        >
          14. Contact Information
        </ThemedText>
        <ThemedText
          style={[styles.paragraph, { color: uiTheme.textSecondary }]}
        >
          If you have any questions about these Terms, please contact us at:
        </ThemedText>
        <ThemedText
          style={[styles.paragraph, { color: uiTheme.textSecondary }]}
        >
          Email: support@communityuo.com
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

import React from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Linking,
  TouchableOpacity,
  Platform,
} from 'react-native';

const BRAND = {
  green: '#4CAF50',
  blue: '#2196F3',
  purple: '#9C27B0',
  bg: '#F9F9FB',
  card: '#FFFFFF',
  text: '#1A1A2E',
  muted: '#6B7280',
  border: '#E5E7EB',
};

const LAST_UPDATED = 'March 29, 2026';
const CONTACT_EMAIL = 'blorien555@gmail.com';

export default function PrivacyPolicy() {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={[styles.dot, { backgroundColor: BRAND.green }]} />
          <View style={[styles.dot, { backgroundColor: BRAND.blue }]} />
          <View style={[styles.dot, { backgroundColor: BRAND.purple }]} />
        </View>
        <Text style={styles.appName}>Capital Cohort</Text>
        <Text style={styles.tagline}>
          Personalize money management for all.
        </Text>
      </View>

      {/* Page Title */}
      <View style={styles.titleBlock}>
        <Text style={styles.pageTitle}>Privacy Policy</Text>
        <Text style={styles.lastUpdated}>Last updated: {LAST_UPDATED}</Text>
      </View>

      {/* Intro */}
      <View style={styles.card}>
        <View style={styles.highlightBar} />
        <Text style={styles.introText}>
          Capital Cohort is an <Text style={styles.bold}>offline-first</Text>{' '}
          budgeting app. We built it on a simple principle:{' '}
          <Text style={styles.bold}>
            your financial data belongs to you and only you.
          </Text>{' '}
          We do not collect, transmit, or store any of your personal data on
          external servers. This policy explains exactly what that means.
        </Text>
      </View>

      {/* Sections */}
      <Section
        number="1"
        color={BRAND.green}
        title="Information We Collect"
        body={[
          'Capital Cohort collects no personal information. All data you enter — income, expenses, budget rules, and preferences — is stored exclusively on your device using AsyncStorage.',
          'We have no backend servers, no databases, and no user accounts. There is nothing to "collect" because there is no network path for data to leave your device through our app.',
        ]}
      />

      <Section
        number="2"
        color={BRAND.blue}
        title="Local Data Storage"
        body={[
          'All app data is persisted locally on your device via AsyncStorage (React Native). This includes:',
        ]}
        bullets={[
          'Monthly income and budget rule configuration',
          'Expense records and recurring expense templates',
          'Currency and language preferences',
          'Theme (light / dark / auto) setting',
          'Onboarding completion status',
        ]}
        footer="This data is yours. You can export it at any time via Settings → Export Data, and delete it by uninstalling the app."
      />

      <Section
        number="3"
        color={BRAND.purple}
        title="Location Data"
        body={[
          "During onboarding, Capital Cohort may request access to your device's location — solely to suggest a default currency and region that matches where you live.",
          'Location access is entirely optional. If you grant it, the coordinates are used once to resolve your city and country, then immediately discarded. We never store raw GPS coordinates and never transmit location data anywhere.',
        ]}
      />

      <Section
        number="4"
        color={BRAND.green}
        title="Notifications"
        body={[
          'Capital Cohort may request permission to send local device notifications for:',
        ]}
        bullets={[
          'Over-budget alerts (when spending in a category exceeds your limit)',
          'Daily spending reminders',
          'Weekly digest summaries',
          'Month-end budget summary',
        ]}
        footer="All notifications are scheduled and delivered locally on your device via the Expo Notifications SDK. No notification content is ever sent to or from a remote server."
      />

      <Section
        number="5"
        color={BRAND.blue}
        title="Third-Party Services"
        body={[
          'Capital Cohort does not integrate with any third-party analytics services, advertising networks, crash reporters, or data brokers.',
          'The app has no internet permission requirements beyond those needed by the underlying Expo/React Native framework for development tooling (development builds only — not production).',
        ]}
      />

      <Section
        number="6"
        color={BRAND.purple}
        title="Children's Privacy"
        body={[
          'Capital Cohort does not knowingly collect any information from children under the age of 13 (or the applicable age in your jurisdiction). Because we collect no data at all, this is guaranteed by design.',
        ]}
      />

      <Section
        number="7"
        color={BRAND.green}
        title="Data Export & Deletion"
        body={['You have full control over your data at all times:']}
        bullets={[
          'Export: Settings → Export Data → CSV or JSON',
          'Import / Restore: Settings → Import Data',
          'Delete all data: Uninstall the app from your device',
        ]}
        footer="There are no server-side records to request deletion of because no data is ever sent to us."
      />

      <Section
        number="8"
        color={BRAND.blue}
        title="Changes to This Policy"
        body={[
          'We may update this Privacy Policy from time to time. When we do, we will update the "Last updated" date at the top of this page.',
          'We encourage you to review this page periodically. Continued use of the app after changes constitutes acceptance of the updated policy.',
        ]}
      />

      <Section
        number="9"
        color={BRAND.purple}
        title="Contact Us"
        body={[
          'If you have any questions about this Privacy Policy, please reach out:',
        ]}
      >
        <TouchableOpacity
          onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)}
        >
          <Text style={[styles.link, { color: BRAND.purple }]}>
            {CONTACT_EMAIL}
          </Text>
        </TouchableOpacity>
      </Section>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerDivider} />
        <View style={styles.footerBadges}>
          <Badge label="Offline-First" color={BRAND.green} />
          <Badge label="No Tracking" color={BRAND.blue} />
          <Badge label="No Ads" color={BRAND.purple} />
        </View>
        <Text style={styles.footerText}>
          © {new Date().getFullYear()} Capital Cohort. All rights reserved.
        </Text>
        <TouchableOpacity onPress={() => Linking.openURL('/terms-of-use')}>
          <Text style={[styles.footerLink, { color: BRAND.blue }]}>
            Terms of Use
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

type SectionProps = {
  number: string;
  color: string;
  title: string;
  body: string[];
  bullets?: string[];
  footer?: string;
  children?: React.ReactNode;
};

function Section({
  number,
  color,
  title,
  body,
  bullets,
  footer,
  children,
}: SectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionNumber, { backgroundColor: color }]}>
          <Text style={styles.sectionNumberText}>{number}</Text>
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {body.map((para, i) => (
        <Text key={i} style={styles.body}>
          {para}
        </Text>
      ))}
      {bullets && (
        <View style={styles.bulletList}>
          {bullets.map((item, i) => (
            <View key={i} style={styles.bulletRow}>
              <View style={[styles.bullet, { backgroundColor: color }]} />
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </View>
      )}
      {footer && <Text style={styles.footerNote}>{footer}</Text>}
      {children}
    </View>
  );
}

type BadgeProps = { label: string; color: string };
function Badge({ label, color }: BadgeProps) {
  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const MAX_WIDTH = 720;

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: BRAND.bg,
  },
  container: {
    alignItems: 'center',
    paddingBottom: 64,
    paddingHorizontal: 16,
  },
  header: {
    width: '100%',
    maxWidth: MAX_WIDTH,
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: 32,
  },
  logoRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: BRAND.text,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 15,
    color: BRAND.muted,
    marginTop: 4,
  },
  titleBlock: {
    width: '100%',
    maxWidth: MAX_WIDTH,
    borderBottomWidth: 2,
    borderBottomColor: BRAND.green,
    paddingBottom: 12,
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: BRAND.text,
    letterSpacing: -0.8,
  },
  lastUpdated: {
    fontSize: 13,
    color: BRAND.muted,
    marginTop: 4,
  },
  card: {
    width: '100%',
    maxWidth: MAX_WIDTH,
    backgroundColor: BRAND.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  highlightBar: {
    width: 4,
    borderRadius: 2,
    backgroundColor: BRAND.green,
    alignSelf: 'stretch',
    flexShrink: 0,
  },
  introText: {
    fontSize: 15,
    color: BRAND.text,
    lineHeight: 24,
    flex: 1,
  },
  bold: {
    fontWeight: '700',
  },
  section: {
    width: '100%',
    maxWidth: MAX_WIDTH,
    backgroundColor: BRAND.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  sectionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionNumberText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: BRAND.text,
    flex: 1,
  },
  body: {
    fontSize: 14,
    color: BRAND.text,
    lineHeight: 22,
    marginBottom: 10,
    opacity: 0.85,
  },
  bulletList: {
    marginTop: 4,
    marginBottom: 10,
    gap: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
    flexShrink: 0,
  },
  bulletText: {
    fontSize: 14,
    color: BRAND.text,
    lineHeight: 22,
    flex: 1,
    opacity: 0.85,
  },
  footerNote: {
    fontSize: 13,
    color: BRAND.muted,
    lineHeight: 20,
    fontStyle: 'italic',
    marginTop: 4,
  },
  link: {
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'underline',
    marginTop: 4,
  },
  footer: {
    width: '100%',
    maxWidth: MAX_WIDTH,
    alignItems: 'center',
    marginTop: 32,
    gap: 12,
  },
  footerDivider: {
    width: '100%',
    height: 1,
    backgroundColor: BRAND.border,
    marginBottom: 8,
  },
  footerBadges: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  badge: {
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  footerText: {
    fontSize: 13,
    color: BRAND.muted,
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

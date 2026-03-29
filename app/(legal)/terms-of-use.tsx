import React from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Linking,
  TouchableOpacity,
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

export default function TermsOfUse() {
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
        <Text style={styles.pageTitle}>Terms of Use</Text>
        <Text style={styles.lastUpdated}>Last updated: {LAST_UPDATED}</Text>
      </View>

      {/* Intro */}
      <View style={styles.card}>
        <View style={styles.highlightBar} />
        <Text style={styles.introText}>
          Please read these Terms of Use carefully before using Capital Cohort.
          By downloading or using the app, you agree to be bound by these terms.
          If you do not agree with any part, you must not use the app.
        </Text>
      </View>

      {/* Sections */}
      <Section
        number="1"
        color={BRAND.green}
        title="Acceptance of Terms"
        body={[
          'By accessing or using Capital Cohort ("the App"), you agree to be legally bound by these Terms of Use and our Privacy Policy. These terms apply to all users of the App.',
          'We reserve the right to update these terms at any time. We will notify users by updating the "Last updated" date. Continued use after changes constitutes acceptance.',
        ]}
      />

      <Section
        number="2"
        color={BRAND.blue}
        title="Description of Service"
        body={[
          'Capital Cohort is a free, offline-first personal finance application for mobile devices. It helps users manage monthly budgets following the 50/30/20 rule (or custom rules), track income and expenses, and review spending patterns.',
        ]}
        bullets={[
          '50% for Needs — essential living expenses',
          '30% for Wants — discretionary spending',
          '20% for Savings — future goals and security',
        ]}
        footer="The App is provided free of charge with no in-app purchases, subscriptions, or advertising."
      />

      <Section
        number="3"
        color={BRAND.purple}
        title="Use License"
        body={[
          'We grant you a limited, non-exclusive, non-transferable, revocable license to install and use the App on devices you own or control, strictly in accordance with these Terms.',
          'You may not:',
        ]}
        bullets={[
          'Copy, modify, or distribute the App or any portion of it',
          'Reverse-engineer, decompile, or disassemble the App',
          'Use the App for any unlawful purpose or in violation of any regulation',
          'Remove or alter any proprietary notices or labels on the App',
          'Transfer the App or your license rights to another party',
        ]}
      />

      <Section
        number="4"
        color={BRAND.green}
        title="Your Data & Content"
        body={[
          'All financial data you enter into the App (income, expenses, notes, categories) is stored exclusively on your device. You retain full ownership of your data at all times.',
          'We do not access, view, or process your financial data in any form. Since there is no server or cloud sync, we have no technical ability to do so.',
          'It is your responsibility to maintain backups of your data. We recommend using the built-in Export feature (Settings → Export Data) regularly.',
        ]}
      />

      <Section
        number="5"
        color={BRAND.blue}
        title="Disclaimer of Warranties"
        body={[
          'Capital Cohort is provided on an "AS IS" and "AS AVAILABLE" basis, without warranties of any kind, either express or implied.',
          'We do not warrant that:',
        ]}
        bullets={[
          'The App will be uninterrupted, error-free, or secure',
          'Any defects in the App will be corrected',
          'The App is free of viruses or other harmful components',
          'The results obtained from using the App will be accurate or reliable',
        ]}
        footer="Capital Cohort is a personal budgeting tool only. Nothing in the App constitutes financial, investment, tax, or legal advice. Always consult a qualified professional for financial decisions."
      />

      <Section
        number="6"
        color={BRAND.purple}
        title="Limitation of Liability"
        body={[
          'To the fullest extent permitted by applicable law, Capital Cohort and its developers shall not be liable for any indirect, incidental, special, consequential, or punitive damages — including loss of data, loss of profits, or financial losses — arising out of or in connection with your use of the App.',
          'Our total liability to you for any claims arising from use of the App shall not exceed the amount you paid for the App (zero, since the App is free).',
        ]}
      />

      <Section
        number="7"
        color={BRAND.green}
        title="Financial Information Disclaimer"
        body={[
          'The 50/30/20 rule and other budget presets offered in the App are general guidelines for personal finance education. They do not account for individual circumstances, tax obligations, debt repayment priorities, or investment suitability.',
          'Capital Cohort does not provide financial planning services and is not a licensed financial advisor. Budget percentages and calculations shown in the App are illustrative only.',
        ]}
      />

      <Section
        number="8"
        color={BRAND.blue}
        title="Intellectual Property"
        body={[
          'The App, including its design, code, text, graphics, and the "Capital Cohort" name and branding, is the intellectual property of its developers and is protected under applicable copyright and trademark laws.',
          'The App is licensed under the MIT License. You may view the source code at the project repository.',
        ]}
      />

      <Section
        number="9"
        color={BRAND.purple}
        title="Termination"
        body={[
          'You may stop using the App at any time by uninstalling it from your device. Uninstalling the App will delete all locally stored data.',
          'We reserve the right to discontinue or modify the App at any time without notice. We are not liable to you or any third party for any modification, suspension, or discontinuation of the App.',
        ]}
      />

      <Section
        number="10"
        color={BRAND.green}
        title="Governing Law"
        body={[
          'These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law provisions.',
          'Any disputes arising from these Terms or your use of the App shall be resolved through good-faith negotiation wherever possible.',
        ]}
      />

      <Section
        number="11"
        color={BRAND.blue}
        title="Changes to Terms"
        body={[
          'We may revise these Terms of Use at any time by updating this page. The revised terms take effect immediately upon posting.',
          'We will update the "Last updated" date at the top of this page whenever changes are made. We encourage you to check this page periodically.',
        ]}
      />

      <Section
        number="12"
        color={BRAND.purple}
        title="Contact Us"
        body={[
          'If you have questions, concerns, or feedback about these Terms of Use, please contact us:',
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
          <Badge label="Free Forever" color={BRAND.green} />
          <Badge label="No Subscriptions" color={BRAND.blue} />
          <Badge label="Open Source" color={BRAND.purple} />
        </View>
        <Text style={styles.footerText}>
          © {new Date().getFullYear()} Capital Cohort. All rights reserved.
        </Text>
        <TouchableOpacity onPress={() => Linking.openURL('/privacy-policy')}>
          <Text style={[styles.footerLink, { color: BRAND.green }]}>
            Privacy Policy
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
    borderBottomColor: BRAND.blue,
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
    backgroundColor: BRAND.blue,
    alignSelf: 'stretch',
    flexShrink: 0,
  },
  introText: {
    fontSize: 15,
    color: BRAND.text,
    lineHeight: 24,
    flex: 1,
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

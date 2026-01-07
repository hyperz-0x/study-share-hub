import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Shield, Lock, Eye, Database, UserCheck, Bell, Trash2, Mail } from "lucide-react";

const Privacy = () => {
  const sections = [
    {
      icon: Database,
      title: "Information We Collect",
      content: [
        "Personal information (name, email address) when you create an account",
        "Profile information that you choose to provide",
        "Usage data including materials downloaded, bookmarks, and browsing activity",
        "Device information and IP addresses for security purposes",
        "Communication data when you contact our support team",
      ],
    },
    {
      icon: Eye,
      title: "How We Use Your Information",
      content: [
        "To provide and maintain our educational platform services",
        "To authenticate users and prevent unauthorized access",
        "To personalize your experience and recommend relevant materials",
        "To communicate with you about updates, notifications, and support",
        "To analyze usage patterns and improve our platform",
        "To ensure compliance with our terms of service",
      ],
    },
    {
      icon: Lock,
      title: "Data Security",
      content: [
        "We use industry-standard encryption (SSL/TLS) for all data transmission",
        "Passwords are hashed using secure algorithms and never stored in plain text",
        "Access to personal data is restricted to authorized personnel only",
        "Regular security audits and vulnerability assessments are conducted",
        "We implement Row-Level Security (RLS) to protect database access",
      ],
    },
    {
      icon: UserCheck,
      title: "Your Rights",
      content: [
        "Access: Request a copy of your personal data at any time",
        "Rectification: Update or correct your personal information",
        "Deletion: Request deletion of your account and associated data",
        "Data Portability: Export your data in a machine-readable format",
        "Objection: Opt out of certain data processing activities",
      ],
    },
    {
      icon: Bell,
      title: "Communications",
      content: [
        "We send email notifications for material approval/rejection status",
        "Important account-related communications (security alerts, policy updates)",
        "You can manage your notification preferences in your account settings",
        "We will never share your email with third parties for marketing purposes",
      ],
    },
    {
      icon: Trash2,
      title: "Data Retention",
      content: [
        "Account data is retained for as long as your account is active",
        "Deleted materials are removed from our systems within 30 days",
        "Support tickets are retained for 1 year for quality assurance",
        "Usage analytics are anonymized and aggregated after 90 days",
        "Upon account deletion, personal data is removed within 30 days",
      ],
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-background py-12">
        <div className="container max-w-4xl px-4 md:px-6">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-hero">
              <Shield className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">
              Privacy Policy
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Last updated: January 7, 2026
            </p>
          </div>

          {/* Introduction */}
          <div className="mb-12 rounded-xl border border-border bg-card p-8 shadow-card">
            <p className="text-lg leading-relaxed text-foreground">
              At <strong>LN-StudyHub</strong>, we take your privacy seriously. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your information when you use
              our educational platform. Please read this policy carefully to understand our
              practices regarding your personal data.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-8">
            {sections.map((section, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:shadow-card-hover"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <section.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="font-display text-xl font-semibold text-foreground">
                    {section.title}
                  </h2>
                </div>
                <ul className="space-y-2">
                  {section.content.map((item, itemIdx) => (
                    <li
                      key={itemIdx}
                      className="flex items-start gap-2 text-muted-foreground"
                    >
                      <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Third-Party Services */}
          <div className="mt-8 rounded-xl border border-border bg-card p-6 shadow-card">
            <h2 className="mb-4 font-display text-xl font-semibold text-foreground">
              Third-Party Services
            </h2>
            <p className="text-muted-foreground">
              We use the following third-party services to operate our platform:
            </p>
            <ul className="mt-4 space-y-2">
              <li className="flex items-start gap-2 text-muted-foreground">
                <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                <span>
                  <strong>Authentication Service:</strong> For secure user login and account
                  management
                </span>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                <span>
                  <strong>Cloud Storage:</strong> For secure file storage and delivery
                </span>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                <span>
                  <strong>Email Service:</strong> For sending transactional emails and
                  notifications
                </span>
              </li>
            </ul>
          </div>

          {/* Cookies */}
          <div className="mt-8 rounded-xl border border-border bg-card p-6 shadow-card">
            <h2 className="mb-4 font-display text-xl font-semibold text-foreground">
              Cookies & Local Storage
            </h2>
            <p className="text-muted-foreground">
              We use cookies and local storage for:
            </p>
            <ul className="mt-4 space-y-2">
              <li className="flex items-start gap-2 text-muted-foreground">
                <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                <span>Maintaining your login session securely</span>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                <span>Remembering your preferences (theme, language)</span>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                <span>Ensuring platform security and preventing fraud</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="mt-8 rounded-xl border border-primary/20 bg-primary/5 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold text-foreground">
                  Questions About This Policy?
                </h2>
                <p className="mt-1 text-muted-foreground">
                  If you have any questions or concerns about our Privacy Policy, please contact us
                  at{" "}
                  <a
                    href="/contact"
                    className="text-primary hover:underline"
                  >
                    our contact page
                  </a>{" "}
                  or email us at privacy@ln-studyhub.com
                </p>
              </div>
            </div>
          </div>

          {/* Updates Notice */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any
              changes by posting the new Privacy Policy on this page and updating the "Last
              updated" date.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;

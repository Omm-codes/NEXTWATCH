import React from 'react';
import { Link } from 'react-router-dom';
import './Privacy.css';

const Privacy = () => {
  return (
    <div className="privacy-page">
      <div className="privacy-container">
        {/* Hero Section */}
        <section className="privacy-hero">
          <div className="hero-content">
            <h1 className="privacy-title">Privacy Policy</h1>
            <p className="privacy-subtitle">
              Your privacy is important to us. This policy explains how we collect, use, and protect your information.
            </p>
            <div className="last-updated">
              Last Updated: {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </section>

        {/* Privacy Content */}
        <div className="privacy-content">
          <section className="privacy-section">
            <h2>1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us and information about your use of our services.
            </p>
            
            <h3>Information You Provide</h3>
            <ul>
              <li><strong>Account Information:</strong> Name, email address, and password when you create an account</li>
              <li><strong>Profile Information:</strong> Optional profile details like favorite genres and preferences</li>
              <li><strong>Watchlist Data:</strong> Movies and shows you add to your personal watchlist</li>
              <li><strong>Communication:</strong> Messages you send us through contact forms or support channels</li>
            </ul>

            <h3>Information We Collect Automatically</h3>
            <ul>
              <li><strong>Usage Data:</strong> How you interact with our service, pages visited, features used</li>
              <li><strong>Device Information:</strong> Browser type, operating system, device type</li>
              <li><strong>Log Data:</strong> IP address, access times, referring URLs</li>
              <li><strong>Cookies:</strong> Small data files stored on your device (see Cookies section below)</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, maintain, and improve our services</li>
              <li>Create and manage your account</li>
              <li>Personalize your experience and provide recommendations</li>
              <li>Process your requests and respond to your inquiries</li>
              <li>Send you technical notices and support messages</li>
              <li>Analyze usage patterns to improve our service</li>
              <li>Prevent fraud and enhance security</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>3. Information Sharing and Disclosure</h2>
            <p>
              We do not sell, trade, or rent your personal information to third parties. We may share your 
              information only in the following circumstances:
            </p>
            
            <h3>Service Providers</h3>
            <p>
              We may share information with third-party service providers who perform services on our behalf, 
              such as hosting, analytics, and customer support. These providers are bound by confidentiality 
              agreements and are prohibited from using your information for any other purpose.
            </p>

            <h3>Legal Requirements</h3>
            <p>
              We may disclose your information if required by law or in response to valid legal process, 
              such as a court order or government request.
            </p>

            <h3>Business Transfers</h3>
            <p>
              In the event of a merger, acquisition, or sale of assets, your information may be transferred 
              as part of that transaction. We will notify you of any such change in ownership.
            </p>

            <h3>Consent</h3>
            <p>
              We may share your information with your consent or at your direction.
            </p>
          </section>

          <section className="privacy-section">
            <h2>4. Third-Party Services</h2>
            <p>
              Our service integrates with third-party services:
            </p>
            
            <h3>The Movie Database (TMDB)</h3>
            <p>
              We use TMDB's API to provide movie and TV show information. When you use our service, 
              some data may be shared with TMDB in accordance with their privacy policy.
            </p>

            <h3>Google Authentication</h3>
            <p>
              If you choose to sign in with Google, we receive basic profile information from Google 
              in accordance with their privacy policy and your Google account settings.
            </p>

            <h3>Firebase</h3>
            <p>
              We use Google Firebase for authentication and data storage. Your data is processed 
              according to Google's privacy policy and security standards.
            </p>
          </section>

          <section className="privacy-section">
            <h2>5. Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar tracking technologies to collect and store information about your 
              interactions with our service.
            </p>
            
            <h3>Types of Cookies We Use</h3>
            <ul>
              <li><strong>Essential Cookies:</strong> Required for the service to function properly</li>
              <li><strong>Performance Cookies:</strong> Help us analyze how our service is used</li>
              <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
              <li><strong>Authentication Cookies:</strong> Keep you logged in to your account</li>
            </ul>

            <h3>Managing Cookies</h3>
            <p>
              You can control cookies through your browser settings. However, disabling certain cookies 
              may affect the functionality of our service.
            </p>
          </section>

          <section className="privacy-section">
            <h2>6. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal 
              information against unauthorized access, alteration, disclosure, or destruction.
            </p>
            <ul>
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls and authentication mechanisms</li>
              <li>Secure hosting and database management</li>
            </ul>
            <p>
              However, no method of transmission over the internet or electronic storage is 100% secure, 
              and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="privacy-section">
            <h2>7. Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to provide our services and 
              comply with legal obligations. Specifically:
            </p>
            <ul>
              <li>Account data is retained while your account is active</li>
              <li>Watchlist and preference data is stored until you delete it or close your account</li>
              <li>Usage logs are typically retained for analytical purposes for a limited period</li>
              <li>Communication records are retained as needed for customer support</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>8. Your Rights and Choices</h2>
            <p>
              You have several rights regarding your personal information:
            </p>
            
            <h3>Access and Portability</h3>
            <p>You can access and export your personal data through your account settings.</p>

            <h3>Correction</h3>
            <p>You can update your account information and preferences at any time.</p>

            <h3>Deletion</h3>
            <p>You can delete your account and associated data through your profile settings.</p>

            <h3>Opt-out</h3>
            <p>You can opt out of promotional communications by following the unsubscribe instructions.</p>

            <p>
              To exercise these rights or if you have questions, please contact us using the information 
              provided in the Contact section below.
            </p>
          </section>

          <section className="privacy-section">
            <h2>9. Children's Privacy</h2>
            <p>
              Our service is not intended for children under 13 years of age. We do not knowingly collect 
              personal information from children under 13. If you are a parent or guardian and believe 
              your child has provided us with personal information, please contact us.
            </p>
          </section>

          <section className="privacy-section">
            <h2>10. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your country 
              of residence. These countries may have different data protection laws. We ensure appropriate 
              safeguards are in place to protect your information.
            </p>
          </section>

          <section className="privacy-section">
            <h2>11. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any material 
              changes by posting the new Privacy Policy on our website and updating the "Last Updated" date.
            </p>
            <p>
              We encourage you to review this Privacy Policy periodically to stay informed about how 
              we protect your information.
            </p>
          </section>

          <section className="privacy-section">
            <h2>12. Contact Us</h2>
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy or our 
              data practices, please contact us:
            </p>
            <div className="contact-info">
              <p>Email: <a href="mailto:omsanjay975@gmail.com">omsanjay975@gmail.com</a></p>
              <p>Through our <Link to="/contact">Contact Page</Link></p>
            </div>
            <p>
              We will respond to your inquiry within a reasonable timeframe.
            </p>
          </section>
        </div>

        {/* Bottom CTA */}
        <section className="privacy-cta">
          <div className="cta-content">
            <h2>Questions About Your Privacy?</h2>
            <p>
              We're committed to protecting your privacy. If you have any questions or concerns, 
              don't hesitate to reach out.
            </p>
            <Link to="/contact" className="cta-button">
              <svg className="button-icon" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
              Contact Us
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Privacy;

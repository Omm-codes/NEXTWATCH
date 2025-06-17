import React from 'react';
import { Link } from 'react-router-dom';
import './Terms.css';

const Terms = () => {
  return (
    <div className="terms-page">
      <div className="terms-container">
        {/* Hero Section */}
        <section className="terms-hero">
          <div className="hero-content">
            <h1 className="terms-title">Terms of Service</h1>
            <p className="terms-subtitle">
              Please read these terms carefully before using NextWatch
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

        {/* Terms Content */}
        <div className="terms-content">
          <section className="terms-section">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using NextWatch ("the Service"), you accept and agree to be bound by the terms 
              and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section className="terms-section">
            <h2>2. Description of Service</h2>
            <p>
              NextWatch is a movie and TV show discovery platform that provides information about movies, 
              TV shows, and web series. Our service includes:
            </p>
            <ul>
              <li>Movie and TV show information and recommendations</li>
              <li>Personal watchlist functionality</li>
              <li>User account creation and management</li>
              <li>Personalized content discovery through our quiz feature</li>
              <li>Search and filtering capabilities</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>3. User Accounts</h2>
            <p>
              To access certain features of the Service, you may be required to create an account. You agree to:
            </p>
            <ul>
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain and promptly update your account information</li>
              <li>Maintain the security of your password and account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
              <li>Accept responsibility for all activities that occur under your account</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>4. User Conduct</h2>
            <p>You agree not to use the Service to:</p>
            <ul>
              <li>Upload, post, or transmit any content that is unlawful, harmful, or objectionable</li>
              <li>Impersonate any person or entity or misrepresent your affiliation</li>
              <li>Interfere with or disrupt the Service or servers connected to the Service</li>
              <li>Attempt to gain unauthorized access to any portion of the Service</li>
              <li>Use automated systems to access the Service without permission</li>
              <li>Violate any applicable local, state, national, or international law</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>5. Content and Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality are and will remain the 
              exclusive property of NextWatch and its licensors. The Service is protected by copyright, 
              trademark, and other laws. Movie and TV show information is provided through The Movie Database (TMDB) API.
            </p>
            <p>
              You retain rights to any content you submit, post, or display on or through the Service. 
              By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, 
              reproduce, and distribute such content in connection with the Service.
            </p>
          </section>

          <section className="terms-section">
            <h2>6. Privacy</h2>
            <p>
              Your privacy is important to us. Please review our Privacy Policy, which also governs your 
              use of the Service, to understand our practices. By using our Service, you agree to the 
              collection and use of information in accordance with our Privacy Policy.
            </p>
            <Link to="/privacy" className="privacy-link">
              Read our Privacy Policy
            </Link>
          </section>

          <section className="terms-section">
            <h2>7. Third-Party Services</h2>
            <p>
              Our Service may contain links to third-party websites or services that are not owned or 
              controlled by NextWatch. We have no control over, and assume no responsibility for, the 
              content, privacy policies, or practices of any third-party websites or services.
            </p>
            <p>
              We use The Movie Database (TMDB) API to provide movie and TV show information. 
              Your use of this information is subject to TMDB's terms of service.
            </p>
          </section>

          <section className="terms-section">
            <h2>8. Disclaimers</h2>
            <p>
              The information on this Service is provided on an "as is" basis. To the fullest extent 
              permitted by law, NextWatch excludes all warranties, representations, or terms relating 
              to the Service.
            </p>
            <p>
              NextWatch does not warrant that:
            </p>
            <ul>
              <li>The Service will be constantly available or uninterrupted</li>
              <li>The information on the Service is complete, true, or accurate</li>
              <li>The Service will meet your requirements or expectations</li>
              <li>Any defects in the Service will be corrected</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>9. Limitation of Liability</h2>
            <p>
              In no event shall NextWatch, its directors, employees, partners, agents, suppliers, or 
              affiliates be liable for any indirect, incidental, punitive, consequential, or special 
              damages arising out of or relating to your use of the Service.
            </p>
          </section>

          <section className="terms-section">
            <h2>10. Termination</h2>
            <p>
              We may terminate or suspend your account and bar access to the Service immediately, 
              without prior notice or liability, under our sole discretion, for any reason whatsoever 
              and without limitation, including but not limited to a breach of the Terms.
            </p>
            <p>
              If you wish to terminate your account, you may simply discontinue using the Service 
              or delete your account through your profile settings.
            </p>
          </section>

          <section className="terms-section">
            <h2>11. Changes to Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. 
              If a revision is material, we will provide at least 30 days notice prior to any new terms 
              taking effect.
            </p>
            <p>
              What constitutes a material change will be determined at our sole discretion. By continuing 
              to access or use our Service after any revisions become effective, you agree to be bound 
              by the revised terms.
            </p>
          </section>

          <section className="terms-section">
            <h2>12. Governing Law</h2>
            <p>
              These Terms shall be interpreted and governed by the laws of the jurisdiction in which 
              NextWatch operates, without regard to its conflict of law provisions.
            </p>
          </section>

          <section className="terms-section">
            <h2>13. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="contact-info">
              <p>Email: <a href="mailto:omsanjay975@gmail.com">omsanjay975@gmail.com</a></p>
              <p>Through our <Link to="/contact">Contact Page</Link></p>
            </div>
          </section>
        </div>

        {/* Bottom CTA */}
        <section className="terms-cta">
          <div className="cta-content">
            <h2>Questions About Our Terms?</h2>
            <p>
              If you have any questions or concerns about these terms, we're here to help.
            </p>
            <Link to="/contact" className="cta-button">
              <svg className="button-icon" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
              Contact Us
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Terms;

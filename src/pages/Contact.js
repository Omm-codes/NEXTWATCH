import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    type: 'general'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const contactTypes = [
    { value: 'general', label: 'General Inquiry', icon: '💬' },
    { value: 'bug', label: 'Bug Report', icon: '🐛' },
    { value: 'feature', label: 'Feature Request', icon: '💡' },
    { value: 'feedback', label: 'Feedback', icon: '⭐' },
    { value: 'support', label: 'Technical Support', icon: '🛠️' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, you would send this to your backend
      console.log('Form submitted:', formData);
      
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        type: 'general'
      });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-container">
        {/* Hero Section */}
        <section className="contact-hero">
          <div className="hero-content">
            <h1 className="contact-title">Get in Touch</h1>
            <p className="contact-subtitle">
              We'd love to hear from you! Whether you have questions, feedback, or need support, 
              we're here to help make your NextWatch experience even better.
            </p>
          </div>
        </section>

        <div className="contact-content">
          {/* Contact Info Cards */}
          <section className="contact-info">
            <div className="info-cards">
              <div className="info-card">
                <div className="info-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10h5v-2h-5c-4.34 0-8-3.66-8-8s3.66-8 8-8 8 3.66 8 8v1.43c0 .79-.71 1.57-1.5 1.57s-1.5-.78-1.5-1.57V12c0-2.76-2.24-5-5-5s-5 2.24-5 5 2.24 5 5 5c1.38 0 2.64-.56 3.54-1.47.65.89 1.77 1.47 2.96 1.47 1.97 0 3.5-1.53 3.5-3.57V12c0-5.52-4.48-10-10-10zm0 13c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
                  </svg>
                </div>
                <h3>Email Support</h3>
                <p>Get help with technical issues or account questions</p>
                <a href="mailto:omsanjay975@gmail.com" className="contact-link">
                  omsanjay975@gmail.com
                </a>
              </div>

              <div className="info-card">
                <div className="info-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <h3>Feedback</h3>
                <p>Share your thoughts and help us improve NextWatch</p>
                <span className="contact-link">We love hearing from you!</span>
              </div>

              <div className="info-card">
                <div className="info-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                  </svg>
                </div>
                <h3>Documentation</h3>
                <p>Find answers to common questions and learn more</p>
                <Link to="/about" className="contact-link">
                  Visit our About page
                </Link>
              </div>
            </div>
          </section>

          {/* Contact Form */}
          <section className="contact-form-section">
            <div className="form-container">
              <div className="form-header">
                <h2>Send us a Message</h2>
                <p>Fill out the form below and we'll get back to you as soon as possible.</p>
              </div>

              {submitStatus === 'success' && (
                <div className="success-message">
                  <svg className="success-icon" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <div>
                    <h3>Message Sent Successfully!</h3>
                    <p>Thank you for contacting us. We'll get back to you within 24 hours.</p>
                  </div>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="error-message">
                  <svg className="error-icon" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                  <div>
                    <h3>Something went wrong</h3>
                    <p>Please try again or contact us directly at support@nextwatch.com</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="contact-form">
                {/* Contact Type Selection */}
                <div className="form-group">
                  <label htmlFor="type">What can we help you with?</label>
                  <div className="type-selector">
                    {contactTypes.map(type => (
                      <button
                        key={type.value}
                        type="button"
                        className={`type-option ${formData.type === type.value ? 'active' : ''}`}
                        onClick={() => handleInputChange({ target: { name: 'type', value: type.value } })}
                      >
                        <span className="type-emoji">{type.icon}</span>
                        <span className="type-label">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Personal Information */}
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">
                      Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={errors.name ? 'error' : ''}
                      placeholder="Your full name"
                    />
                    {errors.name && <span className="error-text">{errors.name}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">
                      Email <span className="required">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={errors.email ? 'error' : ''}
                      placeholder="your.email@example.com"
                    />
                    {errors.email && <span className="error-text">{errors.email}</span>}
                  </div>
                </div>

                {/* Subject */}
                <div className="form-group">
                  <label htmlFor="subject">
                    Subject <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className={errors.subject ? 'error' : ''}
                    placeholder="Brief description of your inquiry"
                  />
                  {errors.subject && <span className="error-text">{errors.subject}</span>}
                </div>

                {/* Message */}
                <div className="form-group">
                  <label htmlFor="message">
                    Message <span className="required">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    className={errors.message ? 'error' : ''}
                    placeholder="Please provide as much detail as possible..."
                    rows="6"
                  />
                  {errors.message && <span className="error-text">{errors.message}</span>}
                  <div className="char-count">
                    {formData.message.length} characters
                  </div>
                </div>

                {/* Submit Button */}
                <button 
                  type="submit" 
                  className={`submit-button ${isSubmitting ? 'submitting' : ''}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="submit-spinner"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <svg className="submit-icon" viewBox="0 0 24 24">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                      </svg>
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="faq-section">
            <h2>Frequently Asked Questions</h2>
            <div className="faq-grid">
              <div className="faq-item">
                <h3>How do I add movies to my watchlist?</h3>
                <p>Click the bookmark icon on any movie card to add it to your personal watchlist. You can access your watchlist from the navigation menu.</p>
              </div>
              
              <div className="faq-item">
                <h3>How does the recommendation quiz work?</h3>
                <p>Our quiz asks about your mood, available time, and preferences to suggest personalized content. It takes less than a minute to complete!</p>
              </div>
              
              <div className="faq-item">
                <h3>Can I filter movies by genre?</h3>
                <p>Yes! Use the genre dropdown on any movies page to filter by your preferred genres like Action, Comedy, Drama, and more.</p>
              </div>
              
              <div className="faq-item">
                <h3>Is NextWatch free to use?</h3>
                <p>Yes, NextWatch is completely free! We provide movie information and recommendations to help you discover your next favorite film.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Contact;

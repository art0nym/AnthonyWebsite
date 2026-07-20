'use client';

import { useState } from 'react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    request: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const validateField = (name: string, value: string): string => {
    switch(name) {
      case 'fullName':
        if (!value.trim()) return 'Name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        break;
      case 'email':
        if (!value.trim()) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Please enter a valid email address';
        break;
      case 'phoneNumber':
        if (value && !/^[\d\s\-\+\(\)]+$/.test(value)) return 'Please enter a valid phone number';
        break;
      case 'request':
        if (!value.trim()) return 'Message is required';
        if (value.trim().length < 10) return 'Message must be at least 10 characters';
        break;
    }
    return '';
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    if (error) {
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors: {[key: string]: string} = {};
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== 'phoneNumber') { // phoneNumber is optional
        const error = validateField(key, value);
        if (error) newErrors[key] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          fullName: '',
          email: '',
          phoneNumber: '',
          request: ''
        });
        setTimeout(() => setSubmitStatus('idle'), 5000);
      } else {
        throw new Error('Failed to send');
      }
    } catch (error) {
      setSubmitStatus('error');
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldClass = (fieldName: string) => {
    if (errors[fieldName]) return 'error';
    if (formData[fieldName as keyof typeof formData] && !errors[fieldName]) return 'success';
    return '';
  };

  return (
    <div className="contact-form-wrapper">
      <form onSubmit={handleSubmit} className="form-grid">
        {/* Personal Info Column */}
        <div className="personal-info-column">
          <div className={`form-group ${getFieldClass('fullName')}`}>
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your full name"
              required
            />
            {errors.fullName && <div className="error-message show">{errors.fullName}</div>}
          </div>

          <div className={`form-group ${getFieldClass('email')}`}>
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your email address"
              required
            />
            {errors.email && <div className="error-message show">{errors.email}</div>}
          </div>

          <div className={`form-group ${getFieldClass('phoneNumber')}`}>
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your phone number"
            />
            {errors.phoneNumber && <div className="error-message show">{errors.phoneNumber}</div>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`submit-btn ${isSubmitting ? 'loading' : ''}`}
          >
            <span className="btn-before" />
            <span className="btn-after" />
            <span className="btn-text">{isSubmitting ? '' : 'Send Message'}</span>
          </button>

          {submitStatus === 'success' && (
            <div className="success-message show">
              🎉 Thank you! Your message has been sent successfully.
            </div>
          )}
          {submitStatus === 'error' && (
            <div className="error-alert show">
              Sorry, there was an error. Please try emailing me directly at joaosdrawings@gmail.com
            </div>
          )}
        </div>

        {/* Message Column */}
        <div className="message-column">
          <div className={`form-group ${getFieldClass('request')}`}>
            <label htmlFor="request">Your Message</label>
            <textarea
              id="request"
              name="request"
              value={formData.request}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Tell me about your commission, collaboration, or inquiry..."
              required
            />
            {errors.request && <div className="error-message show">{errors.request}</div>}
          </div>
        </div>
      </form>

      <style jsx>{`
        .contact-form-wrapper {
          width: 100%;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
          align-items: start;
        }

        .personal-info-column,
        .message-column {
          display: flex;
          flex-direction: column;
        }

        .message-column {
          height: 100%;
        }

        .form-group {
          margin-bottom: 1.5rem;
          position: relative;
          transition: transform 0.3s ease;
        }

        .message-column .form-group {
          flex: 1;
          display: flex;
          flex-direction: column;
          margin-bottom: 0;
        }

        .form-group label {
          display: block;
          font-weight: 600;
          color: #514A51;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 1rem 1.25rem;
          border: 2px solid #E8DCC4;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.9);
          font-size: 1rem;
          font-family: inherit;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          color: #514A51;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #7576F9;
          background: rgba(255, 255, 255, 1);
          box-shadow: 
            0 0 0 4px rgba(117,s*118,s*249, 0.1),
            0 4px 12px rgba(117,s*118,s*249, 0.15);
          transform: translateY(-2px);
        }

        .form-group input::placeholder,
        .form-group textarea::placeholder {
          color: #94a3b8;
          font-weight: 300;
        }

        .form-group textarea {
          resize: vertical;
          min-height: 300px;
          flex: 1;
        }

        .form-group.error input,
        .form-group.error textarea {
          border-color: #ef4444;
          background: rgba(254, 242, 242, 0.9);
        }

        .form-group.success input,
        .form-group.success textarea {
          border-color: #10b981;
          background: rgba(240, 253, 244, 0.9);
        }

        .error-message {
          color: #ef4444;
          font-size: 0.875rem;
          margin-top: 0.5rem;
          opacity: 0;
          transform: translateY(-10px);
          transition: all 0.3s ease;
        }

        .error-message.show {
          opacity: 1;
          transform: translateY(0);
        }

        .submit-btn {
          min-width: 160px;
          width: 100%;
          backgroundColor: white;
          padding: 0 30px;
          height: 50px;
          font-family: Arial, sans-serif;
          text-transform: uppercase;
          font-size: 14px;
          color: #7576F9;
          letter-spacing: 2.8px;
          font-weight: 700;
          line-height: 1.6;
          box-shadow: 0 15px 40px -10px rgba(0, 0, 0, 0.3);
          position: relative;
          transition: all 0.4s ease;
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
          text-align: center;
          border: 0;
          overflow: hidden;
          margin-top: 1rem;
          border-radius: 0;
        }

        .submit-btn:hover:not(:disabled) {
          box-shadow: 0 8px 20px -12px rgba(0, 0, 0, 0.2);
          letter-spacing: 2px;
          color: white;
        }

        .submit-btn:hover:not(:disabled) .btn-before,
        .submit-btn:hover:not(:disabled) .btn-after {
          width: 51%;
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .btn-before,
        .btn-after {
          content: '';
          position: absolute;
          width: 4px;
          height: 100%;
          top: 0;
          transition: all 0.4s ease;
          background-color: #7576F9;
          z-index: 0;
        }

        .btn-before {
          left: 0;
        }

        .btn-after {
          right: 0;
        }

        .btn-text {
          z-index: 1;
          text-align: center;
        }

        .submit-btn.loading .btn-text {
          opacity: 0;
        }

        .submit-btn.loading:after {
          content: '';
          position: absolute;
          width: 20px;
          height: 20px;
          border: 2px solid transparent;
          border-top-color: #7576F9;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        @keyframes spin {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }

        .success-message,
        .error-alert {
          padding: 1rem 1.5rem;
          border-radius: 12px;
          margin-top: 1rem;
          text-align: center;
          transform: translateY(20px);
          opacity: 0;
          transition: all 0.5s ease;
          font-weight: 500;
        }

        .success-message {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }

        .error-alert {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
        }

        .success-message.show,
        .error-alert.show {
          transform: translateY(0);
          opacity: 1;
        }

        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .message-column .form-group textarea {
            min-height: 200px;
          }
        }
      `}</style>
    </div>
  );
}

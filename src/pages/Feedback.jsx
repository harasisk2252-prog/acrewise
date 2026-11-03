import React, { useState } from 'react';
import { MessageSquare, Star, Send, CheckCircle2, AlertCircle, Heart } from 'lucide-react';
import { post } from '../services/api';

export default function Feedback({ t, toast }) {
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState('recommendation');
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!comments.trim()) {
      toast('Please enter your feedback comments.');
      return;
    }

    try {
      await post('/api/feedback', { rating, category, comments });
      setSubmitted(true);
      toast('Thank you! Your feedback was saved for agronomy review.');
    } catch (error) { toast(error.message || 'Feedback could not be saved.'); }
  }

  return (
    <div className="page-container" style={{ maxWidth: 720 }}>
      {/* Title */}
      <div className="aw-title" style={{ marginBottom: 20 }}>
        <div>
          <span className="overline">CONTINUOUS IMPROVEMENT</span>
          <h1>Farmer Feedback & Model Verification</h1>
          <p>
            Help agricultural scientists and software engineers calibrate local crop recommendations and improve the AcreWise platform.
          </p>
        </div>
      </div>

      <div className="premium-card">
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '30px 10px' }}>
            <div style={{ 
              width: 56, 
              height: 56, 
              borderRadius: '50%', 
              background: '#eef8f2', 
              color: '#166534', 
              display: 'grid', 
              placeItems: 'center', 
              margin: '0 auto 16px' 
            }}>
              <CheckCircle2 size={32} />
            </div>
            <h2 style={{ fontSize: 22, color: '#1b4332', marginBottom: 8 }}>Thank You for Your Feedback!</h2>
            <p style={{ fontSize: 12, color: '#68786a', maxWidth: 450, margin: '0 auto 20px' }}>
              Your agronomic input has been logged. Our agronomy team reviews farmer reports weekly to update crop yield models and soil parameters.
            </p>
            <button className="btn-primary" onClick={() => { setSubmitted(false); setComments(''); }}>
              Submit Another Response
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Rating Stars */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#1b4332', display: 'block', marginBottom: 8 }}>
                Overall Platform Experience Rating:
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer' }}
                  >
                    <Star 
                      size={28} 
                      fill={star <= rating ? '#eab308' : 'none'} 
                      color={star <= rating ? '#eab308' : '#cbd5c5'} 
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div className="aw-field">
              <label>Feedback Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)}>
                <option value="recommendation">Report Inaccurate / Impractical Crop Recommendation</option>
                <option value="mandi">APMC Mandi Price Discrepancy</option>
                <option value="bug">Report Software Bug or Display Issue</option>
                <option value="feature">Suggest a New Feature or Crop Type</option>
                <option value="testimonial">General Feedback / Farmer Experience</option>
              </select>
            </div>

            {/* Comments */}
            <div className="aw-field">
              <label>Detailed Comments & Field Observation</label>
              <textarea 
                rows={5}
                value={comments}
                onChange={e => setComments(e.target.value)}
                placeholder="Tell us what worked, or explain why a recommended crop does not fit your village's local conditions (e.g. soil drainage, local wild boar problem, water salinity)..."
                style={{
                  width: '100%',
                  padding: 12,
                  fontSize: 12,
                  borderRadius: 8,
                  border: '1px solid #dfe5d6',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>
              <Send size={15} /> Submit Feedback
            </button>
          </form>
        )}
      </div>
    </div>
  );
}


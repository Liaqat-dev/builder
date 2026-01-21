/**
 * KeywordAnalyzer Component
 * ==========================
 * Analyzes resume content and suggests relevant keywords.
 */

import { useState, useMemo } from 'react';
import { ATS_KEYWORDS } from '../utils/constants';

export function KeywordAnalyzer({ elements, onSuggestion }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [jobDescription, setJobDescription] = useState('');

  // Get all content from elements
  const allContent = useMemo(() => {
    return elements.map(el => el.content || '').join(' ').toLowerCase();
  }, [elements]);

  // Find keywords present and missing
  const keywordAnalysis = useMemo(() => {
    const found = new Set();
    const missing = new Set();

    Object.entries(ATS_KEYWORDS).forEach(([category, keywords]) => {
      keywords.forEach(keyword => {
        if (allContent.includes(keyword.toLowerCase())) {
          found.add(keyword);
        } else {
          missing.add(keyword);
        }
      });
    });

    // If job description provided, extract and check those keywords
    const jobKeywords = [];
    if (jobDescription) {
      const words = jobDescription.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 4);
      
      const freq = {};
      words.forEach(w => freq[w] = (freq[w] || 0) + 1);
      
      Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15)
        .forEach(([word]) => {
          if (!allContent.includes(word)) {
            jobKeywords.push(word);
          }
        });
    }

    return {
      found: Array.from(found),
      missing: Array.from(missing).slice(0, 20),
      jobKeywords
    };
  }, [allContent, jobDescription]);

  const foundCount = keywordAnalysis.found.length;
  const totalChecked = foundCount + keywordAnalysis.missing.length;
  const percentage = totalChecked > 0 ? Math.round((foundCount / totalChecked) * 100) : 0;

  return (
    <div className={`keyword-analyzer ${isExpanded ? 'expanded' : ''}`}>
      {/* Collapsed Header */}
      <button 
        className="analyzer-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="toggle-icon">🔑</span>
        <span className="toggle-label">Keywords</span>
        <span className="toggle-score" style={{ 
          color: percentage >= 50 ? '#10b981' : '#f59e0b' 
        }}>
          {foundCount} found
        </span>
        <span className="toggle-arrow">{isExpanded ? '◀' : '▶'}</span>
      </button>

      {/* Expanded Panel */}
      {isExpanded && (
        <div className="analyzer-content">
          {/* Job Description Input */}
          <div className="job-description-section">
            <label className="section-label">
              📋 Paste Job Description
              <span className="label-hint">(for targeted suggestions)</span>
            </label>
            <textarea
              className="job-input"
              placeholder="Paste the job description here to get targeted keyword suggestions..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Job-Specific Missing Keywords */}
          {keywordAnalysis.jobKeywords.length > 0 && (
            <div className="keyword-section">
              <h4 className="section-title missing">
                🎯 Missing from Job Description
              </h4>
              <div className="keyword-tags">
                {keywordAnalysis.jobKeywords.map(keyword => (
                  <button
                    key={keyword}
                    className="keyword-tag missing"
                    onClick={() => onSuggestion?.(keyword)}
                    title="Click to add"
                  >
                    + {keyword}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Found Keywords */}
          <div className="keyword-section">
            <h4 className="section-title found">
              ✅ Keywords Found ({foundCount})
            </h4>
            <div className="keyword-tags">
              {keywordAnalysis.found.slice(0, 15).map(keyword => (
                <span key={keyword} className="keyword-tag found">
                  {keyword}
                </span>
              ))}
              {keywordAnalysis.found.length > 15 && (
                <span className="keyword-more">
                  +{keywordAnalysis.found.length - 15} more
                </span>
              )}
            </div>
          </div>

          {/* Suggested Keywords */}
          <div className="keyword-section">
            <h4 className="section-title suggested">
              💡 Consider Adding
            </h4>
            <div className="keyword-tags">
              {keywordAnalysis.missing.slice(0, 12).map(keyword => (
                <button
                  key={keyword}
                  className="keyword-tag suggested"
                  onClick={() => onSuggestion?.(keyword)}
                  title="Click to add"
                >
                  + {keyword}
                </button>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="keyword-tips">
            <p>💡 <strong>Tip:</strong> Use action verbs like "led", "developed", "achieved" to describe accomplishments.</p>
          </div>
        </div>
      )}

      <style>{`
        .keyword-analyzer {
          position: fixed;
          left: 20px;
          bottom: 60px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          z-index: 50;
          width: 60px;
          transition: width 0.3s ease;
          overflow: hidden;
        }

        .keyword-analyzer.expanded {
          width: 320px;
        }

        .analyzer-toggle {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 12px 16px;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
        }

        .toggle-icon {
          font-size: 20px;
        }

        .toggle-label {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          display: none;
        }

        .toggle-score {
          font-size: 12px;
          font-weight: 600;
          margin-left: auto;
          display: none;
        }

        .toggle-arrow {
          font-size: 10px;
          color: #9ca3af;
          display: none;
        }

        .expanded .toggle-label,
        .expanded .toggle-score,
        .expanded .toggle-arrow {
          display: block;
        }

        .analyzer-content {
          padding: 0 16px 16px;
          max-height: 400px;
          overflow-y: auto;
        }

        .job-description-section {
          margin-bottom: 16px;
        }

        .section-label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 6px;
        }

        .label-hint {
          font-weight: 400;
          color: #9ca3af;
          margin-left: 4px;
        }

        .job-input {
          width: 100%;
          padding: 10px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 12px;
          resize: none;
          font-family: inherit;
        }

        .job-input:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .keyword-section {
          margin-bottom: 12px;
        }

        .section-title {
          font-size: 11px;
          font-weight: 600;
          margin: 0 0 8px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .section-title.found { color: #10b981; }
        .section-title.missing { color: #ef4444; }
        .section-title.suggested { color: #f59e0b; }

        .keyword-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .keyword-tag {
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
          border: none;
          cursor: default;
        }

        .keyword-tag.found {
          background: #dcfce7;
          color: #166534;
        }

        .keyword-tag.missing {
          background: #fee2e2;
          color: #991b1b;
          cursor: pointer;
        }

        .keyword-tag.missing:hover {
          background: #fecaca;
        }

        .keyword-tag.suggested {
          background: #fef3c7;
          color: #92400e;
          cursor: pointer;
        }

        .keyword-tag.suggested:hover {
          background: #fde68a;
        }

        .keyword-more {
          font-size: 11px;
          color: #9ca3af;
          padding: 4px;
        }

        .keyword-tips {
          margin-top: 12px;
          padding: 10px;
          background: #f0fdf4;
          border-radius: 8px;
          font-size: 11px;
          color: #166534;
          line-height: 1.4;
        }

        .keyword-tips p {
          margin: 0;
        }
      `}</style>
    </div>
  );
}

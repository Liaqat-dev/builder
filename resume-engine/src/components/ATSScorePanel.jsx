/**
 * ATSScorePanel Component
 * ========================
 * Displays detailed ATS analysis and suggestions.
 */

export function ATSScorePanel({
  score,
  suggestions,
  detailedAnalysis,
  onAnalyze,
  onApplySuggestion
}) {
  const getScoreColor = (s) => {
    if (s >= 80) return '#10b981';
    if (s >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreGrade = (s) => {
    if (s >= 90) return 'A+';
    if (s >= 80) return 'A';
    if (s >= 70) return 'B';
    if (s >= 60) return 'C';
    if (s >= 50) return 'D';
    return 'F';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const breakdown = detailedAnalysis?.breakdown || {};

  return (
    <div className="ats-panel">
      {/* Overall Score */}
      <div className="score-section">
        <div className="score-circle" style={{ '--score-color': getScoreColor(score) }}>
          <svg viewBox="0 0 100 100" className="score-svg">
            <circle
              className="score-bg-circle"
              cx="50"
              cy="50"
              r="45"
            />
            <circle
              className="score-progress-circle"
              cx="50"
              cy="50"
              r="45"
              strokeDasharray={`${score * 2.83} 283`}
            />
          </svg>
          <div className="score-content">
            <span className="score-number">{score}</span>
            <span className="score-grade">{getScoreGrade(score)}</span>
          </div>
        </div>
        <h2 className="score-title">ATS Compatibility Score</h2>
        <p className="score-subtitle">
          {score >= 80 && '🎉 Excellent! Your resume is well-optimized for ATS systems.'}
          {score >= 60 && score < 80 && '👍 Good progress! A few improvements will boost your score.'}
          {score >= 40 && score < 60 && '⚠️ Needs attention. Review the suggestions below.'}
          {score < 40 && '🚨 Critical issues detected. Address high-priority items first.'}
        </p>
      </div>

      {/* Score Breakdown */}
      <div className="breakdown-section">
        <h3 className="section-title">📊 Score Breakdown</h3>
        
        <div className="breakdown-items">
          {[
            { key: 'sections', label: 'Required Sections', icon: '📑', weight: '25%' },
            { key: 'contact', label: 'Contact Information', icon: '📧', weight: '15%' },
            { key: 'fonts', label: 'Font Compatibility', icon: '🔤', weight: '10%' },
            { key: 'keywords', label: 'Keyword Optimization', icon: '🔑', weight: '30%' },
            { key: 'formatting', label: 'Format & Structure', icon: '📐', weight: '20%' }
          ].map(({ key, label, icon, weight }) => {
            const itemScore = breakdown[key]?.score || 0;
            return (
              <div key={key} className="breakdown-item">
                <div className="breakdown-header">
                  <span className="breakdown-icon">{icon}</span>
                  <span className="breakdown-label">{label}</span>
                  <span className="breakdown-weight">({weight})</span>
                </div>
                <div className="breakdown-bar-container">
                  <div 
                    className="breakdown-bar"
                    style={{ 
                      width: `${itemScore}%`,
                      backgroundColor: getScoreColor(itemScore)
                    }}
                  />
                </div>
                <span 
                  className="breakdown-score"
                  style={{ color: getScoreColor(itemScore) }}
                >
                  {Math.round(itemScore)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Suggestions */}
      {suggestions && suggestions.length > 0 && (
        <div className="suggestions-section">
          <h3 className="section-title">💡 Improvement Suggestions</h3>
          
          <div className="suggestions-list">
            {suggestions
              .sort((a, b) => {
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
              })
              .map((suggestion, index) => (
                <div 
                  key={index} 
                  className="suggestion-item"
                  style={{ '--priority-color': getPriorityColor(suggestion.priority) }}
                >
                  <div className="suggestion-priority">
                    {suggestion.priority === 'high' && '🔴'}
                    {suggestion.priority === 'medium' && '🟡'}
                    {suggestion.priority === 'low' && '🟢'}
                  </div>
                  <div className="suggestion-content">
                    <p className="suggestion-message">{suggestion.message}</p>
                    <span className="suggestion-type">{suggestion.type}</span>
                  </div>
                  {suggestion.action && (
                    <button 
                      className="suggestion-action"
                      onClick={() => onApplySuggestion?.(suggestion)}
                    >
                      Fix
                    </button>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="tips-section">
        <h3 className="section-title">📚 ATS Best Practices</h3>
        <ul className="tips-list">
          <li>Use standard section headers (Experience, Education, Skills)</li>
          <li>Stick to ATS-friendly fonts (Arial, Calibri, Times New Roman)</li>
          <li>Include relevant keywords from the job description</li>
          <li>Avoid tables, graphics, and complex layouts</li>
          <li>Use bullet points for easy parsing</li>
          <li>Include contact info in text (not headers/footers)</li>
        </ul>
      </div>

      {/* Re-analyze Button */}
      <button className="analyze-btn" onClick={onAnalyze}>
        🔄 Re-analyze Resume
      </button>

      <style>{`
        .ats-panel {
          width: 320px;
          background: white;
          border-right: 1px solid #e5e7eb;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .score-section {
          text-align: center;
        }

        .score-circle {
          position: relative;
          width: 140px;
          height: 140px;
          margin: 0 auto 16px;
        }

        .score-svg {
          transform: rotate(-90deg);
          width: 100%;
          height: 100%;
        }

        .score-bg-circle {
          fill: none;
          stroke: #e5e7eb;
          stroke-width: 8;
        }

        .score-progress-circle {
          fill: none;
          stroke: var(--score-color);
          stroke-width: 8;
          stroke-linecap: round;
          transition: stroke-dasharray 0.8s ease;
        }

        .score-content {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
        }

        .score-number {
          display: block;
          font-size: 36px;
          font-weight: 800;
          color: var(--score-color);
          line-height: 1;
        }

        .score-grade {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #6b7280;
          margin-top: 4px;
        }

        .score-title {
          font-size: 18px;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 8px;
        }

        .score-subtitle {
          font-size: 13px;
          color: #6b7280;
          margin: 0;
          line-height: 1.5;
        }

        .section-title {
          font-size: 14px;
          font-weight: 700;
          color: #374151;
          margin: 0 0 12px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .breakdown-items {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .breakdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .breakdown-header {
          display: flex;
          align-items: center;
          gap: 6px;
          min-width: 140px;
        }

        .breakdown-icon {
          font-size: 14px;
        }

        .breakdown-label {
          font-size: 12px;
          color: #374151;
          font-weight: 500;
        }

        .breakdown-weight {
          font-size: 10px;
          color: #9ca3af;
        }

        .breakdown-bar-container {
          flex: 1;
          height: 6px;
          background: #e5e7eb;
          border-radius: 3px;
          overflow: hidden;
        }

        .breakdown-bar {
          height: 100%;
          border-radius: 3px;
          transition: width 0.5s ease;
        }

        .breakdown-score {
          font-size: 12px;
          font-weight: 700;
          min-width: 36px;
          text-align: right;
        }

        .suggestions-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .suggestion-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px;
          background: #f9fafb;
          border-radius: 8px;
          border-left: 3px solid var(--priority-color);
        }

        .suggestion-priority {
          font-size: 12px;
        }

        .suggestion-content {
          flex: 1;
        }

        .suggestion-message {
          font-size: 12px;
          color: #374151;
          margin: 0 0 4px;
          line-height: 1.4;
        }

        .suggestion-type {
          font-size: 10px;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .suggestion-action {
          padding: 4px 10px;
          background: var(--priority-color);
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.15s ease;
        }

        .suggestion-action:hover {
          opacity: 0.9;
        }

        .tips-list {
          margin: 0;
          padding-left: 20px;
          font-size: 12px;
          color: #6b7280;
          line-height: 1.8;
        }

        .tips-list li::marker {
          color: #10b981;
        }

        .analyze-btn {
          padding: 12px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .analyze-btn:hover {
          background: #2563eb;
        }
      `}</style>
    </div>
  );
}

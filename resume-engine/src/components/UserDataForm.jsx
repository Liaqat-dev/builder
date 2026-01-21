/**
 * UserDataForm Component
 * =======================
 * Form for collecting user's resume data before AI generation.
 * This data is sent to the backend along with the template.
 */

import { useState } from 'react';

const initialFormData = {
  personalInfo: {
    name: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    website: ''
  },
  summary: '',
  experience: [
    {
      id: '1',
      company: '',
      title: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    }
  ],
  education: [
    {
      id: '1',
      school: '',
      degree: '',
      field: '',
      graduationDate: '',
      gpa: ''
    }
  ],
  skills: [],
  certifications: [],
  languages: []
};

export function UserDataForm({ onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState(initialFormData);
  const [jobDescription, setJobDescription] = useState('');
  const [activeTab, setActiveTab] = useState('personal');
  const [skillInput, setSkillInput] = useState('');

  // Update personal info
  const updatePersonalInfo = (field, value) => {
    setFormData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    }));
  };

  // Update experience
  const updateExperience = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          id: `exp-${Date.now()}`,
          company: '',
          title: '',
          startDate: '',
          endDate: '',
          current: false,
          description: ''
        }
      ]
    }));
  };

  const removeExperience = (id) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
  };

  // Update education
  const updateEducation = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map(edu =>
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        {
          id: `edu-${Date.now()}`,
          school: '',
          degree: '',
          field: '',
          graduationDate: '',
          gpa: ''
        }
      ]
    }));
  };

  const removeEducation = (id) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  // Skills management
  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      userData: formData,
      jobDescription: jobDescription.trim() || undefined
    });
  };

  const tabs = [
    { id: 'personal', label: '👤 Personal', icon: '👤' },
    { id: 'experience', label: '💼 Experience', icon: '💼' },
    { id: 'education', label: '🎓 Education', icon: '🎓' },
    { id: 'skills', label: '🛠️ Skills', icon: '🛠️' },
    { id: 'job', label: '🎯 Target Job', icon: '🎯' }
  ];

  return (
    <div className="user-form-container">
      <div className="form-header">
        <h2>📝 Enter Your Information</h2>
        <p>Fill in your details and our AI will create an ATS-optimized resume</p>
      </div>

      {/* Tabs */}
      <div className="form-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`form-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label.split(' ')[1]}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="user-form">
        {/* Personal Info Tab */}
        {activeTab === 'personal' && (
          <div className="form-section">
            <h3>Personal Information</h3>
            
            <div className="form-grid">
              <div className="form-field full">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={formData.personalInfo.name}
                  onChange={(e) => updatePersonalInfo('name', e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="form-field">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.personalInfo.email}
                  onChange={(e) => updatePersonalInfo('email', e.target.value)}
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div className="form-field">
                <label>Phone</label>
                <input
                  type="tel"
                  value={formData.personalInfo.phone}
                  onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="form-field">
                <label>Location</label>
                <input
                  type="text"
                  value={formData.personalInfo.location}
                  onChange={(e) => updatePersonalInfo('location', e.target.value)}
                  placeholder="San Francisco, CA"
                />
              </div>

              <div className="form-field">
                <label>LinkedIn</label>
                <input
                  type="text"
                  value={formData.personalInfo.linkedin}
                  onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                  placeholder="linkedin.com/in/johndoe"
                />
              </div>

              <div className="form-field full">
                <label>Professional Summary (optional - AI can generate)</label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                  placeholder="Brief professional summary highlighting your key strengths..."
                  rows={3}
                />
              </div>
            </div>
          </div>
        )}

        {/* Experience Tab */}
        {activeTab === 'experience' && (
          <div className="form-section">
            <div className="section-header">
              <h3>Work Experience</h3>
              <button type="button" className="add-btn" onClick={addExperience}>
                ➕ Add Experience
              </button>
            </div>

            {formData.experience.map((exp, index) => (
              <div key={exp.id} className="entry-card">
                <div className="entry-header">
                  <span className="entry-number">Experience #{index + 1}</span>
                  {formData.experience.length > 1 && (
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeExperience(exp.id)}
                    >
                      🗑️
                    </button>
                  )}
                </div>

                <div className="form-grid">
                  <div className="form-field">
                    <label>Company</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                      placeholder="Company Name"
                    />
                  </div>

                  <div className="form-field">
                    <label>Job Title</label>
                    <input
                      type="text"
                      value={exp.title}
                      onChange={(e) => updateExperience(exp.id, 'title', e.target.value)}
                      placeholder="Senior Developer"
                    />
                  </div>

                  <div className="form-field">
                    <label>Start Date</label>
                    <input
                      type="text"
                      value={exp.startDate}
                      onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                      placeholder="Jan 2020"
                    />
                  </div>

                  <div className="form-field">
                    <label>End Date</label>
                    <input
                      type="text"
                      value={exp.current ? 'Present' : exp.endDate}
                      onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                      placeholder="Present"
                      disabled={exp.current}
                    />
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={exp.current}
                        onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                      />
                      Currently working here
                    </label>
                  </div>

                  <div className="form-field full">
                    <label>Description / Achievements</label>
                    <textarea
                      value={exp.description}
                      onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                      placeholder="• Led a team of 5 engineers&#10;• Increased performance by 40%&#10;• Delivered 3 major features"
                      rows={4}
                    />
                    <span className="field-hint">Use bullet points (•) or new lines for each achievement</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Education Tab */}
        {activeTab === 'education' && (
          <div className="form-section">
            <div className="section-header">
              <h3>Education</h3>
              <button type="button" className="add-btn" onClick={addEducation}>
                ➕ Add Education
              </button>
            </div>

            {formData.education.map((edu, index) => (
              <div key={edu.id} className="entry-card">
                <div className="entry-header">
                  <span className="entry-number">Education #{index + 1}</span>
                  {formData.education.length > 1 && (
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeEducation(edu.id)}
                    >
                      🗑️
                    </button>
                  )}
                </div>

                <div className="form-grid">
                  <div className="form-field full">
                    <label>School / University</label>
                    <input
                      type="text"
                      value={edu.school}
                      onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                      placeholder="University of California, Berkeley"
                    />
                  </div>

                  <div className="form-field">
                    <label>Degree</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                      placeholder="Bachelor of Science"
                    />
                  </div>

                  <div className="form-field">
                    <label>Field of Study</label>
                    <input
                      type="text"
                      value={edu.field}
                      onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                      placeholder="Computer Science"
                    />
                  </div>

                  <div className="form-field">
                    <label>Graduation Date</label>
                    <input
                      type="text"
                      value={edu.graduationDate}
                      onChange={(e) => updateEducation(edu.id, 'graduationDate', e.target.value)}
                      placeholder="2020"
                    />
                  </div>

                  <div className="form-field">
                    <label>GPA (optional)</label>
                    <input
                      type="text"
                      value={edu.gpa}
                      onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                      placeholder="3.8"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Skills Tab */}
        {activeTab === 'skills' && (
          <div className="form-section">
            <h3>Skills</h3>
            
            <div className="skills-input-row">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                placeholder="Type a skill and press Enter"
              />
              <button type="button" className="add-btn" onClick={addSkill}>
                ➕ Add
              </button>
            </div>

            <div className="skills-list">
              {formData.skills.map((skill, index) => (
                <span key={index} className="skill-tag">
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)}>×</button>
                </span>
              ))}
              {formData.skills.length === 0 && (
                <span className="empty-hint">No skills added yet</span>
              )}
            </div>

            <div className="skill-suggestions">
              <p>💡 Suggested skills (click to add):</p>
              <div className="suggestion-tags">
                {['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'AWS', 'Git', 'Agile', 'Leadership', 'Communication']
                  .filter(s => !formData.skills.includes(s))
                  .slice(0, 6)
                  .map(skill => (
                    <button
                      key={skill}
                      type="button"
                      className="suggestion-tag"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        skills: [...prev.skills, skill]
                      }))}
                    >
                      + {skill}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Target Job Tab */}
        {activeTab === 'job' && (
          <div className="form-section">
            <h3>🎯 Target Job (Optional)</h3>
            <p className="section-desc">
              Paste the job description to optimize your resume for this specific role.
              AI will tailor keywords and highlight relevant experience.
            </p>
            
            <div className="form-field full">
              <label>Job Description</label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here...

The AI will:
• Match your experience to job requirements
• Include relevant keywords for ATS
• Highlight applicable skills
• Optimize your summary"
                rows={12}
              />
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? '⏳ Generating...' : '🚀 Generate Resume'}
          </button>
        </div>
      </form>

      <style>{`
        .user-form-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 24px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }

        .form-header {
          text-align: center;
          margin-bottom: 24px;
        }

        .form-header h2 {
          margin: 0 0 8px;
          font-size: 24px;
          color: #1f2937;
        }

        .form-header p {
          margin: 0;
          color: #6b7280;
        }

        .form-tabs {
          display: flex;
          gap: 4px;
          padding: 4px;
          background: #f3f4f6;
          border-radius: 12px;
          margin-bottom: 24px;
        }

        .form-tab {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 12px;
          background: none;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
          color: #6b7280;
          transition: all 0.15s ease;
        }

        .form-tab:hover {
          color: #374151;
        }

        .form-tab.active {
          background: white;
          color: #1f2937;
          font-weight: 600;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .tab-icon {
          font-size: 16px;
        }

        .user-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .form-section h3 {
          margin: 0 0 16px;
          font-size: 18px;
          color: #1f2937;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .section-header h3 {
          margin: 0;
        }

        .section-desc {
          color: #6b7280;
          font-size: 14px;
          margin-bottom: 16px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-field.full {
          grid-column: span 2;
        }

        .form-field label {
          font-size: 13px;
          font-weight: 600;
          color: #374151;
        }

        .form-field input,
        .form-field textarea,
        .form-field select {
          padding: 10px 12px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.15s ease;
        }

        .form-field input:focus,
        .form-field textarea:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .form-field textarea {
          resize: vertical;
          font-family: inherit;
        }

        .field-hint {
          font-size: 11px;
          color: #9ca3af;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: normal;
          cursor: pointer;
          margin-top: 4px;
        }

        .checkbox-label input {
          width: 16px;
          height: 16px;
        }

        .entry-card {
          padding: 16px;
          background: #f9fafb;
          border-radius: 12px;
          margin-bottom: 16px;
        }

        .entry-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .entry-number {
          font-size: 13px;
          font-weight: 600;
          color: #6b7280;
        }

        .add-btn {
          padding: 8px 16px;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        .add-btn:hover {
          background: #059669;
        }

        .remove-btn {
          padding: 6px 10px;
          background: #fee2e2;
          color: #ef4444;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }

        .remove-btn:hover {
          background: #fecaca;
        }

        .skills-input-row {
          display: flex;
          gap: 10px;
          margin-bottom: 16px;
        }

        .skills-input-row input {
          flex: 1;
          padding: 10px 12px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
        }

        .skills-input-row input:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .skills-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          min-height: 40px;
          padding: 12px;
          background: #f9fafb;
          border-radius: 8px;
          margin-bottom: 16px;
        }

        .skill-tag {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: #3b82f6;
          color: white;
          border-radius: 20px;
          font-size: 13px;
        }

        .skill-tag button {
          background: none;
          border: none;
          color: white;
          font-size: 16px;
          cursor: pointer;
          padding: 0;
          line-height: 1;
        }

        .empty-hint {
          color: #9ca3af;
          font-size: 13px;
        }

        .skill-suggestions {
          padding: 12px;
          background: #eff6ff;
          border-radius: 8px;
        }

        .skill-suggestions p {
          margin: 0 0 8px;
          font-size: 12px;
          color: #1d4ed8;
        }

        .suggestion-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .suggestion-tag {
          padding: 4px 10px;
          background: white;
          border: 1px solid #bfdbfe;
          border-radius: 12px;
          font-size: 12px;
          color: #1d4ed8;
          cursor: pointer;
        }

        .suggestion-tag:hover {
          background: #dbeafe;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding-top: 16px;
          border-top: 1px solid #e5e7eb;
        }

        .btn {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
        }

        .btn-secondary:hover {
          background: #e5e7eb;
        }

        .btn-primary {
          background: #3b82f6;
          color: white;
        }

        .btn-primary:hover {
          background: #2563eb;
        }

        .btn-primary:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        @media (max-width: 640px) {
          .form-grid {
            grid-template-columns: 1fr;
          }

          .form-field.full {
            grid-column: span 1;
          }

          .form-tabs {
            flex-wrap: wrap;
          }

          .form-tab {
            flex: 1 1 calc(33% - 4px);
          }

          .tab-label {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

export default UserDataForm;

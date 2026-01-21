/**
 * Resume API Service
 * ===================
 * Frontend service for communicating with the backend server.
 * Handles template saving, AI resume generation, and PDF printing.
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

/**
 * API Error class
 */
class APIError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

/**
 * Base fetch wrapper with error handling
 */
async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const response = await fetch(url, { ...defaultOptions, ...options });
  
  // Handle PDF responses
  if (response.headers.get('content-type')?.includes('application/pdf')) {
    return response.blob();
  }
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new APIError(data.error || 'API request failed', response.status, data);
  }
  
  return data;
}

// ============================================
// TEMPLATE API
// ============================================

/**
 * Save a template to the backend
 * @param {Object} template - { elements, sections, canvasSettings }
 * @param {string} name - Template name
 * @returns {Promise<{ success: boolean, templateId: string }>}
 */
export async function saveTemplate(template, name) {
  return apiFetch('/api/templates/save', {
    method: 'POST',
    body: JSON.stringify({ template, name }),
  });
}

/**
 * Get all saved templates
 * @returns {Promise<{ templates: Array }>}
 */
export async function getTemplates() {
  return apiFetch('/api/templates');
}

/**
 * Get a specific template by ID
 * @param {string} templateId
 * @returns {Promise<Object>}
 */
export async function getTemplate(templateId) {
  return apiFetch(`/api/templates/${templateId}`);
}

// ============================================
// RESUME GENERATION API
// ============================================

/**
 * Generate a filled resume using AI
 * @param {Object} params
 * @param {string} params.templateId - ID of the template to use
 * @param {Object} params.userData - User's resume data
 * @param {string} [params.jobDescription] - Optional job description for ATS optimization
 * @returns {Promise<{ success: boolean, resumeId: string, filledResume: Object, atsScore: number }>}
 * 
 * @example
 * const result = await generateResume({
 *   templateId: 'template-123',
 *   userData: {
 *     personalInfo: {
 *       name: 'John Doe',
 *       email: 'john@example.com',
 *       phone: '(555) 123-4567',
 *       location: 'San Francisco, CA',
 *       linkedin: 'linkedin.com/in/johndoe'
 *     },
 *     experience: [
 *       {
 *         company: 'Tech Corp',
 *         title: 'Senior Developer',
 *         startDate: 'Jan 2020',
 *         endDate: 'Present',
 *         description: 'Led team of 5 engineers\nDelivered 3 major features'
 *       }
 *     ],
 *     education: [
 *       {
 *         school: 'University of California',
 *         degree: 'Bachelor of Science',
 *         field: 'Computer Science',
 *         graduationDate: '2018'
 *       }
 *     ],
 *     skills: ['JavaScript', 'React', 'Node.js', 'Python'],
 *     summary: '' // Optional - AI will generate if empty
 *   },
 *   jobDescription: 'Looking for a senior developer with React experience...'
 * });
 */
export async function generateResume({ templateId, userData, jobDescription }) {
  return apiFetch('/api/resume/generate', {
    method: 'POST',
    body: JSON.stringify({ templateId, userData, jobDescription }),
  });
}

/**
 * Get a filled resume by ID (for preview)
 * @param {string} resumeId
 * @returns {Promise<Object>}
 */
export async function getResume(resumeId) {
  return apiFetch(`/api/resume/${resumeId}`);
}

// ============================================
// PDF PRINTING API
// ============================================

/**
 * Generate PDF from a filled resume
 * @param {Object} params
 * @param {string} [params.resumeId] - ID of filled resume (if saved)
 * @param {Array} [params.elements] - Elements array (if not using resumeId)
 * @param {Array} [params.sections] - Sections array (if not using resumeId)
 * @param {string} [params.fileName] - Output filename
 * @returns {Promise<Blob>} - PDF file blob
 * 
 * @example
 * // Using resumeId
 * const pdfBlob = await printResume({ resumeId: 'resume-123', fileName: 'my-resume' });
 * 
 * // Using direct data
 * const pdfBlob = await printResume({ elements, sections, fileName: 'my-resume' });
 * 
 * // Download the PDF
 * downloadPDF(pdfBlob, 'my-resume.pdf');
 */
export async function printResume({ resumeId, elements, sections, fileName }) {
  return apiFetch('/api/resume/print', {
    method: 'POST',
    body: JSON.stringify({ resumeId, elements, sections, fileName }),
  });
}

/**
 * Helper: Download a blob as a file
 * @param {Blob} blob
 * @param {string} filename
 */
export function downloadPDF(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================

/**
 * Complete workflow: Save template, generate resume, and get PDF
 * @param {Object} params
 * @param {Object} params.template - Template structure
 * @param {string} params.templateName - Name for the template
 * @param {Object} params.userData - User's resume data
 * @param {string} [params.jobDescription] - Job description for optimization
 * @param {string} [params.fileName] - Output filename
 * @returns {Promise<{ resumeId: string, filledResume: Object, atsScore: number, pdfBlob: Blob }>}
 */
export async function createAndPrintResume({
  template,
  templateName,
  userData,
  jobDescription,
  fileName
}) {
  // Step 1: Save the template
  const { templateId } = await saveTemplate(template, templateName);
  
  // Step 2: Generate filled resume with AI
  const { resumeId, filledResume, atsScore } = await generateResume({
    templateId,
    userData,
    jobDescription
  });
  
  // Step 3: Generate PDF
  const pdfBlob = await printResume({
    resumeId,
    fileName: fileName || templateName
  });
  
  return {
    templateId,
    resumeId,
    filledResume,
    atsScore,
    pdfBlob
  };
}

/**
 * Quick PDF generation without saving
 * Sends data directly to print endpoint
 */
export async function quickPrint({ elements, sections, fileName }) {
  const pdfBlob = await printResume({ elements, sections, fileName });
  downloadPDF(pdfBlob, `${fileName || 'resume'}.pdf`);
  return pdfBlob;
}

export default {
  // Templates
  saveTemplate,
  getTemplates,
  getTemplate,
  
  // Resume Generation
  generateResume,
  getResume,
  
  // Printing
  printResume,
  downloadPDF,
  
  // Convenience
  createAndPrintResume,
  quickPrint
};

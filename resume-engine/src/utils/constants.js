/**
 * Constants
 * ==========
 * Centralized configuration for the resume builder.
 */

// ============================================
// ATS (Applicant Tracking System) Configuration
// ============================================

/**
 * Fonts that are universally supported by ATS systems
 */
export const ATS_FRIENDLY_FONTS = [
  'Arial',
  'Calibri',
  'Cambria',
  'Georgia',
  'Garamond',
  'Helvetica',
  'Times New Roman',
  'Trebuchet MS',
  'Verdana',
  'Tahoma'
];

/**
 * Standard ATS section headers with aliases
 */
export const ATS_SECTION_HEADERS = {
  experience: {
    title: 'Experience',
    aliases: ['Work Experience', 'Professional Experience', 'Employment History', 'Work History'],
    contentType: 'list-sections',
    keywords: ['managed', 'led', 'developed', 'implemented', 'achieved', 'increased', 'reduced']
  },
  education: {
    title: 'Education',
    aliases: ['Academic Background', 'Educational Background', 'Academic History'],
    contentType: 'list-sections',
    keywords: ['degree', 'bachelor', 'master', 'phd', 'certification', 'coursework']
  },
  skills: {
    title: 'Skills',
    aliases: ['Technical Skills', 'Core Competencies', 'Areas of Expertise', 'Proficiencies'],
    contentType: 'list-items',
    keywords: []
  },
  summary: {
    title: 'Professional Summary',
    aliases: ['Summary', 'Profile', 'Objective', 'Career Summary', 'Executive Summary'],
    contentType: 'text',
    keywords: ['experienced', 'skilled', 'professional', 'expertise']
  },
  certifications: {
    title: 'Certifications',
    aliases: ['Licenses & Certifications', 'Professional Certifications', 'Credentials'],
    contentType: 'list-items',
    keywords: ['certified', 'licensed', 'accredited']
  },
  projects: {
    title: 'Projects',
    aliases: ['Key Projects', 'Notable Projects', 'Project Experience'],
    contentType: 'list-sections',
    keywords: ['built', 'created', 'designed', 'developed', 'launched']
  },
  awards: {
    title: 'Awards & Honors',
    aliases: ['Achievements', 'Recognition', 'Honors'],
    contentType: 'list-items',
    keywords: ['awarded', 'recognized', 'honored', 'selected']
  },
  languages: {
    title: 'Languages',
    aliases: ['Language Skills', 'Language Proficiency'],
    contentType: 'list-items',
    keywords: ['fluent', 'native', 'proficient', 'conversational']
  },
  volunteer: {
    title: 'Volunteer Experience',
    aliases: ['Community Involvement', 'Volunteer Work'],
    contentType: 'list-sections',
    keywords: ['volunteered', 'contributed', 'supported']
  }
};

/**
 * Common ATS keywords by category
 */
export const ATS_KEYWORDS = {
  leadership: [
    'led', 'managed', 'directed', 'supervised', 'coordinated',
    'mentored', 'trained', 'delegated', 'oversaw', 'headed'
  ],
  achievement: [
    'achieved', 'accomplished', 'delivered', 'exceeded', 'improved',
    'increased', 'reduced', 'optimized', 'streamlined', 'saved'
  ],
  technical: [
    'developed', 'implemented', 'designed', 'built', 'engineered',
    'programmed', 'automated', 'integrated', 'deployed', 'maintained'
  ],
  communication: [
    'presented', 'negotiated', 'collaborated', 'communicated', 'liaised',
    'facilitated', 'articulated', 'persuaded', 'influenced', 'advocated'
  ],
  analytical: [
    'analyzed', 'evaluated', 'assessed', 'researched', 'investigated',
    'identified', 'diagnosed', 'solved', 'resolved', 'troubleshot'
  ],
  organizational: [
    'organized', 'planned', 'scheduled', 'prioritized', 'managed',
    'administered', 'executed', 'launched', 'initiated', 'established'
  ]
};

/**
 * ATS scoring rules
 */
export const ATS_RULES = {
  minWordCount: 300,
  maxWordCount: 800,
  requiredSections: ['experience', 'education', 'skills'],
  recommendedSections: ['summary', 'certifications'],
  forbiddenElements: ['images', 'tables', 'graphics', 'charts'],
  maxFontTypes: 2,
  minFontSize: 10,
  maxFontSize: 14 // For body text
};

// ============================================
// Element Types
// ============================================

export const ELEMENT_TYPES = {
  HEADER: 'header',
  CONTACT: 'contact',
  TEXT: 'text',
  LIST_ITEM: 'list-item',
  DATE: 'date',
  TITLE: 'title',
  SUBTITLE: 'subtitle',
  BULLET: 'bullet'
};

export const SECTION_TYPES = {
  EXPERIENCE: 'experience',
  EDUCATION: 'education',
  SKILLS: 'skills',
  SUMMARY: 'summary',
  CERTIFICATIONS: 'certifications',
  PROJECTS: 'projects',
  AWARDS: 'awards',
  LANGUAGES: 'languages',
  VOLUNTEER: 'volunteer',
  CUSTOM: 'custom'
};

// ============================================
// Default Styling
// ============================================

export const DEFAULT_ELEMENT_STYLE = {
  fontSize: 11,
  fontWeight: 'normal',
  fontFamily: 'Arial',
  color: '#333333',
  textAlign: 'left',
  lineHeight: 1.4
};

export const DEFAULT_SECTION_STYLE = {
  backgroundColor: '#ffffff',
  borderColor: '#e5e7eb',
  borderWidth: 0,
  borderRadius: 0,
  padding: 12
};

export const HEADING_STYLES = {
  h1: { fontSize: 24, fontWeight: 'bold', color: '#111111' },
  h2: { fontSize: 16, fontWeight: 'bold', color: '#222222' },
  h3: { fontSize: 14, fontWeight: '600', color: '#333333' }
};

// ============================================
// Canvas Configuration
// ============================================

export const CANVAS_CONFIG = {
  // A4 in pixels at 96 DPI
  width: 794,
  height: 1123,
  // Standard resume margins
  margins: {
    top: 40,
    right: 50,
    bottom: 40,
    left: 50
  },
  // Grid settings
  gridSize: 10,
  snapThreshold: 5
};

// ============================================
// Color Palette (ATS-Safe)
// ============================================

export const COLOR_PALETTE = {
  text: {
    primary: '#111111',
    secondary: '#333333',
    muted: '#666666',
    light: '#999999'
  },
  accent: {
    blue: '#2563eb',
    navy: '#1e3a5f',
    teal: '#0d9488',
    green: '#059669',
    gray: '#4b5563'
  },
  background: {
    white: '#ffffff',
    light: '#f9fafb',
    subtle: '#f3f4f6'
  },
  border: {
    light: '#e5e7eb',
    medium: '#d1d5db',
    dark: '#9ca3af'
  }
};

// ============================================
// Template Presets
// ============================================

export const TEMPLATE_PRESETS = {
  classic: {
    name: 'Classic Professional',
    description: 'Traditional single-column layout, highly ATS-compatible',
    style: {
      fontFamily: 'Times New Roman',
      headingColor: '#111111',
      accentColor: '#1e3a5f'
    }
  },
  modern: {
    name: 'Modern Clean',
    description: 'Clean design with subtle accents',
    style: {
      fontFamily: 'Calibri',
      headingColor: '#111111',
      accentColor: '#2563eb'
    }
  },
  minimal: {
    name: 'Minimal',
    description: 'Maximum readability, no frills',
    style: {
      fontFamily: 'Arial',
      headingColor: '#333333',
      accentColor: '#333333'
    }
  },
  executive: {
    name: 'Executive',
    description: 'Sophisticated styling for senior roles',
    style: {
      fontFamily: 'Georgia',
      headingColor: '#1e3a5f',
      accentColor: '#1e3a5f'
    }
  }
};

// ============================================
// Keyboard Shortcuts
// ============================================

export const KEYBOARD_SHORTCUTS = {
  delete: { key: 'Delete', description: 'Delete selected' },
  duplicate: { key: 'Cmd+D', description: 'Duplicate selected' },
  selectAll: { key: 'Cmd+A', description: 'Select all' },
  escape: { key: 'Escape', description: 'Clear selection' },
  save: { key: 'Cmd+S', description: 'Save template' },
  commandPalette: { key: 'Cmd+K', description: 'Open command palette' },
  undo: { key: 'Cmd+Z', description: 'Undo' },
  redo: { key: 'Cmd+Shift+Z', description: 'Redo' }
};

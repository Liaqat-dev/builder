/**
 * useATSScore Hook
 * =================
 * Analyzes resume content for ATS (Applicant Tracking System) compatibility.
 * Provides scoring, suggestions, and keyword analysis.
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { 
  ATS_KEYWORDS, 
  ATS_SECTION_HEADERS, 
  ATS_FRIENDLY_FONTS,
  ATS_RULES 
} from '../utils/constants';

export function useATSScore({ elements, sections }) {
  const [atsScore, setAtsScore] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [detailedAnalysis, setDetailedAnalysis] = useState(null);

  /**
   * Extract all text content from resume
   */
  const getAllContent = useCallback(() => {
    const elementContent = elements.map(el => el.content || '').join(' ');
    const sectionTitles = sections.map(sec => sec.title || '').join(' ');
    return `${elementContent} ${sectionTitles}`.toLowerCase();
  }, [elements, sections]);

  /**
   * Check for required sections
   */
  const checkRequiredSections = useCallback(() => {
    const requiredHeaders = ['experience', 'education', 'skills'];
    const sectionTitles = sections.map(s => s.title?.toLowerCase() || '');
    
    const missing = [];
    const present = [];

    requiredHeaders.forEach(header => {
      const found = sectionTitles.some(title => 
        title.includes(header) || 
        ATS_SECTION_HEADERS[header]?.aliases?.some(alias => 
          title.includes(alias.toLowerCase())
        )
      );

      if (found) {
        present.push(header);
      } else {
        missing.push(header);
      }
    });

    return { missing, present, score: (present.length / requiredHeaders.length) * 100 };
  }, [sections]);

  /**
   * Check for contact information
   */
  const checkContactInfo = useCallback(() => {
    const content = getAllContent();
    const checks = {
      email: /[\w.-]+@[\w.-]+\.\w+/.test(content),
      phone: /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(content),
      linkedin: /linkedin/i.test(content),
      location: false // Would need more sophisticated detection
    };

    const found = Object.values(checks).filter(Boolean).length;
    const total = Object.keys(checks).length;

    return {
      checks,
      score: (found / total) * 100,
      missing: Object.entries(checks)
        .filter(([_, v]) => !v)
        .map(([k]) => k)
    };
  }, [getAllContent]);

  /**
   * Check font compatibility
   */
  const checkFontCompatibility = useCallback(() => {
    const usedFonts = new Set(elements.map(el => el.fontFamily || 'Arial'));
    const incompatible = [];
    const compatible = [];

    usedFonts.forEach(font => {
      if (ATS_FRIENDLY_FONTS.includes(font)) {
        compatible.push(font);
      } else {
        incompatible.push(font);
      }
    });

    return {
      compatible,
      incompatible,
      score: usedFonts.size === 0 ? 100 : (compatible.length / usedFonts.size) * 100
    };
  }, [elements]);

  /**
   * Check keyword density
   */
  const checkKeywords = useCallback((jobDescription = '') => {
    const content = getAllContent();
    const foundKeywords = new Set();
    const missingKeywords = [];

    // Check against common ATS keywords
    Object.values(ATS_KEYWORDS).flat().forEach(keyword => {
      if (content.includes(keyword.toLowerCase())) {
        foundKeywords.add(keyword);
      }
    });

    // If job description provided, check against it
    if (jobDescription) {
      const jobKeywords = extractKeywords(jobDescription);
      jobKeywords.forEach(keyword => {
        if (!content.includes(keyword.toLowerCase())) {
          missingKeywords.push(keyword);
        }
      });
    }

    return {
      found: Array.from(foundKeywords),
      missing: missingKeywords,
      score: Math.min(100, foundKeywords.size * 5) // 5 points per keyword, max 100
    };
  }, [getAllContent]);

  /**
   * Check formatting issues
   */
  const checkFormatting = useCallback(() => {
    const issues = [];
    let score = 100;

    // Check for tables (not ATS friendly)
    const hasComplexLayout = sections.some(s => 
      s.direction === 'horizontal' && s.contentType === 'list-sections'
    );
    if (hasComplexLayout) {
      issues.push({
        type: 'warning',
        message: 'Complex multi-column layouts may not parse correctly in some ATS systems'
      });
      score -= 10;
    }

    // Check for images (elements don't support images in this builder, but good to check)
    const hasImages = elements.some(el => el.type === 'image');
    if (hasImages) {
      issues.push({
        type: 'error',
        message: 'Images are not readable by ATS systems'
      });
      score -= 20;
    }

    // Check for special characters
    const content = getAllContent();
    const specialChars = content.match(/[^\w\s.,!?@#$%&*()-]/g) || [];
    if (specialChars.length > 10) {
      issues.push({
        type: 'warning',
        message: 'Excessive special characters may cause parsing issues'
      });
      score -= 5;
    }

    // Check content length
    const wordCount = content.split(/\s+/).filter(Boolean).length;
    if (wordCount < 100) {
      issues.push({
        type: 'info',
        message: 'Resume content seems thin. Consider adding more detail.'
      });
      score -= 10;
    }

    return { issues, score: Math.max(0, score) };
  }, [elements, sections, getAllContent]);

  /**
   * Full ATS analysis
   */
  const analyzeResume = useCallback((jobDescription = '') => {
    const sectionCheck = checkRequiredSections();
    const contactCheck = checkContactInfo();
    const fontCheck = checkFontCompatibility();
    const keywordCheck = checkKeywords(jobDescription);
    const formatCheck = checkFormatting();

    // Calculate weighted score
    const weights = {
      sections: 0.25,
      contact: 0.15,
      fonts: 0.1,
      keywords: 0.3,
      formatting: 0.2
    };

    const totalScore = Math.round(
      sectionCheck.score * weights.sections +
      contactCheck.score * weights.contact +
      fontCheck.score * weights.fonts +
      keywordCheck.score * weights.keywords +
      formatCheck.score * weights.formatting
    );

    // Generate suggestions
    const newSuggestions = [];

    if (sectionCheck.missing.length > 0) {
      newSuggestions.push({
        type: 'section',
        priority: 'high',
        message: `Add missing sections: ${sectionCheck.missing.join(', ')}`,
        action: 'addSection',
        data: sectionCheck.missing
      });
    }

    if (contactCheck.missing.length > 0) {
      newSuggestions.push({
        type: 'contact',
        priority: 'high',
        message: `Add missing contact info: ${contactCheck.missing.join(', ')}`,
        action: 'addContact'
      });
    }

    if (fontCheck.incompatible.length > 0) {
      newSuggestions.push({
        type: 'font',
        priority: 'medium',
        message: `Replace non-ATS fonts: ${fontCheck.incompatible.join(', ')}`,
        action: 'changeFonts',
        data: fontCheck.incompatible
      });
    }

    if (keywordCheck.missing.length > 0) {
      newSuggestions.push({
        type: 'keyword',
        priority: 'medium',
        message: `Consider adding keywords: ${keywordCheck.missing.slice(0, 5).join(', ')}`,
        action: 'addKeywords',
        data: keywordCheck.missing
      });
    }

    formatCheck.issues.forEach(issue => {
      newSuggestions.push({
        type: 'format',
        priority: issue.type === 'error' ? 'high' : 'low',
        message: issue.message
      });
    });

    const analysis = {
      totalScore,
      breakdown: {
        sections: sectionCheck,
        contact: contactCheck,
        fonts: fontCheck,
        keywords: keywordCheck,
        formatting: formatCheck
      },
      suggestions: newSuggestions
    };

    setAtsScore(totalScore);
    setSuggestions(newSuggestions);
    setDetailedAnalysis(analysis);

    return analysis;
  }, [checkRequiredSections, checkContactInfo, checkFontCompatibility, checkKeywords, checkFormatting]);

  // Auto-analyze when content changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      analyzeResume();
    }, 1000);

    return () => clearTimeout(timer);
  }, [elements, sections]);

  /**
   * Get ATS-optimized export data
   */
  const getATSExportData = useCallback(() => {
    // Sort elements by reading order (top to bottom, left to right)
    const sortedElements = [...elements].sort((a, b) => {
      if (Math.abs(a.y - b.y) < 20) return a.x - b.x;
      return a.y - b.y;
    });

    // Build hierarchical structure
    const sectionHierarchy = sections
      .filter(s => !s.parentSection)
      .sort((a, b) => a.y - b.y)
      .map(section => ({
        title: section.title,
        atsHeader: section.atsHeader,
        elements: sortedElements
          .filter(el => el.parentSection === section.id)
          .map(el => ({
            content: el.content,
            type: el.type,
            semanticTag: el.semanticTag || 'p'
          }))
      }));

    // Header elements (not in any section)
    const headerElements = sortedElements
      .filter(el => !el.parentSection)
      .map(el => ({
        content: el.content,
        type: el.type,
        semanticTag: el.semanticTag || 'p',
        atsField: el.atsField
      }));

    return {
      header: headerElements,
      sections: sectionHierarchy,
      metadata: {
        atsScore,
        analyzedAt: new Date().toISOString()
      }
    };
  }, [elements, sections, atsScore]);

  return {
    atsScore,
    suggestions,
    detailedAnalysis,
    analyzeResume,
    getATSExportData,
    checkRequiredSections,
    checkContactInfo,
    checkFontCompatibility,
    checkKeywords,
    checkFormatting
  };
}

/**
 * Helper: Extract keywords from job description
 */
function extractKeywords(text) {
  // Simple keyword extraction - would be more sophisticated in production
  const commonWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'our', 'your',
    'we', 'you', 'they', 'this', 'that', 'these', 'those'
  ]);

  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.has(word));

  // Count frequency
  const freq = {};
  words.forEach(word => {
    freq[word] = (freq[word] || 0) + 1;
  });

  // Return top keywords
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word]) => word);
}

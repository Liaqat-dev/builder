/**
 * 🎯 ATS Resume Builder - Complete Server
 * =========================================
 *
 * Full-featured backend with:
 * - Template management (save/load)
 * - AI-powered resume generation
 * - PDF generation via Puppeteer
 * - In-memory storage (can be replaced with database)
 *
 * Endpoints:
 *   Template Management:
 *     POST /api/templates/save       - Save a template
 *     GET  /api/templates            - Get all templates
 *     GET  /api/templates/:id        - Get specific template
 *     DELETE /api/templates/:id      - Delete a template
 *
 *   Resume Generation:
 *     POST /api/resume/generate      - Generate AI-filled resume
 *     GET  /api/resume/:id           - Get a filled resume
 *
 *   PDF Generation:
 *     POST /api/resume/print         - Generate PDF from resume data
 *     POST /api/resume/preview       - Get HTML preview
 *
 *   Health:
 *     GET  /health                   - Health check
 */

const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================
// MIDDLEWARE
// ============================================

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// ============================================
// IN-MEMORY STORAGE
// ============================================
// Note: Replace this with a real database (MongoDB, PostgreSQL, etc.) for production

const storage = {
    templates: new Map(),
    resumes: new Map()
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Generate unique ID
 */
function generateId(prefix = 'id') {
    return `${prefix}-${crypto.randomBytes(8).toString('hex')}`;
}

/**
 * Calculate ATS score based on resume content
 */
function calculateATSScore(userData, sections, elements) {
    let score = 0;
    const checks = [];

    // Check 1: Contact information (20 points)
    if (userData.personalInfo?.name) {
        score += 5;
        checks.push('Has name');
    }
    if (userData.personalInfo?.email) {
        score += 5;
        checks.push('Has email');
    }
    if (userData.personalInfo?.phone) {
        score += 5;
        checks.push('Has phone');
    }
    if (userData.personalInfo?.location) {
        score += 5;
        checks.push('Has location');
    }

    // Check 2: Work experience (25 points)
    if (userData.experience?.length > 0) {
        score += 15;
        checks.push('Has work experience');

        const hasDescriptions = userData.experience.some(exp => exp.description);
        if (hasDescriptions) {
            score += 10;
            checks.push('Experience has descriptions');
        }
    }

    // Check 3: Education (15 points)
    if (userData.education?.length > 0) {
        score += 15;
        checks.push('Has education');
    }

    // Check 4: Skills (15 points)
    if (userData.skills?.length >= 5) {
        score += 15;
        checks.push('Has 5+ skills');
    } else if (userData.skills?.length > 0) {
        score += 8;
        checks.push('Has some skills');
    }

    // Check 5: Professional summary (10 points)
    if (userData.summary && userData.summary.length > 50) {
        score += 10;
        checks.push('Has professional summary');
    }

    // Check 6: Standard sections (15 points)
    const standardSections = ['experience', 'education', 'skills', 'summary'];
    const hasSections = sections.filter(s =>
        standardSections.some(std => s.title.toLowerCase().includes(std))
    );
    if (hasSections.length >= 3) {
        score += 15;
        checks.push('Has standard sections');
    }

    return {
        score: Math.min(score, 100),
        checks,
        timestamp: new Date().toISOString()
    };
}

/**
 * AI-powered content optimization
 * (Simplified version - replace with actual AI API call)
 */
function optimizeContent(content, jobDescription) {
    // This is a placeholder. In production, you would:
    // 1. Call OpenAI/Anthropic API
    // 2. Pass job description and content
    // 3. Get optimized, ATS-friendly content back

    // For now, just return the content with basic formatting
    if (!content) return '';

    // Basic improvements
    let optimized = content
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/^-\s*/gm, '• '); // Convert dashes to bullets

    return optimized;
}

/**
 * Generate professional summary using AI
 * (Simplified version - replace with actual AI API call)
 */
function generateSummary(userData, jobDescription) {
    // Placeholder implementation
    const name = userData.personalInfo?.name || 'Professional';
    const title = userData.experience?.[0]?.title || 'Professional';
    const yearsExp = userData.experience?.length || 0;

    return `${title} with ${yearsExp}+ years of experience in delivering high-quality results. Proven track record of success in fast-paced environments. Strong technical skills and commitment to excellence.`;
}

// ============================================
// HEALTH CHECK
// ============================================

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        storage: {
            templates: storage.templates.size,
            resumes: storage.resumes.size
        }
    });
});

// ============================================
// TEMPLATE MANAGEMENT ROUTES
// ============================================

/**
 * Save a template
 * POST /api/templates/save
 *
 * Body: {
 *   template: { elements, sections, canvasSettings },
 *   name: string
 * }
 */
app.post('/api/templates/save', (req, res) => {
    try {
        const { template, name } = req.body;

        if (!template || !name) {
            return res.status(400).json({
                error: 'Missing required fields',
                message: 'Both template and name are required'
            });
        }

        if (!template.elements || !template.sections) {
            return res.status(400).json({
                error: 'Invalid template structure',
                message: 'Template must contain elements and sections'
            });
        }

        const templateId = generateId('template');
        const templateData = {
            id: templateId,
            name,
            template,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        storage.templates.set(templateId, templateData);

        console.log(`✅ Template saved: ${name} (${templateId})`);

        res.json({
            success: true,
            templateId,
            message: 'Template saved successfully'
        });

    } catch (error) {
        console.error('❌ Save Template Error:', error);
        res.status(500).json({
            error: 'Failed to save template',
            message: error.message
        });
    }
});

/**
 * Get all templates
 * GET /api/templates
 */
app.get('/api/templates', (req, res) => {
    try {
        const templates = Array.from(storage.templates.values()).map(t => ({
            id: t.id,
            name: t.name,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt,
            elementCount: t.template.elements?.length || 0,
            sectionCount: t.template.sections?.length || 0
        }));

        res.json({
            success: true,
            templates,
            count: templates.length
        });

    } catch (error) {
        console.error('❌ Get Templates Error:', error);
        res.status(500).json({
            error: 'Failed to retrieve templates',
            message: error.message
        });
    }
});

/**
 * Get specific template
 * GET /api/templates/:id
 */
app.get('/api/templates/:id', (req, res) => {
    try {
        const { id } = req.params;
        const template = storage.templates.get(id);

        if (!template) {
            return res.status(404).json({
                error: 'Template not found',
                message: `No template found with ID: ${id}`
            });
        }

        res.json({
            success: true,
            template
        });

    } catch (error) {
        console.error('❌ Get Template Error:', error);
        res.status(500).json({
            error: 'Failed to retrieve template',
            message: error.message
        });
    }
});

/**
 * Delete a template
 * DELETE /api/templates/:id
 */
app.delete('/api/templates/:id', (req, res) => {
    try {
        const { id } = req.params;
        const existed = storage.templates.delete(id);

        if (!existed) {
            return res.status(404).json({
                error: 'Template not found',
                message: `No template found with ID: ${id}`
            });
        }

        console.log(`🗑️  Template deleted: ${id}`);

        res.json({
            success: true,
            message: 'Template deleted successfully'
        });

    } catch (error) {
        console.error('❌ Delete Template Error:', error);
        res.status(500).json({
            error: 'Failed to delete template',
            message: error.message
        });
    }
});

// ============================================
// RESUME GENERATION ROUTES
// ============================================

/**
 * Generate AI-filled resume from template and user data
 * POST /api/resume/generate
 *
 * Body: {
 *   templateId: string,
 *   userData: {
 *     personalInfo: { name, email, phone, location, linkedin, website },
 *     summary: string,
 *     experience: Array,
 *     education: Array,
 *     skills: Array,
 *     certifications: Array,
 *     languages: Array
 *   },
 *   jobDescription: string (optional)
 * }
 */
app.post('/api/resume/generate', async (req, res) => {
    try {
        const { templateId, userData, jobDescription } = req.body;

        if (!templateId || !userData) {
            return res.status(400).json({
                error: 'Missing required fields',
                message: 'Both templateId and userData are required'
            });
        }

        // Get template
        const templateData = storage.templates.get(templateId);
        if (!templateData) {
            return res.status(404).json({
                error: 'Template not found',
                message: `No template found with ID: ${templateId}`
            });
        }

        console.log(`🤖 Generating resume for: ${userData.personalInfo?.name || 'User'}`);

        // Clone template
        const { elements, sections } = JSON.parse(JSON.stringify(templateData.template));

        // Fill in the template with user data
        const filledElements = elements.map(element => {
            let content = element.content;

            // Map placeholders to actual data
            if (content) {
                // Personal info
                content = content.replace(/\{name\}/gi, userData.personalInfo?.name || '');
                content = content.replace(/\{email\}/gi, userData.personalInfo?.email || '');
                content = content.replace(/\{phone\}/gi, userData.personalInfo?.phone || '');
                content = content.replace(/\{location\}/gi, userData.personalInfo?.location || '');
                content = content.replace(/\{linkedin\}/gi, userData.personalInfo?.linkedin || '');
                content = content.replace(/\{website\}/gi, userData.personalInfo?.website || '');

                // Summary (generate if empty)
                if (content.includes('{summary}')) {
                    const summary = userData.summary || generateSummary(userData, jobDescription);
                    content = content.replace(/\{summary\}/gi, summary);
                }

                // Optimize content if job description provided
                if (jobDescription) {
                    content = optimizeContent(content, jobDescription);
                }
            }

            return { ...element, content };
        });

        // Fill sections with structured data
        const filledSections = sections.map(section => {
            const sectionCopy = { ...section };

            // Experience section
            if (section.title?.toLowerCase().includes('experience')) {
                if (userData.experience && userData.experience.length > 0) {
                    // This would be handled by creating child elements/sections
                    // For now, just mark as filled
                    sectionCopy.filled = true;
                    sectionCopy.itemCount = userData.experience.length;
                }
            }

            // Education section
            if (section.title?.toLowerCase().includes('education')) {
                if (userData.education && userData.education.length > 0) {
                    sectionCopy.filled = true;
                    sectionCopy.itemCount = userData.education.length;
                }
            }

            // Skills section
            if (section.title?.toLowerCase().includes('skill')) {
                if (userData.skills && userData.skills.length > 0) {
                    sectionCopy.filled = true;
                    sectionCopy.itemCount = userData.skills.length;
                }
            }

            return sectionCopy;
        });

        // Calculate ATS score
        const atsAnalysis = calculateATSScore(userData, filledSections, filledElements);

        // Create resume record
        const resumeId = generateId('resume');
        const resumeData = {
            id: resumeId,
            templateId,
            userData,
            jobDescription,
            filledData: {
                elements: filledElements,
                sections: filledSections
            },
            atsScore: atsAnalysis.score,
            atsChecks: atsAnalysis.checks,
            createdAt: new Date().toISOString()
        };

        storage.resumes.set(resumeId, resumeData);

        console.log(`✅ Resume generated: ${resumeId} (ATS Score: ${atsAnalysis.score})`);

        res.json({
            success: true,
            resumeId,
            filledResume: resumeData.filledData,
            atsScore: atsAnalysis.score,
            atsChecks: atsAnalysis.checks,
            message: 'Resume generated successfully'
        });

    } catch (error) {
        console.error('❌ Generate Resume Error:', error);
        res.status(500).json({
            error: 'Failed to generate resume',
            message: error.message
        });
    }
});

/**
 * Get a filled resume by ID
 * GET /api/resume/:id
 */
app.get('/api/resume/:id', (req, res) => {
    try {
        const { id } = req.params;
        const resume = storage.resumes.get(id);

        if (!resume) {
            return res.status(404).json({
                error: 'Resume not found',
                message: `No resume found with ID: ${id}`
            });
        }

        res.json({
            success: true,
            resume
        });

    } catch (error) {
        console.error('❌ Get Resume Error:', error);
        res.status(500).json({
            error: 'Failed to retrieve resume',
            message: error.message
        });
    }
});

// ============================================
// PDF GENERATION (PRINT SERVICE)
// ============================================

/**
 * Generate PDF from resume data
 * POST /api/resume/print
 *
 * Body: {
 *   resumeId: string (optional - if provided, loads from storage)
 *   elements: Array (required if no resumeId)
 *   sections: Array (required if no resumeId)
 *   fileName: string (optional)
 *   options: {
 *     format: 'A4' | 'Letter',
 *     margins: { top, right, bottom, left }
 *   }
 * }
 */
app.post('/api/resume/print', async (req, res) => {
    let browser = null;

    try {
        let { resumeId, elements, sections, fileName, options = {} } = req.body;

        // If resumeId provided, load from storage
        if (resumeId) {
            const resume = storage.resumes.get(resumeId);
            if (!resume) {
                return res.status(404).json({
                    error: 'Resume not found',
                    message: `No resume found with ID: ${resumeId}`
                });
            }
            elements = resume.filledData.elements;
            sections = resume.filledData.sections;
            fileName = fileName || `resume-${resumeId}`;
        }

        if (!elements || !sections) {
            return res.status(400).json({
                error: 'Missing required data',
                message: 'Either resumeId or both elements and sections arrays are required'
            });
        }

        console.log(`🖨️  Generating PDF: ${fileName || 'resume'}`);
        console.log(`   Elements: ${elements.length}, Sections: ${sections.length}`);

        // Generate HTML for PDF
        const html = generateResumeHTML(elements, sections, options);

        // Launch Puppeteer and generate PDF
        browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu'
            ]
        });

        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });

        // Set viewport to match paper size
        const isA4 = options.format !== 'Letter';
        await page.setViewport({
            width: isA4 ? 794 : 816,
            height: isA4 ? 1123 : 1056
        });

        const pdf = await page.pdf({
            format: options.format || 'A4',
            printBackground: true,
            margin: options.margins || {
                top: '0mm',
                right: '0mm',
                bottom: '0mm',
                left: '0mm'
            }
        });

        await browser.close();
        browser = null;

        console.log(`✅ PDF generated successfully`);

        // Send PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName || 'resume'}.pdf"`);
        res.send(pdf);

    } catch (error) {
        console.error('❌ Print Error:', error);

        if (browser) {
            await browser.close();
        }

        res.status(500).json({
            error: 'Failed to generate PDF',
            message: error.message
        });
    }
});

/**
 * Generate HTML preview (for debugging)
 * POST /api/resume/preview
 */
app.post('/api/resume/preview', (req, res) => {
    try {
        const { elements, sections, options = {} } = req.body;

        if (!elements || !sections) {
            return res.status(400).json({
                error: 'Missing required data',
                message: 'Both elements and sections arrays are required'
            });
        }

        const html = generateResumeHTML(elements, sections, options);

        res.setHeader('Content-Type', 'text/html');
        res.send(html);

    } catch (error) {
        console.error('❌ Preview Error:', error);
        res.status(500).json({
            error: 'Failed to generate preview',
            message: error.message
        });
    }
});

// ============================================
// HTML GENERATION FOR PDF
// ============================================

/**
 * Generate ATS-optimized HTML for PDF
 */
function generateResumeHTML(elements, sections, options = {}) {
    // Sort elements by position
    const sortedElements = [...elements].sort((a, b) => {
        if (Math.abs(a.y - b.y) < 20) return a.x - b.x;
        return a.y - b.y;
    });

    // Sort sections by position
    const sortedSections = [...sections]
        .filter(s => !s.parentSection)
        .sort((a, b) => a.y - b.y);

    const isA4 = options.format !== 'Letter';

    let html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Resume</title>
  <style>
    @page {
      size: ${isA4 ? 'A4' : 'Letter'};
      margin: 0;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 11pt;
      line-height: 1.4;
      color: #333;
      width: ${isA4 ? '210mm' : '8.5in'};
      min-height: ${isA4 ? '297mm' : '11in'};
      padding: 40px 50px;
      background: white;
    }
    
    .element {
      margin-bottom: 8px;
    }
    
    .section {
      margin-bottom: 20px;
    }
    
    .section-title {
      font-size: 14pt;
      font-weight: bold;
      margin-bottom: 10px;
      padding-bottom: 5px;
      border-bottom: 2px solid #333;
    }
    
    .text-element {
      white-space: pre-wrap;
    }
    
    .list-item {
      margin-left: 20px;
    }
  </style>
</head>
<body>
`;

    // Render elements
    sortedElements.forEach(el => {
        const styles = buildElementStyles(el);
        const escapedContent = escapeHTML(el.content || '');

        html += `
  <div class="element ${el.type || 'text'}-element" style="${styles}">
    ${escapedContent}
  </div>
`;
    });

    // Render sections
    sortedSections.forEach(section => {
        html += `
  <div class="section">
    <div class="section-title">${escapeHTML(section.title || '')}</div>
`;

        // Render section content (elements within section)
        const sectionElements = sortedElements.filter(el => el.parentSection === section.id);
        sectionElements.forEach(el => {
            const styles = buildElementStyles(el);
            const escapedContent = escapeHTML(el.content || '');

            html += `
    <div class="element ${el.type || 'text'}-element" style="${styles}">
      ${escapedContent}
    </div>
`;
        });

        html += `
  </div>
`;
    });

    html += `
</body>
</html>
`;

    return html;
}

/**
 * Build CSS styles from element properties
 */
function buildElementStyles(el) {
    const styles = [];

    if (el.fontSize) styles.push(`font-size: ${el.fontSize}pt`);
    if (el.fontWeight) styles.push(`font-weight: ${el.fontWeight}`);
    if (el.fontFamily) styles.push(`font-family: ${el.fontFamily}, sans-serif`);
    if (el.color) styles.push(`color: ${el.color}`);
    if (el.textAlign) styles.push(`text-align: ${el.textAlign}`);
    if (el.lineHeight) styles.push(`line-height: ${el.lineHeight}`);

    return styles.join('; ');
}

/**
 * HTML escape helper
 */
function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
        availableRoutes: [
            'POST /api/templates/save',
            'GET /api/templates',
            'GET /api/templates/:id',
            'DELETE /api/templates/:id',
            'POST /api/resume/generate',
            'GET /api/resume/:id',
            'POST /api/resume/print',
            'POST /api/resume/preview',
            'GET /health'
        ]
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
});

// ============================================
// SERVER STARTUP
// ============================================

app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════════════════╗
║   🎯 ATS Resume Builder - Complete Server                        ║
║   Running on http://localhost:${PORT}                                ║
╚══════════════════════════════════════════════════════════════════╝

📡 ENDPOINTS:

📁 Template Management:
   POST   /api/templates/save       - Save a new template
   GET    /api/templates            - Get all templates
   GET    /api/templates/:id        - Get specific template
   DELETE /api/templates/:id        - Delete a template

🤖 Resume Generation:
   POST   /api/resume/generate      - Generate AI-filled resume
   GET    /api/resume/:id           - Get a filled resume

🖨️  PDF Generation:
   POST   /api/resume/print         - Generate PDF from resume data
   POST   /api/resume/preview       - Get HTML preview

💚 Health:
   GET    /health                   - Server health check

📋 STORAGE:
   Mode: In-memory (data cleared on restart)
   Templates: ${storage.templates.size}
   Resumes: ${storage.resumes.size}

⚠️  NOTE: Using in-memory storage. For production, replace with:
   - MongoDB for document storage
   - PostgreSQL for relational data
   - Redis for caching

🚀 Ready to accept requests!
  `);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n👋 Shutting down server...');
    console.log(`   Templates saved: ${storage.templates.size}`);
    console.log(`   Resumes saved: ${storage.resumes.size}`);
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n\n👋 Shutting down server...');
    process.exit(0);
});

module.exports = app;
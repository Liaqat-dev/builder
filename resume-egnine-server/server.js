/**
 * 🎯 ATS Resume Builder - Print Server
 * =====================================
 *
 * Simple PDF generation service using Puppeteer.
 *
 * Endpoints:
 *   POST /api/resume/print - Generate PDF from resume data
 *   GET  /health           - Health check
 */

const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// ============================================
// HEALTH CHECK
// ============================================

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================
// PDF GENERATION (PRINT SERVICE)
// ============================================

/**
 * Generate PDF from resume data
 * POST /api/resume/print
 *
 * Body: {
 *   elements: Array,     - Resume elements with content, position, styling
 *   sections: Array,     - Resume sections with title, content type
 *   fileName: string,    - Output filename (optional)
 *   options: {           - PDF options (optional)
 *     format: 'A4' | 'Letter',
 *     margins: { top, right, bottom, left }
 *   }
 * }
 */
app.post('/api/resume/print', async (req, res) => {
    let browser = null;

    try {
        const { elements, sections, fileName, options = {} } = req.body;

        if (!elements || !sections) {
            return res.status(400).json({
                error: 'Missing required data',
                message: 'Both elements and sections arrays are required'
            });
        }

        console.log(`🖨️ Generating PDF: ${fileName || 'resume'}`);
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
            width: isA4 ? 794 : 816,   // A4: 210mm, Letter: 8.5in at 96dpi
            height: isA4 ? 1123 : 1056  // A4: 297mm, Letter: 11in at 96dpi
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
// HTML GENERATION
// ============================================

/**
 * Generate ATS-optimized HTML for PDF
 */
function generateResumeHTML(elements, sections, options = {}) {
    // Sort elements by position (top to bottom, left to right)
    const sortedElements = [...elements].sort((a, b) => {
        if (Math.abs(a.y - b.y) < 20) return a.x - b.x;
        return a.y - b.y;
    });

    // Sort sections by position
    const sortedSections = [...sections]
        .filter(s => !s.parentSection)
        .sort((a, b) => a.y - b.y);

    // Header elements (not in any section)
    const headerElements = sortedElements.filter(el => !el.parentSection);

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
    
    /* Header */
    .header {
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 2px solid #333;
    }
    
    .name {
      font-size: 28pt;
      font-weight: bold;
      color: #111;
      margin-bottom: 8px;
    }
    
    .contact {
      font-size: 10pt;
      color: #555;
    }
    
    /* Sections */
    .section {
      margin-bottom: 18px;
    }
    
    .section-title {
      font-size: 13pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.5pt;
      border-bottom: 1.5px solid #333;
      padding-bottom: 4px;
      margin-bottom: 10px;
      color: #111;
    }
    
    /* Entries (Experience, Education) */
    .entry {
      margin-bottom: 12px;
    }
    
    .entry-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 4px;
    }
    
    .entry-title {
      font-size: 11pt;
      font-weight: bold;
      color: #222;
    }
    
    .entry-date {
      font-size: 10pt;
      color: #666;
      font-style: italic;
    }
    
    .entry-subtitle {
      font-size: 10pt;
      color: #444;
      margin-bottom: 4px;
    }
    
    /* Bullets */
    .bullets {
      padding-left: 18px;
      margin: 6px 0;
    }
    
    .bullets li {
      margin-bottom: 3px;
      font-size: 10.5pt;
    }
    
    /* Skills */
    .skills-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    
    .skill-item {
      font-size: 10pt;
      padding: 3px 10px;
      background: #f3f4f6;
      border-radius: 3px;
    }
    
    /* Summary */
    .summary-text {
      font-size: 10.5pt;
      line-height: 1.5;
      color: #444;
    }
    
    /* Generic text element */
    .text-element {
      margin-bottom: 4px;
    }
    
    /* Print optimization */
    @media print {
      body {
        padding: 0;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
`;

    // Add header elements
    headerElements.forEach(el => {
        if (el.atsField === 'name' || el.fontSize > 20) {
            html += `    <div class="name">${escapeHTML(el.content)}</div>\n`;
        } else if (el.atsField === 'contact') {
            html += `    <div class="contact">${escapeHTML(el.content)}</div>\n`;
        } else {
            const style = buildElementStyle(el);
            html += `    <div class="text-element" style="${style}">${escapeHTML(el.content)}</div>\n`;
        }
    });

    html += `  </div>\n\n`;

    // Add sections
    sortedSections.forEach(section => {
        html += `  <!-- ${section.title} -->\n`;
        html += `  <div class="section">\n`;
        html += `    <div class="section-title">${escapeHTML(section.title)}</div>\n`;

        // Get section content
        const sectionElements = sortedElements
            .filter(el => el.parentSection === section.id)
            .sort((a, b) => a.y - b.y);

        // Check for subsections
        const subSections = sections
            .filter(s => s.parentSection === section.id)
            .sort((a, b) => a.y - b.y);

        const filledContent = section.filledContent || [];

        // Render based on content type
        if (filledContent.length > 0) {
            // Use pre-filled content structure
            filledContent.forEach(content => {
                if (content.type === 'entry') {
                    html += `    <div class="entry">\n`;
                    html += `      <div class="entry-header">\n`;
                    html += `        <span class="entry-title">${escapeHTML(content.title)}</span>\n`;
                    if (content.subtitle) {
                        html += `        <span class="entry-date">${escapeHTML(content.subtitle)}</span>\n`;
                    }
                    html += `      </div>\n`;

                    if (content.bullets && content.bullets.length > 0) {
                        html += `      <ul class="bullets">\n`;
                        content.bullets.forEach(bullet => {
                            html += `        <li>${escapeHTML(bullet)}</li>\n`;
                        });
                        html += `      </ul>\n`;
                    }
                    html += `    </div>\n`;

                } else if (content.type === 'list') {
                    html += `    <div class="skills-list">\n`;
                    (content.items || []).forEach(item => {
                        html += `      <span class="skill-item">${escapeHTML(item)}</span>\n`;
                    });
                    html += `    </div>\n`;

                } else if (content.type === 'text') {
                    html += `    <p class="summary-text">${escapeHTML(content.content)}</p>\n`;
                }
            });
        } else if (subSections.length > 0) {
            // Render subsections as entries
            subSections.forEach(sub => {
                html += `    <div class="entry">\n`;
                html += `      <div class="entry-header">\n`;
                html += `        <span class="entry-title">${escapeHTML(sub.title)}</span>\n`;
                html += `      </div>\n`;

                const subElements = sortedElements
                    .filter(el => el.parentSection === sub.id)
                    .sort((a, b) => a.y - b.y);

                if (subElements.length > 0) {
                    const hasBullets = subElements.some(el =>
                        el.type === 'list-item' || el.content?.startsWith('•') || el.content?.startsWith('-')
                    );

                    if (hasBullets) {
                        html += `      <ul class="bullets">\n`;
                        subElements.forEach(el => {
                            const content = el.content?.replace(/^[•\-]\s*/, '') || '';
                            html += `        <li>${escapeHTML(content)}</li>\n`;
                        });
                        html += `      </ul>\n`;
                    } else {
                        subElements.forEach(el => {
                            html += `      <p class="text-element">${escapeHTML(el.content)}</p>\n`;
                        });
                    }
                }
                html += `    </div>\n`;
            });
        } else if (section.contentType === 'list-items') {
            // Render as bullet list
            html += `    <ul class="bullets">\n`;
            sectionElements.forEach(el => {
                const content = el.content?.replace(/^[•\-]\s*/, '') || '';
                html += `      <li>${escapeHTML(content)}</li>\n`;
            });
            html += `    </ul>\n`;
        } else {
            // Render as text paragraphs
            sectionElements.forEach(el => {
                const style = buildElementStyle(el);
                html += `    <p class="text-element" style="${style}">${escapeHTML(el.content)}</p>\n`;
            });
        }

        html += `  </div>\n\n`;
    });

    html += `</body>\n</html>`;

    return html;
}

/**
 * Build inline style string for an element
 */
function buildElementStyle(el) {
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
// SERVER STARTUP
// ============================================

app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════════╗
║   🖨️  Resume Builder - Print Server                      ║
║   Running on http://localhost:${PORT}                        ║
╚══════════════════════════════════════════════════════════╝

📡 ENDPOINTS:
   POST /api/resume/print    - Generate PDF from resume data
   POST /api/resume/preview  - Get HTML preview (for debugging)
   GET  /health              - Health check

📋 USAGE:
   POST /api/resume/print
   Body: {
     elements: [...],  // Resume elements
     sections: [...],  // Resume sections
     fileName: "my-resume",
     options: {
       format: "A4" | "Letter",
       margins: { top, right, bottom, left }
     }
   }

  `);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n👋 Shutting down server...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n\n👋 Shutting down server...');
    process.exit(0);
});

module.exports = app;
/**
 * API Test Script
 * ================
 * Tests all endpoints to verify the server is working correctly
 * 
 * Usage: node test-api.js
 */

const BASE_URL = 'http://localhost:3001';

// Color codes for terminal output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(name, method, path, body = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    log(`\n🧪 Testing: ${name}`, 'blue');
    log(`   ${method} ${path}`, 'yellow');

    const response = await fetch(`${BASE_URL}${path}`, options);
    const contentType = response.headers.get('content-type');

    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else if (contentType && contentType.includes('application/pdf')) {
      data = { message: 'PDF received successfully' };
    } else {
      data = await response.text();
    }

    if (response.ok) {
      log(`   ✅ Success (${response.status})`, 'green');
      console.log('   Response:', JSON.stringify(data, null, 2).substring(0, 200) + '...');
      return { success: true, data };
    } else {
      log(`   ❌ Failed (${response.status})`, 'red');
      console.log('   Error:', data);
      return { success: false, data };
    }
  } catch (error) {
    log(`   ❌ Error: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('\n' + '='.repeat(60));
  log('🎯 ATS Resume Builder - API Test Suite', 'blue');
  console.log('='.repeat(60));

  let templateId = null;
  let resumeId = null;

  // Test 1: Health Check
  await testEndpoint('Health Check', 'GET', '/health');

  // Test 2: Save Template
  const saveTemplateResult = await testEndpoint(
    'Save Template',
    'POST',
    '/api/templates/save',
    {
      name: 'Test Template',
      template: {
        elements: [
          {
            id: 'el-1',
            type: 'text',
            content: '{name}',
            x: 50,
            y: 50,
            width: 400,
            height: 40,
            fontSize: 24,
            fontWeight: 'bold'
          },
          {
            id: 'el-2',
            type: 'text',
            content: '{email} | {phone}',
            x: 50,
            y: 100,
            width: 400,
            height: 20,
            fontSize: 12
          }
        ],
        sections: [
          {
            id: 'sec-1',
            title: 'Professional Summary',
            x: 50,
            y: 150,
            width: 500,
            height: 100,
            contentType: 'text'
          },
          {
            id: 'sec-2',
            title: 'Experience',
            x: 50,
            y: 270,
            width: 500,
            height: 200,
            contentType: 'list-sections'
          }
        ],
        canvasSettings: {
          width: 600,
          height: 800
        }
      }
    }
  );

  if (saveTemplateResult.success && saveTemplateResult.data.templateId) {
    templateId = saveTemplateResult.data.templateId;
    log(`   📝 Template ID: ${templateId}`, 'green');
  }

  // Test 3: Get All Templates
  await testEndpoint('Get All Templates', 'GET', '/api/templates');

  // Test 4: Get Specific Template
  if (templateId) {
    await testEndpoint('Get Specific Template', 'GET', `/api/templates/${templateId}`);
  }

  // Test 5: Generate Resume
  if (templateId) {
    const generateResult = await testEndpoint(
      'Generate Resume',
      'POST',
      '/api/resume/generate',
      {
        templateId: templateId,
        userData: {
          personalInfo: {
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '(555) 123-4567',
            location: 'San Francisco, CA',
            linkedin: 'linkedin.com/in/johndoe',
            website: 'johndoe.com'
          },
          summary: 'Experienced software engineer with 5+ years in full-stack development.',
          experience: [
            {
              id: '1',
              company: 'Tech Corp',
              title: 'Senior Software Engineer',
              startDate: 'Jan 2020',
              endDate: 'Present',
              current: true,
              description: 'Led development of microservices architecture\nManaged team of 5 engineers'
            },
            {
              id: '2',
              company: 'StartupXYZ',
              title: 'Software Engineer',
              startDate: 'Jun 2018',
              endDate: 'Dec 2019',
              current: false,
              description: 'Built RESTful APIs using Node.js\nImplemented CI/CD pipelines'
            }
          ],
          education: [
            {
              id: '1',
              school: 'University of California, Berkeley',
              degree: 'Bachelor of Science',
              field: 'Computer Science',
              graduationDate: 'May 2018',
              gpa: '3.8'
            }
          ],
          skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker', 'PostgreSQL'],
          certifications: ['AWS Certified Developer'],
          languages: ['English (Native)', 'Spanish (Fluent)']
        },
        jobDescription: 'Looking for a senior full-stack developer with React and Node.js experience'
      }
    );

    if (generateResult.success && generateResult.data.resumeId) {
      resumeId = generateResult.data.resumeId;
      log(`   📄 Resume ID: ${resumeId}`, 'green');
      log(`   📊 ATS Score: ${generateResult.data.atsScore}`, 'green');
    }
  }

  // Test 6: Get Resume
  if (resumeId) {
    await testEndpoint('Get Resume', 'GET', `/api/resume/${resumeId}`);
  }

  // Test 7: Print Resume (using resume ID)
  if (resumeId) {
    await testEndpoint(
      'Print Resume (using resume ID)',
      'POST',
      '/api/resume/print',
      {
        resumeId: resumeId,
        fileName: 'test-resume',
        options: {
          format: 'A4'
        }
      }
    );
  }

  // Test 8: Print Resume (using direct data)
  await testEndpoint(
    'Print Resume (using direct data)',
    'POST',
    '/api/resume/print',
    {
      elements: [
        {
          type: 'text',
          content: 'John Doe',
          fontSize: 24,
          fontWeight: 'bold'
        },
        {
          type: 'text',
          content: 'Software Engineer',
          fontSize: 14
        }
      ],
      sections: [
        {
          title: 'Summary',
          contentType: 'text'
        }
      ],
      fileName: 'quick-test-resume'
    }
  );

  // Test 9: Preview HTML
  await testEndpoint(
    'Generate HTML Preview',
    'POST',
    '/api/resume/preview',
    {
      elements: [
        {
          type: 'text',
          content: 'Preview Test',
          fontSize: 18
        }
      ],
      sections: []
    }
  );

  // Test 10: Delete Template
  if (templateId) {
    await testEndpoint('Delete Template', 'DELETE', `/api/templates/${templateId}`);
  }

  // Test 11: 404 Error
  await testEndpoint('404 Test (should fail)', 'GET', '/api/invalid-endpoint');

  // Summary
  console.log('\n' + '='.repeat(60));
  log('✅ Test Suite Complete!', 'green');
  console.log('='.repeat(60));
  log('\nAll endpoints tested. Check results above for any failures.', 'blue');
  log('\n📝 Next Steps:', 'yellow');
  console.log('   1. Review any failed tests (marked with ❌)');
  console.log('   2. Check server logs for detailed error messages');
  console.log('   3. Verify your frontend can now connect to all endpoints');
  console.log('\n');
}

// Check if server is running before tests
async function checkServer() {
  try {
    const response = await fetch(`${BASE_URL}/health`);
    if (response.ok) {
      log('✅ Server is running!', 'green');
      return true;
    }
  } catch (error) {
    log('❌ Server is not running!', 'red');
    log(`   Please start the server first: npm start`, 'yellow');
    log(`   Expected URL: ${BASE_URL}`, 'yellow');
    return false;
  }
}

// Run tests
(async () => {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await runTests();
  }
  process.exit(0);
})();

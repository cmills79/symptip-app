/**
 * E2E Testing Agent
 *
 * An intelligent agent that can analyze the SymptIQ application,
 * generate comprehensive E2E tests, and orchestrate test execution.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

export interface TestScenario {
  id: string;
  name: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  userFlow: string[];
  preconditions?: string[];
  expectedOutcomes: string[];
  tags: string[];
}

export interface TestResult {
  scenario: string;
  passed: boolean;
  duration: number;
  errors?: string[];
  screenshots?: string[];
}

export interface AgentConfig {
  baseUrl: string;
  headless: boolean;
  browser: 'chromium' | 'firefox' | 'webkit' | 'all';
  parallel: boolean;
  retries: number;
  timeout: number;
  generateTests: boolean;
  runTests: boolean;
  reportPath: string;
}

export class E2ETestingAgent {
  private config: AgentConfig;
  private scenarios: TestScenario[] = [];

  constructor(config: Partial<AgentConfig> = {}) {
    this.config = {
      baseUrl: 'http://localhost:3000',
      headless: true,
      browser: 'chromium',
      parallel: true,
      retries: 2,
      timeout: 120000,
      generateTests: false,
      runTests: true,
      reportPath: './test-results',
      ...config
    };

    this.initializeScenarios();
  }

  /**
   * Initialize predefined test scenarios based on application analysis
   */
  private initializeScenarios(): void {
    this.scenarios = [
      // Critical Flows
      {
        id: 'auth-001',
        name: 'User Authentication Flow',
        description: 'Complete authentication flow from login to authenticated dashboard',
        priority: 'critical',
        userFlow: [
          'Navigate to application',
          'Redirect to login page',
          'Click Google Sign-In',
          'Complete OAuth flow',
          'Verify authenticated state',
          'Verify dashboard access'
        ],
        expectedOutcomes: [
          'User is redirected to login when unauthenticated',
          'Google OAuth completes successfully',
          'User sees dashboard after authentication',
          'Navigation shows user profile'
        ],
        tags: ['authentication', 'critical', 'smoke']
      },
      {
        id: 'photo-001',
        name: 'Complete Photo Capture Workflow',
        description: 'End-to-end photo capture from selection to submission',
        priority: 'critical',
        userFlow: [
          'Navigate to photo capture',
          'Select body area',
          'Capture or upload photo',
          'Edit and annotate photo',
          'Set timelapse preference',
          'Submit symptom description (min 50 chars)',
          'Answer AI follow-up questions',
          'Complete submission'
        ],
        preconditions: ['User must be authenticated'],
        expectedOutcomes: [
          'Photo is captured successfully',
          'Annotations are saved',
          'Symptom submission validates length',
          'AI questions are generated and answered',
          'Photo appears in gallery'
        ],
        tags: ['photo-capture', 'critical', 'workflow']
      },
      {
        id: 'photo-002',
        name: 'Photo Capture with File Upload',
        description: 'Upload existing photo file instead of camera capture',
        priority: 'high',
        userFlow: [
          'Navigate to photo capture',
          'Select body area (e.g., Face)',
          'Choose file upload option',
          'Upload valid image file',
          'Verify image preview',
          'Complete workflow'
        ],
        preconditions: ['User must be authenticated', 'Valid test image file available'],
        expectedOutcomes: [
          'File upload succeeds',
          'Image preview displays correctly',
          'Image dimensions are validated',
          'Workflow continues normally'
        ],
        tags: ['photo-capture', 'upload', 'high']
      },
      {
        id: 'photo-003',
        name: 'Photo Gallery Management',
        description: 'View, filter, and delete photos from gallery',
        priority: 'high',
        userFlow: [
          'Navigate to photo gallery',
          'Verify photos display in grid',
          'View photo metadata',
          'Delete a photo',
          'Confirm deletion',
          'Verify photo is removed'
        ],
        preconditions: ['User must be authenticated', 'At least one photo exists'],
        expectedOutcomes: [
          'Gallery displays all user photos',
          'Metadata shows correctly',
          'Delete confirmation modal appears',
          'Photo is removed from Firebase',
          'UI updates after deletion'
        ],
        tags: ['photo-gallery', 'high', 'crud']
      },
      {
        id: 'video-001',
        name: 'Video Capture Workflow',
        description: 'Complete video capture with 60-second recording',
        priority: 'high',
        userFlow: [
          'Navigate to photo capture',
          'Select video option',
          'Select body area',
          'Start video recording',
          'Record for duration',
          'Stop recording',
          'Submit with symptom description'
        ],
        preconditions: ['User must be authenticated', 'Camera permissions granted'],
        expectedOutcomes: [
          'Video recording starts',
          'Timer shows countdown',
          'Video stops at 60 seconds',
          'Key frames are extracted',
          'Video is uploaded to Firebase Storage'
        ],
        tags: ['video-capture', 'high', 'workflow']
      },
      {
        id: 'timelapse-001',
        name: 'Timelapse Video Generation',
        description: 'Create timelapse video from photo series',
        priority: 'medium',
        userFlow: [
          'Navigate to timelapse page',
          'Select body area filter',
          'Select photos for timelapse',
          'Configure FPS and quality',
          'Generate timelapse',
          'Wait for processing',
          'View generated video',
          'Play video'
        ],
        preconditions: ['User must be authenticated', 'Multiple photos of same body area exist'],
        expectedOutcomes: [
          'Photos are filterable by body area',
          'Timelapse generation starts',
          'FFmpeg processes video',
          'Video is playable',
          'Metadata is saved'
        ],
        tags: ['timelapse', 'medium', 'video-processing']
      },
      {
        id: 'nav-001',
        name: 'Cross-Page Navigation',
        description: 'Navigate between all application pages',
        priority: 'high',
        userFlow: [
          'Start at dashboard',
          'Navigate to Photos',
          'Navigate to Timelapse',
          'Navigate to Symptoms',
          'Navigate to Supplements',
          'Navigate to Meals',
          'Navigate to Analysis',
          'Navigate to Reports',
          'Return to Dashboard'
        ],
        preconditions: ['User must be authenticated'],
        expectedOutcomes: [
          'All pages load successfully',
          'Active page is highlighted in navigation',
          'No console errors',
          'Back button works correctly'
        ],
        tags: ['navigation', 'high', 'smoke']
      },
      {
        id: 'form-001',
        name: 'Form Validation',
        description: 'Test all form validation rules',
        priority: 'medium',
        userFlow: [
          'Navigate to symptom submission',
          'Submit empty form',
          'Verify error message',
          'Submit with < 50 characters',
          'Verify length validation',
          'Submit with exactly 50 characters',
          'Verify success',
          'Submit with > 50 characters',
          'Verify success'
        ],
        preconditions: ['User must be authenticated'],
        expectedOutcomes: [
          'Empty form shows validation error',
          'Short description shows minimum length error',
          'Valid submission succeeds',
          'Error messages are user-friendly'
        ],
        tags: ['forms', 'validation', 'medium']
      },
      {
        id: 'api-001',
        name: 'Research Agent API',
        description: 'Test research agent API endpoint',
        priority: 'medium',
        userFlow: [
          'Send POST request to /api/research',
          'Include query parameter',
          'Include optional parameters',
          'Wait for AI processing',
          'Verify response structure',
          'Verify research findings'
        ],
        expectedOutcomes: [
          'API returns 200 status',
          'Response contains research brief',
          'AI summary is generated',
          'Similar diseases are included',
          'Warnings are provided when relevant'
        ],
        tags: ['api', 'research', 'medium', 'ai']
      },
      {
        id: 'responsive-001',
        name: 'Responsive Design Testing',
        description: 'Test application on mobile and tablet viewports',
        priority: 'medium',
        userFlow: [
          'Load app on mobile viewport (Pixel 5)',
          'Test navigation menu',
          'Test photo capture',
          'Load app on tablet viewport',
          'Test photo gallery grid',
          'Load app on desktop viewport',
          'Compare layouts'
        ],
        expectedOutcomes: [
          'Mobile navigation collapses appropriately',
          'Touch targets are adequately sized',
          'Images scale correctly',
          'Forms are usable on small screens',
          'No horizontal scrolling'
        ],
        tags: ['responsive', 'mobile', 'medium', 'accessibility']
      },
      {
        id: 'a11y-001',
        name: 'Accessibility Compliance',
        description: 'Test accessibility features and WCAG compliance',
        priority: 'medium',
        userFlow: [
          'Run axe accessibility scan on home page',
          'Run scan on photo capture',
          'Run scan on gallery',
          'Test keyboard navigation',
          'Test screen reader announcements',
          'Test color contrast'
        ],
        expectedOutcomes: [
          'No critical accessibility violations',
          'All interactive elements are keyboard accessible',
          'ARIA labels are present',
          'Color contrast meets WCAG AA',
          'Focus indicators are visible'
        ],
        tags: ['accessibility', 'a11y', 'medium', 'compliance']
      },
      {
        id: 'error-001',
        name: 'Error Handling and Recovery',
        description: 'Test application behavior with errors and edge cases',
        priority: 'medium',
        userFlow: [
          'Attempt photo upload with invalid file type',
          'Attempt upload with oversized file',
          'Simulate network error during submission',
          'Test Firebase timeout handling',
          'Test missing required fields',
          'Verify error messages'
        ],
        expectedOutcomes: [
          'Invalid file types are rejected',
          'File size limits are enforced',
          'Network errors show user-friendly messages',
          'App recovers gracefully',
          'No data loss on error',
          'Retry mechanisms work'
        ],
        tags: ['error-handling', 'medium', 'edge-cases']
      },
      {
        id: 'perf-001',
        name: 'Performance and Load Testing',
        description: 'Test application performance under various conditions',
        priority: 'low',
        userFlow: [
          'Measure page load times',
          'Test with slow network (3G)',
          'Test gallery with 100+ photos',
          'Measure time to interactive',
          'Test concurrent user actions',
          'Monitor memory usage'
        ],
        expectedOutcomes: [
          'Pages load in < 3 seconds',
          'Images lazy load correctly',
          'Gallery pagination works efficiently',
          'No memory leaks detected',
          'Smooth scrolling maintained'
        ],
        tags: ['performance', 'low', 'optimization']
      }
    ];
  }

  /**
   * Get all test scenarios filtered by criteria
   */
  public getScenarios(filter?: {
    priority?: TestScenario['priority'][];
    tags?: string[];
  }): TestScenario[] {
    let filtered = [...this.scenarios];

    if (filter?.priority) {
      filtered = filtered.filter(s => filter.priority!.includes(s.priority));
    }

    if (filter?.tags) {
      filtered = filtered.filter(s =>
        filter.tags!.some(tag => s.tags.includes(tag))
      );
    }

    return filtered;
  }

  /**
   * Analyze application and suggest new test scenarios
   */
  public async analyzeApplication(): Promise<TestScenario[]> {
    console.log('🔍 Analyzing application for test coverage gaps...\n');

    const suggestedScenarios: TestScenario[] = [];

    // Analyze routes
    const appDir = path.join(process.cwd(), 'app');
    const routes = await this.discoverRoutes(appDir);

    // Check for untested routes
    const testedRoutes = this.scenarios.flatMap(s =>
      s.userFlow.filter(step => step.includes('Navigate to'))
    );

    for (const route of routes) {
      const isTested = testedRoutes.some(step =>
        step.toLowerCase().includes(route.toLowerCase())
      );

      if (!isTested && route !== '/') {
        suggestedScenarios.push({
          id: `suggested-${suggestedScenarios.length + 1}`,
          name: `Test ${route} Page`,
          description: `Navigate to and test ${route} page functionality`,
          priority: 'medium',
          userFlow: [
            `Navigate to ${route}`,
            'Verify page loads',
            'Test interactive elements',
            'Verify no console errors'
          ],
          expectedOutcomes: [
            'Page loads successfully',
            'Content renders correctly',
            'No JavaScript errors'
          ],
          tags: ['suggested', 'coverage']
        });
      }
    }

    console.log(`✅ Found ${suggestedScenarios.length} suggested test scenarios\n`);

    return suggestedScenarios;
  }

  /**
   * Discover routes in the application
   */
  private async discoverRoutes(dir: string, baseRoute = ''): Promise<string[]> {
    const routes: string[] = [];

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          // Skip api, components, and special folders
          if (!['api', 'components', 'lib', 'public'].includes(entry.name)) {
            const subRoutes = await this.discoverRoutes(
              fullPath,
              `${baseRoute}/${entry.name}`
            );
            routes.push(...subRoutes);
          }
        } else if (entry.name === 'page.tsx' || entry.name === 'page.ts') {
          routes.push(baseRoute || '/');
        }
      }
    } catch (error) {
      // Directory doesn't exist or can't be read
    }

    return routes;
  }

  /**
   * Generate test file for a scenario
   */
  public async generateTestFile(scenario: TestScenario): Promise<string> {
    const testTemplate = `import { test, expect } from '@playwright/test';

/**
 * ${scenario.name}
 * ${scenario.description}
 *
 * Priority: ${scenario.priority}
 * Tags: ${scenario.tags.join(', ')}
 */

test.describe('${scenario.name}', () => {
  ${scenario.preconditions ? `// Preconditions: ${scenario.preconditions.join(', ')}` : ''}

  test('${scenario.id}: ${scenario.description}', async ({ page }) => {
    // Test Steps:
    ${scenario.userFlow.map((step, i) => `// ${i + 1}. ${step}`).join('\n    ')}

    // TODO: Implement test steps

    // Expected Outcomes:
    ${scenario.expectedOutcomes.map((outcome, i) => `// ${i + 1}. ${outcome}`).join('\n    ')}
  });
});
`;

    const fileName = `${scenario.id}.spec.ts`;
    const filePath = path.join(process.cwd(), 'tests', 'e2e', fileName);

    await fs.writeFile(filePath, testTemplate, 'utf-8');
    console.log(`✅ Generated test file: ${fileName}`);

    return filePath;
  }

  /**
   * Run E2E tests with Playwright
   */
  public async runTests(options: {
    grep?: string;
    project?: string;
    headed?: boolean;
    workers?: number;
  } = {}): Promise<void> {
    console.log('🧪 Running E2E tests...\n');

    let command = 'npx playwright test';

    if (options.grep) {
      command += ` --grep "${options.grep}"`;
    }

    if (options.project) {
      command += ` --project=${options.project}`;
    }

    if (options.headed) {
      command += ' --headed';
    }

    if (options.workers) {
      command += ` --workers=${options.workers}`;
    }

    try {
      const { stdout, stderr } = await execAsync(command);
      console.log(stdout);
      if (stderr) console.error(stderr);
    } catch (error: any) {
      console.error('❌ Test execution failed:', error.message);
      throw error;
    }
  }

  /**
   * Generate comprehensive test report
   */
  public async generateReport(): Promise<void> {
    console.log('📊 Generating test report...\n');

    try {
      await execAsync('npx playwright show-report');
    } catch (error: any) {
      console.error('❌ Report generation failed:', error.message);
    }
  }

  /**
   * Run the complete testing agent workflow
   */
  public async execute(): Promise<void> {
    console.log('🤖 E2E Testing Agent Started\n');
    console.log('='.repeat(50));
    console.log('\n');

    // Step 1: Analyze application
    const suggestions = await this.analyzeApplication();

    // Step 2: Display test scenarios
    console.log('📋 Test Scenarios Summary:\n');
    console.log(`Total scenarios: ${this.scenarios.length}`);
    console.log(`Critical: ${this.getScenarios({ priority: ['critical'] }).length}`);
    console.log(`High: ${this.getScenarios({ priority: ['high'] }).length}`);
    console.log(`Medium: ${this.getScenarios({ priority: ['medium'] }).length}`);
    console.log(`Low: ${this.getScenarios({ priority: ['low'] }).length}`);
    console.log(`Suggested: ${suggestions.length}\n`);

    // Step 3: Generate tests if enabled
    if (this.config.generateTests) {
      console.log('📝 Generating test files...\n');
      const criticalScenarios = this.getScenarios({ priority: ['critical'] });
      for (const scenario of criticalScenarios) {
        await this.generateTestFile(scenario);
      }
    }

    // Step 4: Run tests if enabled
    if (this.config.runTests) {
      await this.runTests({
        workers: this.config.parallel ? undefined : 1
      });
    }

    // Step 5: Generate report
    console.log('\n');
    console.log('='.repeat(50));
    console.log('🎉 E2E Testing Agent Completed\n');
  }

  /**
   * Get test coverage statistics
   */
  public getCoverageStats(): {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    byTag: Record<string, number>;
  } {
    const byTag: Record<string, number> = {};

    this.scenarios.forEach(scenario => {
      scenario.tags.forEach(tag => {
        byTag[tag] = (byTag[tag] || 0) + 1;
      });
    });

    return {
      total: this.scenarios.length,
      critical: this.getScenarios({ priority: ['critical'] }).length,
      high: this.getScenarios({ priority: ['high'] }).length,
      medium: this.getScenarios({ priority: ['medium'] }).length,
      low: this.getScenarios({ priority: ['low'] }).length,
      byTag
    };
  }
}

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const config: Partial<AgentConfig> = {
    generateTests: args.includes('--generate'),
    runTests: !args.includes('--no-run'),
    headless: !args.includes('--headed')
  };

  const agent = new E2ETestingAgent(config);
  agent.execute().catch(console.error);
}

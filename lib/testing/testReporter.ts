/**
 * Custom Test Reporter
 *
 * Generates detailed test reports with insights and metrics.
 */

import * as fs from 'fs/promises';
import * as path from 'path';

export interface TestRunMetrics {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  timestamp: Date;
}

export interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  screenshots?: string[];
  retries: number;
}

export interface TestSuite {
  name: string;
  tests: TestResult[];
  duration: number;
}

export interface TestReport {
  metrics: TestRunMetrics;
  suites: TestSuite[];
  environment: {
    browser: string;
    platform: string;
    url: string;
  };
  coverage?: {
    scenarios: number;
    tested: number;
    percentage: number;
  };
}

export class TestReporter {
  private report: Partial<TestReport> = {};

  /**
   * Initialize report with environment info
   */
  public initializeReport(environment: TestReport['environment']): void {
    this.report = {
      environment,
      metrics: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        duration: 0,
        timestamp: new Date()
      },
      suites: []
    };
  }

  /**
   * Add test suite results
   */
  public addSuite(suite: TestSuite): void {
    if (!this.report.suites) {
      this.report.suites = [];
    }
    this.report.suites.push(suite);
    this.updateMetrics(suite);
  }

  /**
   * Update overall metrics
   */
  private updateMetrics(suite: TestSuite): void {
    if (!this.report.metrics) return;

    suite.tests.forEach(test => {
      this.report.metrics!.total++;
      this.report.metrics!.duration += test.duration;

      switch (test.status) {
        case 'passed':
          this.report.metrics!.passed++;
          break;
        case 'failed':
          this.report.metrics!.failed++;
          break;
        case 'skipped':
          this.report.metrics!.skipped++;
          break;
      }
    });
  }

  /**
   * Set coverage statistics
   */
  public setCoverage(coverage: TestReport['coverage']): void {
    this.report.coverage = coverage;
  }

  /**
   * Generate HTML report
   */
  public async generateHTMLReport(outputPath: string): Promise<void> {
    const html = this.buildHTMLReport();
    await fs.writeFile(outputPath, html, 'utf-8');
  }

  /**
   * Generate JSON report
   */
  public async generateJSONReport(outputPath: string): Promise<void> {
    const json = JSON.stringify(this.report, null, 2);
    await fs.writeFile(outputPath, json, 'utf-8');
  }

  /**
   * Build HTML report content
   */
  private buildHTMLReport(): string {
    const { metrics, suites, environment, coverage } = this.report;

    const passRate = metrics
      ? ((metrics.passed / metrics.total) * 100).toFixed(2)
      : '0';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SymptIQ E2E Test Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f5f5;
      color: #333;
      padding: 20px;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    .header {
      background: white;
      padding: 30px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 { font-size: 32px; margin-bottom: 10px; color: #2c3e50; }
    .timestamp { color: #7f8c8d; font-size: 14px; }
    .metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }
    .metric-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .metric-value {
      font-size: 36px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .metric-label {
      color: #7f8c8d;
      font-size: 14px;
      text-transform: uppercase;
    }
    .passed { color: #27ae60; }
    .failed { color: #e74c3c; }
    .skipped { color: #f39c12; }
    .progress-bar {
      height: 8px;
      background: #ecf0f1;
      border-radius: 4px;
      overflow: hidden;
      margin: 10px 0;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #27ae60, #2ecc71);
      transition: width 0.3s ease;
    }
    .suite {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .suite-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      padding-bottom: 15px;
      border-bottom: 1px solid #ecf0f1;
    }
    .suite-name { font-size: 20px; font-weight: 600; }
    .suite-duration {
      color: #7f8c8d;
      font-size: 14px;
    }
    .test {
      padding: 12px;
      border-left: 4px solid #ecf0f1;
      margin-bottom: 10px;
      background: #f8f9fa;
      border-radius: 4px;
    }
    .test.passed { border-left-color: #27ae60; }
    .test.failed { border-left-color: #e74c3c; }
    .test.skipped { border-left-color: #f39c12; }
    .test-name { font-weight: 500; margin-bottom: 5px; }
    .test-meta {
      display: flex;
      gap: 15px;
      font-size: 12px;
      color: #7f8c8d;
    }
    .error-message {
      background: #fee;
      border: 1px solid #fcc;
      border-radius: 4px;
      padding: 10px;
      margin-top: 10px;
      font-family: monospace;
      font-size: 12px;
      color: #c00;
    }
    .environment {
      background: #34495e;
      color: white;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
      display: flex;
      gap: 30px;
      font-size: 14px;
    }
    .coverage {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>SymptIQ E2E Test Report</h1>
      <div class="timestamp">
        Generated: ${metrics?.timestamp.toLocaleString()}
      </div>
    </div>

    <div class="environment">
      <div>🌐 Browser: ${environment?.browser}</div>
      <div>💻 Platform: ${environment?.platform}</div>
      <div>🔗 URL: ${environment?.url}</div>
    </div>

    <div class="metrics">
      <div class="metric-card">
        <div class="metric-value">${metrics?.total || 0}</div>
        <div class="metric-label">Total Tests</div>
      </div>
      <div class="metric-card">
        <div class="metric-value passed">${metrics?.passed || 0}</div>
        <div class="metric-label">Passed</div>
      </div>
      <div class="metric-card">
        <div class="metric-value failed">${metrics?.failed || 0}</div>
        <div class="metric-label">Failed</div>
      </div>
      <div class="metric-card">
        <div class="metric-value skipped">${metrics?.skipped || 0}</div>
        <div class="metric-label">Skipped</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${((metrics?.duration || 0) / 1000).toFixed(2)}s</div>
        <div class="metric-label">Duration</div>
      </div>
      <div class="metric-card">
        <div class="metric-value passed">${passRate}%</div>
        <div class="metric-label">Pass Rate</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${passRate}%"></div>
        </div>
      </div>
    </div>

    ${coverage ? `
    <div class="coverage">
      <h2>Test Coverage</h2>
      <p>
        <strong>${coverage.tested}</strong> of <strong>${coverage.scenarios}</strong> scenarios tested
        (<strong>${coverage.percentage.toFixed(1)}%</strong> coverage)
      </p>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${coverage.percentage}%"></div>
      </div>
    </div>
    ` : ''}

    ${suites?.map(suite => `
    <div class="suite">
      <div class="suite-header">
        <div class="suite-name">${suite.name}</div>
        <div class="suite-duration">${(suite.duration / 1000).toFixed(2)}s</div>
      </div>
      ${suite.tests.map(test => `
      <div class="test ${test.status}">
        <div class="test-name">
          ${test.status === 'passed' ? '✅' : test.status === 'failed' ? '❌' : '⏭️'}
          ${test.name}
        </div>
        <div class="test-meta">
          <span>Duration: ${(test.duration / 1000).toFixed(2)}s</span>
          ${test.retries > 0 ? `<span>Retries: ${test.retries}</span>` : ''}
        </div>
        ${test.error ? `<div class="error-message">${test.error}</div>` : ''}
      </div>
      `).join('')}
    </div>
    `).join('')}
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Print summary to console
   */
  public printSummary(): void {
    const { metrics, coverage } = this.report;

    console.log('\n');
    console.log('='.repeat(60));
    console.log('Test Results Summary');
    console.log('='.repeat(60));
    console.log('\n');

    if (metrics) {
      console.log(`Total Tests:  ${metrics.total}`);
      console.log(`✅ Passed:    ${metrics.passed}`);
      console.log(`❌ Failed:    ${metrics.failed}`);
      console.log(`⏭️  Skipped:   ${metrics.skipped}`);
      console.log(`⏱️  Duration:  ${(metrics.duration / 1000).toFixed(2)}s`);

      const passRate = ((metrics.passed / metrics.total) * 100).toFixed(2);
      console.log(`📊 Pass Rate: ${passRate}%`);
    }

    if (coverage) {
      console.log('\n');
      console.log(`Test Coverage: ${coverage.tested}/${coverage.scenarios} (${coverage.percentage.toFixed(1)}%)`);
    }

    console.log('\n');
    console.log('='.repeat(60));
    console.log('\n');
  }

  /**
   * Get report data
   */
  public getReport(): Partial<TestReport> {
    return this.report;
  }
}

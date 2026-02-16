// =============================================================================
// AI Test Generator - Uses Gemini to convert Playwright recordings to Midscene tests
// =============================================================================

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.MIDSCENE_MODEL_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

interface RecordingData {
  playwrightCode: string;
  actions: any[];
  screenshots: string[];
  startUrl: string;
  testName: string;
  testDescription?: string;
}

interface GeneratedTest {
  testCode: string;
  fileName: string;
  summary: string;
  detectedActions: string[];
  suggestedAssertions: string[];
}

export class AITestGenerator {
  
  /**
   * Convert Playwright recording to Midscene AI test
   */
  async generateTest(recording: RecordingData): Promise<GeneratedTest> {
    const prompt = this.buildPrompt(recording);
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return this.parseResponse(text, recording);
  }

  /**
   * Build the prompt for Gemini
   */
  private buildPrompt(recording: RecordingData): string {
    return `You are an expert in converting Playwright test recordings into Midscene.js AI-powered tests.

# TASK
Convert the Playwright codegen recording below into a Midscene.js test that uses AI vision assertions.

# RECORDED PLAYWRIGHT CODE
\`\`\`typescript
${recording.playwrightCode}
\`\`\`

# TEST METADATA
- Test Name: ${recording.testName}
- Description: ${recording.testDescription || 'No description provided'}
- Starting URL: ${recording.startUrl}

# OUTPUT FORMAT
Generate a complete Midscene.js test following this EXACT template:

\`\`\`typescript
import { test as base, expect } from '@playwright/test';
import type { PlayWrightAiFixtureType } from '@midscene/web/playwright';
import { PlaywrightAiFixture } from '@midscene/web/playwright';

const test = base.extend<PlayWrightAiFixtureType>(PlaywrightAiFixture({
  modelConfig: {
    MIDSCENE_MODEL_BASE_URL: process.env.MIDSCENE_MODEL_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta/openai/',
    MIDSCENE_MODEL_API_KEY: process.env.MIDSCENE_MODEL_API_KEY || '',
    MIDSCENE_MODEL_NAME: process.env.MIDSCENE_MODEL_NAME || 'gemini-2.0-flash',
    MIDSCENE_MODEL_FAMILY: process.env.MIDSCENE_MODEL_FAMILY || 'gemini',
  },
}));

const aiDelay = () => new Promise(resolve => setTimeout(resolve, 2000));

test.describe('${recording.testName}', () => {
  
  test('${this.sanitizeTestName(recording.testName)}', async ({ page, ai, aiAssert }) => {
    // YOUR CONVERTED CODE HERE
  });
});
\`\`\`

# CONVERSION RULES

1. **Keep Navigation**: Use \`await page.goto()\` for navigation
2. **Convert Clicks**: Change to \`await ai('click the [description]')\` + add \`await aiDelay()\`
3. **Convert Inputs**: Change to \`await ai('type "[text]" in the [description]')\` + add \`await aiDelay()\`
4. **Add Assertions**: Use \`await aiAssert('[expected state]')\` after important actions
5. **Use Natural Language**: Replace CSS selectors with human descriptions
6. **Add Waits**: Insert \`await page.waitForTimeout(3000)\` after form submissions

# SMART ASSERTIONS
- After login → \`await aiAssert('the page shows a dashboard or success indicator')\`
- After form submit → \`await aiAssert('the page shows a confirmation message')\`
- After navigation → \`await aiAssert('the page shows [expected content]')\`
- After errors → \`await aiAssert('the page shows an error message')\`

# EXAMPLES

Input: \`await page.click('button[type="submit"]')\`
Output: 
\`\`\`
await ai('click the submit button');
await aiDelay();
\`\`\`

Input: \`await page.fill('input[name="email"]', 'test@example.com')\`
Output:
\`\`\`
await ai('type "test@example.com" in the email input field');
await aiDelay();
\`\`\`

# IMPORTANT
- Return ONLY the TypeScript code
- No markdown, no explanations, just code
- Include proper imports and structure
- Make it production-ready
- Add meaningful assertions

Generate the complete Midscene test now:`;
  }

  /**
   * Parse Claude's response into structured test data
   */
  private parseResponse(response: string, recording: RecordingData): GeneratedTest {
    // Extract the test code
    const codeMatch = response.match(/```typescript\n([\s\S]*?)\n```/);
    const testCode = codeMatch ? codeMatch[1] : response;

    // Generate file name from test name
    const fileName = this.generateFileName(recording.testName);

    // Extract detected actions
    const detectedActions = this.extractActions(testCode);

    // Extract assertions
    const suggestedAssertions = this.extractAssertions(testCode);

    // Generate summary
    const summary = `AI-generated test for: ${recording.testName}`;

    return {
      testCode,
      fileName,
      summary,
      detectedActions,
      suggestedAssertions,
    };
  }

  /**
   * Generate file name from test name
   */
  private generateFileName(testName: string): string {
    const sanitized = testName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    return `${sanitized}.spec.ts`;
  }

  /**
   * Sanitize test name for describe block
   */
  private sanitizeTestName(testName: string): string {
    return testName.replace(/['"]/g, '');
  }

  /**
   * Extract AI actions from generated code
   */
  private extractActions(code: string): string[] {
    const aiMatches = code.matchAll(/await ai\(['"](.+?)['"]\)/g);
    return Array.from(aiMatches, m => m[1]);
  }

  /**
   * Extract assertions from generated code
   */
  private extractAssertions(code: string): string[] {
    const assertMatches = code.matchAll(/await aiAssert\(['"](.+?)['"]\)/g);
    return Array.from(assertMatches, m => m[1]);
  }
}

export const aiTestGenerator = new AITestGenerator();

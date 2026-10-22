import { expect, test } from '@playwright/test';

test.describe('Sonnetra homepage and transcript form', () => {
  test('loads the real homepage and does not display fabricated transcript preview content', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Sonnetra/i);
    await expect(page.getByRole('heading', { name: /Turn YouTube videos into useful transcripts/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /YouTube URL/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Get Transcript/i })).toBeVisible();

    await expect(page.locator('body')).not.toContainText('Transcript workspace preview');
    await expect(page.locator('body')).not.toContainText('watch?v=example');
    await expect(page.locator('body')).not.toContainText('Live');
  });

  test('rejects unsupported URLs before submission', async ({ page }) => {
    await page.route('**/api/transcripts', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: { message: 'Only secure YouTube URLs are supported.' },
        }),
      });
    });

    await page.goto('/');

    const input = page.getByRole('textbox', { name: /YouTube URL/i });
    await input.fill('https://example.com/watch?v=abc123');
    await page.getByRole('button', { name: /Get Transcript/i }).click();

    await expect(page.getByText('Only secure YouTube URLs are supported.')).toBeVisible();
  });

  test('renders a deterministic transcript fixture without showing fake production status', async ({ page }) => {
    await page.route('**/api/transcripts', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              job: {
                id: 'job-123',
                status: 'queued',
                videoId: 'abc123xyz90',
                sourceUrl: 'https://www.youtube.com/watch?v=abc123xyz90',
              },
              accessToken: 'token-123',
            },
          }),
        });
        return;
      }
      await route.continue();
    });

    await page.route('**/api/transcripts/job-123', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            job: {
              id: 'job-123',
              status: 'completed',
              videoId: 'abc123xyz90',
              sourceUrl: 'https://www.youtube.com/watch?v=abc123xyz90',
            },
            transcript: {
              language: { code: 'am', name: 'Amharic' },
              metadata: { videoId: 'abc123xyz90', canonicalUrl: 'https://www.youtube.com/watch?v=abc123xyz90' },
              segments: [
                { index: 0, startMs: 0, endMs: 1500, text: 'ደስ በላሽ እንግዶች' },
                { index: 1, startMs: 1500, endMs: 3500, text: 'ይህ ትርጉም አስፈላጊ ነው።' },
              ],
            },
          },
        }),
      });
    });

    await page.goto('/');
    await page.getByRole('textbox', { name: /YouTube URL/i }).fill('https://www.youtube.com/watch?v=abc123xyz90');
    await page.getByRole('button', { name: /Get Transcript/i }).click();

    await expect(page.getByText('Transcript available')).toBeVisible();
    await expect(page.getByRole('heading', { name: /^am$/i, exact: true })).toBeVisible();
    await expect(page.getByText('ደስ በላሽ እንግዶች')).toBeVisible();
    await expect(page.getByRole('button', { name: /Copy all/i })).toBeVisible();
    await expect(page.locator('body')).not.toContainText('Transcript workspace preview');
  });
});

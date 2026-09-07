import { chromium } from 'playwright';

// Usa os cookies da sua própria sessão (auth_token + ct0) em vez de logar
// toda vez com usuário/senha - mais estável e evita disparar alertas de login.
export async function scrapeAccount(username, maxTweets = 5) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    storageState: {
      cookies: [
        {
          name: 'auth_token',
          value: process.env.TWITTER_AUTH_TOKEN,
          domain: '.x.com',
          path: '/',
          httpOnly: true,
          secure: true,
          sameSite: 'None',
        },
        {
          name: 'ct0',
          value: process.env.TWITTER_CT0,
          domain: '.x.com',
          path: '/',
          httpOnly: false,
          secure: true,
          sameSite: 'Lax',
        },
      ],
      origins: [],
    },
  });

  const page = await context.newPage();
  await page.goto(`https://x.com/${username}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000 + Math.random() * 2000);
  await page.mouse.wheel(0, 1500);
  await page.waitForTimeout(1500 + Math.random() * 1500);

  const tweets = await page.evaluate(() => {
    const articles = Array.from(document.querySelectorAll('article'));
    return articles.map(article => {
      const link = article.querySelector('a[href*="/status/"]');
      const textEl = article.querySelector('[data-testid="tweetText"]');
      const timeEl = article.querySelector('time');
      return {
        id: link ? link.href.split('/status/')[1]?.split('?')[0] : null,
        url: link ? link.href : null,
        text: textEl ? textEl.innerText : '',
        timestamp: timeEl ? timeEl.getAttribute('datetime') : null,
      };
    }).filter(t => t.id && t.text);
  });

  await browser.close();
  return tweets.slice(0, maxTweets);
}

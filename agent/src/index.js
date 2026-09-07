import 'dotenv/config';
import cron from 'node-cron';
import { ACCOUNTS_TO_MONITOR, MAX_TWEETS_PER_ACCOUNT } from './config.js';
import { scrapeAccount } from './twitterScraper.js';
import { getLastSeen, setLastSeen } from './state.js';
import { draftArticle } from './claudeSummarizer.js';
import { askApproval } from './telegramBot.js';

async function runCheck() {
  console.log(`[${new Date().toISOString()}] Verificando contas...`);
  for (const account of ACCOUNTS_TO_MONITOR) {
    try {
      const tweets = await scrapeAccount(account, MAX_TWEETS_PER_ACCOUNT);
      const lastSeen = getLastSeen(account);
      const newTweets = lastSeen
        ? tweets.filter(t => t.id > lastSeen)
        : tweets.slice(0, 1); // primeira vez: só o mais recente, pra não inundar

      for (const tweet of newTweets) {
        const article = await draftArticle(tweet, account);
        askApproval({ ...article, sourceUrl: tweet.url, sourceAuthor: account });
      }

      if (tweets[0]) setLastSeen(account, tweets[0].id);
    } catch (err) {
      console.error(`Erro ao processar @${account}:`, err.message);
    }
    await new Promise(r => setTimeout(r, 5000 + Math.random() * 5000));
  }
}

const interval = process.env.POLL_INTERVAL_MINUTES || 30;
cron.schedule(`*/${interval} * * * *`, runCheck);

console.log(`Agente iniciado. Verificando a cada ${interval} minutos.`);
runCheck();

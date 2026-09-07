import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function draftArticle(tweet, author) {
  const msg = await client.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 700,
    messages: [{
      role: 'user',
      content: `Você é editor de um blog de notícias. Com base no conteúdo abaixo (de um post no X de @${author}), escreva uma matéria curta em português, em SUAS PRÓPRIAS PALAVRAS (não copie frases do post), com:
- Um título curto e direto (máx 12 palavras)
- 2 a 3 parágrafos de corpo contextualizando a notícia

Responda em JSON puro, sem markdown, no formato: {"title": "...", "body": "..."}

Conteúdo do post: """${tweet.text}"""`
    }],
  });
  const raw = msg.content.find(c => c.type === 'text')?.text || '{}';
  const cleaned = raw.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}

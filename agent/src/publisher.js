import { Octokit } from '@octokit/rest';

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const VALID_COUNTRIES = ['brasil', 'eua', 'russia', 'china', 'israel', 'ucrania', 'alemanha'];

function slugify(title) {
  return title.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// Cria o arquivo do post direto no repositório do GitHub via API.
// Isso dispara automaticamente um novo build/deploy do blog no GitHub Pages.
export async function publishPost({ title, body, sourceUrl, sourceAuthor, country }) {
  if (!VALID_COUNTRIES.includes(country)) {
    throw new Error(`País inválido: "${country}". Use um de: ${VALID_COUNTRIES.join(', ')}`);
  }

  const slug = `${slugify(title)}-${Date.now()}`;
  const pubDate = new Date().toISOString().split('T')[0];
  const content = `---\ntitle: "${title.replace(/"/g, '\\"')}"\ndescription: "${body.slice(0, 140).replace(/"/g, '\\"')}"\npubDate: ${pubDate}\ncountry: ${country}\nsourceUrl: "${sourceUrl}"\nsourceAuthor: "${sourceAuthor}"\n---\n\n${body}\n`;

  await octokit.repos.createOrUpdateFileContents({
    owner: process.env.GITHUB_OWNER,
    repo: process.env.GITHUB_REPO,
    path: `blog/src/content/posts/${slug}.md`,
    message: `Novo post: ${title}`,
    content: Buffer.from(content).toString('base64'),
    branch: process.env.GITHUB_BRANCH || 'main',
  });

  return slug;
}

# Seu blog de notícias automatizado

O que este pacote faz: um agente lê posts de contas do X (Twitter) que você
escolher, escreve uma matéria com IA, te manda no Telegram pra você aprovar
com um botão, e — se aprovado — publica sozinho no seu blog.

Nenhum passo abaixo usa terminal. É tudo clicando em sites.

---

## Passo 1 — Colocar o código no GitHub

1. Crie uma conta em https://github.com (grátis).
2. Clique em **New repository**. Dê um nome, ex: `meu-blog-noticias`. Marque
   como **Private**. Clique em **Create repository**.
3. Na página do repositório, clique em **uploading an existing file** (ou
   **Add file > Upload files**).
4. Arraste TODAS as pastas e arquivos deste pacote (`blog/`, `agent/`,
   este `README.md`) pra dentro da janela do navegador.
5. Clique em **Commit changes**.

## Passo 2 — Publicar o blog (GitHub Pages, grátis, sem sair do GitHub)

1. No arquivo `blog/astro.config.mjs`, edite direto pelo GitHub (ícone de
   lápis) e troque `SEU-USUARIO` pelo seu nome de usuário do GitHub e
   `NOME-DO-REPOSITORIO` pelo nome do repositório que você criou no Passo 1.
   Salve (Commit changes).
2. Vá em **Settings** do repositório → **Pages** (no menu lateral).
3. Em **Build and deployment > Source**, escolha **GitHub Actions**.
4. Pronto. A cada novo post publicado (seja por mim aqui na conversa, seja
   pelo agente automático), o GitHub já builda e publica sozinho — você
   acompanha o progresso na aba **Actions** do repositório.
5. Em alguns minutos o blog estará em
   `https://seu-usuario.github.io/nome-do-repositorio/`. Dá pra ligar um
   domínio próprio depois, na mesma aba **Pages** (campo **Custom domain**),
   sem custo adicional.

## Passo 3 — Pegar os cookies da sua conta do X

Isso permite que o agente "entre" no X como você, sem guardar sua senha em
lugar nenhum.

1. Abra https://x.com no Chrome e faça login normalmente.
2. Aperte **F12** para abrir o DevTools.
3. Vá na aba **Application** (ou **Aplicativo**) → **Cookies** → clique em
   `https://x.com`.
4. Procure a linha `auth_token` e copie o valor da coluna **Value**.
5. Procure a linha `ct0` e copie o valor também.
6. Guarde os dois valores — vai usá-los no Passo 6.

⚠️ Nunca digite sua senha em nenhum script ou arquivo. Só esses dois
cookies são necessários.

## Passo 4 — Criar o bot no Telegram

1. No Telegram, procure por **@BotFather** e inicie uma conversa.
2. Envie `/newbot`, escolha um nome e um username (precisa terminar em
   `bot`, ex: `meublognoticias_bot`).
3. O BotFather te dá um **token** (uma sequência tipo
   `123456:ABC-DEF...`). Guarde.
4. Agora procure por **@userinfobot** no Telegram, envie `/start`, e ele
   te devolve seu **Chat ID** (um número). Guarde também.
5. Envie qualquer mensagem para o SEU bot (o que você criou) uma vez, pra
   "ativar" a conversa.

## Passo 5 — Pegar a chave da API da Anthropic

1. Acesse https://console.anthropic.com, crie uma conta/faça login.
2. Vá em **API Keys** e crie uma nova chave.
3. Adicione um cartão em **Billing** (cobra por uso — pra este agente,
   o gasto é baixo, poucos centavos por matéria escrita).

## Passo 6 — Gerar o token do GitHub (pra publicar os posts)

1. No GitHub, vá em **Settings** (do seu perfil, não do repositório) →
   **Developer settings** → **Personal access tokens** → **Tokens
   (classic)**.
2. **Generate new token (classic)**. Marque a permissão **repo** (completa).
3. Copie o token gerado (só aparece uma vez).

## Passo 7 — Colocar o agente pra rodar 24h (Render, grátis/baixo custo)

1. Crie conta em https://render.com com GitHub.
2. Clique em **New > Background Worker**.
3. Conecte o mesmo repositório do Passo 1.
4. Em **Root Directory**, coloque `agent`.
5. **Build Command**: `npm install && npx playwright install --with-deps chromium`
6. **Start Command**: `npm start`
7. Na seção **Environment**, adicione uma variável para cada linha do
   arquivo `agent/.env.example`, preenchendo com os valores que você
   guardou nos passos 3, 4, 5 e 6:
   - `TWITTER_AUTH_TOKEN`, `TWITTER_CT0` (passo 3)
   - `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` (passo 4)
   - `ANTHROPIC_API_KEY` (passo 5)
   - `GITHUB_TOKEN`, `GITHUB_OWNER` (seu usuário do GitHub), `GITHUB_REPO`
     (nome do repositório), `GITHUB_BRANCH` (`main`) (passo 6 e 1)
   - `POLL_INTERVAL_MINUTES` (ex: `30`)
8. Clique em **Deploy**.

Pronto. O agente começa a rodar e, quando encontrar um post novo nas contas
monitoradas, vai te mandar no Telegram com os botões de aprovar/rejeitar.

## Escolher quais contas monitorar

No GitHub, abra o arquivo `agent/src/config.js`, clique no lápis (editar),
e troque a lista `ACCOUNTS_TO_MONITOR` pelos usuários do X que você quer
acompanhar (sem o @). Salve (commit) — o Render atualiza sozinho.

## Limitações a saber

- **Sessão do X pode expirar de tempos em tempos** — se o agente parar de
  achar posts, repita o Passo 3 e atualize os dois cookies no Render.
- **O X muda o layout do site algumas vezes por ano** — se isso quebrar a
  leitura dos posts, me avise nesta conversa que eu ajusto o código.
- **Fila de aprovação fica na memória do agente** — se o serviço reiniciar
  no Render antes de você responder, aquele botão específico expira (o
  próximo ciclo de verificação não vai reenviar o mesmo post, então nada
  se perde de vista, mas convém aprovar/rejeitar no mesmo dia).

import fs from 'fs';
const STATE_FILE = new URL('../state.json', import.meta.url);

function load() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
  } catch {
    return { lastSeen: {} };
  }
}

function save(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

export function getLastSeen(account) {
  return load().lastSeen[account] || null;
}

export function setLastSeen(account, tweetId) {
  const state = load();
  state.lastSeen[account] = tweetId;
  save(state);
}

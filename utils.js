export const STORAGE_PREFIX = 'efootball-tms-demo';

export function getDemoData(key, fallback = null) {
  const raw = localStorage.getItem(`${STORAGE_PREFIX}:${key}`);
  if (!raw) return fallback;
  try { return JSON.parse(raw); } catch { return fallback; }
}

export function saveDemoData(key, value) {
  localStorage.setItem(`${STORAGE_PREFIX}:${key}`, JSON.stringify(value));
}

export function ensureDemoData() {
  const existing = getDemoData('seeded', false);
  if (existing) return;

  const clubs = [
    { id: 'rm', name: 'Real Madrid', league: 'La Liga', category: 'uefa', logo: '⚪', rating: 5, isLocked: false, playerId: null },
    { id: 'bar', name: 'Barcelona', league: 'La Liga', category: 'uefa', logo: '🔵', rating: 5, isLocked: false, playerId: null },
    { id: 'mci', name: 'Manchester City', league: 'Premier League', category: 'uefa', logo: '🟢', rating: 5, isLocked: false, playerId: null },
    { id: 'ars', name: 'Arsenal', league: 'Premier League', category: 'uefa', logo: '🟠', rating: 4, isLocked: false, playerId: null },
    { id: 'liv', name: 'Liverpool', league: 'Premier League', category: 'uefa', logo: '🔴', rating: 4, isLocked: false, playerId: null },
    { id: 'che', name: 'Chelsea', league: 'Premier League', category: 'uefa', logo: '🔵', rating: 4, isLocked: false, playerId: null },
    { id: 'psg', name: 'PSG', league: 'Ligue 1', category: 'uefa', logo: '🔵', rating: 4, isLocked: false, playerId: null },
    { id: 'bmu', name: 'Bayern Munich', league: 'Bundesliga', category: 'uefa', logo: '🔴', rating: 5, isLocked: false, playerId: null },
    { id: 'nap', name: 'Napoli', league: 'Serie A', category: 'other', logo: '🔵', rating: 4, isLocked: false, playerId: null },
    { id: 'tot', name: 'Tottenham', league: 'Premier League', category: 'other', logo: '⚪', rating: 4, isLocked: false, playerId: null },
    { id: 'new', name: 'Newcastle', league: 'Premier League', category: 'other', logo: '⚫', rating: 4, isLocked: false, playerId: null },
    { id: 'sev', name: 'Sevilla', league: 'La Liga', category: 'other', logo: '⚪', rating: 4, isLocked: false, playerId: null }
  ];

  const users = [
    {
      id: 'demo-player',
      fullName: 'Amina Yusuf',
      whatsapp: '+255712345678',
      efootballUsername: 'AminaX',
      email: 'amina@example.com',
      password: 'demo123',
      club: 'Real Madrid',
      wins: 7,
      draws: 2,
      losses: 1,
      goalsFor: 18,
      goalsAgainst: 8,
      tournamentWins: 1,
      fairPlayPoints: 3,
      createdAt: new Date().toISOString(),
      role: 'user',
      profilePhoto: ''
    }
  ];

  const tournaments = [
    {
      id: 'season-1',
      name: 'Spring Championship 2026',
      type: 'League',
      status: 'Live',
      startDate: '2026-07-15',
      teams: ['Real Madrid', 'Barcelona', 'Manchester City', 'Arsenal'],
      standings: [
        { team: 'Real Madrid', wins: 2, draws: 0, losses: 0, goalsFor: 5, goalsAgainst: 1, points: 6 },
        { team: 'Manchester City', wins: 1, draws: 0, losses: 1, goalsFor: 3, goalsAgainst: 2, points: 3 },
        { team: 'Barcelona', wins: 0, draws: 1, losses: 1, goalsFor: 2, goalsAgainst: 4, points: 1 },
        { team: 'Arsenal', wins: 0, draws: 1, losses: 1, goalsFor: 1, goalsAgainst: 4, points: 1 }
      ],
      fixtures: [
        { homeTeam: 'Real Madrid', awayTeam: 'Barcelona', date: '2026-07-15', status: 'Played', score: '2-1' },
        { homeTeam: 'Manchester City', awayTeam: 'Arsenal', date: '2026-07-16', status: 'Scheduled', score: '' }
      ]
    }
  ];

  saveDemoData('seeded', true);
  saveDemoData('clubs', clubs);
  saveDemoData('users', users);
  saveDemoData('tournaments', tournaments);
  saveDemoData('messages', [
    { id: crypto.randomUUID(), text: 'Welcome to the season!', userName: 'Admin', createdAt: new Date().toISOString(), role: 'admin' }
  ]);
  saveDemoData('announcements', [{ id: crypto.randomUUID(), title: 'Season kickoff', body: 'Registration is open for all players.', createdAt: new Date().toISOString() }]);
  saveDemoData('notifications', [{ id: crypto.randomUUID(), title: 'New tournament', body: 'Spring Championship 2026 is live.', createdAt: new Date().toISOString() }]);
  saveDemoData('matches', []);
  saveDemoData('settings', { theme: 'dark', language: 'en' });
}

export function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function readCurrentUser() {
  return getDemoData('currentUser', null);
}

export function saveCurrentUser(user) {
  saveDemoData('currentUser', user);
}

export function clearCurrentUser() {
  localStorage.removeItem(`${STORAGE_PREFIX}:currentUser`);
}

export async function showToast(title, text, icon = 'success') {
  if (window.Swal) {
    await window.Swal.fire({ title, text, icon, timer: 1800, showConfirmButton: false });
  } else {
    console.log(title, text);
  }
}

export function initTheme() {
  const stored = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', stored);
  document.querySelectorAll('.theme-toggle').forEach((button) => {
    const icon = button.querySelector('i');
    if (icon) icon.className = stored === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
  });
}

export function bindThemeToggle() {
  document.querySelectorAll('.theme-toggle').forEach((button) => {
    button.addEventListener('click', () => {
      const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      const icon = button.querySelector('i');
      if (icon) icon.className = next === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
    });
  });
}

export function calculateGoalDifference(goalsFor, goalsAgainst) {
  return goalsFor - goalsAgainst;
}

export function slugify(value) {
  return String(value).toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

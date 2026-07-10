import { CLUBS, getClubCategoryLabel } from './clubs.js';
import { generateFixtures, getStandings } from './tournament.js';
import { createChatMessage } from './chat.js';
import { addNotification } from './notifications.js';
import { ensureDemoData, getDemoData, saveDemoData, readCurrentUser, saveCurrentUser, clearCurrentUser, showToast, formatDate, formatTime, initTheme, bindThemeToggle, calculateGoalDifference, slugify } from './utils.js';
import { auth, db, storage, isDemoMode } from './firebase-config.js';

const page = document.body?.dataset?.page;

function bootstrap() {
  ensureDemoData();
  initTheme();
  bindThemeToggle();
  if (window.AOS) window.AOS.init();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch((error) => console.warn('Service worker registration failed', error));
  }
  document.getElementById('year')?.replaceChildren(new Date().getFullYear());

  if (page === 'home') {
    renderHome();
  }

  if (page === 'register') {
    attachRegisterFlow();
  }

  if (page === 'login') {
    attachLoginFlow();
  }

  if (page === 'dashboard') {
    attachDashboardFlow();
  }

  if (page === 'admin') {
    attachAdminFlow();
  }
}

function renderHome() {
  const leaderboardPreview = document.getElementById('leaderboardPreview');
  const leaderboard = getDemoData('users', [])
    .slice()
    .sort((a, b) => b.tournamentWins - a.tournamentWins || b.wins - a.wins || b.goalsFor - a.goalsFor)
    .slice(0, 6);

  if (leaderboardPreview) {
    leaderboardPreview.innerHTML = leaderboard.map((player) => `
      <article class="leaderboard-item">
        <div>
          <strong>${player.fullName}</strong>
          <div class="muted">${player.efootballUsername} · ${player.club || 'No club'}</div>
        </div>
        <span class="badge">${player.tournamentWins} wins</span>
      </article>
    `).join('');
  }

  const heroPlayers = document.getElementById('heroPlayers');
  if (heroPlayers) heroPlayers.textContent = getDemoData('users', []).length;

  const heroCountdown = document.getElementById('heroCountdown');
  if (heroCountdown) {
    const startDate = new Date('2026-07-15T18:00:00');
    const tick = () => {
      const diff = startDate - new Date();
      const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
      const hours = Math.max(0, Math.floor((diff / (1000 * 60 * 60)) % 24));
      const minutes = Math.max(0, Math.floor((diff / (1000 * 60)) % 60));
      const seconds = Math.max(0, Math.floor((diff / 1000) % 60));
      heroCountdown.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    };
    tick();
    setInterval(tick, 1000);
  }
}

function attachRegisterFlow() {
  const form = document.getElementById('registerForm');
  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const fullName = String(data.get('fullName') || '').trim();
    const whatsapp = String(data.get('whatsapp') || '').trim();
    const efootballUsername = String(data.get('efootballUsername') || '').trim();
    const email = String(data.get('email') || '').trim();
    const password = String(data.get('password') || '');
    const confirmPassword = String(data.get('confirmPassword') || '');

    if (!/^[+][0-9]{8,15}$/.test(whatsapp)) {
      await showToast('Invalid number', 'Use a valid WhatsApp number with country code.', 'warning');
      return;
    }
    if (password.length < 6) {
      await showToast('Weak password', 'Use at least 6 characters.', 'warning');
      return;
    }
    if (password !== confirmPassword) {
      await showToast('Passwords do not match', 'Please confirm your password.', 'warning');
      return;
    }

    if (isDemoMode) {
      const users = getDemoData('users', []);
      const exists = users.some((user) => user.email === email || user.efootballUsername === efootballUsername);
      if (exists) {
        await showToast('User already exists', 'Choose another email or username.', 'warning');
        return;
      }
      const user = {
        id: crypto.randomUUID(),
        fullName,
        whatsapp,
        efootballUsername,
        email,
        password,
        club: '',
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        tournamentWins: 0,
        fairPlayPoints: 0,
        createdAt: new Date().toISOString(),
        role: 'user',
        profilePhoto: ''
      };
      users.push(user);
      saveDemoData('users', users);
      saveCurrentUser(user);
      await showToast('Registration complete', 'You can now login to your dashboard.', 'success');
      window.location.href = './login.html';
      return;
    }

    try {
      const credential = await auth.createUserWithEmailAndPassword(email || `${efootballUsername}@example.com`, password);
      const userDoc = {
        id: credential.user.uid,
        fullName,
        whatsapp,
        efootballUsername,
        email: credential.user.email || email,
        club: '',
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        tournamentWins: 0,
        fairPlayPoints: 0,
        createdAt: new Date().toISOString(),
        role: 'user',
        profilePhoto: ''
      };
      await db.collection('users').doc(credential.user.uid).set(userDoc);
      await showToast('Registration complete', 'You can now login.', 'success');
      window.location.href = './login.html';
    } catch (error) {
      await showToast('Registration failed', error.message, 'error');
    }
  });
}

function attachLoginFlow() {
  const form = document.getElementById('loginForm');
  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const email = String(data.get('email') || '').trim();
    const password = String(data.get('password') || '');

    const users = getDemoData('users', []);
    const demoUser = users.find((entry) => entry.email === email && entry.password === password);

    if (demoUser) {
      saveCurrentUser(demoUser);
      await showToast('Welcome back', `Hello ${demoUser.fullName}`, 'success');
      window.location.href = './dashboard.html';
      return;
    }

    try {
      const credential = await auth.signInWithEmailAndPassword(email, password);
      const snapshot = await db.collection('users').doc(credential.user.uid).get();
      saveCurrentUser(snapshot.data());
      await showToast('Welcome back', 'Redirecting to your dashboard.', 'success');
      window.location.href = './dashboard.html';
    } catch (error) {
      await showToast('Login failed', error.message, 'error');
    }
  });
}

function attachDashboardFlow() {
  const currentUser = readCurrentUser();
  if (!currentUser) {
    window.location.href = './login.html';
    return;
  }

  document.getElementById('welcomeName').textContent = `Welcome back, ${currentUser.fullName}`;
  document.getElementById('currentSeason').textContent = 'Spring Championship 2026';
  const announcementText = document.getElementById('announcementText');
  const announcements = getDemoData('announcements', []);
  const dashboardNotifications = getDemoData('notifications', []);
  const latestAnnouncement = announcements[0] || dashboardNotifications[0];
  if (announcementText) announcementText.textContent = latestAnnouncement?.body || 'Registration is open!';

  const countdownDisplay = document.getElementById('countdownDisplay');
  const startDate = new Date('2026-07-15T18:00:00');
  const tick = () => {
    const diff = startDate - new Date();
    const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
    const hours = Math.max(0, Math.floor((diff / (1000 * 60 * 60)) % 24));
    const minutes = Math.max(0, Math.floor((diff / (1000 * 60)) % 60));
    const seconds = Math.max(0, Math.floor((diff / 1000) % 60));
    if (countdownDisplay) countdownDisplay.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };
  tick();
  setInterval(tick, 1000);

  document.getElementById('onlinePlayers').textContent = '12';

  const newsList = document.getElementById('newsList');
  const news = [
    'New matchmaking sessions available this week.',
    'Club selection closes on Friday.',
    'Two new tournaments are scheduled.'
  ];
  if (newsList) newsList.innerHTML = news.map((item) => `<li class="list-item">${item}</li>`).join('');

  const notificationList = document.getElementById('notificationList');
  const notifications = getDemoData('notifications', []);
  if (notificationList) notificationList.innerHTML = notifications.map((item) => `<li class="list-item"><strong>${item.title}</strong><div class="muted">${item.body}</div></li>`).join('');

  renderClubSelection(currentUser);
  renderTournaments();
  renderChat();
  renderLeaderboard();
  renderProfile(currentUser);
  renderMatchHistory(currentUser);
  bindDashboardEvents(currentUser);
}

function renderClubSelection(currentUser) {
  const container = document.getElementById('clubContainer');
  if (!container) return;

  const clubs = getDemoData('clubs', CLUBS);
  const grouped = clubs.reduce((acc, club) => {
    acc[club.category || 'other'] = acc[club.category || 'other'] || [];
    acc[club.category || 'other'].push(club);
    return acc;
  }, {});

  container.innerHTML = Object.entries(grouped).map(([category, items]) => `
    <div>
      <h3>${getClubCategoryLabel(category)}</h3>
      <div class="club-grid">
        ${items.map((club) => {
          const selected = currentUser.club === club.name;
          const taken = Boolean(club.playerId && club.playerId !== currentUser.id);
          const disabled = taken || club.isLocked;
          return `
            <button class="club-card ${disabled ? 'locked' : ''}" data-club-id="${club.id}" ${disabled ? 'disabled' : ''}>
              <div class="club-logo">${club.logo.startsWith('http') ? `<img src="${club.logo}" alt="${club.name} logo" />` : club.logo}</div>
              <div><strong>${club.name}</strong></div>
              <div class="muted">${club.league}</div>
              <div class="rating">${'★'.repeat(club.rating)}</div>
              <div class="badge ${selected ? 'success' : ''}">${selected ? 'Selected' : disabled ? 'Unavailable' : 'Available'}</div>
              ${taken ? '<div class="muted">Club already selected by another player.</div>' : ''}
            </button>`;
        }).join('')}
      </div>
    </div>
  `).join('');
}

function renderTournaments() {
  const container = document.getElementById('tournamentContainer');
  if (!container) return;
  const tournaments = getDemoData('tournaments', []);
  container.innerHTML = tournaments.map((tournament) => `
    <div class="list-item">
      <div>
        <strong>${tournament.name}</strong>
        <div class="muted">${tournament.type} · ${tournament.status}</div>
      </div>
      <span class="badge">${tournament.teams?.length || 0} teams</span>
    </div>
  `).join('');
}

function renderChat() {
  const messagesBox = document.getElementById('chatMessages');
  if (!messagesBox) return;
  const messages = getDemoData('messages', []);
  messagesBox.innerHTML = messages.map((message) => `
    <div class="chat-bubble ${message.userName === 'You' ? 'mine' : ''}">
      <strong>${message.userName}</strong>
      <div>${message.text}</div>
      <div class="muted">${formatTime(message.createdAt)}</div>
    </div>
  `).join('');
  messagesBox.scrollTop = messagesBox.scrollHeight;
}

function renderLeaderboard() {
  const leaderboardList = document.getElementById('leaderboardList');
  if (!leaderboardList) return;
  const players = getDemoData('users', [])
    .slice()
    .sort((a, b) => b.tournamentWins - a.tournamentWins || b.wins - a.wins || b.goalsFor - a.goalsFor)
    .slice(0, 10);
  leaderboardList.innerHTML = players.map((player, index) => `
    <div class="list-item">
      <div><strong>#${index + 1} ${player.fullName}</strong><div class="muted">${player.club || 'No club'} · ${player.efootballUsername}</div></div>
      <span class="badge">${player.tournamentWins} wins</span>
    </div>
  `).join('');
}

function renderProfile(currentUser) {
  const profileCard = document.getElementById('profileCard');
  if (!profileCard) return;
  profileCard.innerHTML = `
    <div class="avatar">${(currentUser.fullName || 'P').charAt(0).toUpperCase()}</div>
    <div>
      <h3>${currentUser.fullName}</h3>
      <div class="muted">${currentUser.whatsapp}</div>
      <div class="muted">${currentUser.efootballUsername}</div>
      <div class="muted">Club: ${currentUser.club || 'Not selected'}</div>
      <div class="muted">Wins: ${currentUser.wins} · Draws: ${currentUser.draws} · Losses: ${currentUser.losses}</div>
    </div>
  `;
}

function renderMatchHistory(currentUser) {
  const container = document.getElementById('matchHistory');
  if (!container) return;
  const matches = getDemoData('matches', []);
  const userMatches = matches.filter((match) => match.playerId === currentUser.id);
  container.innerHTML = userMatches.length ? userMatches.map((match) => `
    <div class="list-item"><div><strong>${match.homeTeam} vs ${match.awayTeam}</strong><div class="muted">${match.score} · ${formatDate(match.matchDate)}</div></div><span class="badge">${match.status}</span></div>
  `).join('') : '<div class="muted">No matches submitted yet.</div>';
}

function bindDashboardEvents(currentUser) {
  document.getElementById('logoutBtn')?.addEventListener('click', async (event) => {
    event.preventDefault();
    clearCurrentUser();
    await showToast('Logged out', 'See you next time.', 'success');
    window.location.href = './login.html';
  });

  document.querySelectorAll('[data-club-id]').forEach((button) => {
    button.addEventListener('click', async () => {
      const clubs = getDemoData('clubs', CLUBS);
      const selectedClub = clubs.find((club) => club.id === button.dataset.clubId);
      if (!selectedClub) return;
      if (selectedClub.playerId && selectedClub.playerId !== currentUser.id) {
        await showToast('Club unavailable', 'Club already selected by another player.', 'warning');
        return;
      }
      const users = getDemoData('users', []);
      const me = users.find((entry) => entry.id === currentUser.id);
      if (!me) return;
      const previousClub = clubs.find((club) => club.name === me.club);
      if (previousClub) previousClub.playerId = null;
      selectedClub.playerId = currentUser.id;
      me.club = selectedClub.name;
      saveDemoData('clubs', clubs);
      saveDemoData('users', users);
      saveCurrentUser(me);
      renderClubSelection(me);
      renderProfile(me);
      renderLeaderboard();
      await showToast('Club selected', `${selectedClub.name} is now your club.`, 'success');
    });
  });

  const matchResultForm = document.getElementById('matchResultForm');
  matchResultForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(matchResultForm);
    const match = {
      id: crypto.randomUUID(),
      playerId: currentUser.id,
      homeTeam: String(data.get('homeTeam') || '').trim(),
      awayTeam: String(data.get('awayTeam') || '').trim(),
      score: String(data.get('score') || '').trim(),
      matchDate: String(data.get('matchDate') || '').trim(),
      status: 'Pending Approval',
      screenshot: ''
    };
    const matches = getDemoData('matches', []);
    matches.push(match);
    saveDemoData('matches', matches);
    renderMatchHistory(currentUser);
    await showToast('Result submitted', 'Admin will approve it shortly.', 'success');
    matchResultForm.reset();
  });

  const chatForm = document.getElementById('chatForm');
  chatForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(chatForm);
    const text = String(data.get('message') || '').trim();
    if (!text) return;
    const messages = getDemoData('messages', []);
    messages.push(createChatMessage(text, 'You', true));
    saveDemoData('messages', messages);
    renderChat();
    chatForm.reset();
  });

  const profileUpload = document.getElementById('profileUpload');
  profileUpload?.addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const users = getDemoData('users', []);
    const me = users.find((entry) => entry.id === currentUser.id);
    if (!me) return;
    me.profilePhoto = URL.createObjectURL(file);
    saveDemoData('users', users);
    saveCurrentUser(me);
    renderProfile(me);
    await showToast('Profile photo updated', 'Your avatar has been refreshed.', 'success');
  });
}

function attachAdminFlow() {
  const adminAuthCard = document.getElementById('adminAuthCard');
  const adminPortal = document.getElementById('adminPortal');
  const currentUser = readCurrentUser();

  if (!currentUser || currentUser.role !== 'admin') {
    adminAuthCard?.classList.remove('hidden');
    adminPortal?.classList.add('hidden');
    bindAdminLogin();
    return;
  }

  adminAuthCard?.classList.add('hidden');
  adminPortal?.classList.remove('hidden');
  renderAdminPlayers();
  renderAdminClubs();
  renderAdminTournaments();
  renderAnnouncements();
  renderAnalytics();
  bindAdminEvents();
}

function bindAdminLogin() {
  const form = document.getElementById('adminLoginForm');
  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const email = String(data.get('adminEmail') || '').trim();
    const password = String(data.get('adminPassword') || '');

    if (email === 'walter@gmail.com' && password === 'w1!a2@l3#') {
      const adminUser = { id: 'admin-demo', fullName: 'Admin', email, role: 'admin', club: '', whatsapp: '+255700000000', efootballUsername: 'Admin', wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, tournamentWins: 0, fairPlayPoints: 0, createdAt: new Date().toISOString(), profilePhoto: '' };
      saveCurrentUser(adminUser);
      await showToast('Admin access granted', 'Welcome to the operations center.', 'success');
      window.location.reload();
      return;
    }

    if (isDemoMode) {
      await showToast('Access denied', 'Use the demo admin credentials.', 'error');
      return;
    }

    try {
      const credential = await auth.signInWithEmailAndPassword(email, password);
      const snapshot = await db.collection('admins').doc(credential.user.uid).get();
      if (!snapshot.exists) {
        throw new Error('Admin account not found');
      }
      saveCurrentUser(snapshot.data());
      await showToast('Admin access granted', 'Welcome to the operations center.', 'success');
      window.location.reload();
    } catch (error) {
      await showToast('Access denied', error.message, 'error');
    }
  });
}

function renderAdminPlayers() {
  const container = document.getElementById('playerTable');
  if (!container) return;
  const players = getDemoData('users', []);
  container.innerHTML = `
    <table>
      <thead><tr><th>Name</th><th>Email</th><th>WhatsApp</th><th>Club</th><th>Username</th><th>Wins</th><th>Actions</th></tr></thead>
      <tbody>
        ${players.map((player) => `
          <tr>
            <td>${player.fullName}</td>
            <td>${player.email || '—'}</td>
            <td>${player.whatsapp || '—'}</td>
            <td>${player.club || '—'}</td>
            <td>${player.efootballUsername}</td>
            <td>${player.wins}</td>
            <td><button class="btn btn-secondary player-detail-button" data-player-id="${player.id}">Details</button></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  attachAdminPlayerDetails();
}

function attachAdminPlayerDetails() {
  const buttons = document.querySelectorAll('.player-detail-button');
  buttons.forEach((button) => {
    button.onclick = () => {
      const playerId = button.dataset.playerId;
      const player = getDemoData('users', []).find((item) => item.id === playerId);
      if (!player) return;
      const details = `
        <p><strong>Name:</strong> ${player.fullName}</p>
        <p><strong>Email:</strong> ${player.email || '—'}</p>
        <p><strong>WhatsApp:</strong> ${player.whatsapp || '—'}</p>
        <p><strong>Username:</strong> ${player.efootballUsername}</p>
        <p><strong>Club:</strong> ${player.club || '—'}</p>
        <p><strong>Wins:</strong> ${player.wins}</p>
        <p><strong>Draws:</strong> ${player.draws}</p>
        <p><strong>Losses:</strong> ${player.losses}</p>
      `;
      if (window.Swal) {
        window.Swal.fire({ title: 'Player details', html: details, icon: 'info' });
      } else {
        window.alert(`Player details:\n\n${player.fullName}\n${player.email || '—'}\n${player.whatsapp || '—'}\n${player.efootballUsername}\n${player.club || '—'}`);
      }
    };
  });
}

function renderAdminClubs() {
  const container = document.getElementById('clubAdminList');
  if (!container) return;
  const clubs = getDemoData('clubs', CLUBS);
  container.innerHTML = clubs.map((club) => `
    <div class="club-card ${club.isLocked ? 'locked' : ''}">
      <div class="club-logo">${club.logo.startsWith('http') ? `<img src="${club.logo}" alt="${club.name} logo" />` : club.logo}</div>
      <strong>${club.name}</strong>
      <div class="muted">${club.league}</div>
      <div class="badge">${club.isLocked ? 'Locked' : 'Open'}</div>
    </div>
  `).join('');
}

function renderAdminTournaments() {
  const container = document.getElementById('adminTournamentList');
  if (!container) return;
  const tournaments = getDemoData('tournaments', []);
  container.innerHTML = tournaments.map((tournament) => `
    <div class="list-item">
      <div><strong>${tournament.name}</strong><div class="muted">${tournament.type} · ${tournament.status}</div></div>
      <button class="btn btn-secondary">Open</button>
    </div>
  `).join('');
}

function renderAnnouncements() {
  const container = document.getElementById('messageBoard');
  if (!container) return;
  const announcements = getDemoData('announcements', []);
  container.innerHTML = announcements.map((item) => `
    <div class="list-item">
      <div><strong>${item.title}</strong><div class="muted">${item.body}</div></div>
      <span class="badge">${formatDate(item.createdAt)}</span>
    </div>
  `).join('');
}

function renderAnalytics() {
  const canvas = document.getElementById('analyticsChart');
  if (!canvas || !window.Chart) return;
  const chart = new window.Chart(canvas, {
    type: 'bar',
    data: {
      labels: ['Players', 'Active', 'Clubs', 'Matches', 'Goals'],
      datasets: [{
        label: 'Season metrics',
        data: [getDemoData('users', []).length, 8, getDemoData('clubs', CLUBS).length, 12, 24],
        backgroundColor: ['#00d4ff', '#ff6b35', '#22c55e', '#f59e0b', '#a855f7']
      }]
    },
    options: { responsive: true, plugins: { legend: { display: false } } }
  });
  canvas.__chart = chart;
}

function bindAdminEvents() {
  document.getElementById('logoutBtn')?.addEventListener('click', async (event) => {
    event.preventDefault();
    clearCurrentUser();
    await showToast('Logged out', 'Admin session ended.', 'success');
    window.location.href = './login.html';
  });

  const clubForm = document.getElementById('clubForm');
  clubForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(clubForm);
    const clubs = getDemoData('clubs', CLUBS);
    clubs.push({
      id: slugify(String(data.get('clubName') || '')),
      name: String(data.get('clubName') || '').trim(),
      league: String(data.get('league') || '').trim(),
      category: 'other',
      logo: String(data.get('logo') || '⚽').trim(),
      rating: 4,
      isLocked: false,
      playerId: null
    });
    saveDemoData('clubs', clubs);
    renderAdminClubs();
    clubForm.reset();
    await showToast('Club added', 'The new club is available to players.', 'success');
  });

  const tournamentForm = document.getElementById('tournamentForm');
  tournamentForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(tournamentForm);
    const tournaments = getDemoData('tournaments', []);
    tournaments.push({
      id: crypto.randomUUID(),
      name: String(data.get('name') || '').trim(),
      type: String(data.get('type') || '').trim(),
      status: 'Upcoming',
      startDate: new Date().toISOString(),
      teams: ['Real Madrid', 'Barcelona', 'Manchester City', 'Arsenal'],
      standings: getStandings(['Real Madrid', 'Barcelona', 'Manchester City', 'Arsenal']),
      fixtures: generateFixtures(['Real Madrid', 'Barcelona', 'Manchester City', 'Arsenal'])
    });
    saveDemoData('tournaments', tournaments);
    renderAdminTournaments();
    tournamentForm.reset();
    await showToast('Tournament created', 'Fixtures have been generated.', 'success');
  });

  const announcementForm = document.getElementById('announcementForm');
  announcementForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(announcementForm);
    const title = String(data.get('title') || '').trim();
    const body = String(data.get('body') || '').trim();
    const announcement = {
      id: crypto.randomUUID(),
      title,
      body,
      createdAt: new Date().toISOString()
    };

    const announcements = getDemoData('announcements', []);
    announcements.unshift(announcement);
    saveDemoData('announcements', announcements);

    const notifications = getDemoData('notifications', []);
    notifications.unshift(announcement);
    saveDemoData('notifications', notifications);

    renderAnnouncements();
    announcementForm.reset();
    await showToast('Message broadcast', 'Players received the announcement.', 'success');
  });

  const searchBox = document.getElementById('playerSearch');
  searchBox?.addEventListener('input', (event) => {
    const query = String(event.target.value || '').toLowerCase();
    const container = document.getElementById('playerTable');
    if (!container) return;
    const players = getDemoData('users', []);
    const filtered = players.filter((player) => [player.fullName, player.email, player.whatsapp, player.club, player.efootballUsername].join(' ').toLowerCase().includes(query));
    container.innerHTML = `
      <table>
        <thead><tr><th>Name</th><th>Email</th><th>WhatsApp</th><th>Club</th><th>Username</th><th>Wins</th><th>Actions</th></tr></thead>
        <tbody>
          ${filtered.map((player) => `
            <tr>
              <td>${player.fullName}</td>
              <td>${player.email || '—'}</td>
              <td>${player.whatsapp || '—'}</td>
              <td>${player.club || '—'}</td>
              <td>${player.efootballUsername}</td>
              <td>${player.wins}</td>
              <td><button class="btn btn-secondary player-detail-button" data-player-id="${player.id}">Details</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    attachAdminPlayerDetails();
  });
}

bootstrap();

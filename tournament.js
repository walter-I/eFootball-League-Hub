export function generateFixtures(teams) {
  const shuffled = [...teams].sort(() => Math.random() - 0.5);
  return shuffled.map((team, index) => ({
    id: `${team}-${index}`,
    homeTeam: team,
    awayTeam: shuffled[(index + 1) % shuffled.length],
    date: new Date().toISOString(),
    status: 'Scheduled',
    score: ''
  }));
}

export function getStandings(teams) {
  return teams.map((team) => ({
    team,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    points: 0
  }));
}

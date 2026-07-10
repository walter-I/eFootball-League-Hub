export const CLUBS = [
  { id: 'rm', name: 'Real Madrid', league: 'La Liga', category: 'uefa', logo: 'https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg', rating: 5 },
  { id: 'bar', name: 'Barcelona', league: 'La Liga', category: 'uefa', logo: 'https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg', rating: 5 },
  { id: 'mci', name: 'Manchester City', league: 'Premier League', category: 'uefa', logo: '🟢', rating: 5 },
  { id: 'ars', name: 'Arsenal', league: 'Premier League', category: 'uefa', logo: '🟠', rating: 4 },
  { id: 'liv', name: 'Liverpool', league: 'Premier League', category: 'uefa', logo: '🔴', rating: 4 },
  { id: 'che', name: 'Chelsea', league: 'Premier League', category: 'uefa', logo: '🔵', rating: 4 },
  { id: 'psg', name: 'PSG', league: 'Ligue 1', category: 'uefa', logo: '�', rating: 4 },
  { id: 'bmu', name: 'Bayern Munich', league: 'Bundesliga', category: 'uefa', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg', rating: 5 },
  { id: 'dor', name: 'Borussia Dortmund', league: 'Bundesliga', category: 'uefa', logo: '🟡', rating: 4 },
  { id: 'int', name: 'Inter Milan', league: 'Serie A', category: 'uefa', logo: '🔵', rating: 4 },
  { id: 'acm', name: 'AC Milan', league: 'Serie A', category: 'uefa', logo: '🔴', rating: 4 },
  { id: 'juv', name: 'Juventus', league: 'Serie A', category: 'uefa', logo: '⚪', rating: 4 },
  { id: 'atm', name: 'Atletico Madrid', league: 'La Liga', category: 'uefa', logo: '🔴', rating: 4 },
  { id: 'ben', name: 'Benfica', league: 'Primeira Liga', category: 'uefa', logo: '🔴', rating: 4 },
  { id: 'por', name: 'Porto', league: 'Primeira Liga', category: 'uefa', logo: '🔵', rating: 4 },
  { id: 'aja', name: 'Ajax', league: 'Eredivisie', category: 'uefa', logo: '🔴', rating: 4 },
  { id: 'nap', name: 'Napoli', league: 'Serie A', category: 'other', logo: '🔵', rating: 4 },
  { id: 'rom', name: 'Roma', league: 'Serie A', category: 'other', logo: '🟡', rating: 4 },
  { id: 'tot', name: 'Tottenham', league: 'Premier League', category: 'other', logo: '⚪', rating: 4 },
  { id: 'new', name: 'Newcastle', league: 'Premier League', category: 'other', logo: '⚫', rating: 4 },
  { id: 'avl', name: 'Aston Villa', league: 'Premier League', category: 'other', logo: '🟣', rating: 4 },
  { id: 'sev', name: 'Sevilla', league: 'La Liga', category: 'other', logo: '⚪', rating: 4 },
  { id: 'mar', name: 'Marseille', league: 'Ligue 1', category: 'other', logo: '🔵', rating: 4 },
  { id: 'gal', name: 'Galatasaray', league: 'Süper Lig', category: 'other', logo: '🔴', rating: 4 },
  { id: 'cel', name: 'Celtic', league: 'Scottish Premiership', category: 'other', logo: '🟢', rating: 4 },
  { id: 'fen', name: 'Fenerbahce', league: 'Süper Lig', category: 'other', logo: '🔵', rating: 4 }
];

export function getClubCategoryLabel(category) {
  return category === 'uefa' ? 'UEFA Champions League Teams' : 'Other Big Teams';
}

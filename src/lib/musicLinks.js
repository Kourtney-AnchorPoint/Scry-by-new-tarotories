export function getSongSearchText(song) {
  if (!song) return '';
  if (typeof song === 'string') return song.trim();

  return [song.title, song.artist]
    .filter(Boolean)
    .join(' ')
    .trim();
}

export function formatSongLabel(song) {
  if (!song) return '';
  if (typeof song === 'string') return song.trim();

  const title = song.title || song.song || song.name || '';
  const artist = song.artist || '';
  const why = song.why || song.reason || song.message || '';
  const track = [title, artist].filter(Boolean).join(' - ');
  return [track, why].filter(Boolean).join(track && why ? ': ' : '');
}

export function buildMusicLinks(song) {
  const query = getSongSearchText(song);
  if (!query) return [];

  const encoded = encodeURIComponent(query);
  return [
    { label: 'Spotify', url: `https://open.spotify.com/search/${encoded}` },
    { label: 'Apple Music', url: `https://music.apple.com/us/search?term=${encoded}` },
    { label: 'YouTube', url: `https://www.youtube.com/results?search_query=${encoded}` },
  ];
}

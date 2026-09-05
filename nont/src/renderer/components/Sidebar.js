import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';

export default function Sidebar() {
  const navigate = useNavigate();
  const { playlists, setCurrentPlaylist } = useStore();

  const navItems = [
    { id: 'home', icon: 'home', label: 'Home', path: '/' },
    { id: 'search', icon: 'search', label: 'Search', path: '/search' },
    { id: 'library', icon: 'library_music', label: 'Library', path: '/library' },
    { id: 'downloads', icon: 'download', label: 'Downloads', path: '/downloads' },
  ];

  const handlePlaylistClick = (playlist) => {
    setCurrentPlaylist(playlist);
    navigate(`/playlist/${playlist.id}`);
  };

  return (
    <aside className="sidebar">
      <div className="logo">
        <svg viewBox="0 0 1134 340" width="100%" height="100%">
          <path fill="currentColor" d="M8 171c0 92 74 169 169 169s169-77 169-169S271 3 177 3 8 74 8 171zm234 0c0 69-56 125-125 125S-50 240 2 171s56-125 125-125 125 56 125 125zm268 0c0 69-56 125-125 125s-125-56-125-125 56-125 125-125 125 56 125 125z"/>
        </svg>
      </div>

      <nav>
        {navItems.map((item) => (
          <div key={item.id} className="nav-item" onClick={() => navigate(item.path)}>
            <span className="material-symbols-outlined">{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </nav>

      <div className="playlists-section">
        <div className="playlist-item" onClick={() => navigate('/create-playlist')}>
          <span className="material-symbols-outlined">add</span>
          <span>Create Playlist</span>
        </div>
        <div className="playlists-title">Playlists</div>
        {playlists.length === 0 ? (
          <div className="playlist-item" style={{ color: 'var(--light-gray)', fontSize: '12px' }}>
            <span className="material-symbols-outlined">music_note</span>
            <span>No playlists yet</span>
          </div>
        ) : (
          playlists.map((playlist) => (
            <div key={playlist.id} className="playlist-item" onClick={() => handlePlaylistClick(playlist)}>
              <span className="material-symbols-outlined">library_music</span>
              <span>{playlist.name}</span>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';

export default function Header() {
  const navigate = useNavigate();
  const { setSearchQuery, setSearchResults } = useStore();
  const [inputValue, setInputValue] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    try {
      const results = await window.electronAPI.searchYouTube(inputValue);
      setSearchResults(results);
      setSearchQuery(inputValue);
      navigate('/search');
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  return (
    <header className="header">
      <div className="header-controls">
        <button onClick={() => window.electronAPI.minimizeWindow()}>
          <span className="material-symbols-outlined">remove</span>
        </button>
        <button onClick={() => window.electronAPI.maximizeWindow()}>
          <span className="material-symbols-outlined">crop_square</span>
        </button>
        <button onClick={() => window.electronAPI.closeWindow()}>
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <div className="search-container">
        <form onSubmit={handleSearch} className="search-input-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="Search..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <span className="search-icon material-symbols-outlined">search</span>
        </form>
      </div>

      <div className="user-section">
        <div className="user-avatar"></div>
      </div>
    </header>
  );
}
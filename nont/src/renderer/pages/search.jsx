import React, { useState, useEffect } from 'react';
import { useStore } from '../store';

export default function Search() {
  const { searchQuery, searchResults, isSearching, setSearchQuery, setSearchResults, setIsSearching, addToDownloadQueue, playTrack } = useStore();
  const [selectedTracks, setSelectedTracks] = useState([]);

  useEffect(() => {
    if (searchQuery) {
      const load = async () => {
        setIsSearching(true);
        try {
          const results = await window.electronAPI.searchYouTube(searchQuery);
          setSearchResults(results);
        } catch (e) {
          console.error('Search failed:', e);
        } finally {
          setIsSearching(false);
        }
      };
      load();
    }
  }, [searchQuery]);

  const handleSelect = (track) => {
    const exists = selectedTracks.some(t => t.id === track.id);
    setSelectedTracks(exists ? selectedTracks.filter(t => t.id !== track.id) : [...selectedTracks, track]);
  };

  const handleSelectAll = () => {
    setSelectedTracks(selectedTracks.length === searchResults.length ? [] : searchResults);
  };

  const handleDownloadSelected = () => {
    selectedTracks.forEach(t => addToDownloadQueue({ videoId: t.id, title: t.title, thumbnail: `https://img.youtube.com/vi/${t.id}/mqdefault.jpg` }));
    setSelectedTracks([]);
  };

  const handleDownloadAll = () => {
    searchResults.forEach(t => addToDownloadQueue({ videoId: t.id, title: t.title, thumbnail: `https://img.youtube.com/vi/${t.id}/mqdefault.jpg` }));
  };

  const handlePlay = (track) => {
    playTrack({
      id: track.id,
      title: track.title,
      artist: 'Unknown',
      url: track.url,
      thumbnail: `https://img.youtube.com/vi/${track.id}/mqdefault.jpg`
    });
  };

  if (isSearching) return <div style={{textAlign: 'center', padding: '40px'}}><div className="spinner"></div></div>;
  if (searchResults.length === 0) return <div style={{textAlign: 'center', padding: '40px', color: 'var(--light-gray)'}}>No results. Try searching.</div>;

  return (
    <div>
      <h1 className="page-title">Results</h1>

      {selectedTracks.length > 0 && (
        <div style={{display: 'flex', gap: '16px', marginBottom: '20px', alignItems: 'center'}}>
          <button className="btn btn-secondary" onClick={handleSelectAll}>
            {selectedTracks.length === searchResults.length ? 'Deselect All' : 'Select All'}
          </button>
          <button className="btn btn-success" onClick={handleDownloadSelected}>
            <span className="material-symbols-outlined">download</span> Download ({selectedTracks.length})
          </button>
        </div>
      )}

      <div className="search-results">
        {searchResults.map((r) => {
          const isSelected = selectedTracks.some(t => t.id === r.id);
          return (
            <div key={r.id} className="search-result-item" style={isSelected ? {backgroundColor: 'rgba(29, 185, 84, 0.1)'} : {}}>
              <div className="search-result-cover" onClick={() => handleSelect(r)} style={{cursor: 'pointer'}}>
                <img src={`https://img.youtube.com/vi/${r.id}/mqdefault.jpg`} alt={r.title} />
                {isSelected && (
                  <div style={{position: 'absolute', top: '4px', right: '4px', backgroundColor: 'var(--green)', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <span className="material-symbols-outlined" style={{fontSize: '16px', color: 'white'}}>check</span>
                  </div>
                )}
              </div>
              <div className="search-result-info" onClick={() => handlePlay(r)}>
                <div className="search-result-title">{r.title}</div>
              </div>
              <div className="search-result-actions">
                <button onClick={() => handlePlay(r)}><span className="material-symbols-outlined">play_arrow</span></button>
                <button onClick={() => addToDownloadQueue({videoId: r.id, title: r.title, thumbnail: `https://img.youtube.com/vi/${r.id}/mqdefault.jpg`})}><span className="material-symbols-outlined">download</span></button>
                <button onClick={() => handleSelect(r)}><span className="material-symbols-outlined">{isSelected ? 'check_box' : 'check_box_outline_blank'}</span></button>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{marginTop: '20px', textAlign: 'center'}}>
        <button className="btn btn-secondary" onClick={handleDownloadAll}>Download All</button>
      </div>
    </div>
  );
}
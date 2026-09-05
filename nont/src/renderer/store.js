import { create } from 'zustand';

export const useStore = create((set) => ({
  currentTrack: null,
  isPlaying: false,
  progress: 0,
  volume: 0.7,
  searchQuery: '',
  searchResults: [],
  isSearching: false,
  playlists: [],
  currentPlaylist: null,
  downloads: [],
  isDownloading: false,
  downloadQueue: [],
  isModalOpen: false,
  modalContent: null,

  setCurrentTrack: (track) => set({ currentTrack: track }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setProgress: (progress) => set({ progress }),
  setVolume: (volume) => set({ volume }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSearchResults: (results) => set({ searchResults: results }),
  setIsSearching: (isSearching) => set({ isSearching }),
  setDownloads: (downloads) => set({ downloads }),
  setIsDownloading: (isDownloading) => set({ isDownloading }),
  addToDownloadQueue: (item) => set((state) => ({ downloadQueue: [...state.downloadQueue, item] })),
  clearDownloadQueue: () => set({ downloadQueue: [] }),
  addPlaylist: (playlist) => set((state) => ({ playlists: [...state.playlists, playlist] })),
  setCurrentPlaylist: (playlist) => set({ currentPlaylist: playlist }),
  deletePlaylist: (id) => set((state) => ({
    playlists: state.playlists.filter(p => p.id !== id),
    currentPlaylist: state.currentPlaylist?.id === id ? null : state.currentPlaylist
  })),
  addTrackToPlaylist: (playlistId, track) => set((state) => ({
    playlists: state.playlists.map(p =>
      p.id === playlistId ? { ...p, tracks: [...p.tracks, track], updatedAt: new Date().toISOString() } : p
    )
  })),
  removeTrackFromPlaylist: (playlistId, trackId) => set((state) => ({
    playlists: state.playlists.map(p =>
      p.id === playlistId ? { ...p, tracks: p.tracks.filter(t => t.id !== trackId), updatedAt: new Date().toISOString() } : p
    )
  })),
  playTrack: (track) => set({ currentTrack: track, isPlaying: true, progress: 0 }),
  playPlaylist: (playlist) => {
    if (playlist.tracks.length === 0) return;
    set({ currentTrack: playlist.tracks[0], isPlaying: true, progress: 0, currentPlaylist: playlist });
  },
  openModal: (content) => set({ isModalOpen: true, modalContent: content }),
  closeModal: () => set({ isModalOpen: false, modalContent: null }),
  createPlaylist: (name, tracks = []) => {
    const newPlaylist = {
      id: Date.now().toString(),
      name,
      tracks,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    set((state) => ({ playlists: [...state.playlists, newPlaylist], currentPlaylist: newPlaylist }));
    return newPlaylist;
  },
}));
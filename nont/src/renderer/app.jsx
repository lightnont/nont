import React, { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Player from './components/Player';
import Home from './pages/Home';
import Search from './pages/Search';
import Library from './pages/Library';
import Downloads from './pages/Downloads';
import Playlist from './pages/Playlist';
import CreatePlaylist from './pages/CreatePlaylist';
import './App.css';

export default function App() {
  return (
    <div className="app-container">
      <Sidebar />
      <Header />
      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/library" element={<Library />} />
          <Route path="/downloads" element={<Downloads />} />
          <Route path="/playlist/:id" element={<Playlist />} />
          <Route path="/create-playlist" element={<CreatePlaylist />} />
        </Routes>
      </main>
      <Player />
    </div>
  );
}
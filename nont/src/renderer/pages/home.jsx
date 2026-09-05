import React from 'react';
import { useStore } from '../store';

export default function Home() {
  const { playlists, downloads } = useStore();

  const featuredPlaylists = [
    { id: 'f1', name: 'Discover', description: 'New music for you', cover: 'https://via.placeholder.com/150/333/fff?text=Discover' },
    { id: 'f2', name: 'Trending', description: 'Popular right now', cover: 'https://via.placeholder.com/150/333/fff?text=Trending' },
    { id: 'f3', name: 'Chill', description: 'Relaxing tracks', cover: 'https://via.placeholder.com/150/333/fff?text=Chill' },
    { id: 'f4', name: 'Workout', description: 'High energy', cover: 'https://via.placeholder.com/150/333/fff?text=Workout' },
  ];

  return (
    <div>
      <h1 className="page-title">Welcome</h1>

      <section>
        <h2 className="section-title">Featured</h2>
        <div className="cards-grid">
          {featuredPlaylists.map((p) => (
            <div key={p.id} className="card">
              <div className="card-cover"><img src={p.cover} alt={p.name} /></div>
              <div className="card-title">{p.name}</div>
              <div className="card-subtitle">{p.description}</div>
            </div>
          ))}
        </div>
      </section>

      {downloads.length > 0 && (
        <section>
          <h2 className="section-title">Downloads</h2
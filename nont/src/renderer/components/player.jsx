import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store';

export default function Player() {
  const { currentTrack, isPlaying, setIsPlaying, setProgress, volume, setVolume } = useStore();
  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (currentTrack && audioRef.current) {
      audioRef.current.load();
      if (isPlaying) audioRef.current.play().catch(() => {});
    }
  }, [currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      isPlaying ? audioRef.current.play().catch(() => {}) : audioRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setProgress((audioRef.current.currentTime / duration) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  const handleProgressClick = (e) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = percent * duration;
    setCurrentTime(percent * duration);
    setProgress(percent * 100);
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="player">
      <audio
        ref={audioRef}
        src={currentTrack?.url || ''}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        hidden
      />

      <div className="now-playing">
        <div className="now-playing-cover">
          {currentTrack?.thumbnail && <img src={currentTrack.thumbnail} alt={currentTrack.title} />}
        </div>
        <div className="now-playing-info">
          <div className="now-playing-title">{currentTrack?.title || 'No track'}</div>
          <div className="now-playing-artist">{currentTrack?.artist || 'Unknown'}</div>
        </div>
      </div>

      <div className="player-controls">
        <button><span className="material-symbols-outlined">skip_previous</span></button>
        <button className="play-pause" onClick={() => setIsPlaying(!isPlaying)}>
          <span className="material-symbols-outlined">{isPlaying ? 'pause' : 'play_arrow'}</span>
        </button>
        <button><span className="material-symbols-outlined">skip_next</span></button>
      </div>

      <div className="player-progress">
        <span className="player-time">{formatTime(currentTime)}</span>
        <div className="player-progress-bar" onClick={handleProgressClick}>
          <div className="player-progress-filled" style={{ width: `${useStore.getState().progress}%` }} />
        </div>
        <span className="player-time">{formatTime(duration)}</span>
      </div>

      <div className="player-actions">
        <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} style={{width: '100px'}} />
      </div>
    </div>
  );
}
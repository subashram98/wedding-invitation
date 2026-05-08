import React, { useState, useRef, useEffect } from 'react';

export default function MusicPlayer() {
  const [playing, setPlaying] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const audioRef = useRef(null);
  const startedOnce = useRef(false);

  // Auto-play on first interaction, only once ever
  useEffect(() => {
    if (startedOnce.current) return;

    const handler = () => {
      if (startedOnce.current) return;
      const audio = audioRef.current;
      if (!audio) return;
      startedOnce.current = true;
      setShowHint(false);

      // Remove listeners immediately
      document.removeEventListener('click', handler, true);
      document.removeEventListener('touchend', handler, true);

      audio.play().then(() => {
        setPlaying(true);
        setTimeout(() => {
          audio.pause();
          audio.currentTime = 0;
          setPlaying(false);
        }, 30000);
      }).catch(() => {});
    };

    document.addEventListener('click', handler, true);
    document.addEventListener('touchend', handler, true);

    return () => {
      document.removeEventListener('click', handler, true);
      document.removeEventListener('touchend', handler, true);
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => {});
    }
    setShowHint(false);
  };

  return (
    <>
      <audio ref={audioRef} preload="auto" src="/music2.mp3" />
      <div className="music-player">
        <button
          className={`music-btn ${playing ? 'playing' : ''}`}
          onClick={toggle}
          aria-label={playing ? 'Pause music' : 'Play music'}
        >
          ♪
          {playing && <span className="music-pulse" />}
        </button>
      </div>
    </>
  );
}

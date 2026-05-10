import { useState, useEffect } from 'react';

/**
 * Elegant loading screen — shows briefly while page assets load.
 * Displays couple names with a fade-in, then fades out to reveal the page.
 */
export default function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Wait for page to be ready, minimum 2s for the animation to play
    const minTime = new Promise(resolve => setTimeout(resolve, 2500));
    const pageReady = new Promise(resolve => {
      if (document.readyState === 'complete') resolve();
      else window.addEventListener('load', resolve, { once: true });
    });

    Promise.all([minTime, pageReady]).then(() => {
      setFadeOut(true);
      setTimeout(() => setVisible(false), 800);
    });
  }, []);

  if (!visible) return null;

  return (
    <div className={`loading-screen ${fadeOut ? 'loading-fade-out' : ''}`}>
      <div className="loading-content">
        <p className="loading-label">Together with joy</p>
        <h1 className="loading-names">
          <span>Subash</span>
          <span className="loading-amp">&</span>
          <span>Pavitha</span>
        </h1>
        <div className="loading-spinner">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
}

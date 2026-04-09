import React from 'react';
import { useConfig } from '../useConfig';
import AnimatedSection from './AnimatedSection';

export default function Gallery() {
  const config = useConfig();

  return (
    <AnimatedSection className="gallery">
      <p className="section-label">Moments</p>
      <h2 className="section-title">Our Gallery</h2>
      <div className="gallery-grid">
        {config.gallery.map((p, i) => (
          <div className="gallery-item" key={i} style={{ '--item-index': i }}>
            <img src={p.src} alt={p.alt} loading="lazy" />
            <div className="gallery-shine" aria-hidden="true" />
          </div>
        ))}
      </div>
    </AnimatedSection>
  );
}

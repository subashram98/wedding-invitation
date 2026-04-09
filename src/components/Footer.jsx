import React from 'react';
import { useConfig } from '../useConfig';
import DirectionsButton from './DirectionsButton';

export default function Footer() {
  const config = useConfig();

  return (
    <footer className="footer">
      <div className="footer-content">
        <p className="footer-names">{config.couple.person1} & {config.couple.person2}</p>
        <p className="footer-date">{config.wedding.dateDisplay}</p>
        <div className="footer-hashtag">{config.couple.hashtag}</div>
        <DirectionsButton className="footer-directions" />
        <p className="footer-note">{config.footer.note}</p>
      </div>
    </footer>
  );
}

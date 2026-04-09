import React from 'react';
import { ConfigProvider } from './useConfig';
import Hero from './components/Hero';
import Countdown from './components/Countdown';
import OurStory from './components/OurStory';
import Events from './components/Events';
import Gallery from './components/Gallery';
import RSVP from './components/RSVP';
import Footer from './components/Footer';
import MusicPlayer from './components/MusicPlayer';
import HeartBalloons from './components/HeartBalloons';
import ScrollToTop from './components/ScrollToTop';

export default function App() {
  return (
    <ConfigProvider>
      <div className="app">
        <MusicPlayer />
        <HeartBalloons />
        <ScrollToTop />
        <Hero />
        <Countdown />
        <OurStory />
        <Events />
        {/* <Gallery /> */}
        <RSVP />
        <Footer />
      </div>
    </ConfigProvider>
  );
}

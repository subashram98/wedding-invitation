import React from 'react';
import { ConfigProvider } from './useConfig';
import Hero from './components/Hero';
import Countdown from './components/Countdown';
import StoryReveal from './components/StoryReveal';
import Events from './components/Events';
import Gallery from './components/Gallery';
import RSVP from './components/RSVP';
import Footer from './components/Footer';
import MusicPlayer from './components/MusicPlayer';
import HeartBalloons from './components/HeartBalloons';
import ScrollToTop from './components/ScrollToTop';
import Fairy from './components/Fairy';

export default function App() {
  return (
    <ConfigProvider>
      <div className="app">
        <MusicPlayer />
        <HeartBalloons />
        <ScrollToTop />
        <Fairy />
        <Hero />
        <Countdown />
        <StoryReveal />
        <Events />
        {/* <Gallery /> */}
        <RSVP />
        <Footer />
      </div>
    </ConfigProvider>
  );
}

import React from 'react';
import HeroSection from '../components/HeroSection';
import EventSearch from '../components/EventSearch';
import EventCategories from '../components/EventCategories';
import HowItWorks from '../components/HowItWorks';
import WhyAIS from '../components/WhyAIS';
import PopularScenarios from '../components/PopularScenarios';
import VendorCTA from '../components/VendorCTA';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSection />

      {/* Event Search Form */}
      <EventSearch />

      {/* Event Categories */}
      <EventCategories />

      {/* How It Works */}
      <HowItWorks />

      {/* Why AIS */}
      <WhyAIS />

      {/* Popular Scenarios */}
      <PopularScenarios />

      {/* Vendor CTA */}
      <VendorCTA />
    </div>
  );
};

export default HomePage;

import React, { useState } from 'react';
import MyActivities from './components/MyActivities';
import FriendsActivities from './components/FriendsActivities';
import { headingClasses, buttonClasses } from './styles/common';
import { TabType, Tab } from './types';
import { TABS } from './constants';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('my-activities');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const renderHeader = () => (
    <div className="flex justify-between items-center p-4 mb-2">
      <h2 className={headingClasses.h2}>
        {TABS.find(tab => tab.id === activeTab)?.label}
      </h2>
    </div>
  );

  const renderTab = (tab: Tab) => (
    <button
      key={tab.id}
      onClick={() => setActiveTab(tab.id)}
      className={`flex-1 py-4 px-6 text-center font-serif ${
        activeTab === tab.id
          ? 'text-instagram-brown border-t-2 border-instagram-brown'
          : 'text-instagram-dark/60'
      }`}
    >
      {tab.label}
    </button>
  );

  return (
    <div className="max-w-md mx-auto h-screen flex flex-col bg-instagram-cream relative">
      <header className="bg-instagram-brown text-instagram-cream p-4 shadow-lg">
        <h1 className={headingClasses.h1}>Activity Tracker</h1>
      </header>

      <main className="flex-1 overflow-auto bg-instagram-beige">
        {renderHeader()}
        {activeTab === 'my-activities' ? (
          <MyActivities isModalOpen={isModalOpen} onModalClose={() => setIsModalOpen(false)} />
        ) : (
          <FriendsActivities />
        )}
      </main>

      <nav className="bg-instagram-light border-t border-instagram-brown/20">
        <div className="flex">
          {TABS.map(renderTab)}
        </div>
      </nav>

      {activeTab === 'my-activities' && (
        <button 
          onClick={() => setIsModalOpen(true)}
          className="absolute bottom-20 right-4 w-14 h-14 rounded-full bg-instagram-brown text-instagram-cream shadow-lg hover:bg-instagram-dark transition-colors flex items-center justify-center text-2xl"
          aria-label="Add new activity"
        >
          +
        </button>
      )}
    </div>
  );
}

export default App; 
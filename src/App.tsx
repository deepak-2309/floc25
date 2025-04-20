import React, { useState, useEffect } from 'react';
import MyActivities from './components/MyActivities';
import FriendsActivities from './components/FriendsActivities';
import Profile from './components/Profile';
import SignIn from './components/SignIn';
import { auth } from './config/firebase';
import { headingClasses } from './styles/common';
import { TabType, Tab } from './types';
import { NAVIGATION_TABS } from './constants';
import { signOut } from 'firebase/auth';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('my-activities');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!user) {
    return <SignIn />;
  }

  const renderHeader = () => (
    <div className="flex justify-between items-center p-4 mb-2">
      <h2 className={headingClasses.h2}>
        {NAVIGATION_TABS.find(tab => tab.id === activeTab)?.label}
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

  const renderMainContent = () => {
    switch (activeTab) {
      case 'my-activities':
        return (
          <MyActivities 
            isModalOpen={isModalOpen} 
            onModalClose={() => setIsModalOpen(false)} 
          />
        );
      case 'friends-activities':
        return <FriendsActivities />;
      case 'profile':
        return <Profile />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-md mx-auto h-screen flex flex-col bg-instagram-cream relative">
      <header className="bg-instagram-brown text-instagram-cream p-4 shadow-lg">
        <div className="flex justify-between items-center">
          <h1 className={headingClasses.h1}>Activity Tracker</h1>
          <button
            onClick={handleSignOut}
            className="text-instagram-cream hover:text-instagram-light transition-colors text-sm"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-auto bg-instagram-beige">
        {renderHeader()}
        {renderMainContent()}
      </main>

      <nav className="bg-instagram-light border-t border-instagram-brown/20">
        <div className="flex">
          {NAVIGATION_TABS.map(renderTab)}
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
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { AppProvider, useApp } from './AppContext';
import { Header } from './components/Header';
import { ClientDashboard } from './components/ClientDashboard';
import { ProviderDashboard } from './components/ProviderDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { WelcomeScreen } from './components/WelcomeScreen';
import { PaymentsCenter } from './components/PaymentsCenter';

function MainAppContent() {
  const { currentUser, activeApp, setActiveApp } = useApp();

  // Route/Sync roles securely:
  // Clients are locked in their dashboard, Providers in theirs, Admin/Supervisor can navigate anything
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'client' && activeApp !== 'client') {
        setActiveApp('client');
      } else if (currentUser.role === 'provider' && activeApp !== 'provider') {
        setActiveApp('provider');
      } else if ((currentUser.role === 'admin' || currentUser.role === 'supervisor') && !activeApp) {
        setActiveApp('admin');
      }
    }
  }, [currentUser, activeApp, setActiveApp]);

  if (!currentUser) {
    return <WelcomeScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B101D] text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Universal navigation & quick stats/install tools */}
      <Header />

      {/* Main app viewport */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 md:pb-8">
        <div className="w-full">
          {activeApp === 'client' && <ClientDashboard />}
          {activeApp === 'provider' && <ProviderDashboard />}
          {activeApp === 'admin' && <AdminDashboard />}
        </div>
      </main>
      <PaymentsCenter />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}

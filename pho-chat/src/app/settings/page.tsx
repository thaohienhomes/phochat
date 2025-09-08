"use client";

import * as React from 'react';
import { Navigation } from '@/components/ui/navigation';
import { SettingsPage } from '@/components/ui/settings-page';
import { mockRootProps } from '@/app/settingsMockData';

export default function Settings() {
  const handleUpdateProfile = async (data: any) => {
    // Simulate API call
    console.log('Updating profile:', data);
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const handleUpdatePreferences = async (preferences: any) => {
    // Simulate API call
    console.log('Updating preferences:', preferences);
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="md:ml-64">
        <SettingsPage
          user={mockRootProps.user}
          subscription={mockRootProps.subscription}
          preferences={mockRootProps.preferences}
          billingHistory={mockRootProps.billingHistory}
          onUpdateProfile={handleUpdateProfile}
          onUpdatePreferences={handleUpdatePreferences}
        />
      </main>
    </div>
  );
}
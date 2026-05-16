'use client';

import { useState, useEffect } from 'react';
import { getStoredUser, type StoredUser } from '@/lib/auth';
import { SettingsPanel } from '@/components/settings/SettingsPanel';

export default function SettingsPage() {
  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  return <SettingsPanel email={user?.email ?? ''} />;
}

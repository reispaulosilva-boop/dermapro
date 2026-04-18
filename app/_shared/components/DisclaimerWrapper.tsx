'use client';

import { useEffect, useState } from 'react';
import { DisclaimerModal } from './DisclaimerModal';

const KEY = 'dermapro-global-disclaimer-accepted';

export function DisclaimerWrapper() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem(KEY)) {
      setOpen(true);
    }
  }, []);

  const handleAccept = () => {
    sessionStorage.setItem(KEY, '1');
    setOpen(false);
  };

  return (
    <DisclaimerModal
      moduleType="general"
      open={open}
      onAccept={handleAccept}
    />
  );
}

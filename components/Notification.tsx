'use client';

import React, { useEffect, useState } from 'react';

interface NotificationProps {
  message: string | null;
  onDone: () => void;
}

export default function Notification({ message, onDone }: NotificationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const t = setTimeout(() => {
        setVisible(false);
        setTimeout(onDone, 500);
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [message, onDone]);

  if (!message) return null;

  return (
    <div className={`notification ${visible ? 'show' : ''}`}>
      {message}
    </div>
  );
}

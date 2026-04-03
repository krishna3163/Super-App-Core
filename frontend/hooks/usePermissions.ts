'use client'

import { useState, useCallback, useEffect } from 'react';

export type PermissionType = 'camera' | 'microphone' | 'location' | 'notifications' | 'contacts';

export interface PermissionStatus {
  state: 'granted' | 'denied' | 'prompt' | 'unavailable';
}

export function usePermissions() {
  const [permissions, setPermissions] = useState<Record<PermissionType, PermissionStatus['state']>>({
    camera: 'prompt',
    microphone: 'prompt',
    location: 'prompt',
    notifications: 'prompt',
    contacts: 'unavailable',
  });

  const checkPermission = useCallback(async (type: PermissionType) => {
    if (typeof window === 'undefined') return 'prompt';

    try {
      // For notifications, it's a bit different
      if (type === 'notifications') {
        const status = Notification.permission;
        setPermissions(prev => ({ ...prev, [type]: status === 'default' ? 'prompt' : status }));
        return status === 'default' ? 'prompt' : status;
      }

      // For camera and microphone, navigator.permissions.query isn't always supported for 'camera'
      // Many browsers only support it for 'geolocation', 'notifications', etc.
      // A common way is to use navigator.mediaDevices.enumerateDevices or try to catch permission errors.
      
      const name = type as PermissionName;
      const status = await navigator.permissions.query({ name });
      
      setPermissions(prev => ({ ...prev, [type]: status.state }));
      
      status.onchange = () => {
        setPermissions(prev => ({ ...prev, [type]: status.state }));
      };

      return status.state;
    } catch (error) {
      console.warn(`Permission query for ${type} failed, falling back to prompt state.`, error);
      return 'prompt';
    }
  }, []);

  const requestPermission = useCallback(async (type: PermissionType): Promise<boolean> => {
    if (typeof window === 'undefined') return false;

    try {
      switch (type) {
        case 'camera':
          await navigator.mediaDevices.getUserMedia({ video: true });
          setPermissions(prev => ({ ...prev, camera: 'granted' }));
          return true;
        case 'microphone':
          await navigator.mediaDevices.getUserMedia({ audio: true });
          setPermissions(prev => ({ ...prev, microphone: 'granted' }));
          return true;
        case 'location':
          return new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
              () => {
                setPermissions(prev => ({ ...prev, location: 'granted' }));
                resolve(true);
              },
              () => {
                setPermissions(prev => ({ ...prev, location: 'denied' }));
                resolve(false);
              }
            );
          });
        case 'notifications':
          const status = await Notification.requestPermission();
          setPermissions(prev => ({ ...prev, notifications: status === 'default' ? 'prompt' : status }));
          return status === 'granted';
        case 'contacts':
          // navigator.contacts is only available in some mobile browsers (Secure Context)
          if ('contacts' in navigator && 'select' in (navigator as any).contacts) {
            setPermissions(prev => ({ ...prev, contacts: 'prompt' }));
            return true;
          }
          setPermissions(prev => ({ ...prev, contacts: 'unavailable' }));
          return false;
        default:
          return false;
      }
    } catch (error) {
      console.error(`Error requesting ${type} permission:`, error);
      setPermissions(prev => ({ ...prev, [type]: 'denied' }));
      return false;
    }
  }, []);

  // Sync initial permissions
  useEffect(() => {
    ['location', 'notifications'].forEach(type => checkPermission(type as PermissionType));
  }, [checkPermission]);

  return {
    permissions,
    checkPermission,
    requestPermission,
  };
}

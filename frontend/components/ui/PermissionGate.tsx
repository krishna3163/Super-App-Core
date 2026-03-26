'use client'

import React, { useEffect, useState } from 'react';
import { usePermissions, PermissionType } from '@/hooks/usePermissions';

interface PermissionGateProps {
  permission: PermissionType;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGate({ permission, children, fallback }: PermissionGateProps) {
  const { permissions, checkPermission, requestPermission } = usePermissions();
  const [isRequested, setIsRequested] = useState(false);

  useEffect(() => {
    checkPermission(permission);
  }, [permission, checkPermission]);

  const status = permissions[permission];

  if (status === 'granted') {
    return <>{children}</>;
  }

  if (status === 'denied') {
    return fallback ? <>{fallback}</> : (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        <p>Permission for {permission} was denied. Please enable it in your browser settings to use this feature.</p>
      </div>
    );
  }

  if (status === 'prompt' || status === 'unavailable') {
    return (
      <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg text-center">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Permission Required</h3>
        <p className="text-blue-600 mb-4">This feature requires access to your {permission}.</p>
        <button
          onClick={async () => {
            const result = await requestPermission(permission);
            setIsRequested(true);
          }}
          className="px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition"
        >
          Allow {permission}
        </button>
      </div>
    );
  }

  return null;
}

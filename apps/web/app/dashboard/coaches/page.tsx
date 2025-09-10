import CoachesComponents from '@/components/dashboard/kids-and-coaches';
import PermissionGuard from '@/components/guard/PermissionGuard';
import React from 'react';

const Coaches = () => {
  return (
    <PermissionGuard role="admin">
      <CoachesComponents coach />;
    </PermissionGuard>
  );
};

export default Coaches;

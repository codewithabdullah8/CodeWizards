import React from 'react';

const Skeleton = ({ width = '100%', height = '1rem', className = '' }) => {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height }}
    />
  );
};

export const EntrySkeleton = () => (
  <div className="recent-entry-card p-3 rounded-3 border">
    <div className="d-flex justify-content-between align-items-start mb-2">
      <div className="flex-grow-1 me-3">
        <Skeleton width="70%" height="1.25rem" className="mb-2" />
        <Skeleton width="100%" height="0.875rem" className="mb-1" />
        <Skeleton width="85%" height="0.875rem" />
      </div>
      <div className="text-end">
        <Skeleton width="80px" height="0.75rem" className="mb-1" />
        <Skeleton width="60px" height="0.75rem" />
      </div>
    </div>
    <div className="d-flex justify-content-between align-items-center">
      <div className="d-flex gap-2">
        <Skeleton width="60px" height="1.25rem" className="rounded-pill" />
        <Skeleton width="50px" height="1.25rem" className="rounded-pill" />
      </div>
      <Skeleton width="20px" height="20px" className="rounded-circle" />
    </div>
  </div>
);

export default Skeleton;
import React from 'react';

const SkeletonLoader = ({ type = 'table', rows = 5, columns = 6 }) => {
  if (type === 'table') {
    return (
      <div className="animate-pulse">
        {/* Table Header Skeleton */}
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table mb-0">
                <thead className="bg-light">
                  <tr>
                    {[...Array(columns)].map((_, i) => (
                      <th key={i} className="border-0 p-3">
                        <div className="skeleton-line" style={{ width: '80%', height: '12px' }}></div>
                      </th>
                    ))}
                    <th className="border-0 p-3" style={{ width: '120px' }}>
                      <div className="skeleton-line" style={{ width: '60px', height: '12px' }}></div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(rows)].map((_, rowIndex) => (
                    <tr key={rowIndex}>
                      {[...Array(columns)].map((_, colIndex) => (
                        <td key={colIndex} className="p-3">
                          <div className="skeleton-line" style={{
                            width: `${Math.random() * 40 + 60}%`,
                            height: '16px'
                          }}></div>
                        </td>
                      ))}
                      <td className="p-3">
                        <div className="d-flex gap-2">
                          <div className="skeleton-circle" style={{ width: '32px', height: '32px' }}></div>
                          <div className="skeleton-circle" style={{ width: '32px', height: '32px' }}></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className="animate-pulse">
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">
            <div className="skeleton-line mb-3" style={{ width: '40%', height: '24px' }}></div>
            <div className="skeleton-line mb-2" style={{ width: '100%', height: '16px' }}></div>
            <div className="skeleton-line mb-2" style={{ width: '90%', height: '16px' }}></div>
            <div className="skeleton-line mb-3" style={{ width: '70%', height: '16px' }}></div>
            <div className="d-flex gap-2 mt-4">
              <div className="skeleton-button" style={{ width: '100px', height: '38px' }}></div>
              <div className="skeleton-button" style={{ width: '100px', height: '38px' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'form') {
    return (
      <div className="animate-pulse">
        <div className="row g-3">
          {[...Array(rows)].map((_, i) => (
            <div key={i} className="col-md-6">
              <div className="skeleton-line mb-2" style={{ width: '30%', height: '14px' }}></div>
              <div className="skeleton-input" style={{ width: '100%', height: '42px' }}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default: simple lines
  return (
    <div className="animate-pulse">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="skeleton-line mb-3" style={{
          width: `${Math.random() * 30 + 70}%`,
          height: '20px'
        }}></div>
      ))}
    </div>
  );
};

export default SkeletonLoader;

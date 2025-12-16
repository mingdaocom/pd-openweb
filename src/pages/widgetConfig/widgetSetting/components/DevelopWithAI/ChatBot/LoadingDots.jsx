import React, { useEffect, useState } from 'react';

const LoadingDots = ({ className, dotNumber = 6 }) => {
  const [dotCount, setDotCount] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount(prev => (prev >= dotNumber ? 1 : prev + 1));
    }, 300); // 每500ms增加一个点

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={className} style={{ display: 'flex', gap: '2px', alignItems: 'center', height: '26px' }}>
      {[...Array(dotNumber)].map((_, index) => (
        <span
          key={index}
          style={{
            width: '4px',
            height: '4px',
            backgroundColor: '#9e9e9e',
            borderRadius: '50%',
            display: 'inline-block',
            transition: 'opacity 0.3s ease-in-out',
            opacity: index < dotCount ? 1 : 0,
          }}
        />
      ))}
    </div>
  );
};

export default LoadingDots;

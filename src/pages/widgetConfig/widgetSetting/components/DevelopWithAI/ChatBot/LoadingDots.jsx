import React, { useEffect, useState } from 'react';

const LoadingDots = () => {
  const [dotCount, setDotCount] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount(prev => (prev >= 6 ? 1 : prev + 1));
    }, 300); // 每500ms增加一个点

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: 'flex', gap: '2px', alignItems: 'center', height: '26px' }}>
      {[...Array(6)].map((_, index) => (
        <span
          key={index}
          style={{
            width: '4px',
            height: '4px',
            backgroundColor: '#9e9e9e',
            borderRadius: '50%',
            display: 'inline-block',
            opacity: index < dotCount ? 1 : 0,
          }}
        />
      ))}
    </div>
  );
};

export default LoadingDots;

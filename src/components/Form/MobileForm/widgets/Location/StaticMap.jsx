import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { getStaticMapUrl } from './staticMapUtils';

const DEFAULT_MAP_STYLE = {
  minWidth: 300,
  minHeight: 300,
};

function StaticMap({ location, mapStyle, onError }) {
  const containerRef = useRef(null);
  const hasReportedErrorRef = useRef(false);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const updateSize = useCallback(container => {
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    if (width > 0 && height > 0) {
      setSize(currentSize =>
        width === currentSize.width && height === currentSize.height ? currentSize : { width, height },
      );
    }
  }, []);

  const setContainerRef = useCallback(
    container => {
      containerRef.current = container;
      updateSize(container);
    },
    [updateSize],
  );

  const reportError = useCallback(() => {
    if (!hasReportedErrorRef.current && onError) {
      hasReportedErrorRef.current = true;
      onError();
    }
  }, [onError]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container || typeof window === 'undefined') return undefined;

    if (window.ResizeObserver) {
      const resizeObserver = new window.ResizeObserver(() => updateSize(container));
      resizeObserver.observe(container);
      return () => resizeObserver.disconnect();
    }

    const handleResize = () => updateSize(container);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateSize]);

  const { x, y } = location || {};
  const src = getStaticMapUrl({ x, y, ...size });
  const hasSize = size.width > 0 && size.height > 0;

  useEffect(() => {
    if (src) {
      hasReportedErrorRef.current = false;
    } else if (hasSize) {
      reportError();
    }
  }, [hasSize, reportError, src]);

  return (
    <div className="ming Amap">
      <div className="AmapContainer" style={{ ...DEFAULT_MAP_STYLE, ...mapStyle }} ref={setContainerRef}>
        {src && (
          <img
            src={src}
            alt=""
            aria-hidden="true"
            draggable={false}
            style={{ display: 'block', width: '100%', height: size.height, objectFit: 'cover' }}
            onError={reportError}
          />
        )}
      </div>
    </div>
  );
}

StaticMap.propTypes = {
  location: PropTypes.shape({
    x: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    y: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    coordinate: PropTypes.string,
  }),
  mapStyle: PropTypes.object,
  onError: PropTypes.func,
};

export default StaticMap;

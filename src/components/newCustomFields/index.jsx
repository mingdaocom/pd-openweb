import React, { useEffect, useState } from 'react';
import { LoadDiv } from 'ming-ui';
import { browserIsMobile } from 'src/util';
import './style.less';

const Entrance = (props, ref) => {
  const [Component, setComponent] = useState(null);

  useEffect(() => {
    const loadComponent = async () => {
      if (localStorage.getItem('LOAD_MOBILE_FORM') === 'new' && browserIsMobile()) {
        const module = await import('../Form');
        setComponent(() => module.default);
      } else {
        const module = await import('./OldForm');
        setComponent(() => module.default);
      }
    };

    loadComponent();
  }, []);

  if (!Component) {
    return <LoadDiv />;
  }

  return <Component ref={ref} {...props} />;
};

export default React.forwardRef(Entrance);

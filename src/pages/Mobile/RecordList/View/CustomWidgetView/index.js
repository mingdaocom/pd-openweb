import React, { useEffect, useState } from 'react';

export default function MobileCustomWidgetView(props) {
  const [Component, setComponent] = useState(null);

  useEffect(() => {
    import('src/pages/worksheet/views/CustomWidgetView').then(component => {
      setComponent(component.default);
    });
  }, []);

  if (!Component) return null;

  return <Component {...props} />;
}

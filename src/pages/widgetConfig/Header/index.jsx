import React from 'react';
import Header from 'src/components/worksheetConfigHeader';

export default function WidgetConfigHeader({ name: worksheetName, ...rest }) {
  const widgetProps = { ...rest, worksheetName, showAiBtn: md.global.Config.EnableAI };
  return <Header {...widgetProps} />;
}

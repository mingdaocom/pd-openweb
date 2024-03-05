import React from 'react';
import { DndProvider } from 'react-dnd-latest';
import { HTML5Backend } from 'react-dnd-html5-backend-latest';
import WidgetSetting from '../widgetSetting';
import WidgetList from '../widgetList';
import WidgetDisplay from '../widgetDisplay';

export default function Content(props) {
  return (
    <DndProvider key="config" context={window} backend={HTML5Backend}>
      <div className="customWidgetContainer">
        <WidgetList {...props} />
        <WidgetDisplay {...props} />
        <WidgetSetting {...props} />
      </div>
    </DndProvider>
  );
}

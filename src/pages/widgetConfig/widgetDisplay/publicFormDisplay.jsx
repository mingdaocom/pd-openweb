import React, { useEffect, useState } from 'react';
import { HTML5Backend } from 'react-dnd-html5-backend-latest';
import { DndProvider } from 'react-dnd-latest';
import { flatten } from 'lodash';
import { genControlsByWidgets, genWidgetsByControls } from '../util';
import DisplayRow from './displayRow';

export default function PublicFormDisplay(props) {
  const { controls, onChange, ...rest } = props;

  const [widgets, setWidgets] = useState([]);

  useEffect(() => {
    setWidgets(genWidgetsByControls(controls));
  }, [controls]);

  const [activeWidget, setActiveWidget] = useState({});

  const handleHide = controlId => {
    const nextControls = controls.filter(item => item.controlId !== controlId);
    onChange(nextControls, controlId);
  };

  const onSort = list => {
    setWidgets(list);
    onChange(genControlsByWidgets(list));
  };

  return (
    <DndProvider key="public" context={window} backend={HTML5Backend}>
      <DisplayRow
        widgets={widgets}
        setWidgets={onSort}
        activeWidget={activeWidget}
        setActiveWidget={setActiveWidget}
        handleHide={handleHide}
        allControls={flatten(widgets)}
        {...rest}
      />
    </DndProvider>
  );
}

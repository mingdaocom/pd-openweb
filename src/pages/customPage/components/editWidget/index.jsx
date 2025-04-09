import React from 'react';
import errorBoundary from 'ming-ui/decorators/errorBoundary';
import { connect } from 'react-redux';
import EmbedUrl from './EmbedUrl';
import { getEnumType, componentCountLimit } from '../../util';
import Analysis from './analysis';
import ButtonComp from './button';
import View from './view';
import RichText from './richText';
import Filter from './filter';
import Carousel from './carousel';
import _ from 'lodash';

const TYPE_TO_COMPONENTS = {
  embedUrl: EmbedUrl,
  analysis: Analysis,
  button: ButtonComp,
  view: View,
  richText: RichText,
  filter: Filter,
  carousel: Carousel,
};

function EditWidget(props) {
  const { components, widget, onClose, mode, activeContainerInfo = {}, addWidget, updateWidget } = props;
  const type = getEnumType(widget.type);
  const Comp = TYPE_TO_COMPONENTS[type];
  const handleEdit = obj => {
    if (mode === 'add') {
      if (!componentCountLimit(components)) return;
      if (activeContainerInfo.sectionId) {
        obj.sectionId = activeContainerInfo.sectionId;
        obj.tabId = activeContainerInfo.tabId;
      }
      addWidget({
        type,
        ...obj
      });
    } else {
      updateWidget({ widget, needUpdate: !widget.needUpdate, ...obj });
    }
    onClose();
  };
  const handleUpdate = obj => {
    updateWidget({ widget, ...obj });
  };
  return <Comp {...props} onEdit={handleEdit} onUpdate={handleUpdate} updateWidget={updateWidget} />;
}

export default errorBoundary(
  connect(({ appPkg, customPage }) => ({
    projectId: appPkg.projectId,
    components: customPage.components,
    config: customPage.config,
    activeContainerInfo: customPage.activeContainerInfo,
  }))(EditWidget),
);

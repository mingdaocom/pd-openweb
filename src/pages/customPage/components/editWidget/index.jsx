import React, { lazy, Suspense } from 'react';
import { connect } from 'react-redux';
import ErrorBoundary from 'ming-ui/components/ErrorBoundary';
import { componentCountLimit, getEnumType } from '../../util';

const TYPE_TO_COMPONENTS = {
  embedUrl: lazy(() => import('./EmbedUrl')),
  analysis: lazy(() => import('./analysis')),
  button: lazy(() => import('./button')),
  view: lazy(() => import('./view')),
  richText: lazy(() => import('./richText')),
  filter: lazy(() => import('./filter')),
  carousel: lazy(() => import('./carousel')),
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
        ...obj,
      });
    } else {
      updateWidget({ widget, needUpdate: !widget.needUpdate, ...obj });
    }

    onClose();
  };

  const handleUpdate = obj => {
    updateWidget({ widget, ...obj });
  };

  if (!Comp) return null;

  return (
    <Suspense fallback={null}>
      <Comp {...props} onEdit={handleEdit} onUpdate={handleUpdate} updateWidget={updateWidget} />
    </Suspense>
  );
}

export default ErrorBoundary.wrap(
  connect(({ appPkg, customPage }) => ({
    appPkg: appPkg,
    projectId: appPkg.projectId,
    components: customPage.components,
    config: customPage.config,
    activeContainerInfo: customPage.activeContainerInfo,
  }))(EditWidget),
);

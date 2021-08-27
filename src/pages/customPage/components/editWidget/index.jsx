import React from 'react';
import { string } from 'prop-types';
import { Icon } from 'ming-ui';
import { Button } from 'antd';
import Dialog from 'rc-dialog';
import 'rc-dialog/assets/index.css';
import styled from 'styled-components';
import errorBoundary from 'ming-ui/decorators/errorBoundary';
import { connect } from 'react-redux';
import EmbedUrl from './EmbedUrl';
import RichText from './RichText';
import { FlexCenter, getEnumType, reportCountLimit } from '../../util';
import { widgets } from '../../enum';
import Analysis from './analysis';
import ButtonComp from './button';

const Header = styled(FlexCenter)`
  position: absolute;
  left: 0;
  right: 0;
  padding: 0 24px;
  height: 54px;
  justify-content: space-between;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.24);
  border-radius: 5px 5px 0 0;

  font-size: 17px;
`;
const EditWidgetContent = styled.div`
  box-sizing: border-box;
  padding-top: 54px;
  height: 100%;
`;
const TYPE_TO_COMPONENTS = {
  richText: RichText,
  embedUrl: EmbedUrl,
  analysis: Analysis,
  button: ButtonComp,
};

function EditWidget(props) {
  const { components, widget, onClose, mode, addWidget, updateWidget } = props;
  const type = getEnumType(widget.type);
  const Comp = TYPE_TO_COMPONENTS[type];
  const handleEdit = obj => {
    if (mode === 'add') {
      if (type === 'analysis') {
        if (!reportCountLimit(components)) return;
      }
      addWidget({ type, ...obj });
    } else {
      updateWidget({ widget, needUpdate: !widget.needUpdate, ...obj });
    }
    onClose();
  };
  const handleUpdate = obj => {
    updateWidget({ widget, ...obj });
  };
  return _.includes(['richText'], type) ? (
    <Dialog
      className="editWidgetDialogWrap"
      visible
      onClose={onClose}
      closeIcon={<Icon icon="close Font26 Gray_75 ThemeHoverColor3" />}>
      <Header>
        <div className="typeName">{widgets[type].name}</div>
      </Header>
      <EditWidgetContent>
        <Comp {...props} onEdit={handleEdit} />
      </EditWidgetContent>
    </Dialog>
  ) : (
    <Comp {...props} onEdit={handleEdit} onUpdate={handleUpdate} />
  );
}

export default errorBoundary(
  connect(({ appPkg, customPage }) => ({
    projectId: appPkg.projectId,
    components: customPage.components,
  }))(EditWidget),
);

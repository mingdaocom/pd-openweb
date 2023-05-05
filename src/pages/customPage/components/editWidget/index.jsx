import React, { Fragment, useState } from 'react';
import { string } from 'prop-types';
import { Icon } from 'ming-ui';
import 'rc-dialog/assets/index.css';
import styled from 'styled-components';
import errorBoundary from 'ming-ui/decorators/errorBoundary';
import { connect } from 'react-redux';
import EmbedUrl from './EmbedUrl';
import { FlexCenter, getEnumType, reportCountLimit } from '../../util';
import { widgets } from '../../enum';
import Analysis from './analysis';
import ButtonComp from './button';
import View from './view';
import Filter from './filter';
import Carousel from './carousel';
import RcDialog from 'rc-dialog';
import Editor from 'src/pages/PageHeader/AppPkgHeader/AppDetail/EditorDiaLogContent';
import _ from 'lodash';

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
  embedUrl: EmbedUrl,
  analysis: Analysis,
  button: ButtonComp,
  view: View,
  filter: Filter,
  carousel: Carousel
};

function EditWidget(props) {
  const [show, setShow] = useState(true);
  const [top, setTop] = useState(0);
  const [left, setLeft] = useState(300);
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
    <RcDialog
      className="appIntroDialog editWidgetDialogWrap"
      wrapClassName="appIntroDialogWrapCenter"
      maskClosable={false}
      visible={show}
      onClose={onClose}
      animation="zoom"
      maskStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
      bodyStyle={{ minHeight: '680px', padding: 0 }}
      maskAnimation="fade"
      mousePosition={{ x: left, y: top }}
      closeIcon={<Icon icon="close" />}
    >
      <Editor
        className="appIntroDescriptionEditor "
        summary={widget.value}
        isEditing={true}
        permissionType={100} //可编辑的权限
        onSave={value => {
          handleEdit({ value });
        }}
        onCancel={onClose}
        cacheKey="appIntroDescription"
        title={widgets[type].name}
      />
    </RcDialog>
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

import React, { useState, Fragment, useEffect } from 'react';
import { Icon } from 'ming-ui';
import { Modal } from 'antd';
import Editor from 'src/pages/PageHeader/AppPkgHeader/AppDetail/EditorDiaLogContent';

export default function Carousel(props) {
  const { widget, onEdit, onClose } = props;

  return (
    <Modal
      className="appIntroDialog editWidgetDialogWrap"
      wrapClassName="appIntroDialogWrapCenter"
      maskClosable={false}
      visible={true}
      onCancel={onClose}
      width={800}
      transitionName=""
      maskTransitionName=""
      footer={null}
      centered={true}
      maskStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
      bodyStyle={{ minHeight: '680px', padding: 0 }}
      closeIcon={<Icon icon="close" />}
    >
      <Editor
        className="appIntroDescriptionEditor "
        summary={widget.value}
        isEditing={true}
        permissionType={100} //可编辑的权限
        onSave={value => {
          onEdit({ value });
        }}
        onCancel={onClose}
        cacheKey="customPageEditWidget"
        title={_l('富文本')}
      />
    </Modal>
  );
}

import React, { useState, useRef } from 'react';
import { func, bool } from 'prop-types';
import { Modal, Dialog } from 'ming-ui';
import Function from './Func';

export default function FunctionEditorDialog(props) {
  const { onClose } = props;
  const editor = useRef();
  const cache = useRef({});
  let width = 960;
  let height = 600;
  if (document.body.clientWidth * 0.8 > 960) {
    width = document.body.clientWidth * 0.8;
  }
  if (document.body.clientWidth * 0.8 > 1060) {
    width = 1060;
  }
  if (document.body.clientHeight * 0.8 > 600) {
    height = document.body.clientHeight * 0.8;
  }
  if (document.body.clientHeight * 0.8 > 700) {
    height = 700;
  }
  return (
    <Modal
      visible
      verticalAlign="bottom"
      closeSize={50}
      onCancel={() => {
        if (cache.current.changed) {
          Dialog.confirm({
            title: _l('是否保存对函数的更改'),
            onOk: () => editor.current.handleSave(),
            onCancel: onClose,
          });
        } else {
          onClose();
        }
      }}
      style={{ minWidth: width }}
      bodyStyle={{ padding: 0, position: 'relative', height, flex: 'none' }}
    >
      <Function {...props} ref={editor} onChange={() => (cache.current.changed = true)} />
    </Modal>
  );
}

FunctionEditorDialog.propTypes = {
  onClose: func,
};

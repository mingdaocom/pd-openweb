import React from 'react';
import { func, bool } from 'prop-types';
import { Modal } from 'ming-ui';
import Function from './Func';

export default function FunctionEditorDialog(props) {
  const { onClose } = props;
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
      onCancel={onClose}
      style={{ minWidth: width }}
      bodyStyle={{ padding: 0, position: 'relative', height }}
    >
      <Function {...props} />
    </Modal>
  );
}

FunctionEditorDialog.propTypes = {
  onClose: func,
};

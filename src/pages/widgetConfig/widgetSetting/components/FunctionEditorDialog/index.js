import React, { lazy, Suspense, useRef } from 'react';
import { func } from 'prop-types';
import { Modal } from 'ming-ui/antd-components';

const LoadableFunction = lazy(() => import('./Func'));

export default function FunctionEditorDialog(props) {
  const { onClose } = props;
  const editor = useRef({});
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
      open
      verticalAlign="bottom"
      onCancel={() => {
        if (cache.current.changed) {
          Modal.confirm({
            title: _l('是否保存对函数的更改'),
            onOk: () => editor.current.handleSave(),
            onCancel: onClose,
          });
        } else {
          onClose();
        }
      }}
      style={{
        minWidth: width,
      }}
      styles={{
        container: {
          padding: 0,
        },
        body: {
          padding: 0,
          position: 'relative',
          height,
          flex: 'none',
        },
      }}
    >
      <Suspense fallback={null}>
        <LoadableFunction
          {...props}
          dialogWidth={width}
          dialogHeight={height}
          setRef={(key, value) => (editor.current[key] = value)}
          onChange={() => (cache.current.changed = true)}
        />
      </Suspense>
    </Modal>
  );
}

FunctionEditorDialog.propTypes = {
  onClose: func,
};

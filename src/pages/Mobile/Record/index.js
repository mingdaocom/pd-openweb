import React, { Fragment, Component, forwardRef, useMemo } from 'react';
import AppPermissions from '../components/AppPermissions';
import RecordInfo from './RecordInfo';
import styled from 'styled-components';
import { Modal } from 'antd-mobile';
import { Provider } from 'react-redux';
import { configureStore } from 'src/redux/configureStore';

const ModalWrap = styled(Modal)`
  height: 95%;
  overflow: hidden;
  border-top-right-radius: 15px;
  border-top-left-radius: 15px;

  .am-modal-body {
    text-align: left;
  }
  &.full {
    height: 100%;
    border-top-right-radius: 0;
    border-top-left-radius: 0;
  }
`;

export default AppPermissions(RecordInfo);

export const RecordInfoModal = forwardRef((props, ref) => {
  const { rowId, appId, worksheetId, viewId } = props;
  const { className, visible, onClose } = props;
  const store = useMemo(configureStore, []);

  return (
    <ModalWrap
      popup
      animationType="slide-up"
      className={className}
      onClose={onClose}
      visible={visible}
    >
      {rowId && (
        <Provider store={store}>
          <RecordInfo
            isModal={true}
            ids={{ appId, worksheetId, viewId, rowId }}
            match={{params: {}}}
            onClose={onClose}
          />
        </Provider>
      )}
    </ModalWrap>
  );
});


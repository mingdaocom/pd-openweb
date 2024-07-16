import React, { Fragment, Component, forwardRef, useMemo, useEffect } from 'react';
import AppPermissions from '../components/AppPermissions';
import RecordInfo from 'mobile/components/RecordInfo/RecordInfo';
import styled from 'styled-components';
import cx from 'classnames';
import { Modal } from 'antd-mobile';
import { Provider } from 'react-redux';
import { configureStore } from 'src/redux/configureStore';
import functionWrap from 'ming-ui/components/FunctionWrap';
import { RECORD_INFO_FROM } from 'worksheet/constants/enum';
import workflowPushSoket from 'mobile/components/socket/workflowPushSoket';

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

const RecordInfoPage = props => {
  const { params } = props.match;
  const { appId, worksheetId, viewId, rowId } = params;
  return (
    <RecordInfo
      appId={appId}
      worksheetId={worksheetId}
      viewId={viewId}
      recordId={rowId}
      from={RECORD_INFO_FROM.WORKSHEET_ROW_LAND}
    />
  );
};

export default AppPermissions(RecordInfoPage);

export const RecordInfoModal = forwardRef((props, ref) => {
  const {
    rowId,
    appId,
    worksheetId,
    viewId,
    sheetSwitchPermit,
    getDataType,
    from,
    getDraftData = () => {},
    notModal = false,
    editable,
    hideOtherOperate,
    allowEmptySubmit,
    updateSuccess,
  } = props;
  const { className, visible, onClose } = props;
  const store = useMemo(configureStore, []);

  useEffect(() => {
    if (notModal) {
      workflowPushSoket();
    }
  }, []);

  if (!visible) return null;

  const Content = (
    <Provider store={store}>
      <RecordInfo
        {...props}
        isModal={true}
        from={from}
        appId={appId}
        worksheetId={worksheetId}
        viewId={viewId}
        recordId={rowId}
        onClose={onClose}
        getDataType={getDataType}
        getDraftData={getDraftData}
        editable={editable}
        hideOtherOperate={hideOtherOperate}
        allowEmptySubmit={allowEmptySubmit}
        updateSuccess={updateSuccess}
      />
    </Provider>
  );

  if (notModal) {
    return Content;
  }

  return (
    <ModalWrap
      popup
      transitionName="noTransition"
      className={cx('RecordInfoModal', className)}
      onClose={onClose}
      visible={visible}
    >
      {rowId && Content}
    </ModalWrap>
  );
});

export const openMobileRecordInfo = props => functionWrap(RecordInfoModal, { ...props });

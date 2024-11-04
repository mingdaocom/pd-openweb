import React, { Fragment, Component, forwardRef, useMemo, useEffect, useState } from 'react';
import AppPermissions from '../components/AppPermissions';
import RecordInfo from 'mobile/components/RecordInfo/RecordInfo';
import cx from 'classnames';
import { Popup } from 'antd-mobile';
import { Provider } from 'react-redux';
import { configureStore } from 'src/redux/configureStore';
import functionWrap from 'ming-ui/components/FunctionWrap';
import { RECORD_INFO_FROM } from 'worksheet/constants/enum';
import workflowPushSoket from 'mobile/components/socket/workflowPushSoket';
import Back from 'mobile/components/Back';

const RecordInfoPage = props => {
  const { params } = props.match;
  const { appId, worksheetId, viewId, rowId } = params;

  useEffect(() => {
    workflowPushSoket();
  }, []);

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
  const [isEditable, setIsEditable] = useState(false);

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
        updateEditStatus={isEditable => setIsEditable(isEditable)}
      />
    </Provider>
  );

  if (notModal) {
    return Content;
  }

  return (
    <Popup
      mask={false}
      position="bottom"
      className={cx('mobileModal RecordInfoModal', className)}
      onClose={onClose}
      visible={visible}
    >
      {rowId && Content}

      {!isEditable && (
        <Back
          icon="back"
          className="Fixed"
          style={{ bottom: window.isWxWork ? 130 : 120 }}
          onClick={onClose}
          filterWxWork={true}
        />
      )}
    </Popup>
  );
});

export const openMobileRecordInfo = props => functionWrap(RecordInfoModal, { ...props });

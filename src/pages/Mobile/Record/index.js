import React, { forwardRef, useEffect, useMemo, useState } from 'react';
import { Provider } from 'react-redux';
import { Popup } from 'antd-mobile';
import cx from 'classnames';
import functionWrap from 'ming-ui/components/FunctionWrap';
import Back from 'mobile/components/Back';
import RecordInfo from 'mobile/components/RecordInfo/RecordInfo';
import workflowPushSoket from 'mobile/components/socket/workflowPushSoket';
import { RECORD_INFO_FROM } from 'worksheet/constants/enum';
import { configureStore } from 'src/redux/configureStore';

const RecordInfoPage = props => {
  const { params } = props.match;
  let { appId, worksheetId, viewId, rowId, from } = params;

  if (rowId.indexOf('-') === -1 && params.rowId === '21') {
    rowId = params.viewId;
    viewId = null;
    from = Number(params.rowId);
  }

  useEffect(() => {
    workflowPushSoket();
  }, []);

  return (
    <RecordInfo
      appId={appId}
      worksheetId={worksheetId}
      viewId={viewId}
      recordId={rowId}
      from={from || RECORD_INFO_FROM.WORKSHEET_ROW_LAND}
      getDataType={from}
    />
  );
};

export default RecordInfoPage;

export const RecordInfoModal = forwardRef(props => {
  const {
    rowId,
    appId,
    worksheetId,
    viewId,
    getDataType,
    from,
    getDraftData = () => {},
    notModal = false,
    editable,
    hideOtherOperate,
    allowEmptySubmit,
    updateSuccess,
    updateRow,
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
        updateRow={updateRow}
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

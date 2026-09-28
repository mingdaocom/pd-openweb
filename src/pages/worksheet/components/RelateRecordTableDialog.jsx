import React, { useRef, useState } from 'react';
import { useKey } from 'react-use';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Modal } from 'ming-ui/antd-components';
import useFunctionWrapComponent from 'ming-ui/hooks/useFunctionWrapComponent';
import RelateRecordTable from 'worksheet/components/RelateRecordTable';

const Con = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  .tableOperate {
    padding: 0 24px 8px !important;
    height: 44px;
  }
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

function Table(props) {
  const {
    addRefreshEvents,
    appId,
    isCharge,
    worksheetId,
    recordId,
    allowEdit,
    formdata,
    control,
    isDraft,
    openFrom,
    onUpdateCount,
    updateWorksheetControls,
  } = props;
  return (
    <RelateRecordTable
      mode="dialog"
      openFrom={openFrom}
      appId={appId}
      isCharge={isCharge}
      useHeight
      allowEdit={allowEdit}
      isDraft={isDraft}
      control={{ ...control, addRefreshEvents }}
      recordId={recordId}
      worksheetId={worksheetId}
      formData={formdata}
      onCountChange={onUpdateCount}
      updateWorksheetControls={updateWorksheetControls}
    />
  );
}

Table.propTypes = {
  allowEdit: PropTypes.bool,
  appId: PropTypes.string,
  control: PropTypes.shape({}),
  formdata: PropTypes.arrayOf(PropTypes.shape({})),
  recordId: PropTypes.string,
  worksheetId: PropTypes.string,
  onUpdateCount: PropTypes.func,
  addRefreshEvents: PropTypes.func,
};

export default function RelateRecordTableDialog(props) {
  const {
    appId,
    isCharge,
    openFrom,
    worksheetId,
    recordId,
    control,
    formdata,
    allowEdit,
    isDraft,
    onClose,
    onClosed = () => {},
    reloadTable = () => {},
    onUpdateCount = () => {},
    updateWorksheetControls = () => {},
  } = props;

  // 关闭时先回调 onClosed（内联表格据此读回全屏改过的统计方式），再真正关闭弹层
  const handleClose = () => {
    onClosed();
    onClose();
  };

  const cache = useRef({});
  const [isFullScreen, setIsFullScreen] = useState(openFrom !== 'cell');
  const callFromDialog = openFrom !== 'cell';
  const width = window.innerWidth - 32 * 2 > 1600 ? 1600 : window.innerWidth - 32 * 2;
  useKey('/', e => {
    if (window.isMacOs ? e.metaKey : e.ctrlKey) {
      setIsFullScreen(old => !old);
      e.preventDefault();
      e.stopPropagation();
    }
  });
  useKey('R', e => {
    if (!e.ctrlKey || !e.shiftKey) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    if (get(cache, 'current.' + control.controlId)) {
      get(cache, 'current.' + control.controlId)();
    }
  });

  const iconButtons = [
    {
      type: 'refresh',
      icon: 'task-later',
      tip: _l('刷新'),
      onClick: () => {
        if (get(cache, 'current.' + control.controlId)) {
          get(cache, 'current.' + control.controlId)();
        }
      },
    },
    {
      type: 'fullScreen',
      icon: isFullScreen ? 'worksheet_narrow' : 'worksheet_enlarge',
      tip: isFullScreen ? _l('退出') : _l('全屏'),
      onClick: () => {
        if (callFromDialog) {
          handleClose();
        } else {
          setIsFullScreen(!isFullScreen);
        }
      },
    },
    ...(!callFromDialog
      ? [
          {
            type: 'close',
            icon: 'close',
            tip: _l('关闭'),
            onClick: () => {
              reloadTable();
              handleClose();
            },
          },
        ]
      : []),
  ];

  return (
    <Modal
      open
      keyboard
      type="fixed"
      verticalAlign="bottom"
      width={width}
      title={control.controlName}
      styles={{
        header: {
          marginBottom: 10,
        },
      }}
      iconButtons={iconButtons}
      closable={false}
      fullScreen={isFullScreen}
      onCancel={handleClose}
    >
      <Con>
        <Content>
          <Table
            {...{
              appId,
              isCharge,
              openFrom,
              worksheetId,
              recordId,
              allowEdit,
              formdata,
              isDraft,
              control,
              onUpdateCount,
              updateWorksheetControls,
            }}
            addRefreshEvents={(name, value) => {
              cache.current[name] = value;
            }}
          />
        </Content>
      </Con>
    </Modal>
  );
}

RelateRecordTableDialog.propTypes = {
  worksheetId: PropTypes.string,
  recordId: PropTypes.string,
  allowEdit: PropTypes.bool,
  appId: PropTypes.string,
  control: PropTypes.shape({}),
  formdata: PropTypes.arrayOf(PropTypes.shape({})),
  reloadTable: PropTypes.func,
  onClose: PropTypes.func,
  onUpdateCount: PropTypes.func,
};

export function useRelateRecordTableDialog() {
  return useFunctionWrapComponent(RelateRecordTableDialog);
}

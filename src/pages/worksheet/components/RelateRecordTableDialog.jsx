import React, { useRef, useState } from 'react';
import { useKey } from 'react-use';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Modal } from 'ming-ui';
import functionWrap from 'ming-ui/components/FunctionWrap';
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

const IconBtn = styled.span`
  color: #9e9e9e;
  cursor: pointer;
  display: inline-block;
  height: 28px;
  font-size: 20px;
  line-height: 28px;
  padding: 0 4px;
  border-radius: 5px;
  &:hover {
    background: #f7f7f7;
  }
`;

const Header = styled.div`
  height: 50px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  .main {
    font-size: 17px;
    color: #151515;
    font-weight: bold;
    width: 100%;
  }
  .split {
    font-size: 16px;
    margin: 0 8px;
    color: #9e9e9e;
  }
  .sec {
    font-size: 17px;
    color: #757575;
    max-width: 600px;
    &:hover {
      color: #151515;
    }
  }
  .openInNewTab {
    cursor: pointer;
    color: #9e9e9e;
    font-size: 14px;
    margin-left: 6px;
    line-height: 18px;
    height: 18px;
  }
  .flexCenter {
    display: flex;
    align-items: center;
  }
`;
const Content = styled.div`
  padding: 0 24px 80px;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

function Table(props) {
  const {
    addRefreshEvents,
    appId,
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
    openFrom,
    worksheetId,
    recordId,
    control,
    formdata,
    allowEdit,
    isDraft,
    onClose,
    reloadTable = () => {},
    onUpdateCount = () => {},
    updateWorksheetControls = () => {},
  } = props;
  const cache = useRef({});
  const [isFullScreen, setIsFullScreen] = useState(openFrom !== 'cell');
  const callFromDialog = openFrom !== 'cell';
  const width = window.innerWidth - 32 * 2 > 1600 ? 1600 : window.innerWidth - 32 * 2;
  useKey('e', e => {
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
  return (
    <Modal
      visible
      keyboard
      type="fixed"
      verticalAlign="bottom"
      width={width}
      closeSize={50}
      closeIcon={<span />}
      bodyStyle={{ padding: 0, position: 'relative' }}
      fullScreen={isFullScreen}
      style={{ transition: 'none' }}
      onCancel={onClose}
    >
      <Con>
        <Header>
          <div className="main ellipsis">{control.controlName}</div>
          <div className="flex"></div>
          <IconBtn
            className="mRight10 ThemeHoverColor3"
            data-tip={_l('刷新(Ctrl + Shift + R)')}
            onClick={() => {
              if (get(cache, 'current.' + control.controlId)) {
                get(cache, 'current.' + control.controlId)();
              }
            }}
          >
            <i className="icon icon-task-later"></i>
          </IconBtn>
          <IconBtn
            className="mRight10 ThemeHoverColor3"
            data-tip={
              isFullScreen
                ? _l('退出%0', window.isMacOs ? '(⌘ + E)' : '(Ctrl + E)')
                : _l('全屏%0', window.isMacOs ? '(⌘ + E)' : '(Ctrl + E)')
            }
            onClick={() => {
              if (callFromDialog) {
                onClose();
              } else {
                setIsFullScreen(!isFullScreen);
              }
            }}
          >
            <i className={`icon icon-${isFullScreen ? 'worksheet_narrow' : 'worksheet_enlarge'}`}></i>
          </IconBtn>
          {!callFromDialog && (
            <IconBtn
              className="ThemeHoverColor3"
              data-tip={_l('关闭(Esc)')}
              onClick={() => {
                reloadTable();
                onClose();
              }}
            >
              <i className="icon icon-close"></i>
            </IconBtn>
          )}
        </Header>
        <Content>
          <Table
            {...{
              appId,
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

export const openRelateRelateRecordTable = props => functionWrap(RelateRecordTableDialog, props);

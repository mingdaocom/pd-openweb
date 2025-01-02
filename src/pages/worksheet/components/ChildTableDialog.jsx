import React, { Fragment, useState, useRef, useEffect } from 'react';
import _, { get } from 'lodash';
import cx from 'classnames';
import { Button, Modal, Dialog } from 'ming-ui';
import sheetAjax from 'src/api/worksheet';
import worksheetAjax from 'src/api/worksheet';
import { useKey } from 'react-use';
import styled from 'styled-components';
import { ROW_HEIGHT } from 'worksheet/constants/enum';
import ChildTable from 'worksheet/components/ChildTable';
import functionWrap from 'ming-ui/components/FunctionWrap';
import { onValidator } from 'src/components/newCustomFields/tools/DataFormat';
import { formatControlToServer } from 'src/components/newCustomFields/tools/utils';
import { emitter, handleRecordError } from 'worksheet/util';
import { formatSearchConfigs } from 'src/pages/widgetConfig/util';

/**
 * TODO
 * 从记录详细打开记录共用 store 太乱了，请重构
 */

const Con = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
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
  .inner {
    width: 100%;
  }
  .main {
    font-size: 17px;
    color: #151515;
    font-weight: bold;
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
  position: relative;
  overflow: hidden;
  padding: 0 25px 36px;
  flex: 1;
  display: flex;
  flex-direction: column;
  .relateRecordTable {
    height: 100%;
  }
  .tableCon {
    flex: 1;
  }
  .childTableCon {
    height: 100%;
  }
  .operates {
    display: none;
  }
  .selectedTip {
    padding: 0 24px;
    line-height: 50px !important;
    top: -50px !important;
  }
  .childTableCon .errorTip {
    width: calc(100% - 300px);
    height: 30px;
    top: -35px;
  }
`;

function hasNoRelationRelateControl(controls) {
  return !!_.find(controls, c => c.type === 29 && _.isEmpty(c.relationControls));
}

export default function ChildTableDialog(props) {
  const {
    allowEdit = false,
    openFrom,
    isWorkflow,
    initSource,
    entityName,
    rules,
    appId,
    worksheetId,
    viewId,
    from,
    control,
    controls,
    recordId,
    sheetSwitchPermit,
    masterData,
    projectId,
    mobileIsEdit,
    onClose,
    onChange = () => {},
  } = props;
  const cache = useRef({});
  const rowHeight = ROW_HEIGHT[Number(_.get(control, 'advancedSetting.rowheight'))] || 34;
  const needUpdateControls = _.isEmpty(controls) || hasNoRelationRelateControl(controls);
  const [loading, setLoading] = useState(typeof props.searchConfig === 'undefined');
  const [searchConfig, setSearchConfig] = useState(props.searchConfig);
  const [changed, setChanged] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(openFrom !== 'cell');
  const [refreshFlag, setRefreshFlag] = useState(Math.random());
  const [value, setValue] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const conHeight = window.innerHeight - 32 - 50;
  const maxHeight = conHeight - 31 - 36 - 10;
  const maxShowRowCount = Math.floor((maxHeight - 30 - 40) / rowHeight);
  const width = window.innerWidth - 32 * 2 > 1600 ? 1600 : window.innerWidth - 32 * 2;
  function handleSave(close) {
    if (cache.current.isSaving) {
      return;
    }
    const store = cache.current.comp.props.store;
    const errors = store.getErrors();
    const validatedResult = onValidator({ item: { ...control, value } });
    if (validatedResult.errorType) {
      alert(validatedResult.errorText, 3);
      return;
    }
    if (!_.isEmpty(errors)) {
      alert(_l('请正确填写表单'), 3);
      return;
    } else {
      store.clearSubListErrors();
    }
    cache.current.isSaving = true;
    setIsSaving(true);
    worksheetAjax
      .updateWorksheetRow({
        appId,
        viewId,
        worksheetId,
        rowId: recordId,
        newOldControl: [formatControlToServer({ ...control, store, value: { ...value, controls } })],
      })
      .then(data => {
        if (!data.data) {
          if (data.resultCode === 22) {
            store.setUniqueError({ badData: data.badData });
          }
          cache.current.isSaving = false;
          setIsSaving(false);
        } else {
          alert(_l('保存成功'));
          cache.current.isSaving = false;
          setChanged(false);
          setIsSaving(false);
          if (close) {
            onClose();
          }
          setValue({});
          setRefreshFlag(Math.random());
          emitter.emit('RELOAD_RECORD_INFO', {
            worksheetId,
            recordId,
          });
        }
      });
  }
  useEffect(() => {
    if (loading) {
      sheetAjax.getQueryBySheetId({ worksheetId: control.dataSource }).then(queryRes => {
        setSearchConfig(formatSearchConfigs(queryRes));
        setLoading(false);
      });
    }
  }, []);
  useKey('e', e => {
    if (window.isMacOs ? e.metaKey : e.ctrlKey) {
      setIsFullScreen(old => !old);
      e.preventDefault();
      e.stopPropagation();
    }
  });
  return (
    <Modal
      visible
      keyboard
      type="fixed"
      verticalAlign="bottom"
      width={width}
      closeIcon={<span />}
      bodyStyle={{ padding: 0, position: 'relative' }}
      fullScreen={isFullScreen}
      onCancel={onClose}
    >
      <Con>
        <Header>
          <div className="inner flexRow">
            <div className="main ellipsis" title={control.controlName}>
              {control.controlName}
            </div>
            <div className="flex"></div>
            <IconBtn
              className="mRight10 ThemeHoverColor3"
              data-tip={
                isFullScreen
                  ? _l('退出%0', window.isMacOs ? '(⌘ + E)' : '(Ctrl + E)')
                  : _l('全屏%0', window.isMacOs ? '(⌘ + E)' : '(Ctrl + E)')
              }
              onClick={() => {
                setIsFullScreen(!isFullScreen);
              }}
            >
              <i className={`icon icon-${isFullScreen ? 'worksheet_narrow' : 'worksheet_enlarge'}`}></i>
            </IconBtn>
            <IconBtn
              className={cx('ThemeHoverColor3', { mRight10: changed })}
              data-tip={_l('关闭(Esc)')}
              onClick={() => {
                if (!changed || openFrom !== 'cell') {
                  onClose();
                  return;
                }
                Dialog.confirm({
                  title: _l('您是否保存此次更改'),
                  description: _l('当前有尚末保存的更改，您在离开当前页面前是否需要保存这些更改。'),
                  cancelType: 'ghost',
                  okText: _l('是，保存更改'),
                  cancelText: _l('否，放弃更改'),
                  onlyClose: true,
                  onOk: () => handleSave(true),
                  onCancel: onClose,
                });
              }}
            >
              <i className="icon icon-close"></i>
            </IconBtn>
          </div>
          {openFrom === 'cell' && changed && (
            <Fragment>
              <div className="flex"></div>
              <Button loading={isSaving} className="mRight35 flex-shrink-0" onClick={() => handleSave()}>
                {_l('保存')}
              </Button>
            </Fragment>
          )}
        </Header>
        <Content>
          {console.log(control)}
          <ChildTable
            valueChanged={props.valueChanged === true ? props.valueChanged : changed}
            needResetControls={needUpdateControls}
            registerCell={comp => {
              cache.current.comp = comp;
            }}
            refreshFlag={refreshFlag}
            mode="dialog"
            maxShowRowCount={maxShowRowCount}
            maxHeight={maxHeight}
            isWorkflow={isWorkflow}
            initSource={initSource}
            entityName={entityName}
            rules={rules}
            appId={appId}
            worksheetId={worksheetId}
            viewId={viewId}
            from={from}
            control={{
              ...(allowEdit
                ? control
                : {
                    ...control,
                    fieldPermission: '100',
                  }),
              addRefreshEvents: (name, value) => {
                cache.current.reload = value;
              },
            }}
            controls={controls}
            recordId={recordId}
            searchConfig={searchConfig}
            sheetSwitchPermit={sheetSwitchPermit}
            masterData={{ recordId, controlId: control.controlId, ...masterData }}
            projectId={projectId}
            onChange={changedValues => {
              if (openFrom === 'cell') {
                const { rows, lastAction = {} } = changedValues;
                if (!_.includes(['DELETE_ROW', 'DELETE_ROWS', 'ADD_ROW', 'UPDATE_ROW', 'ADD_ROWS'], lastAction.type)) {
                  return;
                }
                if (lastAction.type === 'ADD_ROWS' && find(lastAction.rows, row => row.isAddByTree)) {
                  return;
                }
                setValue(oldValue => {
                  let { deleted = [], updated = [] } = oldValue;
                  if (lastAction.type === 'DELETE_ROW') {
                    deleted = _.uniqBy(deleted.concat(lastAction.rowid)).filter(id => !/^(temp|default)/.test(id));
                  } else if (lastAction.type === 'DELETE_ROWS') {
                    deleted = _.uniqBy(deleted.concat(lastAction.rowIds)).filter(id => !/^(temp|default)/.test(id));
                  }
                  if (lastAction.type === 'ADD_ROW' || lastAction.type === 'UPDATE_ROW') {
                    updated = _.uniqBy(updated.concat(lastAction.rowid));
                  } else if (lastAction.type === 'ADD_ROWS') {
                    updated = _.uniqBy(updated.concat(lastAction.rows.map(r => r.rowid)));
                  }
                  return { ...oldValue, updated, deleted, rows };
                });
                setChanged(true);
              } else if (get(changedValues, 'lastAction.type') !== 'FORCE_SET_OUT_ROWS') {
                setChanged(true);
                onChange(changedValues, 'childTableDialog');
              }
            }}
            mobileIsEdit={mobileIsEdit}
            addRefreshEvents={(name, value) => {
              cache.current[name] = value;
            }}
          />
        </Content>
      </Con>
    </Modal>
  );
}

export const openChildTable = props => functionWrap(ChildTableDialog, props);

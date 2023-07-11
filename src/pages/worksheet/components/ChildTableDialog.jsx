import React, { Fragment, useState, useRef } from 'react';
import _ from 'lodash';
import cx from 'classnames';
import { Button, Modal, Dialog } from 'ming-ui';
import worksheetAjax from 'src/api/worksheet';
import styled from 'styled-components';
import ChildTable from 'worksheet/components/ChildTable';
import functionWrap from 'ming-ui/components/FunctionWrap';
import { formatControlToServer } from 'src/components/newCustomFields/tools/utils';
import { emitter, getSubListError } from 'worksheet/util';
import { handleOpenInNew } from 'worksheet/common/recordInfo/crtl';

const Con = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  height: 50px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  .main {
    font-size: 17px;
    color: #333;
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
      color: #333;
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
`;

function hasNoRelationRelateControl(controls) {
  return !!_.find(controls, c => c.type === 29 && _.isEmpty(c.relationControls));
}

export default function ChildTableDialog(props) {
  const {
    allowEdit = false,
    openFrom,
    title,
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
    searchConfig,
    sheetSwitchPermit,
    masterData,
    projectId,
    mobileIsEdit,
    onClose,
    onChange = () => {},
  } = props;
  const cache = useRef({});
  const meedUpdateControls = _.isEmpty(controls) || hasNoRelationRelateControl(controls);
  const [changed, setChanged] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(Math.random());
  const [value, setValue] = useState({});
  const conHeight = window.innerHeight - 32 - 50;
  const maxShowRowCount = Math.floor((conHeight - 30) / 34);
  const maxHeight = conHeight - 31 - 36 - 10;
  const allowOpenInNew = !control.isDraft && !_.get(window, 'shareState.shareId');
  const width = window.innerWidth - 32 * 2 > 1600 ? 1600 : window.innerWidth - 32 * 2;
  function handleSave(close) {
    const errors = getSubListError(
      {
        rows: value.rows,
        rules: _.get(cache.current.comp || {}, `worksheettable.current.table.rules`),
      },
      controls || control.relationControls,
      control.showControls,
      3,
    );
    if (!_.isEmpty(errors)) {
      alert(_l('请正确填写表单'), 3);
      cache.current.comp.setState({
        error: !_.isEmpty(errors),
        cellErrors: errors,
      });
      return;
    } else {
      cache.current.comp.setState({
        error: !_.isEmpty(errors),
        cellErrors: errors,
      });
    }
    worksheetAjax
      .updateWorksheetRow({
        appId,
        viewId,
        worksheetId,
        rowId: recordId,
        newOldControl: [formatControlToServer({ ...control, value: { ...value, controls } })],
      })
      .then(data => {
        if (!data.data) {
          alert(_l('保存失败'), 3);
        } else {
          alert(_l('保存成功'));
          setChanged(false);
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
  return (
    <Modal
      visible
      type="fixed"
      verticalAlign="bottom"
      width={width}
      closeSize={50}
      onCancel={() => {
        if (!changed) {
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
      bodyStyle={{ padding: 0, position: 'relative' }}
    >
      <Con>
        <Header>
          <div className="main">{control.controlName}</div>
          <div className="split"> - </div>
          <div
            className={cx('flexCenter', { Hand: allowOpenInNew })}
            onClick={() => allowOpenInNew && handleOpenInNew({ appId, worksheetId, viewId, recordId })}
          >
            <div className="sec ellipsis">{title}</div>
            {allowOpenInNew && (
              <span className="openInNewTab ThemeHoverColor3" data-tip={_l('新窗口打开')}>
                <i className="icon-launch" />
              </span>
            )}
          </div>
          {changed && (
            <Fragment>
              <div className="flex"></div>
              <Button className="mRight35" onClick={() => handleSave()}>
                {_l('保存')}
              </Button>
            </Fragment>
          )}
        </Header>
        <Content>
          <ChildTable
            needResetControls={meedUpdateControls}
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
            viewId={viewId}
            from={from}
            control={
              allowEdit
                ? control
                : {
                    ...control,
                    advancedSetting: Object.assign(control.advancedSetting, {
                      allowadd: '0',
                      allowcancel: '0',
                      allowedit: '0',
                    }),
                  }
            }
            controls={controls}
            recordId={recordId}
            searchConfig={searchConfig}
            sheetSwitchPermit={sheetSwitchPermit}
            masterData={masterData}
            projectId={projectId}
            onChange={changedValues => {
              if (openFrom === 'cell') {
                const { rows, lastAction = {} } = changedValues;
                if (!_.includes(['DELETE_ROW', 'ADD_ROW', 'UPDATE_ROW', 'ADD_ROWS'], lastAction.type)) {
                  return;
                }
                setValue(oldValue => {
                  let { deleted = [], updated = [] } = oldValue;
                  if (lastAction.type === 'DELETE_ROW') {
                    deleted = _.uniqBy(deleted.concat(lastAction.rowid)).filter(id => !/^(temp|default)/.test(id));
                  } else if (lastAction.type === 'ADD_ROW' || lastAction.type === 'UPDATE_ROW') {
                    updated = _.uniqBy(updated.concat(lastAction.rowid));
                  } else if (lastAction.type === 'ADD_ROWS') {
                    updated = _.uniqBy(updated.concat(lastAction.rows.map(r => r.rowid)));
                  }
                  return { ...oldValue, updated, deleted, rows };
                });
                setChanged(true);
              } else {
                onChange(changedValues, 'childTableDialog');
              }
            }}
            mobileIsEdit={mobileIsEdit}
          />
        </Content>
      </Con>
    </Modal>
  );
}

export const openChildTable = props => functionWrap(ChildTableDialog, props);

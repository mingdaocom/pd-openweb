import React, { useEffect, useRef, useState } from 'react';
import { useKey } from 'react-use';
import cx from 'classnames';
import _, { get, includes } from 'lodash';
import styled, { createGlobalStyle } from 'styled-components';
import { Button, Modal } from 'ming-ui/antd-components';
import useFunctionWrapComponent from 'ming-ui/hooks/useFunctionWrapComponent';
import sheetAjax from 'src/api/worksheet';
import worksheetAjax from 'src/api/worksheet';
import ChildTable from 'worksheet/components/ChildTable';
import { onValidator } from 'src/components/Form/core/formUtils';
import { formatControlToServer } from 'src/components/Form/core/utils';
import { getSubListErrorOfStore } from 'src/pages/worksheet/components/ChildTable/utils';
import { formatSearchConfigs } from 'src/utils/domain/control/filters';
import { ROW_HEIGHT } from 'src/utils/domain/worksheet/constants';
import { emitter } from 'src/utils/platform/browser/dom';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';

const Con = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Content = styled.div`
  position: relative;
  overflow: hidden;
  padding-bottom: 16px;
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
    top: -20px;
  }
  .childTableCon .errorTip {
    display: none;
  }
`;

// 子表从记录详情打开全屏时，弹窗顶部留出 115px，使遮罩后的「记录已修改」提示条可见
const FULL_SCREEN_TOP_OFFSET = 115;
const FullScreenTopOffsetStyle = createGlobalStyle`
  .hap-modal.childTableFromRecordFullScreen {
    height: calc(100% - ${FULL_SCREEN_TOP_OFFSET}px) !important;
    vertical-align: bottom !important;
    position: relative !important;
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
  } = props;
  const cache = useRef({});
  const callFromDialog = openFrom !== 'cell';
  const rowHeight = ROW_HEIGHT[Number(_.get(control, 'advancedSetting.rowheight'))] || 34;
  const needUpdateControls = _.isEmpty(controls) || hasNoRelationRelateControl(controls);
  const [loading, setLoading] = useState(typeof props.searchConfig === 'undefined');
  const [searchConfig, setSearchConfig] = useState(props.searchConfig);
  const [changed, setChanged] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(openFrom !== 'cell');
  const [refreshFlag, setRefreshFlag] = useState(() => Math.random());
  const [value, setValue] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [modal, modalContextHolder] = Modal.useModal();
  const conHeight = window.innerHeight - 32 - 50 - (callFromDialog ? FULL_SCREEN_TOP_OFFSET : 0);
  const maxHeight = conHeight - 31 - 36 - 10;
  const maxShowRowCount = Math.floor((maxHeight - 30 - 40) / rowHeight);
  const width = window.innerWidth - 32 * 2 > 1600 ? 1600 : window.innerWidth - 32 * 2;

  function handleSave(close) {
    if (cache.current.isSaving) return Promise.resolve();
    cache.current.isSaving = true;
    setIsSaving(true);

    function submit() {
      const store = cache.current.comp.props.store;
      const errors = getSubListErrorOfStore(store);
      const validatedResult = onValidator({ item: { ...control, value }, appId });

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

      return worksheetAjax
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

    return new Promise(resolve => {
      setTimeout(resolve, window.cellTextIsBlurring ? 1000 : 0);
    })
      .then(submit)
      .catch(_requestError => {
        alertIfNotUnauthorized(_requestError, _l('保存失败'), 2);
      })
      .finally(() => {
        cache.current.isSaving = false;
        setIsSaving(false);
      });
  }

  useEffect(() => {
    if (loading) {
      sheetAjax.getQueryBySheetId({ worksheetId: control.dataSource }).then(queryRes => {
        setSearchConfig(formatSearchConfigs(queryRes));
        setLoading(false);
      });
    }
  }, [control.dataSource, loading]);
  useKey('/', e => {
    if (window.isMacOs ? e.metaKey : e.ctrlKey) {
      setIsFullScreen(old => !old);
      e.preventDefault();
      e.stopPropagation();
    }
  });

  const handleClose = () => {
    if (!changed || openFrom !== 'cell') {
      onClose();
      return;
    }

    modal.confirm({
      title: _l('您是否保存此次更改'),
      content: _l('当前有尚末保存的更改，您在离开当前页面前是否需要保存这些更改。'),
      okText: _l('是，保存更改'),
      cancelText: _l('否，放弃更改'),
      onOk: () => handleSave(true),
      onCancel: onClose,
    });
  };

  const iconButtons = [
    {
      type: 'fullScreen',
      icon: isFullScreen ? 'worksheet_narrow' : 'worksheet_enlarge',
      tip: isFullScreen ? _l('退出') : _l('全屏'),
      onClick: () => {
        if (callFromDialog) {
          onClose();
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
            shortcut: 'Esc',
            onClick: handleClose,
          },
        ]
      : []),
  ];

  return (
    // Esc 关闭统一走全局 closeFns（只关最上层浮层），这里不开 antd 的 keyboard，
    // 否则在子表里打开行详情后按 Esc 会把本弹窗一起关掉
    <Modal
      open
      type="fixed"
      verticalAlign="bottom"
      width={width}
      className={cx({ childTableFromRecordFullScreen: callFromDialog && isFullScreen })}
      title={control.controlName}
      styles={{
        header: {
          marginBottom: 10,
        },
      }}
      headerRightElement={
        openFrom === 'cell' && changed ? (
          <Button
            type="primary"
            loading={isSaving}
            className="flex-shrink-0"
            onClick={() => {
              handleSave();
              // try {
              //   if (includes(['input', 'textarea'], document.activeElement.tagName.toLowerCase())) {
              //     document.activeElement.blur();
              //     document.querySelector('.recordInfoForm').dispatchEvent(new MouseEvent('mousedown'));
              //   }
              // } catch (err) {
              //   console.error(err);
              // }
              // setTimeout(handleSave, window.cellTextIsBlurring ? 2000 : 0);
            }}
          >
            {_l('保存')}
          </Button>
        ) : null
      }
      iconButtons={iconButtons}
      closable={false}
      fullScreen={isFullScreen}
      onCancel={onClose}
    >
      {modalContextHolder}
      {callFromDialog && isFullScreen && <FullScreenTopOffsetStyle />}
      <Con>
        <Content>
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
              worksheetId,
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

                if (
                  !_.includes(
                    [
                      'DELETE_ROW',
                      'DELETE_ROWS',
                      'ADD_ROW',
                      'UPDATE_ROW',
                      'UPDATE_ROWS',
                      'ADD_ROWS',
                      'CLEAR_AND_SET_ROWS',
                    ],
                    lastAction.type,
                  )
                ) {
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
                  } else if (lastAction.type === 'CLEAR_AND_SET_ROWS') {
                    deleted = lastAction.deleted;
                  }

                  if (lastAction.type === 'ADD_ROW' || lastAction.type === 'UPDATE_ROW') {
                    updated = _.uniqBy(updated.concat(lastAction.rowid));
                  } else if (lastAction.type === 'UPDATE_ROWS') {
                    updated = _.uniqBy(updated.concat(lastAction.rowIds));
                  } else if (lastAction.type === 'ADD_ROWS' || lastAction.type === 'CLEAR_AND_SET_ROWS') {
                    updated = _.uniqBy(updated.concat(lastAction.rows.map(r => r.rowid)));
                  }

                  return { ...oldValue, updated, deleted, rows };
                });
                setChanged(true);
              } else if (
                !includes(
                  [
                    'FORCE_SET_OUT_ROWS',
                    'UPDATE_BASE',
                    'INIT_ROWS',
                    'UPDATE_DATA_LOADING',
                    'LOAD_ROWS',
                    'UPDATE_PAGINATION',
                    'UPDATE_FILTER_CONTROLS',
                  ],
                  get(changedValues, 'lastAction.type'),
                )
              ) {
                setChanged(true);
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

export function useChildTableDialog() {
  return useFunctionWrapComponent(ChildTableDialog);
}

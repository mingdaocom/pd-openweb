import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Trigger from 'rc-trigger';
import { Menu, MenuItem, Icon, Dialog } from 'ming-ui';
import styled from 'styled-components';
import { copyRow, getWorksheetBtns } from 'src/api/worksheet';
import { RECORD_INFO_FROM } from 'worksheet/constants/enum';
import {
  handleShare,
  handleCreateTask,
  handleOpenInNew,
  handleCustomWidget,
  deleteRecord,
} from 'worksheet/common/recordInfo/crtl';
import CustomButtons from 'worksheet/common/recordInfo/RecordForm/CustomButtons';
import PrintList from 'worksheet/common/recordInfo/RecordForm/PrintList';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';

// TODO 完善菜单关闭交互

const Loading = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 36px;
  .icon {
    font-size: 20px;
    color: #9e9e9e;
    height: 20px;
    animation: rotate 0.6s infinite linear;
  }
`;

const Hr = styled.div`
  border-top: 1px solid #ebebeb;
  margin: 6px 0;
`;

const MenuWrap = styled(Menu)`
  position: relative !important;
  overflow: auto;
  padding: 6px 0 !important;
  width: 200px !important;
`;

const MenuItemWrap = styled(MenuItem)`
  .Item-content {
    padding-left: 47px !important;
  }
`;

const RedMenuItemWrap = styled(MenuItemWrap)`
  .Item-content {
    color: #f44336 !important;
    .Icon {
      color: #f44336 !important;
    }
  }
  &:not(.disabled):hover {
    .Icon {
      color: #fff !important;
    }
  }
`;

const Empty = styled.div`
  font-size: 12px;
  color: #bdbdbd;
  padding: 9px;
  text-align: center;
`;

const MoreOperate = styled.span`
  cursor: pointer;
  text-align: center;
  border-radius: 3px;
  line-height: 24px;
  display: inline-block;
  width: 24px;
  height: 24px;
  color: #9e9e9e;
  font-size: 18px;
  &:hover {
    background-color: rgba(0, 0, 0, 0.03);
    color: #2196f3;
  }
`;

const DangerConfirmTitle = styled.div`
  font-weight: bold;
  color: #f44336;
`;

export const memodRecordOperate = React.memo(
  (...args) => {
    return <RecordOperate {...args} />;
  },
  (prevProps, nextProps) => {
    console.log(prevProps, nextProps);
    return true;
  },
);
export default function RecordOperate(props) {
  const {
    isSubList,
    action = ['click'],
    isRelateRecordTable,
    allowAdd,
    popupAlign,
    shows = [],
    showHr = true,
    maxHeight,
    disableLoadCustomButtons,
    children,
    preMenuItems = [],
    popupContainer,
    from,
    isCharge,
    projectId,
    appId,
    viewId,
    worksheetId,
    recordId,
    workId,
    instanceId,
    allowDelete,
    allowCopy,
    formdata,
    sheetSwitchPermit = [],
    reloadRecord = () => {},
    onDelete,
    onDeleteSuccess = () => {},
    onCopy,
    onCopySuccess = () => {},
    onUpdate = () => {},
    onRemoveRelation = () => {},
    onPopupVisibleChange = () => {},
  } = props;
  const showShare =
    _.includes(shows, 'share') &&
    isOpenPermit(permitList.recordShareSwitch, sheetSwitchPermit, viewId) &&
    !md.global.Account.isPortal;
  const showCopy =
    _.includes(shows, 'copy') &&
    allowCopy &&
    isOpenPermit(permitList.recordCopySwitch, sheetSwitchPermit, viewId);
  const showPrint = _.includes(shows, 'print');
  const showTask = _.includes(shows, 'task') && !md.global.Account.isPortal;
  const showRemoveRelation = _.includes(shows, 'removeRelation');
  const showEditForm = _.includes(shows, 'editform') && isCharge;
  const showOpenInNew = _.includes(shows, 'openinnew');
  let { defaultCustomButtons = [] } = props;
  if (_.isFunction(defaultCustomButtons)) {
    defaultCustomButtons = defaultCustomButtons();
  }
  const customButtonActive = useRef();
  const [customButtons, setCustomButtons] = useState([]);
  const [customButtonLoading, setCustomButtonLoading] = useState();
  const [popupVisible, setPopupVisible] = useState(false);
  const DeleteItemWrap = isRelateRecordTable ? MenuItemWrap : RedMenuItemWrap;
  function changePopupVisible(vallue) {
    if (customButtonActive.current) {
      return;
    }
    setPopupVisible(vallue);
  }
  async function loadButtons() {
    try {
      setCustomButtonLoading(true);
      const newButtons = await getWorksheetBtns({
        appId,
        worksheetId,
        viewId,
        rowId: recordId,
      });
      setCustomButtonLoading(false);
      setCustomButtons(newButtons.filter(b => !b.disabled));
    } catch (err) {
      alert(_l('加载自定义按钮失败'), 3);
    }
  }
  useEffect(() => {
    if (popupVisible && !disableLoadCustomButtons && !customButtons.length) {
      loadButtons();
    }
  }, [popupVisible]);
  return (
    <Trigger
      action={action}
      popupClassName="relateRecordDropdownPopup filterTrigger"
      getPopupContainer={popupContainer || (() => document.body)}
      popupVisible={popupVisible}
      onPopupVisibleChange={value => {
        onPopupVisibleChange(value);
        changePopupVisible(value);
      }}
      popupAlign={Object.assign(
        {},
        {
          points: ['tr', 'br'],
          offset: [0, 0],
          overflow: {
            adjustX: true,
            adjustY: true,
          },
        },
        popupAlign,
      )}
      zIndex={1000}
      destroyPopupOnHide
      popup={
        <MenuWrap style={{ maxHeight: `${maxHeight || 508}px` }}>
          {showRemoveRelation && (
            <React.Fragment>
              <MenuItemWrap
                icon={<Icon icon="close" className="Font18 mLeft5" />}
                onClick={() => {
                  onRemoveRelation();
                  changePopupVisible(false);
                }}
              >
                {_l('取消关联')}
              </MenuItemWrap>
              <Hr />
            </React.Fragment>
          )}
          {!!preMenuItems.length &&
            preMenuItems.map((item, index) =>
              item === 'hr' ? (
                <Hr key={index} />
              ) : (
                <MenuItemWrap
                  className="printItem"
                  key={index}
                  icon={<Icon icon={item.icon} className="Font17 mLeft5" />}
                  onClick={() => {
                    if (_.isFunction(item.fn)) {
                      changePopupVisible(false);
                      item.fn();
                    }
                  }}
                >
                  {item.text}
                </MenuItemWrap>
              ),
            )}
          {!customButtonLoading &&
            !customButtons.length &&
            !showRemoveRelation &&
            !showShare &&
            !showCopy &&
            !(showPrint && isOpenPermit(permitList.recordPrintSwitch, sheetSwitchPermit, viewId)) &&
            !showTask &&
            !showOpenInNew &&
            !allowDelete &&
            !showEditForm && <Empty>{_l('无可用的操作')}</Empty>}
          {customButtonLoading && (!props.defaultCustomButtons || !!props.defaultCustomButtons.length) && (
            <Loading>
              <i className="icon icon-loading_button"></i>
            </Loading>
          )}
          {!!(disableLoadCustomButtons ? defaultCustomButtons : customButtons).length && (
            <CustomButtons
              type="menu"
              {...{ projectId, appId, viewId, worksheetId, recordId }}
              buttons={disableLoadCustomButtons ? defaultCustomButtons : customButtons}
              loadBtns={loadButtons}
              triggerCallback={() => changePopupVisible(false)}
              onUpdate={onUpdate}
              reloadRecord={reloadRecord}
              setCustomButtonActive={v => (customButtonActive.current = v)}
            />
          )}
          {showShare && (
            <MenuItemWrap
              className="printItem"
              icon={<Icon icon="share" className="Font17 mLeft5" />}
              onClick={() => {
                if (window.isPublicApp) {
                  alert(_l('预览模式下，不能操作'), 3);
                  return;
                }
                handleShare({
                  isCharge,
                  appId,
                  worksheetId,
                  viewId,
                  recordId,
                });
                changePopupVisible(false);
              }}
            >
              {_l('分享')}
            </MenuItemWrap>
          )}
          {showCopy && (
            <MenuItemWrap
              className="printItem"
              icon={<Icon icon="copy" className="Font17 mLeft5" />}
              onClick={() => {
                if (window.isPublicApp) {
                  alert(_l('预览模式下，不能操作'), 3);
                  return;
                }
                changePopupVisible(false);
                if (_.isFunction(onCopy)) {
                  onCopy();
                } else {
                  Dialog.confirm({
                    title: _l('您确认复制这条记录吗？'),
                    onOk: () => {
                      copyRow({
                        worksheetId,
                        viewId,
                        rowIds: [recordId],
                      })
                        .then(res => {
                          if (res && res.resultCode === 1) {
                            alert(_l('复制成功'));
                            onCopySuccess(res.data, recordId);
                          } else if (res && res.resultCode === 7) {
                            alert(_l('复制失败，权限不足！'), 3);
                          } else if (res && res.resultCode === 9) {
                            alert(_l('复制失败，超过最大数量！'), 3);
                          } else if (res && res.resultCode === 11) {
                            alert(_l('复制失败，当前表存在唯一字段'), 3);
                          } else {
                            alert(_l('复制失败！'), 3);
                          }
                        })
                        .fail(err => {
                          alert(_l('复制失败！'), 3);
                        });
                    },
                  });
                }
              }}
            >
              {_l('复制')}
            </MenuItemWrap>
          )}
          {showPrint && (
            <PrintList
              controls={formdata || []}
              {...{ appId, viewId, worksheetId, projectId, workId, instanceId }}
              sheetSwitchPermit={sheetSwitchPermit}
              recordId={recordId}
              onItemClick={() => setPopupVisible(false)}
            />
          )}
          {showTask && !md.global.SysSettings.forbidSuites.includes('2') && (
            <MenuItemWrap
              className="createTaskItem"
              icon={<Icon icon="task-worksheet" className="Font17 mLeft5" />}
              onClick={() => {
                if (window.isPublicApp) {
                  alert(_l('预览模式下，不能操作'), 3);
                  return;
                }
                handleCreateTask({
                  appId,
                  worksheetId,
                  viewId,
                  recordId,
                });
                changePopupVisible(false);
              }}
            >
              {_l('创建为任务')}
            </MenuItemWrap>
          )}
          {!window.isPublicApp && showOpenInNew && (
            <MenuItemWrap
              icon={<Icon icon="launch" className="Font17 mLeft5" />}
              onClick={() => {
                handleOpenInNew({ appId, worksheetId, viewId, recordId });
                changePopupVisible(false);
              }}
            >
              {_l('新页面打开')}
            </MenuItemWrap>
          )}
          {allowDelete && (!isRelateRecordTable || allowAdd) && from !== RECORD_INFO_FROM.WORKFLOW && (
            <DeleteItemWrap
              className="deleteItem"
              icon={<Icon icon="task-new-delete" className="Font17 mLeft5" />}
              onClick={async () => {
                if (window.isPublicApp) {
                  alert(_l('预览模式下，不能操作'), 3);
                  return;
                }
                changePopupVisible(false);
                async function deleteRow() {
                  if (_.isFunction(onDelete)) {
                    onDelete();
                  } else {
                    try {
                      await deleteRecord({ worksheetId, recordId });
                      alert(_l('删除成功'));
                      onDeleteSuccess({ appId, worksheetId, viewId, recordId });
                    } catch (err) {
                      console.log(err);
                      alert(_l('删除失败'), 2);
                    }
                  }
                }
                if (isSubList) {
                  deleteRow();
                  return;
                }
                if (showRemoveRelation) {
                  Dialog.confirm({
                    onlyClose: true,
                    title: <DangerConfirmTitle>{_l('注意：此操作将彻底删除原始记录')}</DangerConfirmTitle>,
                    description: _l('如果只需要取消与当前记录的关联关系，仍保留原始记录。可以选择仅取消关联关系'),
                    buttonType: 'danger',
                    cancelType: 'ghostgray',
                    okText: _l('彻底删除记录'),
                    cancelText: _l('仅取消关联关系'),
                    onOk: deleteRow,
                    onCancel: () => onRemoveRelation({ confirm: false }),
                  });
                } else {
                  Dialog.confirm({
                    title: _l('是否删除此条记录'),
                    buttonType: 'danger',
                    onOk: deleteRow,
                  });
                }
              }}
            >
              {_l('删除')}
            </DeleteItemWrap>
          )}
          {showHr && showEditForm && <Hr />}
          {!window.isPublicApp && showEditForm && (
            <MenuItemWrap
              className="openCustomWidget"
              icon={<Icon icon="settings" className="Font17 mLeft5" />}
              onClick={() => handleCustomWidget(worksheetId)}
            >
              {_l('编辑表单')}
            </MenuItemWrap>
          )}
        </MenuWrap>
      }
    >
      {children ? (
        React.cloneElement(children, popupVisible ? { style: { display: 'inline-block' } } : {})
      ) : (
        <MoreOperate className="moreOperate" style={popupVisible ? { display: 'inline-block' } : {}}>
          <i className="icon icon-task-point-more"></i>
        </MoreOperate>
      )}
    </Trigger>
  );
}

RecordOperate.propTypes = {
  popupAlign: PropTypes.shape({}),
  isRelateRecordTable: PropTypes.bool,
  allowAdd: PropTypes.bool,
  showHr: PropTypes.bool,
  shows: PropTypes.arrayOf(PropTypes.string),
  maxHeight: PropTypes.number,
  disableLoadCustomButtons: PropTypes.bool,
  children: PropTypes.element,
  preMenuItems: PropTypes.arrayOf(PropTypes.shape({})),
  popupContainer: PropTypes.element,
  from: PropTypes.number,
  allowDelete: PropTypes.bool,
  isCharge: PropTypes.bool,
  projectId: PropTypes.string,
  appId: PropTypes.string,
  viewId: PropTypes.string,
  worksheetId: PropTypes.string,
  recordId: PropTypes.string,
  workId: PropTypes.string,
  instanceId: PropTypes.string,
  formdata: PropTypes.arrayOf(PropTypes.shape({})),
  /** ********** */
  defaultCustomButtons: PropTypes.arrayOf(PropTypes.shape({})),
  sheetSwitchPermit: PropTypes.arrayOf(PropTypes.shape({})),
  onDelete: PropTypes.func,
  onDeleteSuccess: PropTypes.func,
  onCopy: PropTypes.func,
  onCopySuccess: PropTypes.func,
  onUpdate: PropTypes.func,
  onRemoveRelation: PropTypes.func,
  reloadRecord: PropTypes.func,
  onPopupVisibleChange: PropTypes.func,
};

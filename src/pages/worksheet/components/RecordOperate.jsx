import React, { useEffect, useRef, useState } from 'react';
import copy from 'copy-to-clipboard';
import _ from 'lodash';
import PropTypes from 'prop-types';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Dialog, Icon, Menu, MenuItem } from 'ming-ui';
import favoriteApi from 'src/api/favorite';
import worksheetAjax from 'src/api/worksheet';
import { deleteRecord, handleCustomWidget, handleOpenInNew } from 'worksheet/common/recordInfo/crtl';
import { handleShare } from 'worksheet/common/recordInfo/handleRecordShare';
import CustomButtons from 'worksheet/common/recordInfo/RecordForm/CustomButtons';
import PrintList from 'worksheet/common/recordInfo/RecordForm/PrintList';
import { RECORD_INFO_FROM } from 'worksheet/constants/enum';
import { copyRow } from 'worksheet/controllers/record';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { emitter } from 'src/utils/common';
import { controlState } from 'src/utils/control';
import { VersionProductType } from 'src/utils/enum';
import { getCurrentProject, getFeatureStatus } from 'src/utils/project';
import { replaceBtnsTranslateInfo } from 'src/utils/translate';
import MoveRecordToOtherGroup from './MoveRecordToOtherGroup';

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
  width: 240px !important;
`;

const MoveRecordToOtherGroupWrap = styled(Menu)`
  position: relative !important;
  width: auto !important;
  left: auto !important;
  padding: 0 !important;
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
    color: #1677ff;
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

export function handleDeleteRecord({
  worksheetId,
  appId,
  viewId,
  recordId,
  onDelete,
  onDeleteSuccess,
  onRemoveRelation,
  from,
  isSubList,
  showRemoveRelation,
}) {
  async function deleteRow() {
    if (_.isFunction(onDelete)) {
      onDelete();
    } else {
      try {
        await deleteRecord({ worksheetId, recordId });
        alert(_l('删除成功'));
        if (from === RECORD_INFO_FROM.DRAFT) {
          onRemoveRelation({ confirm: false });
          return;
        }
        onDeleteSuccess({ appId, worksheetId, viewId, recordId });
        emitter.emit('ROWS_UPDATE');
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
      title: <DangerConfirmTitle>{_l('注意：此操作将删除原始记录')}</DangerConfirmTitle>,
      description: _l('如果只需要取消与当前记录的关联关系，仍保留原始记录。可以选择仅取消关联关系'),
      buttonType: 'danger',
      cancelType: 'ghostgray',
      okText: _l('删除记录'),
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
}

export function handleCopyRecord({
  worksheetId,
  viewId,
  recordId,
  currentGroup,
  onCopy,
  relateRecordControlId,
  onCopySuccess,
}) {
  if (_.isFunction(onCopy)) {
    onCopy();
  } else {
    Dialog.confirm({
      title: _l('您确认复制这条记录吗？'),
      onOk: () => {
        copyRow(
          {
            worksheetId,
            viewId,
            rowIds: [recordId],
            relateRecordControlId,
          },
          newRows => {
            onCopySuccess(newRows[0] ? Object.assign({}, newRows[0], { group: currentGroup }) : {}, recordId);
          },
        );
      },
    });
  }
}

export function handleShareRecord({ isCharge, appId, worksheetId, viewId, recordId, sheetSwitchPermit }) {
  handleShare({
    isCharge,
    appId,
    worksheetId,
    viewId,
    recordId,
    hidePublicShare: !(
      isOpenPermit(permitList.recordShareSwitch, sheetSwitchPermit, viewId) && !md.global.Account.isPortal
    ),
    privateShare: isOpenPermit(permitList.embeddedLink, sheetSwitchPermit, viewId),
  });
}

export default function RecordOperate(props) {
  const {
    isSubList,
    action = ['click'],
    isRelateRecordTable,
    allowRecreate,
    popupAlign,
    shows = [],
    showHr = true,
    maxHeight,
    children,
    preMenuItems = [],
    popupContainer,
    from,
    relateRecordControlId,
    isCharge,
    isAdmin,
    isDevAndOps,
    projectId,
    appId,
    viewId,
    worksheetId,
    recordId,
    workId,
    instanceId,
    allowDelete,
    allowCopy,
    allowEdit,
    formdata,
    disableCustomButtons,
    defaultCustomButtons,
    view,
    sheetSwitchPermit = [],
    reloadRecord = () => {},
    onDelete,
    onDeleteSuccess = () => {},
    onCopy,
    onCopySuccess = () => {},
    onUpdate = () => {},
    onRemoveRelation = () => {},
    onPopupVisibleChange = () => {},
    hideRecordInfo = () => {},
    onRecreate = () => {},
    hideFav,
    isDraft,
    printBtnType = 0,
    printCharge,
    isRecordLock,
    updateRecordLock,
    groups,
    groupControl,
    currentGroupKey,
    entityName,
  } = props;
  const showDel = (isOpenPermit(permitList.recordDelete, sheetSwitchPermit, viewId) || isSubList) && allowDelete;
  const showShare =
    _.includes(shows, 'share') &&
    (isOpenPermit(permitList.recordShareSwitch, sheetSwitchPermit, viewId) ||
      isOpenPermit(permitList.embeddedLink, sheetSwitchPermit, viewId)) &&
    !md.global.Account.isPortal;
  const showCopy =
    _.includes(shows, 'copy') &&
    allowCopy &&
    (isOpenPermit(permitList.recordCopySwitch, sheetSwitchPermit, viewId) || isSubList);
  const showRecreate =
    _.includes(shows, 'recreate') &&
    allowRecreate &&
    (isOpenPermit(permitList.recordRecreateSwitch, sheetSwitchPermit, viewId) || isSubList);
  const isManageView = viewId === worksheetId;
  const showCopyId = _.includes(shows, 'copyId') && (isCharge || isDevAndOps);
  const showPrint = _.includes(shows, 'print');
  const showRemoveRelation = _.includes(shows, 'removeRelation');
  const showEditForm = _.includes(shows, 'editform') && isCharge;
  const showOpenInNew = _.includes(shows, 'openinnew') && !isManageView;
  const showLock = _.includes(shows, 'lock') && isAdmin;
  const customButtonActive = useRef();
  const [customButtons, setCustomButtons] = useState([]);
  const [customButtonLoading, setCustomButtonLoading] = useState();
  const [popupVisible, setPopupVisible] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [moveRecordToOtherGroupVisible, setMoveRecordToOtherGroupVisible] = useState(false);
  const [isEditLock, setIsEditLock] = useState(false);
  const groupControlPermission = groupControl && controlState(groupControl);
  const currentGroup = groupControl && _.find(groups, { key: currentGroupKey });
  const DeleteItemWrap = isRelateRecordTable ? MenuItemWrap : RedMenuItemWrap;
  const isExternal = _.isEmpty(getCurrentProject(projectId));
  const canFav =
    !hideFav &&
    !window.shareState.shareId &&
    !window.isPublicApp &&
    !md.global.Account.isPortal &&
    !isExternal &&
    _.includes(shows, 'fav') &&
    !isManageView;
  function changePopupVisible(value) {
    onPopupVisibleChange(value);
    if (customButtonActive.current) {
      return;
    }
    setPopupVisible(value);
  }
  async function loadButtons() {
    try {
      setCustomButtons([]);
      setCustomButtonLoading(true);
      const newButtons = await worksheetAjax.getWorksheetBtns({
        appId,
        worksheetId,
        viewId,
        rowId: recordId,
      });

      if (getFeatureStatus(projectId, VersionProductType.editProtect) === '1') {
        const lockData = await worksheetAjax.checkRowEditLock({ worksheetId, rowId: recordId });
        setIsEditLock(lockData.status === 2);
      }

      setCustomButtonLoading(false);
      setCustomButtons(replaceBtnsTranslateInfo(appId, newButtons).filter(b => !b.disabled));
    } catch (err) {
      console.log(err);
      alert(_l('加载自定义按钮失败'), 3);
    }
  }
  const checkFavoriteByRowId = () => {
    favoriteApi.checkFavoriteByRowId({ rowId: recordId, worksheetId, viewId }).then(res => {
      setIsFavorite(res);
    });
  };
  useEffect(() => {
    if (popupVisible && !defaultCustomButtons && !disableCustomButtons) {
      loadButtons();
    }
    if (popupVisible && canFav) {
      checkFavoriteByRowId();
    }
  }, [popupVisible]);
  const handleCollectRecord = () => {
    if (isFavorite) {
      // 取消收藏
      favoriteApi
        .removeFavorite({
          projectId,
          rowId: recordId,
          worksheetId,
          viewId,
        })
        .then(res => {
          if (res) {
            alert(_l('已取消收藏'));
            setIsFavorite(false);
          }
        });
    } else {
      // 添加收藏
      favoriteApi
        .addFavorite({
          worksheetId,
          rowId: recordId,
          viewId,
        })
        .then(res => {
          if (res) {
            alert(_l('收藏成功'));
            setIsFavorite(true);
          }
        });
    }
  };
  return (
    <Trigger
      action={action}
      popupClassName="relateRecordDropdownPopup filterTrigger"
      getPopupContainer={popupContainer || (() => document.body)}
      popupVisible={popupVisible}
      onPopupVisibleChange={value => {
        onPopupVisibleChange(value);
        if (value) {
          changePopupVisible(value);
        }
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
        moveRecordToOtherGroupVisible ? (
          <MoveRecordToOtherGroupWrap
            style={{
              width: 'auto !important',
              padding: '0 !important',
            }}
            onClickAwayExceptions={[
              '.customButtonConfirm',
              '.verifyPasswordConfirm',
              '.DropdownPrintTrigger',
              '#t_mask',
              '.templateListSelect',
            ]}
            onClickAway={() => {
              changePopupVisible(false);
              setMoveRecordToOtherGroupVisible(false);
            }}
          >
            <MoveRecordToOtherGroup
              {...{ appId, viewId, worksheetId, recordId }}
              view={view}
              currentGroupKey={currentGroupKey}
              groups={groups}
              groupControl={groupControl}
              onUpdate={onUpdate}
              onClose={() => {
                changePopupVisible(false);
                setMoveRecordToOtherGroupVisible(false);
              }}
            />
          </MoveRecordToOtherGroupWrap>
        ) : (
          <MenuWrap
            className="recordOperate"
            style={{ maxHeight: `${maxHeight || 508}px` }}
            onClickAwayExceptions={[
              '.customButtonConfirm',
              '.verifyPasswordConfirm',
              '.DropdownPrintTrigger',
              '#t_mask',
              '.templateListSelect',
            ]}
            onClickAway={() => changePopupVisible(false)}
          >
            {showRemoveRelation && (
              <React.Fragment>
                <MenuItemWrap
                  data-event="cancelRelate"
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
                    data-event={`preMenu-${index}`}
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
              !showOpenInNew &&
              !showDel &&
              !showEditForm && <Empty>{_l('无可用的操作')}</Empty>}
            {customButtonLoading && (!defaultCustomButtons || !!defaultCustomButtons.length) && (
              <Loading>
                <i className="icon icon-loading_button"></i>
              </Loading>
            )}
            <React.Fragment>
              <CustomButtons
                type="menu"
                {...{
                  projectId,
                  appId,
                  viewId,
                  worksheetId,
                  recordId,
                  isCharge,
                  sheetSwitchPermit,
                  isDraft,
                  entityName,
                }}
                buttons={defaultCustomButtons || customButtons}
                loadBtns={loadButtons}
                triggerCallback={() => changePopupVisible(false)}
                onUpdate={onUpdate}
                isRecordLock={isRecordLock}
                reloadRecord={reloadRecord}
                setCustomButtonActive={v => (customButtonActive.current = v)}
                isEditLock={isEditLock}
              />
              {!!(defaultCustomButtons || customButtons).length && <Hr />}
            </React.Fragment>
            {showCopy && (
              <MenuItemWrap
                data-event="copy"
                className="printItem"
                icon={<Icon icon="copy" className="Font17 mLeft5" />}
                onClick={() => {
                  if (window.isPublicApp) {
                    alert(_l('预览模式下，不能操作'), 3);
                    return;
                  }
                  changePopupVisible(false);
                  handleCopyRecord({
                    worksheetId,
                    viewId,
                    recordId,
                    onCopy,
                    onCopySuccess,
                    relateRecordControlId,
                    currentGroup,
                  });
                }}
              >
                {_l('复制%02003')}
              </MenuItemWrap>
            )}
            {showRecreate && (
              <MenuItemWrap
                data-event="reCreate"
                className="printItem"
                icon={<Icon icon="copy_all" className="Font17 mLeft5" />}
                onClick={() => {
                  if (window.isPublicApp) {
                    alert(_l('预览模式下，不能操作'), 3);
                    return;
                  }
                  changePopupVisible(false);
                  onRecreate({ group: currentGroup });
                  emitter.emit('ROWS_UPDATE');
                }}
              >
                {_l('重新创建')}
              </MenuItemWrap>
            )}
            {showCopyId && (
              <MenuItemWrap
                data-event="copyID"
                className="printItem"
                icon={<Icon className="Font17 mLeft5" icon="ID" />}
                onClick={() => {
                  copy(recordId);
                  alert(_l('复制成功'), 1);
                  changePopupVisible(false);
                }}
              >
                {_l('复制ID')}
              </MenuItemWrap>
            )}
            {showCopy && showCopyId && showRecreate && <Hr />}
            {canFav && (
              <MenuItemWrap
                data-event="collect"
                className="printItem"
                icon={
                  <Icon
                    className="Font17 mLeft5"
                    icon={!isFavorite ? 'star_outline' : 'star'}
                    style={{ color: isFavorite ? '#ffc402' : '' }}
                  />
                }
                onClick={() => {
                  handleCollectRecord();
                }}
              >
                {isFavorite ? _l('取消收藏') : _l('收藏记录')}
              </MenuItemWrap>
            )}
            {!!groupControl &&
              groupControl.type !== 30 &&
              allowEdit &&
              !isRecordLock &&
              groupControlPermission &&
              groupControlPermission.editable && (
                <MenuItemWrap
                  data-event="move"
                  className="printItem"
                  icon={<Icon icon="swap_horiz" className="Font17 mLeft5" />}
                  onClick={() => {
                    if (window.isPublicApp) {
                      alert(_l('预览模式下，不能操作'), 3);
                      return;
                    }
                    setMoveRecordToOtherGroupVisible(true);
                  }}
                >
                  {_l('移动到')}
                </MenuItemWrap>
              )}
            {showShare && (
              <MenuItemWrap
                data-event="share"
                className="printItem"
                icon={<Icon icon="share" className="Font17 mLeft5" />}
                onClick={() => {
                  if (window.isPublicApp) {
                    alert(_l('预览模式下，不能操作'), 3);
                    return;
                  }
                  handleShareRecord({
                    isCharge,
                    appId,
                    worksheetId,
                    viewId,
                    recordId,
                    sheetSwitchPermit,
                  });
                  changePopupVisible(false);
                }}
              >
                {_l('分享%02004')}
              </MenuItemWrap>
            )}
            {showPrint && (
              <PrintList
                type={printBtnType}
                isCharge={isCharge || printCharge}
                controls={formdata || []}
                {...{ appId: appId || props.printAppId, viewId, worksheetId, projectId, workId, instanceId }}
                sheetSwitchPermit={sheetSwitchPermit}
                recordId={recordId}
                showDownload={!isSubList && !isRelateRecordTable}
                onItemClick={() => setPopupVisible(false)}
              />
            )}
            {!window.isPublicApp && showOpenInNew && (
              <MenuItemWrap
                data-event="openNewPage"
                icon={<Icon icon="launch" className="Font17 mLeft5" />}
                onClick={() => {
                  handleOpenInNew({ appId, worksheetId, viewId, recordId });
                  changePopupVisible(false);
                }}
              >
                {_l('新页面打开%02001')}
              </MenuItemWrap>
            )}
            {showLock && (
              <MenuItemWrap
                data-event="editLock"
                icon={<Icon icon={isRecordLock ? 'task-new-no-locked' : 'lock'} className="Font17 mLeft5" />}
                onClick={() => {
                  updateRecordLock();
                  changePopupVisible(false);
                }}
              >
                {isRecordLock ? _l('解锁') : _l('锁定')}
              </MenuItemWrap>
            )}
            {showDel && from !== RECORD_INFO_FROM.WORKFLOW && !isRecordLock && (
              <DeleteItemWrap
                data-event="delete"
                className="deleteItem"
                icon={<Icon icon="trash" className="Font17 mLeft5" />}
                onClick={async () => {
                  if (window.isPublicApp) {
                    alert(_l('预览模式下，不能操作'), 3);
                    return;
                  }
                  changePopupVisible(false);
                  handleDeleteRecord({
                    worksheetId,
                    appId,
                    viewId,
                    recordId,
                    onDelete,
                    onDeleteSuccess,
                    onRemoveRelation,
                    from,
                    isSubList,
                    showRemoveRelation,
                    handleDeleteRecord,
                  });
                }}
              >
                {_l('删除%02000')}
              </DeleteItemWrap>
            )}
            {showHr && showEditForm && <Hr />}
            {!window.isPublicApp && showEditForm && (
              <MenuItemWrap
                data-event="editSheet"
                className="openCustomWidget"
                icon={<Icon icon="settings" className="Font17 mLeft5" />}
                onClick={() => {
                  hideRecordInfo();
                  handleCustomWidget(worksheetId);
                }}
              >
                {_l('编辑表单')}
              </MenuItemWrap>
            )}
          </MenuWrap>
        )
      }
    >
      {children ? (
        React.cloneElement(children, popupVisible ? { style: { display: 'inline-block' } } : {})
      ) : (
        <MoreOperate className="moreOperate" style={popupVisible ? { display: 'inline-block' } : {}}>
          <i className="icon icon-more_horiz"></i>
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

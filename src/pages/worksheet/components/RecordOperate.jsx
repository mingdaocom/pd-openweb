import React, { useCallback, useMemo, useState } from 'react';
import copy from 'copy-to-clipboard';
import _, { get } from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Dropdown, Modal } from 'ming-ui/antd-components';
import { withOpeners } from 'ming-ui/hooks/useFunctionWrapComponent';
import favoriteApi from 'src/api/favorite';
import worksheetAjax from 'src/api/worksheet';
import { deleteRecord, handleCustomWidget, handleOpenInNew } from 'worksheet/common/recordInfo/crtl';
import { handleShare } from 'worksheet/common/recordInfo/handleRecordShare';
import useCustomButtonMenuItems from 'worksheet/common/recordInfo/RecordForm/CustomButtons/useCustomButtonMenuItems';
import useRecordPrintMenuItems from 'worksheet/common/recordInfo/RecordForm/RecordPrint/useRecordPrintMenuItems';
import { segmentsFromView } from 'worksheet/common/ViewConfig/components/customBtn/groupedLayout/layoutUtils';
import { useShareDialog } from 'worksheet/components/Share';
import { copyRow } from 'worksheet/controllers/record';
import { navigateTo } from 'src/router/navigation/navigateTo';
import { permitList } from 'src/utils/domain/control/formEnum';
import { controlState } from 'src/utils/domain/control/state';
import { isOpenPermit } from 'src/utils/domain/permission/worksheet';
import { VersionProductType } from 'src/utils/domain/shared/productFeatures';
import { RECORD_INFO_FROM } from 'src/utils/domain/worksheet/constants';
import { emitter } from 'src/utils/platform/browser/dom';
import { getTranslateInfo } from 'src/utils/services/app';
import { getCurrentProject, getFeatureStatus } from 'src/utils/services/project';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';
import { replaceBtnsTranslateInfo } from 'src/utils/services/translation/app';
import MoveRecordToOtherGroup from './MoveRecordToOtherGroup';

const getDefaultPopupContainer = () => document.body;
const EMPTY_CONTROLS = [];

const DROPDOWN_MENU_STYLE = {
  position: 'relative',
  overflowY: 'auto',
  padding: '6px 0',
  width: 240,
};
const STATUS_ITEM_STYLE = { padding: 0 };

const Loading = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 36px;
  .icon {
    font-size: 20px;
    color: var(--color-text-tertiary);
    height: 20px;
    animation: rotate 0.6s infinite linear;
  }
`;

const Empty = styled.div`
  font-size: 12px;
  color: var(--color-text-disabled);
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
  color: var(--color-text-tertiary);
  font-size: 18px;
  &:hover {
    background-color: var(--color-background-secondary);
    color: var(--color-primary);
  }
`;

const DangerConfirmTitle = styled.div`
  font-weight: bold;
  color: var(--color-error);
`;

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
        alertIfNotUnauthorized(err, _l('删除失败'), 2);
      }
    }
  }

  if (isSubList) {
    deleteRow();
    return;
  }

  if (showRemoveRelation) {
    Modal.confirm({
      title: <DangerConfirmTitle className="textError">{_l('注意：此操作将删除原始记录')}</DangerConfirmTitle>,
      content: _l('如果只需要取消与当前记录的关联关系，仍保留原始记录。可以选择仅取消关联关系'),
      okButtonProps: {
        danger: true,
      },
      okText: _l('删除记录'),
      cancelText: _l('仅取消关联关系'),
      onOk: deleteRow,
      onCancel: () =>
        onRemoveRelation({
          confirm: false,
        }),
    });
  } else {
    Modal.confirm({
      title: <span className="textError">{_l('是否删除此条记录')}</span>,
      okButtonProps: {
        danger: true,
      },
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
    Modal.confirm({
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
            onCopySuccess(
              newRows[0]
                ? Object.assign({}, newRows[0], {
                    group: currentGroup,
                  })
                : {},
              recordId,
            );
          },
        );
      },
    });
  }
}

export function handleShareRecord({
  isCharge,
  appId,
  worksheetId,
  viewId,
  recordId,
  sheetSwitchPermit,
  openShareDialog,
}) {
  handleShare({
    isCharge,
    appId,
    worksheetId,
    viewId,
    recordId,
    openShareDialog,
    hidePublicShare: !(
      isOpenPermit(permitList.recordShareSwitch, sheetSwitchPermit, viewId) && !md.global.Account.isPortal
    ),

    privateShare: isOpenPermit(permitList.embeddedLink, sheetSwitchPermit, viewId),
  });
}

function RecordOperate(props) {
  const {
    isSubList,
    action = ['click'],
    isRelateRecordTable,
    allowRecreate,
    placement = 'bottomRight',
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
    mouseEnterDelay = 0,
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
    printCountEnabled,
    isRecordLock,
    updateRecordLock,
    groups,
    groupControl,
    currentGroupKey,
    entityName,
    openShareDialog,
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
  const [customButtons, setCustomButtons] = useState([]);
  const [customButtonLoading, setCustomButtonLoading] = useState();
  const [popupVisible, setPopupVisible] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isEditLock, setIsEditLock] = useState(false);
  const groupControlPermission = groupControl && controlState(groupControl);
  const currentGroup = groupControl && _.find(groups, { key: currentGroupKey });
  const customButtonsForRender = defaultCustomButtons || customButtons;
  const customButtonSegments = useMemo(() => {
    if (defaultCustomButtons || !view) {
      return null;
    }

    const detailgroup = get(view, 'advancedSetting.detailgroup');
    const detailbtns = get(view, 'advancedSetting.detailbtns');

    if (!detailgroup && !detailbtns) {
      return null;
    }

    const segments = segmentsFromView(customButtons, detailbtns, detailgroup);

    if (!segments || !segments.length || !segments.some(seg => seg.type === 'group')) {
      return null;
    }

    const byId = _.keyBy(customButtons, 'btnId');

    const items = _.compact(
      segments.map(seg => {
        if (seg.type === 'group') {
          const groupButtons = (seg.ids || []).map(id => byId[id]).filter(Boolean);

          // 组内动作全部停用/不可见时，过滤掉空分组，更多菜单不再显示空组占位
          if (!groupButtons.length) {
            return null;
          }

          return {
            kind: 'group',
            group: {
              id: seg.id,
              name: getTranslateInfo(appId, worksheetId, viewId)[seg.id] || seg.name,
              icon: seg.icon,
              iconUrl: seg.iconUrl,
              iconColor: seg.iconColor,
            },
            buttons: groupButtons,
          };
        }

        return { kind: 'btns', buttons: (seg.ids || []).map(id => byId[id]).filter(Boolean) };
      }),
    );

    // 过滤空分组后若已无任何分组，退回扁平渲染
    if (!items.some(it => it.kind === 'group')) {
      return null;
    }

    return items;
  }, [defaultCustomButtons, customButtons, view, appId, worksheetId, viewId]);
  const isExternal = _.isEmpty(getCurrentProject(projectId));
  const canFav =
    !hideFav &&
    !window.shareState.shareId &&
    !window.isPublicApp &&
    !md.global.Account.isPortal &&
    !isExternal &&
    _.includes(shows, 'fav') &&
    !isManageView;
  const {
    items: printMenuItems,
    holder: printMenuHolder,
    loadPrintList,
    loadPrintCount,
  } = useRecordPrintMenuItems({
    enabled: showPrint && popupVisible,
    mode: printBtnType === 2 ? 'system' : 'menu',
    isCharge: isCharge || printCharge,
    controls: formdata || EMPTY_CONTROLS,
    appId: appId || props.printAppId,
    viewId,
    worksheetId,
    projectId,
    workId,
    instanceId,
    sheetSwitchPermit,
    recordId,
    printCountEnabled,
    showDownload: !isSubList && !isRelateRecordTable,
  });

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
      setCustomButtons(replaceBtnsTranslateInfo(appId, newButtons).filter(b => !b.disabled && b.status !== 0));
    } catch (err) {
      console.log(err);
      alertIfNotUnauthorized(err, _l('加载自定义按钮失败'), 3);
    }
  }

  const checkFavoriteByRowId = () => {
    favoriteApi.checkFavoriteByRowId({ rowId: recordId, worksheetId, viewId }).then(res => {
      setIsFavorite(res);
    });
  };

  function changePopupVisible(value) {
    onPopupVisibleChange(value);
    setPopupVisible(value);
    if (value && !popupVisible && !defaultCustomButtons && !disableCustomButtons) {
      loadButtons();
    }

    if (value && !popupVisible && canFav) {
      checkFavoriteByRowId();
    }
  }

  const handleMenuOpenChange = useCallback(
    openKeys => {
      if (openKeys.includes('printTemplates')) {
        loadPrintList().then(templates => templates && loadPrintCount({ force: true, templates }));
      }
    },
    [loadPrintCount, loadPrintList],
  );

  function closePopup() {
    onPopupVisibleChange(false);
    setPopupVisible(false);
  }

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

  const openMoveRecordModal = () => {
    let modal;
    modal = Modal.confirm({
      title: _l('移动到'),
      width: 440,
      footer: null,
      content: (
        <MoveRecordToOtherGroup
          {...{ appId, viewId, worksheetId, recordId }}
          view={view}
          currentGroupKey={currentGroupKey}
          groups={groups}
          groupControl={groupControl}
          onUpdate={onUpdate}
          onClose={() => modal.destroy()}
        />
      ),
    });
  };

  const sharedButtonProps = {
    projectId,
    appId,
    viewId,
    worksheetId,
    recordId,
    workId,
    instanceId,
    isCharge,
    sheetSwitchPermit,
    isDraft,
    entityName,
    loadBtns: loadButtons,
    triggerCallback: closePopup,
    onUpdate,
    isRecordLock,
    reloadRecord,
    isEditLock,
  };
  const { items: customButtonMenuItems, holder: customButtonMenuHolder } = useCustomButtonMenuItems({
    ...sharedButtonProps,
    buttons: customButtonsForRender,
    segments: customButtonSegments,
  });
  const menuItems = [];

  if (showRemoveRelation) {
    menuItems.push(
      {
        key: 'cancelRelate',
        icon: <Icon icon="close" className="Font18" />,
        label: _l('取消关联'),
        onClick: () => {
          onRemoveRelation();
        },
      },
      { key: 'cancelRelateDivider', type: 'divider' },
    );
  }

  preMenuItems.forEach((item, index) => {
    if (item === 'hr') {
      menuItems.push({ key: `preMenuDivider-${index}`, type: 'divider' });
      return;
    }

    menuItems.push({
      key: `preMenu-${index}`,
      className: 'printItem',
      icon: <Icon icon={item.icon} className="Font17" />,
      label: item.text,
      onClick: () => {
        if (_.isFunction(item.fn)) {
          item.fn();
        }
      },
    });
  });

  if (
    !customButtonLoading &&
    !customButtons.length &&
    !showRemoveRelation &&
    !showShare &&
    !showCopy &&
    !(showPrint && isOpenPermit(permitList.recordPrintSwitch, sheetSwitchPermit, viewId)) &&
    !showOpenInNew &&
    !showDel &&
    !showEditForm
  ) {
    menuItems.push({
      key: 'empty',
      style: STATUS_ITEM_STYLE,
      disabled: true,
      label: <Empty>{_l('无可用的操作')}</Empty>,
    });
  }

  if (customButtonLoading && (!defaultCustomButtons || !!defaultCustomButtons.length)) {
    menuItems.push({
      key: 'loading',
      style: STATUS_ITEM_STYLE,
      disabled: true,
      label: (
        <Loading>
          <i className="icon icon-loading_button"></i>
        </Loading>
      ),
    });
  }

  if (customButtonMenuItems.length) {
    menuItems.push(...customButtonMenuItems);
    menuItems.push({ key: 'customButtonsDivider', type: 'divider' });
  }

  if (showCopy) {
    menuItems.push({
      key: 'copy',
      className: 'printItem',
      icon: <Icon icon="copy" className="Font17" />,
      label: _l('复制%02003'),
      onClick: () => {
        if (window.isPublicApp) {
          alert(_l('预览模式下，不能操作'), 3);
          return;
        }

        handleCopyRecord({
          worksheetId,
          viewId,
          recordId,
          onCopy,
          onCopySuccess,
          relateRecordControlId,
          currentGroup,
        });
      },
    });
  }

  if (showRecreate) {
    menuItems.push({
      key: 'reCreate',
      className: 'printItem',
      icon: <Icon icon="copy_all" className="Font17" />,
      label: _l('重新创建'),
      onClick: () => {
        if (window.isPublicApp) {
          alert(_l('预览模式下，不能操作'), 3);
          return;
        }

        onRecreate({ group: currentGroup });
        emitter.emit('ROWS_UPDATE');
      },
    });
  }

  if (showCopyId) {
    menuItems.push({
      key: 'copyID',
      className: 'printItem',
      icon: <Icon className="Font17" icon="ID" />,
      label: _l('复制 ID'),
      onClick: () => {
        copy(recordId);
        alert(_l('复制成功'), 1);
      },
    });
  }

  if (showCopyId || showRecreate) {
    menuItems.push({ key: 'copyDivider', type: 'divider' });
  }

  if (canFav) {
    menuItems.push({
      key: 'collect',
      className: 'printItem',
      icon: (
        <Icon
          className="Font17"
          icon={!isFavorite ? 'star_outline' : 'star'}
          style={{ color: isFavorite ? 'var(--color-yellow)' : '' }}
        />
      ),

      label: isFavorite ? _l('取消收藏') : _l('收藏'),
      onClick: handleCollectRecord,
    });
  }

  if (groupControl && groupControl.type !== 30 && allowEdit && !isRecordLock && groupControlPermission?.editable) {
    menuItems.push({
      key: 'move',
      className: 'printItem',
      icon: <Icon icon="swap_horiz" className="Font17" />,
      label: _l('移动到'),
      onClick: () => {
        if (window.isPublicApp) {
          alert(_l('预览模式下，不能操作'), 3);
          return;
        }

        openMoveRecordModal();
      },
    });
  }

  if (showShare) {
    menuItems.push({
      key: 'share',
      className: 'printItem',
      icon: <Icon icon="share" className="Font17" />,
      label: _l('分享%02004'),
      onClick: () => {
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
          openShareDialog,
        });
      },
    });
  }

  if (showPrint) {
    menuItems.push(...printMenuItems);
  }

  if (!window.isPublicApp && showOpenInNew) {
    menuItems.push({
      key: 'openNewPage',
      icon: <Icon icon="launch" className="Font17" />,
      label: _l('新页面打开%02001'),
      onClick: () => {
        handleOpenInNew({ appId, worksheetId, viewId, recordId });
      },
    });
  }

  if (showLock) {
    menuItems.push({
      key: 'editLock',
      icon: <Icon icon={isRecordLock ? 'task-new-no-locked' : 'lock'} className="Font17" />,
      label: isRecordLock ? _l('解锁') : _l('锁定'),
      onClick: () => {
        updateRecordLock();
      },
    });
  }

  if (showDel && from !== RECORD_INFO_FROM.WORKFLOW && !isRecordLock) {
    menuItems.push({
      key: 'delete',
      className: 'deleteItem',
      danger: !isRelateRecordTable,
      icon: <Icon icon="trash" className="Font17" />,
      label: _l('删除%02000'),
      onClick: () => {
        if (window.isPublicApp) {
          alert(_l('预览模式下，不能操作'), 3);
          return;
        }

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
        });
      },
    });
  }

  if (showHr && showEditForm) {
    menuItems.push({ key: 'editFormDivider', type: 'divider' });
  }

  if (!window.isPublicApp && showEditForm) {
    menuItems.push(
      {
        key: 'editSheet',
        className: 'openCustomWidget',
        icon: <Icon icon="settings" className="Font17" />,
        label: _l('编辑表单'),
        onClick: () => {
          hideRecordInfo();
          handleCustomWidget(worksheetId);
        },
      },
      {
        key: 'editCustomAction',
        className: 'openCustomWidget',
        icon: <Icon icon="custom_actions" className="Font18" />,
        label: _l('编辑自定义动作'),
        onClick: () => {
          hideRecordInfo();
          navigateTo(`/worksheet/formSet/edit/${worksheetId}/customAction`);
        },
      },
    );

    if (!md.global.SysSettings.hideAIBasicFun) {
      menuItems.push({
        key: 'editAIAction',
        className: 'openCustomWidget',
        icon: <Icon icon="auto_awesome" className="Font17" />,
        label: _l('编辑AI 动作'),
        onClick: () => {
          hideRecordInfo();
          navigateTo(`/worksheet/formSet/edit/${worksheetId}/aiAction`);
        },
      });
    }
  }

  return (
    <React.Fragment>
      {printMenuHolder}
      {customButtonMenuHolder}
      <Dropdown
        trigger={Array.isArray(action) ? action : [action]}
        classNames={{ root: 'relateRecordDropdownPopup' }}
        getPopupContainer={popupContainer || getDefaultPopupContainer}
        open={popupVisible}
        onOpenChange={changePopupVisible}
        placement={placement}
        mouseEnterDelay={mouseEnterDelay}
        menu={{
          items: menuItems,
          selectable: false,
          onOpenChange: handleMenuOpenChange,
          style: { ...DROPDOWN_MENU_STYLE, maxHeight: maxHeight || 500 },
        }}
      >
        {children ? (
          React.cloneElement(children, popupVisible ? { style: { display: 'inline-block' } } : {})
        ) : (
          <MoreOperate className="moreOperate" style={popupVisible ? { display: 'inline-block' } : {}}>
            <i className="icon icon-more_horiz"></i>
          </MoreOperate>
        )}
      </Dropdown>
    </React.Fragment>
  );
}

RecordOperate.propTypes = {
  placement: PropTypes.string,
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

const RecordOperateWithShareDialog = withOpeners(RecordOperate, {
  openShareDialog: useShareDialog,
});

export const memodRecordOperate = React.memo(
  (...args) => {
    return <RecordOperateWithShareDialog {...args} />;
  },
  (prevProps, nextProps) => {
    console.log(prevProps, nextProps);
    return true;
  },
);

export default RecordOperateWithShareDialog;

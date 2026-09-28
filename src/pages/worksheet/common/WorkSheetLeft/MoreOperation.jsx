import React, { Fragment, lazy, Suspense, useEffect, useState } from 'react';
import copy from 'copy-to-clipboard';
import _ from 'lodash';
import { Icon, LoadDiv } from 'ming-ui';
import { Checkbox, DeleteReconfirm, Dropdown, Input, Modal, Tooltip } from 'ming-ui/antd-components';
import homeAppApi from 'src/api/homeApp';
import sheetApi from 'src/api/worksheet';
import SheetMove from 'worksheet/common/SheetMove/SheetMove';
import selectIconDialog from 'worksheet/components/selectIconDialog';
import WorksheetReference, {
  useWorksheetReferenceDialog,
} from 'src/pages/widgetConfig/widgetSetting/components/WorksheetReference';
import { canEditApp, canEditData } from 'src/utils/domain/permission/app';
import { pathCompletion } from 'src/utils/platform/navigation/path';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';
import CreateNew from './CreateNew';
import { EditExternalLink } from './ExternalLink';

const LoadableDialogImportExcelCreate = lazy(() => import('worksheet/components/DialogImportExcelCreate'));

const CopySheetConfirmDescription = props => {
  const { workSheetId, type, workSheetName } = props;
  const [loading, setLoading] = useState(true);
  const [controls, setControls] = useState([]);
  const [isCopyRelevance, setIsCopyRelevance] = useState(false);
  const [selectIds, setSelectIds] = useState([]);
  const [name, setName] = useState(workSheetName);

  useEffect(() => {
    if (!type) {
      sheetApi
        .getWorksheetInfo({
          getTemplate: true,
          worksheetId: workSheetId,
        })
        .then(data => {
          const controls = _.get(data, 'template.controls') || [];
          setLoading(false);
          setControls(controls.filter(c => [29, 34, 35].includes(c.type)));
        });
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    props.onChanegSelectIds(selectIds);
  }, [selectIds]);

  useEffect(() => {
    props.onChangeName(name);
  }, [name]);

  const renderResetName = () => {
    return (
      <div className={type ? 'mTop10' : 'mTop24'}>
        <div className="mBottom10 Font14 textPrimary">{_l('副本名称')}</div>
        <Input className="w100" value={name} onChange={event => setName(event.target.value.slice(0, 100))} />
      </div>
    );
  };

  return type ? (
    renderResetName()
  ) : (
    <Fragment>
      <div className="mBottom10">{_l('仅复制目标工作表的所有配置，工作表下的数据不会被复制')}</div>
      {renderResetName()}
      {loading && <LoadDiv className="mTop10" />}
      {!!controls.length && (
        <Fragment>
          <div className="mTop24 mBottom20 Font14">
            <Checkbox
              className="mBottom10 Font14 textPrimary"
              checked={isCopyRelevance}
              onChange={() => {
                setIsCopyRelevance(!isCopyRelevance);
              }}
            >
              {<span className="Font14">{_l('同时复制关联关系')}</span>}
            </Checkbox>
            <div className="textTertiary mLeft25">{_l('未勾选时，所有关联记录字段将被复制为文本字段')}</div>
            <div className="textTertiary mLeft25">{_l('勾选时，选中的关联记录字段将会完整复制与其他表的关联关系')}</div>
          </div>
          {isCopyRelevance && (
            <Fragment>
              <Checkbox
                checked={selectIds.length === controls.length}
                indeterminate={selectIds.length === controls.length ? false : selectIds.length}
                className="mBottom10"
                onChange={event => {
                  if (!event.target.checked) {
                    setSelectIds([]);
                  } else {
                    setSelectIds(controls.map(c => c.controlId));
                  }
                }}
              >
                {
                  <Fragment>
                    <span className="Font14 textPrimary mRight2">{_l('全选')}</span>
                    <span className="Font14 textTertiary">{`${selectIds.length}/${controls.length}`}</span>
                  </Fragment>
                }
              </Checkbox>
              <div className="mLeft25" style={{ maxHeight: 200, overflowY: 'auto' }}>
                {controls.map(c => (
                  <Checkbox
                    key={c.controlId}
                    className="mBottom10 textPrimary w100"
                    checked={selectIds.includes(c.controlId)}
                    onChange={event => {
                      if (!event.target.checked) {
                        setSelectIds(selectIds.filter(id => id !== c.controlId));
                      } else {
                        const data = selectIds.concat(c.controlId);
                        setSelectIds(data);
                      }
                    }}
                  >
                    {<span className="Font14">{c.controlName}</span>}
                  </Checkbox>
                ))}
              </div>
            </Fragment>
          )}
        </Fragment>
      )}
    </Fragment>
  );
};

const handleDeleteWorkSheet = ({ projectId, appId, groupId, appItem, sheetListActions }) => {
  const { workSheetName: name, type } = appItem;
  const nameMap = {
    0: _l('工作表'),
    1: _l('自定义页面'),
    3: _l('对话机器人'),
  };
  const titleMap = {
    0: _l('删除工作表 “%0”', name),
    1: _l('删除自定义页面 “%0”', name),
    3: _l('删除对话机器人 “%0”', name),
  };
  const isChatBot = type === 3;
  DeleteReconfirm({
    style: { width: 560 },
    title: titleMap[type],
    description: (
      <div>
        <span style={{ color: 'var(--color-text-title)', fontWeight: 'bold' }}>
          {isChatBot
            ? _l('对话机器人下所有配置和历史对话将被删除。')
            : _l('注意：%0下所有配置和数据将被删除。', nameMap[type])}
        </span>
        {_l('请务必确认所有应用成员都不再需要此%0后，再执行此操作。', nameMap[type])}
      </div>
    ),
    expandBtn: type ? null : (
      <WorksheetReference
        type={2}
        globalSheetInfo={{
          appId,
          worksheetId: appItem.workSheetId,
          name,
        }}
      />
    ),
    data: [
      {
        text: isChatBot ? _l('我确认删除对话机器人和所有历史对话') : _l('我确认删除%0和所有数据', nameMap[type]),
        value: 1,
      },
    ],
    onOk: () => {
      sheetListActions.deleteSheet({
        type,
        appId,
        projectId,
        groupId,
        worksheetId: appItem.workSheetId,
        parentGroupId: appItem.parentGroupId,
      });
    },
  });
};

const handleDeleteGroup = ({ projectId, appId, groupId, appItem, sheetListActions }) => {
  const { type, workSheetId } = appItem;
  Modal.confirm({
    title: <div className="textError">{_l('确认删除分组 ?')}</div>,
    content: <span>{_l('此操作不会删除分组下的应用项')}</span>,
    okButtonProps: { danger: true },
    onOk: () => {
      sheetListActions.deleteSheet({
        type,
        appId,
        projectId,
        groupId,
        worksheetId: workSheetId,
      });
    },
  });
};

const handleCopyWorkSheet = props => {
  const { appId, groupId, appItem, sheetListActions } = props;
  const {
    workSheetId,
    workSheetName,
    type,
    icon,
    iconColor,
    iconUrl,
    parentGroupId,
    configuration,
    urlTemplate,
    createType,
  } = appItem;
  const copyArgs = {
    worksheetId: workSheetId,
    appId,
    appSectionId: groupId,
    name: workSheetName,
    relationControlIds: [],
  };

  const onOk = () => {
    copyArgs.name = copyArgs.name.trim();
    if (!copyArgs.name) {
      alert(_l('请填写名称'), 3);
      return false;
    }

    if (type === 1) {
      sheetListActions.copyCustomPage(
        {
          appId,
          appSectionId: groupId,
          name: copyArgs.name,
          id: workSheetId,
          icon,
          iconColor,
          iconUrl,
          parentGroupId,
        },
        {
          configuration,
          urlTemplate,
          createType,
        },
      );
    } else if (type === 3) {
      sheetListActions.copyChatBot({
        appId,
        appSectionId: groupId,
        name: copyArgs.name,
        id: workSheetId,
        icon,
        iconColor,
        iconUrl,
        parentGroupId,
      });
    } else {
      sheetListActions.copySheet(copyArgs, {
        icon,
        iconColor,
        iconUrl,
        parentGroupId,
      });
    }
  };

  const nameMap = {
    0: _l('工作表'),
    1: _l('自定义页面'),
    3: _l('对话机器人'),
  };
  Modal.confirm({
    width: 480,
    className: 'copySheetDialog',
    title: _l('复制%0 “%1”', nameMap[type], workSheetName),
    content: (
      <CopySheetConfirmDescription
        type={type}
        workSheetId={workSheetId}
        workSheetName={_l('%0-复制', workSheetName)}
        onChanegSelectIds={ids => {
          copyArgs.relationControlIds = ids;
        }}
        onChangeName={value => {
          copyArgs.name = value;
        }}
      />
    ),
    okText: _l('复制'),
    cancelText: _l('取消'),
    onOk,
  });
};

const handleUpdateWorksheetStatus = (status, props) => {
  const { appId, appItem, sheetListActions } = props;
  homeAppApi
    .setWorksheetStatus({
      appId,
      worksheetId: appItem.workSheetId,
      status,
    })
    .then(result => {
      if (result.data) {
        sheetListActions.updateSheetListAppItem(appItem.workSheetId, { status });
      }
    });
};

const deleteText = {
  0: _l('删除工作表%02029'),
  1: _l('删除自定义页面'),
  2: _l('删除分组%02012'),
  3: _l('删除对话机器人'),
};

export default function MoreOperation(props) {
  const { children, appItem, appPkg, isGroup } = props;
  const { projectId, appId, groupId, activeSheetId, sheetListActions, onChangeEdit } = props;
  const [popupVisible, setPopupVisible] = useState(false);
  const [sheetMoveVisible, setSheetMoveVisible] = useState(false);
  const [createType, setCreateType] = useState('');
  const [externalLinkVisible, setExternalLinkVisible] = useState(false);
  const { open: openWorksheetReferenceDialog, holder: worksheetReferenceDialogHolder } = useWorksheetReferenceDialog();
  const isEditApp = canEditApp(_.get(appPkg, ['permissionType']), _.get(appPkg, ['isLock']));
  const isEditData = canEditData(appPkg?.permissionType); //运营者
  const isWorksheet = appItem.type === 0;
  const isActive = activeSheetId === appItem.workSheetId;

  const handleCreateAppItem = (type, args) => {
    sheetListActions.createAppItem({
      appId,
      groupId: appItem.workSheetId,
      firstGroupId: groupId,
      type,
      ...args,
    });
    setCreateType('');
  };

  const handleMarkApp = () => {
    homeAppApi
      .markApp({
        projectId,
        appId,
        itemId: appItem.workSheetId,
        isMark: !appItem.isMarked,
        type: appItem.type === 0 ? 2 : appItem.type, // 转换类型--0传2(工作表),1传1(自定义页面)
      })
      .then(res => {
        if (res) {
          alert(!appItem.isMarked ? _l('收藏成功') : _l('已取消收藏'));
          sheetListActions.updateSheetListAppItem(appItem.workSheetId, { isMarked: !appItem.isMarked });
        }
      })
      .catch(_requestError => {
        alertIfNotUnauthorized(_requestError, !appItem.isMarked ? _l('收藏失败！') : _l('取消收藏失败！'), 2);
      });
  };

  const selectIcon = () => {
    selectIconDialog({
      projectId,
      className: 'sheetSelectIconWrap relative',
      isActive,
      appItem,
      name: appItem.workSheetName,
      icon: appItem.icon,
      iconColor: appPkg.iconColor,
      appId,
      groupId,
      workSheetId: appItem.workSheetId,
      updateSheetListAppItem: sheetListActions.updateSheetListAppItem,
      onCancel: () => {
        sheetListActions.updateSheetListAppItem(appItem.workSheetId, {
          edit: false,
        });
      },
    });
  };

  const closeMenu = () => setPopupVisible(false);
  const renderMenuLabel = text => <span className="text">{text}</span>;
  const renderMenuIcon = (icon, className = 'Font18', style) => (
    <Icon
      icon={icon}
      className={`${className}${['trash', 'task-star', 'star-hollow'].includes(icon) ? '' : ' textTertiary'}`}
      style={style}
    />
  );
  const renderHideStatusLabel = (text, checked) => (
    <span className="flexRow alignItemsCenter justifyContentBetween">
      <span className="text">{text}</span>
      {checked && <Icon icon="done" className="Font18 colorPrimary" />}
    </span>
  );

  const getCollectMenuItem = (iconClassName = 'Font18') => ({
    key: 'collect',
    icon: renderMenuIcon(appItem.isMarked ? 'task-star' : 'star-hollow', iconClassName, {
      color: appItem.isMarked ? 'var(--color-yellow)' : 'var(--color-text-tertiary)',
    }),
    label: renderMenuLabel(appItem.isMarked ? _l('取消收藏') : _l('收藏')),
    onClick: () => {
      closeMenu();
      handleMarkApp();
    },
  });

  const getHideMenuItems = () => [
    {
      key: 'hideAll',
      label: renderHideStatusLabel(_l('全隐藏'), appItem.status === 2),
      onClick: () => {
        closeMenu();
        handleUpdateWorksheetStatus(appItem.status === 2 ? 1 : 2, props);
      },
    },
    {
      key: 'hideInPC',
      label: renderHideStatusLabel(_l('仅在PC端隐藏'), appItem.status === 3),
      onClick: () => {
        closeMenu();
        handleUpdateWorksheetStatus(appItem.status === 3 ? 1 : 3, props);
      },
    },
    {
      key: 'hideInMobile',
      label: renderHideStatusLabel(_l('仅在移动端隐藏'), appItem.status === 4),
      onClick: () => {
        closeMenu();
        handleUpdateWorksheetStatus(appItem.status === 4 ? 1 : 4, props);
      },
    },
  ];

  const getMenuItems = () => {
    if (!(canEditApp(_.get(appPkg, ['permissionType'])) || canEditData(_.get(appPkg, ['permissionType'])))) {
      return [getCollectMenuItem('Font16')];
    }

    const showDivider = !isGroup || (isEditApp && appItem.type === 1 && (appItem.urlTemplate ? true : isActive));

    return _.flattenDeep([
      !isGroup && getCollectMenuItem(),
      isEditApp &&
        appItem.type === 1 &&
        (appItem.urlTemplate ? true : isActive) && {
          key: 'editExternalLinkCanvas',
          icon: renderMenuIcon('settings'),
          label: renderMenuLabel(appItem.urlTemplate ? _l('编辑外部链接') : _l('编辑画布')),
          onClick: () => {
            if (appItem.urlTemplate) {
              setExternalLinkVisible(true);
            } else {
              window.editCustomPage && window.editCustomPage();
            }

            closeMenu();
          },
        },
      showDivider && { key: 'baseDivider', type: 'divider', className: 'mTop5 mBottom5' },
      {
        key: 'editNameIcon',
        icon: renderMenuIcon('edit'),
        label: renderMenuLabel(onChangeEdit ? _l('修改名称') : _l('修改名称和图标%02023')),
        onClick: () => {
          if (onChangeEdit) {
            onChangeEdit(appItem.workSheetId);
          } else {
            selectIcon();
          }

          closeMenu();
        },
      },
      (isEditApp || isEditData) &&
        isWorksheet && [
          isEditApp && {
            key: 'workflow',
            icon: renderMenuIcon('workflow'),
            label: renderMenuLabel(_l('查看工作流')),
            onClick: () => {
              closeMenu();
              window.open(pathCompletion(`/app/${appId}/workflow` + `/${appItem.workSheetId}`, '__blank'));
            },
          },
          isEditApp && {
            key: 'reference',
            icon: renderMenuIcon('db_index'),
            label: renderMenuLabel(_l('查看引用关系')),
            onClick: () => {
              closeMenu();
              openWorksheetReferenceDialog({
                globalSheetInfo: { appId, worksheetId: appItem.workSheetId, name: appItem.workSheetName },
                type: 2,
              });
            },
          },
          isEditData && {
            key: 'logs',
            icon: renderMenuIcon('wysiwyg'),
            label: renderMenuLabel(_l('查看日志')),
            onClick: () => {
              closeMenu();
              window.open(pathCompletion(`/app/${appId}/logs/${projectId}/${appItem.workSheetId}`, '__blank'));
            },
          },
          {
            key: 'copyID',
            icon: renderMenuIcon('ID'),
            label: renderMenuLabel(_l('复制 ID')),
            onClick: () => {
              closeMenu();
              copy(appItem.workSheetId);
              alert(_l('复制成功'));
            },
          },
          isEditApp && { key: 'worksheetDivider', type: 'divider', className: 'mTop5 mBottom5' },
        ],
      isEditApp && [
        !isGroup && {
          key: 'copy',
          icon: renderMenuIcon('content-copy'),
          label: renderMenuLabel(_l('复制%02022')),
          onClick: () => {
            handleCopyWorkSheet(props);
            closeMenu();
          },
        },
        {
          key: 'move',
          icon: renderMenuIcon('swap_horiz'),
          label: renderMenuLabel(_l('移动到%02021')),
          onClick: () => {
            setSheetMoveVisible(true);
            closeMenu();
          },
        },
        {
          key: 'hideFromNav',
          icon: renderMenuIcon('visibility_off'),
          label: (
            <span className="text flexRow alignItemsCenter">
              <span>{_l('从导航中隐藏%02020')}</span>
              <Tooltip
                title={
                  <span>
                    {_l(
                      '设为隐藏后，普通用户在导航中将看不到此应用项入口，仅系统角色在导航中可见（包含管理员、开发者），应用项权限依然遵循角色权限原则。此配置通常用于不需要用户直接访问，仅作为配置用途的应用项，如：关联的明细表、参数表等。',
                    )}
                  </span>
                }
              >
                <Icon className="Font14 textTertiary" icon="help" style={{ position: 'relative', left: 5 }} />
              </Tooltip>
            </span>
          ),
          popupClassName: 'worksheetItemHideOperate',
          popupOffset: [0, 0],
          popupStyle: { minWidth: 180 },
          children: getHideMenuItems(),
        },
        isGroup && [
          { key: 'createDivider', type: 'divider', className: 'mTop5 mBottom5' },
          {
            key: 'createGroup',
            type: 'group',
            label: _l('新建'),
            children: [
              {
                key: 'emptyCreate',
                icon: renderMenuIcon('plus'),
                label: renderMenuLabel(_l('从空白创建工作表%02015')),
                onClick: () => {
                  setCreateType('worksheet');
                  closeMenu();
                },
              },
              {
                key: 'excelCreate',
                icon: renderMenuIcon('new_excel'),
                label: renderMenuLabel(_l('从Excel创建工作表%02014')),
                onClick: () => {
                  setCreateType('importExcel');
                  closeMenu();
                },
              },
              {
                key: 'customPage',
                icon: renderMenuIcon('dashboard'),
                label: renderMenuLabel(_l('自定义页面%02013')),
                onClick: () => {
                  setCreateType('customPage');
                  closeMenu();
                },
              },
              appPkg.workflowAgentFeatureType === '1' &&
                !md.global.SysSettings.hideAIBasicFun && {
                  key: 'chatbot',
                  icon: renderMenuIcon('AI_Agent', 'Font20'),
                  label: renderMenuLabel(_l('对话机器人')),
                  onClick: () => {
                    setCreateType('chatbot');
                    closeMenu();
                  },
                },
            ].filter(Boolean),
          },
        ],
        { key: 'deleteDivider', type: 'divider', className: 'mTop5 mBottom5' },
        {
          key: 'delete',
          danger: true,
          className: 'delete',
          icon: renderMenuIcon('trash'),
          label: renderMenuLabel(deleteText[appItem.type]),
          onClick: () => {
            isGroup ? handleDeleteGroup(props) : handleDeleteWorkSheet(props);
            closeMenu();
          },
        },
      ],
    ]).filter(Boolean);
  };

  useEffect(() => {
    const appItemEl = document.querySelector(`.workSheetItem-${appItem.workSheetId}`);

    if (popupVisible) {
      appItemEl && appItemEl.classList.add('hover');
    } else {
      appItemEl && appItemEl.classList.remove('hover');
    }
  }, [popupVisible]);

  useEffect(() => {
    appItem.edit && selectIcon();
  }, [appItem.edit]);

  return (
    <Fragment>
      {worksheetReferenceDialogHolder}
      <Dropdown
        trigger={['click']}
        open={popupVisible}
        onOpenChange={setPopupVisible}
        placement="bottomLeft"
        classNames={{
          root: `worksheetItemOperate worksheetItemOperate-${appItem.workSheetId}${isGroup ? ' grouping' : ''}`,
        }}
        menu={{
          items: getMenuItems(),
          selectable: false,
          selectedKeys: [],
          style: { minWidth: 220 },
          onClick: ({ domEvent }) => domEvent.stopPropagation(),
        }}
      >
        {children}
      </Dropdown>
      {sheetMoveVisible && (
        <SheetMove
          appId={appId}
          groupId={groupId}
          appItem={appItem}
          onSave={args => {
            const { resultAppId, ResultAppSectionId } = args;
            setPopupVisible(false);
            setSheetMoveVisible(false);
            if ((appItem.parentGroupId || groupId) === ResultAppSectionId) {
              alert(_l('相同组不需要移动'), 3);
              return;
            }

            sheetListActions.moveSheet({
              sourceAppId: appId,
              resultAppId,
              sourceAppSectionId: groupId,
              ResultAppSectionId,
              workSheetsInfo: [appItem],
            });
          }}
          onClose={() => setSheetMoveVisible(false)}
        />
      )}
      {externalLinkVisible && (
        <EditExternalLink
          appId={appId}
          groupId={groupId}
          appItem={appItem}
          updateSheetListAppItem={sheetListActions.updateSheetListAppItem}
          onCancel={() => setExternalLinkVisible(false)}
        />
      )}
      {!!createType &&
        (['customPage', 'worksheet', 'chatbot'].includes(createType) ? (
          <CreateNew
            type={createType}
            onImportExcel={() => {
              setCreateType('importExcel');
              setPopupVisible(false);
            }}
            onCreate={handleCreateAppItem}
            onCancel={() => setCreateType('')}
          />
        ) : (
          <Suspense fallback={null}>
            <LoadableDialogImportExcelCreate
              projectId={projectId}
              appId={appId}
              groupId={appItem.workSheetId}
              onCancel={() => setCreateType('')}
              createType="worksheet"
              refreshPage={() => {
                sheetListActions.getSheetList({ appId, appSectionId: appItem.parentId });
              }}
            />
          </Suspense>
        ))}
    </Fragment>
  );
}

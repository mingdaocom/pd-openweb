import React, { Fragment, useEffect, useState } from 'react';
import copy from 'copy-to-clipboard';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Checkbox, DeleteReconfirm, Dialog, Icon, Input, LoadDiv, Menu, MenuItem } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import ConfirmButton from 'ming-ui/components/Dialog/ConfirmButton';
import homeAppApi from 'src/api/homeApp';
import sheetApi from 'src/api/worksheet';
import SelectIcon from 'worksheet/common/SelectIcon/SelectIcon';
import SheetMove from 'worksheet/common/SheetMove/SheetMove';
import DialogImportExcelCreate from 'worksheet/components/DialogImportExcelCreate';
import { canEditApp, canEditData } from 'worksheet/redux/actions/util';
import WorksheetReference, { renderDialog } from 'src/pages/widgetConfig/widgetSetting/components/WorksheetReference';
import CreateNew from './CreateNew';
import { EditExternalLink } from './ExternalLink';

const Operation = styled(Menu)`
  width: max-content;
  min-width: 220px;
  .Item-content {
    padding: 0 45px !important;
    .Icon {
      margin: 0 6px !important;
    }
    .text {
      margin-left: 0 !important;
    }
  }
`;

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
        <div className="mBottom10 Font14 Gray">{_l('副本名称')}</div>
        <Input className="w100 Gray" value={name} onChange={value => setName(value.slice(0, 100))} />
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
              className="mBottom10 Font14 Gray"
              checked={isCopyRelevance}
              text={<span className="Font14">{_l('同时复制关联关系')}</span>}
              onClick={() => {
                setIsCopyRelevance(!isCopyRelevance);
              }}
            />
            <div className="Gray_9e mLeft25">{_l('未勾选时，所有关联记录字段将被复制为文本字段')}</div>
            <div className="Gray_9e mLeft25">{_l('勾选时，选中的关联记录字段将会完整复制与其他表的关联关系')}</div>
          </div>
          {isCopyRelevance && (
            <Fragment>
              <Checkbox
                checked={selectIds.length === controls.length}
                indeterminate={selectIds.length === controls.length ? false : selectIds.length}
                className="mBottom10"
                text={
                  <Fragment>
                    <span className="Font14 Gray mRight2">{_l('全选')}</span>
                    <span className="Font14 Gray_9e">{`${selectIds.length}/${controls.length}`}</span>
                  </Fragment>
                }
                onClick={value => {
                  if (value) {
                    setSelectIds([]);
                  } else {
                    setSelectIds(controls.map(c => c.controlId));
                  }
                }}
              />
              <div className="mLeft25" style={{ maxHeight: 200, overflowY: 'auto' }}>
                {controls.map(c => (
                  <Checkbox
                    key={c.controlId}
                    className="mBottom10 Gray"
                    checked={selectIds.includes(c.controlId)}
                    text={<span className="Font14">{c.controlName}</span>}
                    onClick={value => {
                      if (value) {
                        setSelectIds(selectIds.filter(id => id !== c.controlId));
                      } else {
                        const data = selectIds.concat(c.controlId);
                        setSelectIds(data);
                      }
                    }}
                  />
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
    clickOmitText: true,
    style: { width: '560px' },
    title: (
      <div className="Bold">
        <i className="icon-error error" style={{ fontSize: '28px', marginRight: '8px' }}></i>
        {titleMap[type]}
      </div>
    ),
    description: (
      <div>
        <span style={{ color: '#151515', fontWeight: 'bold' }}>
          {isChatBot
            ? _l('对话机器人下所有配置和历史对话将被删除。')
            : _l('注意：%0下所有配置和数据将被删除。', nameMap[type])}
        </span>
        {_l('请务必确认所有应用成员都不再需要此%0后，再执行此操作。', nameMap[type])}
      </div>
    ),
    expandBtn: type ? null : (
      <span className="Left">
        <WorksheetReference
          type={2}
          globalSheetInfo={{
            appId,
            worksheetId: appItem.workSheetId,
            name,
          }}
        />
      </span>
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
  Dialog.confirm({
    buttonType: 'danger',
    title: <div className="Bold">{_l('确认删除分组 ?')}</div>,
    description: <span>{_l('此操作不会删除分组下的应用项')}</span>,
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
      return;
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
    dialogConfirm();
  };
  const nameMap = {
    0: _l('工作表'),
    1: _l('自定义页面'),
    3: _l('对话机器人'),
  };
  const dialogConfirm = Dialog.confirm({
    width: 480,
    className: 'copySheetDialog',
    title: <span className="bold">{_l('复制%0 “%1”', nameMap[type], workSheetName)}</span>,
    description: (
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
    footer: (
      <div className="Dialog-footer-btns">
        <ConfirmButton
          action={() => {
            dialogConfirm();
          }}
          type="link"
        >
          {_l('取消')}
        </ConfirmButton>
        <ConfirmButton action={onOk} type="primary">
          {_l('复制')}
        </ConfirmButton>
      </div>
    ),
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

export default function MoreOperation(props) {
  const { children, appItem, appPkg, isGroup } = props;
  const { projectId, appId, groupId, activeSheetId, sheetListActions, onChangeEdit } = props;
  const [popupVisible, setPopupVisible] = useState(false);
  const [selectIconVisible, setSelectIconVisible] = useState(
    appPkg.currentPcNaviStyle === 2 ? false : appItem.edit || false,
  );
  const [sheetMoveVisible, setSheetMoveVisible] = useState(false);
  const [createType, setCreateType] = useState('');
  const [externalLinkVisible, setExternalLinkVisible] = useState(false);

  const isEditApp = canEditApp(_.get(appPkg, ['permissionType']), _.get(appPkg, ['isLock']));
  const isEditData = canEditData(appPkg?.permissionType); //运营者
  const isWorksheet = appItem.type === 0;
  const isActive = activeSheetId === appItem.workSheetId;
  const deleteText = {
    0: _l('删除工作表%02029'),
    1: _l('删除自定义页面'),
    2: _l('删除分组%02012'),
    3: _l('删除对话机器人'),
  };

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
      .catch(() => {
        alert(!appItem.isMarked ? _l('收藏失败！') : _l('取消收藏失败！'), 2);
      });
  };

  const renderMenu = () => {
    if (!(canEditApp(_.get(appPkg, ['permissionType'])) || canEditData(_.get(appPkg, ['permissionType'])))) {
      return (
        <Operation className={`worksheetItemOperate worksheetItemOperate-${appItem.workSheetId}`}>
          <MenuItem
            data-event="collect"
            icon={
              <Icon
                icon={appItem.isMarked ? 'task-star' : 'star-hollow'}
                className="Font16"
                style={{ color: appItem.isMarked ? '#ffc402' : '#9e9e9e' }}
              />
            }
            onClick={handleMarkApp}
          >
            <span className="text">{appItem.isMarked ? _l('取消收藏') : _l('收藏')}</span>
          </MenuItem>
        </Operation>
      );
    }

    const showDivider = !isGroup || (isEditApp && appItem.type === 1 && (appItem.urlTemplate ? true : isActive));

    return (
      <Operation className={`worksheetItemOperate worksheetItemOperate-${appItem.workSheetId}`}>
        {!isGroup && (
          <MenuItem
            data-event="collect"
            icon={
              <Icon
                icon={appItem.isMarked ? 'task-star' : 'star-hollow'}
                className="Font18"
                style={{ color: appItem.isMarked ? '#ffc402' : '#9e9e9e' }}
              />
            }
            onClick={handleMarkApp}
          >
            <span className="text">{appItem.isMarked ? _l('取消收藏') : _l('收藏')}</span>
          </MenuItem>
        )}
        {isEditApp && appItem.type === 1 && (appItem.urlTemplate ? true : isActive) && (
          <MenuItem
            data-event="editExternalLinkCanvas"
            icon={<Icon icon="settings" className="Font18" />}
            onClick={() => {
              if (appItem.urlTemplate) {
                setExternalLinkVisible(true);
              } else {
                window.editCustomPage && window.editCustomPage();
              }
              setPopupVisible(false);
            }}
          >
            <span className="text">{appItem.urlTemplate ? _l('编辑外部链接') : _l('编辑画布')}</span>
          </MenuItem>
        )}

        {showDivider && <hr className="splitter" />}

        <MenuItem
          data-event="editNameIcon"
          icon={<Icon icon="edit" className="Font18" />}
          onClick={() => {
            if (onChangeEdit) {
              onChangeEdit(appItem.workSheetId);
            } else {
              setSelectIconVisible(true);
            }
            setPopupVisible(false);
          }}
        >
          <span className="text">{onChangeEdit ? _l('修改名称') : _l('修改名称和图标%02023')}</span>
        </MenuItem>

        {(isEditApp || isEditData) && isWorksheet && (
          <Fragment>
            {isEditApp && (
              <>
                <MenuItem
                  data-event="workflow"
                  icon={<Icon icon="workflow" className="Font18" />}
                  onClick={() => {
                    setPopupVisible(false);
                    window.open(`/app/${appId}/workflow` + `/${appItem.workSheetId}`, '__blank');
                  }}
                >
                  <span className="text">{_l('查看工作流')}</span>
                </MenuItem>
                <MenuItem
                  data-event="reference"
                  icon={<Icon icon="db_index" className="Font18" />}
                  onClick={() => {
                    setPopupVisible(false);
                    renderDialog({
                      globalSheetInfo: { appId, worksheetId: appItem.workSheetId, name: appItem.workSheetName },
                      type: 2,
                    });
                  }}
                >
                  <span className="text">{_l('查看引用关系')}</span>
                </MenuItem>
              </>
            )}

            {isEditData && (
              <MenuItem
                data-event="logs"
                icon={<Icon icon="wysiwyg" className="Font18" />}
                onClick={() => {
                  setPopupVisible(false);
                  window.open(`/app/${appId}/logs/${projectId}/${appItem.workSheetId}`, '__blank');
                }}
              >
                <span className="text">{_l('查看日志')}</span>
              </MenuItem>
            )}

            <MenuItem
              data-event="copyID"
              icon={<Icon icon="ID" className="Font18" />}
              onClick={() => {
                setPopupVisible(false);
                copy(appItem.workSheetId);
                alert(_l('复制成功'));
              }}
            >
              <span className="text">{_l('复制ID')}</span>
            </MenuItem>

            {isEditApp && <hr className="splitter" />}
          </Fragment>
        )}

        {isEditApp && (
          <Fragment>
            {!isGroup && (
              <MenuItem
                data-event="copy"
                icon={<Icon icon="content-copy" className="Font18" />}
                onClick={() => {
                  handleCopyWorkSheet(props);
                  setPopupVisible(false);
                }}
              >
                <span className="text">{_l('复制%02022')}</span>
              </MenuItem>
            )}
            <MenuItem
              data-event="move"
              icon={<Icon icon="swap_horiz" className="Font18" />}
              onClick={() => {
                setSheetMoveVisible(true);
                setPopupVisible(false);
              }}
            >
              <span className="text">{_l('移动到%02021')}</span>
            </MenuItem>

            <Trigger
              // popupVisible={exportVisible}
              // onPopupVisibleChange={visible => setExportVisible(visible)}
              getPopupContainer={() => document.querySelector(`.worksheetItemOperate-${appItem.workSheetId}`)}
              action={['hover', 'click']}
              popupPlacement="right"
              builtinPlacements={{
                right: { points: ['cl', 'cr'] },
              }}
              popup={
                <Menu className="hideItemOperate" style={{ width: 180 }}>
                  <MenuItem
                    data-event="hideAll"
                    onClick={() => {
                      setPopupVisible(false);
                      handleUpdateWorksheetStatus(appItem.status === 2 ? 1 : 2, props);
                    }}
                  >
                    <span className="text flexRow">{_l('全隐藏')}</span>
                    {appItem.status === 2 && (
                      <Icon icon="done" className="Font18" style={{ right: 20, top: 0, left: 'initial' }} />
                    )}
                  </MenuItem>
                  <MenuItem
                    data-event="hideInPC"
                    onClick={() => {
                      setPopupVisible(false);
                      handleUpdateWorksheetStatus(appItem.status === 3 ? 1 : 3, props);
                    }}
                  >
                    <span className="text flexRow">{_l('仅在PC端隐藏')}</span>
                    {appItem.status === 3 && (
                      <Icon icon="done" className="Font18" style={{ right: 20, top: 0, left: 'initial' }} />
                    )}
                  </MenuItem>
                  <MenuItem
                    data-event="hideInMobile"
                    onClick={() => {
                      setPopupVisible(false);
                      handleUpdateWorksheetStatus(appItem.status === 4 ? 1 : 4, props);
                    }}
                  >
                    <span className="text flexRow">{_l('仅在移动端隐藏')}</span>
                    {appItem.status === 4 && (
                      <Icon icon="done" className="Font18" style={{ right: 20, top: 0, left: 'initial' }} />
                    )}
                  </MenuItem>
                </Menu>
              }
              popupAlign={{ offset: [0, -20] }}
            >
              <MenuItem data-event="hideFromNav" icon={<Icon icon="visibility_off" className="Font18" />}>
                <span className="text flexRow">
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
                    <Icon className="Font14" icon={'help'} style={{ position: 'relative', left: 5 }} />
                  </Tooltip>
                  <Icon icon="arrow-right-tip Font15" style={{ fontSize: '16px', right: '10px', left: 'initial' }} />
                </span>
              </MenuItem>
            </Trigger>

            {isGroup && (
              <Fragment>
                <hr className="splitter" />
                <div className="Gray_9e pLeft12 mTop10">{_l('新建')}</div>
                <MenuItem
                  data-event="emptyCreate"
                  onClick={() => {
                    setCreateType('worksheet');
                    setPopupVisible(false);
                  }}
                >
                  <Icon icon="plus" className="Font18" />
                  <span className="text">{_l('从空白创建工作表%02015')}</span>
                </MenuItem>
                <MenuItem
                  data-event="excelCreate"
                  onClick={() => {
                    setCreateType('importExcel');
                    setPopupVisible(false);
                  }}
                >
                  <Icon icon="new_excel" className="Font18" />
                  <span className="text">{_l('从Excel创建工作表%02014')}</span>
                </MenuItem>
                <MenuItem
                  data-event="customPage"
                  icon={<Icon icon="dashboard" className="Font18" />}
                  onClick={() => {
                    setCreateType('customPage');
                    setPopupVisible(false);
                  }}
                >
                  <span className="text">{_l('自定义页面%02013')}</span>
                </MenuItem>
                {appPkg.workflowAgentFeatureType === '1' && !md.global.SysSettings.hideAIBasicFun && (
                  <MenuItem
                    data-event="chatbot"
                    icon={<Icon icon="AI_Agent" className="Font20" />}
                    onClick={() => {
                      setCreateType('chatbot');
                      setPopupVisible(false);
                    }}
                  >
                    <span className="text">{_l('对话机器人')}</span>
                  </MenuItem>
                )}
              </Fragment>
            )}
            <hr className="splitter" />
            <MenuItem
              data-event="delete"
              icon={<Icon icon="trash" className="Font18" />}
              className="delete"
              onClick={() => {
                isGroup ? handleDeleteGroup(props) : handleDeleteWorkSheet(props);
                setPopupVisible(false);
              }}
            >
              <span className="text">{deleteText[appItem.type]}</span>
            </MenuItem>
          </Fragment>
        )}
      </Operation>
    );
  };

  useEffect(() => {
    const appItemEl = document.querySelector(`.workSheetItem-${appItem.workSheetId}`);
    if (popupVisible) {
      appItemEl && appItemEl.classList.add('hover');
    } else {
      appItemEl && appItemEl.classList.remove('hover');
    }
  }, [popupVisible]);

  return (
    <Fragment>
      <Trigger
        popupVisible={popupVisible}
        onPopupVisibleChange={visible => {
          setPopupVisible(visible);
        }}
        action={['click']}
        popup={renderMenu()}
        popupAlign={{ points: ['tl', 'bl'], offset: [1, 1], overflow: { adjustX: true, adjustY: true } }}
      >
        {children}
      </Trigger>
      <Trigger
        popupVisible={selectIconVisible}
        action={['click']}
        popup={
          <SelectIcon
            projectId={projectId}
            className="sheetSelectIconWrap relative"
            isActive={isActive}
            appItem={appItem}
            name={appItem.workSheetName}
            icon={appItem.icon}
            iconColor={appPkg.iconColor}
            appId={appId}
            groupId={groupId}
            workSheetId={appItem.workSheetId}
            updateSheetListAppItem={sheetListActions.updateSheetListAppItem}
            onCancel={() => {
              sheetListActions.updateSheetListAppItem(appItem.workSheetId, {
                edit: false,
              });
              setSelectIconVisible(false);
            }}
          />
        }
        destroyPopupOnHide={true}
        popupAlign={{
          points: ['tl', 'bl'],
          offset: appPkg.currentPcNaviStyle === 2 ? [0, 5] : [-220, 20],
          overflow: { adjustX: true, adjustY: true },
        }}
      >
        <div className="setSheetInfo"></div>
      </Trigger>
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
          <DialogImportExcelCreate
            projectId={projectId}
            appId={appId}
            groupId={appItem.workSheetId}
            onCancel={() => setCreateType('')}
            createType="worksheet"
            refreshPage={() => {
              sheetListActions.getSheetList({ appId, appSectionId: appItem.parentId });
            }}
          />
        ))}
    </Fragment>
  );
}

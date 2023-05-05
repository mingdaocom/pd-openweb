import React, { Fragment, useState, useEffect, useRef } from 'react';
import { Icon, Menu, MenuItem, Tooltip, Dialog, DeleteReconfirm, LoadDiv, Checkbox } from 'ming-ui';
import SelectIcon from 'worksheet/common/SelectIcon/SelectIcon';
import SheetMove from 'worksheet/common/SheetMove/SheetMove';
import DialogImportExcelCreate from 'worksheet/components/DialogImportExcelCreate';
import Trigger from 'rc-trigger';
import homeAppApi from 'src/api/homeApp';
import sheetApi from 'src/api/worksheet';
import CreateNew from './CreateNew';
import { APP_ROLE_TYPE } from 'src/pages/worksheet/constants/enum.js';
import { canEditApp } from 'worksheet/redux/actions/util';

const CopySheetConfirmDescription = props => {
  const { workSheetId, type } = props;
  const [loading, setLoading] = useState(true);
  const [controls, setControls] = useState([]);
  const [isCopyRelevance, setIsCopyRelevance] = useState(false);
  const [selectIds, setSelectIds] = useState([]);

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
          setControls(controls.filter(c => c.type === 29));
        });
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    props.onChanegSelectIds(selectIds);
  }, [selectIds]);

  return type ? (
    _l('仅复制当前自定义页面的所有配置')
  ) : (
    <Fragment>
      <div>{_l('仅复制目标工作表的所有配置，工作表下的数据不会被复制')}</div>
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
  DeleteReconfirm({
    clickOmitText: true,
    style: { width: '560px' },
    title: (
      <div className="Bold">
        <i className="icon-error error" style={{ fontSize: '28px', marginRight: '8px' }}></i>
        {type ? _l('删除自定义页面 “%0”', name) : _l('删除工作表 “%0”', name)}
      </div>
    ),
    description: (
      <div>
        <span style={{ color: '#333', fontWeight: 'bold' }}>
          {type ? _l('注意：自定义页面下所有配置和数据将被删除。') : _l('注意：工作表下所有配置和数据将被删除。')}
        </span>
        {type
          ? _l('请务必确认所有应用成员都不再需要此自定义页面后，再执行此操作。')
          : _l('请务必确认所有应用成员都不再需要此工作表后，再执行此操作。')}
      </div>
    ),
    data: [{ text: type ? _l('我确认删除自定义页面和所有数据') : _l('我确认删除工作表和所有数据'), value: 1 }],
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
  const { workSheetId, workSheetName, type, icon, iconColor, iconUrl, parentGroupId } = appItem;
  const copyArgs = {
    worksheetId: workSheetId,
    appId,
    appSectionId: groupId,
    name: workSheetName,
    relationControlIds: [],
  };
  Dialog.confirm({
    width: 480,
    title: (
      <span className="bold">
        {type ? _l('复制自定义页面 “%0”', workSheetName) : _l('复制工作表 “%0”', workSheetName)}
      </span>
    ),
    description: (
      <CopySheetConfirmDescription
        type={type}
        workSheetId={workSheetId}
        onChanegSelectIds={ids => {
          copyArgs.relationControlIds = ids;
        }}
      />
    ),
    okText: _l('复制'),
    onOk: () => {
      if (type === 1) {
        sheetListActions.copyCustomPage({
          appId,
          appSectionId: groupId,
          name: _l('%0-复制', workSheetName),
          id: workSheetId,
          icon,
          iconColor,
          iconUrl,
          parentGroupId,
        });
        return;
      }
      sheetListActions.copySheet(copyArgs, {
        icon,
        iconColor,
        iconUrl,
        parentGroupId,
      });
    },
  });
};

const handleUpdateWorksheetStatus = props => {
  const { appId, appItem, sheetListActions } = props;
  const status = appItem.status === 1 ? 2 : 1;
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

  const isWorksheet = appItem.type === 0;
  const isActive = activeSheetId === appItem.workSheetId;
  const deleteText = {
    0: _l('工作表'),
    1: _l('自定义页面'),
    2: _('分组'),
  };

  const handleCreateAppItem = (type, name) => {
    if (!name) {
      alert(_l('请填写名称'), 3);
      return;
    }
    sheetListActions.createAppItem({
      appId,
      groupId: appItem.workSheetId,
      firstGroupId: groupId,
      type,
      name: name.slice(0, 25),
    });
    setCreateType('');
  };

  const renderMenu = () => {
    return (
      <Menu className="worksheetItemOperate">
        <MenuItem
          icon={<Icon icon="edit" className="Font16" />}
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
        {canEditApp(_.get(appPkg, ['permissionType']), _.get(appPkg, ['isLock'])) && (
          <React.Fragment>
            {!isGroup && (
              <MenuItem
                icon={<Icon icon="content-copy" className="Font16" />}
                onClick={() => {
                  handleCopyWorkSheet(props);
                  setPopupVisible(false);
                }}
              >
                <span className="text">{_l('复制%02022')}</span>
              </MenuItem>
            )}
            <MenuItem
              icon={<Icon icon="swap_horiz" className="Font18" />}
              onClick={() => {
                setSheetMoveVisible(true);
                setPopupVisible(false);
              }}
            >
              <span className="text">{_l('移动到%02021')}</span>
            </MenuItem>
            <MenuItem
              icon={<Icon icon="visibility_off" className="Font16" />}
              onClick={() => {
                setPopupVisible(false);
                if (appItem.parentStatus === 2) {
                  return;
                }
                handleUpdateWorksheetStatus(props);
              }}
            >
              <span className="text flexRow">
                <span className="flex">{appItem.status === 1 ? _l('从导航中隐藏%02020') : _l('取消隐藏')}</span>
                <Tooltip
                  popupPlacement="right"
                  text={
                    <span>
                      {isWorksheet
                        ? _l('通常用于不需要用户直接访问的仅作为配置用途的表。如：关联的明细表、参数表等。')
                        : _l('隐藏后，普通用户在导航中将看不到此页面入口。')}
                    </span>
                  }
                >
                  <Icon className="Font14" icon={'help'} style={{ position: 'relative', left: 5 }} />
                </Tooltip>
              </span>
            </MenuItem>
            {isGroup && (
              <Fragment>
                <hr className="splitter" />
                <div className="Gray_9e pLeft12 mTop10">{_l('新建')}</div>
                <MenuItem
                  onClick={() => {
                    setCreateType('worksheet');
                    setPopupVisible(false);
                  }}
                >
                  <Icon icon="plus" className="Font18" />
                  <span className="text">{_l('从空白创建工作表%02015')}</span>
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setCreateType('importExcel');
                    setPopupVisible(false);
                  }}
                >
                  <Icon icon="new_excel" className="Font18" />
                  <span className="text">{_l('从Excel创建工作表%02014')}</span>
                </MenuItem>
                <MenuItem
                  icon={<Icon icon="dashboard" className="Font18" />}
                  onClick={() => {
                    setCreateType('customPage');
                    setPopupVisible(false);
                  }}
                >
                  <span className="text">{_l('自定义页面%02013')}</span>
                </MenuItem>
              </Fragment>
            )}
            <hr className="splitter" />
            <MenuItem
              icon={<Icon icon="delete2" className="Font16" />}
              className="delete"
              onClick={() => {
                isGroup ? handleDeleteGroup(props) : handleDeleteWorkSheet(props);
                setPopupVisible(false);
              }}
            >
              <span className="text">{_l('删除%0', deleteText[appItem.type])}</span>
            </MenuItem>
          </React.Fragment>
        )}
      </Menu>
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
      {!!createType &&
        (['customPage', 'worksheet'].includes(createType) ? (
          <CreateNew type={createType} onCreate={handleCreateAppItem} onCancel={() => setCreateType('')} />
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

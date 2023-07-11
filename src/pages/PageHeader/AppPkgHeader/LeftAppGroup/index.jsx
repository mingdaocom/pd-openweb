import React, { Fragment, useEffect, useState, useRef } from 'react';
import homeAppApi from 'api/homeApp';
import { Icon, ScrollView, Menu, MenuItem } from 'ming-ui';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  addAppSection,
  updateALLSheetList,
  clearSheetList,
  createAppItem,
  getSheetList,
  getAllAppSectionDetail,
} from 'worksheet/redux/actions/sheetList';
import DelAppGroup from '../AppGroup/DelAppGroup';
import Skeleton from 'src/router/Application/Skeleton';
import Drag from 'worksheet/common/WorkSheetLeft/Drag';
import { DndProvider } from 'react-dnd-latest';
import { HTML5Backend } from 'react-dnd-html5-backend-latest';
import { convertColor } from 'worksheet/common/WorkSheetLeft/WorkSheetItem';
import DialogImportExcelCreate from 'worksheet/components/DialogImportExcelCreate';
import CreateNew from 'worksheet/common/WorkSheetLeft/CreateNew';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import SinglelLeftGroup from './SinglelLeftGroup';
import { formatLeftSectionDetail } from 'worksheet/redux/actions/sheetList';
import { getIds } from '../../util';
import { findSheet } from 'worksheet/util';
import _ from 'lodash';
import './index.less';

const appSectionRefs = {};

const AppSectionItem = props => {
  const { projectId, sheet, appPkg, ids, item, appSectionDetail } = props;
  const { onUpdateAppSectionItem, onDelAppSection } = props;
  const { iconColor, currentPcNaviStyle, themeType } = appPkg;
  const [edit, setEdit] = useState(item.edit || false);
  const isCurrentChildren = !!findSheet(ids.worksheetId, item.items);
  const hideAppSection = appSectionDetail.length === 1 && _.isEmpty(item.workSheetName) && !item.edit;
  const childrenHideKey = `${item.workSheetId}-hide`;
  const [childrenVisible, setChildrenVisible] = useState(localStorage.getItem(childrenHideKey) ? false : true);
  const [popupVisible, setPopupVisible] = useState(false);
  const [delAppItemVisible, setDelAppItemVisible] = useState(false);
  const [dialogImportExcel, setDialogImportExcel] = useState(false);
  const [isDrag, setIsDrag] = useState(false);
  const [createType, setCreateType] = useState('');
  const isActive = !childrenVisible && isCurrentChildren;
  const singleRef = useRef();

  useEffect(() => {
    const id = `AppSectionRef-${item.workSheetId}`;
    appSectionRefs[id] = singleRef;
    return () => {
      delete appSectionRefs[id];
    };
  }, []);

  useEffect(() => {
    setEdit(item.edit);
  }, [item.edit]);

  const bgColor = () => {
    if (currentPcNaviStyle === 1 && !['light'].includes(themeType)) {
      return themeType === 'theme' ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.15)';
    } else {
      return convertColor(iconColor);
    }
  }

  const handleCreateAppItem = (type, args) => {
    const singleRef = getAppSectionRef(item.workSheetId);
    singleRef.dispatch(
      createAppItem({
        appId: ids.appId,
        groupId: item.workSheetId,
        type,
        ...args
      }),
    );
    setCreateType('');
  };

  const renderMenu = () => {
    return (
      <Menu className="worksheetItemOperate">
        <MenuItem
          icon={<Icon icon="edit" className="Font16" />}
          onClick={() => {
            setEdit(true);
            setPopupVisible(false);
          }}
        >
          <span className="text">{_l('重命名')}</span>
        </MenuItem>
        <hr className="splitter" />
        <div class="Gray_9e pLeft12 pTop7 pBottom3">{_l('新建')}</div>
        <MenuItem
          onClick={() => {
            setCreateType('worksheet');
            setPopupVisible(false);
          }}
        >
          <Icon icon="plus" className="Font18" />
          <span className="text">{_l('从空白创建工作表')}</span>
        </MenuItem>
        <MenuItem
          onClick={() => {
            setDialogImportExcel(true);
            setPopupVisible(false);
          }}
        >
          <Icon icon="new_excel" className="Font18" />
          <span className="text">{_l('从Excel创建工作表')}</span>
        </MenuItem>
        <MenuItem
          icon={<Icon icon="dashboard" className="Font18" />}
          onClick={() => {
            setCreateType('customPage');
            setPopupVisible(false);
          }}
        >
          <span className="text">{_l('自定义页面')}</span>
        </MenuItem>
        <MenuItem
          icon={<Icon icon="add-files" className="Font16" />}
          onClick={() => {
            setChildrenVisible(true);
            singleRef.current.dispatch(
              addAppSection({
                appId: ids.appId,
                groupId: item.workSheetId,
              }),
            );
            setPopupVisible(false);
          }}
        >
          <span className="text">{_l('子分组')}</span>
        </MenuItem>
        <hr className="splitter" />
        <MenuItem
          icon={<Icon icon="delete2" className="Font16" />}
          className="delete"
          onClick={() => {
            if (appSectionDetail.length === 1 || _.isEmpty(item.items)) {
              onDelAppSection(item.workSheetId);
            } else {
              setDelAppItemVisible(true);
            }
            setPopupVisible(false);
          }}
        >
          <span className="text">{_l('删除分组')}</span>
        </MenuItem>
      </Menu>
    );
  };

  return (
    <div className="appGroupWrap">
      <Drag appItem={item} appPkg={appPkg} isCharge={sheet.isCharge} onDragEnd={() => { window.dragNow = null; }}>
        {!hideAppSection && (
          <div
            className={cx('appGroup flexRow alignItemsCenter pointer', { hover: popupVisible })}
            style={{
              backgroundColor: isActive && bgColor(),
            }}
            onClick={e => {
              const { classList } = e.target;
              if (classList.contains('appGroup') || classList.contains('nameWrap') || classList.contains('arrowIcon')) {
                setChildrenVisible(!childrenVisible);
                if (childrenVisible) {
                  localStorage.setItem(childrenHideKey, 1);
                } else {
                  localStorage.removeItem(childrenHideKey);
                }
              }
            }}
            onMouseDown={() => {
              window.dragNow = Date.now();
            }}
            onMouseMove={() => {
              const now = Date.now();
              if (window.dragNow && now - window.dragNow > 50) {
                setIsDrag(true);
                setChildrenVisible(false);
              };
            }}
            onMouseUp={() => {
              window.dragNow = null;
              setIsDrag(false);
            }}
          >
            <div className="flex ellipsis bold nameWrap">
              {edit ? (
                <input
                  autoFocus
                  className="w100 editInput"
                  defaultValue={item.workSheetName}
                  onBlur={e => {
                    setEdit(false);
                    onUpdateAppSectionItem(item, { workSheetName: e.target.value, edit: false });
                  }}
                  onKeyDown={e => {
                    if (e.which === 13) {
                      setEdit(false);
                      onUpdateAppSectionItem(item, { workSheetName: e.target.value, edit: false });
                    }
                  }}
                />
              ) : (
                item.workSheetName || _l('未命名分组')
              )}
            </div>
            {!edit && (
              <Fragment>
                {sheet.isCharge && (
                  <Trigger
                    popupVisible={popupVisible}
                    onPopupVisibleChange={setPopupVisible}
                    action={['click']}
                    popup={renderMenu()}
                    popupAlign={{ points: ['tl', 'bl'], offset: [1, 1], overflow: { adjustX: true, adjustY: true } }}
                  >
                    <div className="moreWrap">
                      <Icon icon="more_horiz" className="Font18 moreIcon" />
                    </div>
                  </Trigger>
                )}
                <Icon className="Font16 arrowIcon" icon={childrenVisible ? 'arrow-up-border' : 'arrow-down-border'} />
              </Fragment>
            )}
          </div>
        )}
        <div className={cx({ hide: !childrenVisible || isDrag })}>
          <SinglelLeftGroup
            ref={singleRef}
            projectId={projectId}
            appId={ids.appId}
            groupData={item.items}
            groupId={item.workSheetId}
            worksheetId={ids.worksheetId}
            isCharge={sheet.isCharge}
            appPkg={appPkg}
          />
        </div>
      </Drag>
      {delAppItemVisible && (
        <DelAppGroup
          data={appSectionDetail.filter(data => data.workSheetId !== item.workSheetId)}
          onOk={sourceAppSectionId => {
            onDelAppSection(item.workSheetId, sourceAppSectionId);
            setDelAppItemVisible(false);
          }}
          onCancel={() => setDelAppItemVisible(false)}
        />
      )}
      {!!createType && (
        <CreateNew type={createType} onCreate={handleCreateAppItem} onCancel={() => setCreateType('')} />
      )}
      {dialogImportExcel && (
        <DialogImportExcelCreate
          projectId={projectId}
          appId={ids.appId}
          groupId={item.workSheetId}
          onCancel={() => setDialogImportExcel(false)}
          createType="worksheet"
          refreshPage={() => {
            const singleRef = getAppSectionRef(item.workSheetId);
            singleRef.dispatch(
              getSheetList({
                appId: ids.appId,
                appSectionId: item.workSheetId,
              }),
            );
          }}
        />
      )}
    </div>
  );
};

const LeftAppGroup = props => {
  const { appSectionDetail } = props;
  const { updateALLSheetList, clearSheetList, getAllAppSectionDetail } = props;
  const [loading, setLoading] = useState(true);
  const ids = getIds(props);

  useEffect(() => {
    window.updateAppGroups = getData;
    getData();
    return () => {
      updateALLSheetList([]);
      clearSheetList();
      delete window.updateAppGroups;
    };
  }, [ids.appId]);

  const getData = () => {
    let { appId } = ids;
    if (md.global.Account.isPortal) {
      appId = md.global.Account.appId;
    }
    if (!appId) return;
    setLoading(true);
    getAllAppSectionDetail(appId, () => {
      setLoading(false);
    });
  };

  const handleUpdateAppSectionItem = (target, data) => {
    if (data.workSheetName) {
      updateALLSheetList(
        appSectionDetail.map(item => {
          if (item.workSheetId === target.workSheetId) {
            return {
              ...item,
              ...data,
            };
          } else {
            return item;
          }
        }),
      );
      homeAppApi
        .updateAppSectionName({
          appId: ids.appId,
          appSectionId: target.workSheetId,
          name: data.workSheetName,
        })
        .then(data => {
          if (!data.data) {
            alert(_l('编辑失败'), 2);
          }
        });
    }
  };

  const handleDelAppSection = (workSheetId, sourceAppSectionId) => {
    if (appSectionDetail.length === 1) {
      updateALLSheetList(appSectionDetail.map(data => Object.assign(data, { name: '' })));
      homeAppApi
        .updateAppSection({
          appId: ids.appId,
          appSectionId: workSheetId,
          appSectionName: '',
        })
        .then(data => {});
      return;
    }
    const { items = [] } = _.find(appSectionDetail, { workSheetId });
    const res = appSectionDetail
      .filter(data => data.workSheetId !== workSheetId)
      .map(data => {
        if (data.workSheetId === sourceAppSectionId) {
          return {
            ...data,
            items: data.items.concat(items),
          };
        } else {
          return data;
        }
      });
    updateALLSheetList(res);
    homeAppApi
      .deleteAppSection({
        appId: ids.appId,
        appSectionId: workSheetId,
        sourceAppSectionId,
      })
      .then(data => {
        if (!data.data) {
          alert(_l('删除失败'), 2);
        }
      });
  };

  return (
    <div className="LeftAppGroupWrap flex w100 flexColumn Relative">
      {loading ? (
        <Skeleton className="w100 h100" active={true} />
      ) : (
        <Fragment>
          {appSectionDetail.length === 1 &&
            _.isEmpty(appSectionDetail[0].items) &&
            _.isEmpty(appSectionDetail[0].workSheetName) &&
            !appSectionDetail[0].edit && <Skeleton className="w100 h100 Absolute" />}
          <DndProvider key="navigationList" context={window} backend={HTML5Backend}>
            <ScrollView>
              {appSectionDetail.map((data, index) => (
                <AppSectionItem
                  key={data.workSheetId}
                  ids={ids}
                  item={{
                    ...data,
                    index,
                  }}
                  appSectionDetail={appSectionDetail}
                  {...props}
                  onUpdateAppSectionItem={handleUpdateAppSectionItem}
                  onDelAppSection={handleDelAppSection}
                />
              ))}
            </ScrollView>
          </DndProvider>
        </Fragment>
      )}
    </div>
  );
};

export const getAppSectionRef = appSectionId => {
  const ref = appSectionRefs[`AppSectionRef-${appSectionId}`] || {};
  return ref.current;
};

export const getAppSectionData = appSectionId => {
  const ref = getAppSectionRef(appSectionId);
  return ref ? ref.getState().sheetList.data : [];
};

export default connect(
  state => ({
    appSectionDetail: state.sheetList.appSectionDetail,
  }),
  dispatch =>
    bindActionCreators(
      {
        getAllAppSectionDetail,
        updateALLSheetList,
        clearSheetList,
      },
      dispatch,
    ),
)(LeftAppGroup);

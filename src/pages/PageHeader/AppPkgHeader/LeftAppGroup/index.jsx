import React, { Fragment, useEffect, useState, useRef } from 'react';
import homeAppApi from 'api/homeApp';
import { Icon, ScrollView, Menu, MenuItem, Skeleton, Tooltip, SvgIcon } from 'ming-ui';
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
import { getTranslateInfo, getAppFeaturesVisible } from 'src/util';
import _ from 'lodash';
import { TinyColor } from '@ctrl/tinycolor';
import styled from 'styled-components';
import appManagementApi from 'src/api/appManagement';
import { ICON_ROLE_TYPE } from '../config';
import './index.less';

const RoleSelectWrap = styled.div(
  ({ borderColor }) => `
  border-radius: 16px;
  height: 30px;
  &:hover,
  &.active {
    border: 1px solid ${borderColor} !important;
  }
`,
);

const appSectionRefs = {};

const AppSectionItem = props => {
  const { projectId, sheet, appPkg, ids, item, unfoldAppSectionId, appSectionDetail } = props;
  const { onUpdateAppSectionItem, onDelAppSection } = props;
  const { iconColor, currentPcNaviStyle, themeType, expandType } = appPkg;
  const [edit, setEdit] = useState(item.edit || false);
  const isCurrentChildren = !!findSheet(ids.worksheetId, item.items);
  const hideAppSection = () => {
    if (currentPcNaviStyle === 3) {
      return item.index === 0 && (appPkg.hideFirstSection || _.isEmpty(item.workSheetName)) && !item.edit;
    } else {
      return appSectionDetail.length === 1 && _.isEmpty(item.workSheetName) && !item.edit;
    }
  };
  const childrenHideKey = `${item.workSheetId}-hide`;
  const getDefaultVisible = () => {
    if (currentPcNaviStyle === 3) {
      if ((appPkg.hideFirstSection || _.isEmpty(item.workSheetName)) && item.index === 0) {
        return true;
      }
      if (expandType === 1) {
        return isCurrentChildren;
      }
      return localStorage.getItem(childrenHideKey) ? false : expandType === 0;
    } else {
      return localStorage.getItem(childrenHideKey) ? false : true;
    }
  };
  const [childrenVisible, setChildrenVisible] = useState(getDefaultVisible());
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

  useEffect(() => {
    const hideFirstSection = item.index === 0 && appPkg.hideFirstSection && !item.edit;
    if (
      unfoldAppSectionId &&
      currentPcNaviStyle === 3 &&
      !hideFirstSection &&
      expandType === 1 &&
      unfoldAppSectionId !== item.workSheetId
    ) {
      setChildrenVisible(false);
    }
  }, [unfoldAppSectionId]);

  const bgColor = () => {
    if ([1, 3].includes(currentPcNaviStyle) && !['light'].includes(themeType)) {
      return themeType === 'theme' ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.15)';
    } else {
      return convertColor(iconColor);
    }
  };

  const handleCreateAppItem = (type, args) => {
    const singleRef = getAppSectionRef(item.workSheetId);
    singleRef.dispatch(
      createAppItem({
        appId: ids.appId,
        groupId: item.workSheetId,
        type,
        ...args,
      }),
    );
    setCreateType('');
  };

  const renderMenu = () => {
    return (
      <Menu className="worksheetItemOperate worksheetItemOperate-GroupList">
        <MenuItem
          data-event="rename"
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
          data-event="emptyCreate"
          onClick={() => {
            setCreateType('worksheet');
            setPopupVisible(false);
          }}
        >
          <Icon icon="plus" className="Font18" />
          <span className="text">{_l('从空白创建工作表')}</span>
        </MenuItem>
        <MenuItem
          data-event="excelCreate"
          onClick={() => {
            setDialogImportExcel(true);
            setPopupVisible(false);
          }}
        >
          <Icon icon="new_excel" className="Font18" />
          <span className="text">{_l('从Excel创建工作表')}</span>
        </MenuItem>
        <MenuItem
          data-event="customPage"
          icon={<Icon icon="dashboard" className="Font18" />}
          onClick={() => {
            setCreateType('customPage');
            setPopupVisible(false);
          }}
        >
          <span className="text">{_l('自定义页面')}</span>
        </MenuItem>
        <MenuItem
          data-event="subGroup"
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
          data-event="delGroup"
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
    <div
      className={cx('appGroupWrap', {
        treeAppGroupWrap: currentPcNaviStyle === 3 && !hideAppSection(),
        hideFirstSection: currentPcNaviStyle === 3 && appPkg.hideFirstSection && item.index === 0,
      })}
    >
      <Drag
        appItem={item}
        appPkg={appPkg}
        isCharge={sheet.isCharge}
        onDragEnd={() => {
          window.dragNow = null;
        }}
      >
        {!hideAppSection() && (
          <div
            className={cx('appGroup flexRow alignItemsCenter pointer', {
              hover: popupVisible,
              close: (currentPcNaviStyle === 1 ? !childrenVisible : true) || isDrag,
            })}
            style={{
              backgroundColor: isActive && bgColor(),
            }}
            onClick={e => {
              const { classList } = e.target;
              if (classList.contains('appGroup') || classList.contains('nameWrap') || classList.contains('arrowIcon')) {
                props.setUnfoldAppSectionId(!childrenVisible ? item.workSheetId : null);
                setTimeout(() => {
                  setChildrenVisible(!childrenVisible);
                  if (childrenVisible) {
                    localStorage.setItem(childrenHideKey, 1);
                  } else {
                    localStorage.removeItem(childrenHideKey);
                  }
                }, 0);
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
              }
            }}
            onMouseUp={() => {
              window.dragNow = null;
              setIsDrag(false);
            }}
          >
            <div className="flex ellipsis bold nameWrap flexRow alignItemsCenter">
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
                <Fragment>
                  {currentPcNaviStyle === 3 && (
                    <SvgIcon
                      url={
                        item.iconUrl ? item.iconUrl : `${md.global.FileStoreConfig.pubHost}/customIcon/${item.icon}.svg`
                      }
                      fill={['light'].includes(themeType) ? appPkg.iconColor : '#fff'}
                      size={22}
                      className="mRight10"
                    />
                  )}
                  {getTranslateInfo(appPkg.id, null, item.workSheetId).name || item.workSheetName || _l('未命名分组')}
                </Fragment>
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
            appId={appPkg.id}
            groupData={item.items}
            groupId={item.workSheetId}
            worksheetId={ids.worksheetId}
            isCharge={sheet.isCharge}
            appPkg={appPkg}
            firstGroupIndex={item.index}
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
  const { appSectionDetail, appPkg, showRoleDebug = () => {}, roleSelectValue = [], roleDebugVisible } = props;
  const { updateALLSheetList, clearSheetList, getAllAppSectionDetail } = props;
  const [loading, setLoading] = useState(true);
  const [unfoldAppSectionId, setUnfoldAppSectionId] = useState(null);
  const ids = getIds(props);
  const { tr } = getAppFeaturesVisible(); // 当导航方式为分组列表或树形列表时URL的隐藏参数为tr=no后，隐藏选择角色

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
    const sectionRes = appSectionDetail.map(n => {
      return {
        ...n,
        items: getAppSectionData(n.appSectionId),
      };
    });
    if (sectionRes.length === 1) {
      updateALLSheetList(sectionRes.map(data => Object.assign({}, data, { workSheetName: '' })));
      homeAppApi
        .updateAppSectionName({
          appId: ids.appId,
          appSectionId: workSheetId,
          name: '',
        })
        .then(data => {});
      return;
    }
    const { items = [] } = _.find(sectionRes, { workSheetId });
    const res = sectionRes
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

  const getBorderColor = () => {
    if (!appPkg.iconColor) return 'rgba(255, 255, 255, 0.3)';
    return new TinyColor(appPkg.iconColor).setAlpha(0.3).toRgbString();
  };

  const skeletonVisible =
    appSectionDetail.length === 1 &&
    _.isEmpty(appSectionDetail[0].items) &&
    _.isEmpty(appSectionDetail[0].workSheetName) &&
    !appSectionDetail[0].edit;

  return (
    <React.Fragment>
      <div className="LeftAppGroupWrap flex w100 flexColumn Relative">
        {loading ? (
          <Skeleton className="w100 h100" active={true} />
        ) : (
          <Fragment>
            {skeletonVisible && <Skeleton className="w100 h100 Absolute" />}
            <DndProvider key="navigationList" context={window} backend={HTML5Backend}>
              <ScrollView className={cx({ hide: skeletonVisible })}>
                {appSectionDetail.map((data, index) => (
                  <AppSectionItem
                    key={data.workSheetId}
                    ids={ids}
                    skeletonVisible={skeletonVisible}
                    item={{
                      ...data,
                      index,
                    }}
                    unfoldAppSectionId={unfoldAppSectionId}
                    setUnfoldAppSectionId={setUnfoldAppSectionId}
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
      {(appPkg.debugRole || {}).canDebug && tr && (
        <div className="mBottom2 pLeft12 pRight12 w100">
          <RoleSelectWrap
            className={cx('pLeft16 pRight12 valignWrapper roleSelectCon Hand', { active: roleDebugVisible })}
            onClick={e => showRoleDebug()}
            borderColor={getBorderColor()}
          >
            <span className="overflow_ellipsis flex bold valignWrapper LineHeight20">
              {roleSelectValue.length === 1 && ICON_ROLE_TYPE[roleSelectValue[0].roleType] && (
                <Icon icon={ICON_ROLE_TYPE[roleSelectValue[0].roleType]} className="icon mRight6 Font16" />
              )}
              {roleSelectValue.length === 0
                ? _l('选择角色')
                : roleSelectValue.length === 1
                ? roleSelectValue[0].name
                : _l('%0个角色', roleSelectValue.length)}
            </span>
            <Tooltip disable={!roleSelectValue.length} placement="bottom" text={_l('清空调试')}>
              <Icon
                icon={!!roleSelectValue.length ? 'cancel' : 'expand_more'}
                className="Font16 roleSelectIcon"
                onClick={e => {
                  !!roleSelectValue.length && e.stopPropagation();
                  if (!roleSelectValue.length) return;

                  appManagementApi
                    .setDebugRoles({
                      appId: ids.appId,
                      roleIds: [],
                    })
                    .then(res => {
                      res && window.location.reload();
                    });
                }}
              />
            </Tooltip>
          </RoleSelectWrap>
        </div>
      )}
    </React.Fragment>
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

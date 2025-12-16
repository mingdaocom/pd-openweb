import React, { useRef, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import configureStore from 'redux/configureStore';
import { useDrag, useDrop } from 'react-dnd-latest';
import { TinyColor } from '@ctrl/tinycolor';
import _ from 'lodash';
import appManagementApi from 'src/api/appManagement';
import homeAppApi from 'src/api/homeApp';
import { getAppSectionData } from 'src/pages/PageHeader/AppPkgHeader/LeftAppGroup';
import * as sheetListActions from 'src/pages/worksheet/redux/actions/sheetList';

const dndAccept = 'navigationListGroup';

const removeTarget = (groups, data) => {
  return groups.filter(item => {
    const { items = [] } = item;
    if (item.workSheetId === data.workSheetId) {
      return false;
    }
    item.items = removeTarget(items, data);
    return true;
  });
};

const spliceTarget = (groups, target, data) => {
  const index = _.findIndex(groups, { workSheetId: target.workSheetId });
  if (index == -1) {
    return groups.map(item => {
      const { items = [] } = item;
      return {
        ...item,
        items: spliceTarget(items, target, data),
      };
    });
  } else {
    if (!target.parentId) {
      data.parentId = undefined;
    }
    groups.splice(data.first ? index : index + 1, 0, data);
    return groups;
  }
};

const pushTarget = (groups, target, data) => {
  return groups.map(item => {
    const { items = [] } = item;
    if (item.workSheetId === target.workSheetId) {
      data.parentId = undefined;
      data.parentGroupId = item.workSheetId;
      return {
        ...item,
        items: items.concat(data),
      };
    } else {
      return {
        ...item,
        items: pushTarget(item.items || [], target, data),
      };
    }
  });
};

const Drag = props => {
  const { appPkg, isCharge, appItem, className, children, onHover = _.noop, onDragEnd = _.noop } = props;
  const { iconColor, currentPcNaviStyle, themeType } = appPkg;
  const ref = useRef(null);
  const [activeGroup, setActiveGroup] = useState(false);
  const [activeFirst, setActiveFirst] = useState(false);
  const [active, setActive] = useState(false);
  const dropColor = [1, 3].includes(currentPcNaviStyle) && themeType === 'theme' ? '#00000052' : iconColor;
  const [collectProps, drop] = useDrop({
    accept: dndAccept,
    drop(item) {
      const current = item.appItem;
      const target = appItem;
      if (current.workSheetId === target.workSheetId) {
        return undefined;
      }
      if (active || activeGroup) {
        current.first = activeFirst;
        onMoveGroup(current, target, activeGroup);
      }
      return undefined;
    },
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }

      const current = item.appItem;
      const target = appItem;

      onHover();

      if (currentPcNaviStyle === 2 && current.type === 2 && target.type !== 2) {
        return;
      }

      if (current.workSheetId === target.workSheetId) {
        return;
      }

      if (collectProps.isOver) {
        const clientOffset = monitor.getClientOffset();
        const hoverBoundingRect = ref.current.getBoundingClientRect();
        // 判断能否移动到组内
        const getIsPushGroup = () => {
          const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
          const hoverClientY = clientOffset.y - hoverBoundingRect.top;
          return hoverClientY <= hoverMiddleY && hoverClientY >= 10;
        };
        // 判断是否是第一个项
        if (target.index === 0) {
          const hoverClientX = clientOffset.x - hoverBoundingRect.left;
          const hoverClientY = clientOffset.y - hoverBoundingRect.top;
          currentPcNaviStyle === 2 ? setActiveFirst(hoverClientX <= 30) : setActiveFirst(hoverClientY <= 10);
        } else {
          setActiveFirst(false);
        }
        // 一级分组
        if (current.layerIndex === 0 && target.layerIndex === 0) {
          setActive(true);
        }
        // 二级分组
        if (current.layerIndex && !current.isAppItem) {
          if (!target.isAppItem && [0].includes(target.layerIndex)) {
            const isPushGroup = getIsPushGroup();
            setActiveGroup(isPushGroup);
          }
          if ([0, 1].includes(target.layerIndex)) {
            setActive(true);
            const hoverClientY = clientOffset.y - hoverBoundingRect.top;
            setActiveFirst(hoverClientY <= 10);
          }
        }
        // 二级应用
        if (current.layerIndex && current.isAppItem) {
          if (!target.isAppItem) {
            const isPushGroup = getIsPushGroup();
            setActiveGroup(isPushGroup);
          }
          if (target.layerIndex) {
            setActive(true);
            const hoverClientY = clientOffset.y - hoverBoundingRect.top;
            setActiveFirst(hoverClientY <= 10);
          }
        }
      } else {
        setActive(false);
        setActiveGroup(false);
        setActiveFirst(false);
      }
    },
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
        isOver: monitor.isOver({ shallow: true }),
      };
    },
  });
  const [{ isDragging }, drag] = useDrag({
    item: { type: dndAccept, appItem },
    canDrag: isCharge,
    end: onDragEnd,
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });
  drag(drop(ref));

  const onMoveGroup = (dragData, targetData, pushGroup) => {
    const sheetList = [1, 3].includes(currentPcNaviStyle)
      ? props.appSectionDetail.map(data => {
          return {
            ...data,
            items: getAppSectionData(data.workSheetId),
          };
        })
      : props.sheetList;
    const groups = removeTarget(_.cloneDeep(sheetList), dragData);
    if (pushGroup) {
      appManagementApi
        .removeWorkSheetAscription({
          sourceAppId: appPkg.id,
          resultAppId: appPkg.id,
          sourceAppSectionId: dragData.parentId,
          ResultAppSectionId: targetData.workSheetId,
          workSheetsInfo: [
            {
              workSheetId: dragData.workSheetId,
              type: dragData.type,
              icon: dragData.icon,
              iconColor: appPkg.iconColor,
              iconUrl: dragData.iconUrl,
              workSheetName: dragData.workSheetName,
              createType: dragData.createType,
            },
          ],
        })
        .then(result => {
          if (!result) {
            alert(_l(_l('移动失败')), 2);
          }
        });
      const res = pushTarget(groups, targetData, dragData);
      if ([1, 3].includes(currentPcNaviStyle)) {
        configureStore.dispatch(sheetListActions.updateALLSheetList(res));
      } else {
        props.updateSheetList(res);
      }
    } else {
      const dragDataParentId = dragData.parentId;
      const targetDataParentId = targetData.parentId;
      const res = spliceTarget(groups, targetData, dragData);
      if ([1, 3].includes(currentPcNaviStyle)) {
        configureStore.dispatch(sheetListActions.updateALLSheetList(res));
      } else {
        props.updateSheetList(res);
      }
      // 移动
      if (dragDataParentId !== targetDataParentId) {
        appManagementApi
          .removeWorkSheetAscription({
            sourceAppId: appPkg.id,
            resultAppId: appPkg.id,
            sourceAppSectionId: dragDataParentId,
            ResultAppSectionId: targetDataParentId,
            workSheetsInfo: [
              {
                workSheetId: dragData.workSheetId,
                type: dragData.type,
                icon: dragData.icon,
                iconColor: appPkg.iconColor,
                iconUrl: dragData.iconUrl,
                workSheetName: dragData.workSheetName,
                createType: dragData.createType,
              },
            ],
          })
          .then(result => {
            if (result) {
              if (targetData.layerIndex === 0) {
                homeAppApi.updateAppSectionSort({
                  appId: appPkg.id,
                  appSectionIds: res.map(data => data.workSheetId),
                });
              }
              if (targetData.layerIndex === 1) {
                const workSheetIds = res.map(data => data.workSheetId);
                homeAppApi.updateSectionChildSort({
                  appId: appPkg.id,
                  appSectionId: targetDataParentId,
                  workSheetIds,
                });
              }
              if (targetData.layerIndex === 2) {
                const data = _.find(res, { workSheetId: targetDataParentId }) || { items: [] };
                const workSheetIds = data.items.map(data => data.workSheetId);
                homeAppApi.updateSectionChildSort({
                  appId: appPkg.id,
                  appSectionId: targetDataParentId,
                  workSheetIds,
                });
              }
            } else {
              alert(_l(_l('移动失败')), 2);
            }
          });
        return;
      }
      // 一级分组排序
      if (dragData.layerIndex === 0 && dragData.parentId === targetData.parentId) {
        homeAppApi
          .updateAppSectionSort({
            appId: appPkg.id,
            appSectionIds: res.map(data => data.workSheetId),
          })
          .then(data => {
            if (data.code !== 1) {
              alert(_l('排序失败'), 2);
            }
          });
      }
      // 二级分组排序
      if (dragData.layerIndex === 1 && dragData.parentId === targetData.parentId) {
        let workSheetIds = [];
        if ([1, 3].includes(currentPcNaviStyle)) {
          const { items } = _.find(res, { workSheetId: dragData.parentId }) || {};
          workSheetIds = items.map(data => data.workSheetId);
        } else {
          workSheetIds = res.map(data => data.workSheetId);
        }
        homeAppApi
          .updateSectionChildSort({
            appId: appPkg.id,
            appSectionId: dragData.parentId,
            workSheetIds,
          })
          .then(data => {
            if (data.code !== 1) {
              alert(_l('排序失败'), 2);
            }
          });
      }
      // 三级排序
      if (dragData.layerIndex === 2 && dragData.parentId === targetData.parentId) {
        let workSheetIds = [];
        if ([1, 3].includes(currentPcNaviStyle)) {
          const childrenRes = res.filter(data => _.find(data.items, { workSheetId: dragData.parentId }))[0];
          workSheetIds = _.find(childrenRes.items, { workSheetId: dragData.parentId }).items.map(
            data => data.workSheetId,
          );
        } else {
          workSheetIds = _.find(res, { workSheetId: dragData.parentId }).items.map(data => data.workSheetId);
        }
        homeAppApi
          .updateSectionChildSort({
            appId: appPkg.id,
            appSectionId: dragData.parentId,
            workSheetIds,
          })
          .then(data => {
            if (data.code !== 1) {
              alert(_l('排序失败'), 2);
            }
          });
      }
    }
  };

  return (
    <div
      ref={ref}
      data-handler-id={collectProps.handlerId}
      className={className}
      onMouseDown={e => {
        const { parentElement } = e.target;
        if (
          props.onlyIconDrag &&
          (parentElement.classList.contains('groupHeader') ||
            e.target.classList.contains('groupHeader') ||
            e.target.classList.contains('groupContent') ||
            e.target.dataset.handlerId) &&
          !e.target.classList.contains('dragIcon')
        ) {
          e.preventDefault();
        }
      }}
      style={{
        opacity: isDragging ? 0 : 1,
        [currentPcNaviStyle === 2 && appItem.type !== 2
          ? activeFirst
            ? 'borderLeft'
            : 'borderRight'
          : activeFirst
            ? 'borderTop'
            : 'borderBottom']: collectProps.isOver && active && !activeGroup ? `1px solid ${dropColor}` : undefined,
        backgroundColor: collectProps.isOver && activeGroup ? new TinyColor(dropColor).setAlpha(0.2) : undefined,
        transform: 'translate(0px, 0px)',
      }}
    >
      {children}
    </div>
  );
};

const mapDispatchToProps = dispatch => ({
  updateSheetList: bindActionCreators(sheetListActions.updateSheetList, dispatch),
  dispatch,
});
const mapStateToProps = state => ({
  sheetList: state.sheetList.data,
  appSectionDetail: configureStore.getState().sheetList.appSectionDetail,
});

export default connect(mapStateToProps, mapDispatchToProps)(Drag);

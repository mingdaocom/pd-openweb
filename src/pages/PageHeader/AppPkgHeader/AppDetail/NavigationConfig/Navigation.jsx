import React, { Fragment, useState, useEffect, useCallback, useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd-latest';
import { HTML5Backend } from 'react-dnd-html5-backend-latest';
import { LoadDiv, SvgIcon, Icon } from 'ming-ui';
import { Tooltip } from 'antd';
import Trigger from 'rc-trigger';
import SelectIcon from 'src/pages/AppHomepage/components/SelectIcon';
import homeAppApi from 'src/api/homeApp';
import appManagementApi from 'src/api/appManagement';
import cx from 'classnames';
import { getTranslateInfo } from 'src/util';
import _ from 'lodash';

const dndAccept = 'navigationGroup';

const updateTarget = (groups, targetId, data) => {
  return groups.map(item => {
    if (item.id === targetId) {
      return { ...item, ...data };
    } else {
      return {
        ...item,
        items: updateTarget(item.items || [], targetId, data),
      };
    }
  });
};

const removeTarget = (groups, data) => {
  return groups.filter(item => {
    const { items = [] } = item;
    if (item.id === data.id) {
      return false;
    }
    item.items = removeTarget(items, data);
    return true;
  });
};

const spliceTarget = (groups, target, data) => {
  const index = _.findIndex(groups, { id: target.id });
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
    if (item.id === target.id) {
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

const Group = props => {
  const { isFirstGroup, parentId, hideAppSection, data, ...otherProps } = props;
  const { app } = otherProps;
  const { id, layerIndex, items = [] } = data;
  const name = data.name || _l('未命名分组');
  const { onUpdateAppItem, onDeleteGroup, onAddGroup, onMoveGroup } = otherProps;
  const ref = useRef(null);
  const [active, setActive] = useState(false);
  const [activeGroup, setActiveGroup] = useState(false);
  const [activeFirst, setActiveFirst] = useState(false);
  const [childrenVisible, setChildrenVisible] = useState(true);
  const [edit, setEdit] = useState(data.edit);
  const isChildren = !!items.length;

  useEffect(() => {
    setEdit(data.edit);
  }, [data.edit]);

  const [collectProps, drop] = useDrop({
    accept: dndAccept,
    drop(item, monitor) {
      const current = item.data;
      const target = data;
      if (current.id === target.id) {
        return undefined;
      }
      if (active || activeGroup) {
        current.first = activeFirst;
        onMoveGroup(item.data, data, activeGroup);
      }
      return undefined;
    },
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }

      const current = item.data;
      const target = data;

      if (current.id === target.id) {
        return;
      }

      if (collectProps.isOver) {
        // 判断能否移动到组内
        const getIsPushGroup = () => {
          const clientOffset = monitor.getClientOffset();
          const hoverBoundingRect = ref.current.getBoundingClientRect();
          const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
          const hoverClientY = clientOffset.y - hoverBoundingRect.top;
          return hoverClientY <= hoverMiddleY && hoverClientY >= 10;
        };

        // 判断是否是第一个项
        if (target.index === 0) {
          const clientOffset = monitor.getClientOffset();
          const hoverBoundingRect = ref.current.getBoundingClientRect();
          const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
          const hoverClientY = clientOffset.y - hoverBoundingRect.top;
          setActiveFirst(hoverClientY <= 10);
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
  const [{ isDragging }, drag, dragPreview] = useDrag({
    item: { type: dndAccept, data },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });
  dragPreview(drop(ref));

  const renderChildren = (item, index) => {
    item.layerIndex = layerIndex + 1;
    item.isAppItem = item.type !== 2;
    item.parentId = id;
    item.parentStatus = data.status;
    item.index = index;
    return <Group key={item.id} parentId={id} index={index} data={item} {...otherProps} />;
  };

  const renderChildrenGroup = () => {
    return isChildren && childrenVisible && <div className="childrenGroup">{items.map(renderChildren)}</div>;
  };

  const status = data.status === 2 || data.parentStatus === 2;

  return (
    <div
      ref={ref}
      data-handler-id={collectProps.handlerId}
      className={cx({
        firstGroup: isFirstGroup,
        [activeFirst ? 'activeFirst' : 'active']: collectProps.isOver && active && !activeGroup,
      })}
      style={{ opacity: isDragging ? 0 : 1, transform: 'translate(0px, 0px)' }}
    >
      {isFirstGroup ? (
        <Fragment>
          <div
            className={cx('flexRow alignItemsCenter groupHeader', {
              activeGroup: collectProps.isOver && activeGroup,
              open: isChildren && childrenVisible,
              hover: isChildren && childrenVisible,
              hide: hideAppSection,
            })}
          >
            <div ref={drag} onMouseDown={() => setChildrenVisible(false)}>
              <Icon icon="drag" className="Gray_9e pointer operateIcon mRight5" />
            </div>
            <Icon
              icon={childrenVisible ? 'arrow-down' : 'arrow-right-tip'}
              className="Gray_9e pointer mRight5"
              onClick={() => setChildrenVisible(!childrenVisible)}
            />
            <SvgIcon
              url={`${md.global.FileStoreConfig.pubHost}/customIcon/${data.icon || '8_4_folder'}.svg`}
              fill="#9e9e9e"
              className="mRight5"
            />
            <span className="flex name ellipsis" onClick={() => setChildrenVisible(!childrenVisible)}>
              {getTranslateInfo(app.id, id).name || name}
            </span>
            <Trigger
              action={['click']}
              popupVisible={edit}
              onPopupVisibleChange={visible => {
                setEdit(visible);
                edit && onUpdateAppItem(data, { edit: false });
              }}
              destroyPopupOnHide={true}
              popupAlign={{ points: ['tr', 'br'], offset: [0, 5], overflow: { adjustX: true, adjustY: true } }}
              popup={
                <SelectIcon
                  projectId={app.projectId}
                  name={data.name}
                  icon={data.icon}
                  hideColor={true}
                  className="Relative"
                  onChange={({ name, icon }) => {
                    if ((name && name !== data.name) || icon) {
                      onUpdateAppItem(data, { name, icon: icon || data.icon, edit: false });
                    }
                  }}
                />
              }
            >
              <Tooltip title={_l('修改')} placement="bottom">
                <Icon
                  className="Gray_9e pointer Font17 operateIcon"
                  icon="sp_edit_white"
                  onClick={() => setEdit(true)}
                />
              </Tooltip>
            </Trigger>
            <Tooltip title={_l('删除')} placement="bottom">
              <Icon className="Gray_9e pointer Font17 operateIcon" icon="delete2" onClick={() => onDeleteGroup(data)} />
            </Tooltip>
            <Tooltip title={_l('新建子分组')} placement="bottom">
              <Icon
                className="Gray_9e pointer Font20 operateIcon"
                icon="add"
                onClick={() => {
                  setChildrenVisible(true);
                  onAddGroup(data);
                }}
              />
            </Tooltip>
            {!isChildren && <span className="Gray_75 withoutChildrenHint">{_l('没有应用项')}</span>}
          </div>
          {renderChildrenGroup()}
        </Fragment>
      ) : (
        <Fragment>
          <div
            className={cx('flexRow alignItemsCenter groupWrap', {
              hover: edit,
              activeGroup: collectProps.isOver && activeGroup,
            })}
          >
            <div ref={drag} onMouseDown={() => setChildrenVisible(false)}>
              <Icon icon="drag" className="Gray_9e pointer operateIcon mRight5" />
            </div>
            <div
              className="flexRow alignItemsCenter w100"
              style={{ paddingLeft: data.isAppItem ? 20 * layerIndex : 0 }}
            >
              {data.isAppItem ? (
                <SvgIcon url={`${md.global.FileStoreConfig.pubHost}/customIcon/${data.icon}.svg`} fill="#9e9e9e" />
              ) : (
                <Fragment>
                  <Icon
                    icon={childrenVisible ? 'arrow-down' : 'arrow-right-tip'}
                    className="Gray_9e pointer mRight5"
                    onClick={() => setChildrenVisible(!childrenVisible)}
                  />
                  <SvgIcon
                    url={`${md.global.FileStoreConfig.pubHost}/customIcon/${data.icon || '8_4_folder'}.svg`}
                    fill="#9e9e9e"
                  />
                </Fragment>
              )}
              <span
                className="flex name mLeft10 ellipsis"
                onClick={() => !data.isAppItem && setChildrenVisible(!childrenVisible)}
              >
                {getTranslateInfo(app.id, id).name || name}
              </span>
              <Trigger
                action={['click']}
                popupVisible={edit}
                onPopupVisibleChange={visible => {
                  setEdit(visible);
                  edit && onUpdateAppItem(data, { edit: false });
                }}
                destroyPopupOnHide={true}
                popupAlign={{ points: ['tr', 'br'], offset: [0, 5], overflow: { adjustX: true, adjustY: true } }}
                popup={
                  <SelectIcon
                    projectId={app.projectId}
                    name={data.name}
                    icon={data.icon}
                    hideColor={true}
                    className="Relative"
                    onChange={({ name, icon }) => {
                      if ((name && name !== data.name) || icon) {
                        onUpdateAppItem(data, { name, icon: icon || data.icon, edit: false });
                      }
                    }}
                  />
                }
              >
                <Tooltip title={_l('修改')} placement="bottom">
                  <Icon
                    className="Gray_9e pointer Font17 operateIcon"
                    icon="sp_edit_white"
                    onClick={() => setEdit(true)}
                  />
                </Tooltip>
              </Trigger>
              {!data.isAppItem && (
                <Tooltip title={_l('删除')} placement="bottom">
                  <Icon
                    className="Gray_9e pointer Font17 operateIcon"
                    icon="delete2"
                    onClick={() => onDeleteGroup(data, parentId)}
                  />
                </Tooltip>
              )}
              <Tooltip title={status ? _l('取消隐藏') : _l('隐藏')} placement="bottom">
                <Icon
                  icon="visibility_off"
                  style={{ color: status ? '#ee6f09' : '#9e9e9e' }}
                  className={cx('pointer Font17', status ? 'mRight16' : 'operateIcon')}
                  onClick={() => {
                    if (data.parentStatus === 2) {
                      return;
                    }
                    onUpdateAppItem(data, { status: data.status === 1 ? 2 : 1 });
                  }}
                />
              </Tooltip>
            </div>
          </div>
          {renderChildrenGroup()}
        </Fragment>
      )}
    </div>
  );
};

const Container = props => {
  const { app } = props;
  const [loading, setLoading] = useState(true);
  const [navigationGroup, setNavigationGroup] = useState([]);

  const handleSetNavigationGroup = data => {
    setNavigationGroup(data);
  };

  useEffect(() => {
    homeAppApi
      .getApp({
        appId: app.id,
        getSection: true,
      })
      .then(data => {
        const { sections } = data;
        setLoading(false);
        setNavigationGroup(
          sections.map(data => {
            data.items = data.workSheetInfo.map(appItem => {
              if (appItem.type === 2) {
                const { workSheetInfo = [] } = _.find(data.childSections, { appSectionId: appItem.workSheetId }) || {};
                appItem.items = workSheetInfo.map(appItem => {
                  appItem.id = appItem.workSheetId;
                  appItem.name = appItem.workSheetName;
                  return appItem;
                });
              }
              appItem.id = appItem.workSheetId;
              appItem.name = appItem.workSheetName;
              return appItem;
            });
            data.id = data.appSectionId;
            return data;
          }),
        );
      });
  }, []);

  const handleUpdateAppItem = (target, data) => {
    const { id } = target;
    const groups = updateTarget(navigationGroup, id, data);
    handleSetNavigationGroup(groups);
    // 修改名称
    if (data.name) {
      if (target.isAppItem) {
        appManagementApi
          .editWorkSheetInfoForApp({
            appId: app.id,
            appSectionId: target.parentId,
            workSheetId: id,
            icon: data.icon || target.icon,
            workSheetName: data.name,
          })
          .then(data => {
            if (!data) {
              alert(_l('编辑失败'), 2);
            }
          });
      } else {
        homeAppApi
          .updateAppSection({
            appId: app.id,
            appSectionId: id,
            appSectionName: data.name,
            icon: data.icon,
          })
          .then(data => {
            if (data.code !== 1) {
              alert(_l('编辑失败'), 2);
            }
          });
      }
    }
    // 修改可见状态
    if (data.status) {
      homeAppApi
        .setWorksheetStatus({
          appId: app.id,
          status: data.status,
          worksheetId: id,
        })
        .then(data => {
          if (data.code !== 1) {
            alert(_l('编辑失败'), 2);
          }
        });
    }
  };
  const handleMoveGroup = (dragData, targetData, pushGroup) => {
    const groups = removeTarget(_.cloneDeep(navigationGroup), dragData);
    if (pushGroup) {
      // 移动应用项
      appManagementApi
        .removeWorkSheetAscription({
          sourceAppId: app.id,
          resultAppId: app.id,
          sourceAppSectionId: dragData.parentId,
          ResultAppSectionId: targetData.id,
          workSheetsInfo: [
            {
              workSheetId: dragData.id,
              type: dragData.type,
              icon: dragData.icon,
              iconColor: app.iconColor,
              iconUrl: dragData.iconUrl,
              workSheetName: dragData.name,
              createType: dragData.createType,
            },
          ],
        })
        .then(result => {
          if (!result) {
            alert(_l(_l('移动失败')), 2);
          }
        });
      handleSetNavigationGroup(pushTarget(groups, targetData, dragData));
    } else {
      const dragDataParentId = dragData.parentId;
      const targetDataParentId = targetData.parentId;
      const res = spliceTarget(groups, targetData, dragData);
      handleSetNavigationGroup(res);
      // 移动
      if (dragDataParentId !== targetDataParentId) {
        appManagementApi
          .removeWorkSheetAscription({
            sourceAppId: app.id,
            resultAppId: app.id,
            sourceAppSectionId: dragDataParentId,
            ResultAppSectionId: targetDataParentId,
            workSheetsInfo: [
              {
                workSheetId: dragData.id,
                type: dragData.type,
                icon: dragData.icon || '8_4_folder',
                iconColor: app.iconColor,
                iconUrl: dragData.iconUrl,
                workSheetName: dragData.name,
                createType: dragData.createType,
              },
            ],
          })
          .then(result => {
            if (result) {
              if (targetData.layerIndex === 0) {
                homeAppApi
                  .updateAppSectionSort({
                    appId: app.id,
                    appSectionIds: res.map(data => data.id),
                  })
                  .then(data => {});
              }
              if (targetData.layerIndex === 1) {
                const workSheetIds = _.find(res, { id: targetDataParentId }).items.map(data => data.id);
                homeAppApi
                  .updateSectionChildSort({
                    appId: app.id,
                    appSectionId: targetDataParentId,
                    workSheetIds,
                  })
                  .then(data => {});
              }
              if (targetData.layerIndex === 2) {
                const { items = [] } = res.filter(data => _.find(data.items, { id: targetDataParentId }))[0] || {};
                const workSheetIds = _.find(items, { id: targetDataParentId }).items.map(data => data.id);
                homeAppApi
                  .updateSectionChildSort({
                    appId: app.id,
                    appSectionId: targetDataParentId,
                    workSheetIds,
                  })
                  .then(data => {});
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
            appId: app.id,
            appSectionIds: res.map(data => data.id),
          })
          .then(data => {
            if (data.code !== 1) {
              alert(_l('排序失败'), 2);
            }
          });
      }
      // 二级分组排序
      if (dragData.layerIndex === 1 && dragData.parentId === targetData.parentId) {
        const workSheetIds = _.find(res, { id: dragData.parentId }).items.map(data => data.id);
        homeAppApi
          .updateSectionChildSort({
            appId: app.id,
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
        const { items = [] } = res.filter(data => _.find(data.items, { id: dragData.parentId }))[0] || {};
        const workSheetIds = _.find(items, { id: dragData.parentId }).items.map(data => data.id);
        homeAppApi
          .updateSectionChildSort({
            appId: app.id,
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
  const handleAddGroup = target => {
    const name = _l('未命名分组');
    const icon = target ? '8_4_folder' : undefined;

    if (!target && navigationGroup.length === 1 && _.isEmpty(navigationGroup[0].name)) {
      handleSetNavigationGroup(navigationGroup.map(data => Object.assign(data, { edit: true, name })));
      return;
    }

    homeAppApi
      .addAppSection({
        appId: app.id,
        name: name.slice(0, 100),
        icon,
        parentId: target ? target.id : undefined,
        rootId: target ? target.id : undefined,
      })
      .then(result => {
        if (result.code === 1) {
          if (target) {
            const newNavigationGroup = navigationGroup.map(data => {
              if (data.id === target.id) {
                const { items = [] } = data;
                return {
                  ...data,
                  items: items.concat({
                    id: result.data,
                    name,
                    icon,
                    edit: true,
                    type: 2,
                    items: [],
                  }),
                };
              } else {
                return data;
              }
            });
            handleSetNavigationGroup(newNavigationGroup);
          } else {
            handleSetNavigationGroup(
              navigationGroup.concat({
                id: result.data,
                name,
                edit: true,
                type: 2,
                items: [],
              }),
            );
          }
        }
      });
  };
  const handleDeleteGroup = (data, parentId) => {
    const { id, layerIndex, type, items = [] } = data;
    if (layerIndex === 0 && (navigationGroup.length === 1 || items.length)) {
      if (navigationGroup.length === 1) {
        handleSetNavigationGroup(navigationGroup.map(data => Object.assign(data, { name: '' })));
        homeAppApi
          .updateAppSection({
            appId: app.id,
            appSectionId: id,
            appSectionName: '',
            icon: data.icon,
          })
          .then(data => {});
      } else if (items.length) {
        alert(_l('非空导航组不能删除'), 3);
      }
    } else {
      homeAppApi
        .deleteAppSection({
          appId: app.id,
          appSectionId: id,
        })
        .then(data => {
          if (data.code === 1) {
            if (parentId) {
              handleSetNavigationGroup(
                navigationGroup.map(data => {
                  if (data.id === parentId) {
                    const { items = [] } = data;
                    const childrenAppItems = (_.find(items, { id }) || {}).items;
                    return {
                      ...data,
                      items: items
                        .filter(item => item.id !== id)
                        .concat(childrenAppItems.map(data => ({ ...data, parentGroupId: undefined }))),
                    };
                  } else {
                    return data;
                  }
                }),
              );
            } else {
              handleSetNavigationGroup(navigationGroup.filter(item => item.id !== id));
            }
          }
        });
    }
  };

  if (loading) {
    return <LoadDiv />;
  }

  const hideAppSection = navigationGroup.length === 1 && _.isEmpty(navigationGroup[0].name) && !navigationGroup[0].edit;

  const renderGroup = (item, index) => {
    item.layerIndex = 0;
    item.index = index;
    return (
      <Group
        isFirstGroup={true}
        key={item.id}
        index={index}
        hideAppSection={hideAppSection}
        data={item}
        app={app}
        onUpdateAppItem={handleUpdateAppItem}
        onMoveGroup={handleMoveGroup}
        onAddGroup={handleAddGroup}
        onDeleteGroup={handleDeleteGroup}
      />
    );
  };

  return (
    <DndProvider key="navigation" context={window} backend={HTML5Backend}>
      <div>{navigationGroup.map((item, i) => renderGroup(item, i))}</div>
      <div className="flexRow alignItemsCenter ThemeColor bold mBottom12">
        <div className="pointer" onClick={() => handleAddGroup()}>
          <Icon icon="add" />
          <span>{_l('分组')}</span>
        </div>
      </div>
    </DndProvider>
  );
};

export default Container;

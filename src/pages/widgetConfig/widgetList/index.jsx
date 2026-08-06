import React, { Fragment, useEffect, useRef, useState } from 'react';
import { getEmptyImage } from 'react-dnd-html5-backend-latest';
import { useDrag } from 'react-dnd-latest';
import { CaretRightOutlined } from '@ant-design/icons';
import { Collapse, Dropdown } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { Dialog, LoadDiv, ScrollView, Support } from 'ming-ui';
import worksheetAjax from 'src/api/worksheet';
import {
  batchUpdateWidgetsLayout,
  clearAndSetWidgets,
  handleAddWidgets,
  handleDeleteWidgetsForMingo,
  handleUpdateWidgetsAttribute,
} from 'src/pages/widgetConfig/util/data';
import { emitter, updateGlobalStoreForMingo } from 'src/utils/common';
import { getFeatureStatus } from 'src/utils/project';
import { DRAG_ITEMS } from '../config/Drag';
import { WIDGET_GROUP_TYPE } from '../config/widget';
import { DropdownOverlay } from '../styled';
import { checkWidgetMaxNumErr, enumWidgetType, formatSearchConfigs, getWidgetInfo, notInsetSectionTab } from '../util';
import { createTemplateDialog, hasCreateOrganizationTemplatePermission } from '../util/createTemplate';
import { FixedIcon } from '../widgetDisplay/components/WidgetStyle';
import { SettingCollapseWrap } from '../widgetSetting/content/styled';
import DraggableItem from './draggableItem';
import ListItemLayer from './ListItemLayer';

const { Panel } = Collapse;

const WidgetList = styled.div`
  width: 300px;
  height: 100%;
  display: flex;
  flex-direction: column;
  margin: 0;
  overflow: hidden;
  background-color: var(--color-background-primary);
  .scrollViewContainer {
    flex: 1;
    min-height: 0;
  }
  .groupList {
    padding: 17px 16px 40px 16px;
    box-sizing: border-box;
    &.isTemplateTab {
      display: flex;
      flex-direction: column;
      min-height: 100%;
    }
    .addWidgetCon {
      display: flex;
      align-items: center;
      justify-content: space-between;
      .title {
        font-size: 17px;
        font-weight: 700;
      }
      .supportBox i {
        margin-left: 8px;
        color: var(--color-text-tertiary);
        font-size: 16px !important;
      }
    }
  }
  .templateTab {
    display: flex;
    align-items: center;
    border-bottom: 1px solid var(--color-border-primary);
    margin: 12px 0;
    .templateTabItem {
      padding: 5px 16px;
      border-bottom: 3px solid transparent;
      color: var(--color-text-secondary);
      font-size: 14px;
      cursor: pointer;
      &:hover {
        color: var(--color-primary);
      }
      &.active {
        color: var(--color-primary);
        border-bottom-color: var(--color-primary) !important;
      }
    }
  }
  .templateList {
    &.isEmpty {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .templateGroupCollapse {
      &.ant-collapse {
        background: transparent !important;
        .ant-collapse-item > .ant-collapse-header {
          padding: 12px 0 !important;
        }
        .ant-collapse-content-box {
          padding-bottom: 0 !important;
        }
      }
    }
    .templateItemCollapse {
      &.ant-collapse {
        background: transparent !important;
        .ant-collapse-item {
          margin-bottom: 14px;
          border: 1px solid var(--color-border-primary) !important;
          border-radius: 4px;
          background-color: var(--color-background-primary);
          overflow: hidden;
        }
        .ant-collapse-item > .ant-collapse-header {
          align-items: center;
          min-height: 36px;
          padding: 0 12px 0 0 !important;
          font-size: 13px !important;
          font-weight: normal;
          & > div:first-child {
            line-height: 28px;
            margin: 3px 6px;
            width: 28px;
            height: 28px;
            text-align: center;
            border-radius: 4px;
            &:hover {
              background: var(--color-background-hover);
            }
          }
          .anticon {
            margin-right: 0 !important;
          }
          .ant-collapse-header-text {
            min-width: 0;
          }
        }
        .ant-collapse-content-box {
          padding: 0 0 12px 0 !important;
        }
      }
    }
    .templateSingleItem {
      margin-bottom: 14px;
      border: 1px solid var(--color-border-primary);
      border-radius: 4px;
      background-color: var(--color-background-primary);
      overflow: hidden;
      .templateItemHeaderContent {
        min-height: 36px;
        padding: 0 12px 0 14px;
        font-size: 13px;
        &:hover {
          background: var(--color-background-hover);
        }
      }
    }
    .templateItemHeaderContent {
      display: flex;
      align-items: center;
      width: 100%;
      line-height: 34px;
      .templateName {
        flex: 1;
        min-width: 0;
      }
      .templateCount {
        flex-shrink: 0;
        color: var(--color-text-secondary);
      }
      .templateMore {
        display: none;
        flex-shrink: 0;
        color: var(--color-text-tertiary);
        font-size: 18px;
        line-height: 34px;
        cursor: pointer;
        &:hover {
          color: var(--color-primary);
        }
      }
      .templateIcon {
        flex-shrink: 0;
        margin-right: 10px;
        color: var(--color-text-tertiary);
        font-size: 16px;
      }
      &.hasTemplateAction:hover {
        .templateCount {
          display: none;
        }
        .templateMore {
          display: inline-block;
        }
      }
    }
    .templateControlList {
      .templateControl {
        display: flex;
        align-items: center;
        height: 36px;
        padding: 0 12px;
        font-size: 14px;
        i {
          margin-right: 10px;
          color: var(--color-text-tertiary);
          font-size: 16px;
        }
      }
    }
    .templateEmpty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      .templateEmptyIcon {
        font-size: 64px;
        color: rgba(128, 128, 128, 0.14);
      }
      .templateEmptyText {
        margin-top: 12px;
        color: var(--color-text-tertiary);
        font-size: 14px;
      }
    }
  }
  .group {
    margin-top: 12px;
    .title {
      font-weight: 700;
    }
  }
  ul {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    margin-top: 12px;
  }
  .widgetCustom {
    position: relative;
    border: 1px solid transparent !important;
    background-clip: padding-box, border-box;
    background-origin: padding-box, border-box;
    background-image:
      linear-gradient(to bottom, var(--color-background-primary), var(--color-background-primary)),
      linear-gradient(180deg, #6e00ff, #c822eb);
    .widgetItem > span:not(.betaIcon) {
      background: linear-gradient(316deg, #c822eb, #6e00ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    &:hover {
      background-image:
        linear-gradient(to bottom, var(--color-background-hover), var(--color-background-hover)),
        linear-gradient(180deg, #6e00ff, #c822eb);
    }
  }
  .widgetLi {
    display: flex;
    width: 48%;
    min-height: 36px;
    box-sizing: border-box;
    margin-bottom: 12px;
    padding-left: 10px;
    padding-right: 4px;
    list-style: none;
    position: relative;
    background-color: var(--color-background-primary);
    border: 1px solid var(--color-border-primary);
    border-radius: 4px;
    &:hover:not(.widgetCustom),
    &.active {
      background: var(--color-background-secondary);
      border-color: var(--color-border-primary);
    }
    .betaIcon {
      position: absolute;
      color: #6e00ff !important;
      font-size: 16px;
      top: -6px;
      right: -11px;
      background: var(--color-background-primary);
      font-weight: normal !important;
    }
    .widgetItem {
      display: flex;
      align-items: center;
      box-sizing: border-box;
      width: 100%;
      padding: 0;
      cursor: pointer;
      span {
        line-height: 12px;
        flex-grow: 0;
        word-break: break-word;
        color: var(--color-text-secondary);
        font-weight: bold;
      }
      i {
        flex-shrink: 0;
        font-size: 16px;
        width: 25px;
        display: inline-block;
        color: var(--color-text-tertiary);
      }
    }
  }
`;

const WIDGET_TAB = [
  { text: _l('字段'), value: 1 },
  { text: _l('模板'), value: 2 },
];

const replaceIds = (data, idMap) => {
  let dataStr = JSON.stringify(data);

  Object.keys(idMap).forEach(id => {
    dataStr = dataStr.replace(new RegExp(_.escapeRegExp(id), 'g'), idMap[id]);
  });

  return safeParse(dataStr, _.isArray(data) ? 'array' : 'object');
};

const collectSearchQueryIds = data => {
  const queryIds = [];

  const collect = value => {
    if (_.isArray(value)) {
      value.forEach(collect);
      return;
    }

    if (_.isObject(value)) {
      Object.keys(value).forEach(key => {
        if (key === 'dynamicsrc') {
          const dynamicSrc = safeParse(value[key] || '{}');

          if (dynamicSrc.id) {
            queryIds.push(dynamicSrc.id);
          }

          return;
        }

        collect(value[key]);
      });
      return;
    }

    if (_.isString(value) && /^[\s]*[\[{]/.test(value)) {
      const parsedValue = safeParse(value);

      if (_.isObject(parsedValue)) {
        collect(parsedValue);
      }
    }
  };

  collect(data);

  return _.uniq(queryIds);
};

const cloneSearchWorksheetQueries = async ({ controls, idMap, updateQueryConfigs = () => {} }) => {
  const queryIds = collectSearchQueryIds(controls);

  if (_.isEmpty(queryIds)) return {};

  const res = await worksheetAjax.getQueries({ ids: queryIds });
  const queryConfigs = _.isArray(res) ? res : formatSearchConfigs(res);

  if (_.isEmpty(queryConfigs)) {
    throw new Error('Query config not found');
  }

  const queryIdMap = {};

  await Promise.all(
    queryIds.map(async queryId => {
      const queryConfig = _.find(queryConfigs, q => q.id === queryId);

      if (!queryConfig) {
        throw new Error('Query config not found');
      }

      const params = {
        ...queryConfig,
        id: '',
        items: replaceIds(queryConfig.items || [], idMap),
        configs: replaceIds(queryConfig.configs || [], idMap),
      };

      const saveRes = await worksheetAjax.saveQuery(params);

      if (!saveRes || !saveRes.id) {
        throw new Error('Query config save failed');
      }

      queryIdMap[queryId] = saveRes.id;
      updateQueryConfigs({
        ...params,
        id: saveRes.id,
      });
    }),
  );

  return queryIdMap;
};

const isBlankSubListControl = (control = {}) => {
  if (control.type !== 34) return false;

  return _.includes(control.dataSource, '-') || _.get(control, 'advancedSetting.detailworksheettype') === '2';
};

const cloneTemplateControls = async (controls, updateQueryConfigs) => {
  const idMap = {};

  const collectControlIds = (list = []) => {
    list.forEach(control => {
      if (control.controlId) {
        idMap[control.controlId] = uuidv4();
      }

      // 空白子表才替换
      if (isBlankSubListControl(control)) {
        if (control.dataSource) {
          idMap[control.dataSource] = idMap[control.dataSource] || uuidv4();
        }

        collectControlIds(control.relationControls);
      }
    });
  };

  collectControlIds(controls);

  const queryIdMap = await cloneSearchWorksheetQueries({ controls, idMap, updateQueryConfigs });
  const controlsWithNewIds = replaceIds(controls, { ...idMap, ...queryIdMap });

  return controlsWithNewIds.map(control => ({
    ...control,
    advancedSetting: {
      ...control.advancedSetting,
      custom_event: '',
    },
    attribute: 0,
    alias: '',
    controlId: idMap[control.controlId] || control.controlId,
  }));
};

const TEMPLATE_MORE_DROPDOWN_HEIGHT = 80;

function TemplatePanelHeader(props) {
  const {
    item,
    controls,
    controlCount,
    dropdownVisible,
    onDropdownVisibleChange,
    onAdd,
    onEdit,
    onDelete,
    showOperate = true,
  } = props;
  const templateId = item.templateId || item.id;
  const firstControl = controls[0] || {};
  const { icon: firstControlIcon } = getWidgetInfo(firstControl.type);
  const enumType = enumWidgetType[firstControl.type];
  const moreBtnRef = useRef(null);
  const [dropdownPlacement, setDropdownPlacement] = useState('bottomRight');

  const handleDropdownVisibleChange = visible => {
    if (visible && moreBtnRef.current) {
      const rect = moreBtnRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      setDropdownPlacement(
        spaceBelow < TEMPLATE_MORE_DROPDOWN_HEIGHT && spaceAbove >= spaceBelow ? 'topRight' : 'bottomRight',
      );
    }

    onDropdownVisibleChange(visible);
  };

  const [, drag, preview] = useDrag({
    item: {
      enumType,
      type: firstControl.type === 52 ? DRAG_ITEMS.LIST_TAB : DRAG_ITEMS.LIST_ITEM,
      widgetType: firstControl.type,
      data: firstControl,
      templateId,
      isTemplate: true,
      templateIcon: controlCount === 1 ? firstControlIcon : '',
      templateName: controlCount > 1 ? item.name : firstControl.controlName,
    },
    canDrag: () => !_.isEmpty(controls),
    previewOptions: { captureDraggingState: true },
    end(obj, monitor) {
      const dropResult = monitor.getDropResult();
      if (!dropResult) return;
      onAdd(item, dropResult);
    },
  });

  useEffect(() => {
    preview(getEmptyImage());
  }, [preview]);

  return (
    <div
      ref={drag}
      className={cx('templateItemHeaderContent', { hasTemplateAction: showOperate })}
      onClick={e => {
        e.stopPropagation();
        onAdd(item);
      }}
    >
      {controlCount > 1 ? (
        <Fragment>
          <span className="templateName ellipsis">{item.name}</span>
          <span className="templateCount">{controlCount}</span>
        </Fragment>
      ) : (
        <Fragment>
          <i className={`icon-${firstControlIcon || 'text_bold2'} templateIcon`} />
          <span className="templateName ellipsis">{firstControl.controlName}</span>
        </Fragment>
      )}
      {showOperate && (
        <Dropdown
          trigger={['click']}
          placement={dropdownPlacement}
          visible={dropdownVisible}
          getPopupContainer={() => document.body}
          onVisibleChange={handleDropdownVisibleChange}
          overlay={
            <DropdownOverlay>
              <div className="dropdownContent grayDropdown Width200">
                <div
                  className="item grayItem"
                  onClick={e => {
                    e.stopPropagation();
                    onDropdownVisibleChange(false);
                    onEdit(item);
                  }}
                >
                  <i className="icon-edit" />
                  <span>{_l('编辑')}</span>
                </div>
                <div
                  className="item grayItem"
                  onClick={e => {
                    e.stopPropagation();
                    onDropdownVisibleChange(false);
                    onDelete(item);
                  }}
                >
                  <i className="icon-trash" />
                  <span>{_l('删除')}</span>
                </div>
              </div>
            </DropdownOverlay>
          }
        >
          <i
            ref={moreBtnRef}
            className="icon-more_horiz templateMore"
            onClick={e => e.stopPropagation()}
            onMouseDown={e => e.stopPropagation()}
          />
        </Dropdown>
      )}
    </div>
  );
}

const getTemplateId = item => item.templateId || item.id;
const getTemplateControls = item => _.get(item, 'controls') || [];
const getTemplateControlCount = item => item.controlCount || getTemplateControls(item).length;

export default function List(props) {
  const cache = useRef({});
  cache.current.props = props;
  const containerRef = useRef(false);
  const {
    globalSheetInfo = {},
    activeWidget = {},
    allControls = [],
    widgetPanelFixed,
    listPanelVisible,
    setPanelVisible = () => {},
    templatePersonalList,
    templateOrganizationList,
    setConfig = () => {},
    getTemplateListByPersonal = () => {},
    getTemplateListByOrganization = () => {},
  } = props;
  const { hideWorksheetControl } = md.global.SysSettings;
  const [activeWidgetTab, setActiveWidgetTab] = useState(1);
  const [expandedGroups, setExpandedGroups] = useState(['organization', 'personal']);
  const [expandedTemplates, setExpandedTemplates] = useState([]);
  const [activeDropdownKey, setActiveDropdownKey] = useState('');
  const [hasCreateTemplatePermission, setHasCreateTemplatePermission] = useState(false);

  const handleAdd = (data, para = {}, callback) => {
    let sectionId = '';

    if (para.type === 'click') {
      sectionId = activeWidget.type === 52 ? activeWidget.controlId : activeWidget.sectionId;
    } else {
      sectionId = para.sectionId || '';
    }

    // 标签页、关联多条列表(旧)等不能嵌套
    if (notInsetSectionTab(data)) {
      sectionId = '';
    }

    let newData = {
      ...data,
      sectionId: sectionId,
    };

    handleAddWidgets([newData], para, props, callback);
  };

  const getFeatureType = featureId => {
    return getFeatureStatus(globalSheetInfo.projectId, featureId);
  };

  // 判断某个 widget 是否应该被显示
  const shouldShowWidget = (key, widget) => {
    const featureType = getFeatureType(widget['featureId']);
    if (_.includes(['SEARCH_BTN', 'SEARCH'], key) && !featureType) return false;
    // if (!md.global.SysSettings.enableMap && key === 'LOCATION') return;
    if (
      (key === 'SEARCH_BTN' && md.global.SysSettings.hideIntegration) ||
      // (key === 'OCR' && md.global.SysSettings.hideOCR) ||
      hideWorksheetControl?.includes(key)
    )
      return false;
    return true;
  };

  const clearAndSetWidgetsFromEmitter = (data, para = {}, callback) => {
    window.lastAddWidgetsTriggerByMingo = true;
    clearAndSetWidgets(data, para, cache.current.props, callback);
    setTimeout(() => {
      window.lastAddWidgetsTriggerByMingo = false;
    }, 100);
  };

  const handleAddWidgetsFromEmitter = (data, para = {}, callback) => {
    window.lastAddWidgetsTriggerByMingo = true;
    handleAddWidgets(
      data.map(item => ({ ...item, isMingo: true })),
      {
        ...para,
        isMingo: true,
      },
      cache.current.props,
      ({ newWidgets = [] } = []) => {
        if (para.isStreaming) {
          return;
        }

        batchUpdateWidgetsLayout(
          para.layoutOfAllWidgets,
          {
            ...cache.current.props,
            widgets: newWidgets,
          },
          callback,
        );
      },
    );
    setTimeout(() => {
      window.lastAddWidgetsTriggerByMingo = false;
    }, 100);
  };

  const handleUpdateWidgetsAttributeFromEmitter = (data, callback) => {
    handleUpdateWidgetsAttribute(data, cache.current.props, callback);
  };

  const handleDeleteWidgetsForMingoFromEmitter = (data, para = {}, callback) => {
    handleDeleteWidgetsForMingo(data, cache.current.props, ({ newWidgets = [] } = []) => {
      batchUpdateWidgetsLayout(
        para.layoutOfAllWidgets,
        {
          ...cache.current.props,
          widgets: newWidgets,
        },
        callback,
      );
    });
  };

  useEffect(() => {
    updateGlobalStoreForMingo('allWidgets', allControls);
  }, [allControls]);

  useEffect(() => {
    setHasCreateTemplatePermission(hasCreateOrganizationTemplatePermission(globalSheetInfo.projectId));
  }, [globalSheetInfo.projectId]);

  useEffect(() => {
    emitter.on('WIDGET_CONFIG_CLEAR_AND_SET_WIDGETS', clearAndSetWidgetsFromEmitter);
    emitter.on('WIDGET_CONFIG_DELETE_WIDGETS', handleDeleteWidgetsForMingoFromEmitter);
    emitter.on('WIDGET_CONFIG_ADD_WIDGETS', handleAddWidgetsFromEmitter);
    emitter.on('WIDGET_CONFIG_UPDATE_WIDGETS_ATTRIBUTE', handleUpdateWidgetsAttributeFromEmitter);
    return () => {
      updateGlobalStoreForMingo('allWidgets', []);
      emitter.off('WIDGET_CONFIG_CLEAR_AND_SET_WIDGETS', clearAndSetWidgetsFromEmitter);
      emitter.off('WIDGET_CONFIG_DELETE_WIDGETS', handleDeleteWidgetsForMingoFromEmitter);
      emitter.off('WIDGET_CONFIG_ADD_WIDGETS', handleAddWidgetsFromEmitter);
      emitter.off('WIDGET_CONFIG_UPDATE_WIDGETS_ATTRIBUTE', handleUpdateWidgetsAttributeFromEmitter);
    };
  }, []);

  const handleTemplateDropdownVisibleChange = (templateKey, visible) => {
    setActiveDropdownKey(currentKey => {
      if (visible) return templateKey;

      return currentKey === templateKey ? '' : currentKey;
    });
  };

  const handleAddTemplate = async (item, para = {}) => {
    try {
      const controls = await cloneTemplateControls(getTemplateControls(item), props.updateQueryConfigs);
      if (_.isEmpty(controls)) return;

      for (let i = 0; i < controls.length; i++) {
        const err = checkWidgetMaxNumErr(controls[i], allControls.concat(controls.slice(0, i)));

        if (err) {
          alert(err, 3);
          return;
        }
      }

      handleAddWidgets(controls, para, props);
    } catch (err) {
      console.error(err);
      alert(_l('查询工作表配置失败'), 2);
    }
  };

  const handleEditTemplate = item => {
    createTemplateDialog({
      globalSheetInfo,
      setConfig,
      templateInfo: {
        ...item,
        type: Number(
          item.type || (templatePersonalList.some(template => getTemplateId(template) === getTemplateId(item)) ? 1 : 2),
        ),
      },
      templatePersonalList,
      templateOrganizationList,
    });
  };

  const handleDeleteTemplate = item => {
    Dialog.confirm({
      title: _l('确定要删除此字段模板？'),
      description: _l('删除字段模板后，使用该模板的字段不会被删除。'),
      buttonType: 'danger',
      onOk: () => {
        worksheetAjax
          .operationControlTemplate({ templateId: getTemplateId(item), operationType: 9 })
          .then(res => {
            if (res.code === 1) {
              const nextTemplatePersonalList = (templatePersonalList || []).filter(
                template => getTemplateId(template) !== getTemplateId(item),
              );
              const nextTemplateOrganizationList = (templateOrganizationList || []).filter(
                template => getTemplateId(template) !== getTemplateId(item),
              );

              setConfig({
                templatePersonalList: nextTemplatePersonalList,
                templateOrganizationList: nextTemplateOrganizationList,
              });

              alert(_l('删除成功'));
            } else {
              alert(_l('删除失败'), 2);
            }
          })
          .catch(() => {
            alert(_l('删除失败'), 2);
          });
      },
    });
  };

  const handleSwitchWidgetTab = tabValue => {
    setActiveDropdownKey('');
    setActiveWidgetTab(tabValue);

    if (tabValue === 2) {
      if (_.isUndefined(templatePersonalList)) {
        getTemplateListByPersonal();
      }

      if (_.isUndefined(templateOrganizationList)) {
        getTemplateListByOrganization();
      }
    }
  };

  const renderTemplateGroups = () => {
    const groups = [
      { key: 'organization', title: _l('组织'), list: templateOrganizationList || [] },
      { key: 'personal', title: _l('个人'), list: templatePersonalList || [] },
    ].filter(item => !_.isEmpty(item.list));

    if (_.isEmpty(groups)) {
      return (
        <div className="templateEmpty">
          <i className="icon-borg templateEmptyIcon" />
          <div className="templateEmptyText">{_l('暂无模板')}</div>
        </div>
      );
    }

    return (
      <SettingCollapseWrap
        className="templateGroupCollapse"
        bordered={false}
        activeKey={expandedGroups}
        expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
        onChange={value => {
          setActiveDropdownKey('');
          setExpandedGroups(value);
        }}
      >
        {groups.map(group => (
          <Panel header={group.title} key={group.key}>
            <SettingCollapseWrap
              className="templateItemCollapse"
              bordered={false}
              activeKey={expandedTemplates}
              expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
              onChange={value => {
                setActiveDropdownKey('');
                setExpandedTemplates(value);
              }}
            >
              {group.list.map(item => {
                const templateId = getTemplateId(item);
                const templateKey = `${group.key}-${templateId}`;
                const controls = getTemplateControls(item);
                const controlCount = getTemplateControlCount(item);
                const showOperate = group.key !== 'organization' || hasCreateTemplatePermission;

                if (controlCount === 1) {
                  return (
                    <div className="templateSingleItem" key={templateKey}>
                      <TemplatePanelHeader
                        item={item}
                        controls={controls}
                        controlCount={controlCount}
                        dropdownVisible={activeDropdownKey === templateKey}
                        onDropdownVisibleChange={visible => handleTemplateDropdownVisibleChange(templateKey, visible)}
                        onAdd={handleAddTemplate}
                        onEdit={handleEditTemplate}
                        onDelete={handleDeleteTemplate}
                        showOperate={showOperate}
                      />
                    </div>
                  );
                }

                return (
                  <Panel
                    collapsible="icon"
                    header={
                      <TemplatePanelHeader
                        item={item}
                        controls={controls}
                        controlCount={controlCount}
                        dropdownVisible={activeDropdownKey === templateKey}
                        onDropdownVisibleChange={visible => handleTemplateDropdownVisibleChange(templateKey, visible)}
                        onAdd={handleAddTemplate}
                        onEdit={handleEditTemplate}
                        onDelete={handleDeleteTemplate}
                        showOperate={showOperate}
                      />
                    }
                    key={templateKey}
                  >
                    <div className="templateControlList">
                      {controls.map(control => {
                        const { icon } = getWidgetInfo(control.type);
                        return (
                          <div className="templateControl" key={control.controlId}>
                            <i className={`icon-${icon || 'text_bold2'}`} />
                            <span className="ellipsis">{control.controlName}</span>
                          </div>
                        );
                      })}
                    </div>
                  </Panel>
                );
              })}
            </SettingCollapseWrap>
          </Panel>
        ))}
      </SettingCollapseWrap>
    );
  };

  const renderContent = () => {
    if (activeWidgetTab === 2) {
      const isTemplateLoading = _.isUndefined(templatePersonalList) || _.isUndefined(templateOrganizationList);
      const isTemplateEmpty =
        !isTemplateLoading && _.isEmpty(templatePersonalList) && _.isEmpty(templateOrganizationList);

      return (
        <Fragment>
          <div className={cx('templateList', { isEmpty: isTemplateEmpty })}>
            {isTemplateLoading ? <LoadDiv className="mTop20" /> : renderTemplateGroups()}
          </div>
        </Fragment>
      );
    }

    return (
      <Fragment>
        {!window.platformENV.isOverseas && !window.platformENV.isLocal && (
          <div className="mTop12">
            <span className="textSecondary">{_l('点击或拖拽添加')}</span>
          </div>
        )}

        {_.keys(WIDGET_GROUP_TYPE).map((group, index) => {
          const { widgets, title } = WIDGET_GROUP_TYPE[group];
          const visibleWidgets = _.keys(widgets).filter(key => shouldShowWidget(key, widgets[key]));
          if (_.isEmpty(visibleWidgets)) return null;
          return (
            <div key={group} className={cx('group', !index ? 'mTop20' : '')}>
              <div className="title">{title}</div>
              <ul>
                {visibleWidgets.map(key => {
                  const featureType = getFeatureType(widgets[key]['featureId']);
                  return (
                    <DraggableItem
                      key={key}
                      item={{ ...widgets[key], enumType: key, featureType }}
                      addWidget={handleAdd}
                      {...props}
                    />
                  );
                })}
              </ul>
            </div>
          );
        })}
      </Fragment>
    );
  };

  return (
    <WidgetList
      className="WidgetListPanel"
      onMouseLeave={() => {
        if (!widgetPanelFixed && listPanelVisible && !containerRef.current) {
          setPanelVisible({ widgetVisible: false });
        }
      }}
    >
      <ListItemLayer {..._.pick(props, ['listPanelVisible', 'setPanelVisible'])} containerRef={containerRef} />
      <ScrollView>
        <div className={cx('groupList', { isTemplateTab: activeWidgetTab === 2 })}>
          {!window.platformENV.isOverseas && !window.platformENV.isLocal && (
            <div className="addWidgetCon">
              <div className="flexCenter">
                <span className="title">{_l('添加字段')}</span>
                <Support className="supportBox" type={1} href="https://help.mingdao.com/worksheet/controls" />
              </div>
              <FixedIcon {...props} fixedKey="widgetPanelFixed" />
            </div>
          )}

          <div className="templateTab">
            {WIDGET_TAB.map(item => {
              return (
                <div
                  className={cx('templateTabItem', { active: activeWidgetTab === item.value })}
                  key={item.value}
                  onClick={() => handleSwitchWidgetTab(item.value)}
                >
                  {item.text}
                </div>
              );
            })}
          </div>

          {renderContent()}
        </div>
      </ScrollView>
    </WidgetList>
  );
}

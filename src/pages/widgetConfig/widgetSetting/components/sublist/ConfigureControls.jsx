import React, { Fragment, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSetState } from 'react-use';
import cx from 'classnames';
import update from 'immutability-helper';
import _ from 'lodash';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { Icon, SortableList, Support } from 'ming-ui';
import { Dropdown, Modal, Tooltip } from 'ming-ui/antd-components';
import { withOpeners } from 'ming-ui/hooks/useFunctionWrapComponent';
import worksheetAjax from 'src/api/worksheet';
import { dealCopyWidgetId } from 'src/pages/widgetConfig/internal/editorData';
import { handleAdvancedSettingChange } from 'src/utils/domain/control/advancedSetting';
import { checkWidgetMaxNumErr, getWidgetInfo } from 'src/utils/domain/control/metadata';
import { DEFAULT_CONFIG, DEFAULT_DATA, WIDGET_GROUP_TYPE } from 'src/utils/domain/control/widget';
import { enumWidgetType } from 'src/utils/domain/control/widgetTypes';
import { useAddCustomDialog } from '../CustomWidget/AddCustomDialog';
import SelectDataSource from '../SelectDataSource';
import SelectSheetFromApp from '../SelectSheetFromApp';
import SubControlConfig from './SubControlConfig';

const UNSUPPORTED_WIDGET_TYPES = [22, 34, 43, 45, 49, 51, 52];
const WIDGET_MENU_STYLE = { maxHeight: 400, overflowY: 'auto' };

const WidgetInfo = styled.div`
  border: 1px solid var(--color-border-primary);
  border-radius: 3px;
  background-color: var(--color-background-primary);
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 6px;
  .del {
    color: var(--color-text-tertiary);
    &:hover {
      color: var(--color-error);
    }
  }
  .widgetItem {
    display: flex;
    align-items: center;
    flex: 1;
    margin-right: 16px;
    line-height: 36px;
    &:hover {
      border-color: var(--color-primary);
    }

    .name {
      flex: 1;
      padding-left: 12px;
    }
  }
  .iconOption {
    width: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 36px;
  }
`;
const ControlsWrap = styled.div`
  margin-top: 8px;
  display: flex;
  line-height: 36px;
  color: var(--color-primary);
  position: relative;
  &:hover {
    color: var(--color-link-hover);
  }
  align-items: center;
  padding-left: 12px;
  cursor: pointer;
  > span {
    margin-left: 6px;
  }
  &.isBg {
    background-color: var(--color-background-secondary);
  }
  &.disabled {
    color: var(--color-text-disabled) !important;
    cursor: not-allowed;
  }
`;

const ConfigureWrap = styled.div`
  max-height: 440px;
  overflow-x: hidden;
  margin-right: -8px;
  padding-right: 8px;
`;

const getFilterData = value => {
  if (!value) return WIDGET_GROUP_TYPE;
  let filterData = {};

  _.keys(WIDGET_GROUP_TYPE).forEach(key => {
    let filterWidgets = {};
    const { widgets = {}, title } = WIDGET_GROUP_TYPE[key];
    _.map(widgets, (widget = {}, itemKey) => {
      const type = enumWidgetType[itemKey];

      if (widget.widgetName.includes(value) && !UNSUPPORTED_WIDGET_TYPES.includes(type)) {
        filterWidgets[itemKey] = widget;
      }
    });
    if (!_.isEmpty(filterWidgets)) {
      filterData[key] = { title, widgets: filterWidgets };
    }
  });

  return filterData;
};

const SortableItem = ({ item, deleteWidget, copyWidget, configureWidget, DragHandle }) => {
  const { controlName, widgetName, type } = item;
  const { icon } = getWidgetInfo(type);
  return (
    <WidgetInfo>
      <DragHandle>
        <div className="iconOption grab">
          <i className="icon-drag textTertiary hoverColorPrimary"></i>
        </div>
      </DragHandle>
      <div className="widgetItem noSelect overflow_ellipsis pointer" onMouseDown={configureWidget}>
        <i className={`icon-${icon} textTertiary Font_16`}></i>
        <div className="name overflow_ellipsis" title={controlName || widgetName}>
          {controlName || widgetName}
        </div>
      </div>
      <div className="iconOption">
        <Tooltip title={_l('复制')}>
          <i className="copy icon-copy pointer textTertiary hoverColorPrimary Font16" onMouseDown={copyWidget}></i>
        </Tooltip>
      </div>
      <div className="iconOption mRight5">
        <Tooltip title={_l('删除')}>
          <i className="del icon-delete_12 pointer Font16" onMouseDown={deleteWidget}></i>
        </Tooltip>
      </div>
    </WidgetInfo>
  );
};

function ConfigureControl(props) {
  const { openAddCustomDialog } = props;
  const { data, globalSheetInfo, controls, onChange, ...rest } = props;
  const { appId } = globalSheetInfo;
  const $wrap = useRef(null);
  const [activeWidgetState, setActiveWidgetState] = useState({ controlId: data.controlId, index: -1 });
  const [visible, setValue] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [{ selectCascadeDataSourceVisible }, setVisible] = useSetState({ selectCascadeDataSourceVisible: false });
  const disabledAdd = _.get(controls, 'length') >= 100;
  const count = controls.length;
  const filterData = getFilterData(searchValue);
  const activeWidgetIndex = activeWidgetState.controlId === data.controlId ? activeWidgetState.index : -1;

  // 子表字段增删改序后，controlssorts 必须跟着 showControls 一起更新，否则渲染时列顺序会错乱
  const updateControlsWithSorts = nextControls => ({
    ...handleAdvancedSettingChange(data, {
      controlssorts: JSON.stringify(nextControls.map(({ controlId }) => controlId)),
    }),
    relationControls: nextControls,
    showControls: nextControls.map(({ controlId }) => controlId),
  });

  const addControl = control => {
    const nextControls = controls.concat(control);
    onChange(updateControlsWithSorts(nextControls));
    // 滚动条拖底
    if (count >= 10 && $wrap && $wrap.current) {
      const wrapTimer = setTimeout(() => {
        $wrap.current.scrollTop = (count + 1) * 44 - 440;
        clearTimeout(wrapTimer);
      }, 50);
    }
  };

  const handleDeleteWidget = index => {
    const newRelationControls = update(controls, { $splice: [[index, 1]] });
    onChange(updateControlsWithSorts(newRelationControls));
  };

  const handleWidgetMenuItemClick = key => {
    const type = enumWidgetType[key];
    const defaultData = DEFAULT_DATA[key] || {};
    const controlData = {
      ...defaultData,
      controlName: type === 10010 ? _l('备注') : defaultData.controlName,
      type,
      controlId: uuidv4(),
    };

    if (disabledAdd) {
      alert(_l('最多添加100个字段'), 3);
      return;
    }

    const err = checkWidgetMaxNumErr(controlData, controls);

    if (err) {
      alert(err, 3);
      return;
    }

    if (type === 35) {
      setValue(false);
      setSearchValue('');
      setVisible({ selectCascadeDataSourceVisible: true });
      return;
    }

    if (type === 29) {
      let dataSource = '';
      let controlName = '';
      setValue(false);
      setSearchValue('');
      Modal.confirm({
        title: _l('选择工作表'),
        content: (
          <Fragment>
            <div
              className="intro"
              style={{
                color: 'var(--color-text-tertiary)',
              }}
            >
              {_l('在表单中显示关联的记录。如：订单关联客户')}
              <Support type={3} text={_l('帮助')} href={'https://help.mingdao.com/worksheet/control-relationship'} />
            </div>
            <SelectSheetFromApp
              globalSheetInfo={globalSheetInfo}
              onChange={({ sheetId, sheetName }) => {
                dataSource = sheetId;
                controlName = sheetName;
              }}
            />
          </Fragment>
        ),
        okText: _l('确定'),
        onOk: () => {
          if (dataSource) {
            worksheetAjax
              .getWorksheetInfo({
                worksheetId: dataSource,
                getTemplate: true,
              })
              .then(res => {
                addControl({
                  ...controlData,
                  controlName,
                  dataSource,
                  relationControls: (res.template || {}).controls || [],
                });
              });
            return;
          }

          alert(_l('没有选择工作表'), 3);
        },
      });
      return;
    }

    if (type === 54) {
      setValue(false);
      setSearchValue('');
      openAddCustomDialog({
        ...props,
        data: controlData,
        onOk: nextData => {
          addControl(nextData);
        },
        onCancel: () => {
          handleDeleteWidget(controls.length);
        },
      });
      return;
    }

    addControl(controlData);
  };

  const widgetMenuItems = _.keys(filterData)
    .map(groupType => {
      const { title, widgets } = filterData[groupType];
      const children = _.keys(widgets)
        .filter(key => {
          const type = enumWidgetType[key];
          const hidden = (md.global.SysSettings.hideWorksheetControl || '').includes(key);
          return !hidden && !UNSUPPORTED_WIDGET_TYPES.includes(type);
        })
        .map(key => {
          const { icon, widgetName } = DEFAULT_CONFIG[key];
          return {
            key: `${groupType}-${key}`,
            icon: <Icon icon={icon} className="Font16" />,
            label: widgetName,
            onClick: () => handleWidgetMenuItemClick(key),
          };
        });

      return children.length ? { key: groupType, type: 'group', label: title, children } : null;
    })
    .filter(Boolean);

  const handleCopyWidget = index => {
    const curControl = controls[index];
    const newRelationControls = controls.concat([dealCopyWidgetId(curControl)]);
    onChange(updateControlsWithSorts(newRelationControls));
  };

  const handleControlDataChange = (id, obj) => {
    onChange({
      relationControls: update(controls, {
        [activeWidgetIndex]: { $apply: item => ({ ...item, ...obj }) },
      }),
    });
    window.clearLocalDataTime({
      requestData: { worksheetId: data.dataSource },
      clearSpecificKeys: ['Worksheet_GetWorksheetInfo', 'Worksheet_GetWorksheetById'],
    });
  };

  return (
    <Fragment>
      {selectCascadeDataSourceVisible && (
        <SelectDataSource
          editType={0}
          appId={appId}
          onClose={() => {
            setVisible({ selectCascadeDataSourceVisible: false });
          }}
          globalSheetInfo={globalSheetInfo}
          onOk={({ sheetId, viewId }) => {
            const defaultData = DEFAULT_DATA.CASCADER;
            setVisible({ selectCascadeDataSourceVisible: false });
            if (!sheetId) {
              alert(_l('没有选择工作表'), 3);
              return;
            }

            if (!viewId) {
              alert(_l('没有选择视图'), 3);
              return;
            }

            addControl({
              ...defaultData,
              type: 35,
              controlId: uuidv4(),
              dataSource: sheetId,
              viewId,
            });
          }}
        />
      )}

      {count > 0 && (
        <ConfigureWrap ref={$wrap}>
          <SortableList
            renderBody
            useDragHandle
            items={controls}
            itemKey="controlId"
            onSortEnd={nextControls => {
              onChange(updateControlsWithSorts(nextControls));
            }}
            renderItem={({ item, index, DragHandle }) => (
              <SortableItem
                item={item}
                DragHandle={DragHandle}
                copyWidget={() => handleCopyWidget(index)}
                deleteWidget={() => handleDeleteWidget(index)}
                configureWidget={() => setActiveWidgetState({ controlId: data.controlId, index })}
              />
            )}
          />
        </ConfigureWrap>
      )}
      <Dropdown
        trigger={['click']}
        open={visible}
        showPopupSearch
        searchValue={searchValue}
        filterOption={false}
        notFoundContent={_l('没有搜索结果')}
        onSearch={setSearchValue}
        onOpenChange={(value, { source } = {}) => {
          if (source === 'menu') return;
          setValue(value);
          if (!value) {
            setSearchValue('');
          }
        }}
        menu={{ items: widgetMenuItems, style: WIDGET_MENU_STYLE }}
      >
        <ControlsWrap className={cx({ disabled: disabledAdd, isBg: !count })}>
          <i className="icon-plus Font16" />
          <span>{_l('添加字段')}</span>
        </ControlsWrap>
      </Dropdown>
      {activeWidgetIndex > -1 &&
        createPortal(
          <SubControlConfig
            controls={controls}
            control={controls[activeWidgetIndex]}
            subListData={data}
            backTop={() => {
              setActiveWidgetState({ controlId: data.controlId, index: -1 });
            }}
            changeWidgetData={handleControlDataChange}
            globalSheetInfo={globalSheetInfo}
            {...rest}
          />,
          document.getElementById('widgetConfigSettingWrap'),
        )}
    </Fragment>
  );
}

export default withOpeners(ConfigureControl, {
  openAddCustomDialog: useAddCustomDialog,
});

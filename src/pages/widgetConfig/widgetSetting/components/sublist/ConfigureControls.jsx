import React, { useState, useRef, useEffect, Fragment } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { Dropdown } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import cx from 'classnames';
import { Menu, MenuItem, Dialog, Support, SortableList } from 'ming-ui';
import update from 'immutability-helper';
import { useSetState } from 'react-use';
import SubControlConfig from './SubControlConfig';
import SelectSheetFromApp from '../SelectSheetFromApp';
import SelectDataSource from '../SelectDataSource';
import { DEFAULT_CONFIG, DEFAULT_DATA, WIDGET_GROUP_TYPE } from '../../../config/widget';
import { enumWidgetType, getWidgetInfo, checkWidgetMaxNumErr } from '../../../util';
import { handleAdvancedSettingChange } from '../../../util/setting';
import worksheetAjax from 'src/api/worksheet';
import { addCustomDialog } from '../CustomWidget/AddCustomDialog';
import _ from 'lodash';

const AllWidgetsWrap = styled.div`
  overflow: auto;
  background-color: #fff;
  max-height: 400px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.24);
  .ming.Item.widgetMenuItem {
    height: 36px;
    line-height: 36px;
    &:hover {
      .icon-custom-01 {
        color: #fff !important;
        background: unset;
        -webkit-text-fill-color: unset;
      }
    }
  }
  .ming.Menu {
    width: 100%;
  }
  ul {
    max-height: 400px;
    overflow: auto;
  }
  .title {
    font-size: 13px;
    font-weight: bold;
    border-top: 1px solid #eaeaea;
    line-height: 30px;
    padding-left: 16px;
    padding-top: 6px;
    color: #9e9e9e;
    &:first-child {
      border: none;
    }
  }
`;

const WidgetInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 6px;
  .del {
    color: #9e9e9e;
    &:hover {
      color: #f44336;
    }
  }
  .widgetItem {
    display: flex;
    align-items: center;
    flex: 1;
    padding: 0 12px;
    margin: 0 8px;
    margin-right: 16px;
    line-height: 36px;
    border: 1px solid #eaeaea;
    border-radius: 3px;
    background-color: #fff;
    &:hover {
      border-color: #2196f3;
    }

    .name {
      flex: 1;
      padding-left: 12px;
    }
  }
`;
const ControlsWrap = styled.div`
  margin-top: 8px;
  display: flex;
  line-height: 36px;
  color: #2196f3;
  position: relative;
  &:hover {
    color: #1565c0;
  }
  align-items: center;
  padding-left: 12px;
  cursor: pointer;
  span {
    margin-left: 6px;
  }
  &.isBg {
    background-color: #f5f5f5;
  }
  &.disabled {
    color: #bdbdbd !important;
    cursor: not-allowed;
  }
`;

const ConfigureWrap = styled.div`
  max-height: 440px;
  overflow-x: hidden;
  margin-right: -8px;
  padding-right: 8px;
`;

const SortableItem = ({ item, deleteWidget, configureWidget, DragHandle }) => {
  const { controlName, widgetName, type } = item;
  const { icon } = getWidgetInfo(type);
  return (
    <WidgetInfo>
      <DragHandle>
        <i className="icon-drag Gray_9e ThemeHoverColor3 pointer"></i>
      </DragHandle>
      <div className="widgetItem noSelect overflow_ellipsis" onMouseDown={configureWidget}>
        <i className={`icon-${icon} Gray_9e Font_16`}></i>
        <div className="name overflow_ellipsis" title={controlName || widgetName}>
          {controlName || widgetName}
        </div>
        <i className="icon-arrow-right-border pointer Gray_9e"></i>
      </div>
      <i className="del icon-delete_12 pointer Font16" onMouseDown={deleteWidget}></i>
    </WidgetInfo>
  );
};

export default function ConfigureControl(props) {
  const { data, globalSheetInfo, controls, onChange, ...rest } = props;
  const { appId } = globalSheetInfo;
  const $ref = useRef(null);
  const $wrap = useRef(null);
  const [activeWidgetIndex, setWidgetIndex] = useState(-1);
  const [visible, setValue] = useState(false);
  const [{ selectCascadeDataSourceVisible }, setVisible] = useSetState({ selectCascadeDataSourceVisible: false });
  let dataSource = '';
  let controlName = '';
  const disabledAdd = _.get(controls, 'length') >= 100;
  const count = controls.length;

  useEffect(() => {
    setWidgetIndex(-1);
  }, [data.controlId]);

  const addControl = control => {
    const nextControls = controls.concat(control);
    onChange({ relationControls: nextControls, showControls: nextControls.map(({ controlId }) => controlId) });
    // 滚动条拖底
    if (count >= 10 && $wrap && $wrap.current) {
      const wrapTimer = setTimeout(() => {
        $wrap.current.scrollTop = (count + 1) * 44 - 440;
        clearTimeout(wrapTimer);
      }, 50);
    }
  };

  const SelectWidgetMenu = (
    <AllWidgetsWrap>
      <Menu>
        {_.keys(WIDGET_GROUP_TYPE).map(groupType => {
          const { title, widgets } = WIDGET_GROUP_TYPE[groupType];
          // if (groupType === 'SPECIAL') return null;
          return (
            <Fragment key={groupType}>
              <div className="title">{title}</div>
              {_.keys(widgets).map(key => {
                const type = enumWidgetType[key];
                const { icon, widgetName } = DEFAULT_CONFIG[key];
                const defaultData = DEFAULT_DATA[key] || {};
                const data = {
                  ...defaultData,
                  controlName: type === 10010 ? _l('备注') : defaultData.controlName,
                  type,
                  controlId: uuidv4(),
                };
                if ((md.global.SysSettings.hideWorksheetControl || '').includes(key)) return null;
                // 子表表单不允许再添加分段、子表、文本识别、嵌入、查询记录、备注
                if (_.includes([22, 34, 43, 45, 49, 51, 52], type)) return null;
                return (
                  <MenuItem
                    key={type}
                    className="widgetMenuItem"
                    icon={<i style={{ verticalAlign: 'text-top' }} className={`icon-${icon} icon pointer Font16`}></i>}
                    onClick={() => {
                      if (disabledAdd) {
                        alert(_l('最多添加100个字段'), 3);
                        return;
                      }
                      const err = checkWidgetMaxNumErr(data, controls);
                      if (err) {
                        alert(err, 3);
                        return;
                      }
                      if (type === 35) {
                        setVisible({ selectCascadeDataSourceVisible: true });
                        return;
                      }
                      if (type === 29) {
                        Dialog.confirm({
                          title: _l('选择工作表'),
                          children: (
                            <Fragment>
                              <div className="intro" style={{ color: '#9e9e9e' }}>
                                {_l('在表单中显示关联的记录。如：订单关联客户')}
                                <Support
                                  type={3}
                                  text={_l('帮助')}
                                  href={'https://help.mingdao.com/worksheet/control-relationship'}
                                />
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
                                    ...data,
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
                        addCustomDialog({
                          ...props,
                          data,
                          onOk: nextData => {
                            addControl(nextData);
                          },
                          onCancel: () => {
                            handleDeleteWidget(controls.length);
                          },
                        });
                        return;
                      } else {
                        addControl(data);
                      }
                    }}
                  >
                    <span style={{ marginLeft: '8px' }}>{widgetName}</span>
                  </MenuItem>
                );
              })}
            </Fragment>
          );
        })}
      </Menu>
    </AllWidgetsWrap>
  );

  const handleDeleteWidget = index => {
    onChange({ relationControls: update(controls, { $splice: [[index, 1]] }) });
  };

  const handleControlDataChange = (id, obj) => {
    onChange({
      relationControls: update(controls, {
        [activeWidgetIndex]: { $apply: item => ({ ...item, ...obj }) },
      }),
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
            useDragHandle
            items={controls}
            itemKey="controlId"
            onSortEnd={nextControls => {
              onChange({
                ...handleAdvancedSettingChange(data, {
                  controlssorts: JSON.stringify(nextControls.map(item => item.controlId)),
                }),
                relationControls: nextControls,
                showControls: nextControls.map(({ controlId }) => controlId),
              });
            }}
            renderItem={({ item, index, DragHandle }) => (
              <SortableItem
                item={item}
                DragHandle={DragHandle}
                deleteWidget={() => handleDeleteWidget(index)}
                configureWidget={() => setWidgetIndex(index)}
              />
            )}
          />
        </ConfigureWrap>
      )}
      <Dropdown
        trigger={['click']}
        visible={visible}
        overlay={SelectWidgetMenu}
        onVisibleChange={value => setValue(value)}
        getPopupContainer={() => $ref.current}
      >
        <ControlsWrap className={cx({ disabled: disabledAdd, isBg: !count })} ref={$ref}>
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
              setWidgetIndex(-1);
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

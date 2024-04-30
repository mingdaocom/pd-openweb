import React, { Fragment, useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Icon, Menu, MenuItem, Checkbox } from 'ming-ui';
import cx from 'classnames';
import { Tooltip } from 'antd';
import { useSetState } from 'react-use';
import { SortableContainer, SortableElement, SortableHandle, arrayMove } from 'react-sortable-hoc';
import { getIconByType } from 'src/pages/widgetConfig/util';
import ChangeName from 'src/pages/integration/components/ChangeName.jsx';
import Trigger from 'rc-trigger';
import { OPERATION_TYPE_DATA } from 'src/pages/integration/dataIntegration/TaskCon/TaskCanvas/config.js';
import NumInput from 'src/pages/worksheet/common/ViewConfig/components/NumInput.jsx';
import CalculationDialog from './CalculationDialog';
import _ from 'lodash';
import { handleAdvancedSettingChange } from 'src/util/index.js';
import { getDefaultOperationDatas, extractBetweenDollars } from 'src/pages/AppSettings/components/Aggregation/util.js';
import { DEFAULT_COLORS } from '../config';
import { getRuleAlias } from '../util';

const WrapS = styled(Menu)`
  // &.rowsCountItem {
  //   height: 40px;
  // }
  // height: 120px;
  .ming.MenuItem .Item-content:not(.disabled):hover {
    background: #f5f5f5 !important;
    color: initial !important;
    .icon {
      color: #9e9e9e !important;
    }
    .Red {
      color: red !important;
    }
  }
  .Red.ming.MenuItem .Item-content:not(.disabled):hover {
    color: red !important;
  }
  .ming.Item .Item-content {
    padding: 0 8px 0 16px;
    & > span {
      display: flex;
      .Icon {
        position: initial;
      }
    }
  }
`;
const WrapItem = styled.div`
  height: 36px;
  background: #ffffff;
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.16);
  border-radius: 4px;
  z-index: 1000;
  .dragIcon {
    opacity: 0;
    position: absolute;
    left: -16px;
    font-size: 14px;
  }
  &:hover {
    .dragIcon {
      opacity: 1;
    }
  }
`;
const ActWrap = styled.div`
  width: 180px;
  background: #ffffff;
  box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.16);
  border-radius: 4px;
  padding: 6px 0;
  .labelWrap {
    &.H36 {
      height: 36px;
    }
    padding: 0 16px;
    min-height: 36px;
    line-height: 36px;
    &:hover {
      background: #f5f5f5;
    }
    .ant-input {
      height: 28px;
    }
    .numberControlBox .iconWrap {
      height: 14px;
    }
    .numberControlBox .iconWrap i {
      vertical-align: top;
      line-height: 14px;
    }
  }
`;
const max = 8;
function FormatWrap(props) {
  const { num, onUpdate } = props;
  const [{ items, show }, setState] = useSetState({
    items: props.items,
    show: false,
  });
  return (
    <Trigger
      action={['click']}
      popupAlign={{ points: ['tl', 'tr'], offset: [0, -5], overflow: { adjustX: true, adjustY: true } }}
      popupVisible={show}
      onPopupVisibleChange={show => {
        if (!show && !_.isEqual(props.items, items)) {
          onUpdate(items, false);
        }
        setState({
          show,
        });
      }}
      popup={
        <ActWrap className="">
          {/* 显示千分位（默认勾选）、按百分比显示、小数位数（默认2位，最大8位） */}
          <div className="labelWrap H36">
            <Checkbox
              size="small"
              checked={_.get(items[num], 'controlSetting.advancedSetting.thousandth') !== '1'}
              onClick={checked => {
                setState({
                  items: items.map((it, i) => {
                    if (i === num) {
                      return {
                        ...it,
                        controlSetting: handleAdvancedSettingChange(_.get(items[num], 'controlSetting'), {
                          thousandth: checked ? '1' : '0',
                        }),
                      };
                    } else {
                      return it;
                    }
                  }),
                });
              }}
              text={_l('显示千分位')}
            />
          </div>
          <div className="labelWrap H36">
            <Checkbox
              size="small"
              checked={_.get(items[num], 'controlSetting.advancedSetting.numshow') === '1'}
              onClick={checked => {
                setState({
                  items: items.map((it, i) => {
                    if (i === num) {
                      return {
                        ...it,
                        controlSetting: handleAdvancedSettingChange(_.get(items[num], 'controlSetting'), {
                          suffix: checked ? '' : '%',
                          prefix: '',
                          numshow: checked ? '0' : '1',
                        }),
                      };
                    } else {
                      return it;
                    }
                  }),
                });
              }}
              text={_l('按百分比显示')}
            />
          </div>
          <div className="labelWrap">
            <div className="H36">
              <Checkbox
                size="small"
                checked={!!_.get(items[num], 'controlSetting.advancedSetting.dot')}
                onClick={checked => {
                  setState({
                    items: items.map((it, i) => {
                      if (i === num) {
                        return {
                          ...it,
                          controlSetting: handleAdvancedSettingChange(_.get(items[num], 'controlSetting'), {
                            dot: !!_.get(items[num], 'controlSetting.advancedSetting.dot') ? '' : '2',
                          }),
                        };
                      } else {
                        return it;
                      }
                    }),
                  });
                }}
                text={_l('小数位数')}
              />
            </div>
            {_.get(items[num], 'controlSetting.advancedSetting.dot') && (
              <div className="flex mLeft20 showCount flexRow alignItemsCenter">
                <NumInput
                  className="flex"
                  minNum={2}
                  maxNum={max}
                  value={Number(_.get(items[num], 'controlSetting.advancedSetting.dot'))}
                  onChange={value => {
                    let count = JSON.stringify(max >= value ? value : max);
                    if (count === _.get(items[num], 'controlSetting.advancedSetting.dot')) {
                      return;
                    }

                    setState({
                      items: items.map((it, i) => {
                        if (i === num) {
                          return {
                            ...it,
                            controlSetting: handleAdvancedSettingChange(_.get(items[num], 'controlSetting'), {
                              dot: count,
                            }),
                          };
                        } else {
                          return it;
                        }
                      }),
                    });
                  }}
                />
              </div>
            )}
          </div>
          {items[num].dot && (
            <div className="labelWrap">
              <Checkbox
                size="small"
                className="mTop8"
                checked={_.get(items[num], 'controlSetting.advancedSetting.dotformat') === '1'}
                onClick={checked => {
                  setState({
                    items: items.map((it, i) => {
                      if (i === num) {
                        return {
                          ...it,
                          controlSetting: handleAdvancedSettingChange(_.get(items[num], 'controlSetting'), {
                            dotformat: checked ? '0' : '1',
                          }),
                        };
                      } else {
                        return it;
                      }
                    }),
                  });
                }}
              >
                <span style={{ marginRight: '4px' }}>{_l('省略末尾的0')}</span>
                <Tooltip
                  title={_l(
                    '勾选后，不足小数位数时省略末尾的0。如设置4位小数时，默认显示完整精度2.800，勾选后显示为2.8',
                  )}
                >
                  <i className="icon-help Gray_bd Font15"></i>
                </Tooltip>
              </Checkbox>
            </div>
          )}
        </ActWrap>
      }
    >
      <MenuItem className="flexRow alignItemsCenter">
        <span className="text flex Font14">{_l('数据格式')}</span>
        <Icon className="Font15 Gray_9e Font14" icon="arrow-right-tip" />
      </MenuItem>
    </Trigger>
  );
}
export default function AggregationCon(props) {
  const { list, onChange, updateErr } = props;

  const SortHandle = SortableHandle(() => <Icon className="Gray_bd Hand dragIcon ThemeHoverColor3" icon="drag" />);

  const Item = SortableElement(props => {
    const { item, onUpdate, items, num, sourceTables, flowData } = props;
    const [{ showChangeName, showCalculation, popupVisible }, setState] = useSetState({
      showChangeName: false,
      showCalculation: false,
      popupVisible: false,
    });
    let index = -1;
    (sourceTables || []).find((it, i) => {
      if (item.oid && item.oid.indexOf(it.workSheetId) >= 0) {
        index = i;
      }
    });
    const color = item.isCalculateField ? '#9e9e9e' : DEFAULT_COLORS[index];
    let isDelete = _.get(item, 'isDelete');
    if (item.isCalculateField) {
      const ids = extractBetweenDollars(_.get(item, 'controlSetting.dataSource'));
      const calculateFields = list.filter(o => !o.isCalculateField);
      if (ids.filter(o => !!calculateFields.find(it => it.id === o)).length < ids.length) {
        isDelete = true;
      }
    } else {
      if (!sourceTables.find(it => item.oid && item.oid.indexOf(it.workSheetId) >= 0)) {
        isDelete = true;
      }
    }
    isDelete && updateErr();
    return (
      <WrapItem className="flexRow cardItem alignItemsCenter Relative mTop12 hoverBoxShadow">
        <SortHandle />
        {!item.isCalculateField && index >= 0 && (
          <div className="colorByWorksheet" style={{ backgroundColor: color }}></div>
        )}
        <div className="flex flexRow pLeft16 pRight12 alignItemsCenter Relative">
          {isDelete && !item.isCalculateField ? (
            <span className="Red Bold flex">{_l('字段已删除')}</span>
          ) : (
            <React.Fragment>
              <Icon
                icon={getIconByType(item.isCalculateField ? 31 : 6)} //聚合的字段只有计算和数值两种icon
                className={cx('Font16')}
                style={{ color }}
              />
              <div
                className={cx('flex mLeft5 overflow_ellipsis WordBreak Bold', {
                  Red: isDelete && item.isCalculateField,
                })}
              >
                {item.alias}
                {item.aggFuncType && `(${OPERATION_TYPE_DATA.find(o => o.value === item.aggFuncType).text})`}
              </div>
            </React.Fragment>
          )}

          {!item.isCalculateField && (
            <Tooltip
              placement="bottom"
              color={'#fff'}
              title={
                <span className="Gray">{`${
                  ((props.sourceTables || []).find(o => item.oid.indexOf(o.workSheetId) >= 0) || {}).tableName ||
                  _l('未命名')
                }-${
                  !_.get(item, 'controlSetting') ? _.get(item, 'alias') : _.get(item, 'controlSetting.controlName')
                }`}</span>
              }
            >
              <Icon icon="info_outline" className="Hand Gray_9e ThemeHoverColor3 Font16" />
            </Tooltip>
          )}
          {!item.isCalculateField ? (
            <Trigger
              action={['click']}
              popupVisible={popupVisible}
              onPopupVisibleChange={popupVisible => {
                setState({ popupVisible });
              }}
              getPopupContainer={() => document.body}
              popupAlign={{ points: ['tl', 'bl'], offset: [0, 4], overflow: { adjustX: true, adjustY: true } }}
              popup={
                <WrapS className={cx('Relative', { rowsCountItem: item.isRowsCount })}>
                  <MenuItem
                    className="settingSheet"
                    onClick={() => {
                      setState({
                        showChangeName: true,
                        popupVisible: false,
                      });
                    }}
                  >
                    <span className="text Font14">{_l('重命名')}</span>
                  </MenuItem>
                  {!item.isRowsCount && (
                    <React.Fragment>
                      <Trigger
                        action={['click']}
                        popupAlign={{
                          points: ['tl', 'tr'],
                          offset: [0, -5],
                          overflow: { adjustX: true, adjustY: true },
                        }}
                        popup={
                          <WrapS className="Relative">
                            {/* 数值类字段配置：求和（默认）、最大值、最小值、平均值 ｜ 非数值字段配置：计数、去重计数 */}
                            {getDefaultOperationDatas(item.mdType).map(o => {
                              return (
                                <MenuItem
                                  className={cx('settingSheet flexRow', {
                                    ThemeColor3: o.value === item.aggFuncType,
                                  })}
                                  onClick={() => {
                                    if (o.value === item.aggFuncType) {
                                      return;
                                    }
                                    const hs = !!list.find(it => it.oid === item.oid && it.aggFuncType === o.value);
                                    if (hs) {
                                      alert(_l('不能重复添加相同计算方式的相同字段'), 3);
                                      return;
                                    }
                                    onUpdate(
                                      items.map((it, i) => {
                                        if (i === num) {
                                          return {
                                            ...it,
                                            aggFuncType: o.value,
                                            alias: getRuleAlias(`${it.name}_${o.value}`, flowData),
                                          };
                                        } else {
                                          return it;
                                        }
                                      }),
                                    );
                                    setState({
                                      popupVisible: false,
                                    });
                                  }}
                                >
                                  {o.text}
                                </MenuItem>
                              );
                            })}
                          </WrapS>
                        }
                      >
                        <MenuItem
                          className="flexRow alignItemsCenter"
                          onClick={() => {
                            setState({
                              popupVisible: true,
                            });
                          }}
                        >
                          <span className="text flex Font14">{_l('计算')}</span>
                          <Icon className="Font15 Gray_9e Font14" icon="arrow-right-tip" />
                        </MenuItem>
                      </Trigger>
                      <FormatWrap {...props} />
                    </React.Fragment>
                  )}
                </WrapS>
              }
            >
              <Icon
                icon="arrow-down-border"
                className="Hand Gray_9e ThemeHoverColor3 Font16 mLeft8"
                onClick={() =>
                  setState({
                    popupVisible: true,
                  })
                }
              />
            </Trigger>
          ) : (
            <Tooltip title={_l('编辑')}>
              <Icon
                icon="new_mail"
                className="Hand Gray_9e ThemeHoverColor3 Font16 mLeft8"
                onClick={() => {
                  setState({
                    showCalculation: true,
                  });
                }}
              />
            </Tooltip>
          )}
          <Tooltip title={_l('删除')}>
            <Icon
              icon="clear"
              className="clearIcon Hand Gray_9e del ThemeHoverColor3 mLeft8 Font16"
              onClick={() => {
                onUpdate(items.filter((o, i) => i !== num));
              }}
            />
          </Tooltip>
        </div>
        {showCalculation && (
          <CalculationDialog
            visible={showCalculation}
            onHide={() => {
              setState({
                showCalculation: false,
              });
            }}
            calculation={item.controlSetting}
            allControls={list
              .filter(o => !o.isCalculateField)
              .map(o => {
                return { ...o, controlName: o.alias, controlId: _.get(o, 'id'), type: 6 };
              })}
            onOk={control => {
              let newDt = {
                ...item,
                alias: getRuleAlias(control.controlName, props.flowData),
                controlSetting: control,
                name: control.controlName,
              };
              onUpdate(
                items.map((it, i) => {
                  if (i === num) {
                    return newDt;
                  } else {
                    return it;
                  }
                }),
              );
            }}
          />
        )}
        {showChangeName && (
          <ChangeName
            name={item.alias}
            onCancel={() => {
              setState({
                showChangeName: false,
              });
            }}
            onChange={name => {
              if (item.alias === name) {
                return;
              }
              if (!getRuleAlias(name, flowData, true)) {
                return alert(_l('已存在该字段名称，名称不可重复'), 3);
              }
              onUpdate(
                items.map((o, i) => {
                  if (i === num) {
                    return { ...o, alias: name };
                  } else {
                    return o;
                  }
                }),
                false,
              );
              setState({
                showChangeName: false,
              });
            }}
          />
        )}
      </WrapItem>
    );
  });
  const SortableList = SortableContainer(props => {
    const { items } = props;
    return (
      <div className="mTop8">
        {_.map(items, (item, index) => {
          return <Item item={item} {...props} key={'item_' + index} index={index} num={index} />;
        })}
      </div>
    );
  });

  return (
    <React.Fragment>
      <SortableList
        items={list}
        flowData={props.flowData}
        sourceTables={props.sourceTables}
        distance={5}
        useDragHandle
        onSortEnd={({ oldIndex, newIndex }) => {
          if (oldIndex === newIndex) {
            return;
          }
          onChange(arrayMove(list, oldIndex, newIndex), false);
        }}
        helperClass={'groupConPolymerization'}
        onUpdate={(list, isChange) => {
          onChange(list, isChange);
        }}
      />
    </React.Fragment>
  );
}

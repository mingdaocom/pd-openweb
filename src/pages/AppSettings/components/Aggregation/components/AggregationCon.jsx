import React from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, SortableList } from 'ming-ui';
import { Checkbox, Dropdown, Tooltip } from 'ming-ui/antd-components';
import { extractBetweenDollars, getDefaultOperationDatas } from 'src/pages/AppSettings/components/Aggregation/util.js';
import ChangeName from 'src/pages/integration/components/ChangeName.jsx';
import NumInput from 'src/pages/worksheet/common/ViewConfig/components/NumInput.jsx';
import { handleAdvancedSettingChange } from 'src/utils/domain/control/advancedSetting';
import { getIconByType } from 'src/utils/domain/control/metadata';
import { getTranslateInfo } from 'src/utils/services/app';
import { DEFAULT_COLORS } from '../config';
import { formatAggConfig, getAllSourceList, getRuleAlias, getSourceIndex, isDelStatus } from '../util';
import CalculationDialog from './CalculationDialog';

const WrapItem = styled.div`
  height: 36px;
  background: var(--color-background-primary);
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.16);
  border-radius: 4px;
  z-index: 1000;
  .dragIcon {
    opacity: 0;
    position: absolute;
    top: 12px;
    left: -16px;
  }
  &:hover {
    .dragIcon {
      opacity: 1;
    }
  }
`;
const ActWrap = styled.div`
  width: 180px;
  background: var(--color-background-card);
  box-shadow: var(--shadow-lg);
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
      background: var(--color-background-hover);
    }
  }
`;
const AggregationMenuWrap = styled.div`
  overflow: hidden;
  min-width: 180px;
  background: var(--color-background-card);
  border-radius: 4px;
  box-shadow: var(--shadow-lg);
  .aggregationFormatItem {
    height: 36px;
    padding: 0 12px;
    cursor: pointer;
    &:hover {
      background: var(--color-background-hover);
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
  const dot = _.get(items[num], 'controlSetting.advancedSetting.dot') || _.get(items[num], 'controlSetting.dot');

  const onChangeItems = data => {
    setState({
      items: items.map((it, i) => {
        return i === num ? { ...it, controlSetting: data } : it;
      }),
    });
  };

  return (
    <Dropdown
      trigger={['hover']}
      placement="bottomRight"
      open={show}
      onOpenChange={show => {
        if (!show && !_.isEqual(props.items, items)) {
          onUpdate(items, false);
        }

        setState({
          show,
        });
      }}
      menu={{ items: [] }}
      popupRender={() => (
        <ActWrap className="">
          {/* 显示千分位（默认勾选）、按百分比显示、小数位数（默认2位，最大8位） */}
          <div className="labelWrap H36">
            <Checkbox
              checked={_.get(items[num], 'controlSetting.advancedSetting.thousandth') !== '1'}
              onChange={event => {
                const checked = !event.target.checked;
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
              size="small"
            >
              {_l('显示千分位')}
            </Checkbox>
          </div>
          <div className="labelWrap H36">
            <Checkbox
              checked={_.get(items[num], 'controlSetting.advancedSetting.numshow') === '1'}
              onChange={event => {
                const checked = !event.target.checked;
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
              size="small"
            >
              {_l('按百分比显示')}
            </Checkbox>
          </div>
          <div className="labelWrap">
            <div className="H36">
              <Checkbox
                checked={!!dot}
                onChange={() => {
                  onChangeItems({
                    ...handleAdvancedSettingChange(_.get(items[num], 'controlSetting'), {
                      dot: dot ? '' : '2',
                    }),
                    dot: Number(dot ? '0' : '2'),
                  });
                }}
                size="small"
              >
                {_l('小数位数')}
              </Checkbox>
            </div>
            {!!dot && (
              <div className="flex mLeft20 showCount flexRow alignItemsCenter">
                <NumInput
                  className="flex"
                  minNum={0}
                  maxNum={max}
                  value={Number(dot)}
                  onChange={value => {
                    let count = JSON.stringify(max >= value ? value : max);

                    if (count === dot) {
                      return;
                    }

                    const newData = handleAdvancedSettingChange(_.get(items[num], 'controlSetting'), {
                      dot: count,
                    });
                    onChangeItems({ ...newData, dot: Number(count) });
                  }}
                />
              </div>
            )}
          </div>
          {items[num].dot && (
            <div className="labelWrap">
              <Checkbox
                className="mTop8"
                checked={_.get(items[num], 'controlSetting.advancedSetting.dotformat') === '1'}
                onChange={event => {
                  onChangeItems(
                    handleAdvancedSettingChange(_.get(items[num], 'controlSetting'), {
                      dotformat: !event.target.checked ? '0' : '1',
                    }),
                  );
                }}
                size="small"
              >
                <span style={{ marginRight: '4px' }}>{_l('省略末尾的 0')}</span>
                <Tooltip
                  title={_l(
                    '勾选后，不足小数位数时省略末尾的0。如设置4位小数时，默认显示完整精度2.800，勾选后显示为2.8',
                  )}
                >
                  <i className="icon-help textDisabled Font15"></i>
                </Tooltip>
              </Checkbox>
            </div>
          )}
        </ActWrap>
      )}
    >
      <div className="aggregationFormatItem flexRow alignItemsCenter">
        <span className="flex Font14">{_l('数据格式')}</span>
        <Icon className="Font15 textTertiary Font13" icon="arrow-right-tip" />
      </div>
    </Dropdown>
  );
}

export default function AggregationCon(props) {
  const { list, onChange, updateErr, sourceInfos } = props;

  const Item = props => {
    const { item = {}, onUpdate, items, flowData, DragHandle } = props;
    const { num } = item;
    const [{ showChangeName, showCalculation, popupVisible }, setState] = useSetState({
      showChangeName: false,
      showCalculation: false,
      popupVisible: false,
    });

    const index = getSourceIndex(flowData, item);
    const color = item.isCalculateField ? 'var(--color-text-tertiary)' : DEFAULT_COLORS[index];
    let isDelete = _.get(item, 'isDelete');

    if (item.isCalculateField) {
      const ids = extractBetweenDollars(_.get(item, 'controlSetting.dataSource'));
      const calculateFields = list.filter(o => !o.isCalculateField);

      if (ids.filter(o => !!calculateFields.find(it => it.id === o)).length < ids.length) {
        isDelete = true;
      }
    } else if (isDelStatus(item, sourceInfos, 'AGGREGATE')) {
      isDelete = true;
    }

    isDelete && updateErr();

    const getInfo = (props.sourceTables || []).find(o => (item.oid || '').indexOf(o.workSheetId) >= 0) || {};
    const aggregationMenuItems = [
      {
        key: 'rename',
        label: _l('重命名'),
        onClick: () => {
          setState({
            showChangeName: true,
            popupVisible: false,
          });
        },
      },
      !item.isRowsCount && {
        key: 'aggregationType',
        label: _l('聚合方式'),
        children: getDefaultOperationDatas(_.get(item, 'controlSetting')).map(operation => ({
          key: `aggregationType-${operation.value}`,
          label: operation.text,
          className: cx({ colorPrimary: operation.value === item.aggFuncType }),
          onClick: () => {
            if (operation.value === item.aggFuncType) {
              return;
            }

            const hasSameAggregation = !!list.find(
              aggregationItem => aggregationItem.oid === item.oid && aggregationItem.aggFuncType === operation.value,
            );

            if (hasSameAggregation) {
              alert(_l('不能重复添加相同计算方式的相同字段'), 3);
              return;
            }

            onUpdate(
              items.map((aggregationItem, index) => {
                return index === num
                  ? formatAggConfig({
                      ...aggregationItem,
                      aggFuncType: operation.value,
                      alias: getRuleAlias(`${aggregationItem.name}-${operation.text}`, flowData),
                    })
                  : aggregationItem;
              }),
            );
            setState({ popupVisible: false });
          },
        })),
      },
    ].filter(Boolean);

    return (
      <WrapItem className="flexRow cardItem alignItemsCenter Relative mTop12 hoverBoxShadow">
        <DragHandle className="alignItemsCenter flexRow">
          <Icon className="Font14 Hand textTertiary hoverColorPrimary dragIcon" icon="drag" />
        </DragHandle>
        {(getAllSourceList(flowData) || []).length > 1 && !item.isCalculateField && (
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
                {/* {item.aggFuncType && `(${OPERATION_TYPE_DATA.find(o => o.value === item.aggFuncType).text})`} */}
              </div>
            </React.Fragment>
          )}

          {!item.isCalculateField && (
            <Tooltip
              placement="bottom"
              title={
                <span className="">
                  {_.get(item, 'parentFieldInfo.controlSetting.controlName') && (
                    <span className="textDisabled pRight5">{_l('关联')}</span>
                  )}
                  {`${
                    _.get(item, 'parentFieldInfo.controlSetting.controlName')
                      ? _.get(item, 'parentFieldInfo.controlSetting.controlName') + '>'
                      : (getTranslateInfo(getInfo.appId, null, getInfo.workSheetId).name ||
                          getInfo.tableName ||
                          _l('未命名')) + '-'
                  }${
                    item.oid.indexOf('rowscount') >= 0
                      ? _l('记录数量')
                      : !_.get(item, 'controlSetting')
                        ? _.get(item, 'alias')
                        : _.get(item, 'controlSetting.controlName') || _l('未命名')
                  }`}
                </span>
              }
            >
              <Icon icon="info_outline" className="Hand textTertiary hoverColorPrimary Font16" />
            </Tooltip>
          )}
          {!item.isCalculateField ? (
            <Dropdown
              open={popupVisible}
              onOpenChange={popupVisible => setState({ popupVisible })}
              trigger={['click']}
              placement="bottomLeft"
              getPopupContainer={() => document.body}
              menu={{ items: aggregationMenuItems, style: { boxShadow: 'none' } }}
              popupRender={menu => (
                <AggregationMenuWrap>
                  {menu}
                  {!item.isRowsCount && <FormatWrap {...props} num={num} />}
                </AggregationMenuWrap>
              )}
            >
              <Icon
                icon="arrow-down-border"
                className="Hand textTertiary hoverColorPrimary Font16 mLeft8"
                onClick={() =>
                  setState({
                    popupVisible: true,
                  })
                }
              />
            </Dropdown>
          ) : (
            <Tooltip title={_l('编辑')}>
              <Icon
                icon="edit_17"
                className="Hand textTertiary hoverColorPrimary Font16 mLeft8"
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
              className="clearIcon Hand textTertiary del hoverColorPrimary mLeft8 Font16"
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
              .filter(item => {
                if (item.isCalculateField) {
                  return false;
                } else {
                  let isDelete = _.get(item, 'isDelete');

                  if (isDelStatus(item, sourceInfos)) {
                    isDelete = true;
                  }

                  return !isDelete;
                }
              })
              .map(o => {
                return { ...o, controlName: o.alias, controlId: _.get(o, 'id'), type: 6 };
              })}
            onOk={control => {
              const data = getRuleAlias(control.controlName, flowData, true, true) || [];

              if (data.length > 1 || data.find(o => o.id !== item.id)) {
                alert(_l('已存在该字段名称，名称不可重复'), 3);
                return;
              }

              let newDt = {
                ...item,
                alias: control.controlName,
                controlSetting: control,
                name: control.controlName,
              };
              onUpdate(
                items.map((it, i) => {
                  return i === num ? newDt : it;
                }),
              );
              setState({
                showCalculation: false,
              });
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
                  return i === num ? { ...o, alias: name } : o;
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
  };

  return (
    <React.Fragment>
      <SortableList
        useDragHandle
        canDrag
        items={list.map((o, i) => {
          return { ...o, num: i };
        })}
        itemKey="num"
        onSortEnd={(newItems = []) => {
          onChange(
            newItems.map(o => _.omit(o, 'num')),
            false,
          );
        }}
        itemClassName="boderRadAll_4"
        renderItem={options => (
          <Item
            {...props}
            {...options}
            onUpdate={(list, isChange) => {
              onChange(
                list.map(o => _.omit(o, 'num')),
                isChange,
              );
            }}
            sourceTables={props.sourceTables}
            flowData={props.flowData}
          />
        )}
      />
    </React.Fragment>
  );
}

import React from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, SortableList } from 'ming-ui';
import { Dropdown, Tooltip } from 'ming-ui/antd-components';
import ChangeName from 'src/pages/integration/components/ChangeName.jsx';
import { getIconByType } from 'src/utils/domain/control/metadata';
import { getTranslateInfo } from 'src/utils/services/app';
import { canArraySplit, DEFAULT_COLORS } from '../config';
import {
  getAllSourceList,
  getDefaultOperationForGroup,
  getRuleAlias,
  getSourceIndex,
  isDateTimeGroup,
  isDelStatus,
  setResultFieldSettingByAggFuncType,
} from '../util';

const WrapItem = styled.div`
  height: 36px;
  background: var(--color-background-primary);
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.16);
  border-radius: 4px;
  z-index: 1000;
  .dragIcon {
    opacity: 0;
    position: absolute;
    left: -16px;
    top: 12px;
    font-size: 14px;
  }
  &:hover {
    .dragIcon {
      opacity: 1;
    }
  }
`;

const arraySplitList = [
  { txt: _l('拆开'), value: true },
  { txt: _l('合并'), value: false },
];

export default function GroupCon(props) {
  const { list, onChange, sourceTables, updateErr, flowData, sourceInfos } = props;

  const Item = props => {
    const { item, onUpdate, items, DragHandle } = props;
    const [{ showChangeName, popupVisible }, setState] = useSetState({
      showChangeName: false,
      popupVisible: false,
    });
    let isDelete = _.get(item, 'resultField.isDelete');
    const fields = _.get(item, 'fields') || [];

    if (fields.length !== sourceTables.length) {
      isDelete = true;
    }

    fields.map(o => {
      if (isDelStatus(o, sourceInfos, '')) {
        isDelete = true;
      }
    });
    isDelete && updateErr();
    const getInfo = sourceTables.find(o => _.get(item, 'resultField.oid').indexOf(o.workSheetId) >= 0) || {};

    const index = getSourceIndex(flowData, item);
    const color = DEFAULT_COLORS[index];
    const defaultGroupOperations = getDefaultOperationForGroup(item);
    const currentGroupOperation = defaultGroupOperations.find(
      operation => operation.value === _.get(item, 'resultField.aggFuncType'),
    );
    const currentArraySplit = arraySplitList.find(operation => !operation.value === !item.arraySplit);
    const menuItems = [
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
      isDateTimeGroup(item) && {
        key: 'group',
        label: (
          <div className="flexRow alignItemsCenter">
            <span className="flex">{_l('归组')}</span>
            <span className="textSecondary">{currentGroupOperation?.text}</span>
          </div>
        ),
        children: defaultGroupOperations.map(operation => ({
          key: `group-${operation.value}`,
          label: operation.text,
          className: cx({
            colorPrimary: operation.value === _.get(item, 'resultField.aggFuncType'),
          }),
          onClick: () => {
            if (operation.value === item.aggFuncType) {
              return;
            }

            const hasSameGroup = !!list.find(
              groupItem => groupItem.oid === item.oid && groupItem.aggFuncType === operation.value,
            );

            if (hasSameGroup) {
              alert(_l('不能重复添加相同归组方式的相同字段'), 3);
              return;
            }

            onUpdate(
              items.map(groupItem => {
                if (_.get(groupItem, 'resultField.id') === _.get(item, 'resultField.id')) {
                  return {
                    ...groupItem,
                    resultField: setResultFieldSettingByAggFuncType({
                      ...groupItem.resultField,
                      aggFuncType: operation.value,
                      alias: getRuleAlias(`${_.get(groupItem, 'resultField.name')}-${operation.text}`, props.flowData),
                    }),
                  };
                }

                return groupItem;
              }),
            );
            setState({ popupVisible: false });
          },
        })),
      },
      canArraySplit(item.resultField.controlSetting) && {
        key: 'arraySplit',
        label: (
          <div className="flexRow alignItemsCenter">
            <span className="flex">{_l('归组')}</span>
            <span className="textSecondary">{currentArraySplit?.txt}</span>
          </div>
        ),
        children: arraySplitList.map(operation => ({
          key: `arraySplit-${operation.value}`,
          label: operation.txt,
          className: cx({ colorPrimary: !operation.value === !item.arraySplit }),
          onClick: () => {
            if (!operation.value === !item.arraySplit) {
              return;
            }

            onUpdate(
              items.map(groupItem => {
                if (_.get(groupItem, 'resultField.id') === _.get(item, 'resultField.id')) {
                  return {
                    ...groupItem,
                    arraySplit: operation.value,
                  };
                }

                return groupItem;
              }),
            );
            setState({ popupVisible: false });
          },
        })),
      },
    ].filter(Boolean);

    return (
      <WrapItem className="flexRow cardItem alignItemsCenter Relative mTop12 hoverBoxShadow">
        {sourceTables.length <= 1 && (getAllSourceList(flowData) || []).length > 1 && (
          <div className="colorByWorksheet" style={{ backgroundColor: color }}></div>
        )}
        <DragHandle className="alignItemsCenter flexRow">
          <Icon className="Font14 Hand textTertiary hoverColorPrimary dragIcon" icon="drag" />
        </DragHandle>
        <div className="flex flexRow pLeft16 pRight12 alignItemsCenter">
          <React.Fragment>
            <Icon
              icon={getIconByType(_.get(item, 'resultField.mdType'))}
              className={cx('textTertiary Font16 hoverColorPrimary')}
            />
            <div
              className={cx('flex mLeft8 mRight8 overflow_ellipsis WordBreak', {
                Red: isDelete,
              })}
            >
              {_.get(item, 'resultField.alias')}
            </div>
          </React.Fragment>
          {sourceTables.length <= 1 && (
            <Tooltip
              placement="bottom"
              title={
                <span className="">
                  {_.get(item, 'resultField.parentFieldInfo.controlSetting.controlName') && (
                    <span className="textDisabled pRight5">{_l('关联')}</span>
                  )}
                  {`${
                    _.get(item, 'resultField.parentFieldInfo.controlSetting.controlName')
                      ? _.get(item, 'resultField.parentFieldInfo.controlSetting.controlName') + '>'
                      : (getTranslateInfo(getInfo.appId, null, getInfo.workSheetId).name ||
                          getInfo.tableName ||
                          _l('未命名')) + '-'
                  }${
                    !_.get(item, 'resultField.controlSetting')
                      ? _.get(item, 'resultField.alias')
                      : _.get(item, 'resultField.controlSetting.controlName') || _l('未命名')
                  }`}
                </span>
              }
            >
              <Icon icon="info_outline" className="Hand textTertiary hoverColorPrimary Font16" />
            </Tooltip>
          )}
          <Dropdown
            open={popupVisible}
            onOpenChange={popupVisible => setState({ popupVisible })}
            trigger={['click']}
            placement="bottomLeft"
            getPopupContainer={() => document.body}
            menu={{ items: menuItems }}
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
          <Tooltip title={_l('删除')}>
            <Icon
              icon="clear"
              className="clearIcon Hand textTertiary del hoverColorPrimary mLeft8 Font16"
              onClick={() => {
                onUpdate(
                  items.filter(
                    o =>
                      !(
                        _.get(o, 'resultField.parentFieldInfo.oid') ===
                          _.get(item, 'resultField.parentFieldInfo.oid') &&
                        _.get(o, 'resultField.oid') === _.get(item, 'resultField.oid')
                      ),
                  ),
                );
              }}
            />
          </Tooltip>
        </div>
        {showChangeName && (
          <ChangeName
            name={_.get(item, 'resultField.alias')}
            onCancel={() => {
              setState({
                showChangeName: false,
              });
            }}
            onChange={name => {
              if (_.get(item, 'resultField.alias') === name) {
                return;
              }

              if (!getRuleAlias(name, props.flowData, true)) {
                return alert(_l('已存在该字段名称，名称不可重复'), 3);
              }

              onUpdate(
                items.map(o => {
                  if (_.get(o, 'resultField.id') === _.get(item, 'resultField.id')) {
                    return {
                      ...o,
                      resultField: {
                        ...o.resultField,
                        alias: name,
                      },
                    };
                  }

                  return o;
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
  );
}

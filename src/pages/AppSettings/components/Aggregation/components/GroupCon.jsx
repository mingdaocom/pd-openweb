import React, { Fragment, useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import cx from 'classnames';
import { useSetState } from 'react-use';
import { SortableContainer, SortableElement, SortableHandle, arrayMove } from 'react-sortable-hoc';
import { getIconByType } from 'src/pages/widgetConfig/util';
import ChangeName from 'src/pages/integration/components/ChangeName.jsx';
import { Tooltip } from 'antd';
import { getRuleAlias } from '../util';

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

export default function GroupCon(props) {
  const { list, onChange, sourceTables, updateErr } = props;

  const SortHandle = SortableHandle(() => <Icon className="Gray_bd Hand dragIcon ThemeHoverColor3" icon="drag" />);

  const Item = SortableElement(props => {
    const { item, onUpdate, items } = props;
    const [{ showChangeName }, setState] = useSetState({
      showChangeName: false,
    });
    let isDelete = _.get(item, 'resultField.isDelete');
    _.get(item, 'fields').map(item => {
      if (!sourceTables.find(it => item.oid && item.oid.indexOf(it.workSheetId) >= 0)) {
        isDelete = true;
      }
    });
    if (_.get(item, 'fields').length !== sourceTables.length) {
      isDelete = true;
    }
    isDelete && updateErr();
    return (
      <WrapItem className="flexRow cardItem alignItemsCenter Relative mTop12 hoverBoxShadow">
        <SortHandle />
        <div className="flex flexRow pLeft16 pRight12 alignItemsCenter">
          {/* {isDelete && _.get(item, 'fields').length <= 1 ? (
            <span className="Red Bold flex">{_l('字段已删除')}</span>
          ) : ( */}
          <React.Fragment>
            <Icon
              icon={getIconByType(_.get(item, 'resultField.mdType'))}
              className={cx('Gray_9e Font16 ThemeHoverColor3')}
            />
            <div
              className={cx('flex mLeft8 mRight8 overflow_ellipsis WordBreak', {
                Red: isDelete,
              })}
            >
              {_.get(item, 'resultField.alias')}
            </div>
          </React.Fragment>
          {/* )} */}
          <Tooltip title={_l('重命名')}>
            <Icon
              icon="rename_input"
              className="Font16 Hand Gray_75 ThemeHoverColor3"
              onClick={() => {
                setState({
                  showChangeName: true,
                });
              }}
            />
          </Tooltip>
          <Tooltip title={_l('删除')}>
            <Icon
              icon="clear"
              className="clearIcon Hand Gray_9e del ThemeHoverColor3 mLeft8 Font16"
              onClick={() => {
                onUpdate(items.filter(o => _.get(o, 'resultField.oid') !== _.get(item, 'resultField.oid')));
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
                  if (o.oid === item.oid) {
                    return {
                      ...o,
                      resultField: {
                        ...o.resultField,
                        alias: name,
                      },
                    };
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
    <SortableList
      items={list}
      flowData={props.flowData}
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
  );
}

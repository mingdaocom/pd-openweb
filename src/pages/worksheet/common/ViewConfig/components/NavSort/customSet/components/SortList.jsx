import React, { useEffect, useRef, useState } from 'react';
import { Icon, UserHead } from 'ming-ui';
import styled from 'styled-components';
import renderCellText from 'src/pages/worksheet/components/CellControls/renderText';
import { SortableContainer, SortableElement, SortableHandle, arrayMove } from '@mdfe/react-sortable-hoc';
import DropCon from './DropCon';
import Option from './Options';
import cx from 'classnames';
import './index.less';
import { isArray } from 'lodash';
import { quickSelectUser } from 'ming-ui/functions';
import { getTabTypeBySelectUser } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import { isSameType } from 'src/pages/worksheet/common/ViewConfig/util.js';

const Wrap = styled.div``;

export default function (props) {
  const { setting, onChange, projectId, maxCount } = props;

  const SortHandle = SortableHandle(() => (
    <Icon className="mRight10 Font16 Gray_9e ThemeHoverColor3 Hand dragHandle" icon="drag" />
  ));

  const Item = SortableElement(props => {
    const $ref = useRef(null);
    const { onAdd, onDelete, items, item, onUpdate, num, projectId, appId } = props;
    const addUser = (isMultiple = true, tabType, cb) => {
      quickSelectUser($ref.current, {
        showMoreInvite: false,
        isTask: false,
        tabType,
        appId,
        includeUndefinedAndMySelf: false,
        includeSystemField: false,
        offset: {
          top: 4,
          left: 68,
        },
        zIndex: 10001,
        filterAccountIds: [md.global.Account.accountId, 'user-self'],
        SelectUserSettings: {
          projectId,
          unique: !isMultiple,
          filterResigned: false,
          callback(users) {
            cb(users);
          },
        },
        selectCb(users) {
          cb(users);
        },
      });
    };
    if (item === 'add') {
      return (
        <DropCon
          {...props}
          currentList={items}
          onDelete={onDelete}
          onChange={item => {
            onUpdate(item);
          }}
        />
      );
    }
    return (
      <div className="flexRow customsortItem alignItemsCenter" ref={$ref}>
        <span className={cx('con flexRow flex alignItemsCenter pLeft6 pRight6')}>
          <SortHandle />
          {isSameType([9, 10, 11], props.controlInfo) && (
            <span className="flex WordBreak overflow_ellipsis">
              <Option controlInfo={props.controlInfo} item={item} />
            </span>
          )}
          {isSameType([28], props.controlInfo) && <span className="flex">{_l('%0 级', parseInt(item, 10))}</span>}
          {[29].includes(props.controlInfo.type) && (
            <span className="overflow_ellipsis Font13 WordBreak flex">{(item || {}).name || _l('未命名')}</span>
          )}
          {isSameType([26], props.controlInfo) && (
            <span className="flexRow flex">
              <UserHead
                user={{
                  userHead: item.avatar,
                  accountId: item.accountId,
                }}
                projectId={projectId}
                size={28}
              />
              <span className="overflow_ellipsis Font13 WordBreak flex mLeft10">
                {(item || {}).fullname || _l('未命名')}
              </span>
            </span>
          )}
          <Icon
            className="Font16 Hand delete mLeft15 deleteLine"
            icon="delete2"
            onClick={() => {
              onDelete(item);
            }}
          />
        </span>
        <Icon
          className={cx(
            'Font16 addNext mLeft15 Gray_9e TxtCenter',
            setting.length >= 50 ? 'disabled' : 'Hand ThemeHoverColor3',
          )}
          icon="add"
          onClick={() => {
            if (setting.length >= 50) {
              return;
            }
            if (isSameType([26], props.controlInfo)) {
              addUser(true, getTabTypeBySelectUser(props.controlInfo), users => {
                onUpdate(users, num);
              });
            } else {
              onAdd(num);
            }
          }}
        />
      </div>
    );
  });
  const SortableList = SortableContainer(props => {
    const { items } = props;
    return (
      <div className="sortCustom mTop6">
        {_.map(items, (item, index) => {
          return <Item item={item} {...props} key={'item_' + index} index={index} num={index} />;
        })}
      </div>
    );
  });

  return (
    <Wrap>
      <SortableList
        {...props}
        items={setting}
        useDragHandle
        onSortEnd={({ oldIndex, newIndex }) => onChange(arrayMove(setting, oldIndex, newIndex))}
        helperClass={'sortCustomFile'}
        onAdd={index => {
          setting.splice(index + 1, 0, 'add');
          onChange(setting);
        }}
        onDelete={data =>
          onChange(
            setting.filter(o =>
              isSameType([9, 10, 11, 28], props.controlInfo)
                ? o !== data
                : isSameType([26], props.controlInfo)
                ? o.accountId !== data.accountId
                : o.rowid !== data.rowid,
            ),
          )
        }
        onUpdate={(data, index) => {
          if (!data) {
            onChange(setting.filter(o => o !== 'add'));
          } else if (isArray(data)) {
            const ids = setting.map(oo => oo.accountId);
            setting.splice(index + 1, 0, ...data.filter(ii => !ids.includes(ii.accountId)));
            onChange(maxCount ? setting.slice(0, maxCount) : setting);
          } else {
            let list = setting.map(o => {
              if (o === 'add') {
                if ([29].includes(props.controlInfo.type)) {
                  const control = ((props.controlInfo || {}).relationControls || []).find(it => it.attribute === 1);
                  return {
                    rowid: data.rowid,
                    name: renderCellText({ ...control, value: data[control.controlId] }) || _l('未命名'),
                  };
                }
                if (isSameType([9, 10, 11], props.controlInfo)) {
                  return (props.controlInfo.options.find(ii => ii.key === data.key) || {}).key;
                }
                return data;
              } else {
                return o;
              }
            });
            onChange(maxCount ? list.slice(0, maxCount) : list);
          }
        }}
      />
    </Wrap>
  );
}

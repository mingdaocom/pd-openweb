import React, { useEffect, useRef, useState } from 'react';
import { Icon, UserHead, SortableList } from 'ming-ui';
import styled from 'styled-components';
import renderCellText from 'src/pages/worksheet/components/CellControls/renderText';
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

  const Item = props => {
    const $ref = useRef(null);
    const { onAdd, onDelete, item, onUpdate, projectId, appId, DragHandle } = props;
    const { num, info } = item;
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
        selectedAccountIds: setting.map(l => l.accountId),
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
    if (info === 'add') {
      return (
        <DropCon
          {...props}
          currentList={setting}
          onChange={item => {
            onUpdate(item);
          }}
        />
      );
    }
    return (
      <div className="flexRow customsortItem alignItemsCenter" ref={$ref}>
        <span className={cx('con flexRow flex alignItemsCenter pLeft6 pRight6')}>
          <DragHandle className="alignItemsCenter flexRow">
            <Icon className="mRight10 Font16 Gray_9e ThemeHoverColor3 Hand dragHandle" icon="drag" />
          </DragHandle>
          {isSameType([9, 10, 11], props.controlInfo) && (
            <span className="flex WordBreak overflow_ellipsis">
              <Option controlInfo={props.controlInfo} item={info} />
            </span>
          )}
          {isSameType([28], props.controlInfo) && <span className="flex">{_l('%0 级', parseInt(info, 10))}</span>}
          {[29].includes(props.controlInfo.type) && (
            <span className="overflow_ellipsis Font13 WordBreak flex">{(info || {}).name || _l('未命名')}</span>
          )}
          {isSameType([26], props.controlInfo) && (
            <span className="flexRow flex">
              <UserHead
                user={{
                  userHead: info.avatar,
                  accountId: info.accountId,
                }}
                projectId={projectId}
                size={28}
              />
              <span className="overflow_ellipsis Font13 WordBreak flex mLeft10">
                {(info || {}).fullname || _l('未命名')}
              </span>
            </span>
          )}
          <Icon
            className="Font16 Hand delete mLeft15 deleteLine"
            icon="delete2"
            onClick={() => {
              onDelete(info);
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
  };

  return (
    <Wrap>
      <div className="sortCustom mTop6">
        <SortableList
          {...props}
          items={setting.map((o, i) => {
            return { info: o.info ? o.info : o, num: i };
          })}
          useDragHandle
          itemKey="num"
          onSortEnd={setting => onChange(setting.map(o => o.info))}
          helperClass={'sortCustomFile'}
          renderItem={options => (
            <Item
              {...props}
              {...options}
              onAdd={index => {
                setting.splice(index + 1, 0, 'add');
                onChange(setting);
              }}
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
                        const control = ((props.controlInfo || {}).relationControls || []).find(
                          it => it.attribute === 1,
                        );
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
            />
          )}
        />
      </div>
    </Wrap>
  );
}

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Popover } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { SortableList, UserHead } from 'ming-ui';
import { quickSelectUser } from 'ming-ui/functions';
import { getTabTypeBySelectUser } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import { FROM } from '../../../core/config';
import { useWidgetEvent } from '../../../core/useFormEventManager';
import { dealUserRange, getUserValue } from '../../../core/utils';
import QuickOperate from './QuickOperate';

const UserSelect = props => {
  const {
    from,
    disabled,
    controlId,
    formItemId,
    value,
    projectId = '',
    enumDefault,
    enumDefault2,
    appId,
    formData = [],
    onChange,
    dataSource,
  } = props;

  const [showId, setShowId] = useState('');
  const pickRef = useRef(null);
  const destoryRef = useRef(null);
  const currentValueRef = useRef(getUserValue(value));

  const currentValue = useMemo(() => {
    const result = getUserValue(value);
    currentValueRef.current = result;
    return result;
  }, [value]);

  useWidgetEvent(
    formItemId,
    useCallback(data => {
      const { triggerType } = data;
      switch (triggerType) {
        case 'Enter':
          pickUser();
          break;
        case 'trigger_tab_leave':
          if (destoryRef.current) {
            destoryRef.current();
            destoryRef.current = null;
          }
          break;
        default:
          break;
      }
    }, []),
  );

  const onSave = (users, replaceItem) => {
    const currentValue = currentValueRef.current;

    const newAccounts =
      enumDefault === 0
        ? users
        : _.uniqBy(
            replaceItem
              ? currentValue.map(v => (v.accountId === replaceItem.accountId ? users[0] : v))
              : currentValue.concat(users),
            'accountId',
          );

    onChange(JSON.stringify(newAccounts));
  };

  const removeUser = accountId => {
    const newValue = currentValue.filter(item => item.accountId !== accountId);
    onChange(JSON.stringify(newValue));
  };

  /**
   * 选择用户
   */
  const pickUser = replaceItem => {
    const selectedAccountIds = (currentValueRef.current || []).map(item => item.accountId);
    const tabType = getTabTypeBySelectUser(props);

    if (
      tabType === 1 &&
      md.global.Account.isPortal &&
      !_.find(md.global.Account.projects, item => item.projectId === projectId)
    ) {
      alert(_l('您不是该组织成员，无法获取其成员列表，请联系组织管理员'), 3);
      return;
    }

    const selectRangeOptions = dealUserRange(props, formData);
    const hasUserRange = Object.values(selectRangeOptions).some(i => !_.isEmpty(i));
    const { destory } = quickSelectUser(pickRef.current, {
      showMoreInvite: false,
      selectRangeOptions,
      tabType: controlId === '_ownerid' ? 3 : tabType,
      appId,
      prefixAccounts:
        !_.includes(selectedAccountIds, md.global.Account.accountId) && !hasUserRange
          ? [
              {
                accountId: md.global.Account.accountId,
                fullname: md.global.Account.fullname,
                avatar: md.global.Account.avatar,
              },
              ...(controlId === '_ownerid'
                ? [
                    {
                      accountId: 'user-undefined',
                      fullname: _l('未指定'),
                      avatar: 'https://dn-mdpic.mingdao.com/UserAvatar/undefined.gif?imageView2/1/w/100/h/100/q/90',
                    },
                  ]
                : []),
            ]
          : [],
      selectedAccountIds,
      minHeight: 400,
      offset: {
        top: 16,
        left: -16,
      },
      zIndex: 10001,
      isDynamic: enumDefault === 1 && !replaceItem,
      filterOtherProject: enumDefault2 === 2,
      SelectUserSettings: {
        unique: enumDefault === 0 || replaceItem,
        projectId: projectId,
        selectedAccountIds,
        callback: users => onSave(users, replaceItem),
      },
      selectCb: users => onSave(users, replaceItem),
    });

    destoryRef.current = destory;
  };

  const renderItem = ({ item, dragging, isLayer }) => {
    const disablePopover = disabled || dragging || isLayer;
    const showMenu = showId === item.accountId && !disablePopover;

    return (
      <Popover
        title={null}
        placement="bottomLeft"
        overlayClassName="quickConfigPopover"
        trigger={['click', 'contextMenu']}
        visible={showMenu}
        onVisibleChange={visible => {
          if (disablePopover) return;
          setShowId(visible ? item.accountId : '');
        }}
        content={
          disablePopover ? null : (
            <QuickOperate
              {...props}
              item={item}
              showId={showId}
              handleRemove={() => removeUser(item.accountId)}
              handlePick={() => pickUser(item)}
              closePopover={() => setShowId('')}
            />
          )
        }
      >
        <div className={cx('customFormControlTags', { clickActive: showMenu })} key={item.accountId}>
          {from === FROM.SHARE || from === FROM.WORKFLOW ? (
            <div class="cursorDefault userHead InlineBlock" style={{ width: 26, height: 26 }}>
              <img class="circle" width="26" height="26" src={item.avatar} />
            </div>
          ) : (
            <UserHead
              projectId={projectId}
              className="userHead InlineBlock"
              key={`UserHead-${item.accountId}`}
              appId={dataSource ? undefined : appId}
              user={{
                userHead: item.avatar,
                accountId: item.accountId,
              }}
              size={26}
              disabled={dragging}
            />
          )}
          <span className="ellipsis mLeft8" style={{ maxWidth: 200 }}>
            {item.name || item.fullname || item.fullName}
          </span>

          {!disabled && (
            <i
              className="icon-minus-square Font16 tagDel"
              onClick={e => {
                e.stopPropagation();
                removeUser(item.accountId);
              }}
            />
          )}
        </div>
      </Popover>
    );
  };

  return (
    <div className="customFormControlBox customFormControlUser">
      <SortableList
        items={currentValue}
        canDrag={!disabled && enumDefault !== 0}
        itemKey="accountId"
        itemClassName="inlineFlex pointer"
        direction="vertical"
        renderBody
        renderItem={item => renderItem(item)}
        onSortEnd={items => {
          setShowId('');
          onChange(JSON.stringify(items));
        }}
      />

      {!disabled && (
        <div
          className="TxtCenter Gray_75 ThemeHoverBorderColor3 ThemeHoverColor3 pointer addBtn"
          ref={pickRef}
          onClick={() => pickUser()}
        >
          <i className={enumDefault === 0 && currentValue.length ? 'icon-swap_horiz Font16' : 'icon-plus Font14'} />
        </div>
      )}
    </div>
  );
};

UserSelect.propTypes = {
  from: PropTypes.number,
  disabled: PropTypes.bool,
  worksheetId: PropTypes.string,
  controlId: PropTypes.string,
  value: PropTypes.any,
  projectId: PropTypes.string,
  enumDefault: PropTypes.number,
  onChange: PropTypes.func,
  advancedSetting: PropTypes.object,
};

export default UserSelect;

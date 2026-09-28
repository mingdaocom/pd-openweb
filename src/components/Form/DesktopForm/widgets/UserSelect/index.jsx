import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { SortableList, UserHead } from 'ming-ui';
import { Button, Popover } from 'ming-ui/antd-components';
import { UserSelectPopover } from 'ming-ui/functions/quickSelectUser';
import { getTabTypeBySelectUser } from 'src/utils/domain/control/controlSelection';
import { dealUserRange } from 'src/utils/domain/control/selectionRange';
import { getUserValue } from 'src/utils/domain/control/value';
import { FROM } from '../../../core/config';
import { useWidgetEvent } from '../../../core/useFormEventManager';
import QuickOperate from './QuickOperate';

const USER_SELECT_ALIGN = { overflow: { adjustX: true, adjustY: true, shiftX: true, shiftY: true } };

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
  const [userSelectVisible, setUserSelectVisible] = useState(false);
  const [replaceItem, setReplaceItem] = useState();
  const [selectRangeOptions, setSelectRangeOptions] = useState({});
  const currentValueRef = useRef(getUserValue(value));
  const userSelectRef = useRef(null);
  const containerRef = useRef(null);

  const currentValue = useMemo(() => getUserValue(value), [value]);

  useEffect(() => {
    currentValueRef.current = currentValue;
  }, [currentValue]);

  useEffect(() => {
    if (!userSelectVisible || disabled) return;

    const alignPopover = () => userSelectRef.current?.forceAlign();
    // SortableList 异步同步内部列表，监听实际 DOM 更新，避免按旧按钮位置对齐。
    const observer = new MutationObserver(alignPopover);
    observer.observe(containerRef.current, { childList: true, subtree: true, characterData: true });
    alignPopover();

    return () => observer.disconnect();
  }, [disabled, userSelectVisible]);

  const onSave = useCallback(
    (users, currentReplaceItem, isCancel = false) => {
      const valueArr = currentValueRef.current;
      const newAccounts = isCancel
        ? valueArr.filter(item => item.accountId !== users[0]?.accountId)
        : enumDefault === 0
          ? users
          : _.uniqBy(
              currentReplaceItem
                ? valueArr.map(v => (v.accountId === currentReplaceItem.accountId ? users[0] : v)).filter(Boolean)
                : valueArr.concat(users),
              'accountId',
            );

      onChange(JSON.stringify(newAccounts));
    },
    [enumDefault, onChange],
  );

  const removeUser = accountId => {
    const newValue = currentValue.filter(item => item.accountId !== accountId);
    onChange(JSON.stringify(newValue));
  };

  /**
   * 选择用户
   */
  const pickUser = useCallback(
    currentReplaceItem => {
      const tabType = getTabTypeBySelectUser(props);

      if (
        tabType === 1 &&
        md.global.Account.isPortal &&
        !_.find(md.global.Account.projects, item => item.projectId === projectId)
      ) {
        alert(_l('您不是该组织成员，无法获取其成员列表，请联系组织管理员'), 3);
        return;
      }

      setReplaceItem(currentReplaceItem);
      setSelectRangeOptions(dealUserRange(props, formData));
      setUserSelectVisible(true);
    },
    [formData, projectId, props],
  );

  const handleUserSelectOpenChange = useCallback(
    visible => {
      const tabType = getTabTypeBySelectUser(props);

      if (
        visible &&
        tabType === 1 &&
        md.global.Account.isPortal &&
        !_.find(md.global.Account.projects, item => item.projectId === projectId)
      ) {
        alert(_l('您不是该组织成员，无法获取其成员列表，请联系组织管理员'), 3);
        return false;
      }

      if (visible) {
        setSelectRangeOptions(dealUserRange(props, formData));
      }

      setUserSelectVisible(visible);
    },
    [formData, projectId, props],
  );

  useWidgetEvent(
    formItemId,
    useCallback(
      data => {
        const { triggerType } = data;

        switch (triggerType) {
          case 'Enter':
            if (userSelectVisible) return;
            pickUser();
            break;
          case 'trigger_tab_leave':
            setUserSelectVisible(false);
            break;
          default:
            break;
        }
      },
      [pickUser, userSelectVisible],
    ),
  );

  const renderItem = ({ item, dragging, isLayer }) => {
    if (!item) return null;
    const disablePopover = disabled || dragging || isLayer;
    const showMenu = showId === item.accountId && !disablePopover;

    return (
      <Popover
        arrow={true}
        title={null}
        placement="bottomLeft"
        classNames={{ root: 'quickConfigPopover' }}
        trigger={['click', 'contextMenu']}
        open={showMenu}
        onOpenChange={visible => {
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
        <div className={cx('customFormControlTags userSelectTag', { clickActive: showMenu })} key={item.accountId}>
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

  const selectedAccountIds = currentValue.map(item => item.accountId);
  const hasUserRange = Object.values(selectRangeOptions).some(i => !_.isEmpty(i));

  return (
    <div ref={containerRef} className="customFormControlBox customFormControlUser">
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
        <UserSelectPopover
          ref={userSelectRef}
          placement="rightTop"
          align={USER_SELECT_ALIGN}
          open={userSelectVisible}
          onOpenChange={handleUserSelectOpenChange}
          showMoreInvite={false}
          selectRangeOptions={selectRangeOptions}
          tabType={controlId === '_ownerid' ? 3 : getTabTypeBySelectUser(props)}
          appId={appId}
          prefixAccounts={
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
              : []
          }
          selectedAccountIds={selectedAccountIds}
          minHeight={400}
          isDynamic={enumDefault === 1 && !replaceItem}
          filterOtherProject={enumDefault2 === 2}
          SelectUserSettings={{
            unique: enumDefault === 0 || !!replaceItem,
            projectId,
            selectedAccountIds,
            callback: users => onSave(users, replaceItem),
          }}
          onSelect={(users, isCancel) => onSave(users, replaceItem, isCancel)}
        >
          <Button
            aria-label={_l('选择人员')}
            className="controlAddButton"
            shape="circle"
            size="small"
            icon={
              <i className={enumDefault === 0 && currentValue.length ? 'icon-swap_horiz Font16' : 'icon-plus Font14'} />
            }
            onClick={() => setReplaceItem(undefined)}
          />
        </UserSelectPopover>
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

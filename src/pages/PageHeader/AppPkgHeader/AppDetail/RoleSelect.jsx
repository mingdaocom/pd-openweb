import React, { useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import localForage from 'localforage';
import styled from 'styled-components';
import { Icon, SearchInput } from 'ming-ui';
import { Button, Checkbox } from 'ming-ui/antd-components';
import ClickAway from 'ming-ui/components/ClickAway';
import appManagementApi from 'src/api/appManagement';
import { getTranslateInfo } from 'src/utils/services/app';
import { ICON_ROLE_TYPE } from '../config';

const RoleSelectWrap = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  box-sizing: border-box;
  width: 400px;
  padding-bottom: 120px;
  background-color: var(--color-background-primary);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.16);
  z-index: 20;
  padding: 16px 0;
  .roleSelectHeader {
    padding: 0 24px;
    .changeTypeCon:hover {
      color: var(--color-link-hover) !important;
    }
  }
  .roleSelectSearch {
    padding: 0 15px 0 24px;
    .roleSearch {
      width: 100%;
    }
  }
  .roleSelectList {
    padding: 0 12px;
    overflow: scroll;
    .item {
      padding: 14px 12px;
      border-radius: 3px;
      height: 42px;
      .icon {
        color: var(--color-text-tertiary);
      }
      &:hover {
        background: var(--color-background-hover);
      }
      &.active {
        background: var(--color-primary-transparent);
        font-weight: 600;
        color: var(--color-primary);
        .icon {
          color: var(--color-primary);
        }
      }
    }
  }
  .roleMultipleValues {
    padding: 16px 24px;
    border-top: 1px solid var(--color-border-secondary);
    border-bottom: 1px solid var(--color-border-secondary);
    .clearAll:hover {
      color: var(--color-primary) !important;
    }
    .top {
      justify-content: space-between;
    }
    .values {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      li {
        padding: 6px;
        background: var(--color-border-secondary);
        border-radius: 3px;
        max-width: 100px;
        .icon:hover {
          color: var(--color-text-secondary) !important;
        }
      }
    }
  }
`;

function RoleSelect(props) {
  const requestPending = useRef(false);
  const { id, handleClose, roleSelectValue = [], visible, appId } = props;

  const [roleList, setRoleList] = useState([]);
  const [search, setSearch] = useState(undefined);
  const [value, setValue] = useState([]);
  const [type, setType] = useState(0); // 0 单选 1 多选

  useEffect(() => {
    const _value = roleSelectValue.map(l => l.roleId);
    const _type = localStorage.getItem('mingRoleDebugType');

    setValue(_value);
    setType(_type ? Number(_type) : _value.length > 1 ? 1 : 0);
  }, []);

  useEffect(() => {
    if (!visible) return;

    appManagementApi.getDebugRoles({ appId }).then(({ roles }) => {
      setRoleList(
        roles.map(item => {
          if (item.roleType === 0) {
            return {
              ...item,
              name: getTranslateInfo(appId, null, item.roleId).name || item.name,
            };
          } else {
            return item;
          }
        }),
      );
    });
  }, [visible]);

  const setDebugRoles = ids => {
    if (requestPending.current) return;

    localForage.clear();
    requestPending.current = true;
    return appManagementApi
      .setDebugRoles({
        appId: id,
        roleIds: ids || value,
      })
      .then(res => {
        if (res) {
          setValue(ids || value);
          window.location.reload();
        }
      })
      .finally(() => {
        requestPending.current = false;
      });
  };

  const changeValue = (roleId, operate) => {
    if (type === 0) {
      setDebugRoles([roleId]);
    } else {
      if (operate && value.includes(roleId)) return;

      setValue(operate ? value.concat(roleId) : value.filter(l => l !== roleId));
    }
  };

  const changeType = () => {
    type === 1 && setValue([]);
    setType(type === 0 ? 1 : 0);
    safeLocalStorageSetItem('mingRoleDebugType', type === 0 ? 1 : 0);
  };

  const filteredRoleList = roleList.filter(item => !search || item.name.toLowerCase().includes(search.toLowerCase()));
  const roleGroups = [
    {
      key: 'system',
      name: _l('系统'),
      roles: filteredRoleList.filter(item => ICON_ROLE_TYPE[item.roleType]),
    },
    {
      key: 'custom',
      name: _l('自定义'),
      roles: filteredRoleList.filter(item => !ICON_ROLE_TYPE[item.roleType]),
    },
  ].filter(group => group.roles.length);

  return (
    <RoleSelectWrap className="flexColumn">
      <div className="roleSelectHeader valignWrapper mBottom12">
        <span className="flex overflow_ellipsis Font17 Bold">{_l('选择角色')}</span>
        <span className="colorPrimary Font12 Hand changeTypeCon" onClick={changeType}>
          {type === 0 ? _l('多选模式') : _l('退出多选')}
        </span>
        <Icon className="mLeft20 Font16 textTertiary pointer" icon="clear_bold" onClick={() => handleClose()} />
      </div>
      {type === 1 && (
        <div className="roleMultipleValues">
          <div className="valignWrapper top">
            <span className="Bold">
              {_l('已选择')}
              {value.length ? `（${value.length}）` : ''}
            </span>
            <span className="textDisabled Hand clearAll" onClick={() => setValue([])}>
              {_l('清空')}
            </span>
          </div>

          {!!value.length && (
            <ul className="values mTop11">
              {value.map(roleId => (
                <li className="Font12 overflow_ellipsis">
                  {(roleList.find(l => l.roleId === roleId) || {}).name}
                  <Icon
                    icon="clear"
                    className="mLeft6 textTertiary Hand icon"
                    onClick={() => changeValue(roleId, false)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="roleSelectSearch mTop4 mBottom16">
        <SearchInput
          className="roleSearch"
          placeholder={_l('搜索')}
          value={search}
          onChange={keywords => setSearch(keywords.trim())}
        />
      </div>
      <ul className="roleSelectList flex">
        {roleGroups.map(group => (
          <React.Fragment key={group.key}>
            <p className="Font12 pLeft12 mBottom4 mTop10 textTertiary">{group.name}</p>
            {group.roles.map(item => (
              <li
                className={cx('item Hand valignWrapper', {
                  active: type === 0 && value.includes(item.roleId),
                })}
                key={item.roleId}
                onClick={() => {
                  changeValue(item.roleId, !value.includes(item.roleId));
                }}
              >
                {type === 1 && (
                  <Checkbox
                    className="mRight8"
                    checked={value.includes(item.roleId)}
                    onChange={event => changeValue(item.roleId, event.target.checked)}
                  />
                )}
                <span className="flex overflow_ellipsis valignWrapper">
                  {ICON_ROLE_TYPE[item.roleType] && (
                    <Icon icon={ICON_ROLE_TYPE[item.roleType]} className="icon mRight8 Font20" />
                  )}
                  {item.name}
                </span>
              </li>
            ))}
          </React.Fragment>
        ))}
      </ul>
      {type === 1 && (
        <div className="pLeft24">
          <Button type="primary" onClick={() => setDebugRoles()}>
            {_l('确定')}
          </Button>
        </div>
      )}
    </RoleSelectWrap>
  );
}

export default ClickAway.wrap(RoleSelect);

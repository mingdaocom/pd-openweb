import React, { useEffect, useState } from 'react';
import cx from 'classnames';
import localForage from 'localforage';
import styled from 'styled-components';
import { Button, Checkbox, Icon } from 'ming-ui';
import withClickAway from 'ming-ui/decorators/withClickAway';
import appManagementApi from 'src/api/appManagement';
import SearchInput from 'src/pages/AppHomepage/AppCenter/components/SearchInput';
import { ICON_ROLE_TYPE } from '../config';

const OkButtonWrap = styled.div`
  width: 105px;
  > button {
    width: max-content !important;
  }
`;

const RoleSelectWrap = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  box-sizing: border-box;
  width: 400px;
  padding-bottom: 120px;
  background-color: #fff;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.16);
  z-index: 20;
  padding: 16px 0;
  .roleSelectHeader {
    padding: 0 24px;
    .changeTypeCon:hover {
      color: #0e65bc !important;
    }
  }
  .roleSelectSearch {
    padding: 0 15px 0 24px;
    .roleSearch {
      width: 100%;
      background: #fff !important;
      border-radius: 0;
      border-bottom: 1px solid #eaeaea;
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
        color: #9e9e9e;
      }
      &:hover {
        background: #f7f7f7;
      }
      &.active {
        background: #e4f3fd;
        font-weight: 600;
        color: #1677ff;
        .icon {
          color: #1677ff;
        }
      }
    }
  }
  .roleMultipleValues {
    padding: 16px 24px;
    border-top: 1px solid #e0e0e0;
    border-bottom: 1px solid #e0e0e0;
    .clearAll:hover {
      color: #1677ff !important;
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
        background: #eaeaea;
        border-radius: 3px;
        max-width: 100px;
        .icon:hover {
          color: #757575 !important;
        }
      }
    }
  }
`;

function RoleSelect(props) {
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
      setRoleList(roles);
    });
  }, [visible]);

  const setDebugRoles = ids => {
    localForage.clear();
    appManagementApi
      .setDebugRoles({
        appId: id,
        roleIds: ids || value,
      })
      .then(res => {
        if (res) {
          setValue(ids || value);
          window.location.reload();
        }
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

  return (
    <RoleSelectWrap className="flexColumn">
      <div className="roleSelectHeader valignWrapper mBottom12">
        <span className="flex overflow_ellipsis Font17 Bold">{_l('选择角色')}</span>
        <span className="ThemeColor Font12 Hand changeTypeCon" onClick={changeType}>
          {type === 0 ? _l('多选模式') : _l('退出多选')}
        </span>
        <Icon className="mLeft20 Font16 Gray_9d pointer" icon="clear_bold" onClick={() => handleClose()} />
      </div>
      {type === 1 && (
        <div className="roleMultipleValues">
          <div className="valignWrapper top">
            <span className="Bold">
              {_l('已选择')}
              {value.length ? `（${value.length}）` : ''}
            </span>
            <span className="Gray_bd Hand clearAll" onClick={() => setValue([])}>
              {_l('清空')}
            </span>
          </div>

          {!!value.length && (
            <ul className="values mTop11">
              {value.map(roleId => (
                <li className="Font12 overflow_ellipsis">
                  {(roleList.find(l => l.roleId === roleId) || {}).name}
                  <Icon icon="clear" className="mLeft6 Gray_9d Hand icon" onClick={() => changeValue(roleId, false)} />
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
        {roleList
          .filter(l => !search || l.name.toLowerCase().includes(search.toLowerCase()))
          .map((item, index) => (
            <React.Fragment>
              {[0, 3].includes(index) && (
                <p className="Font12 pLeft12 mBottom4 mTop10 Gray_9e">{index === 0 ? _l('系统') : _l('自定义')}</p>
              )}
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
                    checked={value.includes(item.roleId)}
                    onClick={checked => changeValue(item.roleId, !checked)}
                  />
                )}
                <span className="flex overflow_ellipsis valignWrapper">
                  {ICON_ROLE_TYPE[item.roleType] && (
                    <Icon icon={ICON_ROLE_TYPE[item.roleType]} className="icon mRight8 Font20" />
                  )}
                  {item.name}
                </span>
              </li>
            </React.Fragment>
          ))}
      </ul>
      {type === 1 && (
        <OkButtonWrap className="pLeft24">
          <Button size="medium" onClick={() => setDebugRoles()}>
            {_l('确定')}
          </Button>
        </OkButtonWrap>
      )}
    </RoleSelectWrap>
  );
}

export default withClickAway(RoleSelect);

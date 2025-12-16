import React from 'react';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { ICON_ROLE_TYPE, sysRoleType } from 'src/pages/Role/config.js';
import DropOption from 'src/pages/Role/PortalCon/components/DropOption';

export default class Con extends React.Component {
  render() {
    const { item, dataList, onAction, roleId, onChoose, isForPortal, DragHandle } = this.props;
    return (
      <li
        className={cx('flexRow alignItemsCenter navLiRole', { cur: roleId === item.roleId })}
        onClick={() => onChoose(item.roleId)}
      >
        {!sysRoleType.includes(item.roleType) || !item.roleId ? (
          <DragHandle className="alignItemsCenter flexRow">
            <Icon className="Font12 mLeft3 Hand" icon="drag" />
          </DragHandle>
        ) : (
          <span className="InlineBlock mLeft5" style={{ width: 10 }}></span>
        )}
        <span className="flex mLeft5 Font14 flexRow alignItemsCenter">
          <span className="InlineBlock overflow_ellipsis breakAll" title={item.name}>
            {ICON_ROLE_TYPE[item.roleType] && (
              <Icon icon={ICON_ROLE_TYPE[item.roleType]} className="Font16 mRight6 roleIcon" />
            )}
            {item.name}
          </span>
          {item.hideAppForMembers && !isForPortal && (
            <Tooltip placement="top" title={_l('隐藏应用')}>
              <span className={cx('mLeft7 arrowIconShow', {})}>
                <Icon icon="public-folder-hidden" />
              </span>
            </Tooltip>
          )}
          {item.isDefault && <span className="tag mLeft3 InlineBlock">{_l('默认')}</span>}
        </span>
        {item.roleId !== '' && (
          <DropOption
            key={`${item.roleId}-li`}
            dataList={dataList.filter(o => {
              if (!sysRoleType.includes(item.roleType)) {
                return true;
              } else {
                return o.key === 10;
              }
            })}
            onAction={o => onAction(o, item)}
          />
        )}
      </li>
    );
  }
}

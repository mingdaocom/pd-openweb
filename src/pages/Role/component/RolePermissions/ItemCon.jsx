import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Icon, Tooltip } from 'ming-ui';
import DropOption from 'src/pages/Role/PortalCon/components/DropOption';
import { sysRoleType } from 'src/pages/Role/config.js';
import { SortableHandle } from 'react-sortable-hoc';

const SortHandle = SortableHandle(() => <Icon className="Font12 mLeft3 Hand" icon="drag_indicator" />);

export default class Con extends React.Component {
  render() {
    const { item, dataList, onAction, roleId, onChoose, isForPortal } = this.props;
    return (
      <li
        className={cx('flexRow alignItemsCenter navLiRole', { cur: roleId === item.roleId })}
        onClick={() => onChoose(item.roleId)}
      >
        {!sysRoleType.includes(item.roleType) || !item.roleId ? (
          <SortHandle />
        ) : (
          <span className="InlineBlock mLeft5" style={{ width: 10 }}></span>
        )}
        <span className="flex mLeft5 Font14 flexRow alignItemsCenter">
          <span className="InlineBlock overflow_ellipsis breakAll" title={item.name}>
            {item.name}
          </span>
          {item.hideAppForMembers && !isForPortal && (
            <Tooltip popupPlacement="top" text={<span>{_l('隐藏应用')}</span>}>
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

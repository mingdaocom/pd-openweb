import React, { PureComponent } from 'react';
import Trigger from 'rc-trigger';
import { Icon, Menu, MenuItem } from 'ming-ui';

const builtinPlacements = {
  topLeft: {
    points: ['bl', 'tl'],
  },
  bottomLeft: {
    points: ['tl', 'bl'],
  },
};
export default class ApplyAction extends PureComponent {
  state = {
    popupVisible: false,
  };

  renderPopup() {
    const { roles, onChange } = this.props;
    return (
      <Menu style={{ position: 'static' }}>
        <MenuItem key={'title'} disabled className="Font12">
          {_l('选择角色')}
        </MenuItem>
        {_.map(roles, role => {
          return (
            <MenuItem
              key={role.roleId}
              onClick={() => {
                onChange(role);
                this.setState({
                  popupVisible: false,
                });
              }}
            >
              {role.name}
            </MenuItem>
          );
        })}
      </Menu>
    );
  }

  render() {
    const { getPopupContainer } = this.props;
    const triggerProps = {
      popupClassName: 'ming Tooltip-white',
      prefixCls: 'Tooltip',
      action: ['click'],
      popup: this.renderPopup(),
      builtinPlacements,
      popupPlacement: 'bottomLeft',
      popupVisible: this.state.popupVisible,
      onPopupVisibleChange: visible => {
        this.setState({
          popupVisible: visible,
        });
      },
      popupAlign: {
        offset: [0, 5],
        overflow: {
          adjustX: 1,
          adjustY: 1,
        },
      },
      getPopupContainer,
    };

    return (
      <Trigger {...triggerProps}>
        <span
          className="ThemeColor3 ThemeHoverColor2 Hand"
          onClick={() => {
            if (!this.state.popupVisible) {
              this.setState({
                popupVisible: true,
              });
            }
          }}
        >
          <span className="TxtMiddle InlineBlock ellipsis" style={{ maxWidth: 130 }}>
            {_l('同意')}
          </span>
          <Icon icon="arrow-down" className="font8 TxtMiddle" />
        </span>
      </Trigger>
    );
  }
}

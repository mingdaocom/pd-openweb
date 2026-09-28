import React, { PureComponent } from 'react';
import { Icon } from 'ming-ui';
import { Dropdown } from 'ming-ui/antd-components';

export default class ApplyAction extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      popupVisible: false,
    };
  }

  render() {
    const { getPopupContainer, onChange, roles = [] } = this.props;
    const { popupVisible } = this.state;

    return (
      <Dropdown
        trigger={['click']}
        showPopupSearch
        notFoundContent={_l('暂无相关数据')}
        menu={{
          items: roles.map(role => ({
            key: role.roleId,
            label: role.name,
            onClick: () => {
              onChange(role);
              this.setState({ popupVisible: false });
            },
          })),
          style: { maxHeight: 300, overflow: 'auto' },
        }}
        placement="bottomLeft"
        open={popupVisible}
        onOpenChange={popupVisible => this.setState({ popupVisible })}
        getPopupContainer={getPopupContainer}
      >
        <span
          className="colorPrimary hoverColorPrimaryDark Hand"
          onClick={() => {
            if (!popupVisible) {
              this.setState({
                popupVisible: true,
              });
            }
          }}
        >
          {this.props.children || (
            <span className="">
              <span className="TxtMiddle InlineBlock ellipsis" style={{ maxWidth: 130 }}>
                {_l('同意')}
              </span>
              <Icon icon="arrow-down" className="font8 TxtMiddle" />
            </span>
          )}
        </span>
      </Dropdown>
    );
  }
}

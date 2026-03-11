import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Dropdown, Menu } from 'antd';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import * as actions from 'worksheet/redux/actions/gunterview';
import GroupWrap from './components/GroupWrap';

const More = styled.div`
  height: 32px;
  padding: 0 15px;
  .ant-dropdown-trigger:hover {
    color: var(--color-primary) !important;
  }
`;

export const MenuOverlayWrapper = styled(Menu)`
  .ant-dropdown-menu-item {
    padding: 7px 12px;
    transition: none;
  }
  .ant-dropdown-menu-item:hover,
  .ant-dropdown-menu-submenu-title:hover {
    color: var(--color-white);
    background-color: var(--color-primary);
  }
`;

@connect(
  state => ({
    ..._.pick(state.sheet.gunterView, ['loading', 'grouping', 'withoutArrangementVisible']),
  }),
  dispatch => bindActionCreators(actions, dispatch),
)
export default class GunterDirectory extends Component {
  constructor(props) {
    super(props);
  }
  renderOverlay() {
    const { withoutArrangementVisible } = this.props;
    return (
      <MenuOverlayWrapper className="pTop6 pBottom6" style={{ width: 170 }}>
        <Menu.Item
          className="valignWrapper"
          onClick={() => {
            this.props.updateWithoutArrangementVisible(!withoutArrangementVisible);
          }}
        >
          <Icon
            className="Font18 mLeft4 mRight12 textTertiary"
            icon={withoutArrangementVisible ? 'visibility_off' : 'visibility'}
          />
          <span className="Font14">{withoutArrangementVisible ? _l('隐藏未排期') : _l('显示未排期')}</span>
        </Menu.Item>
      </MenuOverlayWrapper>
    );
  }
  renderMore() {
    return (
      <More className="flexRow valignWrapper">
        <div className="flex"></div>
        <Dropdown overlay={this.renderOverlay()} trigger={['click']}>
          <Icon className="textTertiary Font18 pointer" icon="more_horiz" />
        </Dropdown>
      </More>
    );
  }
  render() {
    const { width, loading } = this.props;
    return (
      <div className="gunterDirectory flexColumn" style={{ width }}>
        {!loading && <div className="gunterDirectoryHeader flexColumn">{this.renderMore()}</div>}
        <GroupWrap width={width} />
      </div>
    );
  }
}

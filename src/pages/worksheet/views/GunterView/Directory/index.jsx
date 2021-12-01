import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Icon } from 'ming-ui';
import { Menu, Dropdown } from 'antd';
import styled from 'styled-components';
import * as actions from 'worksheet/redux/actions/gunterview';
import Grouping from './components/Grouping';
import { RecordWrapper } from './components/Record';

const More = styled.div`
  height: 32px;
  padding: 0 15px;
  .ant-dropdown-trigger:hover {
    color: #2196f3 !important;
  }
`;

const GroupingChildWrapper = styled.div`
  height: 29px;
  border-bottom: 1px solid #ececec;
  .groupingName {
    margin-left: 22px !important;
  }
`;

export const MenuOverlayWrapper = styled(Menu)`
  .ant-dropdown-menu-item {
    padding: 7px 12px;
    transition: none;
  }
  .ant-dropdown-menu-item:hover, .ant-dropdown-menu-submenu-title:hover {
    .icon {
      color: #fff !important;
    }
    color: #fff;
    background-color: #2196f3
  }
`;

@connect(
  state => ({
    ..._.pick(state.sheet.gunterView, ['loading', 'grouping', 'withoutArrangementVisible']),
    ..._.pick(state.sheet, ['controls']),
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
          <Icon className="Font18 mLeft4 mRight12 Gray_9e" icon={withoutArrangementVisible ? 'visibility_off' : 'visibility'} />
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
          <Icon className="Gray_9e Font18 pointer" icon="more_horiz" />
        </Dropdown>
      </More>
    );
  }
  renderControlName() {
    const { controls } = this.props;
    const titleControl = _.find(controls, { attribute: 1 });
    return (
      <GroupingChildWrapper className="overflowHidden">
        <RecordWrapper className="valignWrapper groupingControlHeader">
          <div className="groupingName overflow_ellipsis">{titleControl.controlName}</div>
          <div className="field">{_l('开始时间')}</div>
          <div className="field">{_l('结束时间')}</div>
          <div className="dayCountField overflow_ellipsis">{_l('时长')}</div>
        </RecordWrapper>
      </GroupingChildWrapper>
    );
  }
  render() {
    const { width, loading } = this.props;
    return (
      <div className="gunterDirectory flexColumn" style={{ width }}>
        {!loading && (
          <div className="gunterDirectoryHeader flexColumn">
            {this.renderMore()}
            {this.renderControlName()}
          </div>
        )}
        <Grouping width={width} />
      </div>
    );
  }
}

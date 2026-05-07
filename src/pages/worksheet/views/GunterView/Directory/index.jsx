import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Dropdown, Menu } from 'antd';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import * as actions from 'worksheet/redux/actions/gunterview';
import GroupWrap from './components/GroupWrap';
import { RecordWrapper } from './components/Record';

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

const GroupingChildWrapper = styled.div`
  height: 29px;
  border-bottom: 1px solid var(--color-border-secondary);
  .drag {
    position: absolute;
    right: -1px;
    top: 0;
    z-index: 1;
    height: 100%;
    width: 2px;
    cursor: ew-resize;
  }
  .dragLine {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 2;
    height: 100%;
    width: 2px;
    cursor: ew-resize;
    background-color: var(--color-primary);
  }
`;

@connect(
  state => ({
    ..._.pick(state.sheet.gunterView, [
      'loading',
      'grouping',
      'withoutArrangementVisible',
      'viewConfig',
      'groupingScroll',
    ]),
    ..._.pick(state.sheet, ['base', 'controls']),
  }),
  dispatch => bindActionCreators(actions, dispatch),
)
export default class GunterDirectory extends Component {
  constructor(props) {
    super(props);
    const config = localStorage.getItem(`gunterViewColumnWidthConfig-${props.base.viewId}`);
    this.state = {
      dragValue: 0,
      widthConfig: config ? JSON.parse(config) : { 0: 200 },
    };
  }
  handleMouseDown = (event, index) => {
    const { groupingScroll } = this.props;
    const { target } = event;
    const startClientX = event.clientX;
    const startDragValue = target.parentElement.offsetLeft + target.parentElement.clientWidth + groupingScroll.x;
    const minWidth = 80;
    this.setState({
      dragValue: startDragValue,
    });
    const setColumnWidth = width => {
      const { widthConfig } = this.state;
      const data = {
        ...widthConfig,
        [index]: width,
      };
      this.setState(
        {
          widthConfig: data,
        },
        () => {
          const { base, groupingScroll } = this.props;
          localStorage.setItem(`gunterViewColumnWidthConfig-${base.viewId}`, JSON.stringify(data));
          groupingScroll.refresh();
        },
      );
    };

    document.onmousemove = event => {
      const x = event.clientX - startClientX;
      const width = target.parentElement.clientWidth + x;

      if (width >= minWidth) {
        this.setState({
          dragValue: startDragValue + x,
        });
      }
    };

    document.onmouseup = event => {
      const x = event.clientX - startClientX;
      const width = target.parentElement.clientWidth + x;
      setColumnWidth(width >= minWidth ? width : minWidth);
      this.setState({
        dragValue: 0,
      });
      document.onmousemove = null;
      document.onmouseup = null;
    };
  };
  renderDrag(index) {
    return (
      <div
        onMouseDown={event => {
          this.handleMouseDown(event, index);
        }}
        className="drag"
      />
    );
  }
  renderControlName() {
    const { dragValue, widthConfig } = this.state;
    const { controls, viewConfig } = this.props;
    const displayControls = viewConfig.displayControls || [];
    const titleControl = _.find(controls, { controlId: viewConfig.navTitle });
    const startControl = _.find(controls, { controlId: viewConfig.startId }) || {};
    const endControl = _.find(controls, { controlId: viewConfig.endId }) || {};
    const startIndex = displayControls.length + 1;
    const endIndex = displayControls.length + 2;
    return (
      <GroupingChildWrapper className="overflowHidden">
        <RecordWrapper className="valignWrapper groupingControlHeader hide">
          <Icon className="textTertiary Font17 mRight5 Visibility" icon="more_horiz" />
          {titleControl && (
            <div className="groupingName relative overflow_ellipsis" style={{ width: widthConfig[0] }}>
              {titleControl.controlName}
              {this.renderDrag(0)}
            </div>
          )}
          {displayControls.map((data, index) => (
            <div className="field" key={data.controlId} style={{ width: widthConfig[index + 1] }}>
              {data.controlName}
              {this.renderDrag(index + 1)}
            </div>
          ))}
          <div className="field" style={{ width: widthConfig[startIndex] }}>
            {startControl.controlName || _l('开始时间')}
            {this.renderDrag(startIndex)}
          </div>
          <div className="field" style={{ width: widthConfig[endIndex] }}>
            {endControl.controlName || _l('结束时间')}
            {this.renderDrag(endIndex)}
          </div>
          <div className="dayCountField overflow_ellipsis">{_l('时长')}</div>
        </RecordWrapper>
        {!!dragValue && <div style={{ left: dragValue }} className="dragLine" />}
      </GroupingChildWrapper>
    );
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
    const { width, loading, base } = this.props;
    const { widthConfig } = this.state;
    return (
      <div className="gunterDirectory flexColumn" style={{ width }}>
        {!loading && (
          <div className="gunterDirectoryHeader flexColumn">
            {this.renderMore()}
            {this.renderControlName()}
          </div>
        )}
        <GroupWrap width={width} widthConfig={widthConfig} base={base} />
      </div>
    );
  }
}

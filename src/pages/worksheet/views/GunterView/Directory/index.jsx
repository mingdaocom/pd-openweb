import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Dropdown } from 'ming-ui/antd-components';
import * as actions from 'worksheet/redux/actions/gunterview';
import GroupWrap from './components/GroupWrap';
import { RecordWrapper } from './components/Record';

const More = styled.div`
  height: 32px;
  padding: 0 15px;
  .hap-dropdown-trigger:hover {
    color: var(--color-primary) !important;
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
let GunterDirectory = class GunterDirectory extends Component {
  constructor(props) {
    super(props);
    const config = localStorage.getItem(`gunterViewColumnWidthConfig-${props.base.viewId}`);
    this.state = {
      dragValue: 0,
      widthConfig: {
        0: 200,
        ...(config ? safeParse(config) : {}),
      },
    };
  }

  componentWillUnmount() {
    this.removeDocumentDragListeners();
  }

  setDocumentDragListeners = (onMouseMove, onMouseUp) => {
    this.removeDocumentDragListeners();
    this.documentDragListeners = { onMouseMove, onMouseUp };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  removeDocumentDragListeners = () => {
    if (!this.documentDragListeners) return;
    const { onMouseMove, onMouseUp } = this.documentDragListeners;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    this.documentDragListeners = null;
  };

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
      const data = { ...widthConfig, [index]: width };
      this.setState(
        {
          widthConfig: data,
        },
        () => {
          const { base, groupingScroll } = this.props;
          safeLocalStorageSetItem(`gunterViewColumnWidthConfig-${base.viewId}`, JSON.stringify(data));
          groupingScroll.refresh();
        },
      );
    };

    const handleMouseMove = event => {
      const x = event.clientX - startClientX;
      const width = target.parentElement.clientWidth + x;

      if (width >= minWidth) {
        this.setState({
          dragValue: startDragValue + x,
        });
      }
    };

    const handleMouseUp = event => {
      try {
        const x = event.clientX - startClientX;
        const width = target.parentElement.clientWidth + x;
        setColumnWidth(width >= minWidth ? width : minWidth);
        this.setState({
          dragValue: 0,
        });
      } finally {
        this.removeDocumentDragListeners();
      }
    };

    this.setDocumentDragListeners(handleMouseMove, handleMouseUp);
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

    const titleControl = _.find(controls, {
      controlId: viewConfig.navTitle,
    });

    const startControl =
      _.find(controls, {
        controlId: viewConfig.startId,
      }) || {};
    const endControl =
      _.find(controls, {
        controlId: viewConfig.endId,
      }) || {};
    const startIndex = displayControls.length + 1;
    const endIndex = displayControls.length + 2;
    return (
      <GroupingChildWrapper className="overflowHidden">
        <RecordWrapper className="valignWrapper groupingControlHeader hide">
          <Icon className="textTertiary Font17 mRight5 Visibility" icon="more_horiz" />
          {titleControl && (
            <div
              className="groupingName relative overflow_ellipsis"
              style={{
                width: widthConfig[0],
              }}
            >
              {titleControl.controlName}
              {this.renderDrag(0)}
            </div>
          )}
          {displayControls.map((data, index) => (
            <div
              className="field"
              key={data.controlId}
              style={{
                width: widthConfig[index + 1],
              }}
            >
              {data.controlName}
              {this.renderDrag(index + 1)}
            </div>
          ))}
          <div
            className="field"
            style={{
              width: widthConfig[startIndex],
            }}
          >
            {startControl.controlName || _l('开始时间')}
            {this.renderDrag(startIndex)}
          </div>
          <div
            className="field"
            style={{
              width: widthConfig[endIndex],
            }}
          >
            {endControl.controlName || _l('结束时间')}
            {this.renderDrag(endIndex)}
          </div>
          <div className="dayCountField overflow_ellipsis">{_l('时长')}</div>
        </RecordWrapper>
        {!!dragValue && (
          <div
            style={{
              left: dragValue,
            }}
            className="dragLine"
          />
        )}
      </GroupingChildWrapper>
    );
  }

  getMoreMenuItems() {
    const { withoutArrangementVisible } = this.props;

    return [
      {
        key: 'toggleWithoutArrangement',
        className: 'valignWrapper',
        icon: (
          <Icon className="Font18 textTertiary" icon={withoutArrangementVisible ? 'visibility_off' : 'visibility'} />
        ),
        label: <span className="Font14">{withoutArrangementVisible ? _l('隐藏未排期') : _l('显示未排期')}</span>,
        onClick: () => {
          this.props.updateWithoutArrangementVisible(!withoutArrangementVisible);
        },
      },
    ];
  }

  renderMore() {
    return (
      <More className="flexRow valignWrapper">
        <div className="flex"></div>
        <Dropdown
          trigger={['click']}
          menu={{ items: this.getMoreMenuItems(), style: { minWidth: 170 }, className: 'pTop6 pBottom6' }}
        >
          <Icon className="textTertiary Font18 pointer" icon="more_horiz" />
        </Dropdown>
      </More>
    );
  }

  render() {
    const { width, loading, base } = this.props;
    const { widthConfig } = this.state;
    return (
      <div
        className="gunterDirectory flexColumn"
        style={{
          width,
        }}
      >
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
};
GunterDirectory = connect(
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
)(GunterDirectory);
export default GunterDirectory;

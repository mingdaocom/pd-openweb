import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Icon from 'ming-ui/components/Icon';

const chooseDisplayType = [{ type: 'day', text: '按天' }, { type: 'week', text: '按周' }, { type: 'month', text: '按月' }];

export default class GanttHeader extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { type, data, name, switchDisplayType, refresh, exportData, closeLayer, scrollToToday } = this.props;
    return (
      <div className="ganttHeader flexRow">
        <div className="projectName ellipsis">{name}</div>
        {data && data.length ? (
          <Fragment>
            <div className="controlWrap flex flexRow">
              <div className="today" onClick={scrollToToday}>
                今天
              </div>
              <div className="chooseDisplayType ">
                {chooseDisplayType.map(item => (
                  <span onClick={() => switchDisplayType(item.type)} className={cx(item.type, { active: item.type === type })} key={item.type}>
                    {item.text}
                  </span>
                ))}
              </div>
            </div>
            <div className="operationWrap flexRow">
              <div className="refresh operation ThemeColor3" onClick={refresh}>
                <Icon icon="refresh" />
                <span>刷新</span>
              </div>
              <div className="export operation ThemeColor3" onClick={exportData}>
                <Icon icon="export" />
                <span>导出</span>
              </div>
              <canvas id="ganttCanvas" className="Hidden" />
            </div>
          </Fragment>
        ) : (
          <div className="flex" />
        )}
        <div className="close operation ThemeColor3 pointer" onClick={closeLayer}>
          <Icon icon="delete" />
        </div>
      </div>
    );
  }
}

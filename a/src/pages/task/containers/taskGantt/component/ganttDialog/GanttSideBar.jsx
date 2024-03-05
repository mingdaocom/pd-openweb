import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import config from './config';

const INDENT = 20;
export default class GanttSideBar extends Component {
  componentDidMount() {
    const $graphWrap = document.querySelector('.graphWrap');
    this.taskList.addEventListener('scroll', (e) => {
      e.currentTarget.className == config.scrollingEle && ($graphWrap.scrollTop = e.target.scrollTop);
    });
    this.taskList.addEventListener('mouseover', (e) => {
      config.scrollingEle = e.currentTarget.className;
    });
  }

  /**
   * 递归渲染任务列表
   * @param {*} data
   * @param {*} args
   */
  renderTaskList = (data, args = []) => {
    const prefix = args.length ? args.map(v => ++v).join('.') + '.' : '';
    return (
      data &&
      data.map((item, index) => {
        const nextArgs = args.slice();
        nextArgs.push(index);
        return (
          <div key={index + prefix} className="taskItem">
            <div
              style={{ paddingLeft: 12 + INDENT * args.length }}
              className={cx('taskInfo flexRow')}
              onMouseOver={e => this.props.handleTaskItemHover(true, e)}
              onMouseOut={() => this.props.handleTaskItemHover(false)}
            >
              <div
                className={cx(
                  'toggleTask ThemeColor3',
                  {
                    haveChildren: item.child && item.child.length,
                    childrenVisible: item.childrenVisible,
                  },
                  item.childrenVisible ? 'icon-remove_circle_outline' : 'icon-addapplication'
                )}
                onClick={() => this.props.toggleTask(nextArgs)}
              />
              <span className="seq">{`${prefix}${index + 1})`}</span>
              <span className="name textOverflow" onClick={() => this.props.showDetail(item.taskID)}>
                {item.taskName}
              </span>
            </div>
            {item.child && item.childrenVisible && <div className="childrenWrap">{this.renderTaskList(item.child, nextArgs)}</div>}
          </div>
        );
      })
    );
  };

  render() {
    const { data } = this.props;
    return (
      <div className="ganttSideBarWrap flexColumn">
        <header>{_l('任务列表')}</header>
        <div className="taskListWrap" ref={node => (this.taskList = node)}>
          {this.renderTaskList(data)}
        </div>
      </div>
    );
  }
}

import React, { Component } from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import { updateType, updateCursor, updateTypeCursor } from '../../actions/current';
import { loadAllUsers, expandedKeysUpdate } from '../../actions/entities';
import { loadJobList } from '../../actions/jobs';

class DepOrjobTab extends Component {
  render() {
    const { current = [], dispatch, projectId } = this.props;
    const { typeNum = 0 } = current;
    return (
      <div className="typeLabBox">
        <ul>
          <li
            className={cx({ current: typeNum === 0 })}
            onClick={() => {
              dispatch(updateType(0)); //设置当前部门/职位tab
              dispatch(expandedKeysUpdate([])); //清空展开的部门 Keys
              dispatch(updateCursor('')); //设置当前选中部门
              dispatch(updateTypeCursor(0)); //全公司0/未分配1/未审核2/待激活3
              dispatch(loadAllUsers(projectId, 1));
            }}>
            {_l('部门')}
          </li>
          <li
            className={cx('mLeft30', { current: typeNum === 1 })}
            onClick={() => {
              dispatch(updateType(1));
              dispatch(loadJobList(projectId));
            }}>
            {_l('职位')}
          </li>
        </ul>
      </div>
    );
  }
}
const mapStateToProps = state => {
  const { current, projectId } = state;
  return {
    current,
    projectId,
  };
};

const connectedTypeLab = connect(mapStateToProps)(DepOrjobTab);

export default connectedTypeLab;

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getFullTree, loadUsers } from '../../actions/entities';
import { updateCursor } from '../../actions/current';
import EventEmitter from 'events';
export const emitter = new EventEmitter();

const CreateDialog = require('../../modules/dialogCreateEditDept');

class CreateBtn extends Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
    emitter.addListener('handleClick', this.handleClick);
  }

  componentDidMount() {
    const { autoShow, dispatch } = this.props;
    if (autoShow) {
      setTimeout(() => {
        this.handleClick();
      }, 0);
      dispatch({
        type: 'UPDATE_AUTO_SHOW',
      });
    }
  }

  handleClick(e) {
    if (e) {
      e.stopPropagation();
    }
    const { departmentId, projectId, dispatch } = this.props;
    CreateDialog({
      type: 'create',
      projectId,
      departmentId: '',
      callback(payload) {
        const {
          response: { departmentId },
        } = payload;
        dispatch(
          getFullTree({
            departmentId,
            afterRequest() {
              dispatch(updateCursor(departmentId));
              dispatch(loadUsers(departmentId));
              $.publish('SCROLL_TO_DEPARTMENT', departmentId);
            },
          })
        );
      },
    });
  }

  render() {
    return (
      <span className="Hand mLeft24 ThemeColor3 creatDepartment pTop16 pBottom16"
        style={{
          borderTop: '1px solid #EAEAEA',
          width: '192px',
          display: 'flex',
          alignItems: 'center'
        }}
        onClick={this.handleClick}>
        <span className="mRight8 icon-add Font20" />
        {_l('创建部门')}
      </span>
    );
  }
}

const mapStateToProps = state => {
  const { current } = state;
  return {
    ...current,
  };
};

const ConnectedCreateBtn = connect(mapStateToProps)(CreateBtn);

export default ConnectedCreateBtn;

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getFullTree, loadUsers, updateShowExport, updateImportType } from '../../actions/entities';
import { updateCursor } from '../../actions/current';
import EventEmitter from 'events';
import { Icon } from 'ming-ui';
import { Dropdown, Menu } from 'antd';
import { getPssId } from 'src/util/pssId';
import './index.less';

export const emitter = new EventEmitter();

import CreateDialog from '../../modules/dialogCreateEditDept';

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
      isLevel0: true,
      callback(payload) {
        const {
          response: { departmentId },
        } = payload;
        dispatch(
          getFullTree({
            departmentId,
            isGetAll: true,
            afterRequest() {
              dispatch(updateCursor(departmentId));
              dispatch(loadUsers(departmentId));
              $.publish('SCROLL_TO_DEPARTMENT', departmentId);
            },
          }),
        );
      },
    });
  }

  // 导出部门列表
  exportDepartmentList = () => {
    const { projectId } = this.props;
    let projectName = (md.global.Account.projects || []).filter(item => item.projectId === projectId).length
      ? (md.global.Account.projects || []).filter(item => item.projectId === projectId)[0].companyName
      : '';
    fetch(`${md.global.Config.AjaxApiUrl}download/exportProjectDepartmentList`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Authorization: `md_pss_id ${getPssId()}`,
      },
      body: JSON.stringify({
        userStatus: '1',
        projectId,
      }),
    })
      .then(response => response.blob())
      .then(blob => {
        let date = moment(new Date()).format('YYYYMMDDHHmmss');
        const fileName = `${projectName}_${_l('部门')}_${date}` + '.xlsx';
        const link = document.createElement('a');

        link.href = window.URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(link.href);
      });
  };

  render() {
    const { newDepartments, dispatch } = this.props;
    return (
      <span
        className="Hand mLeft24 mRight24 ThemeColor3 creatDepartment pBottom16 pRight7"
        style={{
          borderTop: '1px solid #EAEAEA',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingRight: '3px',
          paddingTop: '24px',
        }}
      >
        <span className="creatDepartmentTxt" onClick={this.handleClick}>
          <span className="mRight3 icon-add Font20 TxtMiddle" />
          {_l('创建部门')}
        </span>
        <Dropdown
          overlayClassName="createMoreDropDown"
          trigger={['click']}
          placement="bottomLeft"
          overlay={
            <Menu>
              <Menu.Item
                key="0"
                onClick={() => {
                  dispatch(updateShowExport(true));
                  dispatch(updateImportType('importDepartment'));
                }}
              >
                {_l('导入部门')}
              </Menu.Item>
              <Menu.Item key="1" disabled={_.isEmpty(newDepartments)} onClick={this.exportDepartmentList}>
                {_l('导出部门')}
              </Menu.Item>
            </Menu>
          }
        >
          <Icon icon="moreop" className="Gray_9e Hand Font20 iconHover" />
        </Dropdown>
      </span>
    );
  }
}

const mapStateToProps = state => {
  const {
    current,
    entities: { newDepartments = [] },
  } = state;
  return {
    ...current,
    newDepartments,
  };
};

const ConnectedCreateBtn = connect(mapStateToProps)(CreateBtn);

export default ConnectedCreateBtn;

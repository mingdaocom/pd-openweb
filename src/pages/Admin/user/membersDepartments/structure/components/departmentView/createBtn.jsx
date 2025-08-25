import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Dropdown, Menu } from 'antd';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import { Icon, Tooltip } from 'ming-ui';
import { emitter } from 'src/utils/common';
import { getCurrentProject } from 'src/utils/project';
import { downloadFile } from '../../../../../util';
import { updateCursor } from '../../actions/current';
import { getFullTree, loadUsers, updateImportType, updateShowExport } from '../../actions/entities';
import { createEditDeptDialog } from '../CreateEditDeptDialog';

const Wrap = styled.div`
  padding: 12px 0;
  border-top: 1px solid #eaeaea;
  display: flex;
  align-items: center;
`;

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
    const { projectId, dispatch } = this.props;
    createEditDeptDialog({
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
            },
          }),
        );
      },
    });
  }

  // 导出部门列表
  exportDepartmentList = () => {
    const { projectId } = this.props;
    const url = `${md.global.Config.AjaxApiUrl}download/exportProjectDepartmentList`;
    let projectName = getCurrentProject(projectId, true).companyName;
    let date = moment().format('YYYYMMDDHHmmss');
    const fileName = `${projectName}_${_l('部门')}_${date}` + '.xlsx';

    downloadFile({
      url,
      params: {
        userStatus: '1',
        projectId,
      },
      exportFileName: fileName,
    });
  };

  render() {
    const { newDepartments, dispatch } = this.props;
    return (
      <Wrap>
        <span className="bold mLeft12">{_l('部门')}</span>
        <Tooltip
          autoCloseDelay={0}
          text={
            <span>
              {_l(
                '在进行工作表和工作流的所有下级部门检索时，若所有下级部门总数超过2000（含），系统将默认仅获取当前部门的“一级子部门”所有部门。',
              )}
            </span>
          }
          action={['hover']}
        >
          <Icon className="Font16 Gray_bd Hand mLeft4" icon="info_outline" />
        </Tooltip>
        <div className="flex"></div>
        <span className="Hand ThemeColor mRight12" onClick={this.handleClick}>
          <i className="mRight3 icon-add Font18 TxtMiddle" />
          {_l('添加')}
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
          <Icon icon="moreop" className="Gray_9e Hand Font20 iconHover mRight12" />
        </Dropdown>
      </Wrap>
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

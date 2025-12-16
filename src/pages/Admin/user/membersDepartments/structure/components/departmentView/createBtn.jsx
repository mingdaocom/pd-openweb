import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import moment from 'moment';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Checkbox, Icon, Menu, MenuItem } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { emitter } from 'src/utils/common';
import { getCurrentProject } from 'src/utils/project';
import { downloadFile } from '../../../../../util';
import * as currentActions from '../../actions/current';
import * as entitiesActions from '../../actions/entities';
import { createEditDeptDialog } from '../CreateEditDeptDialog';

const Wrap = styled.div`
  padding: 12px 0;
  border-top: 1px solid #eaeaea;
  display: flex;
  align-items: center;
`;

const MenuWrap = styled(Menu)`
  .ming.Item .Item-content .Icon {
    position: static;
  }
`;

class CreateBtn extends Component {
  constructor(props) {
    super(props);
    this.state = {
      popupVisible: false,
    };
    this.handleClick = this.handleClick.bind(this);
    emitter.addListener('handleClick', this.handleClick);
  }

  componentDidMount() {
    const { autoShow, updateAutoShow = () => {} } = this.props;
    if (autoShow) {
      setTimeout(() => {
        this.handleClick();
      }, 0);
      updateAutoShow();
    }
  }

  handleClick(e) {
    if (e) {
      e.stopPropagation();
    }
    const { projectId, getFullTree } = this.props;
    createEditDeptDialog({
      type: 'create',
      projectId,
      departmentId: '',
      isLevel0: true,
      callback: (departmentInfo, parentId) => {
        getFullTree({ departmentId: departmentInfo.departmentId, parentId, isGetAll: true });
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
    const {
      showDisabledDepartment,
      newDepartments,
      updateShowExport = () => {},
      updateImportType = () => {},
      handleShowDisabledDepartment = () => {},
    } = this.props;

    const { popupVisible } = this.state;
    return (
      <Wrap>
        <span className="bold mLeft12">{_l('部门')}</span>
        <Tooltip
          title={
            <span>
              {_l(
                '在进行工作表和工作流的所有下级部门检索时，若所有下级部门总数超过2000（含），系统将默认仅获取当前部门的“一级子部门”所有部门。',
              )}
            </span>
          }
        >
          <Icon className="Font16 Gray_bd Hand mLeft4" icon="info_outline" />
        </Tooltip>
        <div className="flex"></div>
        <span className="Hand ThemeColor mRight12" onClick={this.handleClick}>
          <i className="mRight3 icon-add Font18 TxtMiddle" />
          {_l('添加')}
        </span>
        <Trigger
          action={['click']}
          popupAlign={{
            points: ['tl', 'bl'],
            offset: [0, 0],
            overflow: { adjustX: true, adjustY: true },
          }}
          popupVisible={popupVisible}
          onPopupVisibleChange={popupVisible => this.setState({ popupVisible })}
          popup={
            <MenuWrap>
              <MenuItem onClick={() => handleShowDisabledDepartment(!showDisabledDepartment)}>
                <Checkbox text={_l('显示停用部门')} checked={showDisabledDepartment} />
              </MenuItem>
              <MenuItem
                key="0"
                onClick={() => {
                  updateShowExport(true);
                  updateImportType('importDepartment');
                }}
              >
                {_l('导入部门')}
              </MenuItem>
              <MenuItem key="1" disabled={_.isEmpty(newDepartments)} onClick={this.exportDepartmentList}>
                {_l('导出部门')}
              </MenuItem>
            </MenuWrap>
          }
        >
          <Icon icon="moreop" className="Gray_9e Hand Font20 iconHover mRight12" />
        </Trigger>
      </Wrap>
    );
  }
}

const ConnectedCreateBtn = connect(
  state => {
    const {
      current,
      entities: { newDepartments = [], showDisabledDepartment },
    } = state;
    return { ...current, newDepartments, showDisabledDepartment };
  },
  dispatch => bindActionCreators({ ...currentActions, ...entitiesActions }, dispatch),
)(CreateBtn);

export default ConnectedCreateBtn;

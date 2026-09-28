import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Checkbox, Dropdown, Tooltip } from 'ming-ui/antd-components';
import { withOpeners } from 'ming-ui/hooks/useFunctionWrapComponent';
import projectSettingAjax from 'src/api/projectSetting';
import { CLEAR_CACHE_PROCESS_TYPE } from 'src/pages/Admin/enum';
import { emitter } from 'src/utils/platform/browser/dom';
import { getCurrentProject } from 'src/utils/services/project';
import { downloadFile } from '../../../../../util';
import * as currentActions from '../../actions/current';
import * as entitiesActions from '../../actions/entities';
import { useCreateEditDeptDialog } from '../CreateEditDeptDialog';

const Wrap = styled.div`
  padding: 12px 0;
  border-top: 1px solid var(--color-border-secondary);
  display: flex;
  align-items: center;
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

  componentWillUnmount() {
    emitter.removeListener('handleClick', this.handleClick);
  }

  handleClick(e) {
    if (e) {
      e.stopPropagation();
    }

    const { projectId, getFullTree } = this.props;
    this.props.openCreateEditDeptDialog({
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

  clearDepartmentCache = () => {
    const { projectId } = this.props;
    this.setState({ popupVisible: false });
    projectSettingAjax
      .clearItemCache({ projectId, itemId: '', processType: CLEAR_CACHE_PROCESS_TYPE.ALL_DEPARTMENT })
      .then(data => {
        if (data) {
          alert(_l('刷新中，请稍后查看'));
        } else {
          alert(_l('刷新失败'), 2);
        }
      });
  };

  render() {
    const {
      showDisabledDepartment,
      newDepartments,
      updateShowExport = () => {},
      updateImportType = () => {},
      handleShowDisabledDepartment = () => {},
      hasDepartmentAuth,
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
          <Icon className="Font16 textDisabled Hand mLeft4" icon="info_outline" />
        </Tooltip>
        <div className="flex"></div>
        {hasDepartmentAuth && (
          <span className="Hand colorPrimary mRight12" onClick={this.handleClick}>
            <i className="mRight3 icon-add Font18 TxtMiddle" />
            {_l('添加')}
          </span>
        )}
        <Dropdown
          trigger={['click']}
          open={popupVisible}
          onOpenChange={popupVisible => this.setState({ popupVisible })}
          menu={{
            items: [
              ...(hasDepartmentAuth
                ? [
                    {
                      key: 'showDisabled',
                      label: <Checkbox checked={showDisabledDepartment}>{_l('显示停用部门')}</Checkbox>,
                      onClick: () => handleShowDisabledDepartment(!showDisabledDepartment),
                    },
                    {
                      key: 'import',
                      label: _l('导入部门'),
                      onClick: () => {
                        updateShowExport(true);
                        updateImportType('importDepartment');
                      },
                    },
                    {
                      key: 'export',
                      disabled: _.isEmpty(newDepartments),
                      label: _l('导出部门'),
                      onClick: this.exportDepartmentList,
                    },
                  ]
                : []),
              { key: 'refresh', label: _l('刷新部门列表'), onClick: this.clearDepartmentCache },
            ],
            onClick: () => this.setState({ popupVisible: false }),
          }}
        >
          <Icon icon="moreop" className="textTertiary Hand Font20 iconHover mRight12" />
        </Dropdown>
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

export default withOpeners(ConnectedCreateBtn, {
  openCreateEditDeptDialog: useCreateEditDeptDialog,
});

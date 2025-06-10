import React, { PureComponent } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Ajax from 'src/api/appManagement';
import externalPortalAjax from 'src/api/externalPortal';
import { PERMISSION_WAYS } from 'src/pages/Role/config.js';
import { sysRoleType } from 'src/pages/Role/config.js';
import { getTranslateInfo } from 'src/utils/app';
import SettingForm from './SettingForm';

const fillTranslateInfo = (appId, roleDetail) => {
  (roleDetail.sheets || []).forEach(sheet => {
    sheet.sheetName = getTranslateInfo(appId, null, sheet.sheetId).name || sheet.sheetName;
    (sheet.views || []).forEach(view => {
      view.viewName = getTranslateInfo(appId, null, view.viewId).name || view.viewName;
    });
    (sheet.fields || []).forEach(field => {
      field.fieldName = getTranslateInfo(appId, null, field.fieldId).name || field.fieldName;
    });
  });
  (roleDetail.pages || []).forEach(page => {
    page.name = getTranslateInfo(appId, null, page.pageId).name || page.name;
  });
};

const Wrap = styled.div`
  .w35 {
    width: 35%;
  }
  .mLeft52 {
    margin-left: 52px;
  }
  flex: 1;
  display: flex;
  flex-flow: column nowrap;
  background: #fff;
  .header {
    padding: 14px 32px;
    border-bottom: 1px solid #ddd;
  }
  .footer {
    padding: 15px 48px 28px;
    background-color: #fff;
  }
  .setBody {
    flex: 1 1 0;
    .settingForm {
      padding: 25px 48px 30px;
      max-width: 1250px;
    }

    .nameInput {
      width: 400px;
    }

    .subCheckbox :global(.Checkbox-box) {
      margin-right: 10px !important;
    }

    .authTable {
      .tableHeader {
        background-color: #f5f5f5;
        display: flex;
        flex-flow: row nowrap;
        height: 40px;
        line-height: 40px;
        position: sticky;
        top: 0;
        z-index: 1;
        .tableHeaderItemMax {
          text-align: center;
          font-weight: bold;
        }
        .tableHeaderOption {
          padding-left: 32px;
          width: 15%;
          max-width: 170px;
          min-width: 100px;
          justify-content: center !important;
        }
        .tableHeaderOther {
          width: 25%;
        }
        .tableHeaderItem {
          font-weight: bold;
          display: flex;
          flex-flow: row nowrap;
          align-items: center;
          justify-content: left;
        }
      }
      .emptyContent {
        border-bottom: 1px solid #eaeaea;
        color: #bdbdbd;
        line-height: 45px;
        padding-left: 24px;
      }
      .tableRow {
        display: flex;
        flex-flow: row nowrap;
        align-items: center;
        border-bottom: 1px solid #eaeaea;
        text-align: center;

        .viewsGroup {
          border-right: 1px solid #eaeaea;
        }

        .viewSetting {
          display: flex;
          flex-flow: row nowrap;
          align-items: center;
          line-height: normal;
          line-height: 32px;
          svg {
            vertical-align: middle !important;
          }
          .arrowIconShow {
            border-radius: 50%;
            display: inline-block;
            margin-right: 20px;
            opacity: 0;
            transition: all 0.4s ease;
            width: 32px;
            text-align: center;
            i {
              color: #bdbdbd;
              line-height: 1;
            }
            &.canShow:hover {
              background-color: #f7f7f7;
              opacity: 1;
              i {
                color: #2196f3;
              }
            }
            &.show {
              opacity: 1;
              i {
                color: #ff8a00 !important;
              }
            }
          }
          &:hover {
            .arrowIconShow.canShow {
              opacity: 1;
            }
          }
          .viewSettingItem {
            flex: 13;
            display: flex;
            flex-flow: row nowrap;
            align-items: center;
            justify-content: left;
          }
        }

        .settingGroup {
          width: 15%;
          max-width: 170px;
          min-width: 100px;
          padding: 0 10px;
          &.showSet {
            span {
              padding: 5px 10px;
              &:hover {
                background-color: #f7f7f7;
                border-radius: 5px;
              }
            }
          }
        }

        .arrowIcon {
          width: 20px;
          line-height: 32px;
          transition: transform 0.2s ease;
          transform: rotate(0deg);
          transform-origin: 6px center;
          &.rotated {
            transform: rotate(90deg);
          }
        }
      }
    }
  }
  .list {
    margin-top: 15px;
    li {
      width: 25%;
      float: left;
      margin-bottom: 15px;
      padding-right: 20px;
      box-sizing: border-box;
    }
  }
`;
export default class RoleSet extends PureComponent {
  static propTypes = {
    appId: PropTypes.string,
    roleId: PropTypes.string,
    show: PropTypes.bool.isRequired, // 是否显示弹层
    editCallback: PropTypes.func.isRequired, // 编辑创建的回调
  };

  state = {
    loading: false,
    roleDetail: undefined,
    hasChange: false,
    saveLoading: false,
    roleDetailCache: undefined,
  };
  static defaultRoleName = '';

  componentDidMount() {
    this.props.onRef(this);
    this.fetchRoleDetail();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.roleId !== this.props.roleId) {
      this.fetchRoleDetail(nextProps);
    }
  }

  abortRequest() {
    if (this.promise && this.promise.abort) {
      this.promise.abort();
    }
  }

  fetchRoleDetail(props = this.props) {
    let { roleId, appId, roleList, isForPortal } = props;
    roleId = roleId === 'new' ? '' : roleId;
    const data = roleList.find(o => o.roleId === roleId) || {};

    if (sysRoleType.includes(data.roleType)) {
      return;
    }
    this.abortRequest();
    this.setState({ loading: true });

    let promise;

    if (roleId) {
      this.promise = Ajax.getRoleDetail({
        roleId,
        appId,
        isPortal: isForPortal,
      });

      promise = this.promise;
    } else {
      this.promise = Ajax.getAddRoleTemplate({
        appId,
        isPortal: isForPortal,
      });

      promise = this.promise.then(roleDetail => {
        // 兼容默认模板没有description
        roleDetail.permissionWay = PERMISSION_WAYS.ViewAllAndManageSelfRecord;
        return {
          ...roleDetail,
          description: '',
          name: _l('新角色'),
        };
      });
    }

    promise
      .then(
        roleDetail => {
          fillTranslateInfo(appId, roleDetail);
          this.setState({
            roleDetail,
            roleDetailCache: roleDetail,
            hasChange: !roleId,
          });
          this.defaultRoleName = roleDetail.name;
        },
        () => {},
      )
      .finally(() => {
        this.setState({
          loading: false,
        });
      });
  }

  updateRoleDetail = payload => {
    const { roleId } = this.props;
    let details = {
      ...this.state.roleDetail,
      ...payload,
    };
    this.setState({
      roleDetail: details,
      hasChange: !roleId ? true : !_.isEqual(details, this.state.roleDetailCache),
    });
  };

  onFormat = () => {
    this.props.onFormat();
  };

  onSave = isConfirm => {
    let { appId, roleId, editCallback, isForPortal, projectId } = this.props;
    roleId = roleId === 'new' ? '' : roleId;
    if (!roleId) {
      // 创建
      const {
        roleDetail: { roleId: useless, ...params },
      } = this.state;
      let param = {
        appId,
        ...params,
        name: params.name.trim() || this.defaultRoleName,
        sheets: params.permissionWay === PERMISSION_WAYS.CUSTOM ? params.sheets : undefined,
      };
      let promiseAjax = null;
      this.setState({
        saveLoading: true,
      });
      if (isForPortal) {
        promiseAjax = externalPortalAjax.addExRole({ ...param, projectId });
      } else {
        promiseAjax = Ajax.addRole(param);
      }
      promiseAjax.then(res => {
        if (res.resultCode === 1) {
          this.setState({
            hasChange: false,
            saveLoading: false,
          });
          editCallback(res.roleId, isConfirm);
          alert(_l('创建成功'));
        } else if (res.resultCode === 2) {
          alert(_l('角色名称重复，请重新命名'), 3);
          this.setState({ saveLoading: false });
        } else {
          alert(_l('创建失败'), 2);
          this.setState({ saveLoading: false });
        }
      });
    } else {
      // 编辑  内部和外部门户同一个接口
      const { roleDetail = {} } = this.state;
      this.setState({
        saveLoading: true,
      });
      let promiseAjax = null;
      let param = {
        projectId: roleDetail.projectId,
        appId,
        roleId,
        appRoleModel: {
          ...roleDetail,
          name: (roleDetail.name || '').trim() || this.defaultRoleName,
          sheets: roleDetail.permissionWay === PERMISSION_WAYS.CUSTOM ? roleDetail.sheets : undefined,
        },
      };
      if (isForPortal) {
        promiseAjax = externalPortalAjax.editAppExRole(param);
      } else {
        promiseAjax = Ajax.editAppRole(param);
      }
      return promiseAjax.then(res => {
        if (res === 1) {
          this.setState({
            hasChange: false,
            saveLoading: false,
            roleDetailCache: roleDetail,
          });
          editCallback(roleId, isConfirm);
          alert(_l('保存成功'));
        } else if (res === 2) {
          alert(_l('角色名称重复，请重新命名'), 3);
          this.setState({ saveLoading: false });
        } else {
          alert(_l('编辑失败'), 2);
          this.setState({ saveLoading: false });
        }
      });
    }
  };

  render() {
    let { roleId, isForPortal, showRoleSet, projectId, appId, setQuickTag, onDelRole, handleChangePage, canEditUser } =
      this.props;
    roleId = roleId === 'new' ? '' : roleId;
    const { roleDetail, loading, saveLoading, roleDetailCache } = this.state;
    const formProps = {
      canEditUser,
      setQuickTag,
      showRoleSet,
      isForPortal,
      roleDetail,
      loading: loading || roleDetail === undefined,
      saveLoading,
      onChange: this.updateRoleDetail,
      onSave: this.onSave,
      projectId,
      appId,
      roleDetailCache,
      onDel: () => {
        this.setState(
          {
            hasChange: false,
          },
          () => {
            roleId
              ? this.setState({
                  roleDetail: roleDetailCache,
                })
              : onDelRole(roleId);
          },
        );
      },
      handleChangePage: handleChangePage,
    };

    return (
      <Wrap>
        <SettingForm {...formProps} />
      </Wrap>
    );
  }
}

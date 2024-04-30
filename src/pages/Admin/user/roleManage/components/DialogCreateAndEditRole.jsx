import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Select } from 'antd';
import { Dialog, Icon } from 'ming-ui';
import fixedDataAjax from 'src/api/fixedData.js';
import organizeAjax from 'src/api/organize.js';
import './dialogCreateAndEditRole.less';
class DialogCreateAndEditRole extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      roleName: props.filed === 'edit' ? props.currentRole.organizeName : '',
      remark: props.filed === 'edit' ? props.currentRole.remark : '',
      orgRoleGroupId: props.currentRole.orgRoleGroupId || '',
      submitLoading: false,
    };
  }

  componentDidMount() {
    this.input.focus();
  }

  handleSubmit = async () => {
    const { filed, projectId, currentRole, searchValue, treeData } = this.props;
    const { orgRoleGroupId } = this.state;
    let roleName = this.state.roleName.trim();
    let remark = this.state.remark.trim();

    const checkSensitive = await fixedDataAjax.checkSensitive({ content: roleName });
    if (checkSensitive) {
      this.setState({ submitLoading: false });
      return alert(_l('输入内容包含敏感词，请重新填写'), 3);
    }

    if (filed === 'edit') {
      organizeAjax
        .editOrganizeName({
          organizeName: roleName,
          projectId,
          remark,
          organizeId: currentRole.organizeId,
          orgRoleGroupId,
        })
        .then(res => {
          if (!res) {
            alert(_l('修改失败'), 2);
          } else if (res === 1) {
            alert(_l('修改成功'));
            this.props.updateChildren(
              treeData,
              currentRole.orgRoleGroupId === orgRoleGroupId
                ? [orgRoleGroupId]
                : [currentRole.orgRoleGroupId, orgRoleGroupId],
            );
            this.props.updateCurrentRole({
              organizeName: roleName,
              organizeId: currentRole.organizeId,
              remark,
              orgRoleGroupId,
            });
          } else if (res === 2) {
            alert(_l('该角色名称已存在'), 3);
          }
          this.props.onCancel();
          this.setState({ submitLoading: false });
        })
        .catch(err => {
          this.setState({ submitLoading: false });
        });
    } else {
      organizeAjax
        .addOrganize({ organizeName: roleName, projectId, remark, orgRoleGroupId })
        .then(res => {
          if (!res) {
            alert(_l('创建失败'), 2);
            this.props.onCancel();
          } else if (res === 1) {
            alert(_l('创建成功'));
            this.props.updateIsRequestList(false);
            this.props.updateChildren(treeData, [orgRoleGroupId], 'add');
            this.props.onCancel();
          } else if (res === 2) {
            alert(_l('该角色名称已存在'), 3);
            this.setState({ exsistCurrentName: true });
          }
          this.setState({ submitLoading: false });
        })
        .catch(err => {
          this.setState({ submitLoading: false });
        });
    }
  };

  footer = () => {
    const { filed, roleList } = this.props;
    const { exsistCurrentName, submitLoading } = this.state;
    let roleName = this.state.roleName.trim();

    return (
      <div className="createPositionDialogFooter">
        <span class="noText ThemeHoverColor3 Hand" onClick={() => this.props.onCancel()}>
          {_l('取消')}
        </span>
        <span
          class={cx('nyesText ', {
            ThemeBGColor3: !exsistCurrentName,
            boderRadAll_3: !exsistCurrentName,
            disabledComfrim: exsistCurrentName || submitLoading,
          })}
          onClick={() => {
            if (!roleName) {
              alert(_l('请输入角色名称'), 3);
              return;
            } else if (exsistCurrentName || submitLoading) {
              return;
            } else if (!!roleList.find(it => it.roleName === roleName)) {
              alert(_l('该角色名称已存在'), 3);
              this.setState({ exsistCurrentName: true });
              return;
            }

            this.setState({ submitLoading: true }, this.handleSubmit);
          }}
        >
          {filed === 'edit' ? _l('保存') : _l('添加')}
        </span>
      </div>
    );
  };

  render() {
    const { filed, showRoleDialog, treeData } = this.props;
    const { roleName, remark, orgRoleGroupId } = this.state;
    const groupOptions = treeData.map(l => {
      return {
        ...l,
        label: l.title,
        value: l.orgRoleGroupId,
      };
    });
    return (
      <Dialog
        title={filed === 'create' ? _l('添加角色') : _l('编辑角色')}
        footer={this.footer()}
        className="createPositionDialog"
        onCancel={() => this.props.onCancel()}
        visible={showRoleDialog}
      >
        <div>
          <div className="mTop5 mBottom12 Font14 require">{_l('名称')}</div>
          <input
            class="inputBox mBottom32"
            maxLength={32}
            value={roleName}
            placeholder={_l('请填写角色名称')}
            ref={node => (this.input = node)}
            onChange={e => {
              this.setState({
                roleName: e.target.value,
                exsistCurrentName: false,
              });
            }}
          />
          <div className="mBottom12 Font14 require">{_l('角色组')}</div>
          <Select
            value={orgRoleGroupId}
            className="selectWrapper w100 mBottom32"
            options={groupOptions}
            suffixIcon={<Icon icon="arrow-down-border Font14" />}
            onChange={value => this.setState({ orgRoleGroupId: value })}
          ></Select>
          <div className="Font14 mBottom12">{_l('备注')}</div>
          <textarea
            value={remark}
            className="remark"
            onChange={e => {
              this.setState({ remark: e.target.value });
            }}
            maxLength={200}
          ></textarea>
        </div>
      </Dialog>
    );
  }
}

export default DialogCreateAndEditRole;

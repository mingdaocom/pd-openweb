import React from 'react';
import { Icon } from 'ming-ui';
import { Input, Modal, Select } from 'ming-ui/antd-components';
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

  handleSubmit = async () => {
    const { filed, projectId, currentRole, treeData } = this.props;
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
        .catch(() => {
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
        .catch(() => {
          this.setState({ submitLoading: false });
        });
    }
  };

  handleOk = () => {
    const { roleList } = this.props;
    const { exsistCurrentName, submitLoading } = this.state;
    const roleName = this.state.roleName.trim();

    if (!roleName) {
      alert(_l('请输入角色名称'), 3);
    } else if (exsistCurrentName || submitLoading) {
      return;
    } else if (roleList.find(it => it.roleName === roleName)) {
      alert(_l('该角色名称已存在'), 3);
      this.setState({ exsistCurrentName: true });
    } else {
      this.setState({ submitLoading: true }, this.handleSubmit);
    }
  };

  render() {
    const { filed, showRoleDialog, treeData } = this.props;
    const { roleName, remark, orgRoleGroupId, exsistCurrentName, submitLoading } = this.state;
    const groupOptions = treeData.map(l => {
      return {
        ...l,
        label: l.title,
        value: l.orgRoleGroupId,
      };
    });
    return (
      <Modal
        mask={{ closable: true }}
        keyboard
        title={filed === 'create' ? _l('添加角色') : _l('编辑角色')}
        className="createPositionDialog"
        onCancel={() => this.props.onCancel()}
        onOk={this.handleOk}
        okText={filed === 'edit' ? _l('保存') : _l('添加')}
        okDisabled={exsistCurrentName}
        confirmLoading={submitLoading}
        open={showRoleDialog}
      >
        <div>
          <div className="mTop5 mBottom12 Font14 require">{_l('名称')}</div>
          <Input
            className="inputBox mBottom32"
            maxLength={32}
            value={roleName}
            autoFocus
            placeholder={_l('请填写角色名称')}
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
      </Modal>
    );
  }
}

export default DialogCreateAndEditRole;

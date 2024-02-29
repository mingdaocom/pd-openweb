import React from 'react';
import { Dialog } from 'ming-ui';
import './dialogCreateAndEditRole.less';
import fixedDataAjax from 'src/api/fixedData.js';
import organizeAjax from 'src/api/organize.js';
import cx from 'classnames';
import _ from 'lodash';

class DialogCreateAndEditRole extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      roleName: props.filed === 'edit' ? props.currentRole.organizeName : '',
      remark: props.filed === 'edit' ? props.currentRole.remark : '',
    };
  }

  componentDidMount() {
    this.input.focus();
  }

  footer = () => {
    const { filed, roleList, projectId, currentRole, searchValue } = this.props;
    const { exsistCurrentName } = this.state;
    let roleName = this.state.roleName.trim();
    let remark = this.state.remark.trim();
    return (
      <div className="createPositionDialogFooter">
        <span class="noText ThemeHoverColor3 Hand" onClick={() => this.props.onCancel()}>
          {_l('取消')}
        </span>
        <span
          class={cx('nyesText ', {
            ThemeBGColor3: !exsistCurrentName,
            boderRadAll_3: !exsistCurrentName,
            disabledComfrim: exsistCurrentName,
          })}
          onClick={() => {
            if (!roleName) {
              alert(_l('请输入角色名称'), 3);
              return;
            } else if (exsistCurrentName) {
              return;
            } else if (!!roleList.find(it => it.roleName === roleName)) {
              alert(_l('该角色名称已存在'), 3);
              this.setState({ exsistCurrentName: true });
              return;
            }
            fixedDataAjax.checkSensitive({ content: roleName }).then(res => {
              if (res) {
                return alert(_l('输入内容包含敏感词，请重新填写'), 3);
              }
              if (filed === 'edit') {
                organizeAjax
                  .editOrganizeName({
                    organizeName: roleName,
                    projectId,
                    remark,
                    organizeId: currentRole.organizeId,
                  })
                  .then(res => {
                    if (!res) {
                      alert(_l('修改失败'), 2);
                    } else if (res === 1) {
                      alert(_l('修改成功'));
                      let list = roleList.map(it => {
                        if (it.organizeId === currentRole.organizeId) {
                          return { ...it, organizeName: roleName, organizeId: currentRole.organizeId, remark };
                        }
                        return it;
                      });
                      this.props.updateCurrentRole({
                        organizeName: roleName,
                        organizeId: currentRole.organizeId,
                        remark,
                      });
                      this.props.updateRoleList(list);
                    } else if (res === 2) {
                      alert(_l('该角色名称已存在'), 3);
                    }
                    this.props.onCancel();
                  });
              } else {
                organizeAjax.addOrganize({ organizeName: roleName, projectId, remark }).then(res => {
                  if (!res) {
                    alert(_l('创建失败'), 2);
                    this.props.onCancel();
                  } else if (res === 1) {
                    alert(_l('创建成功'));
                    this.props.updateIsRequestList(false);
                    if (!searchValue || roleName.indexOf(searchValue) > -1) {
                      this.props.updateCurrentRole({ organizeName: roleName, remark });
                    }
                    this.props.getRoleList(true);
                    this.props.onCancel();
                  } else if (res === 2) {
                    alert(_l('该角色名称已存在'), 3);
                    this.setState({ exsistCurrentName: true });
                  }
                });
              }
            });
          }}
        >
          {filed === 'edit' ? _l('保存') : _l('创建')}
        </span>
      </div>
    );
  };

  render() {
    const { filed, showRoleDialog } = this.props;
    const { roleName, remark } = this.state;
    return (
      <Dialog
        title={filed === 'create' ? _l('新建角色') : _l('编辑角色')}
        footer={this.footer()}
        className="createPositionDialog"
        onCancel={() => this.props.onCancel()}
        visible={showRoleDialog}
      >
        <div>
          <div className="mTop5 mBottom12 Font14">{_l('角色名称')}</div>
          <input
            class="inputBox"
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

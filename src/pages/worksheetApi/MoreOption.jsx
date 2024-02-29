import React, { Component } from 'react';
import appManagementAjax from 'src/api/appManagement';
import { Dialog, VerifyPasswordConfirm } from 'ming-ui';
import withClickAway from 'ming-ui/decorators/withClickAway';
import { Input } from 'antd';
import { verifyPassword } from 'src/util';
import SecretKey from './SecretKey';

@withClickAway
export default class MoreOption extends Component {
  constructor(props) {
    super(props);

    const { data = {} } = props;
    const { remark } = data;

    this.state = {
      showDescDialog: false,
      showConfirm: false,
      showEditDialog: false,
      remark,
      type: '',
    };
  }

  editAuthorizeStatus = () => {
    const { appId, data = {}, setFn, getAuthorizes } = this.props;
    const { type } = this.state;
    let ajax;

    if (type === 'cancel') {
      ajax = appManagementAjax.editAuthorizeStatus({
        appId,
        appKey: data.appKey,
        type: data.type,
        viewNull: data.viewNull,
        status: 2,
      });
    } else {
      ajax = appManagementAjax.deleteAuthorizeStatus({
        appId,
        appKey: data.appKey,
      });
    }

    ajax.then(res => {
      getAuthorizes();
      setFn(false);
    });
  };

  renderDesc = () => {
    const { setFn, data = {}, appId, getAuthorizes } = this.props;
    const { appKey } = data;
    const { showDescDialog, remark } = this.state;

    if (!showDescDialog) return null;

    return (
      <Dialog
        className="setDescDialog"
        visible={true}
        title={_l('备注')}
        autoScrollBody
        type="scroll"
        maxHeight={200}
        width={500}
        onOk={() => {
          if (remark.trim() === '') {
            alert(_l('请输入备注信息'), 3);
            return;
          }

          appManagementAjax
            .editAuthorizeRemark({
              appId,
              appKey,
              remark: remark.trim(),
            })
            .then(res => {
              getAuthorizes();
              this.setState({ showDescDialog: false });
              setFn(false);
            });
        }}
        onCancel={() => {
          this.setState({ showDescDialog: false });
          setFn(false);
        }}
      >
        <input
          type="text"
          placeholder={_l('备注')}
          onChange={e => this.setState({ remark: e.target.value })}
          value={remark}
        />
      </Dialog>
    );
  };

  renderCancelAndDeleteDialog = () => {
    const { type } = this.state;

    VerifyPasswordConfirm.confirm({
      title:
        type === 'cancel' ? <div>{_l('关闭授权')}</div> : <div style={{ color: '#f44336' }}>{_l('删除授权密钥')}</div>,
      description:
        type === 'cancel'
          ? _l('应用授权密钥是极为重要的凭证，关闭时需要验证身份')
          : _l('应用授权密钥是极为重要的凭证，删除时需要验证身份'),
      onOk: this.editAuthorizeStatus,
    });
  };

  render() {
    const { data, appId, getAuthorizes, setFn } = this.props;
    const { showEditDialog } = this.state;

    return (
      <React.Fragment>
        <ul className="moreOptionTrigger">
          <li onClick={() => this.setState({ showEditDialog: true })}>{_l('编辑')}</li>
          {data.status !== 2 && (
            <li onClick={() => this.setState({ type: 'cancel' }, this.renderCancelAndDeleteDialog)}>
              {_l('关闭授权')}
            </li>
          )}
          <li onClick={() => this.setState({ showDescDialog: true })}>{_l('修改备注')}</li>
          <li
            onClick={() => this.setState({ type: 'delete' }, this.renderCancelAndDeleteDialog)}
            style={{ color: '#f44336' }}
          >
            {_l('删除')}
          </li>
        </ul>

        {showEditDialog && (
          <SecretKey
            appId={appId}
            appKey={data.appKey}
            status={data.status}
            type={data.type}
            viewNull={data.viewNull}
            getAuthorizes={getAuthorizes}
            onClose={() => setFn(false)}
          />
        )}
        {this.renderDesc()}
      </React.Fragment>
    );
  }
}

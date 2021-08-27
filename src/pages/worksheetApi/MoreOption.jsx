import React, { Component } from 'react';
import appManagementAjax from 'src/api/appManagement';
import { Dialog } from 'ming-ui';
import withClickAway from 'ming-ui/decorators/withClickAway';

@withClickAway
export default class MoreOption extends Component {
  constructor(props) {
    super(props);
    const { data = {} } = this.props;
    const { remark } = data;
    this.state = {
      showDescDia: false,
      remark,
    };
  }

  deleteConfirm = () => {
    const { getAuthorizes } = this.props;

    return Dialog.confirm({
      title: _l('确定删除这条 SecretKey？'),
      description: '',
      onOk: () => {
        this.editAuthorizeStatus(1, () => {
          getAuthorizes();
        });
      },
    });
  };

  editAuthorizeStatus = (displayType, cb) => {
    const { appId, data = {}, setFn, getAuthorizes, showMoreOption } = this.props;
    const { appKey } = data;
    appManagementAjax // 编辑应用授权类型
      .eiitAuthorizeStatus({
        appId,
        appKey,
        displayType, // 1=删除，2=取消授权，3=全部，4=只读
      })
      .then(res => {
        getAuthorizes();
        setFn(!showMoreOption);
        if (cb) {
          cb();
        }
      });
  };

  setDesc = () => {
    const { showMoreOption, setFn, data = {}, appId, getAuthorizes } = this.props;
    const { appKey } = data;
    const { remark } = this.state;
    if (!this.state.showDescDia) {
      return;
    }
    return (
      <Dialog
        className="setDescDialog"
        visible={this.state.showDescDia}
        title={_l('备注')}
        autoScrollBody
        type="scroll"
        maxHeight={200}
        width={400}
        onOk={() => {
          if (!remark || remark.trim() === '') {
            alert(_l('请输入备注信息'), 3);
            return;
          }
          appManagementAjax // 编辑备注
            .editAuthorizeRemark({
              appId,
              appKey,
              remark,
            })
            .then(res => {
              getAuthorizes();
              setFn(!showMoreOption);
              this.setState({
                showDescDia: false,
              });
            });
        }}
        onCancel={() => {
          this.setState({
            showDescDia: false,
          });
          setFn(!showMoreOption);
        }}
      >
        <input
          type="text"
          placeholder={_l('备注')}
          onChange={e => {
            this.setState({
              remark: e.target.value,
            });
          }}
          value={remark}
        />
      </Dialog>
    );
  };
  render() {
    const { showMoreOption, setFn, data } = this.props;
    return (
      <React.Fragment>
        <ul className="moreOptionTrigger">
          {data.dispalyType !== 3 && (
            <li
              onClick={() => {
                this.editAuthorizeStatus(3);
              }}
            >
              {_l('授权全部接口')}
            </li>
          )}
          {data.dispalyType !== 4 && (
            <li
              onClick={() => {
                this.editAuthorizeStatus(4);
              }}
            >
              {_l('授权只读接口')}
            </li>
          )}
          {data.dispalyType !== 2 && (
            <li
              onClick={() => {
                this.editAuthorizeStatus(2);
              }}
            >
              {_l('取消授权')}
            </li>
          )}
          <li
            onClick={() => {
              this.setState({
                showDescDia: true,
              });
            }}
          >
            {_l('修改备注')}
          </li>
          <li
            onClick={() => {
              setFn(!showMoreOption);
              this.deleteConfirm();
            }}
          >
            {_l('删除')}
          </li>
        </ul>
        {this.setDesc()}
      </React.Fragment>
    );
  }
}

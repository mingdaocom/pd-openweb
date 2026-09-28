import React, { Component } from 'react';
import { Input, Modal } from 'ming-ui/antd-components';
import sheetAjax from 'src/api/worksheet';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';
import './SheetSetName.less';

export default class SheetSetName extends Component {
  constructor(props) {
    const { entityName, btnName } = props;
    super(props);
    this.state = {
      entityName: entityName || '',
      btnName: btnName || '',
    };
    this.requestPending = false;
  }
  handleSave() {
    if (this.requestPending) return;

    const { entityName } = this.state;
    const defaultName = _l('记录');

    // if (entityName.length > 6 || entityName.length === 0) {
    //   alert(_l('记录名应为1~6位字符'), 3);
    //   return;
    // }
    if (entityName !== this.props.entityName) {
      const name = entityName.trim() || defaultName;
      this.requestPending = true;
      return sheetAjax
        .updateEntityName({
          worksheetId: this.props.worksheetId,
          entityName: name,
          projectId: this.props.projectId,
        })
        .then(() => {
          const args = {
            entityName: name,
          };
          this.props.updateSheetInfo(this.props.worksheetId, args);
          alert(_l('修改成功'));
        })
        .catch(_requestError => {
          alertIfNotUnauthorized(_requestError, _l('修改失败'), 2);
        })
        .finally(() => {
          this.requestPending = false;
        })
        .then(() => this.props.onHide());
    }

    this.props.onHide();
  }
  render() {
    const { visible } = this.props;
    const { entityName } = this.state;
    return (
      <Modal
        className="SheetSetName"
        open={visible}
        title={_l('设置记录名称')}
        width={560}
        okText={_l('确认')}
        onCancel={this.props.onHide}
        onOk={this.handleSave.bind(this)}
      >
        <div className="textSecondary">
          {_l('修改添加按钮、消息通知等指代记录时所使用的名称。例如：可以修改“客户管理”表的记录名称为“客户”')}
        </div>
        <div className="inputItem flexRow valignWrapper mTop25">
          <span className="textSecondary">{_l('记录名称')}</span>
          <Input
            className="flex"
            value={entityName}
            onChange={event => {
              this.setState({
                entityName: event.target.value,
              });
            }}
          />
        </div>
        {/* <div className="inputItem flexRow valignWrapper mTop15">
          <span className="textSecondary">{_l('添加按钮名称')}</span>
          <Input
            className="flex"
            value={btnName}
            onChange={value => {
              this.setState({
                btnName: value.trim()
              })
            }}
          />
        </div> */}
      </Modal>
    );
  }
}

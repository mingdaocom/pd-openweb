import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Input from 'ming-ui/components/Input';
import { Dialog, Checkbox } from 'ming-ui';
import sheetAjax from 'src/api/worksheet';
import './SheetSetName.less';

export default class SheetSetName extends Component {
  constructor(props) {
    const { entityName, btnName } = props;
    super(props);
    this.state = {
      entityName: entityName || '',
      btnName: btnName || '',
    }
  }
  handleSave() {
    const { entityName } = this.state;
    const defaultName = _l('记录');
    // if (entityName.length > 6 || entityName.length === 0) {
    //   alert(_l('记录名应为1~6位字符'), 3);
    //   return;
    // }
    if (entityName !== this.props.entityName) {
      const name = entityName.trim() || defaultName;
      sheetAjax
        .updateEntityName({
          worksheetId: this.props.worksheetId,
          entityName: name,
          projectId: this.props.projectId,
        })
        .then((data) => {
          const args = {
            entityName: name,
          };
          this.props.updateSheetInfo(this.props.worksheetId, args);
          alert(_l('修改成功'));
        })
        .catch((err) => {
          alert(_l('修改失败'), 2);
        });
    }
    this.props.onHide();
  }
  render() {
    const { visible } = this.props;
    const { entityName, btnName } = this.state;
    return (
      <Dialog
        className="SheetSetName"
        visible={visible}
        anim={false}
        title={_l('设置记录名称')}
        width={560}
        okText={_l('确认')}
        onCancel={this.props.onHide}
        onOk={this.handleSave.bind(this)}
      >
        <div className="Gray_75">{_l('修改添加按钮、消息通知等指代记录时所使用的名称。例如：可以修改“客户管理”表的记录名称为“客户”')}</div>
        <div className="inputItem flexRow valignWrapper mTop25">
          <span className="Gray_75">{_l('记录名称')}</span>
          <Input
            className="flex"
            value={entityName}
            onChange={value => {
              this.setState({
                entityName: value
              })
            }}
          />
        </div>
        {/* <div className="inputItem flexRow valignWrapper mTop15">
          <span className="Gray_75">{_l('添加按钮名称')}</span>
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
      </Dialog>
    );
  }
}

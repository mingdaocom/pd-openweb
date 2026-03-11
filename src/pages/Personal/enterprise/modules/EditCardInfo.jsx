import React, { Component, Fragment } from 'react';
import { Input } from 'antd';
import account from 'src/api/account';
import './index.less';

const userInfoList = [
  { label: _l('姓名'), key: 'fullname' },
  { label: _l('部门'), key: 'departmentInfos' },
  { label: _l('职位'), key: 'jobInfos' },
  { label: _l('工作地点'), key: 'workSite' },
  { label: _l('工号'), key: 'jobNumber' },
];

export default class EditCardInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contactPhone: this.props.userInfo.contactPhone,
    };
  }

  renderResult(item) {
    const { userInfo } = this.props;
    const currentItem = userInfo[item.key];
    switch (item.key) {
      case 'departmentInfos':
        return !currentItem.length ? _l('未填写') : this.getItems(currentItem, 'departmentName');
      case 'jobInfos':
        return !currentItem.length ? _l('未填写') : this.getItems(currentItem, 'jobName');
      default:
        return !currentItem ? _l('未填写') : currentItem;
    }
  }

  getItems(list, key) {
    const listInfo = list.map(item => item[key]);
    return listInfo.join(' ; ');
  }

  handleSubmit() {
    const { userInfo, updateData = () => {} } = this.props;
    if (!this.state.contactPhone) {
      alert(_l('工作电话不能为空'), 2);
      return;
    }
    account
      .editUserCardContactPhone({
        projectId: this.props.userInfo.projectId,
        contactPhone: this.state.contactPhone,
      })
      .then(result => {
        if (result) {
          this.props.closeDialog();
          alert(_l('保存成功'));
          updateData({ ...userInfo, contactPhone: this.state.contactPhone });
        } else {
          alert(_l('操作失败'), 2);
        }
      });
  }

  render() {
    const { contactPhone } = this.state;
    return (
      <div className="editEnterpriseCardInfo clearfix">
        <div className="Font17 Bold textPrimary">{_l('编辑名片')}</div>
        <div className="textTertiary mTop6">{_l('名片是您在该组织下的个人信息，只在本组织中展示。')}</div>
        <div className="mTop24">
          {userInfoList.map(item => {
            return (
              <Fragment>
                <div className="textSecondary">{item.label}</div>
                <div className="mTop6 mBottom16 textPrimary">{this.renderResult(item)}</div>
              </Fragment>
            );
          })}
          <div className="textSecondary">{_l('工作电话')}</div>
          <Input
            className="mTop6"
            placeholder={_l('工作电话')}
            value={contactPhone}
            onChange={e => this.setState({ contactPhone: e.target.value })}
          />
        </div>
        <div className="mTop32 Right">
          <span
            className="Font14 textTertiary mRight32 hoverTextPrimaryLight Hand"
            onClick={() => this.props.closeDialog()}
          >
            {_l('取消')}
          </span>
          <button type="button" className="ming Button Button--primary submitBtn" onClick={() => this.handleSubmit()}>
            {_l('确认')}
          </button>
        </div>
      </div>
    );
  }
}

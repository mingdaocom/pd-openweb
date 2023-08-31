import React from 'react';
import account from 'src/api/account';
import common from '../../common'
import { navigateTo } from 'src/router/navigateTo';
import './index.less';
import RegExp from 'src/util/expression';

export default class EditInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      baseInfo: this.props.baseInfo || {},
    };
  }

  updateValue(key, value) {
    this.setState(preState => ({
      baseInfo: {
        ...preState.baseInfo,
        [key]: value.trim(),
      },
    }));
  }

  saveBaseInfo() {
    if(this.validateContract()) {
      const { baseInfo } = this.state;
      account
        .editContactInfo(baseInfo)
        .then(data => {
          if (data) {
            alert(_l('编辑成功'), 1);
            this.props.updateValue(baseInfo);
            this.props.closeDialog();
          } else {
            alert(_l('编辑失败'), 2);
          }
        })
        .fail();
    }
  }

  //验证
  validateContract() {
    const { baseInfo } = this.state
    if (baseInfo.snsLinkedin !== '' && !RegExp.isUrl(baseInfo.snsLinkedin)) {
      alert(_l('LinkedIn输入不正确,请输入有效的URL'), 3);
      return false;
    }
    if (baseInfo.snsSina !== '' && !RegExp.isUrl(baseInfo.snsSina)) {
      alert(_l('新浪微博主页输入不正确,请输入有效的URL'), 3);
      return false;
    }
    return true
  }

  render() {
    const { baseInfo } = this.state;
    return (
      <div className="baseInfoEditContent Gray">
        <div className="Gray_9e mBottom24">
          {_l('邮箱和手机设置请到 ')}
          <span className="ThemeColor3 Hover_49 Hand" onClick={() => {
            this.props.closeDialog();
            navigateTo(common.url({ type: 'account' }));
          }}>
            {_l('账户与隐私')}
          </span>
          {_l(' 页面设置')}
        </div>
        {/**微信 */}
        <div className="Bold">{_l('微信')}</div>
        <input
          type="text"
          placeholder={_l('微信账号')}
          className="mTop6 mBottom24 formControl"
          value={baseInfo.weiXin}
          onChange={e => {
            this.updateValue('weiXin', e.target.value);
          }}
        />
        {/**LinkedIn */}
        <div className="Bold">{_l('LinkedIn')}</div>
        <input
          type="text"
          placeholder={_l('linkedln个人页面地址')}
          className="mTop6 mBottom24 formControl"
          value={baseInfo.snsLinkedin}
          onChange={e => {
            this.updateValue('snsLinkedin', e.target.value);
          }}
        />
        {/**微博 */}
        <div className="Bold">{_l('微博')}</div>
        <input
          type="text"
          placeholder={_l('微博个人页面地址')}
          className="mTop6 mBottom24 formControl"
          value={baseInfo.snsSina}
          onChange={e => {
            this.updateValue('snsSina', e.target.value);
          }}
        />
        <div className="mTop20 flexEnd mBottom24">
          <button
            type="button"
            className="ming Button Button--link Gray_9e mRight30"
            onClick={() => this.props.closeDialog()}>
            {_l('取消')}
          </button>
          <button type="button" className="ming Button Button--primary saveBtn" onClick={() => this.saveBaseInfo()}>
            {_l('确认')}
          </button>
        </div>
      </div>
    );
  }
}

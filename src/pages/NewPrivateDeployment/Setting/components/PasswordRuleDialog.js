import React, { Component, Fragment } from 'react';
import { Dialog, Input } from 'ming-ui';

export default class PasswordRuleDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      passwordRegex: '',
      passwordRegexTip: '',
    };
  }
  componentWillReceiveProps(nextProps) {
    if (!_.isEmpty(nextProps.config)) {
      this.setState({
        ...nextProps.config,
      });
    }
  }
  render() {
    const { visible, onCancel, onSave } = this.props;
    const { passwordRegex, passwordRegexTip } = this.state;
    return (
      <Dialog
        visible={visible}
        title={_l('密码规则设置')}
        okText={_l('保存')}
        onOk={() => {
          if (_.isEmpty(passwordRegex)) {
            alert(_l('密码规则不能为空'), 3);
            return
          }
          if (_.isEmpty(passwordRegexTip)) {
            alert(_l('密码规则提示说明不能为空'), 3);
            return
          }
          onSave({
            passwordRegex,
            passwordRegexTip
          });
          onCancel();
        }}
        onCancel={onCancel}
      >
        <div className="mTop5 mBottom20">
          <div className="mBottom5">{_l('密码规则（正则表达式）')}</div>
          <Input className="w100" value={passwordRegex} onChange={value => { this.setState({ passwordRegex: value }) }} placeholder={_l('请输入密码正则表达式')}/>
        </div>
        <div>
          <div className="mBottom5">{_l('提示说明')}</div>
          <Input className="w100" value={passwordRegexTip} onChange={value => { this.setState({ passwordRegexTip: value }) }} placeholder={_l('请输入密码正则表达式说明文字')}/>
        </div>
      </Dialog>
    );
  }
}

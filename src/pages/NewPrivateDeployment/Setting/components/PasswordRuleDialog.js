import React, { Component, Fragment } from 'react';
import { Dialog, Input, Textarea } from 'ming-ui';
import _ from 'lodash';
import OrgNameMultipleLanguages from 'src/pages/Admin/components/OrgNameMultipleLanguages';
import styled from 'styled-components';

const Wrap = styled.div`
  .passWordLanguages {
    position: absolute;
    right: 10px;
    line-height: 36px;
  }
`;
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
            return;
          }
          if (_.isEmpty(passwordRegexTip)) {
            alert(_l('密码规则提示说明不能为空'), 3);
            return;
          }
          onSave({
            passwordRegex,
            passwordRegexTip,
          });
          onCancel();
        }}
        onCancel={onCancel}
      >
        <div className="mTop5 mBottom20">
          <div className="mBottom5">{_l('密码规则（正则表达式）')}</div>
          <Wrap>
            <Input
              className="w100"
              value={passwordRegex}
              onChange={value => {
                this.setState({ passwordRegex: value });
              }}
              placeholder={_l('请输入密码正则表达式')}
            />
          </Wrap>
        </div>
        <Wrap className="Relative">
          <div className="mBottom5">{_l('提示说明')}</div>
          <Textarea
            className={'w100 pRight40 pTop6 pBottom6'}
            minHeight={36}
            maxHeight={120}
            defaultValue={passwordRegexTip || ''}
            placeholder={_l('请输入密码正则表达式说明文字')}
            onChange={value => {
              this.setState({ passwordRegexTip: value });
            }}
          />
          <OrgNameMultipleLanguages
            className="passWordLanguages"
            type={30}
            currentLangName={passwordRegexTip}
            updateName={data => {
              if (data) {
                md.global.SysSettings.passwordRegexTip = _.get(data, 'data[0].value');
              }
            }}
          />
        </Wrap>
      </Dialog>
    );
  }
}

import React, { Component } from 'react';
import { Dialog, Input, Textarea, Switch } from 'ming-ui';
import { Select } from 'antd';
import projectEncryptAjax from 'src/api/projectEncrypt';
import { getUnUniqName } from 'src/util';
import _ from 'lodash';
import styled from 'styled-components';
import moment from 'moment';

const FormItem = styled.div`
  margin-bottom: 30px;
  &.flex3 {
    flex: 3;
  }
  &.flex2 {
    flex: 2;
    padding-left: 40px;
  }
  &.lastFormItem {
    margin-bottom: 0;
  }
  .w72 {
    width: 72px;
  }
  .required {
    position: absolute;
    left: -8px;
    top: 3px;
    color: #f44336;
  }
  .ming.Input {
    height: 34px;
    border: 1px solid #eaeaea;
    border-radius: 4px;
  }
  .ming.Textarea {
    padding: 16px 15px;
    &.keyTextarea {
      min-height: 120px !important;
    }
    &.ivTextarea {
      min-height: 60px !important;
    }
    &.remarkTextarea {
      min-height: 85px !important;
      padding: 8px 12px !important;
    }
  }
  .ming.Textarea:hover:not(:disabled),
  .ming.Textarea:focus,
  .ming.Textarea,
  .ming.Input:hover,
  .ming.Input:focus {
    border: 1px solid #eaeaea;
  }
`;
const errors = { 0: _l('新建失败'), 3: _l('名称重复'), 21: _l('Key无效'), 22: _l('IV无效 ') };

const { Option } = Select;
export default class AddEditRulesDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      encryptWay: 1,
      status: 1,
      errors: {},
      ruleName: '',
    };
  }
  componentDidMount() {
    this.handleDefaultRuleName();
  }

  changeForm = (form, value) => {
    if (form === 'encryptWay') {
      const length = value === 2 ? 24 : value === 3 ? 32 : 16;
      this.setState(
        { [form]: value, key: !!this.state.key ? this.state.key.slice(0, length) : this.state.key },
        this.handleDefaultRuleName,
      );
    } else {
      this.setState({ [form]: value });
    }
  };

  onOk = () => {
    const { projectId } = this.props;
    const { encryptWay, status, ruleName, key, iv, remark } = this.state;
    if (!_.trim(ruleName)) {
      return alert(_l('规则名称不能为空'), 2);
    }
    if (!_.trim(key)) {
      return alert(_l('Key不能为空'), 2);
    }
    if (!_.trim(iv)) {
      return alert(_l('IV不能为空'), 2);
    }

    projectEncryptAjax
      .addEncryptRule({
        projectId,
        addEncryptRule: {
          name: _.trim(ruleName),
          type: encryptWay,
          remark: _.trim(remark),
          key: _.trim(key),
          iv: _.trim(iv),
          state: status,
        },
      })
      .then(res => {
        if (res.code === 1) {
          alert(_l('新建成功'));
          this.props.getDataList();
          this.props.onCancel();
        } else {
          alert(errors[res.code] || _l('新建失败'), 2);
        }
      });
  };

  handleDefaultRuleName = () => {
    const { encryptList = [], ruleList } = this.props;
    const { encryptWay } = this.state;
    let wayLable = _.get(_.find(encryptList, it => it.value === encryptWay) || {}, 'label') + '_';
    let ruleName = getUnUniqName(ruleList, wayLable + _l('规则名称1'), 'name');
    this.setState({ ruleName });
  };

  render() {
    const { visible, onCancel, encryptList = [] } = this.props;
    const { status, encryptWay, ruleName, iv, key, remark } = this.state;

    return (
      <Dialog
        width={560}
        className="addEditRuleDialog"
        visible={visible}
        title={_l('新建加密规则')}
        onCancel={onCancel}
        okText={_l('新建')}
        onOk={this.onOk}
      >
        <div className="flexRow">
          <FormItem className="flex3">
            <div className="bold mBottom10">{_l('加密方式')}</div>
            <Select
              className="w100 mdAntSelect"
              value={encryptWay}
              onChange={val => this.changeForm('encryptWay', val)}
            >
              {encryptList
                .filter(it => it.value)
                .map(it => (
                  <Option key={it.value} value={it.value}>
                    {it.label}
                  </Option>
                ))}
            </Select>
          </FormItem>
          <FormItem className="flex2">
            <div className="bold mBottom10">{_l('状态')}</div>
            <Switch
              className="w72"
              checked={status === 1}
              text={status ? _l('启用') : _l('停用')}
              onClick={checked => this.changeForm('status', checked ? 2 : 1)}
            />
          </FormItem>
        </div>
        <FormItem>
          <div className="bold mBottom10">{_l('规则名称')}</div>
          <Input
            className="w100"
            maxLength={50}
            value={ruleName}
            placeholder={_l('请输入')}
            onChange={val => this.changeForm('ruleName', val)}
          />
        </FormItem>
        <FormItem>
          <div className="bold mBottom10 Relative">
            <spam className="required">*</spam>
            Key
          </div>
          <Input
            className="keyTextarea w100"
            placeholder={_l('请输入%0位字符', encryptWay === 2 ? 24 : encryptWay === 3 ? 32 : 16)}
            maxLength={encryptWay === 2 ? 24 : encryptWay === 3 ? 32 : 16}
            value={key}
            onChange={val => {
              val = val.replace(/[\u4e00-\u9fa5]/gi, '');
              this.changeForm('key', val);
            }}
          />
        </FormItem>
        <FormItem>
          <div className="bold mBottom10 Relative">
            <spam className="required">*</spam>
            IV
          </div>
          <Input
            className="ivTextarea w100"
            placeholder={_l('请输入16位字符')}
            maxLength={16}
            value={iv}
            onChange={val => {
              val = val.replace(/[\u4e00-\u9fa5]/gi, '');
              this.changeForm('iv', val);
            }}
          />
        </FormItem>
        <FormItem className="lastFormItem">
          <div className="bold mBottom10">{_l('备注')}</div>
          <Textarea
            className="remarkTextarea"
            placeholder={_l('请输入')}
            value={remark}
            maxLength={200}
            onChange={val => this.changeForm('remark', val)}
          />
        </FormItem>
      </Dialog>
    );
  }
}

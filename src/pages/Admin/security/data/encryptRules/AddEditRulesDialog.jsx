import React, { Component } from 'react';
import { Select } from 'antd';
import _ from 'lodash';
import styled from 'styled-components';
import { Dialog, Input, Switch, Textarea } from 'ming-ui';
import projectEncryptAjax from 'src/api/projectEncrypt';
import { getUnUniqName } from 'src/utils/common';

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
const errors = { 0: _l('新建失败'), 3: _l('名称重复'), 21: _l('Key无效'), 22: _l('IV无效') };

const { Option } = Select;
export default class AddEditRulesDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      encryptWay: 1,
      status: 1,
      errors: {},
      ruleName: '',
      cipherMode: 1,
    };
  }
  componentDidMount() {
    this.handleDefaultRuleName();
  }

  changeForm = (form, value) => {
    if (form === 'encryptWay') {
      const length = value === 2 ? 24 : _.includes([3, 50], value) ? 32 : 16;
      this.setState(
        {
          [form]: value,
          key: this.state.key ? this.state.key.slice(0, length) : this.state.key,
          padding: value === 50 ? 2 : undefined,
          encodeMode: form === 'encryptWay' && value === 50 ? 20 : undefined,
        },
        this.handleDefaultRuleName,
      );
    } else {
      this.setState({ [form]: value });
    }
  };

  onOk = () => {
    const { projectId } = this.props;
    const { encryptWay, status, ruleName, key, iv, remark, cipherMode, padding, encodeMode } = this.state;
    if (!_.trim(ruleName)) {
      return alert(_l('规则名称不能为空'), 2);
    }
    if (!_.trim(key)) {
      return alert(_l('Key不能为空'), 2);
    }
    if (!_.trim(iv) && (encryptWay !== 50 || (encryptWay === 50 && cipherMode === 1))) {
      return alert(_l('IV不能为空'), 2);
    }

    const keyCharacterNum = encryptWay === 2 ? 24 : _.includes([3, 50], encryptWay) ? 32 : 16;
    const ivCharacterNum = encryptWay === 50 ? 32 : 16;

    if (_.trim(key).length !== keyCharacterNum) {
      return alert(_l('请输入%0位字符的密钥(Key)', keyCharacterNum), 2);
    }

    if (_.trim(iv).length !== ivCharacterNum && (encryptWay !== 50 || (encryptWay === 50 && cipherMode === 1))) {
      return alert(_l('请输入%0位字符的向量(IV)', ivCharacterNum), 2);
    }

    let addEncryptRuleParams = {
      name: _.trim(ruleName),
      type: encryptWay,
      remark: _.trim(remark),
      key: _.trim(key),
      iv: encryptWay !== 50 || (encryptWay === 50 && cipherMode === 1) ? _.trim(iv) : undefined,
      state: status,
    };

    if (encryptWay === 50) {
      addEncryptRuleParams.cipherMode = cipherMode;
      addEncryptRuleParams.encodeMode = encodeMode;
      if (cipherMode === 1) {
        addEncryptRuleParams.padding = padding;
      }
    }

    projectEncryptAjax
      .addEncryptRule({
        projectId,
        addEncryptRule: addEncryptRuleParams,
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
    const { status, encryptWay, ruleName, iv, key, remark, cipherMode, padding, encodeMode } = this.state;

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
        {encryptWay === 50 && (
          <div className="flexRow">
            <FormItem className="flex mRight10">
              <div className="bold mBottom10">{_l('工作模式')}</div>
              <Select
                className="w100 mdAntSelect"
                value={cipherMode}
                onChange={val => this.changeForm('cipherMode', val)}
                placeholder={_l('请选择')}
              >
                {[
                  { value: 1, label: 'CBC' },
                  { value: 2, label: 'ECB' },
                ].map(it => (
                  <Option key={it.value} value={it.value}>
                    {it.label}
                  </Option>
                ))}
              </Select>
            </FormItem>
            {cipherMode === 1 && (
              <FormItem className="flex mLeft10">
                <div className="bold mBottom10">{_l('填充模式')}</div>
                <Select
                  className="w100 mdAntSelect"
                  value={padding}
                  onChange={val => this.changeForm('padding', val)}
                  placeholder={_l('请选择')}
                  disabled={true}
                >
                  {[
                    { value: 1, label: 'NoPadding' },
                    { value: 2, label: 'PKCS7/PKCS5' },
                  ].map(it => (
                    <Option key={it.value} value={it.value}>
                      {it.label}
                    </Option>
                  ))}
                </Select>
              </FormItem>
            )}
          </div>
        )}

        <FormItem>
          <div className="bold mBottom10 Relative">
            <spam className="required">*</spam>
            {_l('密钥')}(Key)
          </div>
          <Input
            className="keyTextarea w100"
            placeholder={_l('请输入%0位字符', encryptWay === 2 ? 24 : _.includes([3, 50], encryptWay) ? 32 : 16)}
            maxLength={encryptWay === 2 ? 24 : _.includes([3, 50], encryptWay) ? 32 : 16}
            value={key}
            onChange={val => {
              val = val.replace(/[\u4e00-\u9fa5]/gi, '');
              this.changeForm('key', val);
            }}
          />
        </FormItem>
        {(encryptWay === 50 ? cipherMode === 1 : true) && (
          <FormItem>
            <div className="bold mBottom10 Relative">
              <spam className="required">*</spam>
              {_l('向量')}(IV)
            </div>
            <Input
              className="ivTextarea w100"
              placeholder={_l('请输入%0位字符', encryptWay === 50 ? 32 : 16)}
              maxLength={encryptWay === 50 ? 32 : 16}
              value={iv}
              onChange={val => {
                val = val.replace(/[\u4e00-\u9fa5]/gi, '');
                this.changeForm('iv', val);
              }}
            />
          </FormItem>
        )}
        {encryptWay === 50 && (
          <FormItem>
            <div className="bold mBottom10">{_l('输出格式')}</div>
            <Select
              defaultValue={20}
              className="w100 mdAntSelect"
              value={encodeMode}
              onChange={val => this.changeForm('encodeMode', val)}
              placeholder={_l('请选择')}
            >
              {[
                { value: 10, label: 'Hex' },
                { value: 20, label: 'Base64' },
              ].map(it => (
                <Option key={it.value} value={it.value}>
                  {it.label}
                </Option>
              ))}
            </Select>
          </FormItem>
        )}
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

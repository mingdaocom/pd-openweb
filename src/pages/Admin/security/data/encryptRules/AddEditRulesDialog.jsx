import React, { Component, Fragment } from 'react';
import { Select } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Button, Dialog, Input, Support, Switch, Textarea } from 'ming-ui';
import projectEncryptAjax from 'src/api/projectEncrypt';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import { getUnUniqName } from 'src/utils/common';
import { VersionProductType } from 'src/utils/enum';
import { getFeatureStatus } from 'src/utils/project';
import { encryptList } from './constant';

const FormItem = styled.div`
  margin-bottom: 30px;
  position: relative;
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
    color: var(--color-error);
  }
  .ming.Input {
    height: 34px;
    border: 1px solid var(--color-border-secondary);
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
    border: 1px solid var(--color-border-secondary);
  }
`;
const errors = {
  0: _l('新建失败'),
  3: _l('名称重复'),
  21: _l('Key无效'),
  22: _l('IV无效'),
  23: _l('连接测试成功才可保存'),
};

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
    const { projectId } = this.props;

    if (form === 'encryptWay') {
      const length = value === 2 ? 24 : _.includes([3, 50], value) ? 32 : 16;
      const featureType = getFeatureStatus(projectId, VersionProductType.customEncrypt);
      if (value === 1000 && featureType === '2') {
        buriedUpgradeVersionDialog(projectId, VersionProductType.customEncrypt);
        return;
      }
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
    const { projectId, type, ruleDetail, updateCurrentRow = () => {} } = this.props;
    const {
      encryptWay,
      status,
      ruleName,
      key,
      iv,
      remark,
      cipherMode,
      padding,
      encodeMode,
      encryptUrl,
      decryptUrl,
      token,
      testSuccess,
    } = this.state;
    if (!_.trim(ruleName)) {
      return alert(_l('规则名称不能为空'), 2);
    }

    if (encryptWay === 1000) {
      if (!_.trim(encryptUrl)) {
        return alert(_l('加密请求地址不能为空'), 2);
      }
      if (!_.trim(decryptUrl)) {
        return alert(_l('解密请求地址不能为空'), 2);
      }

      //  自定义规则时，未通过连接测试 点击保存提示 需要“连接测试成功才可保存”
      if (!testSuccess) {
        return alert(_l('连接测试成功才可保存'), 2);
      }
    } else {
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

    if (encryptWay === 1000) {
      addEncryptRuleParams.encryptUrl = _.trim(encryptUrl);
      addEncryptRuleParams.decryptUrl = _.trim(decryptUrl);
      addEncryptRuleParams.token = _.trim(token);
      addEncryptRuleParams.key = undefined;
      addEncryptRuleParams.iv = undefined;
    }

    const promiseRequest = type === 'edit' ? projectEncryptAjax.editEncryptRule : projectEncryptAjax.addEncryptRule;
    const params =
      type === 'edit'
        ? {
            editeEncryptRule: addEncryptRuleParams,
            encryptRuleId: ruleDetail.encryptRuleId,
          }
        : { addEncryptRule: addEncryptRuleParams };

    promiseRequest({
      projectId,
      ...params,
    }).then(res => {
      if (res.code === 1) {
        alert(type === 'edit' ? _l('保存成功') : _l('新建成功'));
        if (type === 'edit') {
          updateCurrentRow(addEncryptRuleParams);
        }
        this.props.getDataList();
        this.props.onCancel();
      } else {
        alert(errors[res.code] || _l('新建失败'), 2);
      }
    });
  };

  handleTest = () => {
    const { projectId } = this.props;
    const { ruleName, encryptWay, encryptUrl, decryptUrl, token, status, remark } = this.state;

    if (!_.trim(ruleName)) {
      return alert(_l('规则名称不能为空'), 2);
    }
    if (!_.trim(encryptUrl)) {
      return alert(_l('加密请求地址不能为空'), 2);
    }
    if (!_.trim(decryptUrl)) {
      return alert(_l('解密请求地址不能为空'), 2);
    }

    projectEncryptAjax
      .testEncryptRule({
        projectId,
        testEncryptRule: {
          name: _.trim(ruleName),
          type: encryptWay,
          encryptUrl,
          decryptUrl,
          token: _.trim(token) || '',
          status,
          remark: _.trim(remark) || '',
        },
      })
      .then(res => {
        if (res.code === 1) {
          alert(_l('连接测试成功'));
          this.setState({ testSuccess: true });
        } else {
          alert(_l('连接测试失败'), 2);
        }
      });

    this.setState({ testSuccess: true });
  };

  handleDefaultRuleName = () => {
    const { ruleList, type, ruleDetail = {} } = this.props;
    if (type === 'edit') {
      this.setState({ ...ruleDetail, ruleName: ruleDetail.name, encryptWay: ruleDetail.type });
      return;
    }
    const { encryptWay } = this.state;
    let wayLable = _.get(_.find(encryptList, it => it.value === encryptWay) || {}, 'label') + '_';
    let ruleName = getUnUniqName(ruleList, wayLable + _l('规则名称1'), 'name');
    this.setState({ ruleName });
  };

  render() {
    const { type, visible, projectId, onCancel } = this.props;
    const {
      status,
      encryptWay,
      ruleName,
      iv,
      key,
      remark,
      cipherMode,
      padding,
      encodeMode,
      encryptUrl,
      decryptUrl,
      token,
    } = this.state;

    const featureType = getFeatureStatus(projectId, VersionProductType.customEncrypt);

    return (
      <Dialog
        width={580}
        className="addEditRuleDialog"
        visible={visible}
        title={type === 'edit' ? _l('编辑加密规则') : _l('新建加密规则')}
        onCancel={onCancel}
        footer={
          <div className="flexRow alignItemsCenter">
            {encryptWay === 1000 && (
              <div className="ThemeColor3 ThemeHoverColor2 Hand" onClick={this.handleTest}>
                {_l('连接测试')}
              </div>
            )}
            <div className="flex"></div>
            <Button type="link" onClick={onCancel}>
              {_l('取消')}
            </Button>
            <Button type="primary" onClick={this.onOk}>
              {type === 'edit' ? _l('保存') : _l('新建')}
            </Button>
          </div>
        }
      >
        <div className="flexRow">
          <FormItem className={cx('flex3', { mBottom16: encryptWay === 1000 })}>
            <div className="bold mBottom10">{_l('加密方式')}</div>
            <Select
              className="w100 mdAntSelect"
              value={encryptWay}
              onChange={val => this.changeForm('encryptWay', val)}
              disabled={type === 'edit'}
            >
              {encryptList
                .filter(it => it.value && ((!featureType && it.value !== 1000) || featureType))
                .map(it => (
                  <Option key={it.value} value={it.value}>
                    {it.label}
                  </Option>
                ))}
            </Select>
          </FormItem>
          {type === 'edit' ? (
            <FormItem className="flex2"></FormItem>
          ) : (
            <FormItem className={cx('flex2', { mBottom16: encryptWay === 1000 })}>
              <div className="bold mBottom10">{_l('状态')}</div>
              <Switch
                className="w72"
                checked={status === 1}
                text={status ? _l('启用') : _l('停用')}
                onClick={checked => this.changeForm('status', checked ? 2 : 1)}
              />
            </FormItem>
          )}
        </div>
        {encryptWay === 1000 && (
          <div className="textSecondary mBottom16">
            <span> {_l('配置加密与解密请求地址。当字段数据需要加密或解密时，将请求这些接口完成转换')}</span>
            <Support type={3} text={_l('帮助')} href="" />
          </div>
        )}
        <FormItem>
          <spam className="required">*</spam>
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

        {encryptWay !== 1000 && (
          <FormItem>
            <div className="bold mBottom10">
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
        )}

        {encryptWay !== 1000 && (encryptWay !== 50 || (encryptWay === 50 && cipherMode === 1)) && (
          <FormItem>
            <div className="bold mBottom10">
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

        {encryptWay === 1000 && (
          <Fragment>
            <FormItem>
              <spam className="required">*</spam>
              <div className="bold mBottom10">{_l('加密请求地址')}</div>
              <Input
                className="w100"
                placeholder={_l('请输入')}
                value={encryptUrl}
                onChange={val => {
                  this.changeForm('encryptUrl', val);
                }}
              />
            </FormItem>
            <FormItem>
              <spam className="required">*</spam>
              <div className="bold mBottom10">{_l('解密请求地址')}</div>
              <Input
                className="w100"
                placeholder={_l('请输入')}
                value={decryptUrl}
                onChange={val => {
                  this.changeForm('decryptUrl', val);
                }}
              />
            </FormItem>
            <FormItem>
              <div className="bold mBottom10">{_l('Token')}</div>
              <Input
                className="w100"
                placeholder={_l('请输入')}
                value={token}
                onChange={val => {
                  this.changeForm('token', val.replace(/[^\x00-\x7F]/g, ''));
                }}
              />
            </FormItem>
          </Fragment>
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

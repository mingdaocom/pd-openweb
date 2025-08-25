import React, { Component, createRef, useEffect, useState } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { Dialog, Icon, Input, Textarea, Tooltip } from 'ming-ui';
import projectEncryptAjax from 'src/api/projectEncrypt';
import { encryptList } from './constant';

const BaseInfoWrap = styled(Dialog)`
  .ming.Input {
    height: 34px;
    border: 1px solid #eaeaea;
    background: #fff;
    border-radius: 4px;
  }
  .ming.Textarea {
    border: 1px solid #eaeaea;
  }
  .ming.Input:hover,
  .ming.Input:focus,
  .ming.Textarea:hover:not(:disabled),
  .ming.Textarea:focus {
    border-color: #eaeaea;
  }
`;

const Wrap = styled.div`
  width: 100%;
  color: #757575;
  font-size: 13px;
  padding: 20px 20px 0;
  .keyInfo {
    white-space: pre-wrap;
    word-break: break-word;
    -webkit-line-clamp: 2;
  }
`;

const errors = { 0: _l('保存失败'), 3: _l('名称重复'), 21: _l('Key无效'), 22: _l('IV无效') };

const handleMask = (val, isMask) => {
  if (!val) return;
  if (!isMask) return val;

  let arr = val.split('');
  let result = arr.map((it, index) => {
    if (index < 4 || index > arr.length - 5) {
      return it;
    }
    return '*';
  });

  return result.join('');
};

function EditBaseInfo(props) {
  const { visible, onCancel, ruleDetail = {}, projectId, getDetail = () => {}, updateCurrentRow = () => {} } = props;
  const [ruleName, setRuleName] = useState(ruleDetail.name);
  const [remark, setRemark] = useState(ruleDetail.remark);
  const ruleNameInput = createRef();

  useEffect(() => {
    if (ruleNameInput && ruleNameInput.current) {
      ruleNameInput.current.focus();
    }
    setRuleName(ruleDetail.name);
  }, [ruleDetail.name]);

  useEffect(() => {
    setRemark(ruleDetail.remark);
  }, [ruleDetail.remark]);

  return (
    <BaseInfoWrap
      title={_l('修改信息')}
      visible={visible}
      onCancel={onCancel}
      okText={_l('保存')}
      onOk={() => {
        projectEncryptAjax
          .editEncryptRule({
            projectId,
            encryptRuleId: ruleDetail.encryptRuleId,
            editeEncryptRule: {
              name: ruleName,
              remark: remark || '',
            },
          })
          .then(res => {
            if (res.code === 1) {
              alert(_l('保存成功'));
              updateCurrentRow({ name: ruleName, remark: remark || '' });
              getDetail();
              onCancel();
            } else {
              alert(errors[res.code] || _l('保存失败'), 2);
            }
          });
      }}
    >
      <div className="bold mBottom10">{_l('规则名称')}</div>
      <Input
        manualRef={ruleNameInput}
        className="mBottom30 w100"
        maxLength={50}
        value={ruleName}
        placeholder={_l('请输入')}
        onChange={val => setRuleName(val)}
        disabled={ruleDetail.isDefault}
      />
      <div className="bold mBottom10">{_l('备注')}</div>
      <Textarea
        className="remarkTextarea"
        placeholder={_l('请输入')}
        maxLength={200}
        value={remark}
        onChange={val => setRemark(val)}
      />
    </BaseInfoWrap>
  );
}

export default class EncryptBaseInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      maskKey: true,
      maskIv: true,
    };
  }
  componentDidMount() {
    if (this.props.ruleDetail) {
      this.setState({ ruleDetail: this.props.ruleDetail });
    } else {
      this.getDetail();
    }
  }
  getDetail = () => {
    projectEncryptAjax
      .getEncryptRule({
        projectId: this.props.projectId,
        encryptRuleId: this.props.encryptRuleId,
      })
      .then(res => {
        this.setState({ ruleDetail: res.encryptRule });
      });
  };
  render() {
    const { showEditBaseInfo, ruleDetail = {}, maskIv, maskKey } = this.state;
    const { projectId } = this.props;

    return (
      <Wrap>
        <div className="encryptWay">
          <span className="Font17 bold mRight6 Gray">{ruleDetail.name}</span>
          {!ruleDetail.isSystem && (
            <Icon icon="edit" className="Gray_bd Hand" onClick={() => this.setState({ showEditBaseInfo: true })} />
          )}
        </div>
        <div className="mBottom30 ellipsis" title={ruleDetail.remark}>
          {ruleDetail.remark}
        </div>
        <div>{_l('加密方式')}</div>
        <div className="Gray mBottom30">
          {_.get(_.find(encryptList, it => it.value === ruleDetail.type) || {}, 'label')}
        </div>
        <div>Key</div>
        <div className="Gray mBottom30 keyInfo">
          {handleMask(ruleDetail.key, maskKey)}
          <Tooltip text={maskKey ? _l('解码') : _l('掩码')}>
            <i
              className={`icon Font14 Gray_bd mLeft10 ${maskKey ? 'icon-eye_off' : 'icon-eye'}`}
              onClick={() => this.setState({ maskKey: !maskKey })}
            ></i>
          </Tooltip>
        </div>
        <div>IV</div>
        <div className="Gray mBottom30">
          {handleMask(ruleDetail.iv, maskIv)}
          <Tooltip text={maskIv ? _l('解码') : _l('掩码')}>
            <i
              className={`icon Font14 Gray_bd mLeft10 ${maskIv ? 'icon-eye_off' : 'icon-eye'}`}
              onClick={() => this.setState({ maskIv: !maskIv })}
            ></i>
          </Tooltip>
        </div>

        <EditBaseInfo
          visible={showEditBaseInfo}
          projectId={projectId}
          ruleDetail={ruleDetail}
          updateCurrentRow={this.props.updateCurrentRow}
          getDetail={this.getDetail}
          onCancel={() => this.setState({ showEditBaseInfo: false })}
        />
      </Wrap>
    );
  }
}

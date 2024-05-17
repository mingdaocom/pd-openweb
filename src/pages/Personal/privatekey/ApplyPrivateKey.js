import React, { Component, Fragment } from 'react';
import { Icon, Input, Button, Dropdown, RadioGroup } from 'ming-ui';
import privateGuide from 'src/api/privateGuide';
import { getRequest } from 'src/util';
import _ from 'lodash';

export default class ApplyPrivateKey extends Component {
  constructor(props) {
    super(props);
    const request = getRequest();
    this.state = {
      serverId: request.serverId,
      channel: request.channel || '',
      licenseTemplateVersion: request.ltv || '',
      projectName: '',
      job: '',
      scaleId: 1,
      licenseVersion: 0,
    };
  }

  handleGenerateKey = event => {
    const { serverId, channel, licenseTemplateVersion, projectName, scaleId, job, licenseVersion } = this.state;

    if (_.isEmpty(serverId)) {
      alert(_l('请输入服务器 ID'), 3);
      return;
    }

    if (_.isEmpty(projectName)) {
      alert(_l('请输入组织名称'), 3);
      return;
    }

    if (_.isEmpty(job)) {
      alert(_l('请输入职位'), 3);
      return;
    }

    privateGuide
      .applyLicenseCode(
        {
          serverId,
          channel,
          licenseTemplateVersion,
          projectName,
          job,
          scaleId,
          licenseVersion,
        },
        { silent: true },
      )
      .then(result => {
        if (result) {
          alert(_l('密钥申请成功，请复制后去申请页面填写'));
          this.props.onClose(event, result);
        } else {
          alert(_l('密钥申请失败'), 2);
        }
      })
      .catch(({ errorMessage }) => {
        if (errorMessage === 'community exists' || errorMessage === 'professional trial exists') {
          alert(_l('密钥申请失败，该服务器ID已申请过密钥'), 2);
        } else {
          alert(_l('密钥申请失败'), 2);
        }
      });
  };

  render() {
    const { serverId, projectName, job, scaleId, seconds, licenseVersion } = this.state;
    const privateVersion = getRequest().v;
    let showVersion = privateVersion && parseFloat(privateVersion) >= 5.3;
    const dataArr = [
      {
        value: 1,
        text: _l('10人以下'),
      },
      {
        value: 2,
        text: _l('10～50人'),
      },
      {
        value: 3,
        text: _l('51～100人'),
      },
      {
        value: 4,
        text: _l('101～250人'),
      },
      {
        value: 5,
        text: _l('251～500人'),
      },
      {
        value: 6,
        text: _l('501人及以上'),
      },
    ];

    return (
      <Fragment>
        <span className="flexRow valignWrapper Gray_75 pointer" onClick={this.props.onClose}>
          <Icon icon="backspace" className="mRight3 Font20" />
          {_l('返回')}
        </span>
        <div className="applyForm">
          <div className="Bold Font28 mBottom30">{_l('密钥申请')}</div>
          <div className="formItem">
            <div className="Font14 Bold mBottom5">{_l('服务器 ID')}</div>
            <div className="mTop16 mBottom24 Gray_75">{serverId}</div>
          </div>
          <div className="formItem">
            <div className="Font14 Bold mBottom5">{_l('组织名称')}</div>
            <Input
              value={projectName}
              onChange={value => {
                this.setState({ projectName: value });
              }}
            />
          </div>
          <div className="formItem">
            <div className="Font14 Bold mBottom5">{_l('职位')}</div>
            <Input
              value={job}
              onChange={value => {
                this.setState({ job: value });
              }}
            />
          </div>
          <div className="formItem">
            <div className="Font14 Bold mBottom5">{_l('预计使用人数')}</div>
            <Dropdown data={dataArr} value={scaleId} border onChange={scaleId => this.setState({ scaleId })} />
          </div>
          {showVersion && (
            <div className="formItem">
              <div className="Font14 Bold mBottom10">{_l('版本')}</div>
              <RadioGroup
                radioItemClassName="mBottom10"
                checkedValue={licenseVersion}
                data={[
                  { text: _l('社区版'), value: 0 },
                  { text: _l('专业版试用（有效期30天，每个服务器ID可申请1次）'), value: 5 },
                ]}
                vertical
                onChange={value => {
                  this.setState({ licenseVersion: value });
                }}
              />
            </div>
          )}
          <Button className="generateKey" type="primary" size="large" onClick={this.handleGenerateKey}>
            {_l('生成密钥')}
          </Button>
          <div className="mTop16 Gray_75">
            {_l('点击生成即代表您同意')}
            <a href="https://docs.pd.mingdao.com/agreement" target="_blank">
              {_l('《使用协议》')}
            </a>
          </div>
        </div>
      </Fragment>
    );
  }
}

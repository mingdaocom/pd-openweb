import React, { Component } from 'react';
import Dialog from 'ming-ui/components/Dialog/Dialog';
import classNames from 'classnames';
import projectController from 'src/api/project';
import fixedDataAjax from 'src/api/fixedData.js';
import './common.less';
import _ from 'lodash';

const dialogTitle = {
  1: _l('修改组织名称'),
};

const checkFuncs = {
  companyDisplayName: companyDisplayName => {
    if ($.trim(companyDisplayName) === '') {
      return {
        msg: _l('企业简称不能为空'),
      };
    }
  },
  companyName: companyName => {
    if ($.trim(companyName) === '') {
      return {
        msg: _l('企业全称不能为空'),
      };
    }
  },
};

export default class SetInfoDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: true,
      title: '',
      companyDisplayName: this.props.companyDisplayName,
      companyName: this.props.companyName,
      companyNameEnglish: this.props.companyNameEnglish,
      errors: {},
      industryId: this.props.industryId,
      geographyId: this.props.geographyId,
    };
  }

  componentDidMount() {
    this.setState({
      title: dialogTitle[this.props.visibleType],
    });
  }

  // 名称设置
  handleFieldBlur(field) {
    let { errors = {} } = this.state;
    const value = this.state[field];
    const checkResult = checkFuncs[field](value);
    if (checkResult) {
      errors[field] = checkResult;
      this.setState({
        errors: errors,
      });
    }
    fixedDataAjax.checkSensitive({ content: value }).then(res => {
      if (res) {
        this.setState({
          errors: { ...errors, [field]: _l('输入内容包含敏感词，请重新填写') },
        });
      }
    });
  }

  handleFieldInput(field, e) {
    this.setState({
      [field]: e.target.value,
    });
  }

  clearError(field) {
    const { errors } = this.state;
    delete errors[field];
    this.setState({ errors });
  }

  renderOrgName = () => {
    const { errors, companyDisplayName, companyName, companyNameEnglish } = this.state;
    return (
      <div className="org-name-form">
        <div className="formGroup">
          <span className="formLabel">
            {_l('简称')}
            <span className="TxtMiddle Red">*</span>
          </span>
          <div className="formDescribe">{_l('用于网站页头的显示，请尽量简短')}</div>
          <input
            type="text"
            className={classNames('formControl', { error: errors.companyDisplayName && errors.companyDisplayName.msg })}
            defaultValue={companyDisplayName}
            onChange={this.handleFieldInput.bind(this, 'companyDisplayName')}
            onBlur={this.handleFieldBlur.bind(this, 'companyDisplayName')}
            onFocus={this.clearError.bind(this, 'companyDisplayName')}
          />
          <div
            className={classNames('Block Red errorBox', {
              Hidden: errors.companyDisplayName && errors.companyDisplayName.msg,
            })}
          >
            {errors.companyDisplayName && errors.companyDisplayName.msg}
          </div>
        </div>
        <div className="formGroup">
          <span className="formLabel">
            {_l('全称')}
            <span className="TxtMiddle Red">*</span>
          </span>
          <div className="formDescribe">{_l('用于账单和发票抬头，请确保准确')}</div>
          <input
            type="text"
            className={classNames('formControl', { error: errors.companyName && errors.companyName.msg })}
            defaultValue={companyName}
            onChange={this.handleFieldInput.bind(this, 'companyName')}
            onBlur={this.handleFieldBlur.bind(this, 'companyName')}
            onFocus={this.clearError.bind(this, 'companyName')}
          />
          <div
            className={classNames('Block Red errorBox', {
              Hidden: errors.companyName && errors.companyName.msg,
            })}
          >
            {errors.companyName && errors.companyName.msg}
          </div>
        </div>
        <div className="formGroup">
          <span className="formLabel">{_l('英文全称')}</span>
          <input
            type="text"
            className="formControl"
            defaultValue={companyNameEnglish}
            onChange={this.handleFieldInput.bind(this, 'companyNameEnglish')}
          />
        </div>
      </div>
    );
  };

  // 公共
  handleFieldSubmit() {
    if (this.state.errors && _.keys(this.state.errors).length) {
      return;
    }
    const { companyDisplayName, companyNameEnglish, companyName, industryId, geographyId } = this.state;
    Promise.all([
      fixedDataAjax.checkSensitive({ content: companyDisplayName }),
      fixedDataAjax.checkSensitive({ content: companyName }),
    ]).then(results => {
      if (!results.find(result => result)) {
        projectController
          .setProjectInfo({
            companyName,
            companyDisplayName,
            companyNameEnglish,
            industryId,
            geographyId,
            projectId: this.props.projectId,
          })
          .then(data => {
            if (data == 0) {
              alert(_l('设置失败'), 2);
            } else if (data == 1) {
              this.props.updateValue({
                companyDisplayName,
                companyNameEnglish,
                companyName,
                industryId,
                geographyId,
              });
              alert(_l('设置成功'));
            } else if (data == 3) {
              alert(_l('您输入的信息含有禁用词汇'), 3);
            }
          });
      } else {
        alert(_l('输入内容包含敏感词，请重新填写'), 3);
      }
    });
  }

  renderBodyContent() {
    switch (this.props.visibleType) {
      case 1:
        return this.renderOrgName();
    }
  }

  hideDialog() {
    this.setState(
      {
        visible: false,
      },
      () => {
        this.props.updateValue({ visibleType: 0 });
      },
    );
  }

  render() {
    const { visible, title } = this.state;
    return (
      <Dialog
        visible={visible}
        title={<span className="Font17 Bold">{title}</span>}
        cancelText={_l('取消')}
        okText={_l('确定')}
        width="480"
        overlayClosable={false}
        onCancel={() => {
          this.hideDialog();
        }}
        onOk={() => this.handleFieldSubmit()}
      >
        {this.renderBodyContent()}
      </Dialog>
    );
  }
}

import React, { Component } from 'react';
import classNames from 'classnames';
import _ from 'lodash';
import { Dialog, Dropdown } from 'ming-ui';
import fixedDataAjax from 'src/api/fixedData';
import projectController from 'src/api/project';
import OrgNameMultipleLanguages from '../../../components/OrgNameMultipleLanguages';
import './common.less';

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
      companyDisplayName: this.props.companyDisplayName,
      companyName: this.props.companyName,
      errors: {},
      industryId: this.props.industryId,
      geographyId: this.props.geographyId,
      currentTimeZone: undefined,
      langType: window.getCurrentLangCode(),
      geoCountryRegionCode: props.geoCountryRegionCode,
      timeZone: props.timeZone,
      timeZones: [],
      regionConfigInfo: [],
      country: [],
    };
    this.searchRequest = null;
  }

  componentDidMount() {
    this.getRegionConfigInfos();
    this.getTimeZones();
  }

  // 获取时区数据
  getTimeZones() {
    const timeZones = [];
    fixedDataAjax.loadTimeZones().then(res => {
      Object.keys(res).forEach(key => {
        timeZones.push({ text: res[key], value: parseInt(key) });
      });
      this.setState({ timeZones: timeZones.sort((a, b) => a.value - b.value) });
    });
  }

  // 获取国家和地区数据
  getRegionConfigInfos(keywords) {
    if (this.searchRequest && this.searchRequest.abort) {
      this.searchRequest.abort();
    }

    this.searchRequest = fixedDataAjax.getCitysByParentID({
      langType: window.getCurrentLangCode(),
      layer: 0,
      keywords,
    });
    this.searchRequest.then(res => {
      const data = _.get(res, 'citys', []).map(l => ({ ...l, text: l.name, value: l.id }));

      this.setState({
        country: !keywords ? data : this.state.country,
        searchResultCountry: keywords ? data : [],
      });
    });
  }

  // 更改国家和地区自动获取并更改对应的时区
  getRegionConfigInfo(code) {
    fixedDataAjax
      .getRegionConfigInfos({
        code: code,
      })
      .then(res => {
        this.setState({
          regionConfigInfo: this.state.regionConfigInfo.concat(res),
          timeZone: res.timezone,
          geoCountryRegionCode: code,
        });
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
    const { errors, companyDisplayName, companyName } = this.state;
    return (
      <div className="org-name-form">
        <div className="formGroup">
          <span className="formLabel">
            {_l('组织名称')}
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
          {!!_.get(errors, 'companyName.msg') && <div className="Block Red errorBox">{errors.companyName.msg}</div>}
        </div>
        <div className="formGroup">
          <span className="formLabel">
            {_l('简称')}
            <span className="TxtMiddle Red">*</span>
          </span>
          <div className="formDescribe">{_l('用于网站页头的显示，请尽量简短')}</div>
          <div className="formControl flexRow alignItemsCenter shortName">
            <input
              type="text"
              className={classNames('flex', {
                error: errors.companyDisplayName && errors.companyDisplayName.msg,
              })}
              defaultValue={companyDisplayName}
              value={companyDisplayName}
              onChange={this.handleFieldInput.bind(this, 'companyDisplayName')}
              onBlur={this.handleFieldBlur.bind(this, 'companyDisplayName')}
              onFocus={this.clearError.bind(this, 'companyDisplayName')}
            />
            <OrgNameMultipleLanguages
              projectId={this.props.projectId}
              type={0}
              currentLangName={companyDisplayName}
              updateName={data =>
                this.props.updateValue({ companyDisplayName: _.get(data, 'data[0].value'), visibleType: 1 })
              }
            />
          </div>
          {!!_.get(errors, 'companyDisplayName.msg') && (
            <div className="Block Red errorBox">{errors.companyDisplayName.msg}</div>
          )}
        </div>
      </div>
    );
  };

  // 公共
  handleFieldSubmit() {
    if (this.state.errors && _.keys(this.state.errors).length) {
      return;
    }
    const {
      companyDisplayName,
      companyName,
      industryId,
      geographyId,
      geoCountryRegionCode,
      timeZone,
      timeZones,
      country,
    } = this.state;
    Promise.all([
      fixedDataAjax.checkSensitive({ content: companyDisplayName }),
      fixedDataAjax.checkSensitive({ content: companyName }),
    ]).then(results => {
      if (!results.find(result => result)) {
        const { projectId } = this.props;

        projectController
          .setProjectInfo({
            companyName,
            companyDisplayName,
            industryId,
            geographyId,
            projectId,
            geoCountryRegionCode,
            timeZone: String(timeZone),
          })
          .then(data => {
            if (data == 0) {
              alert(_l('保存失败'), 2);
            } else if (data == 1) {
              const timeZoneName = (_.find(timeZones, v => v.value === +timeZone) || {}).text;
              const geoCountryRegionName = (_.find(country, v => v.value === geoCountryRegionCode) || {}).text;

              this.props.updateValue({
                companyDisplayName,
                companyName,
                industryId,
                geographyId,
                geoCountryRegionCode,
                timeZone,
                timeZoneName,
                geoCountryRegionName,
              });
              const project = md.global.Account.projects.find(l => l.projectId === projectId);
              project.geoCountryRegionCode = geoCountryRegionCode;
              project.timeZone = timeZone;
              alert(_l('保存成功'));
            } else if (data == 3) {
              alert(_l('您输入的信息含有禁用词汇'), 3);
            }
          });
      } else {
        alert(_l('输入内容包含敏感词，请重新填写'), 3);
      }
    });
  }

  onChangRegionCode = code => {
    const info = this.state.regionConfigInfo.find(l => l.code === code);

    if (info) {
      this.setState({ geoCountryRegionCode: code, timeZone: info.timezone });
    } else {
      this.getRegionConfigInfo(code);
    }
  };

  onSearch = _.debounce(() => {
    const { keywords } = this.state;
    this.getRegionConfigInfos(keywords);
  }, 500);

  renderPreferences = () => {
    const { geoCountryRegionCode, country = [], timeZone, timeZones, keywords, searchResultCountry = [] } = this.state;
    const currentCountry = _.find(country, v => v.id === geoCountryRegionCode) || {};

    return (
      <div className="org-preferences">
        <div className="formGroup">
          <span className="formLabel">{_l('国家和地区')}</span>
          <div className="formDescribe">{_l('作为应用中地区、金额和手机号字段的默认国家、区号和货币类型')}</div>
          <Dropdown
            className="w100"
            border
            value={geoCountryRegionCode}
            data={keywords ? searchResultCountry : country}
            openSearch
            showItemTitle
            isAppendToBody
            renderTitle={() => <span title={currentCountry.text}>{currentCountry.text}</span>}
            onSearch={keywords => this.setState({ keywords }, this.onSearch)}
            onChange={this.onChangRegionCode}
            noData={!!keywords && _.isEmpty(searchResultCountry) ? _l('暂无搜索结果') : _l('无数据')}
          />
        </div>
        <div className="formGroup">
          <span className="formLabel">{_l('时区')}</span>
          <div className="formDescribe">{_l('作为应用的默认时区')}</div>
          <Dropdown
            className="w100"
            border
            value={parseInt(timeZone)}
            data={timeZones}
            openSearch
            showItemTitle
            isAppendToBody
            renderTitle={(selectedData = {}) => <span title={selectedData.text}>{selectedData.text}</span>}
            onChange={value => this.setState({ timeZone: value })}
          />
        </div>
      </div>
    );
  };

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
    const { visible } = this.state;
    return (
      <Dialog
        visible={visible}
        title={<span className="Font17 Bold">{_l('修改组织信息')}</span>}
        cancelText={_l('取消')}
        okText={_l('确定')}
        width="480"
        overlayClosable={false}
        onCancel={() => {
          this.hideDialog();
        }}
        onOk={() => this.handleFieldSubmit()}
      >
        {this.renderOrgName()}
        {this.renderPreferences()}
      </Dialog>
    );
  }
}

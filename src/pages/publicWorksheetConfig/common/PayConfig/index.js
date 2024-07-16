import React, { Component, Fragment } from 'react';
import { Support, Icon, Dropdown, Switch, LoadDiv, Button } from 'ming-ui';
import { Select } from 'antd';
import { filterData } from 'src/pages/FormSet/components/columnRules/config.js';
import MapField from './MapField';
import worksheetSettingAjax from 'src/api/worksheetSetting';
import paymentAjax from 'src/api/payment';
import worksheetAjax from 'src/api/worksheet';
import { NORMAL_SYSTEM_FIELDS_SORT, WORKFLOW_SYSTEM_FIELDS_SORT } from 'src/pages/worksheet/common/ViewConfig/util.js';
import { navigateTo } from 'src/router/navigateTo';
import './index.less';
import cx from 'classnames';
import _ from 'lodash';

const checkIsDeleted = (value, data = []) => !value || _.findIndex(data, v => v.controlId === value) === -1;

const filterDeleteFields = (fieldMaps, controls) => {
  fieldMaps = !_.isEmpty(fieldMaps)
    ? fieldMaps
    : {
        mchId: '',
        orderNo: '',
        transactionNo: '',
        refundFee: '',
        settleFee: '',
        totalFee: '',
        tradeFee: '',
        payUser: '',
        payTime: '',
        payStatus: '',
        payMethod: '',
        createOrderTime: '',
      };
  const newFieldMaps = _.clone(fieldMaps);
  _.forEach(Object.keys(newFieldMaps), item => {
    if (checkIsDeleted(newFieldMaps[item], controls)) {
      newFieldMaps[item] = '';
    }
  });
  return newFieldMaps;
};

const getMapControls = (controls, fieldMapIds, field) => {
  return controls
    .filter(v => {
      let relationControls = [];
      if (v.type === 30) {
        relationControls = (_.find(controls, c => `$${c.controlId}$` === v.dataSource) || {}).relationControls || [];
      }
      if (field === 'content') {
        return (
          (v.type === 2 || _.find(relationControls, r => r.controlId === v.sourceControlId && r.type === 2)) &&
          !_.includes([...NORMAL_SYSTEM_FIELDS_SORT, ...WORKFLOW_SYSTEM_FIELDS_SORT, ...fieldMapIds], v.controlId)
        );
      }
      return (
        (_.includes([6, 8, 31, 37], v.type) ||
          _.find(relationControls, r => r.controlId === v.sourceControlId && _.includes([6, 8, 31], r.type))) &&
        !_.includes(fieldMapIds, v.controlId)
      );
    })
    .map(c => ({ text: c.controlName, value: c.controlId }));
};

export default class PayConfig extends Component {
  constructor(props) {
    super(props);

    this.state = {
      merchantList: [],
      worksheetList: [],
      fieldMaps: {},
      expireTime: 10,
      loading: true,
      scenes: {},
      enableOrderVisible: false,
    };
  }

  componentDidMount() {
    this.getData();
  }

  getData = () => {
    const { worksheetInfo = {} } = this.props;
    const { projectId, appId, worksheetId } = worksheetInfo;

    Promise.all([
      worksheetSettingAjax.getPaymentSetting({
        projectId,
        appId,
        worksheetId,
      }),
      paymentAjax.getMerchantsForDropdownList({ projectId, appId }),
      worksheetAjax.getWorksheetControls({ getRelationSearch: true, worksheetId }),
    ]).then(([settings = {}, merchantList = [], controlInfo = {}]) => {
      const controls = _.get(controlInfo, 'data.controls') || [];
      const list = merchantList
        .filter(v => v.status === 3)
        .map(({ shortName, merchantNo }) => ({
          text: shortName || merchantNo,
          value: merchantNo,
        }));

      this.setState({
        ...settings,
        loading: false,
        merchantList: list,
        initSettings: {
          ...settings,
          fieldMaps: filterDeleteFields(settings.fieldMaps, controls),
        },
        mchid: settings.mchid ? settings.mchid : !_.isEmpty(list) ? list[0].value : '',
        fieldMaps: filterDeleteFields(settings.fieldMaps, controls),
        initExpireTime: settings.expireTime,
        controls,
      });
    });
  };

  formatFilterData = () => {
    const { filters, controls } = this.state;
    this.setState({
      filterItemTexts: filterData(controls, filters),
    });
  };

  onSave = () => {
    const { worksheetInfo = {} } = this.props;
    const { projectId, appId, worksheetId } = worksheetInfo;
    const {
      mchid,
      scenes,
      payContentControlId,
      payAmountControlId,
      fieldMaps,
      expireTime,
      initSettings,
      enableOrderVisible,
      controls,
      merchantList = [],
    } = this.state;

    if (scenes.publicWorkSheet) {
      if (!mchid || !_.find(merchantList, v => v.value === mchid)) {
        alert(_l('请选择商户'), 2);
        return;
      }
      if (checkIsDeleted(payContentControlId, controls)) {
        alert(_l('请选择支付内容'), 2);
        return;
      }
      if (checkIsDeleted(payAmountControlId, controls)) {
        alert(_l('请选择支付金额'), 2);
        return;
      }
    }
    window.localStorage.removeItem('getRowDetailIsShowOrder');
    worksheetSettingAjax
      .savPaymentSetting({
        projectId,
        worksheetId,
        appId,
        mchid,
        scenes,
        payContentControlId,
        payAmountControlId,
        mapWorksheetId: worksheetId,
        fieldMaps: filterDeleteFields(fieldMaps, controls),
        expireTime,
        enableOrderVisible,
      })
      .then(res => {
        if (res) {
          alert(_l('保存成功'));
          this.setState({
            initExpireTime: expireTime,
            initSettings: {
              ...initSettings,
              mchid,
              scenes,
              payContentControlId,
              payAmountControlId,
              fieldMaps: filterDeleteFields(fieldMaps, controls),
              expireTime,
              enableOrderVisible,
            },
          });
        } else {
          alert(_l('保存失败'), 2);
        }
      });
  };

  comparePayConfigData = () => {
    const { worksheetInfo = {} } = this.props;
    const {
      initSettings = {},
      mchid,
      scenes = {},
      payAmountControlId,
      payContentControlId,
      fieldMaps,
      expireTime,
      controls,
    } = this.state;
    const currentSettings = {
      ...initSettings,
      mchid,
      scenes,
      payContentControlId,
      payAmountControlId,
      fieldMaps: filterDeleteFields(fieldMaps, controls),
      expireTime,
    };

    // 初始化
    if (!_.get(initSettings, 'scenes.publicWorkSheet')) {
      return _.get(currentSettings, 'scenes.publicWorkSheet');
    }

    if (!_.isEmpty(initSettings) && !_.isEqual(currentSettings, initSettings) && !!currentSettings.mchid) {
      return true;
    }
    return false;
  };

  render() {
    const { worksheetInfo = {} } = this.props;
    const { template = {}, projectId } = worksheetInfo;
    const {
      mchid,
      scenes = {},
      payAmountControlId,
      payContentControlId,
      showMapFieldsDialog,
      merchantList,
      fieldMaps = {},
      expireTime,
      loading,
      searchValue,
      dropdownVisible,
      enableOrderVisible,
      initExpireTime,
      controls = [],
    } = this.state;

    const isEmptyField = Object.keys(fieldMaps).every(v => !fieldMaps[v]);
    const fieldMapIds = Object.values(fieldMaps);

    if (loading) {
      return <LoadDiv className="mTop20" />;
    }

    let options = [
      { label: _l('10分钟'), value: 10 },
      { label: _l('15分钟'), value: 15 },
      { label: _l('20分钟'), value: 20 },
      { label: _l('25分钟'), value: 25 },
      { label: _l('30分钟'), value: 30 },
    ];
    options =
      !dropdownVisible && !_.includes([10, 15, 20, 25, 30], expireTime)
        ? options.concat([{ label: _l('%0分钟', expireTime), value: expireTime }])
        : options;

    return (
      <div className="payConfigWrap w100 h100">
        <div className="payConfigCon">
          <h1>{_l('支付')}</h1>
          <div className="Gray_9e mTop10">
            {_l('注：修改支付相关配置，可能影响已经支付订单，请谨慎操作')}
            <Support type={3} text={_l('帮助')} href="https://help.mingdao.com/org/payment" />
          </div>
          <div className="payConfigContent">
            <ul className="enableScene">
              {[
                { key: 'publicWorkSheet', text: _l('公开表单') },
                { key: 'workSheet', text: _l('工作表(即将上线)') },
                { key: 'externalPortal', text: _l('外部门户(即将上线)') },
              ].map(item => {
                return (
                  <li className={cx({ sceneSwitch: _.includes(['workSheet', 'externalPortal'], item.key) })}>
                    <Switch
                      disabled={_.includes(['workSheet', 'externalPortal'], item.key)}
                      className="mRight18"
                      checked={item.key === 'publicWorkSheet' ? scenes[item.key] : false}
                      onClick={checked => {
                        this.setState({ scenes: { ...scenes, [item.key]: !checked } });
                      }}
                    />
                    <span className="con">{item.text}</span>
                  </li>
                );
              })}
            </ul>
            {scenes.publicWorkSheet ? (
              <Fragment>
                <div className="title">{_l('支付设置')}</div>
                <div className="subTitle">{_l('选择商户')}</div>
                {_.isEmpty(merchantList) ? (
                  <div
                    className="emptyMerchant Hand"
                    onClick={() => navigateTo(`/admin/merchant/${projectId}?iscreate=true`)}
                  >
                    {_l('创建商户')}
                  </div>
                ) : (
                  <Dropdown
                    disabled={merchantList.length === 1 && mchid === merchantList[0].value}
                    className="w100"
                    menuClass="w100"
                    border
                    value={mchid}
                    data={merchantList}
                    onChange={value => this.setState({ mchid: value })}
                  />
                )}
                <div className="subTitle required">{_l('支付内容')}</div>
                <div className="Gray_9e mBottom16">{_l('订单/支付页面显示的商品/产品简要描述')}</div>
                <Dropdown
                  className={cx('w100', {
                    emptyDropdown: checkIsDeleted(payContentControlId, controls),
                  })}
                  menuClass="w100"
                  border
                  placeholder={_l('选择文本字段')}
                  value={payContentControlId}
                  data={getMapControls(controls, fieldMapIds, 'content')}
                  onChange={value => this.setState({ payContentControlId: value })}
                />
                <div className="subTitle required">{_l('支付金额')}</div>
                <div className="Gray_9e mBottom16">
                  {_l(
                    '支持字段：金额、数值、公式、汇总；限制在2位小数（超过只取前两位数值），可支付的金额范围：0.01~10000',
                  )}
                </div>
                <Dropdown
                  className={cx('w100', {
                    emptyDropdown: checkIsDeleted(payAmountControlId, controls),
                  })}
                  menuClass="w100"
                  border
                  placeholder={_l('选择金额、数值、公式、汇总字段')}
                  value={payAmountControlId}
                  data={getMapControls(controls, fieldMapIds, 'amount')}
                  onChange={value => this.setState({ payAmountControlId: value })}
                />
                <div className="subTitle flexRow">
                  <Switch
                    className="mRight12"
                    size="small"
                    checked={expireTime}
                    onClick={checked => this.setState({ expireTime: checked ? 0 : initExpireTime || 15 })}
                  />
                  {_l('设置交易超时')}
                </div>
                <div className={cx('Gray_9e', { mBottom16: expireTime })}>
                  {_l('开启后用户需要在系统设置的时间内完成交易，逾期平台将关闭交易')}
                </div>
                {expireTime ? (
                  <Select
                    className="w100 mdAntSelect"
                    showSearch
                    placeholder={_l('选择或填写时间')}
                    value={expireTime}
                    searchValue={searchValue}
                    options={options}
                    onChange={value => {
                      this.setState({ expireTime: value, searchValue: undefined });
                    }}
                    onSearch={value => {
                      let val = value.replace(/\D/g, '');
                      val = val && Number(val) > 30 ? '30' : val;
                      this.setState({ expireTime: val ? Number(val) : expireTime, searchValue: val });
                    }}
                    onDropdownVisibleChange={open => this.setState({ dropdownVisible: open })}
                  />
                ) : (
                  ''
                )}
                <div className="title">{_l('其他')}</div>
                <div className="subTitle">{_l('字段映射')}</div>
                <div className="Gray_9e mBottom16">{_l('将订单明细映射到当前记录')}</div>
                <div className="mapSettingBtn Hand" onClick={() => this.setState({ showMapFieldsDialog: true })}>
                  {isEmptyField ? (
                    _l('点击设置')
                  ) : (
                    <Fragment>
                      <Icon icon="check_circle1" className="mRight10 Font18 TxtMiddle" style={{ color: '#4CAF50' }} />
                      {_l('已设置')}
                    </Fragment>
                  )}
                </div>

                <div className="subTitle">{_l('支付信息')}</div>
                <div className="payInfo">
                  <Switch
                    size="small"
                    checked={enableOrderVisible}
                    onClick={checked => this.setState({ enableOrderVisible: !checked })}
                  />
                  <span className="mLeft16">{_l('记录详情侧边栏显示支付订单信息')}</span>
                </div>
              </Fragment>
            ) : (
              ''
            )}
          </div>
        </div>

        {showMapFieldsDialog && (
          <MapField
            visible={showMapFieldsDialog}
            payContentControlId={payContentControlId}
            payAmountControlId={payAmountControlId}
            worksheetInfo={worksheetInfo}
            fieldMaps={fieldMaps}
            onCancel={() => this.setState({ showMapFieldsDialog: false })}
            onOk={data => {
              let fieldMaps = { payUser: '' };
              data.forEach(item => {
                fieldMaps[item.controlId] = item.mapFieldControlId;
              });
              this.setState({ fieldMaps });
            }}
          />
        )}
        <div className="footer">
          <Button type="primary" onClick={this.onSave}>
            {_l('保存设置')}
          </Button>
        </div>
      </div>
    );
  }
}

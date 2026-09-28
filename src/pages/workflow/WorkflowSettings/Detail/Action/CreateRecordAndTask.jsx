import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import { PriceTip, Support } from 'ming-ui';
import { Radio, Select } from 'ming-ui/antd-components';
import SelectOtherWorksheetDialog from 'src/pages/worksheet/components/SelectWorksheet/SelectOtherWorksheetDialog';
import { pathCompletion } from 'src/utils/platform/navigation/path';
import { ACTION_ID, APP_TYPE, NODE_TYPE, RELATION_TYPE } from '../../enum';
import { AddOptions, AppSelectTitle, SelectNodeObject, SingleControlValue } from '../components';

const SELECT_FIELD_NAMES = { label: 'text', value: 'value' };

const getAppList = data =>
  data.appList
    .filter(item => !item.otherApkId)
    .map(({ name, id }) => ({
      text: name,
      value: id,
    }));

export default class CreateRecordAndTask extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showOtherWorksheet: false,
      isBatch: !!props.data.selectNodeId,
    };
  }

  /**
   * 切换工作表
   */

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      if (this.props.data.selectNodeId !== prevProps.data.selectNodeId) {
        this.setState({
          isBatch: !!this.props.data.selectNodeId,
        });
      }
    }
  }

  /**
   * 切换工作表
   */
  switchWorksheet = (appId, name, otherApkId = '', otherApkName = '') => {
    const { updateSource, getAppTemplateControls } = this.props;
    const appList = _.cloneDeep(this.props.data.appList);

    if (otherApkId) {
      _.remove(appList, item => item.id === appId);
      appList.push({ id: appId, name, otherApkId, otherApkName });
    }

    updateSource({ appId, appList, fields: [], controls: [] }, () => {
      getAppTemplateControls('', appId);
    });
  };

  render() {
    const { showOtherWorksheet, isBatch } = this.state;
    const { data, updateSource, companyId } = this.props;
    const selectAppItem = data.appList.find(({ id }) => id === data.appId);
    const fields = [].concat(
      data.fields.filter(v => v.type !== 29),
      data.fields.filter(v => v.type === 29),
    );
    const otherWorksheet = [
      {
        text: _l('其它应用下的工作表'),
        value: 'other',
        className: 'textSecondary',
      },
    ];
    const invoiceMessage = {
      amount: _l('开票金额不是 0 或者 负数'),
      productId: _l('组织后台上传的商品管理表中的税收服务简称'),
      price: _l('单价为含税单价'),
      taxPayerNo: _l('发票抬头类型为企业时，税号字段不能为空，否则无法开票'),
      totalAmount: _l('金额为含税金额'),
      email: _l('接收电子发票的购方邮箱'),
      remark: _l('设置自定义备注内容'),
    };

    return (
      <Fragment>
        {data.appType === APP_TYPE.EXTERNAL_USER && (
          <div className="Font14 textSecondary workflowDetailDesc mBottom20">
            <PriceTip
              text={_l(
                '向指定手机号发送短信邀请用户注册外部门户，并在外部门户下自动创建一条对应的用户数据（成员状态为“未激活”）。短信费用自动从组织信用点中扣除',
              )}
            />
            {window.platformENV.isHap && (
              <Fragment>
                <span className="mLeft5">{_l('目前仅支持中国大陆手机号。')}</span>
                <Support
                  type={3}
                  href="https://help.mingdao.com/workflow/sms-failure"
                  text={<span className="colorPrimary hoverColorPrimaryDark">{_l('收不到短信？')}</span>}
                />
              </Fragment>
            )}
          </div>
        )}

        {data.appType === APP_TYPE.INVOICE && (
          <div className="Font14 textSecondary workflowDetailDesc">
            {data.actionId === ACTION_ID.SEND_EMAIL
              ? _l(
                  '使用本节点前，请先确认已有蓝字发票。电子开票为异步处理，节点执行时会等待开票结果后再继续。此节点为自动开票，无需管理员审核。',
                )
              : _l(
                  '本节点使用前，请确保已开通开票税号。电子开票采用异步处理方式，节点执行时将等待开票结果，开票完成后再继续后续流程。该开票为自动操作，无需管理员审核。',
                )}
            <span
              className="colorPrimary pointer"
              onClick={() => window.open(pathCompletion(`/admin/invoice/${companyId}/taxNo`))}
            >
              {_l('前往组织后台开通')}
            </span>

            <div className="mTop10" style={{ color: 'var(--color-error)' }}>
              {_l('注意️：若节点状态一直是进行中，请检查数电账号是否已登录或者是否已完成人脸识别。')}
            </div>
          </div>
        )}

        {data.appType !== APP_TYPE.INVOICE && (
          <div className="Font13 bold">
            {data.appType === APP_TYPE.SHEET
              ? _l('选择工作表')
              : data.appType === APP_TYPE.EXTERNAL_USER
                ? _l('应用')
                : _l('选择项目')}
          </div>
        )}

        {_.includes([APP_TYPE.SHEET, APP_TYPE.TASK], data.appType) && (
          <Select
            className={cx('flowDropdown mTop10', { 'errorBorder errorBG': data.appId && !selectAppItem })}
            options={
              data.appType === APP_TYPE.SHEET
                ? getAppList(data).concat(this.props.relationType === RELATION_TYPE.NETWORK ? [] : otherWorksheet)
                : getAppList(data)
            }
            fieldNames={SELECT_FIELD_NAMES}
            value={data.appId}
            labelRender={() => (
              <AppSelectTitle
                data={data}
                selectAppItem={selectAppItem}
                invalidText={data.appType === APP_TYPE.SHEET ? _l('工作表无效或已删除') : _l('项目无效或已删除')}
              />
            )}
            showSearch
            optionFilterProp="text"
            onChange={appId => {
              if (appId === 'other') {
                this.setState({ showOtherWorksheet: true });
              } else {
                this.switchWorksheet(appId);
              }
            }}
          />
        )}

        {data.appType === APP_TYPE.EXTERNAL_USER && (
          <Fragment>
            <div className="Font13 mTop10">
              {(data.appList.find(o => o.id === data.appId) || { name: _l('应用已删除') }).name}
            </div>
            <div className="Font13 bold mTop20">{_l('邀请方式')}</div>
          </Fragment>
        )}

        {_.includes([APP_TYPE.SHEET, APP_TYPE.EXTERNAL_USER], data.appType) && (
          <Fragment>
            <div className="mTop20">
              <Radio
                checked={!isBatch}
                onChange={() => {
                  this.setState({
                    isBatch: false,
                  });
                  updateSource({
                    selectNodeId: '',
                    fields: data.fields.map(o => {
                      if (o.nodeTypeId === NODE_TYPE.GET_MORE_RECORD) {
                        o.nodeId = '';
                        o.fieldValueId = '';
                      }

                      return o;
                    }),
                  });
                }}
                title={data.appType === APP_TYPE.EXTERNAL_USER ? _l('邀请1名用户') : _l('新增一条记录')}
              >
                {data.appType === APP_TYPE.EXTERNAL_USER ? _l('邀请1名用户') : _l('新增一条记录')}
              </Radio>
            </div>
            <div className="mTop10">
              <Radio
                checked={isBatch}
                onChange={() =>
                  this.setState({
                    isBatch: true,
                  })
                }
                title={
                  data.appType === APP_TYPE.EXTERNAL_USER
                    ? _l('基于多条数据邀请多名用户')
                    : _l('基于多条记录逐条新增记录')
                }
              >
                {data.appType === APP_TYPE.EXTERNAL_USER
                  ? _l('基于多条数据邀请多名用户')
                  : _l('基于多条记录逐条新增记录')}
              </Radio>
            </div>
          </Fragment>
        )}

        {isBatch && (
          <Fragment>
            <div className="mTop20 bold">{_l('选择数据源')}</div>
            <SelectNodeObject
              smallBorder={true}
              appList={data.flowNodeList}
              selectNodeId={data.selectNodeId}
              selectNodeObj={data.selectNodeObj}
              onChange={selectNodeId => {
                const selectNodeObj = _.find(data.flowNodeList, item => item.nodeId === selectNodeId);

                updateSource({ selectNodeId, selectNodeObj });
              }}
            />
          </Fragment>
        )}

        {data.appType !== APP_TYPE.INVOICE && (
          <div className="Font13 bold mTop20">
            {data.appType === APP_TYPE.SHEET
              ? _l('新增记录')
              : data.appType === APP_TYPE.EXTERNAL_USER
                ? _l('填充用户信息')
                : _l('创建任务')}
          </div>
        )}

        {fields.map((item, i) => {
          const singleObj = _.find(data.controls, obj => obj.controlId === item.fieldId) || {};
          const { controlName, sourceEntityName } = singleObj;
          const parentNode = singleObj.dataSource
            ? _.find(data.fields, o => o.fieldId === singleObj.dataSource) || {}
            : {};

          if (parentNode.type === 10000008 && (parentNode.fieldValueId || !parentNode.nodeId)) return null;

          if (singleObj.type === 10052) {
            return (
              <div key={item.fieldId} className="mTop25 bold Font14 ellipsis">
                {controlName}
              </div>
            );
          }

          if (_.includes(['portal_logintime', 'portal_system_id', 'invoiceSpecialMark'], singleObj.controlId))
            return null;

          return (
            <div
              key={item.fieldId}
              className={cx('relative', { mLeft24: singleObj.dataSource && data.appType === APP_TYPE.INVOICE })}
            >
              <div className="flexRow alignItemsCenter mTop15">
                <div className="ellipsis Font13 flex mRight20">
                  {controlName}
                  {(singleObj.required || _.includes(['portal_role'], item.fieldId)) && (
                    <span className="mLeft5 red">*</span>
                  )}
                  {singleObj.type === 29 && (
                    <span className="textSecondary">{`（${_l('工作表')}“${sourceEntityName}”）`}</span>
                  )}
                </div>
                {data.appType === APP_TYPE.SHEET && _.includes([9, 10, 11], item.type) && item.fieldValueId && (
                  <AddOptions
                    checked={item.allowAddOptions || false}
                    fields={fields}
                    index={i}
                    updateSource={updateSource}
                  />
                )}
                {item.type === 36 && data.appType !== APP_TYPE.INVOICE && (
                  <span className="textSecondary">{_l('是-(1,true), 否-(0,false), 其余值忽略')}</span>
                )}
                {item.type === 40 && (
                  <span className="textSecondary">{`{"x": "121.473667", "y": "31.230525", "title": "Shanghai", "address": ""}`}</span>
                )}
              </div>
              {item.fieldId === 'portal_mobile' && window.platformENV.isPlatform && (
                <div className="Font13 textSecondary mTop5">{_l('根据此字段发送邀请短信')}</div>
              )}
              {data.appType === APP_TYPE.INVOICE && singleObj.controlId === 'taxNo' && !singleObj.options.length && (
                <div className="Font13 textSecondary mTop5">
                  {_l('开票税号未授权，请')}
                  <span
                    className="colorPrimary pointer"
                    onClick={() => window.open(pathCompletion(`/admin/invoice/${companyId}/taxNo`))}
                  >
                    {_l('前往组织后台授权')}
                  </span>
                </div>
              )}
              {data.appType === APP_TYPE.INVOICE && invoiceMessage[singleObj.controlId] && (
                <div className="Font13 textSecondary mTop5">{invoiceMessage[singleObj.controlId]}</div>
              )}
              <SingleControlValue
                companyId={this.props.companyId}
                relationId={this.props.relationId}
                processId={this.props.processId}
                selectNodeId={this.props.selectNodeId}
                sourceNodeId={singleObj.dataSource && !isBatch ? parentNode.nodeId : data.selectNodeId}
                controls={_.cloneDeep(data.controls).map(o => {
                  if (o.type === 10000008) {
                    o.flowNodeAppDtos = data.batchNodes;
                  }

                  // 开票类目和项目名称根据开票主体过滤
                  if (data.appType === APP_TYPE.INVOICE && _.includes(['productId', 'categoryCode'], o.controlId)) {
                    const taxNo = data.fields.find(o => o.fieldId === 'taxNo').fieldValue;
                    const taxNoText =
                      data.controls.find(o => o.controlId === 'taxNo').options?.find(o => o.key === taxNo)?.value || '';

                    o.options = taxNoText
                      ? o.options
                          .filter(o => o.value.includes(`(${taxNoText})`))
                          .map(o => ({ ...o, value: o.value.replace(`(${taxNoText})`, '') }))
                      : [];
                  }

                  return o;
                })}
                formulaMap={data.formulaMap}
                fields={fields}
                hideOtherField={
                  data.appType === APP_TYPE.INVOICE &&
                  _.includes(
                    [
                      'taxNo',
                      'productId',
                      'invoiceType',
                      'invoiceOutputType',
                      'redReason',
                      'invoiceSpecialMark',
                      'transportToolType',
                    ],
                    singleObj.controlId,
                  )
                }
                hideUserMoreObject={data.appType === APP_TYPE.INVOICE}
                updateSource={(opts, callback) => {
                  if (data.appType === APP_TYPE.TASK && opts?.fields) {
                    opts.fields = opts.fields.map(o => {
                      if (o.type === 16 && o.fieldValue) {
                        o.fieldValue = moment(o.fieldValue).format('YYYY-MM-DD HH:00');
                      }

                      return o;
                    });
                  }

                  // 更改开票主体的时候清空开票类目和项目名称
                  if (
                    data.appType === APP_TYPE.INVOICE &&
                    opts.fields &&
                    opts.fields.find(o => o.fieldId === 'taxNo').fieldValue !==
                      data.fields.find(o => o.fieldId === 'taxNo').fieldValue
                  ) {
                    opts.fields = opts.fields.map(o => {
                      if (_.includes(['productId', 'categoryCode'], o.fieldId)) {
                        o.fieldValue = '';
                        o.fieldValueId = '';
                      }

                      return o;
                    });
                  }

                  updateSource(opts, callback);
                }}
                item={item}
                i={i}
              />
            </div>
          );
        })}

        {showOtherWorksheet && (
          <SelectOtherWorksheetDialog
            projectId={this.props.companyId}
            worksheetType={0}
            selectedAppId={this.props.relationId}
            selectedWorksheetId={data.appId}
            visible
            onOk={(selectedAppId, worksheetId, obj) => {
              const isCurrentApp = this.props.relationId === selectedAppId;
              this.switchWorksheet(
                worksheetId,
                obj.workSheetName,
                !isCurrentApp && selectedAppId,
                !isCurrentApp && obj.appName,
              );
            }}
            onHide={() => this.setState({ showOtherWorksheet: false })}
          />
        )}
      </Fragment>
    );
  }
}

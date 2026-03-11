import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Dropdown, PriceTip, Radio, Support } from 'ming-ui';
import SelectOtherWorksheetDialog from 'src/pages/worksheet/components/SelectWorksheet/SelectOtherWorksheetDialog';
import { APP_TYPE, NODE_TYPE, RELATION_TYPE } from '../../enum';
import { AddOptions, SelectNodeObject, SingleControlValue } from '../components';

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

  componentWillReceiveProps(nextProps) {
    if (nextProps.data.selectNodeId !== this.props.data.selectNodeId) {
      this.setState({ isBatch: !!nextProps.data.selectNodeId });
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
      taxPayerNo: _l('发票抬头类型为企业时，税号字段不能为空，否则无法开票'),
      email: _l('接收电子发票的购方邮箱'),
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
            {!window.platformENV.isOverseas && !window.platformENV.isLocal && (
              <Fragment>
                <span className="mLeft5">{_l('目前仅支持中国大陆手机号。')}</span>
                <Support
                  type={3}
                  href="https://help.mingdao.com/workflow/sms-failure"
                  text={<span className="ThemeColor3 ThemeHoverColor2">{_l('收不到短信？')}</span>}
                />
              </Fragment>
            )}
          </div>
        )}

        {data.appType === APP_TYPE.INVOICE && (
          <div className="Font14 textSecondary workflowDetailDesc">
            {_l(
              '本节点使用前，请确保已开通开票税号。电子开票采用异步处理方式，节点执行时将等待开票结果，开票完成后再继续后续流程。该开票为自动操作，无需管理员审核。',
            )}
            <span className="ThemeColor3 pointer" onClick={() => window.open(`/admin/invoice/${companyId}/taxNo`)}>
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
          <Dropdown
            className={cx('flowDropdown mTop10', { 'errorBorder errorBG': data.appId && !selectAppItem })}
            data={
              data.appType === APP_TYPE.SHEET
                ? [getAppList(data), this.props.relationType === RELATION_TYPE.NETWORK ? [] : otherWorksheet]
                : getAppList(data)
            }
            value={data.appId}
            renderTitle={
              !data.appId
                ? () => <span className="textSecondary">{_l('请选择')}</span>
                : data.appId && !selectAppItem
                  ? () => (
                      <span className="errorColor">
                        {data.appType === APP_TYPE.SHEET ? _l('工作表无效或已删除') : _l('项目无效或已删除')}
                      </span>
                    )
                  : () => (
                      <Fragment>
                        <span>{selectAppItem.name}</span>
                        {selectAppItem.otherApkName && (
                          <span className="textSecondary">（{selectAppItem.otherApkName}）</span>
                        )}
                      </Fragment>
                    )
            }
            border
            openSearch
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
                text={data.appType === APP_TYPE.EXTERNAL_USER ? _l('邀请1名用户') : _l('新增一条记录')}
                checked={!isBatch}
                onClick={() => {
                  this.setState({ isBatch: false });
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
              />
            </div>
            <div className="mTop10">
              <Radio
                text={
                  data.appType === APP_TYPE.EXTERNAL_USER
                    ? _l('基于多条数据邀请多名用户')
                    : _l('基于多条记录逐条新增记录')
                }
                checked={isBatch}
                onClick={() => this.setState({ isBatch: true })}
              />
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

          if (singleObj.type === 10052) {
            return (
              <div key={item.fieldId} className="mTop25 bold Font14 ellipsis">
                {controlName}
              </div>
            );
          }

          return (
            <div key={item.fieldId} className="relative">
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
                <div className="textSecondary mTop5">{_l('根据此字段发送邀请短信')}</div>
              )}
              {data.appType === APP_TYPE.INVOICE && singleObj.controlId === 'taxNo' && !singleObj.options.length && (
                <div className="textSecondary mTop5">
                  {_l('开票税号未授权，请')}
                  <span
                    className="ThemeColor3 pointer"
                    onClick={() => window.open(`/admin/invoice/${companyId}/taxNo`)}
                  >
                    {_l('前往组织后台授权')}
                  </span>
                </div>
              )}
              {data.appType === APP_TYPE.INVOICE && invoiceMessage[singleObj.controlId] && (
                <div className="textSecondary mTop5">{invoiceMessage[singleObj.controlId]}</div>
              )}
              <SingleControlValue
                companyId={this.props.companyId}
                relationId={this.props.relationId}
                processId={this.props.processId}
                selectNodeId={this.props.selectNodeId}
                sourceNodeId={data.selectNodeId}
                controls={_.cloneDeep(data.controls).map(o => {
                  // 开票类目根据开票主体过滤
                  if (data.appType === APP_TYPE.INVOICE && o.controlId === 'productId') {
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
                  _.includes(['taxNo', 'productId', 'invoiceType', 'invoiceOutputType'], singleObj.controlId)
                }
                hideUserMoreObject={data.appType === APP_TYPE.INVOICE}
                updateSource={(opts, callback) => {
                  // 更改开票主体的时候清空开票类目
                  if (
                    data.appType === APP_TYPE.INVOICE &&
                    opts.fields &&
                    opts.fields.find(o => o.fieldId === 'taxNo').fieldValue !==
                      data.fields.find(o => o.fieldId === 'taxNo').fieldValue
                  ) {
                    opts.fields = opts.fields.map(o => {
                      if (o.fieldId === 'productId') {
                        o.fieldValue = '';
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

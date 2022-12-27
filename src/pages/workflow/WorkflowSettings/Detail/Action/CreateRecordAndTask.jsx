import React, { Component, Fragment } from 'react';
import { Dropdown, Radio } from 'ming-ui';
import cx from 'classnames';
import { APP_TYPE, RELATION_TYPE } from '../../enum';
import { SingleControlValue, SelectNodeObject, AddOptions } from '../components';
import SelectOtherWorksheetDialog from 'src/pages/worksheet/components/SelectWorksheet/SelectOtherWorksheetDialog';
import _ from 'lodash';

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

  componentWillReceiveProps(nextProps, nextState) {
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
    const { data, updateSource } = this.props;
    const selectAppItem = data.appList.find(({ id }) => id === data.appId);
    const fields = [].concat(data.fields.filter(v => v.type !== 29), data.fields.filter(v => v.type === 29));
    const otherWorksheet = [
      {
        text: _l('其它应用下的工作表'),
        value: 'other',
        className: 'Gray_75',
      },
    ];

    return (
      <Fragment>
        {data.appType === APP_TYPE.EXTERNAL_USER && (
          <div className="Font14 Gray_75 workflowDetailDesc mBottom20">
            {_l(
              '向指定手机号发送短信邀请用户注册外部门户，并在外部门户下自动创建一条对应的用户数据（成员状态为“未激活”）。',
            )}
          </div>
        )}

        <div className="Font13 bold">
          {data.appType === APP_TYPE.SHEET
            ? _l('选择工作表')
            : data.appType === APP_TYPE.EXTERNAL_USER
            ? _l('应用')
            : _l('选择项目')}
        </div>

        {data.appType !== APP_TYPE.EXTERNAL_USER && (
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
                ? () => <span className="Gray_9e">{_l('请选择')}</span>
                : data.appId && !selectAppItem
                ? () => (
                    <span className="errorColor">
                      {data.appType === APP_TYPE.SHEET ? _l('工作表无效或已删除') : _l('项目无效或已删除')}
                    </span>
                  )
                : () => (
                    <Fragment>
                      <span>{selectAppItem.name}</span>
                      {selectAppItem.otherApkName && <span className="Gray_9e">（{selectAppItem.otherApkName}）</span>}
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
                  updateSource({ selectNodeId: '' });
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

        <div className="Font13 bold mTop20">
          {data.appType === APP_TYPE.SHEET
            ? _l('新增记录')
            : data.appType === APP_TYPE.EXTERNAL_USER
            ? _l('填充用户信息')
            : _l('创建任务')}
        </div>

        {fields.map((item, i) => {
          const singleObj = _.find(data.controls, obj => obj.controlId === item.fieldId) || {};
          const { controlName, sourceEntityName } = singleObj;

          return (
            <div key={item.fieldId} className="relative">
              <div className="flexRow alignItemsCenter mTop15">
                <div className="ellipsis Font13 flex mRight20">
                  {controlName}
                  {(singleObj.required || _.includes(['portal_mobile', 'portal_role'], item.fieldId)) && (
                    <span className="mLeft5 red">*</span>
                  )}
                  {singleObj.type === 29 && (
                    <span className="Gray_9e">{`（${_l('工作表')}“${sourceEntityName}”）`}</span>
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
              </div>
              {item.fieldId === 'portal_mobile' && (
                <div className="Gray_9e mTop5">{_l('根据此字段发送邀请短信')}</div>
              )}
              <SingleControlValue
                companyId={this.props.companyId}
                processId={this.props.processId}
                selectNodeId={this.props.selectNodeId}
                sourceNodeId={data.selectNodeId}
                controls={data.controls}
                formulaMap={data.formulaMap}
                fields={fields}
                updateSource={updateSource}
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
            selectedWrorkesheetId={data.appId}
            visible
            onOk={(selectedAppId, selectedWrorkesheetId, obj) => {
              const isCurrentApp = this.props.relationId === selectedAppId;
              this.switchWorksheet(
                selectedWrorkesheetId,
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

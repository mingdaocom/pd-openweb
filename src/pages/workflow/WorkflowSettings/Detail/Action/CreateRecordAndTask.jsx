import React, { Component, Fragment } from 'react';
import { Dropdown, Radio } from 'ming-ui';
import cx from 'classnames';
import { APP_TYPE, RELATION_TYPE } from '../../enum';
import { SingleControlValue, SelectNodeObject } from '../components';
import SelectOtherWorksheetDialog from 'src/pages/worksheet/components/SelectWorksheet/SelectOtherWorksheetDialog';

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
    const fields = [].concat(
      data.fields.filter(v => v.type !== 29),
      data.fields.filter(v => v.type === 29),
    );
    const otherWorksheet = [
      {
        text: _l('其它应用下的工作表'),
        value: 'other',
        className: 'Gray_75',
      },
    ];

    return (
      <Fragment>
        <div className="Font13 bold">{data.appType === APP_TYPE.SHEET ? _l('选择工作表') : _l('选择项目')}</div>

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

        {data.appType === APP_TYPE.SHEET && (
          <Fragment>
            <div className="mTop20">
              <Radio
                text={_l('新增一条记录')}
                checked={!isBatch}
                onClick={() => {
                  this.setState({ isBatch: false });
                  updateSource({ selectNodeId: '' });
                }}
              />
            </div>
            <div className="mTop10">
              <Radio
                text={_l('基于多条记录逐条新增记录')}
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

        <div className="Font13 bold mTop25">{data.appType === APP_TYPE.SHEET ? _l('新增记录') : _l('创建任务')}</div>

        {fields.map((item, i) => {
          const singleObj = _.find(data.controls, obj => obj.controlId === item.fieldId);
          const { controlName, sourceEntityName } = singleObj || {};

          return (
            <div key={item.fieldId} className="relative">
              <div className="mTop15 ellipsis Font13">
                {controlName}
                {singleObj.required && <span className="mLeft5 red">*</span>}
                {singleObj.type === 29 && <span className="Gray_9e">{`（${_l('工作表')}“${sourceEntityName}”）`}</span>}
              </div>
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

import React, { Component, Fragment } from 'react';
import { ScrollView, LoadDiv, Dropdown } from 'ming-ui';
import flowNode from '../../../api/flowNode';
import { DetailHeader, DetailFooter, SelectNodeObject, FilterAndSort, SpecificFieldsValue } from '../components';
import { TRIGGER_ID_TYPE } from '../../enum';
import cx from 'classnames';
import SelectOtherWorksheetDialog from 'src/pages/worksheet/components/SelectWorksheet/SelectOtherWorksheetDialog';
import { checkConditionsIsNull } from '../../utils';

export default class GetMoreRecord extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      saveRequest: false,
      showOtherWorksheet: false,
    };
  }

  componentDidMount() {
    this.getNodeDetail(this.props);
  }

  componentWillReceiveProps(nextProps, nextState) {
    if (nextProps.selectNodeId !== this.props.selectNodeId) {
      this.getNodeDetail(nextProps);
    }

    if (
      nextProps.selectNodeName &&
      nextProps.selectNodeName !== this.props.selectNodeName &&
      nextProps.selectNodeId === this.props.selectNodeId
    ) {
      this.updateSource({ name: nextProps.selectNodeName });
    }
  }

  /**
   * 获取节点详情
   */
  getNodeDetail(props) {
    const { processId, selectNodeId, selectNodeType } = props;

    flowNode.getNodeDetail({ processId, nodeId: selectNodeId, flowNodeType: selectNodeType }).then(result => {
      result.name = this.props.selectNodeName;
      this.setState({ data: result });
    });
  }

  /**
   * 更新data数据
   */
  updateSource = (obj, callback = () => {}) => {
    this.props.haveChange(true);
    this.setState({ data: Object.assign({}, this.state.data, obj) }, callback);
  };

  /**
   * 保存
   */
  onSave = () => {
    const { data, saveRequest } = this.state;
    const { name, actionId, appId, conditions, selectNodeId, fields, sorts, numberFieldValue } = data;

    if (actionId === TRIGGER_ID_TYPE.FROM_WORKSHEET && !appId) {
      alert(_l('必须选择工作表'), 2);
      return;
    }

    if (actionId === TRIGGER_ID_TYPE.FROM_RECORD || actionId === TRIGGER_ID_TYPE.FROM_ARRAY) {
      if (!selectNodeId) {
        alert(actionId === TRIGGER_ID_TYPE.FROM_RECORD ? _l('必须选择对象') : _l('必须选择Webhook节点'), 2);
        return;
      } else if (!fields.length) {
        alert(actionId === TRIGGER_ID_TYPE.FROM_RECORD ? _l('必须选择他表字段') : _l('必须选择数组'), 2);
        return;
      }
    }

    if (actionId === TRIGGER_ID_TYPE.FROM_ADD && !selectNodeId) {
      alert(_l('必须选择新增记录节点'), 2);
      return;
    }

    if (actionId === TRIGGER_ID_TYPE.FROM_ARTIFICIAL && !selectNodeId) {
      alert(_l('必须选择对象'), 2);
      return;
    }

    if (checkConditionsIsNull(conditions)) {
      alert(_l('筛选条件的判断值不能为空'), 2);
      return;
    }

    if (saveRequest) {
      return;
    }

    flowNode
      .saveNode({
        processId: this.props.processId,
        nodeId: this.props.selectNodeId,
        flowNodeType: this.props.selectNodeType,
        name: name.trim(),
        actionId,
        appId,
        operateCondition: conditions,
        fields,
        selectNodeId,
        sorts,
        numberFieldValue,
      })
      .then(result => {
        this.props.updateNodeData(result);
        this.props.closeDetail();
      });

    this.setState({ saveRequest: true });
  };

  /**
   * 获取工作表的自定义字段
   */
  getWorksheetFields = appId => {
    const { data } = this.state;

    flowNode
      .getStartEventDeploy({
        appId,
        appType: data.appType,
      })
      .then(result => {
        this.updateSource({ controls: result.controls });
      });
  };

  /**
   * 获取Webhook数组的参数
   */
  getArrayFields = (appType, selectNodeId, controlId) => {
    const { processId } = this.props;

    flowNode
      .getStartEventDeploy({
        processId,
        appType,
        selectNodeId,
        controlId,
      })
      .then(result => {
        this.updateSource({ controls: result.controls });
      });
  };

  /**
   * 获取自定义字段
   */
  getCustomControls = (appId, selectNodeId) => {
    const { data } = this.state;

    flowNode
      .getAppTemplateControls({
        processId: this.props.processId,
        nodeId: this.props.selectNodeId,
        selectNodeId,
        appId,
        appType: data.appType,
      })
      .then(result => {
        this.updateSource({
          relationControls:
            data.actionId === TRIGGER_ID_TYPE.FROM_RECORD
              ? result.filter(item => item.type === 29)
              : result.filter(item => item.type === 10000003),
        });
      });
  };

  /**
   * 获取人工节点字段
   */
  getArtificialControls = (appId, selectNodeId) => {
    const { data } = this.state;

    flowNode
      .getAppTemplateControls({
        processId: this.props.processId,
        nodeId: this.props.selectNodeId,
        selectNodeId,
        appId,
        appType: data.appType,
      })
      .then(result => {
        this.updateSource({ controls: result });
      });
  };

  /**
   * 渲染内容
   */
  renderContent() {
    const { data } = this.state;
    const actionTypes = {
      400: _l('从工作表获取记录'),
      401: _l('从记录获取关联记录'),
      402: _l('从新增节点获取记录'),
      403: _l('从Webhook数组获取数据'),
      404: _l('从代码块数组获取数据'),
      405: _l('从人工节点获取操作明细'),
    };
    const { workflowBatchGetDataLimitCount, workflowSubProcessDataLimitCount } = md.global.SysSettings;
    return (
      <div className="workflowDetailBox">
        <div className="bold">{actionTypes[data.actionId]}</div>

        <div className="Font14 Gray_75 workflowDetailDesc mTop20">
        {_l(
            '您获取的多条数据可供本流程的数据处理节点或子流程节点使用。被数据处理节点（新增、更新、删除）使用，最多支持%0条。被子流程节点使用，最多支持%1条。',
            workflowBatchGetDataLimitCount,
            workflowSubProcessDataLimitCount
          )}
        </div>

        {data.actionId === TRIGGER_ID_TYPE.FROM_WORKSHEET && this.renderWorksheet()}
        {data.actionId === TRIGGER_ID_TYPE.FROM_RECORD && this.renderRecord()}
        {data.actionId === TRIGGER_ID_TYPE.FROM_ADD && this.renderAdd()}
        {_.includes([TRIGGER_ID_TYPE.FROM_ARRAY, TRIGGER_ID_TYPE.FROM_CODE], data.actionId) && this.renderArray()}
        {data.actionId === TRIGGER_ID_TYPE.FROM_ARTIFICIAL && this.renderArtificial()}

        <div className="mTop20 bold">{_l('限制数量')}</div>
        <div className="Font13 Gray_9e mTop5">{_l('最多获取条数')}</div>
        <SpecificFieldsValue
          processId={this.props.processId}
          selectNodeId={this.props.selectNodeId}
          updateSource={numberFieldValue => this.updateSource({ numberFieldValue })}
          type="number"
          allowedEmpty
          data={data.numberFieldValue}
        />
      </div>
    );
  }

  /**
   * 渲染筛选条件
   */
  renderTriggerCondition() {
    const { data } = this.state;

    return (
      <FilterAndSort
        companyId={this.props.companyId}
        processId={this.props.processId}
        selectNodeId={this.props.selectNodeId}
        data={data}
        updateSource={this.updateSource}
        filterText={_l('设置筛选条件，获得满足条件的数据。如果未设置筛选条件，则获得所有来自对象的数据')}
      />
    );
  }

  /**
   * 从工作表选择
   */
  renderWorksheet() {
    const { data } = this.state;
    const selectAppItem = data.appList.find(({ id }) => id === data.appId);
    const list = data.appList
      .filter(item => !item.otherApkId)
      .map(({ name, id }) => ({
        text: name,
        value: id,
      }));
    const otherWorksheet = [
      {
        text: _l('其它应用下的工作表'),
        value: 'other',
        className: 'Gray_75',
      },
    ];

    return (
      <Fragment>
        <div className="mTop20 bold">{_l('选择工作表')}</div>
        <Dropdown
          className={cx('flowDropdown mTop10', { 'errorBorder errorBG': data.appId && !selectAppItem })}
          data={[list, otherWorksheet]}
          value={data.appId}
          renderTitle={
            !data.appId
              ? () => <span className="Gray_9e">{_l('请选择')}</span>
              : data.appId && !selectAppItem
              ? () => <span className="errorColor">{_l('工作表无效或已删除')}</span>
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

        {data.appId && this.renderTriggerCondition()}
      </Fragment>
    );
  }

  /**
   * 从一条记录获得多条关联记录
   */
  renderRecord() {
    const { data } = this.state;
    const fieldId = ((data.fields || [])[0] || {}).fieldId || '';
    const item = data.relationControls.find(({ controlId }) => controlId === fieldId);
    const list = data.relationControls.map(({ controlId, controlName, sourceEntityName }) => ({
      text: (
        <span>
          {controlName}
          <span className="Gray_75">（{_l('关联表“%0”', sourceEntityName)}）</span>
        </span>
      ),
      value: controlId,
    }));

    return (
      <Fragment>
        <div className="mTop20 bold">{_l('选择节点对象')}</div>
        <SelectNodeObject
          smallBorder={true}
          appList={data.flowNodeList}
          selectNodeId={data.selectNodeId}
          selectNodeObj={data.selectNodeObj}
          onChange={selectNodeId => {
            const { data } = this.state;
            const selectNodeObj = _.find(data.flowNodeList, item => item.nodeId === selectNodeId);

            this.updateSource({ selectNodeId, selectNodeObj, fields: [], relationControls: [] }, () => {
              this.getCustomControls(selectNodeObj.appId, selectNodeId);
            });
          }}
        />

        {data.selectNodeId && (
          <Fragment>
            <div className="mTop20 bold">{_l('选择关联类型的字段')}</div>
            <Dropdown
              className={cx('flowDropdown mTop10', { 'errorBorder errorBG': fieldId && !item })}
              data={list}
              value={fieldId}
              renderTitle={
                !fieldId
                  ? () => <span className="Gray_9e">{_l('请选择')}</span>
                  : fieldId && !item
                  ? () => <span className="errorColor">{_l('字段不存在或已删除')}</span>
                  : () => (
                      <span>
                        {item.controlName}
                        <span className="Gray_75">（{_l('关联表“%0”', item.sourceEntityName)}）</span>
                      </span>
                    )
              }
              border
              onChange={fieldId => {
                this.updateSource({ fields: [{ fieldId }], conditions: [] }, () => {
                  this.getWorksheetFields(
                    data.relationControls.find(({ controlId }) => controlId === fieldId).dataSource,
                  );
                });
              }}
            />
          </Fragment>
        )}

        {data.selectNodeId && !!(data.fields || []).length && this.renderTriggerCondition()}
      </Fragment>
    );
  }

  /**
   * 从新增记录节点获得多条记录
   */
  renderAdd() {
    const { data } = this.state;

    return (
      <Fragment>
        <div className="mTop20 bold">{_l('选择新增记录节点')}</div>
        <SelectNodeObject
          smallBorder={true}
          appList={data.flowNodeList}
          selectNodeId={data.selectNodeId}
          selectNodeObj={data.selectNodeObj}
          onChange={selectNodeId => {
            const { data } = this.state;
            const selectNodeObj = _.find(data.flowNodeList, item => item.nodeId === selectNodeId);

            this.updateSource({ selectNodeId, selectNodeObj }, () => {
              this.getWorksheetFields(selectNodeObj.appId);
            });
          }}
        />

        {data.selectNodeId && this.renderTriggerCondition()}
      </Fragment>
    );
  }

  /**
   * 从数组获得批量数据
   */
  renderArray() {
    const { data } = this.state;
    const fieldId = ((data.fields || [])[0] || {}).fieldId || '';
    const item = data.relationControls.find(({ controlId }) => controlId === fieldId);
    const list = data.relationControls.map(({ controlId, controlName }) => ({
      text: controlName,
      value: controlId,
    }));

    return (
      <Fragment>
        <div className="mTop20 bold">
          {data.actionId === TRIGGER_ID_TYPE.FROM_ARRAY ? _l('选择Webhook节点') : _l('选择代码块节点')}
        </div>
        <SelectNodeObject
          smallBorder={true}
          appList={data.flowNodeList}
          selectNodeId={data.selectNodeId}
          selectNodeObj={data.selectNodeObj}
          onChange={selectNodeId => {
            const { data } = this.state;
            const selectNodeObj = _.find(data.flowNodeList, item => item.nodeId === selectNodeId);

            this.updateSource({ selectNodeId, selectNodeObj, fields: [], relationControls: [] }, () => {
              this.getCustomControls(selectNodeObj.appId, selectNodeId);
            });
          }}
        />

        {data.selectNodeId && (
          <Fragment>
            <div className="mTop20 bold">{_l('选择数组')}</div>
            <Dropdown
              className={cx('flowDropdown mTop10', { 'errorBorder errorBG': fieldId && !item })}
              data={list}
              value={fieldId}
              renderTitle={
                !fieldId
                  ? () => <span className="Gray_9e">{_l('请选择')}</span>
                  : fieldId && !item
                  ? () => <span className="errorColor">{_l('字段不存在或已删除')}</span>
                  : () => <span>{item.controlName}</span>
              }
              border
              onChange={fieldId => {
                this.updateSource({ fields: [{ fieldId }], conditions: [] }, () => {
                  this.getArrayFields(data.selectNodeObj.appType, data.selectNodeId, fieldId);
                });
              }}
            />
          </Fragment>
        )}

        {data.selectNodeId && !!(data.fields || []).length && this.renderTriggerCondition()}
      </Fragment>
    );
  }

  /**
   * 从人工节点获取操作明细数据
   */
  renderArtificial() {
    const { data } = this.state;

    return (
      <Fragment>
        <div className="mTop20 bold">{_l('选择节点对象')}</div>
        <SelectNodeObject
          smallBorder={true}
          appList={data.flowNodeList}
          selectNodeId={data.selectNodeId}
          selectNodeObj={data.selectNodeObj}
          onChange={selectNodeId => {
            const { data } = this.state;
            const selectNodeObj = _.find(data.flowNodeList, item => item.nodeId === selectNodeId);

            this.updateSource({ selectNodeId, selectNodeObj, fields: [], relationControls: [] }, () => {
              this.getArtificialControls(selectNodeObj.appId, selectNodeId);
            });
          }}
        />

        {data.selectNodeId && this.renderTriggerCondition()}
      </Fragment>
    );
  }

  /**
   * 切换工作表
   */
  switchWorksheet = (appId, name, otherApkId = '', otherApkName = '') => {
    const appList = _.cloneDeep(this.state.data.appList);

    if (otherApkId) {
      _.remove(appList, item => item.id === appId);
      appList.push({ id: appId, name, otherApkId, otherApkName });
    }

    this.updateSource({ appId, appList, conditions: [], fields: [], controls: [] }, () => {
      this.getWorksheetFields(appId);
    });
  };

  render() {
    const { data, showOtherWorksheet } = this.state;

    if (_.isEmpty(data) || !data.actionId) {
      return <LoadDiv className="mTop15" />;
    }

    return (
      <Fragment>
        <DetailHeader
          data={{ ...data, selectNodeType: this.props.selectNodeType }}
          icon="icon-transport"
          bg="BGYellow"
          closeDetail={this.props.closeDetail}
          updateSource={this.updateSource}
        />
        <div className="flex mTop20">
          <ScrollView>{this.renderContent()}</ScrollView>
        </div>
        <DetailFooter
          isCorrect={
            (data.actionId === TRIGGER_ID_TYPE.FROM_WORKSHEET && data.appId) ||
            (_.includes(
              [TRIGGER_ID_TYPE.FROM_RECORD, TRIGGER_ID_TYPE.FROM_ARRAY, TRIGGER_ID_TYPE.FROM_CODE],
              data.actionId,
            ) &&
              data.selectNodeId &&
              data.fields.length) ||
            (_.includes([TRIGGER_ID_TYPE.FROM_ADD, TRIGGER_ID_TYPE.FROM_ARTIFICIAL], data.actionId) &&
              data.selectNodeId)
          }
          onSave={this.onSave}
          closeDetail={this.props.closeDetail}
        />

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

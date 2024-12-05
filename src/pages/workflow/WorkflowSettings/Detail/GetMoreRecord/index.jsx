import React, { Component, Fragment } from 'react';
import { ScrollView, LoadDiv, Dropdown, Checkbox } from 'ming-ui';
import flowNode from '../../../api/flowNode';
import {
  DetailHeader,
  DetailFooter,
  SelectNodeObject,
  FilterAndSort,
  SpecificFieldsValue,
  FindMode,
  UpdateFields,
} from '../components';
import { ACTION_ID, APP_TYPE } from '../../enum';
import cx from 'classnames';
import SelectOtherWorksheetDialog from 'src/pages/worksheet/components/SelectWorksheet/SelectOtherWorksheetDialog';
import { checkConditionsIsNull } from '../../utils';
import _ from 'lodash';
import { Tooltip } from 'antd';

export default class GetMoreRecord extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      saveRequest: false,
      showOtherWorksheet: false,
      cacheKey: +new Date(),
      noAction: false,
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
      nextProps.selectNodeId === this.props.selectNodeId &&
      !_.isEmpty(this.state.data)
    ) {
      this.updateSource({ name: nextProps.selectNodeName });
    }
  }

  /**
   * 获取节点详情
   */
  getNodeDetail(props, extra = {}) {
    const { processId, selectNodeId, selectNodeType, instanceId } = props;
    const { data } = this.state;

    flowNode
      .getNodeDetail({ processId, nodeId: selectNodeId, flowNodeType: selectNodeType, instanceId, ...extra })
      .then(result => {
        this.setState({
          data: _.isEmpty(extra) ? result : { ...result, name: data.name },
          cacheKey: +new Date(),
          noAction: !result.actionId || !!extra.actionId,
        });
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
    const {
      name,
      actionId,
      appId,
      conditions,
      selectNodeId,
      fields,
      sorts,
      numberFieldValue,
      execute,
      filters,
      destroy,
      random,
    } = data;

    if (_.includes([ACTION_ID.FROM_WORKSHEET, ACTION_ID.BATCH_UPDATE, ACTION_ID.BATCH_DELETE], actionId) && !appId) {
      alert(_l('必须选择工作表'), 2);
      return;
    }

    if (
      _.includes(
        [
          ACTION_ID.FROM_RECORD,
          ACTION_ID.FROM_ARRAY,
          ACTION_ID.FROM_API_ARRAY,
          ACTION_ID.FROM_CODE_ARRAY,
          ACTION_ID.FROM_PBC_INPUT_ARRAY,
          ACTION_ID.FROM_PBC_OUTPUT_ARRAY,
          ACTION_ID.FROM_JSON_PARSE_ARRAY,
        ],
        actionId,
      )
    ) {
      if (!selectNodeId) {
        alert(actionId === ACTION_ID.FROM_RECORD ? _l('必须选择对象') : _l('必须选择节点'), 2);
        return;
      } else if (!fields.length) {
        alert(actionId === ACTION_ID.FROM_RECORD ? _l('必须选择他表字段') : _l('必须选择数组'), 2);
        return;
      }
    }

    if (actionId === ACTION_ID.FROM_ADD && !selectNodeId) {
      alert(_l('必须选择新增记录节点'), 2);
      return;
    }

    if (actionId === ACTION_ID.FROM_ARTIFICIAL && !selectNodeId) {
      alert(_l('必须选择对象'), 2);
      return;
    }

    if (checkConditionsIsNull(conditions)) {
      alert(_l('筛选条件的判断值不能为空'), 2);
      return;
    }

    if (filters.length) {
      let hasError = false;

      filters.forEach(item => {
        if (checkConditionsIsNull(item.conditions)) {
          hasError = true;
        }
      });

      if (hasError) {
        alert(_l('筛选条件的判断值不能为空'), 2);
        return;
      }
    }

    if (
      _.includes([ACTION_ID.FROM_WORKSHEET, ACTION_ID.FROM_RECORD], data.actionId) &&
      random &&
      !numberFieldValue.fieldValue &&
      !numberFieldValue.fieldControlId
    ) {
      alert(_l('最多获取条数不能为空'), 2);
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
        execute,
        filters,
        destroy,
        random,
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
        nodeId: this.props.selectNodeId,
      })
      .then(result => {
        this.updateSource({ controls: result.controls });
      });
  };

  /**
   * 获取发送API请求数组的参数
   */
  getArrayFields = (appType, selectNodeId, controlId) => {
    const { processId } = this.props;

    flowNode
      .getStartEventDeploy({
        processId,
        nodeId: this.props.selectNodeId,
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
            data.actionId === ACTION_ID.FROM_RECORD
              ? result.filter(item => item.type === 29)
              : result.filter(item => _.includes([10000003, 10000007, 10000008], item.type)),
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
      [ACTION_ID.FROM_WORKSHEET]: _l('从工作表获取记录'),
      [ACTION_ID.FROM_RECORD]: _l('从记录获取关联记录'),
      [ACTION_ID.FROM_ADD]: _l('从新增节点获取记录'),
      [ACTION_ID.FROM_ARTIFICIAL]: _l('从人工节点获取操作明细'),
    };
    const { workflowBatchGetDataLimitCount, workflowSubProcessDataLimitCount, worktableBatchOperateDataLimitCount } =
      md.global.SysSettings;
    const isSelect =
      (_.includes([ACTION_ID.FROM_WORKSHEET, ACTION_ID.BATCH_UPDATE, ACTION_ID.BATCH_DELETE], data.actionId) &&
        data.appId) ||
      (data.actionId === ACTION_ID.FROM_ADD && data.selectNodeId) ||
      (data.actionId === ACTION_ID.FROM_RECORD && data.selectNodeId && !!(data.fields || []).length);
    const limitCount = data.actionId === ACTION_ID.FROM_WORKSHEET ? _l('100万') : workflowSubProcessDataLimitCount;

    return (
      <div className="workflowDetailBox">
        {data.actionId &&
          !_.includes(
            [
              ACTION_ID.FROM_ARRAY,
              ACTION_ID.FROM_API_ARRAY,
              ACTION_ID.FROM_CODE_ARRAY,
              ACTION_ID.FROM_PBC_INPUT_ARRAY,
              ACTION_ID.FROM_PBC_OUTPUT_ARRAY,
              ACTION_ID.FROM_JSON_PARSE_ARRAY,
              ACTION_ID.BATCH_UPDATE,
              ACTION_ID.BATCH_DELETE,
            ],
            data.actionId,
          ) && <div className="bold mBottom20">{actionTypes[data.actionId]}</div>}

        <div className="Font14 Gray_75 workflowDetailDesc">
          {!_.includes([ACTION_ID.BATCH_UPDATE, ACTION_ID.BATCH_DELETE], data.actionId) &&
            _l(
              '您获取的多条数据可供本流程的数据处理节点或子流程节点使用。被数据处理节点（新增、更新、删除）使用，最多支持%0条。被子流程节点使用，最多支持%1条。',
              workflowBatchGetDataLimitCount,
              limitCount,
            )}

          {data.actionId === ACTION_ID.FROM_RECORD &&
            _l('注：此方式最多获取1000条关联记录，如果需要获取更多数据，请使用“从工作表获取记录”的方式。')}

          {data.actionId === ACTION_ID.BATCH_UPDATE &&
            _l(
              '在本节点内更新最大支持%0行。更新后数据可供流程中其他数据处理节点或子流程节点继续使用。被数据处理节点（新增、更新、删除）使用，最多支持100条。',
              worktableBatchOperateDataLimitCount,
            )}

          {data.actionId === ACTION_ID.BATCH_DELETE &&
            _l('在本节点内删除，最大支持%0行。此节点对象不能被流程中其他节点使用', worktableBatchOperateDataLimitCount)}
        </div>

        {(!data.actionId ||
          _.includes(
            [
              ACTION_ID.FROM_ARRAY,
              ACTION_ID.FROM_API_ARRAY,
              ACTION_ID.FROM_CODE_ARRAY,
              ACTION_ID.FROM_PBC_INPUT_ARRAY,
              ACTION_ID.FROM_PBC_OUTPUT_ARRAY,
              ACTION_ID.FROM_JSON_PARSE_ARRAY,
              ACTION_ID.FROM_PLUGIN_ARRAY,
            ],
            data.actionId,
          )) &&
          this.renderSelectArrayType()}

        {_.includes([ACTION_ID.FROM_WORKSHEET, ACTION_ID.BATCH_UPDATE, ACTION_ID.BATCH_DELETE], data.actionId) &&
          this.renderWorksheet()}
        {data.actionId === ACTION_ID.FROM_RECORD && this.renderRecord()}
        {data.actionId === ACTION_ID.FROM_ADD && this.renderAdd()}
        {_.includes(
          [
            ACTION_ID.FROM_ARRAY,
            ACTION_ID.FROM_API_ARRAY,
            ACTION_ID.FROM_CODE_ARRAY,
            ACTION_ID.FROM_PBC_INPUT_ARRAY,
            ACTION_ID.FROM_PBC_OUTPUT_ARRAY,
            ACTION_ID.FROM_JSON_PARSE_ARRAY,
            ACTION_ID.FROM_PLUGIN_ARRAY,
          ],
          data.actionId,
        ) && this.renderArray()}
        {data.actionId === ACTION_ID.FROM_ARTIFICIAL && this.renderArtificial()}

        {data.actionId && isSelect && (
          <Fragment>
            <div className="mTop20 bold">{_l('限制数量')}</div>
            <div className="Font13 Gray_75 mTop5">{_l('最多获取条数')}</div>
            <div className="mTop10">
              <SpecificFieldsValue
                projectId={this.props.companyId}
                processId={this.props.processId}
                relationId={this.props.relationId}
                selectNodeId={this.props.selectNodeId}
                updateSource={numberFieldValue => this.updateSource({ numberFieldValue })}
                type="number"
                max={1000000}
                allowedEmpty
                data={data.numberFieldValue}
              />
            </div>
          </Fragment>
        )}

        {data.actionId === ACTION_ID.BATCH_UPDATE && isSelect && this.renderBatchUpdate()}

        {data.actionId === ACTION_ID.BATCH_DELETE && isSelect && this.renderBatchDelete()}

        {_.includes([ACTION_ID.FROM_WORKSHEET, ACTION_ID.FROM_RECORD, ACTION_ID.FROM_ADD], data.actionId) &&
          isSelect && <FindMode execute={data.execute} onChange={execute => this.updateSource({ execute })} />}
      </div>
    );
  }

  /**
   * 渲染选择数组类型
   */
  renderSelectArrayType() {
    const { flowInfo } = this.props;
    const { data, noAction } = this.state;
    const list = [
      { text: _l('发送API请求数组'), value: ACTION_ID.FROM_ARRAY },
      { text: _l('调用已集成API数组'), value: ACTION_ID.FROM_API_ARRAY },
      { text: _l('代码块数组'), value: ACTION_ID.FROM_CODE_ARRAY },
      { text: _l('业务流程输入数组'), value: ACTION_ID.FROM_PBC_INPUT_ARRAY },
      { text: _l('业务流程输出数组'), value: ACTION_ID.FROM_PBC_OUTPUT_ARRAY },
      { text: _l('JSON解析数组'), value: ACTION_ID.FROM_JSON_PARSE_ARRAY },
      { text: _l('插件数组'), value: ACTION_ID.FROM_PLUGIN_ARRAY },
    ];

    if (flowInfo.startAppType !== APP_TYPE.PBC || flowInfo.child) {
      _.remove(list, item => _.includes([ACTION_ID.FROM_PBC_INPUT_ARRAY], item.value));
    }

    return (
      <Fragment>
        <div className="mTop20 bold">{_l('选择数据类型')}</div>
        <Dropdown
          className="flowDropdown mTop10"
          data={list}
          value={data.actionId}
          disabled={!noAction}
          border
          onChange={actionId => {
            this.updateSource({ actionId });
            this.getNodeDetail(this.props, { actionId });
          }}
        />
      </Fragment>
    );
  }

  /**
   * 渲染筛选条件
   */
  renderTriggerCondition() {
    const { data, cacheKey } = this.state;

    return (
      <FilterAndSort
        key={cacheKey}
        companyId={this.props.companyId}
        processId={this.props.processId}
        relationId={this.props.relationId}
        selectNodeId={this.props.selectNodeId}
        openNewFilter={
          !data.conditions.length &&
          _.includes(
            [
              ACTION_ID.FROM_WORKSHEET,
              ACTION_ID.FROM_RECORD,
              ACTION_ID.FROM_ADD,
              ACTION_ID.BATCH_UPDATE,
              ACTION_ID.BATCH_DELETE,
            ],
            data.actionId,
          )
        }
        disabledNewFilter={
          !_.includes(
            [
              ACTION_ID.FROM_WORKSHEET,
              ACTION_ID.FROM_RECORD,
              ACTION_ID.FROM_ADD,
              ACTION_ID.BATCH_UPDATE,
              ACTION_ID.BATCH_DELETE,
            ],
            data.actionId,
          )
        }
        data={data}
        updateSource={this.updateSource}
        filterText={
          <Fragment>
            {_l('设置筛选条件，获得满足条件的数据。如果未设置筛选条件，则获得所有数据')}
            {data.actionId === ACTION_ID.FROM_WORKSHEET && (
              <Tooltip title={_l('请谨慎选择“他表字段”作为条件字段，可能因为数据同步更新延迟而导致结果非预期')}>
                <i className="icon-knowledge-message Font16 mLeft5 Gray_9e" />
              </Tooltip>
            )}
          </Fragment>
        }
        filterEncryptCondition={data.actionId === ACTION_ID.FROM_WORKSHEET}
        showRandom={data.actionId === ACTION_ID.FROM_WORKSHEET}
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
              ? () => <span className="Gray_75">{_l('请选择')}</span>
              : data.appId && !selectAppItem
              ? () => <span className="errorColor">{_l('工作表无效或已删除')}</span>
              : () => (
                  <Fragment>
                    <span>{selectAppItem.name}</span>
                    {selectAppItem.otherApkName && <span className="Gray_75">（{selectAppItem.otherApkName}）</span>}
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
                  ? () => <span className="Gray_75">{_l('请选择')}</span>
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

            this.updateSource({ selectNodeId, selectNodeObj, appType: selectNodeObj.appType }, () => {
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
    const ArrayTitle = {
      [ACTION_ID.FROM_ARRAY]: _l('选择发送API请求节点'),
      [ACTION_ID.FROM_API_ARRAY]: _l('选择API节点'),
      [ACTION_ID.FROM_CODE_ARRAY]: _l('选择代码块节点'),
      [ACTION_ID.FROM_PBC_INPUT_ARRAY]: _l('选择业务流程节点'),
      [ACTION_ID.FROM_PBC_OUTPUT_ARRAY]: _l('选择业务流程节点'),
      [ACTION_ID.FROM_JSON_PARSE_ARRAY]: _l('选择JSON解析节点'),
      [ACTION_ID.FROM_PLUGIN_ARRAY]: _l('选择插件节点'),
    };

    return (
      <Fragment>
        <div className="mTop20 bold">{ArrayTitle[data.actionId]}</div>
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
                  ? () => <span className="Gray_75">{_l('请选择')}</span>
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
    const { data } = this.state;
    const appList = _.cloneDeep(this.state.data.appList);

    if (otherApkId) {
      _.remove(appList, item => item.id === appId);
      appList.push({ id: appId, name, otherApkId, otherApkName });
    }

    if (data.actionId === ACTION_ID.BATCH_UPDATE) {
      this.getNodeDetail(this.props, { appId });
    } else {
      this.updateSource({ appId, appList, conditions: [], filters: [], fields: [], controls: [] }, () => {
        this.getWorksheetFields(appId);
      });
    }
  };

  /**
   * 渲染批量更新
   */
  renderBatchUpdate() {
    const { data } = this.state;

    return (
      <Fragment>
        <div className="actionFieldsSplit mRight0 mTop30" />

        <div className="mTop30 bold">{_l('获取后，更新记录')}</div>
        <div className="mTop5 Gray_75">{_l('最大更新1000行数据')}</div>

        <UpdateFields
          companyId={this.props.companyId}
          relationId={this.props.relationId}
          processId={this.props.processId}
          selectNodeId={this.props.selectNodeId}
          nodeId={data.selectNodeId}
          controls={data.addControls}
          fields={data.fields}
          formulaMap={data.formulaMap}
          updateSource={this.updateSource}
          isBatch
        />
      </Fragment>
    );
  }

  /**
   * 渲染批量删除
   */
  renderBatchDelete() {
    const { data } = this.state;

    return (
      <Fragment>
        <div className="actionFieldsSplit mRight0 mTop30" />

        <div className="mTop30 bold">{_l('获取后，删除记录')}</div>
        <div className="mTop5 Gray_75">{_l('最大删除1000行数据')}</div>

        <div className="mTop15 flexRow">
          <Checkbox
            className="InlineFlex"
            text={_l('彻底删除记录，不放入回收站')}
            checked={data.destroy}
            onClick={checked => this.updateSource({ destroy: !checked })}
          />
        </div>
        <div className="Gray_75 mTop5 mLeft26">{_l('彻底删除后数据不可恢复，请谨慎操作')}</div>
      </Fragment>
    );
  }

  render() {
    const { data, showOtherWorksheet } = this.state;

    if (_.isEmpty(data)) {
      return <LoadDiv className="mTop15" />;
    }

    return (
      <Fragment>
        <DetailHeader
          {...this.props}
          data={{ ...data }}
          icon="icon-transport"
          bg="BGYellow"
          updateSource={this.updateSource}
        />
        <div className="flex">
          <ScrollView>{this.renderContent()}</ScrollView>
        </div>
        <DetailFooter
          {...this.props}
          isCorrect={
            (_.includes([ACTION_ID.FROM_WORKSHEET, ACTION_ID.BATCH_UPDATE, ACTION_ID.BATCH_DELETE], data.actionId) &&
              data.appId) ||
            (_.includes(
              [
                ACTION_ID.FROM_RECORD,
                ACTION_ID.FROM_ARRAY,
                ACTION_ID.FROM_API_ARRAY,
                ACTION_ID.FROM_CODE_ARRAY,
                ACTION_ID.FROM_PBC_INPUT_ARRAY,
                ACTION_ID.FROM_PBC_OUTPUT_ARRAY,
                ACTION_ID.FROM_JSON_PARSE_ARRAY,
                ACTION_ID.FROM_PLUGIN_ARRAY,
              ],
              data.actionId,
            ) &&
              data.selectNodeId &&
              data.fields.length) ||
            (_.includes([ACTION_ID.FROM_ADD, ACTION_ID.FROM_ARTIFICIAL], data.actionId) && data.selectNodeId)
          }
          onSave={this.onSave}
        />

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

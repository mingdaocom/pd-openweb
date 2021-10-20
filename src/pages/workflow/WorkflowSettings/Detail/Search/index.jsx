import React, { Component, Fragment } from 'react';
import { ScrollView, LoadDiv, Dropdown } from 'ming-ui';
import flowNode from '../../../api/flowNode';
import {
  DetailHeader,
  DetailFooter,
  SingleControlValue,
  SelectNodeObject,
  FilterAndSort,
  FindResult,
} from '../components';
import { CONTROLS_NAME, RELATION_TYPE, TRIGGER_ID_TYPE } from '../../enum';
import SelectOtherWorksheetDialog from 'src/pages/worksheet/components/SelectWorksheet/SelectOtherWorksheetDialog';
import { checkConditionsIsNull } from '../../utils';

export default class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      saveRequest: false,
      showOtherWorksheet: false,
      cacheKey: +new Date(),
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
  getNodeDetail(props, obj = {}) {
    const { processId, selectNodeId, selectNodeType } = props;

    flowNode
      .getNodeDetail({
        processId,
        nodeId: selectNodeId,
        flowNodeType: selectNodeType,
        appId: obj.appId,
        selectNodeId: obj.selectNodeId,
      })
      .then(result => {
        result.fields = _.filter(result.fields, o => !_.includes([31, 32, 33], o.type));
        this.setState({ data: result, cacheKey: +new Date() });
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
    const { name, appId, findFields, executeType, fields, selectNodeId, conditions, sorts, random } = data;

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
        appId,
        findFields,
        executeType,
        fields,
        selectNodeId,
        operateCondition: conditions,
        sorts,
        random,
      })
      .then(result => {
        this.props.updateNodeData(result);
        this.props.closeDetail();
      });

    this.setState({ saveRequest: true });
  };

  /**
   * 渲染内容
   */
  renderContent() {
    const { data } = this.state;

    return (
      <Fragment>
        <div className="Gray_75 workflowDetailDesc pTop15 pBottom15">
          {_l('基于一种获取方式，通过筛选条件和排序规则获得符合条件的唯一数据，供流程中的其他节点使用。')}
        </div>

        {data.actionId === TRIGGER_ID_TYPE.WORKSHEET_FIND ? (
          this.renderWorksheet()
        ) : (
          <Fragment>
            <div className="mTop20 bold">{_l('选择多条数据节点')}</div>
            <SelectNodeObject
              appList={data.flowNodeAppDtos}
              selectNodeId={data.selectNodeId}
              selectNodeObj={data.selectNodeObj}
              onChange={selectNodeId => this.getNodeDetail(this.props, { selectNodeId })}
            />
            {this.renderFieldAndRule()}
            {data.selectNodeId && (
              <FindResult executeType={data.executeType} switchExecuteType={this.switchExecuteType} />
            )}
          </Fragment>
        )}
      </Fragment>
    );
  }

  /**
   * 渲染工作表
   */
  renderWorksheet() {
    const { data, cacheKey } = this.state;
    const singleItem = (data.findFields || []).length ? data.findFields[0] : { fieldId: '' };
    const selectAppItem = data.appList.find(({ id }) => id === data.appId);
    const appList = data.appList
      .filter(item => !item.otherApkId)
      .map(item => {
        return {
          text: item.name,
          value: item.id,
          className: item.id === data.appId ? 'ThemeColor3' : '',
        };
      });
    const otherWorksheet = [
      {
        text: _l('其它应用下的工作表'),
        value: 'other',
        className: 'Gray_75',
      },
    ];

    const list = _.filter(
      data.controls,
      o => _.includes([2, 3, 4, 5, 6, 7, 8, 31, 32, 33], o.type) || (o.type === 37 && o.enumDefault2 === 6),
    ).map(item => {
      return {
        text: this.renderFieldsTitle(item),
        value: item.controlId,
        disabled: !!_.find(data.findFields, o => o.fieldId === item.controlId),
      };
    });

    return (
      <Fragment>
        <div className="mTop20 bold">{_l('选择工作表')}</div>
        <Dropdown
          className="flowDropdown flowDropdownBorder mTop10"
          data={[appList, this.props.relationType === RELATION_TYPE.NETWORK ? [] : otherWorksheet]}
          value={data.appId}
          renderTitle={
            !data.appId
              ? () => <span className="Gray_9e">{_l('请选择工作表')}</span>
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
          noData={_l('暂无工作表，请先在应用里创建')}
          onChange={appId => {
            if (appId === 'other') {
              this.setState({ showOtherWorksheet: true });
            } else {
              this.getNodeDetail(this.props, { appId });
            }
          }}
        />

        {data.findFields.length ? (
          <Fragment>
            <div className="mTop20 bold">{_l('选择字段')}</div>
            <Dropdown
              className="flowDropdown mTop10"
              data={list}
              value={singleItem.fieldId || undefined}
              border
              isAppendToBody
              placeholder={_l('请选择字段')}
              renderTitle={() =>
                singleItem.fieldId &&
                this.renderFieldsTitle(_.find(data.controls, obj => obj.controlId === singleItem.fieldId))
              }
              onChange={this.switchFields}
            />

            <div className="mTop20 bold">{_l('查找')}</div>
            <SingleControlValue
              companyId={this.props.companyId}
              processId={this.props.processId}
              selectNodeId={this.props.selectNodeId}
              controls={data.controls}
              formulaMap={data.formulaMap}
              fields={data.findFields}
              updateSource={this.updateFindFields}
              item={singleItem}
              i={0}
            />

            <div
              className="workflowDetailDesc pTop15 pBottom15 mTop20"
              style={{ background: 'rgba(255, 163, 64, 0.12)' }}
            >
              <div className="Gray_9e">{_l('新版查找方式支持通过多个筛选条件和排序规则来实现更精准查找。')}</div>
              <div className="mBottom5">
                {_l('注意：切换后您需要重新配置查找规则')}
                <span className="Gray_9e">{_l('，是否切换为新版？')}</span>
              </div>
              <span
                className="ThemeColor3 ThemeHoverColor2 pointer"
                onClick={() => this.getNodeDetail(this.props, { appId: data.appId })}
              >
                {_l('切换为新版，并重新配置')}
              </span>
            </div>
          </Fragment>
        ) : (
          this.renderFieldAndRule()
        )}

        {data.appId && (
          <FindResult executeType={data.executeType} allowAdd={true} switchExecuteType={this.switchExecuteType} />
        )}

        {data.appId && data.executeType === 1 && (
          <Fragment>
            <div className="actionFieldsSplit mRight0 mTop30" />
            <div className="Font13 mTop25 bold">{_l('新增记录')}</div>
            {data.fields.map((item, i) => {
              const singleObj = _.find(data.addControls, obj => obj.controlId === item.fieldId);
              const { controlName, sourceEntityName } = singleObj;
              return (
                <div key={i} className="relative">
                  <div className="mTop15 ellipsis Font13">
                    {controlName || singleObj.controlName}
                    {singleObj.required && <span className="mLeft5 red">*</span>}
                    {singleObj.type === 29 && (
                      <span className="Gray_9e">{`（${_l('工作表')}“${sourceEntityName}”）`}</span>
                    )}
                  </div>
                  <SingleControlValue
                    key={cacheKey + i}
                    companyId={this.props.companyId}
                    processId={this.props.processId}
                    selectNodeId={this.props.selectNodeId}
                    controls={data.addControls}
                    formulaMap={data.formulaMap}
                    fields={data.fields}
                    updateSource={this.updateSource}
                    item={item}
                    i={i}
                  />
                </div>
              );
            })}
          </Fragment>
        )}
      </Fragment>
    );
  }

  /**
   * fields dropdown title
   */
  renderFieldsTitle(item) {
    if (!item) {
      return <span style={{ color: '#f44336' }}>{_l('字段已删除')}</span>;
    }

    return (
      <Fragment>
        <span className="Gray_9e mRight5">[{CONTROLS_NAME[item.type === 37 ? item.enumDefault2 : item.type]}]</span>
        <span>{item.controlName}</span>
      </Fragment>
    );
  }

  /**
   * 切换字段
   */
  switchFields = fieldId => {
    const { data } = this.state;
    const singleControl = _.find(data.controls, item => item.controlId === fieldId);
    const findFields = [
      {
        fieldId,
        type: singleControl.type,
        enumDefault: singleControl.enumDefault,
        fieldValue: singleControl.type === 26 || singleControl.type === 27 ? '[]' : '',
        fieldValueId: '',
        nodeId: '',
      },
    ];

    this.updateSource({ findFields, executeType: 2, fields: [] });
  };

  /**
   * 更新查找的值
   */
  updateFindFields = ({ fields, formulaMap }, callback = () => {}) => {
    if (fields) {
      const obj = fields[0];
      if (
        (obj.type !== 26 && obj.type !== 27 && obj.fieldValue) ||
        ((obj.type === 26 || obj.type === 27) && obj.fieldValue !== '[]') ||
        obj.fieldValueId
      ) {
        this.updateSource({ findFields: fields }, callback);
      } else {
        this.updateSource({ findFields: fields, executeType: 2, fields: [] }, callback);
      }
    }

    if (formulaMap) {
      this.updateSource({ formulaMap }, callback);
    }
  };

  /**
   * 切换后续执行方式
   */
  switchExecuteType = executeType => {
    const { data } = this.state;
    const fields = [];

    if (executeType === 1) {
      data.addControls.forEach(item => {
        fields.push({
          fieldId: item.controlId,
          type: item.type,
          enumDefault: item.enumDefault,
          nodeId: '',
          nodeName: '',
          fieldValueId: '',
          fieldValueName: '',
          fieldValue: item.type === 26 || item.type === 27 ? '[]' : '',
        });
      });
    }

    this.updateSource({ executeType, fields });
  };

  /**
   * 渲染字段和规则
   */
  renderFieldAndRule() {
    const { data } = this.state;

    if (!data.appId && !data.selectNodeId) return null;

    return (
      <FilterAndSort
        companyId={this.props.companyId}
        processId={this.props.processId}
        selectNodeId={this.props.selectNodeId}
        data={data}
        updateSource={this.updateSource}
        showRandom={true}
        filterText={_l(
          '设置筛选条件，查找满足条件的数据。如果未添加筛选条件则表示只通过排序规则从所有记录中获得唯一数据',
        )}
        sortText={_l('当查找到多个数据时，将按照以下排序规则获得第一条数据。如果未设置规则，返回最新创建的一条数据')}
      />
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
          data={{ ...data, selectNodeType: this.props.selectNodeType }}
          icon="icon-search"
          bg="BGYellow"
          closeDetail={this.props.closeDetail}
          updateSource={this.updateSource}
        />
        <div className="flex mTop20">
          <ScrollView>
            <div className="workflowDetailBox">{this.renderContent()}</div>
          </ScrollView>
        </div>
        <DetailFooter
          isCorrect={!!data.appId || !!data.selectNodeId}
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
            onOk={(selectedAppId, selectedWrorkesheetId) =>
              this.getNodeDetail(this.props, { appId: selectedWrorkesheetId })
            }
            onHide={() => this.setState({ showOtherWorksheet: false })}
          />
        )}
      </Fragment>
    );
  }
}

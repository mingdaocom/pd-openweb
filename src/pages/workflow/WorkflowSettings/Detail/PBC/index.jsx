import React, { Component, Fragment } from 'react';
import { ScrollView, LoadDiv, Dropdown, Radio, Checkbox } from 'ming-ui';
import flowNode from '../../../api/flowNode';
import {
  DetailHeader,
  DetailFooter,
  SingleControlValue,
  SpecificFieldsValue,
  SelectNodeObject,
  SelectOtherPBCDialog,
} from '../components';
import { CONTROLS_NAME, ACTION_ID } from '../../enum';
import { v4 as uuidv4 } from 'uuid';
import styled from 'styled-components';

const ErrorTips = styled.div`
  position: absolute;
  bottom: 25px;
  transform: translateY(-7px);
  z-index: 1;
  left: 0;
  border-radius: 3px;
  color: #fff;
  padding: 5px 12px;
  white-space: nowrap;
  background: #f44336;
  font-size: 12px;
  .errorArrow {
    position: absolute;
    transform: translateY(-5px);
    z-index: 1;
    left: 12px;
    background: transparent;
    border: 6px solid transparent;
    border-top-color: #f44336;
    bottom: -17px;
  }
`;

export default class PBC extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      saveRequest: false,
      errorItems: [],
      execCountType: 1,
      showOtherPBC: false,
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
  getNodeDetail(props, { appId } = {}) {
    const { processId, selectNodeId, selectNodeType } = props;

    flowNode.getNodeDetail({ processId, nodeId: selectNodeId, flowNodeType: selectNodeType, appId }).then(result => {
      if (result.actionId === ACTION_ID.PBC_OUT && !result.fields.length) {
        result.fields = [{ fieldName: '', desc: '', type: 2, fieldId: uuidv4() }];
      }

      if (appId && result.name === _l('调用业务流程')) {
        result.name = result.appList.find(item => item.id === appId).name;
      }

      this.setState({ data: result, errorItems: [], execCountType: result.selectNodeId ? 2 : 1 });
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
    const { data, saveRequest, errorItems } = this.state;
    const { appId, name, fields, executeType, number, selectNodeId, nextExecute, subProcessVariables } = data;
    const isPBCOut = data.actionId === ACTION_ID.PBC_OUT;

    if (!appId && !isPBCOut) {
      alert(_l('请选择业务流程'), 2);
      return;
    }

    // PBC 输出参数
    if (isPBCOut) {
      if (errorItems.filter(item => item).length) {
        alert(_l('有参数配置错误'), 2);
        return;
      }

      if (fields.filter(item => !item.fieldName).length) {
        alert(_l('参数名称不能为空'), 2);
        return;
      }
    }

    if (!isPBCOut && executeType !== 0 && !number.fieldValue && !number.fieldControlId && !selectNodeId) {
      alert(_l('执行次数不能为空'), 2);
      return;
    }

    // 验证必填项
    let hasError = 0;
    fields.forEach(item => {
      if (
        ((subProcessVariables || []).find(o => o.controlId === item.controlId) || {}).require &&
        !item.fieldValue &&
        !item.fieldValueId
      ) {
        hasError++;
      }
    });

    if (hasError > 0) {
      alert(_l('有必填字段未填写'), 2);
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
        appId,
        name: name.trim(),
        fields,
        executeType,
        number,
        selectNodeId,
        nextExecute,
      })
      .then(result => {
        this.props.updateNodeData(result);
        this.props.closeDetail();
      });

    this.setState({ saveRequest: true });
  };

  /**
   * 渲染PBC输出节点
   */
  renderExportContent() {
    const { data, errorItems } = this.state;

    return (
      <Fragment>
        <div className="bold">{_l('输出参数')}</div>

        {data.fields.map((item, index) => {
          return (
            <Fragment key={index}>
              <div className="mTop8 flexRow relative alignItemsCenter">
                <input
                  type="text"
                  className="ThemeBorderColor3 actionControlBox pTop0 pBottom0 pLeft10 pRight10 mTop8"
                  style={{ width: 190 }}
                  placeholder={_l('名称')}
                  value={item.fieldName}
                  maxLength={64}
                  onChange={e => {
                    const value = e.target.value;

                    if (value) {
                      if (data.fields.filter((o, i) => value.trim() === o.fieldName && i !== index).length === 1) {
                        errorItems[index] = 1;
                      } else {
                        errorItems[index] = '';
                      }
                    } else {
                      errorItems[index] = '';
                    }

                    this.updateExportFields('fieldName', value, index);

                    data.fields.forEach((element, i) => {
                      if (i !== index && !_.find(data.fields, (o, j) => o.fieldName === element.fieldName && i !== j)) {
                        errorItems[i] = '';
                      }
                    });
                    this.setState({ errorItems });
                  }}
                  onBlur={e => this.updateExportFields('fieldName', e.target.value.trim(), index)}
                />
                <div className="flex mLeft10">
                  <SingleControlValue
                    companyId={this.props.companyId}
                    processId={this.props.processId}
                    selectNodeId={this.props.selectNodeId}
                    controls={data.fields}
                    formulaMap={data.formulaMap}
                    fields={data.fields}
                    updateSource={this.updateSource}
                    item={item}
                    i={index}
                  />
                </div>
                <i
                  className="icon-delete2 Font16 Gray_9e ThemeHoverColor3 mLeft10 pointer mTop8"
                  onClick={() => {
                    let fields = [].concat(data.fields);

                    _.remove(fields, (o, i) => i === index);
                    _.remove(errorItems, (o, i) => i === index);

                    fields.forEach((element, i) => {
                      if (!_.find(fields, (o, j) => o.fieldName === element.fieldName && i !== j)) {
                        errorItems[i] = '';
                      }
                    });

                    this.setState({ errorItems });
                    this.updateSource({ fields });
                  }}
                />
                {errorItems[index] && (
                  <ErrorTips>
                    {_l('名称不允许重复')}
                    <i className="errorArrow" />
                  </ErrorTips>
                )}
              </div>
              <div className="mTop10 flexRow alignItemsCenter">
                <input
                  type="text"
                  className="ThemeBorderColor3 actionControlBox pTop0 pBottom0 pLeft10 pRight10 flex"
                  placeholder={_l('说明')}
                  value={item.desc}
                  onChange={evt => this.updateExportFields('desc', evt.target.value, index)}
                  onBlur={evt => this.updateExportFields('desc', evt.target.value.trim(), index)}
                />
              </div>
            </Fragment>
          );
        })}

        <div className="addActionBtn mTop25">
          <span
            className="ThemeBorderColor3"
            onClick={() => {
              const fields = [].concat(data.fields);

              fields.push({ fieldName: '', desc: '', type: 2, fieldId: uuidv4() });
              this.updateSource({ fields });
            }}
          >
            <i className="icon-add Font16" />
            {_l('添加参数')}
          </span>
        </div>
      </Fragment>
    );
  }

  /**
   * 更新输出PBC字段的值
   */
  updateExportFields = (key, value, index) => {
    const { data } = this.state;
    let fields = [].concat(data.fields);

    fields[index][key] = value;

    this.updateSource({ fields });
  };

  /**
   * 渲染内容
   */
  renderContent() {
    const { data } = this.state;
    const MODES = [{ text: _l('执行单次'), value: 0 }, { text: _l('执行多次'), value: 1 }];
    const executeTypes = [
      {
        text: _l('并行'),
        value: 1,
        desc: _l('同时执行多条业务流程，即便某条业务流程运行中止，也不影响其他业务流程的执行。'),
      },
      {
        text: _l('逐条执行'),
        value: 2,
        desc: _l(
          '依次执行多条业务流程，每条业务流程需要等前一条业务流程通过后再开始触发；如果某条业务流程运行中止，则后续的业务流程都不再触发。',
        ),
      },
    ];

    return (
      <Fragment>
        <div className="bold">{_l('选择业务流程')}</div>
        {this.renderSelectPBC()}

        {data.appId && (
          <Fragment>
            <div className="mTop20 bold">{_l('执行方式')}</div>
            {MODES.map((item, index) => {
              return (
                <div key={index} className="mTop10">
                  <Radio
                    text={item.text}
                    checked={item.value === data.executeType || (item.value === 1 && data.executeType === 2)}
                    onClick={() => this.updateSource({ executeType: item.value })}
                  />
                </div>
              );
            })}

            {data.executeType !== 0 && (
              <Fragment>
                <div className="mTop20 bold">{_l('执行次数')}</div>
                {this.renderExecCount()}
                <div className="mTop20 bold">{_l('多条业务流程的执行方式')}</div>
                {executeTypes.map((item, i) => {
                  return (
                    <div className="mTop15" key={i}>
                      <Radio
                        text={item.text}
                        checked={data.executeType === item.value}
                        onClick={() => this.updateSource({ executeType: item.value })}
                      />
                      <div className="mTop10 mLeft30 Gray_9e">{item.desc}</div>
                    </div>
                  );
                })}
              </Fragment>
            )}

            <div className="mTop20">
              <Checkbox
                className="bold"
                text={_l('业务流程执行完毕后，再开始下一个节点')}
                checked={data.nextExecute}
                onClick={checked => this.updateSource({ nextExecute: !checked })}
              />
            </div>
            <div className="mLeft25 mTop5 Gray_9e">
              {_l('勾选后，当执行次数为单次时，之后节点可使用业务流程的输出参数')}
            </div>

            <div className="mTop20 bold">{_l('传递参数')}</div>
            <div className="mTop5 Gray_9e">{_l('向业务流程的输入参数传递初始值，供其执行时使用')}</div>
            {this.renderParameterFiled()}
          </Fragment>
        )}
      </Fragment>
    );
  }

  /**
   * 渲染选择PBC
   */
  renderSelectPBC() {
    const { data } = this.state;
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
    const otherPBC = [
      {
        text: _l('其它应用下的封装业务流程'),
        value: 'other',
        className: 'Gray_75',
      },
    ];

    return (
      <Dropdown
        className="flowDropdown mTop10"
        data={[appList, otherPBC]}
        value={data.appId}
        renderTitle={
          !data.appId
            ? () => <span className="Gray_9e">{_l('请选择')}</span>
            : data.appId && !selectAppItem
            ? () => <span className="errorColor">{_l('业务流程无效或已删除')}</span>
            : () => (
                <Fragment>
                  <span>{selectAppItem.name}</span>
                  {selectAppItem.otherApkName && <span className="Gray_9e">（{selectAppItem.otherApkName}）</span>}
                </Fragment>
              )
        }
        border
        openSearch
        noData={_l('暂无业务流程，请先在应用里创建')}
        onChange={appId => {
          if (appId === 'other') {
            this.setState({ showOtherPBC: true });
          } else {
            this.getNodeDetail(this.props, { appId });
          }
        }}
      />
    );
  }

  /**
   * 渲染执行次数
   */
  renderExecCount() {
    const { data, execCountType } = this.state;
    const EXEC_COUNT = [{ text: _l('依据字段值'), value: 1 }, { text: _l('依据多条数据对象的数据量'), value: 2 }];

    return (
      <Fragment>
        <Dropdown
          className="flowDropdown mTop10"
          data={EXEC_COUNT}
          value={execCountType}
          border
          onChange={execCountType => this.setState({ execCountType })}
        />
        {execCountType === 1 ? (
          <div className="mTop10">
            <SpecificFieldsValue
              processId={this.props.processId}
              selectNodeId={this.props.selectNodeId}
              updateSource={number => this.updateSource({ number })}
              type="number"
              allowedEmpty
              min={1}
              data={data.number}
            />
          </div>
        ) : (
          <SelectNodeObject
            smallBorder={true}
            appList={data.flowNodeList}
            selectNodeId={data.selectNodeId}
            selectNodeObj={data.selectNodeObj}
            onChange={selectNodeId => {
              const selectNodeObj = _.find(data.flowNodeList, item => item.nodeId === selectNodeId);

              this.updateSource({ selectNodeId, selectNodeObj });
            }}
          />
        )}
      </Fragment>
    );
  }

  /**
   * 渲染参数字段
   */
  renderParameterFiled() {
    const { data } = this.state;

    return data.fields.map((item, i) => {
      const singleObj = _.find(data.subProcessVariables, obj => obj.controlId === item.fieldId) || {};
      const { controlName, sourceEntityName } = singleObj;

      return (
        <div key={item.fieldId} className="relative">
          <div className="mTop15 ellipsis Font13">
            <span className="Gray_9e mRight5">[{CONTROLS_NAME[singleObj.type]}]</span>
            {controlName}
            {singleObj.required && <span className="mLeft5 red">*</span>}
            {singleObj.type === 29 && <span className="Gray_9e">{`（${_l('工作表')}“${sourceEntityName}”）`}</span>}
          </div>
          <SingleControlValue
            companyId={this.props.companyId}
            processId={this.props.processId}
            selectNodeId={this.props.selectNodeId}
            sourceNodeId={data.selectNodeId}
            controls={data.subProcessVariables}
            formulaMap={data.formulaMap}
            fields={data.fields}
            updateSource={this.updateSource}
            item={item}
            i={i}
          />
          {singleObj.desc && <div className="mTop5 Gray_9e">{singleObj.desc}</div>}
        </div>
      );
    });
  }

  render() {
    const { data, showOtherPBC } = this.state;
    const isPBCOut = data.actionId === ACTION_ID.PBC_OUT;

    if (_.isEmpty(data)) {
      return <LoadDiv className="mTop15" />;
    }

    return (
      <Fragment>
        <DetailHeader
          data={{ ...data, selectNodeType: this.props.selectNodeType }}
          icon="icon-pbc"
          bg="BGBlueAsh"
          closeDetail={this.props.closeDetail}
          updateSource={this.updateSource}
        />
        <div className="flex mTop20">
          <ScrollView>
            <div className="workflowDetailBox">{isPBCOut ? this.renderExportContent() : this.renderContent()}</div>
          </ScrollView>
        </div>
        <DetailFooter isCorrect={!!data.appId || isPBCOut} onSave={this.onSave} closeDetail={this.props.closeDetail} />

        {showOtherPBC && (
          <SelectOtherPBCDialog
            appId={this.props.relationId}
            companyId={this.props.companyId}
            onOk={({ selectPBCId }) => this.getNodeDetail(this.props, { appId: selectPBCId })}
            onCancel={() => this.setState({ showOtherPBC: false })}
          />
        )}
      </Fragment>
    );
  }
}

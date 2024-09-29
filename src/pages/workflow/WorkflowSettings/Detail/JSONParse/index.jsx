import React, { Component, Fragment } from 'react';
import { ScrollView, LoadDiv, Dialog, Support, Icon, Menu, MenuItem, Radio } from 'ming-ui';
import flowNode from '../../../api/flowNode';
import {
  DetailHeader,
  DetailFooter,
  SelectNodeObject,
  JSONAnalysis,
  FindResult,
  TriggerCondition,
  CustomTextarea,
  OutputList,
} from '../components';
import { FIELD_TYPE_LIST } from '../../enum';
import styled from 'styled-components';
import cx from 'classnames';
import JsonView from 'react-json-view';
import copy from 'copy-to-clipboard';
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';
import { checkConditionsIsNull } from '../../utils';

const List = styled.div(
  ({ isHeader }) => `
  border-bottom: 1px solid #e7e7e7;
  height: 36px;
  align-items: center;
  ${
    isHeader
      ? 'font-weight: bold;'
      : `
        &:hover {
          background: #f5f5f5;
          .hideOperation {
            visibility: visible;
          }
        }
      `
  }
  &.active {
    background: #f5f5f5;
    .hideOperation {
      visibility: visible;
    }
  }
  .width24 {
    width: 24px;
  }
  .width100 {
    width: 100px;
  }
  .width150 {
    width: 150px;
  }
  .width190 {
    width: 190px;
  }
  .width250 {
    width: 250px;
  }
  .pLeft48 {
    padding-left: 48px !important;
  }
  .pLeft72 {
    padding-left: 72px !important;
  }
  .hideOperation {
    visibility: hidden;
  }
  .jsonMenu {
    left: inherit !important;
    right: 0 !important;
    width: 450px !important;
    .Item-content {
      &:hover {
        .Gray_75 {
          color: #fff !important;
        }
      }
    }
  }
`,
);

const getDefaultParameters = () => {
  return {
    controlId: uuidv4(),
    type: 2,
    controlName: '',
    dataSource: '',
    value: '',
  };
};

export default class JSONParse extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      saveRequest: false,
      showDialog: false,
      foldIds: [],
      selectFiledId: '',
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
  getNodeDetail(props, sId) {
    const { processId, selectNodeId, selectNodeType, isIntegration, instanceId } = props;
    const { data } = this.state;

    flowNode
      .getNodeDetail(
        { processId, nodeId: selectNodeId, flowNodeType: selectNodeType, selectNodeId: sId, instanceId },
        { isIntegration },
      )
      .then(result => {
        if (result.selectNodeId && !result.outputs.length && (!result.appId || sId)) {
          result.outputs = [getDefaultParameters()];
        }
        this.setState({ data: !sId ? result : { ...result, name: data.name }, foldIds: [], selectFiledId: '' });
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
    const { name, selectNodeId, outputs, conditions, errorMessage, executeType } = data;
    let hasError = false;

    if (!selectNodeId) {
      alert(_l('必须先选择一个 JSON 对象'), 2);
      return;
    }

    outputs.forEach(item => {
      if (!item.controlName || !item.jsonPath) {
        hasError = true;
      }
    });

    if (checkConditionsIsNull(conditions)) {
      alert(_l('筛选条件的判断值不能为空'), 2);
      return;
    }

    if (conditions.length && !errorMessage) {
      alert(_l('指定的错误消息不能为空'), 2);
      return;
    }

    if (hasError) {
      alert(_l('输出参数配置有误'), 2);
      return;
    }

    if (saveRequest) {
      return;
    }

    flowNode
      .saveNode(
        {
          processId: this.props.processId,
          nodeId: this.props.selectNodeId,
          flowNodeType: this.props.selectNodeType,
          name: name.trim(),
          selectNodeId,
          outputs,
          conditions,
          errorMessage,
          executeType,
        },
        { isIntegration: this.props.isIntegration },
      )
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
    const { isIntegration, isPlugin, selectNodeType } = this.props;
    const { data } = this.state;
    const ERROR_TYPES = [
      { text: _l('不定义错误消息'), value: 0 },
      { text: _l('从输出参数中获取返回值作为错误消息'), value: 1 },
    ];

    return (
      <Fragment>
        {!isIntegration ? (
          <Fragment>
            <div className="Font14 Gray_75 workflowDetailDesc">
              {_l(
                'JSON 解析器可以把 发送 API 请求 节点或者 代码块 节点中输出的 JSON 对象解析为后续节点可直接使用的变量和数组参数。',
              )}
            </div>

            <div className="mTop20 bold">{_l('获取 JSON 对象')}</div>
            <div className="Gray_75 mTop10">{_l('当前流程中的节点对象')}</div>
          </Fragment>
        ) : (
          <div className="bold">{_l('选择 JSON 来源')}</div>
        )}

        <SelectNodeObject
          isIntegration={isIntegration}
          appList={data.flowNodeList}
          selectNodeId={data.selectNodeId}
          selectNodeObj={data.selectNodeObj}
          onChange={sId => this.getNodeDetail(this.props, sId)}
        />

        {data.selectNodeId && (
          <Fragment>
            {this.renderJSONResult()}
            <div className="mTop20 bold">{_l('定义输出参数')}</div>
            <div className="mTop10">{this.renderOutputDesc()}</div>

            <OutputList outputType={1} data={data} isIntegration={isIntegration} updateSource={this.updateSource} />

            <div className="mTop20 bold">{_l('定义错误消息')}</div>
            <div className="Gray_75 mTop10">
              {_l('当返回匹配错误结果的 JSON 时，可以自定义中止输出参数时的错误消息')}
            </div>

            {ERROR_TYPES.map(item => (
              <div className="mTop15" key={item.value}>
                <Radio
                  text={item.text}
                  checked={
                    (item.value === 0 && !data.conditions.length) || (item.value === 1 && data.conditions.length)
                  }
                  onClick={() =>
                    this.updateSource({ conditions: item.value === 0 ? [] : [[{}]], executeType: 0, errorMessage: '' })
                  }
                />
              </div>
            ))}

            {!!data.conditions.length && (
              <Fragment>
                <div className="mTop10 mLeft30 Gray_75">{_l('当参数返回值满足以下条件时触发错误')}</div>
                <div className="mLeft30">
                  <TriggerCondition
                    processId={this.props.processId}
                    relationId={this.props.relationId}
                    selectNodeId={this.props.selectNodeId}
                    isIntegration={isIntegration}
                    isPlugin={isPlugin}
                    controls={data.outputs.filter(item => !item.dataSource)}
                    data={data.conditions}
                    updateSource={data => this.updateSource({ conditions: data })}
                    projectId={this.props.companyId}
                  />
                </div>
                <div className="mTop20 bold">{_l('指定触发错误时返回的错误消息')}</div>
                <CustomTextarea
                  projectId={this.props.companyId}
                  processId={this.props.processId}
                  relationId={this.props.relationId}
                  selectNodeId={this.props.selectNodeId}
                  isIntegration={isIntegration}
                  isPlugin={isPlugin}
                  type={2}
                  height={0}
                  content={data.errorMessage}
                  formulaMap={data.formulaMap}
                  onChange={(err, value, obj) => this.updateSource({ errorMessage: value })}
                  updateSource={this.updateSource}
                />
                {!isIntegration && (
                  <FindResult
                    nodeType={selectNodeType}
                    executeType={data.executeType}
                    switchExecuteType={executeType => this.updateSource({ executeType })}
                  />
                )}
              </Fragment>
            )}

            {!!data.outputs.length && (
              <div className="mTop25 webhookBox">
                <div className="webhookHeader flexRow">
                  <div className="bold w180 ellipsis">{_l('参数名')}</div>
                  <div className="bold mLeft15 flex ellipsis">{_l('参考值')}</div>
                </div>
                <JSONAnalysis list={data.outputs} json={data.json} />
              </div>
            )}
          </Fragment>
        )}
      </Fragment>
    );
  }

  /**
   * 渲染JSON结果
   */
  renderJSONResult() {
    const { data, showDialog } = this.state;

    if (!data.selectNodeId) return null;

    return (
      <Fragment>
        <div
          className="webhookBtn InlineBlock mTop25"
          onClick={() => {
            if (!data.controls.length) {
              alert(_l('没有可以用来解析的流程参数'), 2);
              return;
            }

            this.setState({ showDialog: true });
          }}
        >
          {_l('查看 JSON 解析结果')}
        </div>

        {showDialog && (
          <Dialog
            width={1100}
            visible
            type="scroll"
            title={_l('查看 JSON 解析结果')}
            description={this.renderOutputDesc()}
            showFooter={false}
            onCancel={() => this.setState({ showDialog: false })}
          >
            <div style={{ minHeight: 400 }}>
              <List className="flexRow" isHeader>
                <div className="width250 pLeft24 mRight10">{_l('名称')}</div>
                <div className="width100 mRight10">{_l('类型')}</div>
                <div className="flex mRight10">{_l('参考值')}</div>
                <div className="width190 mRight10">JSON Path</div>
                <div className="width150" />
              </List>
              {data.controls.filter(item => !item.dataSource).map(item => this.renderDialogJSONList(item))}
            </div>
          </Dialog>
        )}
      </Fragment>
    );
  }

  /**
   * 渲染查看json解析列表
   */
  renderDialogJSONList(item) {
    const { data, foldIds, selectFiledId } = this.state;
    const hasFold = _.includes([10000006, 10000008], item.type);
    const parentNode = item.dataSource ? _.find(data.controls, o => o.jsonPath === item.dataSource) : {};
    const isObjectOptions = parentNode.type === 10000008;
    let options = [];

    if (isObjectOptions) {
      options = [
        { text: item.jsonPath, desc: _l('复制节点 Path') },
        { text: `${item.dataSource}[*].${item.controlName}`, desc: _l('复制数组 Path') },
        { text: `@.${item.controlName}`, desc: _l('复制对象数组子节点 Path') },
      ];
    }

    return (
      <Fragment key={item.jsonPath}>
        <List className={cx('flexRow Font12', { active: selectFiledId === item.jsonPath })}>
          <div
            className={cx('width250 mRight10 flexRow', hasFold ? 'pointer' : 'pLeft24', {
              pLeft24: item.dataSource && hasFold,
              pLeft48: item.dataSource && !hasFold,
              pLeft72: parentNode.dataSource,
            })}
            onClick={() => {
              if (hasFold) {
                if (_.includes(foldIds, item.jsonPath)) {
                  _.remove(foldIds, key => key === item.jsonPath);
                } else {
                  foldIds.push(item.jsonPath);
                }
                this.setState({ foldIds });
              }
            }}
          >
            {hasFold && !parentNode.dataSource && (
              <div className="width24">
                <Icon
                  type={_.includes(foldIds, item.jsonPath) ? 'arrow-right-tip' : 'arrow-down'}
                  className="Gray_75 Font14"
                />
              </div>
            )}
            {item.controlName}
          </div>
          <div className="width100 mRight10">{FIELD_TYPE_LIST.find(o => o.value === item.type).en}</div>
          <div
            className={cx('flex mRight10 ellipsis', { 'pointer ThemeHoverColor3': hasFold })}
            onClick={() => hasFold && this.previewJSON(JSON.parse(item.value))}
          >
            {item.value}
          </div>
          <div className="width190 mRight10 ellipsis">{item.jsonPath}</div>
          <div className="width150 relative hideOperation">
            <Icon type="output" className="Gray_75" />
            <span className="mLeft5 ThemeHoverColor3 pointer" onClick={() => this.onGenerationParameters(item)}>
              {_l('生成参数')}
            </span>
            <Icon type="copy" className="Gray_75 mLeft15" />
            <span
              className="mLeft5 ThemeHoverColor3 pointer"
              onClick={() => {
                if (isObjectOptions) {
                  this.setState({ selectFiledId: item.jsonPath });
                } else {
                  copy(item.jsonPath);
                  alert(_l('复制成功'));
                }
              }}
            >
              {_l('复制')}
            </span>

            {isObjectOptions && selectFiledId === item.jsonPath && (
              <Menu className="jsonMenu" onClickAway={() => this.setState({ selectFiledId: '' })}>
                {options.map((o, i) => (
                  <MenuItem
                    key={i}
                    onMouseDown={() => {
                      copy(o.text);
                      alert(_l('复制成功'));
                      this.setState({ selectFiledId: '' });
                    }}
                  >
                    <div className="flexRow">
                      <div className="flex ellipsis mRight15"> {o.text} </div>
                      <div className="Gray_75"> {o.desc} </div>
                    </div>
                  </MenuItem>
                ))}
              </Menu>
            )}
          </div>
        </List>
        {!_.includes(foldIds, item.jsonPath) &&
          data.controls.filter(o => o.dataSource === item.jsonPath).map(o => this.renderDialogJSONList(o))}
      </Fragment>
    );
  }

  renderOutputDesc() {
    const { showDialog } = this.state;

    return (
      <Fragment>
        <span className="Gray_75">
          {showDialog
            ? _l(
                '我们根据获取的 JSON 为您解析了对应的 JSON Path，您也可以学习 JSON Path 的规则来更灵活的获取需要的数据',
              )
            : _l('从 JSON 解析结果中复制解析后的 JSON Path，填写到输出参数值中')}
        </span>
        <span className="mLeft10">
          <Support
            type={3}
            className="workflowDialogSupport"
            href="https://help.mingdao.com/workflow/node-json-parsing"
            text={_l('了解 JSON Path')}
          />
        </span>
      </Fragment>
    );
  }

  /**
   * 预览json
   */
  previewJSON(json) {
    Dialog.confirm({
      width: 720,
      title: _l('查看'),
      description: (
        <JsonView src={json} theme="brewer" displayDataTypes={false} displayObjectSize={false} name={null} />
      ),
      noFooter: true,
    });
  }

  /**
   * 生成参数
   */
  onGenerationParameters(item) {
    const { data } = this.state;
    let parameters = [];

    parameters.push({
      controlId: uuidv4(),
      type: item.type === 10000006 ? 2 : item.type,
      controlName: _.find(data.outputs, o => o.controlName === item.controlName)
        ? item.controlName +
          Math.floor(Math.random() * 10000)
            .toString()
            .padStart(4, '0')
        : item.controlName,
      dataSource: '',
      jsonPath: item.jsonPath,
    });

    if (item.type === 10000007) {
      parameters.push(this.generationOrdinaryArrayObject(parameters[0].controlId));
    }

    // 对象数组
    if (item.type === 10000008) {
      data.controls
        .filter(o => o.dataSource === item.jsonPath)
        .forEach(o => {
          const newControlId = uuidv4();

          parameters.push({
            controlId: newControlId,
            type: _.includes([10000006, 10000008], o.type) ? 2 : o.type,
            controlName: o.controlName,
            dataSource: parameters[0].controlId,
            jsonPath: `@.${o.controlName}`,
          });

          if (o.type === 10000007) {
            parameters.push(this.generationOrdinaryArrayObject(newControlId));
          }
        });
    }

    this.updateSource({
      outputs:
        data.outputs.length === 1 && !data.outputs[0].controlName && !data.outputs[0].jsonPath
          ? parameters
          : data.outputs.concat(parameters),
    });
  }

  /**
   * 生成普通数组的对象
   */
  generationOrdinaryArrayObject(dataSource) {
    return {
      controlId: uuidv4(),
      type: 2,
      controlName: 'string',
      dataSource,
      jsonPath: '@',
    };
  }

  render() {
    const { data } = this.state;

    if (_.isEmpty(data)) {
      return <LoadDiv className="mTop15" />;
    }

    return (
      <Fragment>
        <DetailHeader
          {...this.props}
          data={{ ...data }}
          icon="icon-task_custom_polymer"
          bg="BGBlueAsh"
          updateSource={this.updateSource}
        />
        <div className="flex">
          <ScrollView>
            <div className="workflowDetailBox">{this.renderContent()}</div>
          </ScrollView>
        </div>
        <DetailFooter {...this.props} isCorrect={data.selectNodeId} onSave={this.onSave} />
      </Fragment>
    );
  }
}

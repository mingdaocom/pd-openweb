import React, { Component, Fragment } from 'react';
import { ScrollView, LoadDiv, Dialog, Support, Icon, Menu, MenuItem, Dropdown } from 'ming-ui';
import flowNode from '../../../api/flowNode';
import { DetailHeader, DetailFooter, SelectNodeObject } from '../components';
import { FIELD_TYPE_LIST } from '../../enum';
import styled from 'styled-components';
import cx from 'classnames';
import JsonView from 'react-json-view';
import copy from 'copy-to-clipboard';
import { v4 as uuidv4, validate } from 'uuid';
import jp from 'jsonpath';

const FIELD_TYPE = FIELD_TYPE_LIST.concat([{ text: _l('对象'), value: 10000006, en: 'object' }]);

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
        .Gray_9e {
          color: #fff !important;
        }
      }
    }
  }
`,
);

const OutputList = styled.div(
  ({ isHeader }) => `
  height: 36px;
  display: flex;
  align-items: center;
  ${isHeader ? 'color: #757575;' : 'margin-bottom: 10px;'}
  .width150 {
    width: 150px;
  }
  .width120 {
    width: 120px;
  }
  .width100 {
    width: 100px;
  }
  .width50 {
    width: 50px;
  }
  input {
    width: 100%;
    height: 36px;
    line-height: 36px;
    border-width: 1px;
    border-style: solid;
    border-radius: 4px;
    border-color: #ddd;
    padding: 0 10px;
    &:focus {
      border-color: #2196f3;
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
    const { processId, selectNodeId, selectNodeType } = props;

    flowNode
      .getNodeDetail({ processId, nodeId: selectNodeId, flowNodeType: selectNodeType, selectNodeId: sId })
      .then(result => {
        if (result.selectNodeId && !result.outputs.length && (!result.appId || sId)) {
          result.outputs = [getDefaultParameters()];
        }
        this.setState({ data: result, foldIds: [], selectFiledId: '' });
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
    const { name, selectNodeId, outputs } = data;
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

    if (hasError) {
      alert(_l('输出参数配置有误'), 2);
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
        selectNodeId,
        outputs,
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
        <div className="Font14 Gray_75 workflowDetailDesc">
          {_l(
            'JSON 解析器可以把 发送 API 请求 节点或者 代码块 节点中输出的 JSON 对象解析为后续节点可直接使用的变量和数组参数。',
          )}
        </div>

        <div className="mTop20 bold">{_l('获取 JSON 对象')}</div>
        <div className="Gray_75 mTop10">{_l('当前流程中的节点对象')}</div>
        <SelectNodeObject
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
            {!!data.outputs.length && this.renderOutputList()}
            <div
              className="mTop15 InlineBlock pointer ThemeColor3 ThemeHoverColor2"
              onClick={() =>
                this.updateSource({
                  outputs: data.outputs.concat([getDefaultParameters()]),
                })
              }
            >
              {_l('+ 输出参数')}
            </div>

            {!!data.outputs.length && (
              <div className="mTop25 webhookBox">
                <div className="webhookHeader flexRow">
                  <div className="bold w180 ellipsis">{_l('参数名')}</div>
                  <div className="bold mLeft15 flex ellipsis">{_l('参考值')}</div>
                </div>
                <ul className="webhookList">
                  {this.renderJSONResultList(data.outputs.filter(item => !item.dataSource))}
                </ul>
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
    const { data, showDialog, foldIds, selectFiledId } = this.state;

    if (!data.selectNodeId) return null;

    return (
      <Fragment>
        <div
          className="mTop25 webhookBtn InlineBlock"
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
              {data.controls
                .filter(item => !_.includes(foldIds, item.dataSource))
                .map((item, i) => {
                  const hasFold = _.includes([10000006, 10000008], item.type);
                  const isObjectOptions =
                    item.dataSource && _.find(data.controls, o => o.jsonPath === item.dataSource).type === 10000008;
                  let options = [];

                  if (isObjectOptions) {
                    options = [
                      { text: item.jsonPath, desc: _l('复制节点 Path') },
                      { text: `${item.dataSource}[*].${item.controlName}`, desc: _l('复制数组 Path') },
                      { text: `@.${item.controlName}`, desc: _l('复制对象数组子节点 Path') },
                    ];
                  }

                  return (
                    <List key={i} className={cx('flexRow Font12', { active: selectFiledId === item.jsonPath })}>
                      <div
                        className={cx('width250 mRight10 flexRow', hasFold ? 'pointer' : 'pLeft24', {
                          pLeft24: item.dataSource && hasFold,
                          pLeft48: item.dataSource && !hasFold,
                          pLeft72:
                            item.dataSource && _.find(data.controls, o => o.jsonPath === item.dataSource).dataSource,
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
                        {hasFold && (
                          <div className="width24">
                            <Icon
                              type={_.includes(foldIds, item.controlName) ? 'arrow-right-tip' : 'arrow-down'}
                              className="Gray_9e Font14"
                            />
                          </div>
                        )}
                        {item.controlName}
                      </div>
                      <div className="width100 mRight10">{FIELD_TYPE.find(o => o.value === item.type).en}</div>
                      <div
                        className={cx('flex mRight10 ellipsis', { 'pointer ThemeHoverColor3': hasFold })}
                        onClick={() => hasFold && this.previewJSON(JSON.parse(item.value))}
                      >
                        {item.value}
                      </div>
                      <div className="width190 mRight10 ellipsis">{item.jsonPath}</div>
                      <div className="width150 relative hideOperation">
                        <Icon type="output" className="Gray_9e" />
                        <span
                          className="mLeft5 ThemeHoverColor3 pointer"
                          onClick={() => this.onGenerationParameters(item)}
                        >
                          {_l('生成参数')}
                        </span>
                        <Icon type="copy" className="Gray_9e mLeft15" />
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
                                  <div className="Gray_9e"> {o.desc} </div>
                                </div>
                              </MenuItem>
                            ))}
                          </Menu>
                        )}
                      </div>
                    </List>
                  );
                })}
            </div>
          </Dialog>
        )}
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
            href="https://help.mingdao.com/flow75.html"
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
            type: o.type === 10000006 ? 2 : o.type,
            controlName: o.controlName,
            dataSource: parameters[0].controlId,
            jsonPath: `@.${o.controlName}`,
          });

          if (o.type === 10000007) {
            parameters.push(this.generationOrdinaryArrayObject(newControlId));
          }
        });
    }

    this.updateSource({ outputs: data.outputs.concat(parameters) });
  }

  /**
   * 渲染参数列表
   */
  renderOutputList() {
    const { data } = this.state;

    return (
      <Fragment>
        <OutputList isHeader className="mTop5">
          <div className="width150 mRight10">{_l('参数名')}</div>
          <div className="width120 mRight10">{_l('类型')}</div>
          <div className="flex mRight10">JSON Path</div>
          <div className="width50" />
        </OutputList>

        {this.renderJSONList(data.outputs.filter(item => !item.dataSource))}
      </Fragment>
    );
  }

  /**
   * 递归渲染列表
   */
  renderJSONList(source) {
    const { data } = this.state;

    return source.map(item => {
      let subItem;

      if (item.dataSource && _.find(data.outputs, o => o.controlId === item.dataSource).type === 10000007) {
        return null;
      }

      if (item.type === 10000007) {
        subItem = _.find(data.outputs, o => o.dataSource === item.controlId) || {};
      }

      return (
        <Fragment>
          <OutputList key={item.controlId}>
            <div className={cx('width150 mRight10', { pLeft20: item.dataSource })}>
              <input
                type="text"
                value={item.controlName}
                placeholder={_l('请填写参数名称')}
                onChange={e => this.updateOutputParameters('controlName', e.target.value, item)}
                onBlur={e =>
                  this.updateOutputParameters(
                    'controlName',
                    e.target.value.replace(/[^\u4e00-\u9fa5a-zA-Z\d_]/g, ''),
                    item,
                    true,
                  )
                }
              />
            </div>
            <div className="width120 mRight10">
              <Dropdown
                className="flowDropdown"
                style={{ width: 120 }}
                data={FIELD_TYPE_LIST.filter(
                  o => o.value !== 10000003 && (!item.dataSource || (item.dataSource && o.value !== 10000008)),
                )}
                value={item.type}
                border
                disabled={!validate(item.controlId)}
                onChange={type => {
                  this.updateOutputParameters('type', type, item);
                }}
              />
            </div>
            {item.type === 10000007 && (
              <div className="width100 mRight10">
                <Dropdown
                  className="flowDropdown"
                  style={{ width: 100 }}
                  data={FIELD_TYPE_LIST.filter(o => _.includes([2, 6, 16, 26, 27], o.value))}
                  value={subItem.type}
                  border
                  disabled={!validate(subItem.controlId)}
                  onChange={type => {
                    this.updateOutputParameters('type', type, subItem);
                    this.updateOutputParameters(
                      'controlName',
                      _.find(FIELD_TYPE_LIST, o => o.value === type).en,
                      subItem,
                    );
                  }}
                />
              </div>
            )}
            <div className="flex mRight10">
              <input
                type="text"
                value={item.jsonPath}
                placeholder={_l('请填写 JSON Path 值')}
                onChange={e => this.updateOutputParameters('jsonPath', e.target.value, item)}
                onBlur={e => this.updateOutputParameters('jsonPath', e.target.value.trim(), item)}
              />
            </div>
            <div className="width50">
              <Icon
                type="delete1"
                className="Font16 mRight10 pointer Gray_9e ThemeHoverColor3"
                onClick={() => this.removeParameters(item.controlId)}
              />
              <Icon
                type="add"
                className="Font20 pointer Gray_9e ThemeHoverColor3"
                onClick={() => this.addParameters(item)}
              />
            </div>
          </OutputList>
          {this.renderJSONList(data.outputs.filter(o => o.dataSource === item.controlId))}
        </Fragment>
      );
    });
  }

  /**
   * 修改输出参数
   */
  updateOutputParameters(action, value, { controlId, type, dataSource }, isBlur) {
    const { data } = this.state;
    const { outputs } = data;

    outputs.forEach(item => {
      if (item.controlId === controlId) {
        item[action] =
          isBlur &&
          action === 'controlName' &&
          !!outputs
            .filter(o => o.dataSource === dataSource)
            .find(o => o.controlName === value && o.controlId !== controlId)
            ? value +
              Math.floor(Math.random() * 10000)
                .toString()
                .padStart(4, '0')
            : value;
      }
    });

    // 数组调整类型
    if (action === 'type' && _.includes([10000007, 10000008], type)) {
      _.remove(outputs, o => o.dataSource === controlId);
    }

    // 普通数组
    if (action === 'type' && value === 10000007) {
      outputs.push(this.generationOrdinaryArrayObject(controlId));
    }

    this.updateSource({ outputs });
  }

  /**
   * 删除参数
   */
  removeParameters(controlId) {
    const { data } = this.state;
    const { outputs } = data;

    _.remove(outputs, o => o.controlId === controlId);
    _.remove(outputs, o => o.dataSource === controlId);
    this.updateSource({ outputs });
  }

  /**
   * 添加参数
   */
  addParameters({ type, dataSource, controlId }) {
    const { data } = this.state;
    const { outputs } = data;
    let index = 0;

    outputs.forEach((item, i) => {
      if (item.controlId === controlId) {
        index = i;
      }
    });

    if (type === 10000008 || dataSource) {
      outputs.splice(index + 1, 0, Object.assign({}, getDefaultParameters(), { dataSource: dataSource || controlId }));
    } else {
      outputs.splice(index + 1, 0, getDefaultParameters());
    }

    this.updateSource({ outputs });
  }

  /**
   * 渲染JSON结果列表
   */
  renderJSONResultList(source) {
    const { data } = this.state;

    return source.map((item, i) => {
      if (item.dataSource && _.find(data.outputs, o => o.controlId === item.dataSource).type === 10000007) {
        return null;
      }

      return (
        <Fragment>
          <li className="flexRow" key={i}>
            <div className={cx('w180 ellipsis', { pLeft20: item.dataSource })}>{item.controlName || ''}</div>
            <div className="mLeft15 flex ellipsis" style={{ minWidth: 0 }}>
              {this.renderParametersResult(item)}
            </div>
          </li>
          {this.renderJSONResultList(data.outputs.filter(o => o.dataSource === item.controlId))}
        </Fragment>
      );
    });
  }

  /**
   * 渲染JSON结果
   */
  renderParametersResult({ type, controlId, dataSource, jsonPath }) {
    const { data } = this.state;

    if (!jsonPath) return '';

    // 处理@.的问题
    if (dataSource) {
      const parentSource = data.outputs.find(o => o.controlId === dataSource);

      if (parentSource.type === 10000008) {
        jsonPath = jsonPath.replace(/^@/, `${parentSource.jsonPath}[0]`);
      }
    }

    try {
      let result = jp.query(JSON.parse(data.json), jsonPath);

      // 文本
      if (type === 2) {
        if (_.isArray(result)) {
          if (!result.length) {
            result = '';
          } else if (result.length === 1) {
            result = result[0];
          } else {
            result = result.map(o => o);
          }
        }
      }

      // 数值
      if (type === 6) {
        if (result.length === 1 && _.isNumber(result[0])) {
          result = result[0];
        } else {
          result = '';
        }
      }

      // 日期时间
      if (type === 16) {
        if (result.length === 1 && moment(result[0]).toDate() !== 'Invalid Date') {
          result = result[0];
        } else {
          result = '';
        }
      }

      // 人员 部门
      if (_.includes([26, 27], type)) {
        if (result.length === 1 && /^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/.test(result[0])) {
          result = result[0];
        } else {
          result = '';
        }
      }

      // 普通数组
      if (type === 10000007) {
        if (!result.length) {
          result = '';
        } else if (_.isObject(result[0])) {
          if (dataSource) {
            result = result[0];
          } else if (result.length === 1 && _.isArray(result[0]) && result[0].length > 1) {
            result = result[0].map(o => (_.isObject(o) ? JSON.stringify(o) : o));
          } else {
            result = result.length === 1 ? result[0] : result.map(o => (_.isObject(o) ? JSON.stringify(o) : o));
          }
        }
      }

      // 对象数组
      if (type === 10000008) {
        if (result.length && _.isArray(result[0])) {
          result = result[0];
        } else {
          result = '';
        }
      }

      if (type === 10000008 && !!data.outputs.find(o => o.dataSource === controlId)) {
        return result && _.isArray(result) ? (
          <span className="Gray_9e">{_l('共 %0 组数据，以下仅显示第 1 组参考值', result.length)}</span>
        ) : (
          ''
        );
      }

      return _.isObject(result) ? JSON.stringify(result) : result;
    } catch (e) {
      return <span className="Gray_9e">{_l('暂无结果')}</span>;
    }
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
          data={{ ...data, selectNodeType: this.props.selectNodeType }}
          icon="icon-task_custom_polymer"
          bg="BGBlueAsh"
          closeDetail={this.props.closeDetail}
          updateSource={this.updateSource}
        />
        <div className="flex mTop20">
          <ScrollView>
            <div className="workflowDetailBox">{this.renderContent()}</div>
          </ScrollView>
        </div>
        <DetailFooter isCorrect={data.selectNodeId} onSave={this.onSave} closeDetail={this.props.closeDetail} />
      </Fragment>
    );
  }
}

import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { v4 as uuidv4, validate } from 'uuid';
import { Checkbox, Dialog, Dropdown, LoadDiv, Radio, ScrollView } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import flowNode from '../../../api/flowNode';
import process from '../../../api/process';
import appManagement from 'src/api/appManagement';
import selectPBPDialog from '../../../components/selectPBPDialog';
import { ACTION_ID, FIELD_TYPE_LIST } from '../../enum';
import {
  DetailFooter,
  DetailHeader,
  ProcessParameters,
  ProcessVariablesInput,
  SelectNodeObject,
  SingleControlValue,
  SpecificFieldsValue,
  TransferTriggerUser,
} from '../components';

const Header = styled.div`
  .w180 {
    width: 180px;
  }
  .red {
    color: #f44336;
  }
`;

export default class PBC extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      saveRequest: false,
      execCountType: 1,
      selectFieldId: '',
      cacheKey: +new Date(),
    };
  }

  cacheItem = {};

  componentDidMount() {
    this.getNodeDetail(this.props);
  }

  componentWillReceiveProps(nextProps) {
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
    const { processId, selectNodeId, selectNodeType, instanceId } = props;
    const { data } = this.state;

    flowNode
      .getNodeDetail({ processId, nodeId: selectNodeId, flowNodeType: selectNodeType, appId, instanceId })
      .then(result => {
        if (result.actionId === ACTION_ID.PBC) {
          result.subProcessVariables
            .filter(o => o.processVariableType === 1)
            .forEach(o => {
              if (!_.find(result.fields, item => item.fieldId === o.controlId)) {
                result.fields.push({ ...o, fieldId: o.controlId, fieldName: o.controlName });
              }
            });
        }

        if (result.actionId === ACTION_ID.PBC_OUT && !result.fields.length) {
          result.fields = [{ fieldName: '', desc: '', type: 2, fieldId: uuidv4() }];
        }

        if (appId && result.name === _l('调用封装业务流程')) {
          result.name = result.appList.find(item => item.id === appId).name;
        } else if (appId) {
          result.name = data.name;
        }

        if (result.subProcessVariables.length) {
          result.subProcessVariables
            .filter(item => item.dataSource)
            .forEach(item => {
              const parentNode = _.find(result.subProcessVariables, o => o.controlId === item.dataSource);

              if (parentNode && _.includes([10000007, 10000008], parentNode.type)) {
                result.fields.forEach(o => {
                  if (o.fieldId === item.controlId) {
                    o.dataSource = parentNode.controlId;
                  }
                });
              }
            });
        }

        this.setState({ data: result, execCountType: result.selectNodeId ? 2 : 1, cacheKey: +new Date() });
      });
  }

  /**
   * 更新data数据
   */
  updateSource = (obj, callback = () => {}) => {
    const { data } = this.state;

    this.props.haveChange(true);

    // 对象数组选择其他字段值
    if (data.actionId === ACTION_ID.PBC_OUT && obj.fields) {
      obj.fields
        .filter(item => item.type === 10000008 && item.fieldValueId)
        .forEach(item => {
          // 清理字段名为空的子项
          _.remove(obj.fields, o => o.dataSource === item.fieldId && !o.fieldName);

          obj.fields.forEach(o => {
            if (o.dataSource === item.fieldId) {
              o.fieldValue = '';
              o.fieldValueId = '';
            }
          });
        });
    }

    this.setState({ data: Object.assign({}, this.state.data, obj) }, callback);
  };

  /**
   * 保存
   */
  onSave = () => {
    const { isPlugin } = this.props;
    const { data, saveRequest } = this.state;
    const { appId, name, fields, executeType, number, selectNodeId, nextExecute, fromTrigger } = data;
    const subProcessVariables = _.cloneDeep(data.subProcessVariables);
    const isPBCOut = data.actionId === ACTION_ID.PBC_OUT;
    let hasError = 0;

    if (!appId && !isPBCOut) {
      alert(_l('请选择业务流程'), 2);
      return;
    }

    // PBC 输出参数
    if (isPBCOut) {
      if (fields.filter(item => !item.fieldName).length) {
        alert(_l('字段名不能为空'), 2);
        return;
      }

      if (!fields.length && isPlugin) {
        alert(_l('输出参数不允许为空'), 2);
        return;
      }
    }

    if (!isPBCOut && executeType !== 0 && !number.fieldValue && !number.fieldControlId && !selectNodeId) {
      alert(_l('执行次数不能为空'), 2);
      return;
    }

    // 验证必填项
    subProcessVariables.forEach(item => {
      if (item.type === 10000008 && (fields.find(o => o.fieldId === item.controlId) || {}).nodeId) {
        _.remove(subProcessVariables, o => o.dataSource === item.controlId);
      }
    });

    subProcessVariables.forEach(item => {
      if (item.required) {
        fields.forEach(o => {
          if (item.controlId === o.fieldId && !o.nodeId && !o.fieldValue && !o.fieldValueId) {
            hasError++;
          }
        });
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
        fromTrigger,
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
    const { isPlugin } = this.props;
    const { data, selectFieldId } = this.state;
    const selectItem = data.fields.find(o => o.fieldId === selectFieldId);

    return (
      <Fragment>
        <div className="Font14 Gray_75 workflowDetailDesc">
          {_l(
            '当输出参数是“对象数组”时，可以在流程中使用“获取数组对象”节点将发送 API 请求、JSON 解析或代码块节点中返回的数组参数转为多条数据对象，之后可以在对象数组输出参数的子元素中设置值为数组中的对象元素字段。当输出参数是“普通数组”时，可以使用“JSON 解析”节点中输出的“普通数组”作为参数值。',
          )}
        </div>

        <div className="bold mTop20">{_l('输出参数')}</div>
        <Header className="mTop15 flexRow">
          <div className="w180">{_l('类型')}</div>
          <div className="w180 mLeft10">
            {_l('字段名')}
            <span className="red">*</span>
          </div>
          <div className="flex mLeft10">{_l('值')}</div>
        </Header>

        {this.renderList(data.fields.filter(o => !o.dataSource))}

        <div className="addActionBtn mTop25">
          <span className="ThemeBorderColor3" onClick={this.addParameters}>
            <i className="icon-add Font16" />
            {_l('添加参数')}
          </span>
        </div>

        {!!selectFieldId && (
          <Dialog
            className="workflowDialogBox workflowSettings"
            style={{ overflow: 'initial' }}
            overlayClosable={false}
            type="scroll"
            visible
            bodyClass="workflowDetail"
            title={FIELD_TYPE_LIST.find(o => o.value === selectItem.type).text}
            onCancel={() => {
              this.updateSource({
                fields: data.fields.map(item => (item.fieldId === selectFieldId ? this.cacheItem : item)),
              });
              this.setState({ selectFieldId: '' });
            }}
            width={800}
            onOk={() => this.setState({ selectFieldId: '' })}
          >
            <div className="flexRow">
              <div className="flex">
                <div className="bold">{_l('类型')}</div>
                <div className="mTop10">{this.renderFieldType(selectItem)}</div>
              </div>
              <div className="flex mLeft10"></div>
            </div>

            <div className="mTop20 bold">
              {_l('字段名')}
              <span style={{ color: '#f44336' }}>*</span>
            </div>
            <div className="mTop10 flexRow">{this.renderFieldName(selectItem)}</div>
            <div className="mTop5 Gray_75">{_l('在工作流使用时，作为返回结果的字段名称')}</div>

            <div className="mTop20 mBottom2 bold">{_l('值')}</div>
            <div className="Font14" style={{ lineHeight: 1.5715 }}>
              {this.renderFieldValue(selectItem)}
            </div>

            <div className="mTop25" style={{ height: 1, background: '#ddd' }} />

            <div className="mTop20 bold">{_l('参数名')}</div>
            <div className="mTop10 flexRow">
              <input
                type="text"
                className="ThemeBorderColor3 actionControlBox pTop0 pBottom0 pLeft10 pRight10 flex"
                placeholder={_l('参数名')}
                value={selectItem.alias}
                onChange={e => this.updateExportFields('alias', e.target.value, selectItem)}
                onBlur={e => {
                  let value = e.target.value.trim().replace(/[^a-z\d-_]/gi, '');

                  if (value && !/^[a-zA-Z]{1}/.test(value)) {
                    value = (isPlugin ? 'plugin' : 'pbp') + value;
                  }

                  this.updateExportFields('alias', value, selectItem, true);
                }}
              />
            </div>
            <div className="mTop5 Gray_75">
              {_l('启用平台API能力时，在API文档中作为输出参数的名称。未填写时，使用字段名')}
            </div>

            <div className="mTop20 bold">{_l('参数说明')}</div>
            <div className="mTop10 flexRow">
              <input
                type="text"
                className="ThemeBorderColor3 actionControlBox pTop0 pBottom0 pLeft10 pRight10 flex"
                placeholder={_l('参数说明')}
                value={selectItem.desc}
                onChange={evt => this.updateExportFields('desc', evt.target.value, selectItem)}
                onBlur={evt => this.updateExportFields('desc', evt.target.value.trim(), selectItem)}
              />
            </div>
            <div className="mTop5 Gray_75">{_l('启用平台API能力时，在API文档中作为输出参数的说明')}</div>
          </Dialog>
        )}
      </Fragment>
    );
  }

  /**
   * 渲染字段类型
   */
  renderFieldType = item => {
    const { isPlugin } = this.props;

    return (
      <Dropdown
        className="flowDropdown w100"
        menuClass="w100"
        data={FIELD_TYPE_LIST.filter(
          o =>
            _.includes([2, 6, 16, 26, 27, 48, 10000007, 10000008], o.value) &&
            (!item.dataSource || (item.dataSource && o.value !== 10000008)) &&
            !(isPlugin && _.includes([26, 27, 48], o.value)),
        )}
        value={item.type}
        renderTitle={() => <span>{FIELD_TYPE_LIST.find(o => o.value === item.type).text}</span>}
        border
        disabled={!validate(item.fieldId)}
        onChange={type => this.updateExportFields('type', type, item)}
      />
    );
  };

  /**
   * 渲染字段名称
   */
  renderFieldName = item => {
    return (
      <input
        type="text"
        className="ThemeBorderColor3 actionControlBox pTop0 pBottom0 pLeft10 pRight10 flex"
        placeholder={_l('字段名（必填）')}
        value={item.fieldName}
        maxLength={64}
        onChange={e => this.updateExportFields('fieldName', e.target.value, item)}
        onBlur={e => this.updateExportFields('fieldName', e.target.value.trim(), item, true)}
      />
    );
  };

  /**
   * 渲染字段值
   */
  renderFieldValue = item => {
    const { isPlugin } = this.props;
    const { data, selectFieldId } = this.state;
    const parentNode = item.dataSource ? _.find(data.fields, o => o.fieldId === item.dataSource) : {};

    return (
      <SingleControlValue
        companyId={this.props.companyId}
        relationId={this.props.relationId}
        processId={this.props.processId}
        selectNodeId={this.props.selectNodeId}
        sourceNodeId={item.dataSource ? parentNode.nodeId : ''}
        controls={data.fields.map(o => {
          if (_.includes([26, 10000008], o.type)) {
            o.controlId = o.fieldId;
            o.flowNodeAppDtos = data.batchNodes;
          }
          return o;
        })}
        formulaMap={data.formulaMap}
        fields={data.fields}
        updateSource={this.updateSource}
        item={item}
        i={_.findIndex(data.fields, o => o.fieldId === item.fieldId)}
        isPlugin={isPlugin}
        moreNodesMenuStyle={
          item.type === 26 && item.nodeId
            ? {}
            : selectFieldId
              ? { marginLeft: -570, width: 715 }
              : { marginLeft: -112, width: 256 }
        }
      />
    );
  };

  /**
   * 渲染输出参数列表
   */
  renderList = source => {
    const { isPlugin } = this.props;
    const { data } = this.state;

    return source.map(item => {
      const parentNode = item.dataSource ? _.find(data.fields, o => o.fieldId === item.dataSource) : {};

      if (parentNode.type === 10000007 || (parentNode.type === 10000008 && parentNode.fieldValueId)) return null;

      return (
        <Fragment key={item.fieldId}>
          <div className={cx('mTop2 flexRow relative alignItemsCenter', { pLeft20: item.dataSource })}>
            <div className="mTop8" style={{ width: item.dataSource ? 160 : 180 }}>
              {this.renderFieldType(item)}
            </div>

            <div className="flexRow mLeft10 mTop8" style={{ width: 180 }}>
              {this.renderFieldName(item)}
            </div>

            <div className="flex mLeft10" style={{ minWidth: 0 }}>
              {this.renderFieldValue(item)}
            </div>

            {!isPlugin && (
              <Tooltip title={_l('编辑')}>
                <span
                  className="Font16 Gray_75 ThemeHoverColor3 mLeft10 pointer mTop8"
                  onClick={() => {
                    this.setState({ selectFieldId: item.fieldId });
                    this.cacheItem = item;
                  }}
                >
                  <i className="icon-edit " />
                </span>
              </Tooltip>
            )}

            <Tooltip title={_l('删除')}>
              <span
                className="Font16 Gray_75 ThemeHoverColor3 mLeft10 pointer mTop8"
                onClick={() => {
                  let fields = [].concat(data.fields);
                  let objArrayIds = [];

                  _.remove(fields, o => {
                    const isDelete = o.fieldId === item.fieldId || o.dataSource === item.fieldId;

                    if (isDelete && o.type === 10000007) {
                      objArrayIds.push(o.fieldId);
                    }

                    return isDelete;
                  });

                  // 移除普通数组的子项
                  _.remove(fields, o => _.includes(objArrayIds, o.dataSource));

                  this.updateSource({ fields });
                }}
              >
                <i className="icon-trash" />
              </span>
            </Tooltip>

            <Tooltip title={_l('添加')}>
              <span
                className="Font16 Gray_75 ThemeHoverColor3 mLeft10 pointer mTop8"
                style={{ visibility: item.type === 10000008 && item.fieldValueId ? 'hidden' : 'visible' }}
                onClick={() => this.addParameters(item)}
              >
                <i className="icon-add" />
              </span>
            </Tooltip>
          </div>
          {this.renderList(data.fields.filter(o => o.dataSource === item.fieldId))}
        </Fragment>
      );
    });
  };

  /**
   * 默认参数
   */
  getDefaultParameters = () => {
    return { fieldName: '', desc: '', type: 2, fieldId: uuidv4(), alias: '' };
  };

  /**
   * 更新输出PBC字段的值
   */
  updateExportFields = (action, value, { fieldId, type, dataSource }, isBlur) => {
    const { data } = this.state;
    const fields = _.cloneDeep(data.fields);

    fields.forEach(item => {
      if (item.fieldId === fieldId) {
        item[action] =
          isBlur &&
          _.includes(['fieldName', 'alias'], action) &&
          !!fields
            .filter(o => o.dataSource === dataSource)
            .find(o => value && o[action] === value && o.fieldId !== fieldId)
            ? value +
              Math.floor(Math.random() * 10000)
                .toString()
                .padStart(4, '0')
            : value;

        if (action === 'type') {
          item.fieldValue = '';
          item.fieldValueId = '';
        }
      }
    });

    // 数组调整类型
    if (action === 'type' && _.includes([10000007, 10000008], type)) {
      _.remove(fields, o => o.dataSource === fieldId);
    }

    // 普通数组
    if (action === 'type' && value === 10000007) {
      fields.push(Object.assign({}, this.getDefaultParameters(), { fieldName: 'string', dataSource: fieldId }));
    }

    this.updateSource({ fields });
  };

  /**
   * 添加输出参数
   */
  addParameters = ({ type, dataSource, fieldId }) => {
    const { isPlugin } = this.props;
    const { data } = this.state;
    const fields = _.cloneDeep(data.fields);
    const defaultParameters = this.getDefaultParameters();
    let index = 0;

    fields.forEach((item, i) => {
      if (item.fieldId === fieldId) {
        index = i;
      }
    });

    if (!fieldId) {
      index = fields.length - 1;
    }

    if (type === 10000008 || dataSource) {
      fields.splice(index + 1, 0, Object.assign({}, defaultParameters, { dataSource: dataSource || fieldId }));
    } else {
      fields.splice(index + 1, 0, defaultParameters);
    }

    this.updateSource({ fields });

    if (!isPlugin) {
      this.setState({ selectFieldId: defaultParameters.fieldId });
      this.cacheItem = _.cloneDeep(defaultParameters);
    }
  };

  /**
   * 渲染内容
   */
  renderContent() {
    const { data, cacheKey } = this.state;
    const MODES = [
      { text: _l('执行单次'), value: 0 },
      { text: _l('执行多次'), value: 1 },
    ];
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
        <div className="flexRow">
          <div className="bold flex">{_l('选择业务流程')}</div>
          <div className="ThemeColor3 ThemeHoverColor2 pointer" onClick={this.createNewPBPFlow}>
            + {_l('新建封装业务流程')}
          </div>
        </div>

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
                    onClick={() =>
                      this.updateSource({
                        executeType: item.value,
                        selectNodeId: '',
                        number: Object.assign({}, data.number, { fieldControlId: '', fieldNodeId: '', fieldValue: '' }),
                      })
                    }
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
                      <div className="mTop10 mLeft30 Gray_75">{item.desc}</div>
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
            <div className="mLeft25 mTop5 Gray_75">
              {_l('勾选后，将等待业务流程执行完毕。如果执行方式为“执行单次”，则之后节点还可使用业务流程的输出参数')}
            </div>

            <div className="mTop20 bold">{_l('输入参数')}</div>
            <div className="mTop5 Gray_75">{_l('向业务流程的输入参数传递初始值，供其执行时使用')}</div>
            <ProcessParameters
              {...this.props}
              data={{ ...data, fields: this.splitFields(1) }}
              updateSource={(obj, callback) => {
                if (obj.fields) {
                  obj.fields = obj.fields.concat(this.splitFields(0));
                }

                this.updateSource(obj, callback);
              }}
            />

            <ProcessVariablesInput
              {...this.props}
              key={cacheKey}
              data={{
                ...data,
                fields: this.splitFields(0),
                subProcessVariables: data.subProcessVariables.filter(o => o.processVariableType === 0),
              }}
              selectProcessId={data.appId}
              desc={_l('向业务流程的流程参数传递初始值，供其执行时使用')}
              updateSource={(obj, callback) => {
                if (obj.fields) {
                  obj.fields = obj.fields.concat(this.splitFields(1));
                }

                this.updateSource(obj, callback);
              }}
            />

            <TransferTriggerUser {...this.props} data={data} updateSource={this.updateSource} />
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
            ? () => <span className="Gray_75">{_l('请选择')}</span>
            : data.appId && !selectAppItem
              ? () => <span className="errorColor">{_l('业务流程无效或已删除')}</span>
              : () => (
                  <Fragment>
                    <span>{selectAppItem.name}</span>
                    {selectAppItem.otherApkName && <span className="Gray_75">（{selectAppItem.otherApkName}）</span>}
                  </Fragment>
                )
        }
        border
        openSearch
        noData={_l('暂无业务流程，请先在应用里创建')}
        onChange={appId => {
          if (appId === 'other') {
            selectPBPDialog({
              appId: this.props.relationId,
              companyId: this.props.companyId,
              onOk: ({ selectPBCId }) => this.getNodeDetail(this.props, { appId: selectPBCId }),
            });
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
    const EXEC_COUNT = [
      { text: _l('依据字段值'), value: 1 },
      { text: _l('依据多条数据对象的数据量'), value: 2 },
    ];

    return (
      <Fragment>
        <Dropdown
          className="flowDropdown mTop10"
          data={EXEC_COUNT}
          value={execCountType}
          border
          onChange={execCountType => {
            this.updateSource({
              selectNodeId: '',
              number: Object.assign({}, data.number, { fieldControlId: '', fieldNodeId: '', fieldValue: '' }),
            });
            this.setState({ execCountType });
          }}
        />
        {execCountType === 1 ? (
          <div className="mTop10">
            <SpecificFieldsValue
              projectId={this.props.companyId}
              processId={this.props.processId}
              relationId={this.props.relationId}
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
   * 新建封装业务流程
   */
  createNewPBPFlow = () => {
    const { relationId, closeDetail } = this.props;

    process
      .addProcess({
        companyId: '',
        relationId,
        relationType: 2,
        startEventAppType: 17,
        name: _l('未命名业务流程'),
      })
      .then(res => {
        appManagement.addWorkflow({ projectId: res.companyId, name: _l('未命名业务流程') });
        window.open(`/workflowedit/${res.id}`);
        closeDetail();
      });
  };

  /**
   * 拆分fields
   */
  splitFields(processVariableType) {
    const { data } = this.state;

    return data.fields.filter(
      item =>
        (!item.fieldId && processVariableType === 0) ||
        _.get(
          _.find(data.subProcessVariables, o => item.fieldId === o.controlId),
          'processVariableType',
        ) === processVariableType,
    );
  }

  render() {
    const { data } = this.state;
    const isPBCOut = data.actionId === ACTION_ID.PBC_OUT;

    if (_.isEmpty(data)) {
      return <LoadDiv className="mTop15" />;
    }

    return (
      <Fragment>
        <DetailHeader
          {...this.props}
          data={{ ...data }}
          icon={isPBCOut ? 'icon-output' : 'icon-pbc'}
          bg="BGBlueAsh"
          updateSource={this.updateSource}
        />
        <div className="flex overflowHidden">
          <ScrollView>
            <div className="workflowDetailBox">{isPBCOut ? this.renderExportContent() : this.renderContent()}</div>
          </ScrollView>
        </div>
        <DetailFooter
          {...this.props}
          isCorrect={!!data.appId || isPBCOut}
          onSave={() => {
            setTimeout(this.onSave, 50);
          }}
        />
      </Fragment>
    );
  }
}

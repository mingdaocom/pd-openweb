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
  ProcessParameters,
} from '../components';
import { ACTION_ID, FIELD_TYPE_LIST } from '../../enum';
import { v4 as uuidv4, validate } from 'uuid';
import cx from 'classnames';
import _ from 'lodash';

export default class PBC extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      saveRequest: false,
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

      if (result.subProcessVariables.length) {
        result.subProcessVariables
          .filter(item => item.dataSource)
          .forEach(item => {
            const parentNode = _.find(result.subProcessVariables, o => o.controlId === item.dataSource);

            if (_.includes([10000007, 10000008], parentNode.type)) {
              result.fields.forEach(o => {
                if (o.fieldId === item.controlId) {
                  o.dataSource = parentNode.controlId;
                }
              });
            }
          });
      }

      this.setState({ data: result, execCountType: result.selectNodeId ? 2 : 1 });
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
          _.remove(obj.fields, o => o.dataSource === item.fieldId);
        });
    }

    this.setState({ data: Object.assign({}, this.state.data, obj) }, callback);
  };

  /**
   * 保存
   */
  onSave = () => {
    const { data, saveRequest } = this.state;
    const { appId, name, fields, executeType, number, selectNodeId, nextExecute } = data;
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
        alert(_l('参数名称不能为空'), 2);
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
    const { data } = this.state;

    return (
      <Fragment>
        <div className="bold">{_l('输出参数')}</div>

        {this.renderList(data.fields.filter(o => !o.dataSource))}

        <div className="addActionBtn mTop25">
          <span className="ThemeBorderColor3" onClick={this.addParameters}>
            <i className="icon-add Font16" />
            {_l('添加参数')}
          </span>
        </div>
      </Fragment>
    );
  }

  /**
   * 渲染输出参数列表
   */
  renderList = source => {
    const { data } = this.state;

    return source.map(item => {
      const parentNode = item.dataSource ? _.find(data.fields, o => o.fieldId === item.dataSource) : {};

      if (parentNode.type === 10000007) return null;

      return (
        <Fragment key={item.fieldId}>
          <div className={cx('mTop8 flexRow relative alignItemsCenter', { pLeft20: item.dataSource })}>
            <input
              type="text"
              className="ThemeBorderColor3 actionControlBox pTop0 pBottom0 pLeft10 pRight10 mTop8"
              style={{ width: 150 }}
              placeholder={_l('参数名')}
              value={item.fieldName}
              maxLength={64}
              onChange={e => this.updateExportFields('fieldName', e.target.value, item)}
              onBlur={e => this.updateExportFields('fieldName', e.target.value.trim(), item, true)}
            />

            <Dropdown
              className="flowDropdown mLeft10 mTop8"
              style={{ width: 120 }}
              data={FIELD_TYPE_LIST.filter(
                o =>
                  !_.includes([14, 10000003], o.value) &&
                  (!item.dataSource || (item.dataSource && o.value !== 10000008)),
              )}
              value={item.type}
              renderTitle={() => <span>{FIELD_TYPE_LIST.find(o => o.value === item.type).text}</span>}
              border
              disabled={!validate(item.fieldId)}
              onChange={type => {
                this.updateExportFields('type', type, item);
              }}
            />

            <div className="flex mLeft10" style={{ minWidth: 0 }}>
              <SingleControlValue
                companyId={this.props.companyId}
                processId={this.props.processId}
                selectNodeId={this.props.selectNodeId}
                sourceNodeId={item.dataSource ? parentNode.nodeId : ''}
                controls={data.fields.map(o => {
                  if (o.type === 10000008) {
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
              />
            </div>
            <i
              className="icon-delete2 Font16 Gray_9e ThemeHoverColor3 mLeft10 pointer mTop8"
              onClick={() => {
                let fields = [].concat(data.fields);

                _.remove(fields, o => o.fieldId === item.fieldId);
                this.updateSource({ fields });
              }}
            />
            <i
              className="icon-add Font20 pointer Gray_9e ThemeHoverColor3 mLeft10 pointer mTop8"
              style={{ visibility: item.type === 10000008 && item.fieldValueId ? 'hidden' : 'visible' }}
              onClick={() => this.addParameters(item)}
            />
          </div>
          <div className={cx('mTop10 flexRow alignItemsCenter', { pLeft20: item.dataSource })}>
            <input
              type="text"
              className="ThemeBorderColor3 actionControlBox pTop0 pBottom0 pLeft10 pRight10"
              style={{ width: 150 }}
              placeholder={_l('别名')}
              value={item.alias}
              onChange={e => this.updateExportFields('alias', e.target.value.replace(/[^a-z\d-_]/gi, ''), item)}
              onBlur={e => {
                let value = e.target.value.trim();

                if (value && !/^[a-zA-Z]{1}/.test(value)) {
                  value = 'pbp' + value;
                }

                this.updateExportFields('alias', value, item, true);
              }}
            />
            <input
              type="text"
              className="ThemeBorderColor3 actionControlBox pTop0 pBottom0 pLeft10 pRight10 flex mLeft10"
              placeholder={_l('说明')}
              value={item.desc}
              onChange={evt => this.updateExportFields('desc', evt.target.value, item)}
              onBlur={evt => this.updateExportFields('desc', evt.target.value.trim(), item)}
            />
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
    const { data } = this.state;
    const fields = _.cloneDeep(data.fields);
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
      fields.splice(
        index + 1,
        0,
        Object.assign({}, this.getDefaultParameters(), { dataSource: dataSource || fieldId }),
      );
    } else {
      fields.splice(index + 1, 0, this.getDefaultParameters());
    }

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
            <ProcessParameters {...this.props} data={data} updateSource={this.updateSource} />
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

  render() {
    const { data, showOtherPBC } = this.state;
    const isPBCOut = data.actionId === ACTION_ID.PBC_OUT;

    if (_.isEmpty(data)) {
      return <LoadDiv className="mTop15" />;
    }

    return (
      <Fragment>
        <DetailHeader
          {...this.props}
          data={{ ...data }}
          icon="icon-pbc"
          bg="BGBlueAsh"
          updateSource={this.updateSource}
        />
        <div className="flex mTop20">
          <ScrollView>
            <div className="workflowDetailBox">{isPBCOut ? this.renderExportContent() : this.renderContent()}</div>
          </ScrollView>
        </div>
        <DetailFooter {...this.props} isCorrect={!!data.appId || isPBCOut} onSave={this.onSave} />

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

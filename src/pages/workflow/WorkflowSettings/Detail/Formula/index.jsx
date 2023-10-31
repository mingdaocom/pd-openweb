import React, { Component, Fragment } from 'react';
import { ScrollView, LoadDiv, Dropdown, Checkbox, Radio } from 'ming-ui';
import cx from 'classnames';
import { DateTime } from 'ming-ui/components/NewDateTimePicker';
import { Tooltip } from 'antd';
import flowNode from '../../../api/flowNode';
import {
  SelectOtherFields,
  Tag,
  FnList,
  DetailHeader,
  DetailFooter,
  CustomTextarea,
  SelectNodeObject,
  FindMode,
  SpecificFieldsValue,
} from '../components';
import { ACTION_ID, DATE_SHOW_TYPES } from '../../enum';
import CodeEdit from 'src/pages/widgetConfig/widgetSetting/components/FunctionEditorDialog/Func/common/CodeEdit';
import FunctionEditorDialog from 'src/pages/widgetConfig/widgetSetting/components/FunctionEditorDialog';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import { handleGlobalVariableName } from '../../utils';

const DotBox = styled.div`
  input {
    width: 28px;
    min-width: 28px !important;
    text-align: center;
  }
`;

export default class Formula extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      saveRequest: false,
      showFormulaLayer: false,
      fnmatchPos: null,
      fnmatch: '',
      isFocus: false,
      showFormulaDialog: false,
      fieldsData: [],
      functionError: false,
    };
  }

  componentDidMount() {
    this.getNodeDetail(this.props);
  }

  componentWillReceiveProps(nextProps, nextState) {
    if (nextProps.selectNodeId !== this.props.selectNodeId) {
      this.setState({ isFocus: false });
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
  getNodeDetail(props) {
    const { processId, selectNodeId, selectNodeType } = props;

    flowNode.getNodeDetail({ processId, nodeId: selectNodeId, flowNodeType: selectNodeType }).then(result => {
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
    const { data, saveRequest, functionError } = this.state;
    const {
      name,
      actionId,
      fieldValue,
      fieldControlId,
      fieldNodeId,
      formulaValue,
      number,
      startTime,
      endTime,
      outUnit,
      nullZero,
      selectNodeId,
      execute,
      unit,
      limit,
      type,
    } = data;

    // 日期/时间
    if (actionId === ACTION_ID.DATE_FORMULA && !fieldValue && !fieldControlId) {
      alert(_l('日期/时间字段不能为空'), 2);
      return;
    }

    if (_.includes([ACTION_ID.NUMBER_FORMULA, ACTION_ID.DATE_FORMULA], actionId) && !formulaValue) {
      alert(_l('运算公式不能为空'), 2);
      return;
    }

    if (
      actionId === ACTION_ID.DATE_DIFF_FORMULA &&
      ((!startTime.fieldValue && !startTime.fieldControlId) || (!endTime.fieldValue && !endTime.fieldControlId))
    ) {
      alert(_l('开始日期和结束日期不能为空'), 2);
      return;
    }

    if (actionId === ACTION_ID.TOTAL_STATISTICS && !selectNodeId) {
      alert(_l('必须先选择一个对象'), 2);
      return;
    }

    if (actionId === ACTION_ID.FUNCTION_CALCULATION) {
      if (functionError) {
        alert(_l('函数有误'), 2);
        return;
      } else if (!formulaValue) {
        alert(_l('函数不能为空'), 2);
        return;
      }
    }

    if (saveRequest) {
      return;
    }

    flowNode
      .saveNode({
        processId: this.props.processId,
        nodeId: this.props.selectNodeId,
        flowNodeType: this.props.selectNodeType,
        actionId,
        name: name.trim(),
        fieldValue,
        fieldControlId,
        fieldNodeId,
        formulaValue: (formulaValue || '').replace(/,\)/g, ')'),
        number,
        startTime,
        endTime,
        outUnit,
        nullZero,
        selectNodeId,
        execute,
        unit,
        limit,
        type,
      })
      .then(result => {
        this.props.updateNodeData(result);
        this.props.closeDetail();
      });

    this.setState({ saveRequest: true });
  };

  /**
   * 渲染公式控件和其他节点值
   */
  renderFormulaAndOtherValue() {
    const { data, isFocus } = this.state;

    return (
      <CustomTextarea
        className={cx('minH100', { errorBorder: !!data.formulaValue && data.isException && !isFocus })}
        projectId={this.props.companyId}
        processId={this.props.processId}
        relationId={this.props.relationId}
        selectNodeId={this.props.selectNodeId}
        operatorsSetMargin={true}
        type={6}
        content={data.formulaValue}
        formulaMap={data.formulaMap}
        getRef={tagtextarea => (this.tagtextarea = tagtextarea)}
        onFocus={() => this.setState({ isFocus: true })}
        onChange={(err, value, obj) => this.handleChange(err, value, obj, data.actionId === ACTION_ID.NUMBER_FORMULA)}
        updateSource={this.updateSource}
      />
    );
  }

  /**
   * formula handle change
   */
  handleChange(err, value, obj, isNumber) {
    // 数字/金额
    if (isNumber) {
      const { fnmatch } = this.state;
      let newFnmatch = '';
      if (obj.origin === '+input') {
        if (!/[0-9|\+|\-|\*|\/|\(|\),]/.test(obj.text[0])) {
          newFnmatch = fnmatch + obj.text[0];
        }
      }
      if (obj.origin === '+delete' && fnmatch && obj.removed[0]) {
        newFnmatch = /^[A-Z0-9]+$/.test(obj.removed[0]) ? fnmatch.replace(new RegExp(`${obj.removed[0]}$`), '') : '';
      }
      this.updateSource({ formulaValue: value }, () => {
        this.setState({
          fnmatch: newFnmatch,
          fnmatchPos: this.tagtextarea.cmObj.getCursor(),
          showFormulaLayer: !!newFnmatch,
        });
      });
    } else {
      this.updateSource({ formulaValue: value });
    }
  }

  /**
   * 渲染数值 金额内容
   */
  renderNumberContent() {
    const { data, showFormulaLayer, fnmatch } = this.state;

    return (
      <Fragment>
        <div className="Font14 Gray_75 workflowDetailDesc">{_l('对 数值/金额 等字段进行数学运算')}</div>
        <div className="mTop20 bold">{_l('运算')}</div>
        <div className="mTop15 Gray_9e">
          {_l('英文输入+、-、*、/、( ) 进行运算 或')}
          <span
            className="ThemeColor3 ThemeHoverColor2 pointer addFormula mLeft5"
            onClick={() => this.setState({ showFormulaLayer: true, fnmatch: '' })}
          >
            {_l('添加公式')}
          </span>
          。
        </div>
        <div className="Gray_9e">{_l('如：SUM(1, 2, 3)*3，多个数值请使用英文逗号分隔')}</div>

        {this.renderFormulaAndOtherValue()}
        {showFormulaLayer && (
          <div className="relative">
            <FnList
              fnmatch={fnmatch}
              onFnClick={this.handleFnClick}
              onClickAwayExceptions={[document.querySelector('.addFormula')]}
              onClickAway={() => this.setState({ showFormulaLayer: false })}
            />
          </div>
        )}

        {this.renderNumberDot()}

        <div className="mTop20 flexRow">
          <Checkbox
            className="InlineFlex"
            text={_l('参与计算的字段值为空时，视为0')}
            checked={data.nullZero}
            onClick={checked => this.updateSource({ nullZero: !checked })}
          />
        </div>
      </Fragment>
    );
  }

  /**
   * 选择公式回调
   */
  handleFnClick = key => {
    const { fnmatchPos, fnmatch } = this.state;
    if (fnmatch) {
      this.tagtextarea.cmObj.replaceRange(
        `${key}()`,
        { line: fnmatchPos.line, ch: fnmatchPos.ch - 1 },
        { line: fnmatchPos.line, ch: fnmatchPos.ch + fnmatch.length },
        'insertfn',
      );
      this.tagtextarea.cmObj.setCursor({ line: fnmatchPos.line, ch: fnmatchPos.ch + key.length });
      this.tagtextarea.cmObj.focus();
    } else {
      const cursor = this.tagtextarea.cmObj.getCursor();
      this.tagtextarea.cmObj.replaceRange(`${key}()`, this.tagtextarea.cmObj.getCursor(), undefined, 'insertfn');
      this.tagtextarea.cmObj.setCursor({ line: cursor.line, ch: cursor.ch + key.length + 1 });
      this.tagtextarea.cmObj.focus();
    }
    this.setState({
      showFormulaLayer: false,
      fnmatch: '',
    });
  };

  /**
   * 渲染日期控件
   */
  renderDateControl(data, callback, key = 'dateFieldsVisible') {
    return (
      <div className="mTop10 flexRow relative">
        {data.fieldNodeId ? (
          <div
            className={cx('actionControlBox flex ThemeBorderColor3 clearBorderRadius ellipsis actionCustomBox', {
              actionCustomBoxError: !data.fieldNodeName || !data.fieldControlName,
            })}
          >
            <span className="flexRow pTop3">
              <Tag
                flowNodeType={data.fieldNodeType}
                appType={data.fieldAppType}
                actionId={data.fieldActionId}
                nodeName={handleGlobalVariableName(data.fieldNodeId, data.sourceType, data.fieldNodeName)}
                controlId={data.fieldControlId}
                controlName={data.fieldControlName}
              />
            </span>
            <i
              className="icon-delete actionControlDel ThemeColor3"
              onClick={() =>
                callback({
                  fieldNodeType: 0,
                  fieldNodeId: '',
                  fieldNodeName: '',
                  fieldControlId: '',
                  fieldControlName: '',
                })
              }
            />
          </div>
        ) : (
          <div className="actionControlBox flex ThemeBorderColor3 clearBorderRadius">
            <DateTime
              selectedValue={data.fieldValue ? moment(data.fieldValue) : null}
              timePicker
              timeMode="minute"
              allowClear={false}
              onOk={e => callback({ fieldValue: e.format('YYYY-MM-DD HH:mm') })}
            >
              {data.fieldValue ? (
                moment(data.fieldValue).format('YYYY-MM-DD HH:mm')
              ) : (
                <span className="Gray_bd">{_l('请选择日期')}</span>
              )}
            </DateTime>
          </div>
        )}
        <SelectOtherFields
          item={{ type: 15 }}
          fieldsVisible={this.state[key]}
          projectId={this.props.companyId}
          processId={this.props.processId}
          relationId={this.props.relationId}
          selectNodeId={this.props.selectNodeId}
          handleFieldClick={obj =>
            callback({
              fieldValue: '',
              fieldNodeType: obj.nodeTypeId,
              fieldAppType: obj.appType,
              fieldActionId: obj.actionId,
              fieldNodeId: obj.nodeId,
              fieldNodeName: obj.nodeName,
              fieldControlId: obj.fieldValueId,
              fieldControlName: obj.fieldValueName,
              sourceType: obj.sourceType,
            })
          }
          openLayer={() => this.setState({ [key]: true })}
          closeLayer={() => this.setState({ [key]: false })}
        />
      </div>
    );
  }

  /**
   * 渲染日期时间内容
   */
  renderDateContent() {
    const { data } = this.state;

    return (
      <Fragment>
        <div className="Font14 Gray_75 workflowDetailDesc">
          {_l('对 日期/时间 添加/减去年、月、天、小时、分进行计算')}
        </div>
        <div className="mTop20 bold">{_l('输入日期/时间字段')}</div>
        {this.renderDateControl(data, this.updateSource)}

        <div className="mTop20 Gray_9e">
          {_l('设置参与运算时的日期格式')}
          <span
            className="mLeft5 workflowDetailTipsWidth"
            data-tip={_l(
              '如：可以将 2008/11/11 12:23 格式化为“日期”，以2008/11/11参与运算。+8h后，得到时间结果：2008/11/11 8:00',
            )}
          >
            <i className="icon-novice-circle" />
          </span>
        </div>

        <Dropdown
          className="flowDropdown mTop10"
          data={[
            { text: _l('日期+时间'), value: 1 },
            { text: _l('日期'), value: 2 },
          ]}
          value={data.number}
          border
          onChange={number => this.updateSource({ number })}
        />

        <div className="mTop20 bold">{_l('运算')}</div>
        <div className="mTop10 Gray_9e">
          {_l('输入你想要 添加/减去 的时间。如：+8h+1m，+1M-12d, -1d+8h。当使用数值字段运算时，请不要忘记输入单位。')}
          <Tooltip
            title={() => {
              return (
                <Fragment>
                  <div>{_l('年：Y（大写）')}</div>
                  <div>{_l('月：M（大写）')}</div>
                  <div>{_l('日：d')}</div>
                  <div>{_l('小时: h')}</div>
                  <div>{_l('分：m')}</div>
                </Fragment>
              );
            }}
          >
            <span className="ThemeColor3">{_l('查看时间单位')}</span>
          </Tooltip>
        </div>

        {this.renderFormulaAndOtherValue()}

        <div className="mTop20 bold">{_l('输出格式')}</div>
        <Dropdown
          className="flowDropdown mTop10"
          data={[
            { text: _l('日期+时间'), value: 1 },
            { text: _l('日期'), value: 3 },
            { text: _l('时分'), value: 8 },
            { text: _l('时分秒'), value: 9 },
          ]}
          value={data.unit}
          border
          onChange={unit => this.updateSource({ unit })}
        />
      </Fragment>
    );
  }

  /**
   * 渲染日期时间差内容
   */
  renderDateDiffContent() {
    const { data } = this.state;

    return (
      <Fragment>
        <div className="Font14 Gray_75 workflowDetailDesc">
          {_l('计算两个日期/时间之间的时长，并精确到年、月、天、时、分、秒')}
        </div>
        <div className="mTop20 bold">{_l('开始')}</div>
        {this.renderDateControl(
          data.startTime,
          obj => this.updateSource({ startTime: Object.assign({}, data.startTime, obj) }),
          'startTimeFieldsVisible',
        )}

        <div className="mTop20 bold">{_l('结束')}</div>
        {this.renderDateControl(
          data.endTime,
          obj => this.updateSource({ endTime: Object.assign({}, data.endTime, obj) }),
          'endTimeFieldsVisible',
        )}

        <div className="mTop20 bold">{_l('格式化')}</div>
        <div className="mTop10 Gray_9e">{_l('参与计算的日期未设置时间时，格式化方式为：')}</div>
        <Dropdown
          className="flowDropdown mTop10"
          data={[
            { text: _l('开始 00:00，结束24:00'), value: 1 },
            { text: _l('开始 00:00，结束00:00'), value: 2 },
          ]}
          value={data.number}
          border
          onChange={number => this.updateSource({ number })}
        />

        <div className="mTop20 bold">{_l('输出单位')}</div>
        <Dropdown
          className="flowDropdown mTop10"
          data={[
            { text: _l('年'), value: 1 },
            { text: _l('月'), value: 2 },
            { text: _l('天'), value: 3 },
            { text: _l('时'), value: 4 },
            { text: _l('分'), value: 5 },
            { text: _l('秒'), value: 6 },
          ]}
          value={data.outUnit}
          border
          onChange={outUnit => this.updateSource({ outUnit })}
        />
      </Fragment>
    );
  }

  /**
   * 渲染统计数据总数内容
   */
  renderTotalStatisticsContent() {
    const { data } = this.state;

    return (
      <Fragment>
        <div className="Font14 Gray_75 workflowDetailDesc">{_l('对获取到的多条数据对象进行数据条数的总计')}</div>
        <div className="mTop20 bold">{_l('选择统计对象')}</div>
        <div className="mTop10 Gray_9e">{_l('当前流程中的节点对象')}</div>

        <SelectNodeObject
          appList={data.flowNodeList}
          selectNodeId={data.selectNodeId}
          selectNodeObj={data.selectNodeObj}
          onChange={selectNodeId => {
            const selectNodeObj = _.find(data.flowNodeList, item => item.nodeId === selectNodeId);
            this.updateSource({ selectNodeId, selectNodeObj });
          }}
        />

        <div className="mTop20 bold">{_l('统计结果')}</div>
        <div className="mTop15 flexRow">
          <Checkbox
            className="InlineFlex"
            text={_l('按统计对象数量限制返回结果')}
            checked={data.limit}
            onClick={checked => this.updateSource({ limit: !checked })}
          />
        </div>
      </Fragment>
    );
  }

  /**
   * 渲染函数计算
   */
  renderFunctionExecContent() {
    const { data, showFormulaDialog, fieldsData, functionError } = this.state;
    const TYPES = [
      { text: _l('文本'), value: 2 },
      { text: _l('数值'), value: 6 },
      { text: _l('日期'), value: 15 },
      { text: _l('日期时间'), value: 16 },
    ];

    return (
      <Fragment>
        <div className="Font14 Gray_75 workflowDetailDesc">
          {_l('通过函数对 文本/数值/日期时间 等流程节点对象的值进行处理')}
        </div>
        <div className="mTop20 bold">{_l('计算')}</div>

        <div
          className="mTop10 boderRadAll_4 BorderGrayD pointer formulaEditorBox minH100"
          style={{ borderColor: functionError ? '#f44336' : '#ddd' }}
        >
          <CodeEdit
            value={data.formulaValue}
            mode="read"
            placeholder={_l('点击编辑函数')}
            renderTag={this.renderTag}
            onClick={this.editFormulaDialog}
          />
        </div>

        <div className="mTop20 bold">{_l('运算结果类型')}</div>
        <div className="mTop15 flexRow">
          {TYPES.map((item, i) => (
            <div style={{ marginRight: 64 }} key={i}>
              <Radio
                checked={data.type === item.value}
                text={item.text}
                onClick={() =>
                  this.updateSource({ type: item.value, number: _.includes([15, 16], item.value) ? 0 : 2 })
                }
              />
            </div>
          ))}
        </div>

        {data.type === 6 && this.renderNumberDot()}
        {_.includes([15, 16], data.type) && (
          <Fragment>
            <div className="mTop15 flexRow alignItemsCenter">
              <div>{_l('显示格式')}</div>
              <Dropdown
                style={{ width: 260 }}
                className="flowDropdown mLeft12"
                data={DATE_SHOW_TYPES.map(item => {
                  return { ...item, text: item.text + ` (${moment().format(item.format)}) ` };
                })}
                value={data.number}
                border
                onChange={number => this.updateSource({ number })}
              />
            </div>
          </Fragment>
        )}

        {showFormulaDialog && (
          <FunctionEditorDialog
            className="workflowDialogBox"
            value={{ expression: data.formulaValue }}
            title={_l('结果')}
            controlGroups={fieldsData}
            renderTag={this.renderTag}
            onClose={() => this.setState({ showFormulaDialog: false })}
            onSave={({ expression, status }) => {
              this.updateSource({ formulaValue: expression });
              this.setState({ showFormulaDialog: false, functionError: status !== 1 });
            }}
          />
        )}
      </Fragment>
    );
  }

  /**
   * 渲染小数位数
   */
  renderNumberDot() {
    const { data } = this.state;

    return (
      <div className="mTop15 flexRow flowDetailNumber">
        <div className="mRight12">{_l('结果小数点后保留')}</div>
        <DotBox>
          <SpecificFieldsValue
            updateSource={({ fieldValue }) => this.updateSource({ number: fieldValue })}
            type="number"
            min={0}
            max={9}
            hasOtherField={false}
            data={{ fieldValue: data.number }}
          />
        </DotBox>
        <div className="mLeft12">{_l('位')}</div>
      </div>
    );
  }

  /**
   * 渲染单个标签
   */
  renderTag = tag => {
    const { data } = this.state;
    const ids = tag.split(/([a-zA-Z0-9#]{24,32})-/).filter(item => item);
    const nodeObj = data.formulaMap[ids[0]] || {};
    const controlObj = data.formulaMap[ids[1]] || {};

    return (
      <Tag
        className="pointer"
        flowNodeType={nodeObj.type}
        appType={nodeObj.appType}
        actionId={nodeObj.actionId}
        nodeName={handleGlobalVariableName(ids[0], controlObj.sourceType, nodeObj.name)}
        controlId={ids[1]}
        controlName={controlObj.name}
      />
    );
  };

  /**
   * 编辑函数弹层
   */
  editFormulaDialog = event => {
    const { processId, selectNodeId } = this.props;

    if ($(event.target).closest('.ant-tooltip').length) return;

    if (!this.state.fieldsData.length) {
      flowNode
        .getFlowNodeAppDtos({
          processId,
          nodeId: selectNodeId,
          type: 2,
        })
        .then(result => {
          let formulaMap = {};
          const fieldsData = result.map(obj => {
            return {
              name: obj.nodeName,
              id: obj.nodeId,
              controls: obj.controls,
            };
          });

          result.forEach(obj => {
            formulaMap[obj.nodeId] = {
              type: obj.nodeTypeId,
              appType: obj.appType,
              actionId: obj.actionId,
              name: obj.nodeName,
            };

            obj.controls.forEach(o => {
              if (!formulaMap[o.controlId]) {
                formulaMap[o.controlId] = { type: o.type, name: o.controlName };
              }
            });
          });

          this.setState({ fieldsData, showFormulaDialog: true });
          this.updateSource({ formulaMap });
        });
    } else {
      this.setState({ showFormulaDialog: true });
    }
  };

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
          icon="icon-workflow_function"
          bg="BGBlueAsh"
          updateSource={this.updateSource}
        />
        <div className="flex">
          <ScrollView>
            <div className="workflowDetailBox">
              {data.actionId === ACTION_ID.NUMBER_FORMULA && this.renderNumberContent()}
              {data.actionId === ACTION_ID.DATE_FORMULA && this.renderDateContent()}
              {data.actionId === ACTION_ID.DATE_DIFF_FORMULA && this.renderDateDiffContent()}
              {data.actionId === ACTION_ID.TOTAL_STATISTICS && this.renderTotalStatisticsContent()}
              {data.actionId === ACTION_ID.FUNCTION_CALCULATION && this.renderFunctionExecContent()}

              <FindMode isFormula execute={data.execute} onChange={execute => this.updateSource({ execute })} />
            </div>
          </ScrollView>
        </div>
        <DetailFooter
          {...this.props}
          isCorrect={
            (data.actionId === ACTION_ID.NUMBER_FORMULA && data.formulaValue) ||
            (data.actionId === ACTION_ID.DATE_FORMULA &&
              ((data.fieldValue && data.fieldControlId) || data.formulaValue)) ||
            (data.actionId === ACTION_ID.DATE_DIFF_FORMULA &&
              (data.startTime.fieldValue || data.startTime.fieldControlId) &&
              (data.endTime.fieldValue || data.endTime.fieldControlId)) ||
            (data.actionId === ACTION_ID.TOTAL_STATISTICS && data.selectNodeId) ||
            (data.actionId === ACTION_ID.FUNCTION_CALCULATION && data.formulaValue)
          }
          onSave={this.onSave}
        />
      </Fragment>
    );
  }
}

import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import { Dialog, LoadDiv, ScrollView } from 'ming-ui';
import flowNode from '../../../api/flowNode';
import { APP_TYPE, DATE_TYPE, TRIGGER_ID } from '../../enum';
import { checkConditionsIsNull, checkJSON, clearFlowNodeMapParameter, getIcons, getStartNodeColor } from '../../utils';
import { DetailFooter, DetailHeader } from '../components';
import AgentContent from './AgentContent';
import ApprovalProcess from './ApprovalProcess';
import CustomAction from './CustomAction';
import DateContent from './DateContent';
import DiscussContent from './DiscussContent';
import LoopContent from './LoopContent';
import LoopProcessContent from './LoopProcessContent';
import PBCContent from './PBCContent';
import SubProcess from './SubProcess';
import UserAndDepartment from './UserAndDepartment';
import WebhookContent from './WebhookContent';
import WorksheetContent from './WorksheetContent';

const START_NODE_EXECUTE_DATE_TYPE = 16;

export default class Start extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      saveRequest: false,
    };
  }

  componentDidMount() {
    this.getNodeDetail();
  }

  componentWillReceiveProps(nextProps) {
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
  getNodeDetail = ({ appId = undefined, fields = undefined } = {}) => {
    const { processId, selectNodeId, selectNodeType, flowInfo, isIntegration, instanceId } = this.props;

    flowNode
      .getNodeDetail(
        { processId, nodeId: selectNodeId, flowNodeType: selectNodeType, appId, fields, instanceId },
        { isIntegration },
      )
      .then(result => {
        if (result.appType === APP_TYPE.PBC && !flowInfo.child && !result.controls.length) {
          result.controls = [
            {
              controlId: uuidv4(),
              controlName: '',
              type: 2,
              alias: '',
              required: false,
              desc: '',
              workflowDefaultValue: '',
              attribute: 0,
              options: [{ key: '', value: '' }],
            },
          ];
        }

        if (result.appType === APP_TYPE.APPROVAL_START && fields) {
          result = Object.assign(this.state.data, { fields: result.fields, flowNodeMap: result.flowNodeMap });
        }

        if (
          result.appType === APP_TYPE.APPROVAL_START &&
          (!result.processConfig.userTaskNullMaps || result.processConfig.userTaskNullMaps[0])
        ) {
          result.processConfig.userTaskNullMaps = { [result.processConfig.userTaskNullPass ? 1 : 3]: [] };
          result.processConfig.userTaskNullPass = false;
        }

        this.setState({ data: result });
      });
  };

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
  onSave = ({ close = true, isUpdate = undefined } = {}) => {
    const { flowInfo, isPlugin } = this.props;
    const { data, saveRequest } = this.state;
    // 处理按时间触发时间日期
    const isDateField =
      _.get(
        _.find(data.controls, ({ controlId }) => controlId === _.get(data, 'assignFieldId')),
        'type',
      ) === START_NODE_EXECUTE_DATE_TYPE;
    const {
      appId,
      appType,
      assignFieldId,
      assignFieldIds,
      operateCondition,
      triggerId,
      name,
      executeTimeType,
      number,
      unit,
      executeTime,
      executeEndTime,
      endTime,
      repeatType,
      interval,
      frequency,
      weekDays,
      config,
      controls = [],
      returnJson,
      returns = [],
      processConfig,
      hooksAll,
      hooksBody,
      fields,
      flowNodeMap,
      addNotAllowView,
      formProperties,
    } = data;
    let { time } = data;
    time = isDateField ? '' : time;

    if (saveRequest) {
      return;
    }

    if (!flowInfo.child) {
      if (!appId && (appType === APP_TYPE.SHEET || appType === APP_TYPE.DATE)) {
        alert(_l('必须先选择一个表'), 2);
        return;
      }

      if (appType === APP_TYPE.WEBHOOK && !data.controls.length && close) {
        alert(_l('请设置有效的参数'), 2);
        return;
      }

      if (checkConditionsIsNull(operateCondition)) {
        alert(_l('筛选条件的判断值不能为空'), 2);
        return;
      }

      if (repeatType === DATE_TYPE.CUSTOM && config && !this.checkTimingTriggerConfig(config)) {
        return;
      }

      if (!hooksAll && returnJson && !checkJSON(returnJson)) {
        alert(_l('自定义数据返回JSON格式错误，请修改'), 2);
        return;
      }

      if (_.includes([APP_TYPE.PBC, APP_TYPE.PARAMETER, APP_TYPE.LOOP_PROCESS], appType)) {
        let arrError = 0;
        let objArrError = 0;

        if (controls.filter(item => !item.controlName).length) {
          alert(appType === APP_TYPE.LOOP_PROCESS ? _l('参数名称不能为空') : _l('字段名不能为空'), 2);
          return;
        }

        controls
          .filter(item => item.type === 10000003)
          .forEach(item => {
            if (_.isEmpty(safeParse(item.value)) || !_.isArray(safeParse(item.value))) arrError++;
          });

        if (arrError) {
          alert(_l('数组范例数据有错误'), 2);
          return;
        }

        controls
          .filter(item => item.type === 10000008)
          .forEach(item => {
            if (!controls.find(o => o.dataSource === item.controlId)) objArrError++;
          });

        if (objArrError) {
          alert(_l('对象数组下至少要有一个参数'), 2);
          return;
        }

        if (
          controls.filter(
            item =>
              item.dataSource && !item.alias && controls.find(o => o.controlId === item.dataSource).type === 10000008,
          ).length
        ) {
          alert(_l('对象数组下，子节点的别名为必填'), 2);
          return;
        }

        if (controls.filter(item => item.type === 9 && !!item.options.filter(o => !o.key || !o.value).length).length) {
          alert(_l('单选的选项名和选项值不能为空'), 2);
          return;
        }

        // 更新选项的sort
        controls.forEach(item => {
          if (item.type === 9) {
            item.options = item.options.map((o, index) => Object.assign({}, o, { index }));
          }
        });
      }

      if (appType === APP_TYPE.LOOP && executeEndTime && moment(executeTime) >= moment(executeEndTime)) {
        alert(_l('结束执行时间不能小于开始执行时间'), 2);
        return;
      }

      if (
        appType === APP_TYPE.APPROVAL_START &&
        ((processConfig.initiatorMaps && processConfig.initiatorMaps[5] && !processConfig.initiatorMaps[5].length) ||
          (processConfig.userTaskNullMaps &&
            processConfig.userTaskNullMaps[5] &&
            !processConfig.userTaskNullMaps[5].length))
      ) {
        alert(_l('必须指定代理人'), 2);
        return;
      }

      if (appType === APP_TYPE.PBC && !data.controls.length && isPlugin) {
        alert(_l('输入参数不允许为空'), 2);
        return;
      }
    }

    flowNode
      .saveNode(
        {
          appId,
          appType,
          assignFieldId,
          assignFieldIds,
          processId: this.props.processId,
          nodeId: this.props.selectNodeId,
          flowNodeType: this.props.selectNodeType,
          operateCondition,
          triggerId,
          name: name.trim(),
          executeTimeType,
          number,
          unit,
          time,
          executeTime,
          executeEndTime,
          endTime,
          repeatType,
          interval,
          frequency,
          weekDays,
          config,
          isUpdate,
          controls: controls.map(o => {
            return Object.assign(o, { workflowRequired: o.required });
          }),
          returnJson,
          returns: returns.filter(o => !!o.name),
          processConfig,
          hooksBody,
          fields,
          flowNodeMap: clearFlowNodeMapParameter(flowNodeMap),
          addNotAllowView,
          formProperties,
        },
        { isIntegration: this.props.isIntegration },
      )
      .then(result => {
        this.props.updateNodeData(result);
        close && this.props.closeDetail();
        this.setState({ saveRequest: false });
      });

    this.setState({ saveRequest: true });
  };

  /**
   * 切换工作表
   */
  switchWorksheet = appId => {
    const refreshSource = () => this.getNodeDetail({ appId });

    if (this.state.data.appId) {
      Dialog.confirm({
        title: <span style={{ color: '#f44336' }}>{_l('注意！你将要更改触发流程的工作表')}</span>,
        description: _l(
          '更换为新的工作表后，所有相关节点配置的字段都将被重置，你需要重新配置这些节点。请确认你需要执行此操作',
        ),
        okText: _l('确认更改'),
        onOk: refreshSource,
      });
    } else {
      refreshSource();
    }
  };

  /**
   * 筛选条件头
   */
  triggerConditionHeader = () => {
    return (
      <div className="mTop25">
        <div className="Font13 bold">{_l('触发条件')}</div>
        <div className="Font13 mTop5 Gray_75">{_l('当记录满足以下条件时进入流程')}</div>
      </div>
    );
  };

  /**
   * 渲染筛选条件按钮
   */
  renderConditionBtn = () => {
    const { data } = this.state;
    const isNatural = data.appId || _.includes([APP_TYPE.USER, APP_TYPE.DEPARTMENT], data.appType);

    return (
      <div className="addActionBtn mTop25">
        <span
          className={isNatural ? 'ThemeBorderColor3' : 'Gray_bd borderColor_c'}
          onClick={() => isNatural && this.updateSource({ operateCondition: [[{}]] })}
        >
          <i className="icon-add Font16" />
          {_l('筛选条件')}
        </span>
        <div className={cx('mTop10 Font13', isNatural ? 'Gray_75' : 'Gray_bd')}>
          {_l('设置筛选条件，仅使满足条件的记录进入流程。')}
        </div>
      </div>
    );
  };

  /**
   * 验证定时触发配置是否正确
   */
  checkTimingTriggerConfig = config => {
    const errorText = {
      minute: _l('分钟'),
      hour: _l('小时'),
      day: _l('天'),
      week: _l('星期'),
      month: _l('月'),
    };
    const errorKeys = [];

    Object.keys(config).forEach(key => {
      if ((config[key].type === 2 || config[key].type === 4) && (!config[key].values[0] || !config[key].values[1])) {
        errorKeys.push(key);
      }

      if (config[key].type === 3 && !config[key].values[0]) {
        errorKeys.push(key);
      }
    });

    if (errorKeys.length) {
      alert(_l('%0配置有误', errorKeys.map(obj => errorText[obj]).join('、')), 2);
    }

    return !errorKeys.length;
  };

  render() {
    const { processId, selectNodeId, flowInfo } = this.props;
    const { data } = this.state;

    if (_.isEmpty(data)) {
      return <LoadDiv className="mTop15" />;
    }

    return (
      <Fragment>
        <DetailHeader
          {...this.props}
          data={{ ...data }}
          icon={flowInfo.child ? 'icon-subprocess' : getIcons(data.typeId, data.appType, data.triggerId)}
          bg={flowInfo.child ? 'BGBlueAsh' : getStartNodeColor(data.appType, data.triggerId)}
          updateSource={this.updateSource}
        />
        <div className="flex overflowHidden">
          <ScrollView>
            {flowInfo.child ? (
              <SubProcess data={data} updateSource={this.updateSource} />
            ) : (
              <Fragment>
                {_.includes([APP_TYPE.SHEET, APP_TYPE.EVENT_PUSH], data.appType) && (
                  <WorksheetContent
                    {...this.props}
                    data={data}
                    switchWorksheet={this.switchWorksheet}
                    updateSource={this.updateSource}
                    triggerConditionHeader={this.triggerConditionHeader}
                    renderConditionBtn={this.renderConditionBtn}
                  />
                )}
                {data.appType === APP_TYPE.LOOP && (
                  <LoopContent
                    data={data}
                    updateSource={this.updateSource}
                    getNodeDetail={this.getNodeDetail}
                    checkTimingTriggerConfig={this.checkTimingTriggerConfig}
                  />
                )}
                {data.appType === APP_TYPE.DATE && (
                  <DateContent
                    {...this.props}
                    data={data}
                    switchWorksheet={this.switchWorksheet}
                    updateSource={this.updateSource}
                    triggerConditionHeader={this.triggerConditionHeader}
                    renderConditionBtn={this.renderConditionBtn}
                  />
                )}
                {data.appType === APP_TYPE.WEBHOOK && (
                  <WebhookContent
                    {...this.props}
                    data={data}
                    processId={processId}
                    selectNodeId={selectNodeId}
                    updateSource={this.updateSource}
                    onSave={() => this.onSave({ close: false, isUpdate: true })}
                  />
                )}
                {data.appType === APP_TYPE.CUSTOM_ACTION && <CustomAction data={data} />}
                {_.includes([APP_TYPE.USER, APP_TYPE.DEPARTMENT, APP_TYPE.EXTERNAL_USER], data.appType) &&
                  data.triggerId !== TRIGGER_ID.DISCUSS && (
                    <UserAndDepartment
                      {...this.props}
                      data={data}
                      updateSource={this.updateSource}
                      renderConditionBtn={this.renderConditionBtn}
                    />
                  )}
                {_.includes([APP_TYPE.PBC, APP_TYPE.PARAMETER], data.appType) && (
                  <PBCContent {...this.props} data={data} updateSource={this.updateSource} />
                )}
                {data.triggerId === TRIGGER_ID.DISCUSS && <DiscussContent data={data} />}
                {data.appType === APP_TYPE.APPROVAL_START && (
                  <ApprovalProcess
                    {...this.props}
                    data={data}
                    getNodeDetail={this.getNodeDetail}
                    updateSource={this.updateSource}
                  />
                )}
                {data.appType === APP_TYPE.LOOP_PROCESS && (
                  <LoopProcessContent {...this.props} data={data} updateSource={this.updateSource} />
                )}
                {data.appType === APP_TYPE.CHATBOT && <AgentContent data={data} />}
              </Fragment>
            )}
          </ScrollView>
        </div>
        <DetailFooter
          {...this.props}
          isCorrect={
            flowInfo.child ||
            (_.includes([APP_TYPE.SHEET, APP_TYPE.DATE, APP_TYPE.EVENT_PUSH], data.appType) && data.appId) ||
            (data.appType === APP_TYPE.WEBHOOK && data.controls.length) ||
            _.includes(
              [
                APP_TYPE.LOOP,
                APP_TYPE.USER,
                APP_TYPE.DEPARTMENT,
                APP_TYPE.CUSTOM_ACTION,
                APP_TYPE.EXTERNAL_USER,
                APP_TYPE.PBC,
                APP_TYPE.PARAMETER,
                APP_TYPE.APPROVAL_START,
                APP_TYPE.LOOP_PROCESS,
                APP_TYPE.CHATBOT,
              ],
              data.appType,
            )
          }
          onSave={() => {
            if (data.appType === APP_TYPE.WEBHOOK) {
              this.onSave({ isUpdate: false });
            } else {
              this.onSave();
            }
          }}
        />
      </Fragment>
    );
  }
}

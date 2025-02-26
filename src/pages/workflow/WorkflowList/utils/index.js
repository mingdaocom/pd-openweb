import React, { Fragment } from 'react';
import { MdLink } from 'ming-ui';
import moment from 'moment';
import { DATE_TYPE, EXEC_TIME_TYPE, TIME_TYPE_NAME, APP_TYPE, ACTION_ID } from '../../WorkflowSettings/enum';

export const FLOW_TYPE = {
  APP: '1',
  TIME: '2',
  OTHER_APP: '3',
  ADMIN_APP: '4',
  ADMIN_NETWORK: '5',
  WEBHOOK: '6',
  CUSTOM_ACTION: '7',
  SUB_PROCESS: '8',
  USER: '9',
  PBC: '10',
  APPROVAL: '11',
  EVENT_PUSH: '12',
  LOOP: '13',
};

export const FLOW_TYPE_NULL = {
  1: {
    icon: 'sheet',
    text: _l('当新增记录或已有记录发生修改时运行流程'),
  },
  2: {
    icon: 'date',
    text: _l('按照设置的时间周期，或保存在工作表记录中的时间运行流程'),
  },
  3: {
    icon: 'other',
    text: _l('暂无修改本应用的外部流程'),
  },
  4: {
    icon: 'workflow',
    text: _l('暂无应用流程'),
  },
  5: {
    icon: 'workflow',
    text: _l('暂无组织流程'),
  },
  6: {
    icon: 'webhook',
    text: _l('在服务器接收到第三方推送的消息后运行流程'),
  },
  7: {
    icon: 'action',
    text: _l('当用户点击记录的自定义按钮后运行流程'),
  },
  8: {
    icon: 'subprocess',
    text: _l('在某个流程流转过程中可以创建一个子流程并执行'),
  },
  9: {
    icon: 'user',
    text: _l('当组织人员入/离职或外部用户注册/登录/删除时运行流程'),
  },
  10: {
    icon: 'pbc',
    text: _l('封装应用中可被复用的数据处理能力，自定义输入/输出'),
  },
  11: {
    icon: 'approval',
    text: _l('对业务数据发起审批流程，实现自动化和人工审批的打通'),
  },
  12: {
    icon: 'sheet',
    text: _l('当满足条件事件触发时，进行数据推送'),
  },
  13: {
    icon: 'loop',
    text: _l('在某个流程中执行一段循环的流程'),
  },
};

export const START_APP_TYPE = {
  1: {
    iconName: 'table',
    iconColor: '#ffa340',
    text: _l('工作表事件'),
  },
  5: {
    iconName: 'hr_surplus',
    iconColor: '#2196f3',
    text: _l('时间'),
  },
  6: {
    iconName: 'hr_time',
    iconColor: '#2196f3',
    text: _l('时间'),
  },
  7: {
    iconName: 'workflow_webhook',
    iconColor: '#4C7D9E',
    text: _l('Webhook'),
  },
  8: {
    iconName: 'custom_actions',
    iconColor: '#4C7D9E',
    text: _l('自定义动作'),
  },
  9: {
    iconName: 'approval',
    iconColor: '#4158DB',
    text: _l('审批流程'),
  },
  subprocess: {
    iconName: 'subprocess',
    iconColor: '#4C7D9E',
    text: _l('子流程'),
  },
  17: {
    iconName: 'pbc',
    iconColor: '#4C7D9E',
    text: _l('封装业务流程'),
  },
  20: {
    iconName: 'hr_structure',
    iconColor: '#01ca83',
    text: _l('人员事件'),
  },
  21: {
    iconName: 'workflow',
    iconColor: '#01ca83',
    text: _l('人员事件'),
  },
  23: {
    iconName: 'language',
    iconColor: '#01ca83',
    text: _l('人员事件'),
  },
  25: {
    iconName: 'sending',
    iconColor: '#4C7D9E',
    text: _l('事件推送'),
  },
  28: {
    iconName: 'custom_actions',
    iconColor: '#4C7D9E',
    text: _l('自定义动作'),
  },
  45: {
    iconName: 'arrow_loop',
    iconColor: '#4C7D9E',
    text: _l('循环'),
  },
};

export const TYPES = [
  { text: _l('所有流程'), value: '', icon: 'icon-workflow' },
  { text: _l('工作表事件%03003'), value: FLOW_TYPE.APP, icon: 'icon-table' },
  { text: _l('时间%03004'), value: FLOW_TYPE.TIME, icon: 'icon-hr_time' },
  { text: _l('人员事件%03005'), value: FLOW_TYPE.USER, icon: 'icon-hr_structure' },
  { text: _l('Webhook'), value: FLOW_TYPE.WEBHOOK, icon: 'icon-workflow_webhook' },
  { text: _l('自定义动作'), value: FLOW_TYPE.CUSTOM_ACTION, icon: 'icon-custom_actions' },
  { text: _l('循环'), value: FLOW_TYPE.LOOP, icon: 'icon-arrow_loop' },
  { text: _l('子流程%03006'), value: FLOW_TYPE.SUB_PROCESS, icon: 'icon-subprocess' },
  { text: _l('审批流程%03007'), value: FLOW_TYPE.APPROVAL, icon: 'icon-approval' },
  { text: _l('封装业务流程%03009'), value: FLOW_TYPE.PBC, icon: 'icon-pbc' },
  { text: _l('外部流程修改本应用%03008'), value: FLOW_TYPE.OTHER_APP, icon: 'icon-public' },
  { text: _l('事件推送'), value: FLOW_TYPE.EVENT_PUSH, icon: 'icon-sending' },
];

export const getActionTypeContent = (type, item, disable) => {
  const days = [_l('星期日'), _l('星期一'), _l('星期二'), _l('星期三'), _l('星期四'), _l('星期五'), _l('星期六')];
  const triggerText = {
    1: _l('仅新增记录时'),
    2: _l('当新增或更新记录时'),
    3: _l('当删除记录时'),
    4: _l('当更新记录时'),
  };
  const userTriggerText = {
    20: {
      1: _l('当新人入职时'),
      3: _l('当人员离职时'),
    },
    21: {
      1: _l('当创建部门时'),
      3: _l('当解散部门时'),
    },
    23: {
      1: _l('当新用户注册时'),
      3: _l('当用户注销时'),
      4: _l('当用户登录时'),
      105: _l('当用户被停用时'),
    },
  };

  // 工作表触发 || 事件推送
  if (_.includes([FLOW_TYPE.APP, FLOW_TYPE.EVENT_PUSH], type)) {
    return triggerText[item.triggerId];
  }

  // 时间触发
  if (type === FLOW_TYPE.TIME) {
    // 循环
    if (item.startAppType === APP_TYPE.LOOP) {
      return (
        <div className="twoRowsContent">
          {_l('%0 开始', moment(item.executeTime).format('YYYY-MM-DD HH:mm'))}

          {item.frequency === DATE_TYPE.DAY &&
            _l('每%0天 %1', item.interval > 1 ? ` ${item.interval} ` : '', moment(item.executeTime).format('HH:mm'))}

          {item.frequency === DATE_TYPE.WEEK &&
            _l(
              '每%0周(%1) %2',
              item.interval > 1 ? ` ${item.interval} ` : '',
              item.weekDays
                .sort((a, b) => a - b)
                .map(o => days[o])
                .join('、'),
              moment(item.executeTime).format('HH:mm'),
            )}

          {item.frequency === DATE_TYPE.MONTH &&
            _l(
              '每%0个月在第 %1 天 %2',
              item.interval > 1 ? ` ${item.interval} ` : '',
              moment(item.executeTime).format('DD'),
              moment(item.executeTime).format('HH:mm'),
            )}

          {item.frequency === DATE_TYPE.YEAR &&
            _l(
              '每%0年在 %1',
              item.interval > 1 ? ` ${item.interval} ` : '',
              moment(item.executeTime).format('MMMDo HH:mm'),
            )}
        </div>
      );
    }

    // 日期触发
    return (
      <Fragment>
        <span>{item.assignFieldName || _l('字段不存在')}</span>
        {!!item.number && (
          <span className="mLeft5">
            {item.executeTimeType === EXEC_TIME_TYPE.BEFORE
              ? _l('之前')
              : item.executeTimeType === EXEC_TIME_TYPE.AFTER
              ? _l('之后')
              : ''}
            {item.executeTimeType !== EXEC_TIME_TYPE.CURRENT && <span>{item.number + TIME_TYPE_NAME[item.unit]}</span>}
          </span>
        )}

        <span className="mLeft5">{item.time}</span>
        {item.assignFieldName && <span className="mLeft5">{_l('执行')}</span>}
      </Fragment>
    );
  }

  // webhook触发
  if (type === FLOW_TYPE.WEBHOOK) {
    return _l('Webhook触发');
  }

  // 自定义动作触发
  if (type === FLOW_TYPE.CUSTOM_ACTION) {
    return item.startActionId === ACTION_ID.BATCH_ACTION ? _l('多条记录') : _l('单条记录');
  }

  // 子流程触发
  if (type === FLOW_TYPE.SUB_PROCESS) {
    return _l('子流程触发');
  }

  // 封装业务流程
  if (type === FLOW_TYPE.PBC) {
    return _l('封装业务流程');
  }

  // 人员或部门
  if (type === FLOW_TYPE.USER) {
    return userTriggerText[item.startAppType][item.triggerId];
  }

  // 审批流程
  if (type === FLOW_TYPE.APPROVAL) {
    return disable ? (
      item.triggerName
    ) : (
      <MdLink to={`/workflowedit/${item.triggerId}`} className="Gray ThemeHoverColor3">
        {item.triggerName}
      </MdLink>
    );
  }

  // 循环流程
  if (type === FLOW_TYPE.LOOP) {
    return item.triggerId === ACTION_ID.CONDITION_LOOP
      ? _l('满足条件时循环')
      : item.triggerId === ACTION_ID.COUNT_LOOP
      ? _l('循环指定次数')
      : _l('循环触发');
  }

  // 所有流程
  if (!type) {
    return (TYPES.find(o => o.value === String(item.processListType)) || {}).text;
  }

  return (item.appNames || []).join('、');
};

export const DATE_SCOPE = [
  {
    text: _l('今天'),
    value: 1,
    format: () => {
      return [moment().format('YYYY-MM-DD'), moment().add(1, 'days').format('YYYY-MM-DD')];
    },
  },
  {
    text: _l('昨天'),
    value: 2,
    format: () => {
      return [moment().add(-1, 'days').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')];
    },
  },
  {
    text: _l('前天'),
    value: 3,
    format: () => {
      return [moment().add(-2, 'days').format('YYYY-MM-DD'), moment().add(-1, 'days').format('YYYY-MM-DD')];
    },
  },
  {
    text: _l('本周'),
    value: 4,
    format: () => {
      return [
        moment().startOf('week').format('YYYY-MM-DD'),
        moment().endOf('week').add(1, 'days').format('YYYY-MM-DD'),
      ];
    },
  },
  {
    text: _l('上周'),
    value: 5,
    format: () => {
      return [
        moment().startOf('week').subtract('week', 1).format('YYYY-MM-DD'),
        moment().endOf('week').subtract('week', 1).add(1, 'days').format('YYYY-MM-DD'),
      ];
    },
  },
  {
    text: _l('本月'),
    value: 6,
    format: () => {
      return [
        moment().startOf('month').format('YYYY-MM-DD'),
        moment().endOf('month').endOf('month').add(1, 'days').format('YYYY-MM-DD'),
      ];
    },
  },
  {
    text: _l('上月'),
    value: 7,
    format: () => {
      return [
        moment().startOf('month').subtract('month', 1).format('YYYY-MM-DD'),
        moment().endOf('month').subtract('month', 1).endOf('month').add(1, 'days').format('YYYY-MM-DD'),
      ];
    },
  },
  {
    text: _l('自定义日期'),
    value: 8,
  },
];

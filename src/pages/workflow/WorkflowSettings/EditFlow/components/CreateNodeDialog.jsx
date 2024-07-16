import React, { Component, Fragment } from 'react';
import { Radio, ScrollView, Support, Icon, Tooltip } from 'ming-ui';
import { NODE_TYPE, ACTION_ID, APP_TYPE, TRIGGER_ID } from '../../enum';
import { getFeatureStatus, buriedUpgradeVersionDialog } from 'src/util';
import { VersionProductType } from 'src/util/enum';
import SelectApprovalProcess from '../../../components/SelectApprovalProcess';
import _ from 'lodash';
import CodeSnippet from '../../../components/CodeSnippet';
import { Base64 } from 'js-base64';
import cx from 'classnames';
import BranchDialog from './BranchDialog';
import { checkPermission } from 'src/components/checkPermission';
import { PERMISSION_ENUM } from 'src/pages/Admin/enum';
import { Drawer } from 'antd';

export default class CreateNodeDialog extends Component {
  constructor(props) {
    super(props);

    const isDisabled = !checkPermission(props.flowInfo.companyId, PERMISSION_ENUM.MEMBER_MANAGE);

    this.state = {
      list: [
        {
          id: 'data',
          name: _l('数据处理%03017'),
          items: [
            {
              type: 6,
              name: _l('新增记录%03018'),
              appType: 1,
              actionId: '1',
              iconColor: '#FFA340',
              iconName: 'icon-workflow_new',
            },
            {
              type: 6,
              name: _l('更新记录%03019'),
              appType: 1,
              actionId: '2',
              iconColor: '#FFA340',
              iconName: 'icon-workflow_update',
            },
            {
              type: 7,
              name: _l('获取单条数据%03021'),
              iconColor: '#FFA340',
              iconName: 'icon-search',
              isGroupList: true,
              secondList: [
                {
                  typeText: _l('从工作表获取'),
                  source: [
                    {
                      type: 7,
                      appType: 1,
                      actionId: '421',
                      name: _l('查询并更新记录'),
                      describe: _l('根据查询条件从工作表中获取一条记录并同时更新记录值'),
                    },
                    {
                      type: 7,
                      appType: 1,
                      actionId: '422',
                      name: _l('查询并删除记录'),
                      describe: _l('根据查询条件从工作表中查找一条记录后直接删除'),
                    },
                    {
                      type: 7,
                      appType: 1,
                      actionId: '406',
                      name: _l('查询工作表'),
                      describe: _l('根据查询条件从工作表中获取一条记录'),
                    },
                  ],
                },
                {
                  typeText: _l('其他'),
                  source: [
                    {
                      type: 6,
                      appType: 1,
                      actionId: '20',
                      name: _l('获取关联记录'),
                      describe: _l('获取关联记录、子表、级联选择字段中的记录'),
                    },
                    {
                      type: 7,
                      appType: 1,
                      actionId: '407',
                      name: _l('从多条数据中获取'),
                      describe: _l('从多条数据节点获取一条符合条件的记录'),
                    },
                    {
                      type: 7,
                      appType: 1,
                      actionId: '420',
                      name: _l('从记录链接获取'),
                      describe: _l('从存有记录链接的文本字段获取一条指定记录'),
                    },
                  ],
                },
              ],
            },
            {
              type: 13,
              name: _l('获取多条数据%03022'),
              iconColor: '#FFA340',
              iconName: 'icon-transport',
              isGroupList: true,
              secondList: [
                {
                  typeText: _l('从工作表获取'),
                  source: [
                    {
                      type: 13,
                      appType: 1,
                      actionId: '412',
                      name: _l('查询并批量更新'),
                      describe: _l('根据查询条件从工作表获取多条数据并批量更新，后续节点可使用新值'),
                    },
                    {
                      type: 13,
                      appType: 1,
                      actionId: '413',
                      name: _l('查询并批量删除'),
                      describe: _l('根据查询条件从工作表找到多条数据并删除，后续节点不可使用'),
                    },
                    {
                      type: 13,
                      appType: 1,
                      actionId: '400',
                      name: _l('查询工作表'),
                      describe: _l('获取后什么也不做，在以后节点使用'),
                    },
                  ],
                },
                {
                  typeText: _l('其他'),
                  source: [
                    {
                      type: 13,
                      appType: 1,
                      actionId: '401',
                      name: _l('获取关联记录'),
                      describe: _l('获取关联记录、子表、级联选择字段中的记录'),
                    },
                    {
                      type: 13,
                      actionId: '402',
                      name: _l('获取批量新增结果'),
                      describe: _l('从创建多条的新增记录节点获取刚刚创建的记录'),
                    },
                    {
                      type: 13,
                      appType: 1,
                      actionId: '405',
                      name: _l('获取操作明细'),
                      describe: _l('从审批、填写、抄送节点获取操作明细。包含：操作人、时间、操作内容、备注等'),
                    },
                    {
                      type: 13,
                      appType: 1,
                      name: _l('获取数组对象'),
                      describe: _l('获取发送API请求、调用已集成API、代码块、业务流程输入/输出节点的JSON数组对象'),
                    },
                  ],
                },
              ],
            },
            {
              type: 6,
              name: _l('删除记录%03020'),
              appType: 1,
              actionId: '3',
              iconColor: '#FFA340',
              iconName: 'icon-hr_delete',
            },
            {
              type: 9,
              name: _l('运算%03035'),
              iconColor: '#01CA83',
              iconName: 'icon-workflow_function',
              typeText: _l('运算对象'),
              secondList: [
                {
                  type: 9,
                  name: _l('数值运算'),
                  actionId: '100',
                  describe: _l('对 数值/金额 等数字类型字段进行数学运算'),
                },
                {
                  type: 9,
                  name: _l('为日期加减时间'),
                  actionId: '101',
                  describe: _l('对 日期/时间 添加/减去年、月、天、小时、分进行计算'),
                },
                {
                  type: 9,
                  name: _l('时长'),
                  actionId: '104',
                  describe: _l('计算两个日期/时间之间的时长，并精确到年、月、天、时、分、秒'),
                },
                {
                  type: 9,
                  name: _l('函数计算'),
                  actionId: '106',
                  describe: _l('通过函数对 文本/数值/日期时间 等流程节点对象的值进行处理'),
                },
              ],
            },
            { type: 1, name: _l('分支%03033'), iconColor: '#2196f3', iconName: 'icon-workflow_branch' },
            {
              type: 7,
              name: _l('汇总'),
              iconColor: '#01CA83',
              iconName: 'icon-sigma',
              typeText: _l('汇总方式'),
              secondList: [
                {
                  type: 9,
                  name: _l('汇总按钮批量数据源'),
                  actionId: '108',
                  describe: _l('对自定义动作触发工作流中的批量数据源进行汇总计算'),
                },
                {
                  type: 9,
                  name: _l('从工作表汇总'),
                  appType: 1,
                  actionId: '107',
                  describe: _l(
                    '从工作表中筛选符合条件的数据并进行汇总计算，如：记录数量、求和、平均、最大、最小等。注意：当数据频繁变更时可能有一定延时',
                  ),
                },
                {
                  type: 9,
                  name: _l('获取数据条数'),
                  actionId: '105',
                  describe: _l('汇总流程中的多条数据对象的条数'),
                },
              ],
            },
          ],
        },
        {
          id: 'ai',
          name: _l('AIGC'),
          items: [
            {
              type: 31,
              name: _l('AI 生成文本'),
              appType: 46,
              actionId: '531',
              iconColor: '#F15B75',
              iconName: 'icon-text_ai',
            },
            {
              type: 31,
              name: _l('AI 生成数据对象'),
              appType: 46,
              actionId: '532',
              iconColor: '#F15B75',
              iconName: 'icon-text_ai',
            },
            // {
            //   type: 31,
            //   name: _l('AI 生成图像'),
            //   appType: 46,
            //   actionId: '532',
            //   iconColor: '#F15B75',
            //   iconName: 'icon-AI_image',
            // },
          ],
        },
        {
          id: 'artificial',
          name: _l('待办'),
          items: [
            {
              type: 26,
              name: _l('发起审批流程%03024'),
              iconColor: '#4158DB',
              iconName: 'icon-approval',
              typeText: _l('执行流程'),
              secondList: [
                {
                  type: 26,
                  appType: 10,
                  name: _l('创建新流程'),
                  describe: _l('从空白创建一条新的审批流程'),
                  isNew: true,
                },
                {
                  type: 26,
                  appType: 10,
                  name: _l('从已有审批流程复制'),
                  describe: _l(
                    '从已有审批流程复制不包括数据对象在内的流程框架，涉及相关对象的字段将被重置，需要重新配置这些节点',
                  ),
                },
              ],
            },
            { type: 4, name: _l('审批'), iconColor: '#7E57C2', iconName: 'icon-workflow_ea' },
            { type: 3, name: _l('填写%03025'), iconColor: '#00BCD4', iconName: 'icon-workflow_write' },
            { type: 5, name: _l('抄送%03026'), iconColor: '#2196f3', iconName: 'icon-workflow_notice' },
          ],
        },
        {
          id: 'notice',
          name: _l('通知%03027'),
          items: [
            { type: 27, name: _l('发送站内通知%03028'), iconColor: '#2196f3', iconName: 'icon-hr_message_reminder' },
            { type: 10, name: _l('发送短信%03029'), iconColor: '#2196f3', iconName: 'icon-workflow_sms' },
            {
              type: 11,
              name: _l('发送邮件%03030'),
              appType: 3,
              actionId: '202',
              iconColor: '#2196f3',
              iconName: 'icon-workflow_email',
            },
            {
              type: 17,
              featureId: VersionProductType.interfacePush,
              name: _l('界面推送'),
              iconColor: '#2196f3',
              iconName: 'icon-interface_push',
            },
            {
              type: 19,
              name: _l('发送服务号信息%03031'),
              appType: 22,
              actionId: '203',
              iconColor: '#2196f3',
              iconName: 'icon-wechat',
            },
          ],
        },
        {
          id: 'component',
          name: _l('构件%03032'),
          items: [
            {
              type: 29,
              featureId: VersionProductType.WFLP,
              name: _l('循环'),
              iconColor: '#4C7D9E',
              iconName: 'icon-arrow_loop',
              typeText: _l('循环方式'),
              secondList: [
                {
                  type: 29,
                  name: _l('满足条件时循环'),
                  appType: 45,
                  actionId: '210',
                  describe: _l('一直循环运行一段流程，并在参数达到退出条件后结束'),
                },
                {
                  type: 29,
                  name: _l('循环指定次数'),
                  appType: 45,
                  actionId: '211',
                  describe: _l('按指定的起始值、结束值和步长值循环固定次数'),
                },
              ],
            },
            {
              type: 16,
              name: _l('子流程%03038'),
              iconColor: '#4C7D9E',
              iconName: 'icon-subprocess',
            },
            {
              type: 20,
              name: _l('调用封装业务流程%03039'),
              appType: 17,
              actionId: '500',
              iconColor: '#4C7D9E',
              iconName: 'icon-pbc',
            },
            {
              type: 25,
              featureId: VersionProductType.apiIntergrationNode,
              name: _l('调用已集成 API%03040'),
              appType: 42,
              iconColor: '#4C7D9E',
              iconName: 'icon-api',
            },
            {
              type: 12,
              name: _l('延时%03034'),
              iconColor: '#4C7D9E',
              iconName: 'icon-workflow_delayed',
              typeText: _l('延时方式'),
              secondList: [
                {
                  type: 12,
                  name: _l('延时到指定日期'),
                  actionId: '300',
                  describe: _l('在上一个节点完成后，延时到指定的日期和时间后再继续执行流程'),
                },
                {
                  type: 12,
                  name: _l('延时一段时间'),
                  actionId: '301',
                  describe: _l('上一节点完成后，延时一段时间再继续执行流程'),
                },
              ],
            },
            {
              type: 15,
              name: _l('获取链接%03036'),
              appType: 13,
              iconColor: '#4C7D9E',
              iconName: 'icon-link2',
            },
            {
              type: 18,
              featureId: VersionProductType.getPrintFileNode,
              name: _l('获取记录打印文件%03037'),
              appType: 14,
              iconColor: '#4C7D9E',
              iconName: 'icon-print',
            },
            {
              type: 28,
              featureId: VersionProductType.getPrintFileNode,
              name: _l('获取页面快照'),
              appType: 44,
              iconColor: '#4C7D9E',
              iconName: 'icon-camera_alt',
            },
            {
              type: 6,
              name: _l('更新流程参数%03023'),
              appType: 102,
              actionId: '2',
              iconColor: '#4C7D9E',
              iconName: 'icon-parameter',
            },
            {
              type: 6,
              featureId: VersionProductType.globalVariable,
              name: _l('更新全局变量'),
              appType: 104,
              actionId: '2',
              iconColor: '#4C7D9E',
              iconName: 'icon-global_variable',
            },
            {
              type: 30,
              name: _l('中止流程'),
              actionId: '2',
              iconColor: '#F15B75',
              iconName: 'icon-rounded_square',
            },
          ],
        },
        {
          id: 'developer',
          name: _l('开发者%03041'),
          items: [
            {
              type: 24,
              featureId: VersionProductType.apiIntergrationNode,
              name: _l('API 连接与认证%03042'),
              appType: 41,
              iconColor: '#4C7D9E',
              iconName: 'icon-connect',
            },
            {
              type: 8,
              name: _l('发送 API 请求%03043'),
              iconColor: '#4C7D9E',
              iconName: 'icon-workflow_webhook',
              typeText: _l('发送对象'),
              secondList: [
                {
                  type: 8,
                  appType: 7,
                  name: _l('发送自定义请求'),
                  describe: _l('向 API 发送自定义的Query Param、Header 和 Body 内容'),
                },
                {
                  type: 8,
                  appType: 1,
                  name: _l('发送指定数据对象'),
                  describe: _l('向 API 发送工作流节点中的数据对象'),
                },
              ],
            },
            {
              type: 14,
              featureId: VersionProductType.codeBlockNode,
              name: _l('代码块%03044'),
              iconColor: '#4C7D9E',
              iconName: 'icon-url',
              typeText: _l('新建或选择已有代码片段'),
              secondList: [
                {
                  type: 14,
                  name: _l('JavaScript'),
                  actionId: '102',
                  describe: _l('使用JavaScript语言'),
                },
                {
                  type: 14,
                  name: _l('Python'),
                  actionId: '103',
                  describe: _l('使用Python语言'),
                },
                {
                  type: 14,
                  name: _l('从代码片段库中选择'),
                  describe: _l('直接选择已有的代码片段'),
                  isCustom: true,
                },
              ],
            },
            {
              type: 21,
              name: _l('JSON 解析%03045'),
              appType: 18,
              actionId: '510',
              iconColor: '#4C7D9E',
              iconName: 'icon-task_custom_polymer',
            },
          ],
        },
        {
          id: 'message',
          name: _l('组织/部门/协作%03046'),
          items: [
            {
              type: 1000,
              name: _l('获取单条人员/部门/组织角色数据%03047'),
              iconColor: '#2196f3',
              iconName: 'icon-person_search',
              isGroupList: true,
              secondList: [
                {
                  typeText: _l('获取单条人员信息'),
                  describe: _l(
                    '获取一名人员的相关信息，包含个人信息（姓名、性别、生日、手机、邮箱）和组织信息（部门、职位、工号、上下级（可选））',
                  ),
                  source: [
                    {
                      type: 1000,
                      appType: 20,
                      actionId: '20',
                      name: _l('从成员字段获取'),
                    },
                    {
                      type: 1000,
                      appType: 20,
                      actionId: '406',
                      name: _l('从所有组织成员中查找'),
                      disabled: isDisabled,
                    },
                  ],
                },
                {
                  typeText: _l('获取单条部门信息'),
                  describe: _l('获取一个部门的相关信息，包含部门名称、部门负责人、部门人员及上下级部门'),
                  source: [
                    {
                      type: 1000,
                      appType: 21,
                      actionId: '20',
                      name: _l('从部门字段获取'),
                    },
                    {
                      type: 1000,
                      appType: 21,
                      actionId: '406',
                      name: _l('从所有组织部门中查找'),
                      disabled: isDisabled,
                    },
                  ],
                },
                {
                  typeText: _l('获取单条组织角色信息'),
                  describe: _l('获取一个组织角色的相关信息，包含角色名称、备注、角色下人员'),
                  source: [
                    {
                      type: 1000,
                      appType: 24,
                      actionId: '20',
                      name: _l('从组织角色字段获取'),
                    },
                    {
                      type: 1000,
                      appType: 24,
                      actionId: '406',
                      name: _l('从所有组织角色中查找'),
                      disabled: isDisabled,
                    },
                  ],
                },
              ],
            },
            {
              type: 1001,
              name: _l('获取多条人员/部门/组织角色数据%03048'),
              iconColor: '#2196f3',
              iconName: 'icon-group-members',
              isGroupList: true,
              secondList: [
                {
                  typeText: _l('获取多条人员信息'),
                  describe: _l(
                    '获取多名人员的相关信息，包含个人信息（姓名、性别、生日、手机、邮箱）和组织信息（部门、职位、工号、上下级（可选））',
                  ),
                  source: [
                    {
                      type: 1001,
                      appType: 20,
                      actionId: '401',
                      name: _l('从成员字段获取'),
                    },
                    {
                      type: 1001,
                      appType: 20,
                      actionId: '400',
                      name: _l('从所有组织成员中查找'),
                      disabled: isDisabled,
                    },
                  ],
                },
                {
                  typeText: _l('获取多条部门信息'),
                  describe: _l('获取多个部门的相关信息，包含部门名称、部门负责人、部门人员及上下级部门'),
                  source: [
                    {
                      type: 1001,
                      appType: 21,
                      actionId: '401',
                      name: _l('从部门字段获取'),
                    },
                    {
                      type: 1001,
                      appType: 21,
                      actionId: '400',
                      name: _l('从所有组织部门中查找'),
                      disabled: isDisabled,
                    },
                  ],
                },
                {
                  typeText: _l('获取多条组织角色信息'),
                  describe: _l('获取多个组织角色的相关信息，包含角色名称、备注、角色下人员'),
                  source: [
                    {
                      type: 1001,
                      appType: 24,
                      actionId: '401',
                      name: _l('从组织角色字段获取'),
                    },

                    {
                      type: 1001,
                      appType: 24,
                      actionId: '400',
                      name: _l('从所有组织角色中查找'),
                      disabled: isDisabled,
                    },
                  ],
                },
              ],
            },
            {
              type: 6,
              name: _l('创建任务%03049'),
              appType: 2,
              actionId: '1',
              iconColor: '#01CA83',
              iconName: 'icon-custom_assignment',
            },
            {
              type: 6,
              appType: 43,
              name: _l('创建日程'),
              iconColor: '#F15B75',
              iconName: 'icon-sidebar_calendar',
              typeText: _l('创建方式'),
              secondList: [
                {
                  type: 6,
                  appType: 43,
                  actionId: '1',
                  name: _l('创建系统日程'),
                  describe: _l('创建一个系统内日程。可同时生成一个ICS文件在之后节点中使用'),
                },
                {
                  type: 6,
                  appType: 43,
                  actionId: '4',
                  name: _l('生成ICS文件'),
                  describe: _l('仅生成一个日程ICS文件，可添加至个人日历'),
                },
              ],
            },
          ],
        },
        {
          id: 'external',
          name: _l('外部用户%03050'),
          items: [
            {
              type: 6,
              name: _l('更新外部用户信息%03051'),
              appType: 23,
              actionId: '2',
              iconColor: '#FFA340',
              iconName: 'icon-update_information',
            },
            {
              type: 6,
              name: _l('邀请外部用户%03052'),
              appType: 23,
              actionId: '1',
              iconColor: '#FFA340',
              iconName: 'icon-invited_users',
            },
            {
              type: 1000,
              name: _l('获取单条外部人员数据%03053'),
              iconColor: '#2196f3',
              iconName: 'icon-external_users',
              typeText: _l('获取方式'),
              secondList: [
                {
                  type: 1000,
                  appType: 23,
                  actionId: '20',
                  name: _l('从外部用户字段获取'),
                  describe: _l('从外部用户字段获取一名指定人员的相关信息'),
                },
                {
                  type: 1000,
                  appType: 23,
                  actionId: '406',
                  name: _l('从外部门户中获取'),
                  describe: _l('从当前应用的所有外部用户中获取一名指定人员的相关信息'),
                },
              ],
            },
            {
              type: 1001,
              name: _l('获取多条外部人员数据%03054'),
              iconColor: '#2196f3',
              iconName: 'icon-folder-public',
              typeText: _l('获取方式'),
              secondList: [
                {
                  type: 1001,
                  appType: 23,
                  actionId: '401',
                  name: _l('从外部用户字段获取'),
                  describe: _l('从外部用户字段获取批量用户的相关信息'),
                },
                {
                  type: 1001,
                  appType: 23,
                  actionId: '400',
                  name: _l('从外部门户中获取'),
                  describe: _l('从当前应用的所有外部用户中获取批量用户的相关信息'),
                },
              ],
            },
          ],
        },
      ],
      selectItem: null,
      selectSecond: false,
      branchDialogModel: 0,
      foldFeatures: safeParse(localStorage.getItem(`workflowFoldFeatures-${md.global.Account.accountId}`)) || {},
      showApprovalDialog: false,
      showCodeSnippetDialog: false,
    };

    // 非自定义动作、非工作表事件去除界面推送
    if (
      !_.includes([APP_TYPE.CUSTOM_ACTION, APP_TYPE.PBC, APP_TYPE.SHEET], props.flowInfo.startAppType) ||
      props.flowInfo.child
    ) {
      this.state.list.forEach(o => {
        _.remove(o.items, item => item.type === NODE_TYPE.PUSH);
      });
    }

    // 外部用户讨论触发去除抄送
    if (
      props.flowInfo.startAppType === APP_TYPE.EXTERNAL_USER &&
      props.flowInfo.startTriggerId === TRIGGER_ID.DISCUSS
    ) {
      _.remove(this.state.list, o => o.id !== 'notice');
      this.state.list.forEach(o => {
        _.remove(o.items, item => item.type === NODE_TYPE.CC);
      });
    }

    // 非批量自定义动作数据源去除按钮汇总
    if (
      props.flowInfo.startAppType !== APP_TYPE.CUSTOM_ACTION ||
      _.get(props, `flowNodeMap[${props.flowInfo.startNodeId}].actionId`) !== ACTION_ID.BATCH_ACTION
    ) {
      this.state.list.forEach(o => {
        o.items.forEach(obj => {
          _.remove(obj.secondList || [], item => item.actionId === ACTION_ID.CUSTOM_ACTION_TOTAL);
        });
      });
    }

    // 循环流程去除人工节点
    if (props.flowInfo.startAppType === APP_TYPE.LOOP_PROCESS) {
      this.state.list.forEach(o => {
        _.remove(o.items, item =>
          _.includes([NODE_TYPE.WRITE, NODE_TYPE.APPROVAL, NODE_TYPE.APPROVAL_PROCESS], item.type),
        );
      });
    }

    // 移除任务、日程
    this.state.list.forEach(o => {
      _.remove(
        o.items,
        o =>
          (o.appType === APP_TYPE.TASK && md.global.SysSettings.forbidSuites.indexOf('2') > -1) ||
          (o.appType === APP_TYPE.CALENDAR && md.global.SysSettings.forbidSuites.indexOf('3') > -1) ||
          (o.type === NODE_TYPE.TEMPLATE && md.global.SysSettings.hideWeixin) ||
          (o.type === NODE_TYPE.MESSAGE && !md.global.SysSettings.enableSmsCustomContent),
      );
    });

    // 埋点授权过滤： API集成工作流节点、代码块节点、获取打印文件节点、获取页面快照、界面推送、全局变量、循环
    [
      { featureId: VersionProductType.apiIntergrationNode, type: [NODE_TYPE.API_PACKAGE, NODE_TYPE.API] },
      { featureId: VersionProductType.codeBlockNode, type: [NODE_TYPE.CODE] },
      { featureId: VersionProductType.getPrintFileNode, type: [NODE_TYPE.FILE, NODE_TYPE.SNAPSHOT] },
      { featureId: VersionProductType.interfacePush, type: [NODE_TYPE.PUSH] },
      { featureId: VersionProductType.globalVariable, type: [NODE_TYPE.ACTION], appType: APP_TYPE.GLOBAL_VARIABLE },
      { featureId: VersionProductType.WFLP, type: [NODE_TYPE.LOOP] },
    ].forEach(obj => {
      if (!_.includes(['1', '2'], getFeatureStatus(props.flowInfo.companyId, obj.featureId))) {
        this.state.list.forEach(o => {
          if (obj.appType) {
            _.remove(o.items, item => _.includes(obj.type, item.type) && obj.appType === item.appType);
          } else {
            _.remove(o.items, item => _.includes(obj.type, item.type));
          }
        });
      }
    });

    this.cacheList = _.cloneDeep(this.state.list);
  }

  // 缓存节点数据
  cacheList = [];

  componentWillReceiveProps(nextProps, nextState) {
    if (nextProps.nodeId && nextProps.nodeId !== this.props.nodeId) {
      this.setState({
        selectItem: null,
        selectSecond: false,
        branchDialogModel: 0,
        showApprovalDialog: false,
      });
    }

    // 审批流程过滤节点
    if ((nextProps.selectProcessId && nextProps.flowInfo.id !== nextProps.selectProcessId) || nextProps.isApproval) {
      _.remove(this.state.list, o => _.includes(['artificial', 'external'], o.id));
      this.state.list.forEach(o => {
        _.remove(
          o.items,
          item =>
            !(
              _.includes(
                [
                  NODE_TYPE.SEARCH,
                  NODE_TYPE.WEBHOOK,
                  NODE_TYPE.FORMULA,
                  NODE_TYPE.MESSAGE,
                  NODE_TYPE.EMAIL,
                  NODE_TYPE.DELAY,
                  NODE_TYPE.GET_MORE_RECORD,
                  NODE_TYPE.CODE,
                  NODE_TYPE.TEMPLATE,
                  NODE_TYPE.JSON_PARSE,
                  NODE_TYPE.API_PACKAGE,
                  NODE_TYPE.API,
                  NODE_TYPE.NOTICE,
                  NODE_TYPE.FIND_SINGLE_MESSAGE,
                  NODE_TYPE.FIND_MORE_MESSAGE,
                ],
                item.type,
              ) ||
              (item.type === NODE_TYPE.ACTION && item.actionId === ACTION_ID.EDIT && item.appType !== APP_TYPE.PROCESS)
            ),
        );

        // 去除多条新增
        o.items.forEach(obj => {
          _.remove(obj.secondList || [], item => item.actionId === ACTION_ID.FROM_ADD);
        });
      });
    }

    if (!nextProps.selectProcessId) {
      this.setState({ list: _.cloneDeep(this.cacheList) });
    }
  }

  /**
   * 内容
   */
  renderContent() {
    const { flowInfo, selectProcessId, isApproval } = this.props;
    const { list, selectItem, selectSecond, foldFeatures } = this.state;

    // 渲染二级数据
    if (selectSecond) {
      return (
        <div className="pTop20 pBottom15 pLeft20 pRight15">
          {selectItem.typeText && <div className="bold pLeft10 Font14">{selectItem.typeText}</div>}
          {selectItem.type === NODE_TYPE.CODE && !md.global.SysSettings.hideHelpTip && (
            <div className="Gray_75 mTop10 pLeft10 InlineFlex">
              {_l('查看当前代码脚本的')}
              <Support
                type={3}
                text={_l('运行版本')}
                className="ThemeColor3 ThemeHoverColor2"
                href="workflow/node-code-block#runtime-environment"
              />
            </div>
          )}

          {selectItem.isGroupList ? (
            (selectItem.secondList || []).map((item, i) => (
              <Fragment key={i}>
                <div className="bold pLeft10 Font14">{item.typeText}</div>
                {item.describe && <div className="Gray_75 pLeft10 mTop5">{item.describe}</div>}
                <ul className="secondNodeList mBottom25">
                  {(item.source || []).map((o, j) => {
                    return (
                      <li
                        key={j}
                        className={cx({ disabled: o.disabled })}
                        onClick={() => {
                          if (o.disabled) {
                            alert(_l('拥有成员管理权限才可以添加'), 3);
                            return;
                          }

                          this.createNodeClick(
                            _.includes([6, 7, 13], o.type) ? o : Object.assign({}, o, { name: item.typeText }),
                          );
                        }}
                      >
                        <Radio className="Font15" text={o.name} disabled />
                        {o.describe && <div className="Gray_75 mLeft30 mTop5">{o.describe}</div>}
                      </li>
                    );
                  })}
                </ul>
              </Fragment>
            ))
          ) : (
            <ul className="secondNodeList">
              {(selectItem.secondList || []).map((item, i) => {
                return (
                  <li key={i} onClick={() => this.createNodeClick(item)}>
                    <Radio className="Font15" text={item.name} disabled />
                    <div className="Gray_75 mLeft30 mTop5">{item.describe}</div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      );
    }

    return (
      <Fragment>
        {((selectProcessId && flowInfo.id !== selectProcessId) || isApproval) && (
          <div className="createNodeMessageBox mBottom30 mLeft32 mRight32 mTop16 LineHeight20">
            {_l('在审批过程中添加数据处理节点。处理结果用于分支判断、更新审批中的数据。')}（
            {_l('可在审批步骤节点中配置更新数据')}
            <Support type={3} text={_l('如何设置？')} href="https://help.mingdao.com/workflow/node-approve#update" />）
          </div>
        )}

        <div className="pBottom15 pLeft10 pRight10">
          {list.map((data, i) => {
            return (
              <div className="mTop15 nodeListContainer" key={i}>
                <div
                  className="Font16 bold pTop5 pBottom5 pointer"
                  onClick={() => {
                    const newFold = Object.assign({}, foldFeatures, { [data.id]: !foldFeatures[data.id] });

                    this.setState({ foldFeatures: newFold });
                    safeLocalStorageSetItem(
                      `workflowFoldFeatures-${md.global.Account.accountId}`,
                      JSON.stringify(newFold),
                    );
                  }}
                >
                  <Icon
                    icon={foldFeatures[data.id] ? 'arrow-right-tip' : 'arrow-down'}
                    className="mRight13 Gray_75 Font13"
                  />
                  {data.name}
                </div>
                {!foldFeatures[data.id] && (
                  <ul className="nodeList clearfix">
                    {data.items
                      .filter(data => !(_.includes([24, 25], data.type) && md.global.SysSettings.hideIntegration))
                      .map((item, j) => {
                        return (
                          <li key={j} onClick={() => this.createNodeClick(item)}>
                            <span className="nodeListIcon" style={{ backgroundColor: item.iconColor }}>
                              <i className={item.iconName} />
                            </span>
                            <div className="Font14">{item.name}</div>
                            {item.type === NODE_TYPE.APPROVAL && (
                              <Tooltip
                                popupPlacement="bottom"
                                text={_l(
                                  '使用「发起审批流程」节点可提供更完整的审批能力，旧「审批」节点即将被下线。流程中已添加的审批节点不受影响，仍可以继续使用。',
                                )}
                              >
                                <div className="Font12 nodeListOverdue">{_l('旧%03089')}</div>
                              </Tooltip>
                            )}
                          </li>
                        );
                      })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </Fragment>
    );
  }

  /**
   * 判断是否是条件分支
   */
  isConditionalBranch() {
    const { nodeId, flowNodeMap } = this.props;
    const { typeId, actionId } = flowNodeMap[nodeId] || {};

    return (
      _.includes([NODE_TYPE.APPROVAL, NODE_TYPE.SEARCH, NODE_TYPE.FIND_SINGLE_MESSAGE], typeId) ||
      (typeId === NODE_TYPE.ACTION && actionId === '20')
    );
  }

  /**
   * 创建节点点击
   */
  createNodeClick(item) {
    const { nodeId, isLast, flowInfo, flowNodeMap } = this.props;
    const { selectItem } = this.state;
    const featureId = selectItem && selectItem.featureId ? selectItem.featureId : item.featureId;
    const featureType = getFeatureStatus(flowInfo.companyId, featureId);

    // 二级创建
    if (item.secondList) {
      if (_.includes([NODE_TYPE.CODE], item.type) && featureType === '2') {
        buriedUpgradeVersionDialog(flowInfo.companyId, featureId);
        return;
      }
      this.setState({ selectItem: item, selectSecond: true });
      return;
    }

    // 分支 并且 上一个节点是审批
    if (item.type === NODE_TYPE.BRANCH && this.isConditionalBranch()) {
      this.setState({ selectItem: item, branchDialogModel: 2 });
    } else if (
      item.type === NODE_TYPE.BRANCH &&
      !isLast &&
      (flowNodeMap[(flowNodeMap[nodeId] || {}).nextId] || {}).actionId !== ACTION_ID.PBC_OUT
    ) {
      this.setState({ selectItem: item, branchDialogModel: 1 });
    } else if (
      (_.includes(
        [
          NODE_TYPE.CODE,
          NODE_TYPE.PUSH,
          NODE_TYPE.FILE,
          NODE_TYPE.API_PACKAGE,
          NODE_TYPE.API,
          NODE_TYPE.SNAPSHOT,
          NODE_TYPE.LOOP,
        ],
        item.type,
      ) ||
        (item.type === NODE_TYPE.ACTION && item.appType === APP_TYPE.GLOBAL_VARIABLE)) &&
      featureType === '2'
    ) {
      // 代码块、界面推送、Word打印模板、API连接与认证、调用已集成的API、获取页面快照、更新全局变量、循环
      buriedUpgradeVersionDialog(flowInfo.companyId, featureId);
    } else if (item.type === NODE_TYPE.APPROVAL_PROCESS && !item.isNew) {
      this.setState({ showApprovalDialog: true });
    } else if (item.type === NODE_TYPE.CODE && item.isCustom) {
      this.setState({ showCodeSnippetDialog: true });
    } else {
      this.addFlowNode({
        actionId: item.actionId,
        appType: item.appType,
        name: item.type === NODE_TYPE.APPROVAL_PROCESS ? _l('未命名审批流程') : item.name,
        prveId: nodeId,
        typeId: item.type,
      });
    }
  }

  /**
   * 分支弹层确认
   */
  createBranchNode = ({ isOrdinary, moveType }) => {
    const { nodeId } = this.props;
    const { selectItem } = this.state;

    if (this.isConditionalBranch()) {
      this.addFlowNode({
        name: '',
        prveId: nodeId,
        resultFlow: !isOrdinary,
        typeId: NODE_TYPE.BRANCH,
        moveType,
      });
    } else {
      this.addFlowNode({
        actionId: selectItem.actionId,
        appType: selectItem.appType,
        name: selectItem.name,
        prveId: nodeId,
        typeId: selectItem.type,
        moveType,
      });
    }
  };

  /**
   * 添加节点
   */
  addFlowNode = args => {
    const { flowInfo, addFlowNode, selectAddNodeId, selectProcessId } = this.props;

    addFlowNode(selectProcessId || flowInfo.id, args);
    selectAddNodeId('');
  };

  render() {
    const { nodeId, selectAddNodeId, flowInfo, selectProcessId, isApproval, selectCopy, flowNodeMap } = this.props;
    const { selectItem, selectSecond, showApprovalDialog, showCodeSnippetDialog, branchDialogModel } = this.state;

    return (
      <Drawer placement="right" visible={!!nodeId} closable={false} mask={false} bodyStyle={{ padding: 0 }} width={640}>
        <div className="createNodeDialog flexColumn h100">
          <div
            className="createNodeDialogHeader flexRow"
            style={{ background: selectItem ? selectItem.iconColor : '#2196f3' }}
          >
            {selectSecond ? (
              <div className="flex Font18">
                <i
                  className="icon-backspace Font20 pointer"
                  onClick={() => this.setState({ selectItem: null, selectSecond: false })}
                />
                <span className="mLeft10">{selectItem.name}</span>
              </div>
            ) : (
              <Fragment>
                <div className="Font18">{_l('选择一个动作')}</div>
                <Support
                  className="createNodeExplain mLeft5"
                  type={1}
                  text={_l('了解这些动作')}
                  href="https://help.mingdao.com/workflow/introduction"
                />
                <div className="flex" />
                {!(
                  (selectProcessId && flowInfo.id !== selectProcessId) ||
                  isApproval ||
                  flowNodeMap[flowInfo.startNodeId].nextId === '99'
                ) && (
                  <div className="copyNodeBtn" onClick={() => selectCopy(flowInfo.id)}>
                    <i className="icon-copy Font18 mRight5" />
                    {_l('复制已有节点')}
                  </div>
                )}
              </Fragment>
            )}

            <i className="icon-delete Font18 mLeft5" onClick={() => selectAddNodeId('')} />
          </div>
          <div className="flex">
            <ScrollView>{this.renderContent()}</ScrollView>
          </div>

          {!!branchDialogModel && (
            <BranchDialog
              {...this.props}
              isConditionalBranch={branchDialogModel === 2}
              onSave={({ isOrdinary, moveType }) => this.createBranchNode({ isOrdinary, moveType })}
              onClose={() => this.setState({ branchDialogModel: 0 })}
            />
          )}

          {showApprovalDialog && (
            <SelectApprovalProcess
              companyId={flowInfo.companyId}
              appId={flowInfo.relationId}
              onOk={({ processId }) =>
                this.addFlowNode({
                  appType: APP_TYPE.APPROVAL,
                  name: _l('未命名审批流程'),
                  prveId: nodeId,
                  typeId: NODE_TYPE.APPROVAL_PROCESS,
                  appId: processId,
                })
              }
              onCancel={() => this.setState({ showApprovalDialog: false })}
            />
          )}

          {showCodeSnippetDialog && (
            <CodeSnippet
              projectId={flowInfo.companyId}
              type={0}
              onSave={({ actionId, inputData, code }) => {
                this.setState({ showCodeSnippetDialog: false });
                this.addFlowNode({
                  actionId,
                  name: actionId === ACTION_ID.JAVASCRIPT ? _l('JavaScript') : _l('Python'),
                  prveId: nodeId,
                  typeId: NODE_TYPE.CODE,
                  appId: JSON.stringify({ inputData, code: Base64.encode(code) }),
                });
              }}
              onClose={() => this.setState({ showCodeSnippetDialog: false })}
            />
          )}
        </div>
      </Drawer>
    );
  }
}

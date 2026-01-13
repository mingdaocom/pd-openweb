import React, { Component, Fragment } from 'react';
import { Drawer } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import { Icon, Radio, ScrollView, Support, SvgIcon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { dialogSelectIntegrationApi } from 'ming-ui/functions';
import pluginAPI from '../../../api/Plugin';
import { checkCertification } from 'src/components/checkCertification';
import { checkPermission } from 'src/components/checkPermission';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import { PERMISSION_ENUM } from 'src/pages/Admin/enum';
import pluginBG from 'src/pages/worksheet/components/ViewItems/img/customview.png';
import { VersionProductType } from 'src/utils/enum';
import { getFeatureStatus } from 'src/utils/project';
import CodeSnippet from '../../../components/CodeSnippet';
import SelectProcess from '../../../components/SelectProcess';
import { ACTION_ID, APP_TYPE, NODE_TYPE, TRIGGER_ID } from '../../enum';
import BranchDialog from './BranchDialog';

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
              iconName: 'icon-playlist_add',
              describe: _l('向工作表新增一条或多条记录'),
            },
            {
              type: 6,
              name: _l('更新记录%03019'),
              appType: 1,
              actionId: '2',
              iconColor: '#FFA340',
              iconName: 'icon-workflow_update',
              describe: _l('更新流程中获取的工作表单条或多条数据'),
            },
            {
              type: 7,
              name: _l('获取单条数据%03021'),
              iconColor: '#FFA340',
              iconName: 'icon-search',
              describe: _l('查询或获取一条符合条件的工作表记录'),
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
                      describe: _l(
                        '根据筛选条件和排序规则从工作表中查找符合条件的第一条记录并同时更新记录值（原子性防止并发操作，适用于出入库等场景）',
                      ),
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
                    {
                      type: 7,
                      appType: 26,
                      actionId: '406',
                      name: _l('查询聚合表'),
                      describe: _l('根据查询条件从聚合表中获取一条记录'),
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
              describe: _l('查询或获取多条符合条件的数据'),
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
                    {
                      type: 13,
                      appType: 26,
                      actionId: '400',
                      name: _l('查询聚合表'),
                      describe: _l('从聚合表中按筛选条件选择符合的多条记录数据，供后续节点使用'),
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
              describe: _l('删除流程中获取的工作表单条或多条数据'),
            },
            {
              type: 1,
              name: _l('分支%03033'),
              iconColor: '#1677ff',
              iconName: 'icon-workflow_branch',
              describe: _l('向流程中添加分支，按不同条件分别处理'),
            },
            {
              type: 9,
              name: _l('运算%03035'),
              iconColor: '#01CA83',
              iconName: 'icon-workflow_function',
              describe: _l(' 对数值、日期、文本进行数学或函数运算'),
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
                  describe: _l('对 日期/时间 添加/减去 年、月、天、小时、分进行计算'),
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

            {
              type: 7,
              name: _l('汇总'),
              iconColor: '#01CA83',
              iconName: 'icon-task_functions',
              describe: _l('对符合条件的工作表进行列汇总计算或条数统计'),
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
                    '从工作表中筛选符合条件的数据并进行汇总计算，如：记录数量、求和、平均、最大、最小等。注意：当汇总他表字段或者数据频繁变更时可能有一定延时',
                  ),
                },
                {
                  type: 9,
                  name: _l('从聚合表汇总'),
                  appType: 26,
                  actionId: '107',
                  describe: _l(
                    '从聚合表中筛选符合条件的数据并进行汇总计算，如:记录数量、求和、平均、最大、最小等。注意:聚合表的数据有一定延时。',
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
            {
              name: _l('校准'),
              iconColor: '#01CA83',
              iconName: 'icon-architecture',
              describe: _l('刷新工作表记录中的公式计算、他表字段和汇总等延迟同步结果'),
              typeText: _l('校准数据'),
              secondList: [
                {
                  type: 6,
                  name: _l('校准单条数据'),
                  appType: 1,
                  actionId: '6',
                  describe: _l(
                    '即时校准刷新工作表单条记录中的公式计算、他表字段和汇总等延迟同步结果，后续节点可使用校准后的值',
                  ),
                },
                {
                  type: 13,
                  name: _l('校准工作表'),
                  appType: 1,
                  actionId: '415',
                  describe: _l(
                    '校准刷新符合筛选条件的工作表记录的计算结果、选项排序和分值、他表字段和汇总结果，此节点为异步排队执行，一次最多刷新10万行记录。每次校准必须间隔120分钟以上，否则将跳过节点',
                  ),
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
              type: 33,
              featureId: VersionProductType.workflowAgent,
              name: _l('AI Agent'),
              appType: 48,
              actionId: '533',
              iconColor: '#6E09F9',
              iconName: 'icon-AI_Agent',
              describe: _l('基于指令理解，自动调用工具完成任务'),
            },
            {
              type: 31,
              name: _l('AI 生成文本'),
              appType: 46,
              actionId: '531',
              iconColor: '#6E09F9',
              iconName: 'icon-text_ai',
              describe: _l('基于大模型 AI 技术用提示词生成一段文本'),
            },
            {
              type: 31,
              name: _l('AI 生成数据对象'),
              appType: 46,
              actionId: '532',
              iconColor: '#6E09F9',
              iconName: 'icon-text_ai',
              describe: _l('基于大模型 AI 技术提取文本的数据作为参数输出'),
            },
            // {
            //   type: 31,
            //   name: _l('AI 生成图像'),
            //   appType: 46,
            //   actionId: '532',
            //   iconColor: '#6E09F9',
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
              describe: _l('发起一个包含流转图的完整审批流程'),
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
            // {
            //   type: 4,
            //   name: _l('审批'),
            //   iconColor: '#A00416',
            //   iconName: 'icon-workflow_ea',
            //   describe: _l('添加一个人工审批节点，流程将等待执行后再继续'),
            // },
            {
              type: 3,
              name: _l('填写%03025'),
              iconColor: '#00BCD4',
              iconName: 'icon-workflow_write',
              describe: _l('添加一个人工填写节点，流程将等待执行后再继续'),
            },
            {
              type: 5,
              name: _l('抄送%03026'),
              iconColor: '#1677ff',
              iconName: 'icon-send',
              describe: _l('向用户发送通知消息并附带指定的记录链接'),
            },
          ],
        },
        {
          id: 'notice',
          name: _l('通知%03027'),
          items: [
            {
              type: 27,
              name: _l('发送站内通知%03028'),
              iconColor: '#1677ff',
              iconName: 'icon-notifications',
              describe: _l('向用户发送指定内容的系统“工作流”通知消息'),
            },
            {
              type: 10,
              name: _l('发送短信%03029'),
              iconColor: '#1677ff',
              iconName: 'icon-forum',
              describe: _l('向指定手机号发送经过审核的手机短信'),
            },
            {
              type: 11,
              name: _l('发送邮件%03030'),
              appType: 3,
              actionId: '202',
              iconColor: '#1677ff',
              iconName: 'icon-workflow_email',
              describe: _l('向指定邮箱代发自定义内容的邮件'),
            },
            {
              type: 19,
              name: _l('发送服务号信息%03031'),
              appType: 22,
              actionId: '203',
              iconColor: '#1677ff',
              iconName: 'icon-wechat',
              describe: _l('向已关注微信服务号的微信用户发送模版消息'),
            },
            {
              type: 17,
              featureId: VersionProductType.interfacePush,
              name: _l('界面推送'),
              iconColor: '#1677ff',
              iconName: 'icon-interface_push',
              describe: _l('向当前用户弹窗推送提示、卡片、视图、记录或链接'),
            },
            {
              type: 17,
              featureId: VersionProductType.interfacePush,
              pushType: 8,
              name: _l('声音播报'),
              iconColor: '#1677ff',
              iconName: 'icon-volume_up',
              describe: _l('向当前用户播放指定音效或语音播报指定文本内容'),
            },
          ],
        },
        {
          id: 'process',
          name: _l('流程'),
          items: [
            {
              type: 29,
              featureId: VersionProductType.WFLP,
              name: _l('循环'),
              iconColor: '#4C7D9E',
              iconName: 'icon-arrow_loop',
              describe: _l('添加一个固定次数或在指定条件下结束的循环流程'),
              typeText: _l('循环方式'),
              secondList: [
                {
                  type: 29,
                  name: _l('满足条件时循环'),
                  appType: 45,
                  actionId: '210',
                  describe: _l('一直循环运行一段流程，并在参数达到退出条件后结束'),
                  isNew: true,
                },
                {
                  type: 29,
                  name: _l('循环指定次数'),
                  appType: 45,
                  actionId: '211',
                  describe: _l('按指定的起始值、结束值和步长值循环固定次数'),
                  isNew: true,
                },
                {
                  type: 29,
                  name: _l('使用已有循环流程'),
                  appType: 45,
                  describe: _l('复用已经配置好的循环流程'),
                },
              ],
            },
            {
              type: 16,
              name: _l('子流程%03038'),
              iconColor: '#4C7D9E',
              iconName: 'icon-subprocess',
              describe: _l('以流程中的数据对象为数据源执行另一个流程'),
            },
            {
              type: 20,
              name: _l('调用封装业务流程%03039'),
              appType: 17,
              actionId: '500',
              iconColor: '#4C7D9E',
              iconName: 'icon-pbc',
              describe: _l('传入参数调用一个封装业务流程，获取输出参数值'),
            },
            {
              type: 6,
              name: _l('更新流程参数%03023'),
              appType: 102,
              actionId: '2',
              iconColor: '#4C7D9E',
              iconName: 'icon-parameter',
              describe: _l('更新当前流程中配置好的流程参数'),
            },
            {
              type: 30,
              name: _l('中止流程'),
              actionId: '2',
              iconColor: '#F15B75',
              iconName: 'icon-rounded_square',
              describe: _l('强制中止当前流程，后续所有节点不再执行'),
            },
          ],
        },
        {
          id: 'component',
          name: _l('构件%03032'),
          items: [
            {
              type: 25,
              featureId: VersionProductType.apiIntergrationNode,
              name: _l('调用已集成 API%03040'),
              appType: 42,
              iconColor: '#4C7D9E',
              iconName: 'icon-api',
              describe: _l('调用在集成中心中安装、授权或自定义的 API'),
            },
            {
              type: 12,
              name: _l('延时%03034'),
              iconColor: '#4C7D9E',
              iconName: 'icon-workflow_delayed',
              describe: _l('暂停运行当前流程，并在到达指定时间后继续执行'),
              typeText: _l('延时方式'),
              secondList: [
                {
                  type: 12,
                  name: _l('延时到指定日期'),
                  actionId: '300',
                  describe: _l('获取流程中单条记录对象的对外分享或填写链接'),
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
              describe: _l('获取流程中单条记录对象的对外分享或填写链接'),
            },
            {
              type: 18,
              featureId: VersionProductType.getPrintFileNode,
              name: _l('获取记录打印文件%03037'),
              appType: 14,
              iconColor: '#4C7D9E',
              iconName: 'icon-print',
              describe: _l('获取流程中单条记录对象通过自定义打印模板生成的 Word、Excel 或 PDF 文件'),
            },
            {
              type: 28,
              featureId: VersionProductType.getPrintFileNode,
              name: _l('获取页面快照'),
              appType: 44,
              iconColor: '#4C7D9E',
              iconName: 'icon-camera_alt',
              describe: _l('获取自定义页面、统计图或者指定链接的网页截图'),
            },
            {
              type: 6,
              featureId: VersionProductType.globalVariable,
              name: _l('更新全局变量'),
              appType: 104,
              actionId: '2',
              iconColor: '#4C7D9E',
              iconName: 'icon-global_variable',
              describe: _l('在流程中修改应用下或组织下的全局变量值'),
            },
            {
              type: 15,
              featureId: VersionProductType.PAY,
              name: _l('获取支付链接'),
              appType: 13,
              actionId: '416',
              iconColor: '#4C7D9E',
              iconName: 'icon-Collection',
              describe: _l('获取流程单条记录对象的对外支付链接'),
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
              describe: _l('在流程中使用集成中心完成鉴权的 API 连接参数'),
            },
            {
              type: 8,
              name: _l('发送 API 请求%03043'),
              iconColor: '#4C7D9E',
              iconName: 'icon-workflow_webhook',
              describe: _l('将指定 URL 发送请求信息并获取'),
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
              describe: _l('编写或用 AI 生成 Python 或 Javascript 代码'),
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
              describe: _l('将发送 API 请求、代码块、AI 获取数据对象节点中的JSON 对象解析为后续节点可使用的参数'),
            },
          ],
        },
        {
          id: 'message',
          name: _l('组织/部门'),
          items: [
            {
              type: 1000,
              name: _l('获取单条人员'),
              iconColor: '#1677ff',
              iconName: 'icon-person_search',
              describe: _l('从成员字段或组织中获取单个成员信息'),
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
              ],
            },
            {
              type: 1001,
              name: _l('获取多条人员'),
              iconColor: '#1677ff',
              iconName: 'icon-group',
              describe: _l('从成员字段或组织中获取多个成员信息'),
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
              ],
            },
            {
              type: 1000,
              name: _l('获取单条部门'),
              iconColor: '#1677ff',
              iconName: 'icon-individual_department',
              describe: _l('从部门字段或组织中获取单个部门信息'),
              isGroupList: true,
              secondList: [
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
              ],
            },
            {
              type: 1001,
              name: _l('获取多条部门'),
              iconColor: '#1677ff',
              iconName: 'icon-department',
              describe: _l('从部门字段或组织中获取多个部门信息'),
              isGroupList: true,
              secondList: [
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
              ],
            },
            {
              type: 1000,
              name: _l('获取单条组织角色'),
              iconColor: '#1677ff',
              iconName: 'icon-user',
              describe: _l('从组织角色字段或组织中获取单个组织角色信息'),
              isGroupList: true,
              secondList: [
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
              name: _l('获取多条组织角色'),
              iconColor: '#1677ff',
              iconName: 'icon-multiple_user',
              describe: _l('从组织角色字段或组织中获取多个组织角色信息'),
              isGroupList: true,
              secondList: [
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
          ],
        },
        {
          id: 'collaborate',
          name: _l('协作'),
          items: [
            {
              type: 6,
              name: _l('创建任务%03049'),
              appType: 2,
              actionId: '1',
              iconColor: '#01CA83',
              iconName: 'icon-assignment',
              describe: _l('在协作套件中创建一个新任务'),
            },
            {
              type: 6,
              appType: 43,
              name: _l('创建日程'),
              iconColor: '#F15B75',
              iconName: 'icon-sidebar_calendar',
              describe: _l('在协作套件中创建一个新日程或生成一个 ICS 文件'),
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
              name: _l('邀请外部用户%03052'),
              appType: 23,
              actionId: '1',
              iconColor: '#FFA340',
              iconName: 'icon-invited_users',
              describe: _l('向指定手机号发送短信邀请用户注册外部门户'),
            },
            {
              type: 1000,
              name: _l('获取单条外部人员'),
              iconColor: '#1677ff',
              iconName: 'icon-external_users',
              describe: _l('从外部成员字段或外部门户中获取单个用户信息'),
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
              name: _l('获取多条外部人员'),
              iconColor: '#1677ff',
              iconName: 'icon-folder-public',
              describe: _l('从外部成员字段或外部门户中获取多个用户信息'),
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
            {
              type: 6,
              name: _l('更新外部用户信息%03051'),
              appType: 23,
              actionId: '2',
              iconColor: '#FFA340',
              iconName: 'icon-update_information',
              describe: _l('更新流程中获取的单条或多条外部人员信息'),
            },
          ],
        },
      ],
      selectItem: null,
      selectSecond: false,
      branchDialogModel: 0,
      showProcessDialog: false,
      showCodeSnippetDialog: false,
      selectItemType: '',
      keywords: '',
      tab: 1,
      pluginList: [],
      mode: _.parseInt(localStorage.getItem('workflowCrateNodeListMode')) || 1,
      currentSectionIndex: 0,
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
        _.remove(o.items, item => _.includes([NODE_TYPE.CC, NODE_TYPE.NOTICE], item.type));
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

    // 移除邀请外部门户
    this.state.list.forEach(v => {
      _.remove(
        v.items,
        o => v.id === 'external' && o.actionId === ACTION_ID.ADD && !md.global.SysSettings.enableSmsCustomContent,
      );
    });

    // 关闭的ai功能，则移除整个 AIGC 分类
    if (md.global.SysSettings.hideAIBasicFun) {
      _.remove(this.state.list, o => o.id === 'ai');
    }

    // 埋点授权过滤： API集成工作流节点、代码块节点、获取打印文件节点、获取页面快照、界面推送、全局变量、循环、支付、智能体
    [
      { featureId: VersionProductType.apiIntergrationNode, type: [NODE_TYPE.API_PACKAGE, NODE_TYPE.API] },
      { featureId: VersionProductType.codeBlockNode, type: [NODE_TYPE.CODE] },
      { featureId: VersionProductType.getPrintFileNode, type: [NODE_TYPE.FILE, NODE_TYPE.SNAPSHOT] },
      { featureId: VersionProductType.interfacePush, type: [NODE_TYPE.PUSH] },
      { featureId: VersionProductType.globalVariable, type: [NODE_TYPE.ACTION], appType: APP_TYPE.GLOBAL_VARIABLE },
      { featureId: VersionProductType.WFLP, type: [NODE_TYPE.LOOP] },
      { featureId: VersionProductType.PAY, type: [NODE_TYPE.LINK], actionId: ACTION_ID.RECORD_LINK_PAY },
      { featureId: VersionProductType.workflowAgent, type: [NODE_TYPE.AGENT] },
    ].forEach(obj => {
      if (!_.includes(['1', '2'], getFeatureStatus(props.flowInfo.companyId, obj.featureId))) {
        this.state.list.forEach(o => {
          if (obj.appType) {
            _.remove(o.items, item => _.includes(obj.type, item.type) && obj.appType === item.appType);
          } else if (obj.actionId) {
            _.remove(o.items, item => _.includes(obj.type, item.type) && obj.actionId === item.actionId);
          } else {
            _.remove(o.items, item => _.includes(obj.type, item.type));
          }
        });
      }
    });

    // 插件支持 分支、代码块、发送API请求、JSON解析
    if (props.isPlugin) {
      this.state.list.forEach(o => {
        _.remove(
          o.items,
          item =>
            !_.includes(
              [NODE_TYPE.BRANCH, NODE_TYPE.WEBHOOK, NODE_TYPE.CODE, NODE_TYPE.JSON_PARSE, NODE_TYPE.AIGC],
              item.type,
            ),
        );

        if (o.id === 'data') {
          o.items.unshift({
            type: 13,
            appType: 1,
            name: _l('获取数组对象'),
            iconColor: '#FFA340',
            iconName: 'icon-transport',
            describe: _l('获取发送API请求、代码块、JSON 解析的JSON数组对象'),
          });
        }

        o.items.forEach(item => {
          if (item.type === NODE_TYPE.WEBHOOK) {
            _.remove(item.secondList, obj => obj.appType !== APP_TYPE.WEBHOOK);
          }
        });
      });
    }

    this.cacheList = _.cloneDeep(this.state.list);
  }

  // 缓存节点数据
  cacheList = [];

  // 缓存滚动条位置
  cacheScrollTop = 0;

  componentWillReceiveProps(nextProps) {
    const featureType = getFeatureStatus(nextProps.flowInfo.companyId, VersionProductType.flowPlugin);

    if (nextProps.nodeId && nextProps.nodeId !== this.props.nodeId) {
      this.setState({
        selectItem: null,
        selectSecond: false,
        branchDialogModel: 0,
        showProcessDialog: false,
        keywords: '',
      });
    }

    // 审批流程过滤节点
    if ((nextProps.selectProcessId && nextProps.flowInfo.id !== nextProps.selectProcessId) || nextProps.isApproval) {
      _.remove(this.state.list, o => _.includes(['artificial', 'collaborate', 'external'], o.id));
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
                  NODE_TYPE.AIGC,
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

    if (
      !!nextProps.nodeId &&
      !nextProps.isPlugin &&
      featureType &&
      !(
        nextProps.flowInfo.startAppType === APP_TYPE.EXTERNAL_USER &&
        nextProps.flowInfo.startTriggerId === TRIGGER_ID.DISCUSS
      ) &&
      !md.global.SysSettings.hidePlugin
    ) {
      this.getPluginList();
    }
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.nodeId && this.props.nodeId) {
      setTimeout(() => {
        this.keywordsInput && this.keywordsInput.focus();
      }, 300);
    }
  }

  /**
   * 获取插件列表
   */
  getPluginList = () => {
    const { flowInfo } = this.props;
    const getList = data => {
      return data.map(o => {
        return {
          appType: 47,
          type: 32,
          name: o.name,
          appId: `${o.id}_${o.source}`,
          iconColor: o.iconColor || '#1677ff',
          iconUrl: o.iconUrl,
          iconName: 'icon-workflow',
          isMyCreate: o.source === 0,
          featureId: VersionProductType.flowPlugin,
          describe: o.explain,
        };
      });
    };

    pluginAPI
      .getAll({ projectId: flowInfo.companyId, pageIndex: 1, pageSize: 10000, state: 1 }, { isPlugin: true })
      .then(res => {
        const pluginList = [];

        if (res.orgPlugins.length) {
          pluginList.push({ id: 'orgPlugin', name: _l('组织发布的'), items: getList(res.orgPlugins) });
        }

        if (res.myPlugins.length) {
          pluginList.push({ id: 'myPlugin', name: _l('我开发的'), items: getList(res.myPlugins) });
        }

        this.setState({ pluginList });
      });
  };

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

      this.cacheScrollTop = this.contentScroll.getScrollInfo().scrollTop;
      this.setState({ selectItem: item, selectSecond: true });
      return;
    }

    // 分支 并且 上一个节点支持结果分支
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
          NODE_TYPE.PLUGIN,
          NODE_TYPE.AGENT,
        ],
        item.type,
      ) ||
        (item.type === NODE_TYPE.ACTION && item.appType === APP_TYPE.GLOBAL_VARIABLE)) &&
      featureType === '2'
    ) {
      // 代码块、界面推送、Word打印模板、API连接与认证、调用已集成的API、获取页面快照、更新全局变量、循环
      buriedUpgradeVersionDialog(flowInfo.companyId, featureId);
    } else if (_.includes([NODE_TYPE.APPROVAL_PROCESS, NODE_TYPE.LOOP], item.type) && !item.isNew) {
      this.setState({ showProcessDialog: true, selectItemType: item.type });
    } else if (item.type === NODE_TYPE.CODE && item.isCustom) {
      this.setState({ showCodeSnippetDialog: true });
    } else {
      this.addFlowNode({
        actionId: item.actionId,
        appType: item.appType,
        name: item.type === NODE_TYPE.APPROVAL_PROCESS ? _l('未命名审批流程') : item.name,
        prveId: nodeId,
        typeId: item.type,
        appId: item.appId,
        pushType: item.pushType,
      });
    }
  }

  onCreateNode(item) {
    const { flowInfo } = this.props;
    item.type === NODE_TYPE.LINK
      ? checkCertification({ projectId: flowInfo.companyId, checkSuccess: () => this.createNodeClick(item) })
      : this.createNodeClick(item);
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

  /**
   * 渲染二级内容
   */
  renderSecondContent() {
    const { selectAddNodeId } = this.props;
    const { selectItem } = this.state;

    return (
      <Fragment>
        <div className="createNodeDialogHeader flexRow" style={{ background: selectItem.iconColor }}>
          <div className="flex Font18">
            <i
              className="icon-backspace Font20 pointer"
              onClick={() =>
                this.setState({ selectItem: null, selectSecond: false }, () => {
                  this.contentScroll.scrollTo({ top: this.cacheScrollTop });
                })
              }
            />
            <span className="mLeft10">{selectItem.name}</span>
          </div>

          <i className="icon-delete Font18 mLeft5" onClick={() => selectAddNodeId('')} />
        </div>

        <div className="flex overflowHidden">
          <ScrollView>
            <div className="pTop20 pBottom15 pLeft20 pRight20">
              {selectItem.typeText && <div className="bold pLeft12 Font14">{selectItem.typeText}</div>}
              {selectItem.type === NODE_TYPE.CODE && !md.global.SysSettings.hideHelpTip && (
                <div className="Gray_75 mTop6 pLeft12 InlineFlex">
                  {_l('查看当前代码脚本的')}
                  <Support
                    type={3}
                    text={_l('运行版本')}
                    className="ThemeColor3 ThemeHoverColor2"
                    href="https://help.mingdao.com/workflow/node-code-block#runtime-environment"
                  />
                </div>
              )}

              {selectItem.isGroupList ? (
                (selectItem.secondList || []).map((item, i) => (
                  <Fragment key={i}>
                    <div className="bold pLeft12 Font14">{item.typeText}</div>
                    {item.describe && <div className="Gray_75 pLeft12 mTop5">{item.describe}</div>}
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

                              this.onCreateNode(
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
                      <li key={i} onClick={() => this.onCreateNode(item)}>
                        <Radio className="Font15" text={item.name} disabled />
                        <div className="Gray_75 mLeft30 mTop5">{item.describe}</div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </ScrollView>
        </div>
      </Fragment>
    );
  }

  /**
   * 渲染内容
   */
  renderContent() {
    const { nodeId, selectAddNodeId, flowInfo, selectProcessId, isApproval, selectCopy, flowNodeMap, isPlugin } =
      this.props;
    const { list, keywords, tab, mode, pluginList, currentSectionIndex } = this.state;
    const featureType = getFeatureStatus(flowInfo.companyId, VersionProductType.flowPlugin);
    let source = tab === 1 ? list : pluginList;
    const LIST = [
      { key: 'system', text: _l('系统'), events: () => this.setState({ tab: 1, keywords: '' }) },
      { key: 'plugin', text: _l('插件'), events: () => this.setState({ tab: 2, keywords: '' }) },
      {
        key: 'api',
        text: 'API',
        events: () => {
          dialogSelectIntegrationApi({
            projectId: flowInfo.companyId,
            appId: flowInfo.relationId,
            onOk: id => {
              this.addFlowNode({
                appType: APP_TYPE.API,
                name: _l('调用已集成 API%03040'),
                prveId: nodeId,
                typeId: NODE_TYPE.API,
                appId: id,
              });
            },
          });
        },
      },
    ];
    const MODE = [
      { icon: 'icon-list1', value: 1 },
      { icon: 'icon-thumbnail', value: 2 },
    ];

    if (
      !featureType ||
      (flowInfo.startAppType === APP_TYPE.EXTERNAL_USER && flowInfo.startTriggerId === TRIGGER_ID.DISCUSS) ||
      isPlugin ||
      md.global.SysSettings.hidePlugin
    ) {
      _.remove(LIST, o => o.key === 'plugin');
    }

    if (isPlugin || md.global.SysSettings.hideIntegration) {
      _.remove(LIST, o => o.key === 'api');
    }

    if (keywords.trim()) {
      source = _.cloneDeep(source).map(o => {
        o.items = o.items.filter(item => {
          if (item.name.toLowerCase().indexOf(keywords.trim().toLowerCase()) > -1) {
            return true;
          }

          if (item.secondList) {
            if (item.isGroupList) {
              item.secondList = item.secondList
                .map(obj => {
                  obj.source = obj.source.filter(
                    secondItem => secondItem.name.toLowerCase().indexOf(keywords.trim().toLowerCase()) > -1,
                  );

                  return obj;
                })
                .filter(obj => !!obj.source.length);
            } else {
              item.secondList = item.secondList.filter(
                obj => obj.name.toLowerCase().indexOf(keywords.trim().toLowerCase()) > -1,
              );
            }

            return !!item.secondList.length;
          }
        });

        return o;
      });
    }

    source = source.filter(o => !!o.items.length);

    return (
      <div className="flexRow flex overflowHidden">
        <div className="createNodeDialogNav flexColumn">
          <div className="Font17 bold flexRow alignItemsCenter mLeft16">
            {_l('添加动作')}
            <Support
              className="mLeft5"
              type={1}
              title={_l('了解这些动作')}
              href="https://help.mingdao.com/workflow/introduction"
            />
          </div>

          <ScrollView className="flex mTop20">
            <ul className="createNodeDialogNavList">
              {LIST.map((o, index) => (
                <Fragment key={index}>
                  <li
                    key={o.key}
                    data-type={o.key}
                    className={cx('flexRow alignItemsCenter Font14 bold', { active: index === tab - 1 })}
                    onClick={o.events}
                  >
                    {o.text}
                  </li>

                  {o.key === 'system' && (
                    <ul className="createNodeDialogNavTags">
                      {(tab === 1 ? source : list).map((o, index) => (
                        <li
                          key={o.id}
                          className={cx('ThemeHoverColor3 pointer', {
                            'ThemeColor3 bold': currentSectionIndex === index && tab === 1,
                          })}
                          onClick={() => {
                            this.setState({ tab: 1, keywords: tab === 2 ? '' : keywords }, () => {
                              const sections = document.querySelectorAll('.workflowSectionName');

                              sections[index].scrollIntoView();
                            });
                          }}
                        >
                          {o.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </Fragment>
              ))}
            </ul>
          </ScrollView>

          {tab === 2 && (
            <div className="createNodeFooterBtn ThemeHoverColor3 pointer" onClick={() => window.open('/plugin/node')}>
              <i className="icon-task-new-detail Font12" />
              <span className="mLeft5 Font14 bold">{_l('添加插件')}</span>
            </div>
          )}

          {!(
            (selectProcessId && flowInfo.id !== selectProcessId) ||
            isApproval ||
            (flowNodeMap[flowInfo.startNodeId] || {}).nextId === '99' ||
            tab === 2
          ) && (
            <div className="createNodeFooterBtn ThemeHoverColor3 pointer" onClick={() => selectCopy(flowInfo.id)}>
              <i className="icon-copy Font14" />
              <span className="mLeft5 Font14 bold">{_l('复制节点')}</span>
            </div>
          )}
        </div>
        <div className="flex flexColumn">
          <div className="mLeft32 mRight20 mTop15 flexRow alignItemsCenter">
            <div className="createNodeSearch flex">
              <input
                type="text"
                ref={keywordsInput => (this.keywordsInput = keywordsInput)}
                placeholder={_l('搜索')}
                value={keywords}
                onChange={e => this.setState({ keywords: e.target.value })}
              />
              <Icon icon="search" className="Font18 Gray_9e" />
              {keywords.trim() && (
                <Icon
                  icon="cancel"
                  className="Font24 Gray_9e ThemeHoverColor3"
                  onClick={() => this.setState({ keywords: '' })}
                />
              )}
            </div>

            <ul className="createNodeDialogMode flexRow">
              {MODE.map(o => (
                <li
                  key={o.value}
                  className={cx('flex Font16', mode === o.value ? 'active ThemeColor' : 'Gray_75')}
                  onClick={() => {
                    localStorage.setItem('workflowCrateNodeListMode', o.value);
                    this.setState({ mode: o.value });
                  }}
                >
                  <i className={o.icon} />
                </li>
              ))}
            </ul>

            <div className="createNodeSearchLine mLeft20 mRight20" />

            <i className="icon-delete Font18 Gray_9e ThemeHoverColor3 pointer" onClick={() => selectAddNodeId('')} />
          </div>
          <ScrollView
            className="flex mTop20"
            ref={contentScroll => (this.contentScroll = contentScroll)}
            onScroll={this.onScroll}
          >
            {source.map(data => {
              return (
                <Fragment key={data.id}>
                  <div className="mBottom5 Font15 mLeft32 bold workflowSectionName">{data.name}</div>
                  <ul className="clearfix nodeList">
                    {data.items.map((item, i) => {
                      return (
                        <li key={i} className={cx({ w100: mode === 1 })} onClick={() => this.onCreateNode(item)}>
                          <span
                            className={cx('nodeListIcon', { BGDarkViolet: item.appType === APP_TYPE.AGENT })}
                            style={{ backgroundColor: item.iconColor }}
                          >
                            {item.iconUrl ? (
                              <SvgIcon url={item.iconUrl} fill="#fff" size={22} />
                            ) : (
                              <i className={item.iconName} />
                            )}
                          </span>

                          <div className="flex flexColumn justifyContentCenter">
                            <div className="flexRow alignItemsCenter">
                              <div className="Font14 bold">{item.name}</div>
                              {item.type === NODE_TYPE.APPROVAL && (
                                <Tooltip
                                  placement="bottom"
                                  title={_l(
                                    '使用「发起审批流程」节点可提供更完整的审批能力，旧「审批」节点即将被下线。流程中已添加的审批节点不受影响，仍可以继续使用。',
                                  )}
                                >
                                  <div className="Font12 nodeListOverdue">{_l('旧%03089')}</div>
                                </Tooltip>
                              )}
                            </div>
                            {mode === 1 && <div className="Font12 Gray_9e breakAll mTop4">{item.describe}</div>}
                          </div>

                          {item.secondList && <i className="icon-arrow-right-border Font16 Gray_bd mLeft12" />}
                        </li>
                      );
                    })}
                  </ul>
                </Fragment>
              );
            })}

            {!source.length && (
              <div className="createNodeSearchEmpty">
                {keywords.trim() ? (
                  _l('无搜索结果')
                ) : (
                  <Fragment>
                    <div className="flex TxtCenter flexColumn alignItemsCenter justifyContentCenter">
                      <img src={pluginBG} width={200} />
                      <div className="mTop15 bold Font17">{_l('自定义节点')}</div>
                      <div className="mTop10 Font13">
                        {_l('将代码处理步骤封装为工作流节点，可以在组织内使用或上架到应用市场')}
                      </div>
                    </div>
                  </Fragment>
                )}
              </div>
            )}
          </ScrollView>
        </div>
      </div>
    );
  }

  /**
   * 滚动定位tag
   */
  onScroll = _.debounce(() => {
    const sections = document.querySelectorAll('.workflowSectionName');
    let sectionIndex = 0;

    sections.forEach((section, index) => {
      const rect = section.getBoundingClientRect();

      if (rect.top <= 100) {
        sectionIndex = index;
      }
    });

    this.setState({ currentSectionIndex: sectionIndex });
  }, 200);

  render() {
    const { nodeId, flowInfo } = this.props;
    const { selectSecond, showProcessDialog, showCodeSnippetDialog, branchDialogModel, selectItemType } = this.state;
    const isApprovalProcess = selectItemType === NODE_TYPE.APPROVAL_PROCESS;

    return (
      <Drawer placement="right" visible={!!nodeId} closable={false} mask={false} bodyStyle={{ padding: 0 }} width={840}>
        <div className="createNodeDialog flexColumn h100">
          {selectSecond ? this.renderSecondContent() : this.renderContent()}

          {!!branchDialogModel && (
            <BranchDialog
              {...this.props}
              isConditionalBranch={branchDialogModel === 2}
              onSave={({ isOrdinary, moveType }) => this.createBranchNode({ isOrdinary, moveType })}
              onClose={() => this.setState({ branchDialogModel: 0 })}
            />
          )}

          {showProcessDialog && (
            <SelectProcess
              companyId={flowInfo.companyId}
              appId={flowInfo.relationId}
              processListType={isApprovalProcess ? 11 : 13}
              filterProcessId={flowInfo.id}
              onOk={({ processId, triggerId }) =>
                this.addFlowNode({
                  appType: isApprovalProcess ? APP_TYPE.APPROVAL : APP_TYPE.LOOP_PROCESS,
                  name: isApprovalProcess
                    ? _l('未命名审批流程')
                    : triggerId === ACTION_ID.CONDITION_LOOP
                      ? _l('满足条件时循环')
                      : _l('循环指定次数'),
                  prveId: nodeId,
                  typeId: isApprovalProcess ? NODE_TYPE.APPROVAL_PROCESS : NODE_TYPE.LOOP,
                  appId: processId,
                  actionId: isApprovalProcess ? undefined : triggerId,
                })
              }
              onCancel={() => this.setState({ showProcessDialog: false })}
            />
          )}

          {showCodeSnippetDialog && (
            <CodeSnippet
              projectId={flowInfo.companyId}
              type={0}
              onSave={({ actionId, inputData, code }) => {
                this.setState({ showCodeSnippetDialog: false });
                this.addFlowNode({
                  appType: APP_TYPE.CODE,
                  actionId,
                  name: actionId === ACTION_ID.JAVASCRIPT ? _l('JavaScript') : _l('Python'),
                  prveId: nodeId,
                  typeId: NODE_TYPE.CODE,
                  appId: JSON.stringify({ inputData, code: btoa(unescape(encodeURIComponent(code))) }),
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

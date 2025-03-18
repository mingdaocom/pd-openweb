import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Icon, Checkbox, LoadDiv, Dropdown, Radio, Support, ScrollView, Switch } from 'ming-ui';
import { getHelpUrl } from 'src/common/helpUrls';
import './index.less';
import process from '../../api/process';
import SelectWorkflow from '../../components/SelectWorkflow';
import { updatePublishState } from '../../redux/actions';
import { ProcessVariables } from '../Detail/components';
import { Member, SelectUserDropDown, SelectNodeObject, CustomTextarea } from '../Detail/components';
import cx from 'classnames';
import copy from 'copy-to-clipboard';
import SetControlName from './components/SetControlName';
import _ from 'lodash';
import { getFeatureStatus, buriedUpgradeVersionDialog } from 'src/util';
import { VersionProductType } from 'src/util/enum';
import { APP_TYPE, USER_TYPE } from '../enum';
import { quickSelectUser } from 'ming-ui/functions';

const TRIGGER_TYPE = {
  ALLOW: 0,
  ONLY_WORKFLOW: 1,
  NO_ALLOW: 2,
};

class ProcessConfig extends Component {
  state = {
    data: {},
    showWorkflow: false,
    showSelectUserDialog: false,
    tab: 1,
    errorItems: {},
  };

  componentDidMount() {
    const { flowInfo } = this.props;

    process.getProcessConfig({ processId: flowInfo.id }).then(data => {
      this.setState({ data });
    });
  }

  /**
   * 更新data数据
   */
  updateSource = (obj, callback = () => {}) => {
    this.setState({ data: Object.assign({}, this.state.data, obj) }, callback);
  };

  /**
   * 保存
   */
  onSave = () => {
    const { flowInfo } = this.props;
    const { data, saveRequest, errorItems } = this.state;
    const {
      executeType,
      allowRevoke,
      revokeNodeIds,
      errorNotifiers,
      errorInterval,
      triggerType,
      processNames,
      startEventPass,
      userTaskPass,
      userTaskNullPass,
      sendTaskPass,
      processVariables,
      allowUrge,
      pbcConfig,
      responseContentType,
      value,
      triggerView,
      required,
      agents,
      dateShowType,
    } = data;

    if (_.find(errorItems, o => o)) {
      alert(_l('有参数配置错误'), 2);
      return;
    }

    if (processVariables.filter(item => !item.controlName).length) {
      alert(_l('参数名称不能为空'), 2);
      return;
    }

    if (saveRequest) {
      return;
    }

    process
      .saveProcessConfig({
        ...data,
        processId: flowInfo.id,
        executeType,
        allowRevoke,
        revokeNodeIds: allowRevoke ? revokeNodeIds : [],
        errorNotifiers,
        errorInterval,
        triggerType,
        processIds: data.triggerType === TRIGGER_TYPE.ONLY_WORKFLOW ? processNames.map(item => item.id) : [],
        startEventPass,
        userTaskPass,
        userTaskNullPass,
        sendTaskPass,
        processVariables,
        allowUrge,
        pbcConfig,
        responseContentType,
        value: value.trim(),
        triggerView,
        required,
        agents,
        dateShowType,
      })
      .then(result => {
        if (result) {
          alert(_l('保存成功'));

          if (flowInfo.publish) {
            this.props.dispatch(updatePublishState({ publishStatus: 1, pending: true }));
          }
        }
        this.updateSource({ processVariables: result });
        this.setState({ saveRequest: false });
      });

    this.setState({ saveRequest: true });
  };

  /**
   * 选择工作流
   */
  selectProcess = selectItems => {
    const { data } = this.state;
    const newProcessNames = _.cloneDeep(data.processNames);
    const ids = newProcessNames.map(item => item.id);

    selectItems.forEach(item => {
      if (!_.includes(ids, item.id)) {
        newProcessNames.push(item);
      }
    });

    this.updateSource({ processNames: newProcessNames });
  };

  /**
   * 删除工作流
   */
  deleteProcess(id) {
    const { data } = this.state;
    const processNames = _.cloneDeep(data.processNames);

    _.remove(processNames, o => o.id === id);
    this.updateSource({ processNames });
  }

  /**
   * 选择流程负责人
   */
  selectProcessCharge = event => {
    const { flowInfo } = this.props;

    quickSelectUser(event.target, {
      offset: {
        top: 10,
        left: 0,
      },
      projectId: flowInfo.companyId,
      unique: true,
      filterAll: true,
      filterFriend: true,
      filterOthers: true,
      filterOtherProject: true,
      onSelect: users => {
        this.updateSource({
          agents: users.map(item => {
            return {
              type: USER_TYPE.USER,
              entityId: '',
              entityName: '',
              roleId: item.accountId,
              roleName: item.fullname,
              avatar: item.avatar,
            };
          }),
        });
      },
    });
  };

  renderProcessContent() {
    const { flowInfo } = this.props;
    const { data, showSelectUserDialog, showWorkflow } = this.state;
    const dateArr = [
      { text: _l('始终通知'), value: 0 },
      { text: _l('15分钟'), value: 15 },
      { text: _l('1小时'), value: 60 },
      { text: _l('2小时'), value: 120 },
      { text: _l('6小时'), value: 360 },
      { text: _l('12小时'), value: 720 },
      { text: _l('24小时'), value: 1440 },
    ];
    const operationMode = [
      {
        text: _l('并行（默认）'),
        value: 1,
        desc: _l('数据各自同步执行，适合运行实例间互不影响的流程。执行速度快，适合大多数流程使用'),
      },
      {
        text: _l('顺序执行'),
        value: 2,
        desc: _l('数据按顺序逐条执行，但不会等待流程中包含的子流程和PBP执行完毕，速度较慢'),
      },
      {
        text: _l('严格串行'),
        value: 3,
        desc: _l('数据按顺序逐条执行，上一条流程完全执行完成后才会执行下一流程，速度最慢'),
      },
    ];
    const timeMode = [
      {
        text: _l('精确到分钟，如：2010-10-01 12:23'),
        value: 1,
      },
      {
        text: _l('精确到秒，如：2010-10-01 12:23:45'),
        value: 6,
      },
    ];
    const dotMode = [
      {
        text: _l('按字段原始值取所有小数位数，如：3.14159'),
        value: 0,
      },
      {
        text: _l('按字段配置中的小数位数，如：3.14159 配置了4位小数，则取 3.1416'),
        value: 1,
      },
    ];
    const openDebug = _.includes(data.debugEvents, 0);

    return (
      <Fragment>
        <div className="bold Font16 mTop28">{_l('通知人')}</div>
        <div className="mTop15">
          <span className="bold">{_l('流程拥有者')}</span>
        </div>
        <div className="flexRow alignItemsCenter">
          <Member companyId={flowInfo.companyId} leastOne accounts={data.agents} />
          <div
            className={cx('ThemeColor3 AddUserBtn mTop12', { mLeft12: data.agents.length })}
            onClick={this.selectProcessCharge}
          >
            <i className={cx('Font28', data.agents.length ? 'icon-add-member3' : 'icon-task-add-member-circle')} />
          </div>
        </div>

        <div className="mTop15">
          <span className="bold">{_l('其他通知人')}</span>
          <span className="Gray_75">{_l('（当流程错误时，同时通知以下人）')}</span>
        </div>
        <Member
          companyId={flowInfo.companyId}
          inline
          removeOrganization
          accounts={data.errorNotifiers}
          updateSource={({ accounts }) => this.updateSource({ errorNotifiers: accounts })}
        />

        <div className="mTop15 relative">
          <div className="ThemeColor3 AddUserBtn" onClick={() => this.setState({ showSelectUserDialog: true })}>
            <i className="Font28 icon-task-add-member-circle" />
          </div>

          <SelectUserDropDown
            visible={showSelectUserDialog}
            disabledNodeRole={true}
            appId={flowInfo.relationId}
            companyId={flowInfo.companyId}
            accounts={data.errorNotifiers}
            updateSource={({ accounts }) => this.updateSource({ errorNotifiers: accounts })}
            onClose={() => this.setState({ showSelectUserDialog: false })}
          />
        </div>
        <div className="mTop20 flexRow alignItemsCenter">
          <Dropdown
            style={{ width: 100 }}
            menuStyle={{ width: '100%' }}
            data={dateArr}
            value={data.errorInterval}
            border
            onChange={errorInterval => this.updateSource({ errorInterval })}
          />
          <div className="Gray_75 mLeft10">{_l('内不发送同类错误通知')}</div>
        </div>

        {flowInfo.startAppType !== APP_TYPE.LOOP_PROCESS && (
          <Fragment>
            <div className="processConfigLine" />
            <div className="bold Font16 mTop28">{_l('运行方式')}</div>
            <div className="Gray_75 mTop5">{_l('设置流程的运行方式，仅支持新增记录触发，自定义动作触发的流程')}</div>
            {operationMode.map((item, i) => (
              <Fragment key={i}>
                <div className="mTop15">
                  <Radio
                    className="bold"
                    text={item.text}
                    disabled={!data.sequence && item.value !== 1}
                    checked={data.executeType === item.value}
                    onClick={() => this.updateSource({ executeType: item.value })}
                  />
                </div>
                <div className={cx('Font12 mTop5 mLeft30', !data.sequence && item.value !== 1 ? 'Gray_bd' : 'Gray_75')}>
                  {item.desc}
                </div>
              </Fragment>
            ))}
          </Fragment>
        )}

        <div className="processConfigLine" />
        <div className="bold Font16 mTop28">{_l('数据格式')}</div>
        <div className="Gray_75 mTop5">{_l('设置动态值在流程执行过程中引用或参与计算时使用的数据格式')}</div>
        <div className="mTop15 bold">{_l('系统字段中的日期值')}</div>
        {timeMode.map((item, i) => (
          <div className="mTop15" key={i}>
            <Radio
              text={item.text}
              checked={data.dateShowType === item.value}
              onClick={() => this.updateSource({ dateShowType: item.value })}
            />
          </div>
        ))}
        <div className="mTop15 bold">{_l('数值字段的小数位数')}</div>
        <div className="Gray_75 mTop5">{_l('仅支持分支节点条件判断')}</div>
        {dotMode.map((item, i) => (
          <div className="mTop15" key={i}>
            <Radio
              text={item.text}
              checked={data.dotType === item.value}
              onClick={() => this.updateSource({ dotType: item.value })}
            />
          </div>
        ))}

        <div className="processConfigLine" />
        <div className="bold Font16 mTop28">{_l('节点日志')}</div>
        <div className="Gray_75 mTop5">
          {_l('启用后，可以在历史日志中查看单个节点在流程执行时的输入、输出数据。日志保留最近90天的数据')}
        </div>
        <div className="mTop10">
          <Switch
            checked={openDebug}
            text={openDebug ? _l('开启') : _l('关闭%03087')}
            onClick={() => this.updateSource({ debugEvents: openDebug ? [] : [0] })}
          />
        </div>

        {_.includes([APP_TYPE.SHEET, APP_TYPE.CUSTOM_ACTION], flowInfo.startAppType) && (
          <Fragment>
            <div className="processConfigLine" />
            <div className="bold Font16 mTop28">{_l('触发者查看')}</div>
            <div className="Gray_75 mTop5 mBottom8">
              {_l('启用后，流程触发者可以在“我发起的”待办项中查看、追踪此流程')}
            </div>
            <div className="mTop10">
              <Switch
                checked={data.triggerView}
                text={data.triggerView ? _l('开启') : _l('关闭%03087')}
                onClick={() => this.updateSource({ triggerView: !data.triggerView })}
              />
            </div>
          </Fragment>
        )}

        <div className="processConfigLine" />
        <div className="bold Font16 mTop28">{_l('触发其他工作流')}</div>
        <div className="mTop15">
          <Radio
            text={_l('允许触发')}
            checked={data.triggerType === TRIGGER_TYPE.ALLOW}
            onClick={() => this.updateSource({ triggerType: TRIGGER_TYPE.ALLOW })}
          />
        </div>
        <div className="Gray_75 Font12 mTop5 mLeft30">
          {_l('在选择此配置时，如果要触发本表的其他工作流，必须为目标流程指定触发字段')}
        </div>

        <div className="mTop15">
          <Radio
            text={_l('只能触发指定工作流')}
            checked={data.triggerType === TRIGGER_TYPE.ONLY_WORKFLOW}
            onClick={() => this.updateSource({ triggerType: TRIGGER_TYPE.ONLY_WORKFLOW })}
          />
        </div>
        {data.triggerType === TRIGGER_TYPE.ONLY_WORKFLOW && (
          <div className="processConfigFlow mTop5 mLeft30">
            <div>
              {data.processNames.map(item => {
                return (
                  <span key={item.id} className="processConfigItem">
                    <span
                      className="ellipsis InlineBlock"
                      style={{ maxWidth: 210 }}
                      onClick={() => window.open(`/workflowedit/${item.id}`)}
                    >
                      {flowInfo.relationId === item.relationId ? '' : `（${item.apkName}）`}
                      {item.name}
                    </span>
                    <Icon icon="close" className="mLeft5 Font14" onClick={() => this.deleteProcess(item.id)} />
                  </span>
                );
              })}
            </div>
            <span
              className="ThemeColor3 ThemeHoverColor2 pointer"
              onClick={() => this.setState({ showWorkflow: true })}
            >
              <Icon icon="add" className="mRight5 Font16" />
              {_l('选择工作流')}
            </span>
          </div>
        )}

        <div className="mTop15">
          <Radio
            text={_l('不允许触发')}
            checked={data.triggerType === TRIGGER_TYPE.NO_ALLOW}
            onClick={() => this.updateSource({ triggerType: TRIGGER_TYPE.NO_ALLOW })}
          />
        </div>

        <SelectWorkflow
          visible={showWorkflow}
          processId={flowInfo.id}
          relationId={flowInfo.relationId}
          filterIds={data.processNames.map(o => o.id)}
          onSave={this.selectProcess}
          onClose={() => this.setState({ showWorkflow: false })}
        />
      </Fragment>
    );
  }

  renderArtificialContent() {
    const { flowInfo } = this.props;
    const { data } = this.state;
    const isSheetOrButton = _.includes([1, 8], flowInfo.startAppType);
    const nodeSettings = [
      {
        text: _l('审批自动通过'),
        list: [
          {
            text: _l('工作流触发者自动通过'),
            checked: data.startEventPass,
            disabled: !isSheetOrButton,
            key: 'startEventPass',
          },
          { text: _l('已经审批过该对象的审批人自动通过'), checked: data.userTaskPass, key: 'userTaskPass' },
          { text: _l('审批人为空时自动通过'), checked: data.userTaskNullPass, key: 'userTaskNullPass' },
          {
            text: _l('验证必填字段'),
            checked: data.required,
            key: 'required',
            tip: _l('勾选后，当有必填字段为空时不自动通过，仍需进行审批操作。[审批人为空时自动通过]不受此配置影响。'),
          },
        ],
      },
      {
        text: _l('通知节点设置'),
        list: [{ text: _l('工作流触发者不发送通知'), checked: data.sendTaskPass, key: 'sendTaskPass' }],
      },
    ];
    const list = data.revokeFlowNodes.map(item => {
      return {
        text: item.name,
        value: item.id,
      };
    });

    if (data.revokeNodeIds[0]) {
      list.unshift({ text: _l('清除选择'), value: '' });
    }

    return (
      <Fragment>
        <div className="bold Font16 mTop28">{_l('触发者操作')}</div>
        <div className="mTop15">
          <Checkbox
            className="InlineFlex TxtTop"
            text={_l('允许触发者撤回')}
            checked={data.allowRevoke}
            disabled={!isSheetOrButton}
            onClick={checked => this.updateSource({ allowRevoke: !checked })}
          />
          {data.allowRevoke && (
            <div className="mTop10 mLeft25 flexRow alignItemsCenter">
              <div>{_l('节点')}</div>
              <Dropdown
                className="mLeft10"
                style={{ width: 220 }}
                menuStyle={{ width: '100%' }}
                data={list}
                value={data.revokeNodeIds[0] || undefined}
                border
                onChange={revokeNodeId => this.updateSource({ revokeNodeIds: revokeNodeId ? [revokeNodeId] : [] })}
              />
              <div className="mLeft10 flex">{_l('通过后不允许撤回')}</div>
            </div>
          )}
        </div>
        <div className="mTop15">
          <Checkbox
            className="InlineFlex TxtTop"
            text={_l('允许触发者催办')}
            checked={data.allowUrge}
            disabled={!isSheetOrButton}
            onClick={checked => this.updateSource({ allowUrge: !checked })}
          />
        </div>

        {nodeSettings.map((item, i) => {
          return (
            <Fragment key={i}>
              <div className="bold Font16 mTop28">{item.text}</div>
              {item.list.map(o => {
                return (
                  <div className="mTop15 flexRow" key={o.key}>
                    <Checkbox
                      {...o}
                      className="InlineFlex TxtTop"
                      onClick={checked => this.updateSource({ [o.key]: !checked })}
                    />
                    {o.tip && (
                      <span className="workflowDetailTipsWidth mLeft5" data-tip={o.tip}>
                        <Icon icon="info" className="Gray_9e" />
                      </span>
                    )}
                  </div>
                );
              })}
            </Fragment>
          );
        })}
      </Fragment>
    );
  }

  renderParameterContent() {
    const { data, errorItems } = this.state;

    return (
      <Fragment>
        <div className="bold Font16 mTop28">{_l('参数对象')}</div>
        <div className="Gray_75 mTop5 mBottom15">
          {_l(
            '流程开始运行时生成，可以用以执行运算，或实现两个流程间的数据传递；命名时请以英文字母打头，名称中禁止出现汉字',
          )}
        </div>

        <ProcessVariables
          processVariables={data.processVariables}
          errorItems={errorItems}
          setErrorItems={errorItems => this.setState({ errorItems })}
          updateSource={this.updateSource}
        />
      </Fragment>
    );
  }

  renderPBCContent() {
    const { flowInfo } = this.props;
    const { data, errorItems } = this.state;
    const importData = data.processVariables.filter(item => item.processVariableType === 1);

    return (
      <Fragment>
        <div className="bold Font16 mTop28">{_l('平台API能力')}</div>
        <div className="Gray_75 mTop5">
          {_l('启用后，我们会自动为您的业务流程生成相关的API开发文档，供您向其他第三方外部系统提供平台开放能力')}
          {data.pbcConfig.enable && (
            <a
              href={`/worksheetapi/${flowInfo.relationId}`}
              target="_blank"
              className="mLeft2 ThemeColor3 ThemeHoverColor2"
            >
              {_l('查看文档')}
            </a>
          )}
        </div>

        <div className="mTop10">
          <Switch
            checked={data.pbcConfig.enable}
            text={data.pbcConfig.enable ? _l('开启') : _l('关闭%03087')}
            onClick={() =>
              this.updateSource({ pbcConfig: Object.assign({}, data.pbcConfig, { enable: !data.pbcConfig.enable }) })
            }
          />
        </div>

        {data.pbcConfig.enable && (
          <Fragment>
            <div className="bold Font16 mTop28">{_l('请求地址')}</div>
            <div className="mTop5 Gray_75">{_l('我们为您生成了一个用来接收请求的URL，可以在URL后自定义拼接内容')}</div>
            <div className="mTop10 flexRow">
              <input
                type="text"
                className="webhookLink flex"
                style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                value={data.pbcConfig.url}
                disabled
              />
              <input
                type="text"
                className="webhookLinkCustom"
                value={data.pbcConfig.urlExtension}
                onChange={e =>
                  this.updateSource({ pbcConfig: Object.assign({}, data.pbcConfig, { urlExtension: e.target.value }) })
                }
                onBlur={e =>
                  this.updateSource({
                    pbcConfig: Object.assign({}, data.pbcConfig, { urlExtension: e.target.value.trim() }),
                  })
                }
              />
              <div
                className="mLeft10 webhookLinkCopy"
                onClick={() => {
                  copy(`${data.pbcConfig.url}/${data.pbcConfig.urlExtension}`.replace(/\/$/, ''));
                  alert(_l('已复制到剪切板'));
                }}
              >
                {_l('复制')}
              </div>
            </div>

            {this.renderAuthContent()}

            {!!importData.length && (
              <Fragment>
                <div className="mTop28 Font16 bold">{_l('请求参数')}</div>
                <div className="mTop5 Gray_75">
                  {_l(
                    '可以使用 GET/POST 方式发送参数。当使用 POST 时，请求的主体必须是 JSON 格式，而且 HTTP header 的 Content-Type 需要设置为 application/json',
                  )}
                </div>
                <SetControlName
                  data={data.processVariables}
                  list={importData}
                  errorItems={errorItems}
                  setErrorItems={errorItems => this.setState({ errorItems })}
                  updateSource={this.updateSource}
                />
              </Fragment>
            )}

            {this.renderResponseType()}
          </Fragment>
        )}
      </Fragment>
    );
  }

  renderResponseType() {
    const { flowInfo } = this.props;
    const { data, errorItems, tab } = this.state;
    const exportData = data.processVariables.filter(item => item.processVariableType === 2);
    const options = [
      {
        text: _l('通过回调地址接受返回参数'),
        value: 1,
        desc: _l('此时对方请求时必须附带参数callbackURL，我方流程运行结束后会向此URL传递输出参数'),
      },
      {
        text: _l('直接返回固定文本给请求地址'),
        value: 3,
        desc: _l('对方请求时，立即以返回一段固定文本给请求方'),
      },
      {
        text: _l('直接返回流程节点数据对象给请求地址'),
        value: 4,
        desc: _l(
          '选择一个代码块、发送API请求、JSON解析或调用已集成API节点，把它的返回数据对象立即返回给请求方；请控制请求频率在500次/小时以内，流程执行时间30s以内，私有部署不限',
        ),
      },
      {
        text: _l('直接返回流程节点的字段值给请求地址'),
        value: 5,
        desc: _l(
          '将所选节点的字段值结果立即返回给请求方，支持选择返回格式;请控制请求频率在500次/小时以内，流程执行时间30s以内，私有部署不限直接返回输出参数给请求地址',
        ),
      },
      {
        text: _l('直接返回输出参数给请求地址'),
        value: 2,
        desc: _l('请控制请求频率在500次/小时以内，流程执行时间30s以内，私有部署不限'),
      },
    ];
    const featureType = getFeatureStatus(flowInfo.companyId, VersionProductType.encapsulatingBusinessProcess);

    if (tab === 5) {
      _.remove(options, o => _.includes([1, 2], o.value));
    }

    return (
      <Fragment>
        {featureType && <div className="bold Font16 mTop28">{_l('响应方式')}</div>}
        {featureType && (
          <Dropdown
            className="mTop10 w100 workflowConfigDropdown"
            menuStyle={{ width: '100%' }}
            data={options}
            value={data.pbcConfig.outType}
            border
            renderItem={({ text, desc }) => {
              return (
                <Fragment>
                  <div className="itemText">{text}</div>
                  <div className="Gray_75 mTop3" style={{ whiteSpace: 'normal', lineHeight: '18px' }}>
                    {desc}
                  </div>
                </Fragment>
              );
            }}
            onChange={outType => {
              if (_.includes([2, 3, 4, 5], outType) && featureType === '2') {
                buriedUpgradeVersionDialog(flowInfo.companyId, VersionProductType.encapsulatingBusinessProcess);
                return;
              }
              this.updateSource({
                pbcConfig: Object.assign({}, data.pbcConfig, { outType }),
                responseContentType: _.includes([1, 2, 4], outType) ? 2 : 3,
                value: '',
                endContentType: outType === 4 ? 2 : 3,
                endValue: '',
              });
            }}
          />
        )}

        {!!exportData.length && _.includes([1, 2], data.pbcConfig.outType) && (
          <Fragment>
            <div className="mTop28 Font16 bold">{_l('响应参数')}</div>
            <SetControlName
              data={data.processVariables}
              list={exportData}
              errorItems={errorItems}
              setErrorItems={errorItems => this.setState({ errorItems })}
              updateSource={this.updateSource}
            />
          </Fragment>
        )}

        {_.includes([3, 5], data.pbcConfig.outType) && (
          <Fragment>
            <div className="mTop28 Font16 bold">
              {data.pbcConfig.outType === 3
                ? _l('直接返回固定文本给请求地址')
                : _l('直接返回流程节点的字段值给请求地址')}
            </div>
            {this.renderContentType()}
            <div className="workflowDialogBox">
              <div className="flowDetailTrigger">
                <CustomTextarea
                  className="minH100"
                  projectId={flowInfo.companyId}
                  processId={flowInfo.id}
                  relationId={flowInfo.relationId}
                  selectNodeId={data.pbcConfig.outType === 3 ? flowInfo.startNodeId : data.pcbOutId}
                  sourceAppId={data.pbcConfig.outType === 3 ? flowInfo.startAppId : ''}
                  type={2}
                  content={data.value}
                  formulaMap={data.formulaMap}
                  onChange={(err, value, obj) => this.updateSource({ value })}
                  updateSource={this.updateSource}
                />
              </div>
            </div>
          </Fragment>
        )}

        {data.pbcConfig.outType === 4 && (
          <Fragment>
            <div className="mTop28 Font16 bold">{_l('直接返回流程节点数据对象给请求地址')}</div>
            {this.renderContentType()}
            <div className="flowDetailTrigger">
              <SelectNodeObject
                smallBorder={true}
                appList={data.flowNodeList}
                selectNodeId={data.value}
                selectNodeObj={_.find(data.flowNodeList, o => o.nodeId === data.value) || {}}
                onChange={value => this.updateSource({ value })}
              />
            </div>
          </Fragment>
        )}

        {_.includes([4, 5], data.pbcConfig.outType) && (
          <Fragment>
            <div className="mTop28 Font16 bold">{_l('流程中止时响应')}</div>
            {this.renderContentType('endContentType')}
            <div className="workflowDialogBox">
              <div className="flowDetailTrigger">
                <CustomTextarea
                  className="minH100"
                  projectId={flowInfo.companyId}
                  processId={flowInfo.id}
                  relationId={flowInfo.relationId}
                  selectNodeId={data.pbcConfig.outType === 3 ? flowInfo.startNodeId : data.pcbOutId}
                  sourceAppId={data.pbcConfig.outType === 3 ? flowInfo.startAppId : ''}
                  type={2}
                  content={data.endValue}
                  formulaMap={data.formulaMap}
                  onChange={(err, value, obj) => this.updateSource({ endValue: value })}
                  updateSource={this.updateSource}
                />
              </div>
            </div>
          </Fragment>
        )}
      </Fragment>
    );
  }

  renderContentType(key = 'responseContentType') {
    const { data } = this.state;
    const CONTENT_TYPE = [
      { text: _l('纯文本') + '（text/plain）', value: 3 },
      { text: 'JSON（application/json）', value: 2 },
      { text: 'XML', value: 6 },
    ];

    return (
      <div className="flexRow mTop10">
        {CONTENT_TYPE.map(item => (
          <Radio
            key={item.value}
            className="flex"
            text={item.text}
            checked={data[key] === item.value}
            onClick={() =>
              this.updateSource(
                key === 'responseContentType' ? { [key]: item.value, value: '' } : { [key]: item.value, endValue: '' },
              )
            }
          />
        ))}
      </div>
    );
  }

  renderAuthContent() {
    const { data } = this.state;
    const AUTH_TYPE = [
      { text: _l('使用应用授权'), value: 1 },
      { text: _l('无需授权'), value: 0 },
    ];

    return (
      <Fragment>
        <div className="bold Font16 mTop28">{_l('请求鉴权认证')}</div>
        <div className="mTop15 flexRow">
          {AUTH_TYPE.map((item, i) => (
            <Radio
              key={i}
              className="bold mRight60"
              text={item.text}
              checked={data.pbcConfig.authType === item.value || (data.pbcConfig.authType === 2 && item.value === 0)}
              onClick={() =>
                this.updateSource({ pbcConfig: Object.assign({}, data.pbcConfig, { authType: item.value }) })
              }
            />
          ))}
        </div>
        <div className="bold Font16 mTop28">{_l('白名单')}</div>
        <div className="mTop15">
          <Checkbox
            className="InlineBlock Gray"
            text={_l('使用应用IP白名单')}
            checked={data.pbcConfig.authType !== 0}
            disabled={data.pbcConfig.authType === 1}
            onClick={checked =>
              this.updateSource({ pbcConfig: Object.assign({}, data.pbcConfig, { authType: checked ? 0 : 2 }) })
            }
          />
        </div>
      </Fragment>
    );
  }

  renderWebhookContent() {
    const { flowInfo } = this.props;
    const { data } = this.state;

    return (
      <Fragment>
        <div className="bold Font16 mTop28">{_l('平台API能力')}</div>
        <div className="Gray_75 mTop5">
          {data.pbcConfig.authType === 0
            ? _l('为Webhook配置鉴权认证，IP白名单，自定义响应')
            : _l('为Webhook配置鉴权认证，IP白名单，自定义响应。请求参数需包含 AppKey、Sign')}
          {data.pbcConfig.authType !== 0 && (
            <a
              href={`/worksheetapi/${flowInfo.relationId}`}
              target="_blank"
              className="mLeft2 ThemeColor3 ThemeHoverColor2"
            >
              {_l('查看文档')}
            </a>
          )}
        </div>
        {this.renderAuthContent()}
        {this.renderResponseType()}
      </Fragment>
    );
  }

  render() {
    const { flowInfo } = this.props;
    const isWebhook = _.includes([7], flowInfo.startAppType) && !flowInfo.child;
    const isPBC = _.includes([17], flowInfo.startAppType) && !flowInfo.child;
    const { data, tab } = this.state;

    if (_.isEmpty(data)) {
      return <LoadDiv className="mTop15" />;
    }

    const settings = [
      { text: _l('基础'), value: 1, icon: 'settings' },
      {
        text: _l('人工节点（旧）'),
        value: 2,
        icon: 'how_to_reg',
        tip: _l('此项配置仅对旧版人工节点生效。推荐使用新审批流程！'),
      },
      { text: _l('流程参数'), value: 3, icon: 'tune' },
      { text: _l('平台API能力'), value: 4, icon: 'pbc' },
      { text: _l('平台API能力'), value: 5, icon: 'pbc' },
    ];
    const licenseType = _.get(
      _.find(md.global.Account.projects, item => item.projectId === flowInfo.companyId) || {},
      'licenseType',
    );

    if (flowInfo.startAppType === APP_TYPE.LOOP_PROCESS) {
      _.remove(settings, item => item.value === 3);
    }

    if (!isPBC || licenseType === 0) {
      _.remove(settings, item => item.value === 4);
    }

    if (
      !isWebhook ||
      !data.pbcConfig ||
      (isWebhook && !getFeatureStatus(flowInfo.companyId, VersionProductType.encapsulatingBusinessProcess))
    ) {
      _.remove(settings, item => item.value === 5);
    }

    return (
      <div className="flexRow flex">
        <ul className="processConfigTab">
          {settings.map(item => (
            <li
              className={item.value === tab ? 'active' : ''}
              key={item.value}
              onClick={() => this.setState({ tab: item.value })}
            >
              <Icon className="Font16" icon={item.icon} />
              {item.text}
              {item.tip && (
                <span className="workflowDetailTipsWidth mLeft5" data-tip={item.tip}>
                  <Icon icon="info" className="Gray_9e" />
                </span>
              )}
            </li>
          ))}
        </ul>
        <div className={cx('processConfig flexColumn flex', { workflowConfigRelease: !!flowInfo.parentId })}>
          <ScrollView className="flex">
            <div className="pLeft40 pRight40 processConfigContent">
              {tab === 1 && this.renderProcessContent()}
              {tab === 2 && this.renderArtificialContent()}
              {tab === 3 && this.renderParameterContent()}
              {tab === 4 && this.renderPBCContent()}
              {tab === 5 && this.renderWebhookContent()}
            </div>
          </ScrollView>

          {!flowInfo.parentId && (
            <div className="pLeft40 pRight40 mTop20 flexRow alignItemsCenter">
              <span className="processConfigSave ThemeBGColor3 ThemeHoverBGColor2 pointer" onClick={this.onSave}>
                {_l('保存')}
              </span>
              <Support
                className="pointer Gray_75 mLeft32"
                href={getHelpUrl('workflow', 'configuration')}
                type={2}
                text={_l('帮助')}
              />
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default connect(state => state.workflow)(ProcessConfig);

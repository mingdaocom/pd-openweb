import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import cx from 'classnames';
import { ScrollView, Menu, Radio, MenuItem, LoadDiv, TagTextarea, Tooltip, Support } from 'ming-ui';
import flowNode from '../../../api/flowNode';
import { CONTROLS_NAME } from '../../enum';
import {
  Member,
  SelectUserDropDown,
  Tag,
  DetailHeader,
  DetailFooter,
  ActionFields,
  CustomTextarea,
  TestParameter,
} from '../components';
import styled from 'styled-components';
import { handleGlobalVariableName } from '../../utils';

const TagBox = styled.div`
  padding: 0 7px;
  height: 22px;
  background: #f5f5f5;
  border-radius: 2px;
  color: #9e9e9e;
  display: flex;
  align-items: center;
  white-space: nowrap;
  &.yellow {
    background: #ffa340;
    color: #fff !important;
  }
  &.blue {
    background: #2196f3;
    color: #fff !important;
  }
`;

export default class Message extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      saveRequest: false,
      showSelectUserDialog: false,
      keywords: '',

      addNewTemplate: false,
      templateId: '',
      sign: '',
      messageContent: '',
      type: 0,
      showSignList: false,
      fieldsVisible: false,

      isSelectNewTpl: false,
      showSetTemplate: false,
      cacheTemplateContent: '',
      fieldsData: [],

      showTestDialog: false,
      testArray: [],
    };
  }

  currentMapId = '';
  mapData = {};

  componentDidMount() {
    this.getNodeDetail(this.props);
  }

  componentWillReceiveProps(nextProps, nextState) {
    if (nextProps.selectNodeId !== this.props.selectNodeId) {
      this.setState({ keywords: '' });
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

  componentDidUpdate(prevProps, prevState) {
    if (
      this.tagBox &&
      prevState.data.messageTemplate &&
      prevState.data.messageTemplate.messageContent !== this.state.data.messageTemplate.messageContent
    ) {
      this.tagBox.setValue(this.state.data.messageTemplate.messageContent.replace(/\$\(.*?\)/g, '$-$'));
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
    const { data, saveRequest } = this.state;
    const { name, accounts, messageTemplate } = data;

    if (!accounts.length) {
      alert(_l('必须先选择一个发送人'), 2);
      return;
    }

    if (!messageTemplate.id) {
      alert(_l('必须先选择一个模板'), 2);
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
        accounts,
        smsContent: messageTemplate.messageContent,
        templateId: messageTemplate.id,
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
    const { data, showSelectUserDialog } = this.state;

    return (
      <Fragment>
        {md.global.Config.IsPlatformLocal && (
          <div className="Gray_75 workflowDetailDesc">
            <span className="TxtMiddle">
              {_l(
                '短信0.05元/条，自动从企业账务中心扣费。70字计一条短信，超过70字以67字每条计费。每个标点、空格、英文字母都算一个字。短信实际发送可能有10-20分钟的延时。暂不支持海外手机号。',
              )}
            </span>
          </div>
        )}
        <div className="mTop20 bold">{_l('发送给')}</div>

        <Member accounts={data.accounts} updateSource={this.updateSource} />

        <div
          className="flexRow mTop15 ThemeColor3 workflowDetailAddBtn"
          onClick={() => this.setState({ showSelectUserDialog: true })}
        >
          <i className="Font28 icon-task-add-member-circle mRight10" />
          {_l('选择人员、号码或输入手机号')}
          <SelectUserDropDown
            appId={this.props.relationType === 2 ? this.props.relationId : ''}
            specialType={3}
            visible={showSelectUserDialog}
            companyId={this.props.companyId}
            processId={this.props.processId}
            nodeId={this.props.selectNodeId}
            unique={false}
            accounts={data.accounts}
            updateSource={this.updateSource}
            onClose={() => this.setState({ showSelectUserDialog: false })}
          />
        </div>

        {data.messageTemplate.companySignature && this.renderTemplateContent()}
        {!data.messageTemplate.companySignature && this.renderTemplateList()}
      </Fragment>
    );
  }

  /**
   * 渲染模板内容
   */
  renderTemplateContent() {
    const { data } = this.state;
    const status = data.messageTemplate.status;

    return (
      <Fragment>
        <div className="mTop20 bold">{_l('短信内容')}</div>
        <div className="mTop10 flowTplBox">
          <div
            className={cx(
              'flowTplHeader flexRow alignItemsCenter',
              { gray: status === 0 },
              { green: status === 1 },
              { red: status === 2 },
            )}
          >
            {status === 0 && (
              <Fragment>
                <i className="Font16 Gray_75 icon-workflow_under_review" />
                <div className="mLeft10 flex bold">{_l('模板审核中...')}</div>
                <div className="Gray_75">{_l('无法修改审核中模板')}</div>
              </Fragment>
            )}
            {status === 1 && (
              <Fragment>
                <i className="Font16 icon-Import-success" />
                <div className="mLeft10 flex bold">{_l('审核通过')}</div>
              </Fragment>
            )}
            {status === 2 && (
              <Fragment>
                <span className="workflowDetailTipsWidth" data-tip={data.messageTemplate.failCause}>
                  <i className="Font16 icon-workflow_failure" />
                </span>
                <div className="mLeft10 flex bold">{_l('审核失败')}</div>
              </Fragment>
            )}
          </div>
          <div className="pLeft16 pRight16 pTop15 pBottom20">
            <div className="bold">{_l('短信签名：')}</div>
            <div className="mTop5">{data.messageTemplate.companySignature}</div>

            <div className="mTop15 bold">{_l('类型：')}</div>
            {data.messageTemplate.type === 2
              ? _l('营销推广')
              : data.messageTemplate.type === 3
              ? _l('金融交易')
              : _l('行业通知')}

            <div className="mTop15 bold">{_l('内容')}</div>
            <TagTextarea
              className="flowTplContent"
              defaultValue={data.messageTemplate.messageContent.replace(/\$\(.*?\)/g, '$-$')}
              getRef={tagBox => {
                this.tagBox = tagBox;
              }}
              readonly
              renderTag={(tag, options) => {
                const ids = tag.split(/([a-zA-Z0-9#]{24,32})-/).filter(item => item);
                const nodeObj = data.formulaMap[ids[0]] || {};
                const controlObj = data.formulaMap[ids[1]] || {};

                if (!nodeObj.name || !controlObj.name) {
                  return <span style={{ color: '#ffa340' }}>({_l('缺少字段变量')})</span>;
                }

                return (
                  <span>
                    ({nodeObj.name}
                    {'>'}
                    {controlObj.name})
                  </span>
                );
              }}
            />

            <div className="mTop15">
              {status !== 0 && (
                <span
                  className="flowTplBtn ThemeBorderColor3 ThemeColor3"
                  onClick={status === 1 ? this.setTemplate : this.editTemplate}
                >
                  {_l('修改')}
                </span>
              )}
              <span className="flowTplBtn ThemeBorderColor3 ThemeColor3" onClick={this.delTemplate}>
                {_l('删除')}
              </span>
            </div>
          </div>
        </div>
      </Fragment>
    );
  }

  /**
   * 设置模板
   */
  setTemplate = () => {
    const { data } = this.state;
    let cacheTemplateContent = data.messageTemplate.messageContent;

    this.mapData = {};

    (cacheTemplateContent.match(/\$\(.*?\)|\$.*?\$/g) || []).forEach(item => {
      const random = Math.random().toString();
      this.mapData[random] = item;
      cacheTemplateContent = cacheTemplateContent.replace(item, `$${random}$`);
    });

    this.setState({
      showSetTemplate: true,
      cacheTemplateContent,
    });
  };

  /**
   * 编辑模板
   */
  editTemplate = () => {
    const { data } = this.state;
    const { messageTemplate } = data;

    this.setState({
      showSetTemplate: false,
      addNewTemplate: true,
      templateId: messageTemplate.id,
      sign: messageTemplate.companySignature,
      messageContent: messageTemplate.messageContent,
      type: messageTemplate.type,
    });
  };

  /**
   * 删除模板
   */
  delTemplate = () => {
    this.updateSource({
      messageTemplate: {
        id: '',
        companySignature: '',
        messageContent: '',
        type: 0,
      },
    });
  };

  /**
   * 渲染模板列表
   */
  renderTemplateList() {
    const { data, keywords } = this.state;
    const templates = data.templates.filter(
      item =>
        item.companySignature.toLocaleLowerCase().indexOf(keywords.toLocaleLowerCase()) > -1 ||
        item.messageContent.toLocaleLowerCase().indexOf(keywords.toLocaleLowerCase()) > -1,
    );

    return (
      <Fragment>
        <div className="mTop20 flexRow">
          <div className="flex">{_l('选择已审核模板')}</div>
          <div className="ThemeColor3 ThemeHoverColor2 pointer" onClick={() => this.setState({ addNewTemplate: true })}>
            <i className="icon-plus mRight5" />
            {_l('创建新模板')}
          </div>
        </div>

        <div className="mTop10 relative flexRow">
          <input
            type="text"
            placeholder={_l('搜索')}
            className="ThemeBorderColor3 actionControlBox flex pLeft35 pRight10 pTop0 pBottom0"
            value={keywords}
            onChange={evt => this.setState({ keywords: evt.currentTarget.value.trim() })}
          />
          <i className="icon-workflow_find Font20 Gray_9e Absolute mTop8 mLeft10" />
        </div>

        {templates.length ? (
          <ul className="mTop10 workflowMessageList">
            {templates.map((item, i) => {
              return (
                <li
                  key={i}
                  className="flexRow alignItemsCenter"
                  onClick={() => this.selectTemplate(item.id, item.companySignature, item.messageContent)}
                >
                  <Radio className="Font15" disabled />
                  <TagBox className={cx('mRight10', { yellow: item.type === 2, blue: item.type === 3 })}>
                    {item.type === 2 ? _l('营销推广') : item.type === 3 ? _l('金融交易') : _l('行业通知')}
                  </TagBox>
                  <div className="alignItemsCenter workflowMessageListItem">
                    {this.getTemplateListContent(
                      `【${item.companySignature}】${item.messageContent}`,
                      item.referenceValue,
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flexColumn mTop40 alignItemsCenter">
            <i className="icon-workflow_sms Gray_c Font64" />
            <div className="Font15 Gray_9e mTop30">{_l('没有已审核模板、点击创建新模板')}</div>
          </div>
        )}
      </Fragment>
    );
  }

  /**
   * 获取模板列表内容
   */
  getTemplateListContent(content, referenceValue = {}) {
    Object.keys(referenceValue).forEach(key => {
      content = content.replace(
        new RegExp(key.replace(/\$/g, '\\$').replace(/\(/g, '\\(').replace(/\)/g, '\\)'), 'g'),
        `#{${referenceValue[key]}}`,
      );
    });

    return content;
  }

  /**
   * 选择现有模板
   */
  selectTemplate(id, companySignature, messageContent) {
    const { data } = this.state;
    const messageTemplate = _.cloneDeep(data.messageTemplate);

    messageTemplate.id = id;
    messageTemplate.companySignature = companySignature;
    messageTemplate.messageContent = messageContent;
    messageTemplate.status = 1;

    this.updateSource({ messageTemplate }, () => {
      this.setState({ isSelectNewTpl: true });
      this.setTemplate();
    });
  }

  /**
   * 渲染新模板
   */
  renderNewTemplate() {
    const { data, sign, messageContent, type, showSignList, isSelectNewTpl, showTestDialog, testArray } = this.state;
    const companySignatureList = data.companySignatureList.filter(key => key.indexOf(sign) > -1);
    const MESSAGE_TYPES = [
      { text: _l('行业通知'), value: 1, desc: _l('一般性通知。如验证码短信、通知短信、物流快递短信、订单短信') },
      {
        text: _l('营销推广'),
        value: 2,
        desc: _l('如：促销、优惠、活动报名等产品推广和品牌宣传类短信；系统将自动为此类短信末尾附加【退订】字样'),
      },
      {
        text: _l('金融交易（暂不支持）'),
        value: 3,
        desc: _l('如：资金到账提示、支付验证码、交易提醒、催缴通知等'),
        disabled: true,
      },
    ];

    return (
      <div className="pBottom20">
        <div className="ThemeColor3 ThemeHoverColor2 pointer">
          <span
            className="pointer"
            onClick={() => {
              if (isSelectNewTpl) {
                this.delTemplate();
              }
              this.setState({ addNewTemplate: false, isSelectNewTpl: false, sign: '', messageContent: '' });
            }}
          >
            <i className="icon-backspace Font20" />
            <span className="mLeft5">{_l('返回')}</span>
          </span>
        </div>

        <div className="Font18 bold mTop20">{isSelectNewTpl ? _l('修改模板内容') : _l('创建新模板')}</div>
        <div className="bold mTop20">{_l('短信签名')}</div>
        <div className="Gray_75 mTop10">
          {_l('请谨慎填写您的组织简称、网站名、品牌名，2-8个汉字。如签名不符合规范，将会被运营商拦截。')}
        </div>

        <div className="mTop10 relative flexRow" style={{ width: 150 }}>
          <input
            type="text"
            maxLength={8}
            placeholder={_l('请输入签名')}
            className="ThemeBorderColor3 actionControlBox flex pLeft10 pRight10 pTop0 pBottom0"
            value={sign}
            onFocus={() => this.setState({ showSignList: true })}
            onBlur={() => this.setState({ showSignList: false })}
            onChange={evt => this.setState({ sign: evt.currentTarget.value.replace(/[【】]/g, '').trim() })}
          />

          {showSignList && (
            <Menu className="fomulaFnList" style={{ right: 0 }}>
              {!companySignatureList.length && <div className="fnEmpty">{_l('没有可用的签名')}</div>}
              {companySignatureList.map((value, i) => (
                <MenuItem key={i} onMouseDown={() => this.setState({ sign: value })}>
                  {value}
                </MenuItem>
              ))}
            </Menu>
          )}
        </div>

        <div className="bold mTop20">{_l('短信类型')}</div>
        <div className="Gray_75 mTop10">
          {_l('请谨慎选择您的短信类型，后续如果在发送时出现实际类型不符合预设类型的，可能面临模版被停用的风险')}
        </div>
        {MESSAGE_TYPES.map(item => (
          <div className="mTop15" key={item.value}>
            <Tooltip popupPlacement="top" text={item.desc}>
              <span>
                <Radio
                  text={item.text}
                  disabled={item.disabled}
                  checked={type === item.value}
                  onClick={() => this.setState({ type: item.value })}
                />
              </span>
            </Tooltip>
          </div>
        ))}

        <div className="bold mTop20">{_l('短信内容')}</div>
        <div className="Gray_75 mTop10">
          {_l('为保证短信的稳定推送，以下内容须审核后才能使用。多于70字（含签名）的短信按67字每条计费')}
        </div>
        <CustomTextarea
          className="minH100"
          projectId={this.props.companyId}
          processId={this.props.processId}
          relationId={this.props.relationId}
          selectNodeId={this.props.selectNodeId}
          type={2}
          content={messageContent}
          formulaMap={data.formulaMap}
          onChange={(err, value, obj) =>
            this.setState({ messageContent: value.replace(/【/g, '[').replace(/】/g, ']') })
          }
          updateSource={this.updateSource}
        />
        <div className="Gray_75 mTop10">
          {/*_l(
            '已输入 %0 个字（含签名），按 %1 条计费',
            this.statisticalWordNumber(),
            Math.ceil(this.statisticalWordNumber() / 70),
          )*/}
        </div>

        <div className="mTop30">
          <span
            className="saveTplBtn ThemeBGColor3 ThemeHoverBGColor2"
            onClick={() => {
              const newTestArray = _.uniq(messageContent.match(/\$[^ \r\n]+?\$/g) || []);

              if (!sign) {
                alert(_l('签名不能为空'), 2);
                return;
              }

              if (!messageContent) {
                alert(_l('短信内容不能为空'), 2);
                return;
              }

              // 存在动态值
              if (newTestArray.length) {
                this.setState({ showTestDialog: true, testArray: newTestArray });
                return;
              }

              this.onSaveTemplate();
            }}
          >
            {_l('提交审核')}
          </span>
        </div>
        <div className="mTop20 Gray_75 workflowDetailDesc">
          <div>
            <span className="mRight10">•</span>
            {_l('审核时间约为1小时，非工作时间提交审核会延长')}
          </div>
          <div>
            <span className="mRight10">•</span>
            {_l('我们会把审核通过的短信模板同步到「工作流 > 短信模板」')}
          </div>
        </div>

        {showTestDialog && (
          <TestParameter
            title={_l('设置参考值')}
            description={_l('这些是您短信模板中使用到的动态值，请给出范例数据用于人工审核时验证您的短信类型')}
            onOk={this.onSaveTemplate}
            onClose={() => this.setState({ showTestDialog: false })}
            testArray={testArray}
            formulaMap={data.formulaMap}
            testMap={data.referenceValue || {}}
            isRequired
            previewContent={`【${sign}】${messageContent}`}
          />
        )}
      </div>
    );
  }

  /**
   * 统计字数
   */
  statisticalWordNumber() {
    const { sign, messageContent } = this.state;
    const tagSize = (messageContent.match(/\$[^ \r\n]+?\$/g) || []).length * 8;

    return sign.length + messageContent.replace(/\$[^ \r\n]+?\$/g, '').length + tagSize;
  }

  /**
   * 保存短信模板
   */
  onSaveTemplate = referenceValue => {
    const { sign, messageContent, type, templateId, saveRequest } = this.state;

    if (saveRequest) {
      return;
    }

    flowNode
      .createSMSTemplate({
        companyId: this.props.companyId,
        processId: this.props.processId,
        nodeId: this.props.selectNodeId,
        companySignature: sign,
        messageContent,
        type,
        templateId,
        referenceValue,
      })
      .then(result => {
        const data = _.cloneDeep(this.state.data);

        data.messageTemplate.id = result.id;
        data.messageTemplate.companySignature = result.companySignature;
        data.messageTemplate.messageContent = result.messageContent;
        data.messageTemplate.status = result.status;
        data.messageTemplate.type = result.type;
        data.formulaMap = Object.assign({}, data.formulaMap, result.formulaMap);

        this.setState({
          data,
          addNewTemplate: false,
          sign: '',
          messageContent: '',
          type: 0,
          templateId: '',
          saveRequest: false,
        });
      });

    this.setState({ saveRequest: true, showTestDialog: false });
  };

  /**
   * 渲染设置模板
   */
  renderSetTemplate() {
    const { data, fieldsVisible, fieldsData, cacheTemplateContent, isSelectNewTpl } = this.state;

    return (
      <Fragment>
        <div className="ThemeColor3 ThemeHoverColor2 pointer">
          <span
            className="pointer"
            onClick={() => {
              this.setState({ showSetTemplate: false });
              if (isSelectNewTpl) {
                this.delTemplate();
              }
            }}
          >
            <i className="icon-backspace Font20" />
            <span className="mLeft5">{_l('返回')}</span>
          </span>
        </div>
        <div className="bold mTop20 Font18">{_l('已审核模板')}</div>
        <div className="mTop10 Gray_75 flexRow">
          <div className="flex">{_l('请修改已审核模板中的变量')}</div>
          <div className="ThemeColor3 ThemeHoverColor2 pointer" onClick={this.editTemplate}>
            {_l('修改模板的内容')}
          </div>
        </div>

        <div className="mTop10 relative">
          <TagTextarea
            className="flowTplSettingContent minH100"
            defaultValue={cacheTemplateContent}
            height={0}
            readonly
            getRef={tagtextarea => {
              this.tagtextarea = tagtextarea;
            }}
            renderTag={(tag, options) => {
              const ids = (this.mapData[tag] || '')
                .replace(/\$/g, '')
                .split(/([a-zA-Z0-9#]{24,32})-/)
                .filter(item => item);
              const nodeObj = data.formulaMap[ids[0]] || {};
              const controlObj = data.formulaMap[ids[1]] || {};

              if (!nodeObj.name || !controlObj.name) {
                return (
                  <span
                    className="fieldInsertBtn ThemeBGColor4 ThemeHoverBGColor3"
                    onClick={() => this.insertFields(tag)}
                  >
                    {_l('点击插入字段')}
                  </span>
                );
              }

              return (
                <Tag
                  className="pointer"
                  flowNodeType={nodeObj.type}
                  appType={nodeObj.appType}
                  actionId={nodeObj.actionId}
                  nodeName={handleGlobalVariableName(ids[0], controlObj.sourceType, nodeObj.name)}
                  controlName={controlObj.name}
                  onClick={() => this.insertFields(tag)}
                />
              );
            }}
          />

          {fieldsVisible && !!fieldsData.length && (
            <ActionFields
              className="actionFields"
              noItemTips={_l('没有可用的字段')}
              condition={fieldsData}
              handleFieldClick={({
                nodeId,
                fieldValueId,
                nodeName,
                fieldValueName,
                fieldValueType,
                nodeTypeId,
                appType,
                actionId,
              }) => {
                const formulaMap = _.cloneDeep(data.formulaMap);
                formulaMap[nodeId] = { type: nodeTypeId, appType, actionId, name: nodeName };
                formulaMap[fieldValueId] = { type: fieldValueType, name: fieldValueName };

                this.mapData[this.currentMapId] = `$${nodeId}-${fieldValueId}$`;
                this.setState({ fieldsVisible: false });
                this.updateSource({ formulaMap }, () => {
                  this.tagtextarea.updateTextareaView();
                });
              }}
              onClose={() => this.setState({ fieldsVisible: false })}
            />
          )}
        </div>

        <div className="mTop30">
          <span className="saveTplBtn ThemeBGColor3 ThemeHoverBGColor2" onClick={this.saveTemplateSetting}>
            {_l('保存')}
          </span>
        </div>
      </Fragment>
    );
  }

  /**
   * 插入字段
   */
  insertFields(currentMapId) {
    const { processId, selectNodeId } = this.props;

    this.currentMapId = currentMapId;

    if (!this.state.fieldsData.length) {
      flowNode
        .getFlowNodeAppDtos({
          processId,
          nodeId: selectNodeId,
          type: 2,
        })
        .then(result => {
          const fieldsData = result.map(obj => {
            return {
              text: obj.nodeName,
              id: obj.nodeId,
              nodeTypeId: obj.nodeTypeId,
              appName: obj.appName,
              appType: obj.appType,
              appTypeName: obj.appTypeName,
              actionId: obj.actionId,
              items: obj.controls.map(o => {
                return {
                  type: o.type,
                  value: o.controlId,
                  field: CONTROLS_NAME[o.type],
                  text: o.controlName,
                };
              }),
            };
          });
          this.setState({ fieldsData, fieldsVisible: true });
        });
    } else {
      this.setState({ fieldsVisible: true });
    }
  }

  /**
   * 保存设置的模板字段
   */
  saveTemplateSetting = () => {
    let { cacheTemplateContent } = this.state;
    const messageTemplate = _.cloneDeep(this.state.data.messageTemplate);

    (cacheTemplateContent.match(/\$[^ \r\n]+?\$/g) || []).forEach(item => {
      cacheTemplateContent = cacheTemplateContent.replace(item, this.mapData[item.replace(/\$/g, '')]);
    });

    this.setState({ showSetTemplate: false, isSelectNewTpl: false });
    messageTemplate.messageContent = cacheTemplateContent;
    this.updateSource({ messageTemplate });
  };

  render() {
    const { data, addNewTemplate, showSetTemplate } = this.state;

    if (_.isEmpty(data)) {
      return <LoadDiv className="mTop15" />;
    }

    return (
      <Fragment>
        <DetailHeader
          {...this.props}
          data={{ ...data }}
          icon="icon-workflow_sms"
          bg="BGBlue"
          updateSource={this.updateSource}
        />
        <div className="flex">
          <ScrollView>
            <div className="workflowDetailBox">
              {!addNewTemplate && !showSetTemplate && this.renderContent()}
              {addNewTemplate && this.renderNewTemplate()}
              {showSetTemplate && this.renderSetTemplate()}
            </div>
          </ScrollView>
        </div>
        {!addNewTemplate && !showSetTemplate && (
          <DetailFooter
            {...this.props}
            isCorrect={data.accounts.length && data.messageTemplate.id}
            onSave={this.onSave}
          />
        )}
      </Fragment>
    );
  }
}

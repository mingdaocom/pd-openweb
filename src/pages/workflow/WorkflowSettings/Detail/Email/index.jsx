import React, { Component, Fragment } from 'react';
import copy from 'copy-to-clipboard';
import _ from 'lodash';
import { Checkbox, Dropdown, LoadDiv, PriceTip, Radio, RichText, ScrollView } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import flowNode from '../../../api/flowNode';
import agentApi from 'src/api/agent';
import { genBotSessionId } from 'src/utils/agentSession';
import { emitter } from 'src/utils/common';
import { ACTION_ID, RELATION_TYPE } from '../../enum';
import { getControlTypeName } from '../../utils';
import {
  ActionFields,
  DetailFooter,
  DetailHeader,
  Member,
  SelectUserDropDown,
  SingleControlValue,
} from '../components';
import MJMLEditorDialog from './MJMLEditorDialog';
import {
  CONTENT_TYPE,
  extractMjmlContent,
  getEmailContentType,
  getFormulaMapWithInsertedField,
  getMjmlPreviewHtml,
  getMjmlPreviewTheme,
} from './mjmlUtils';

export default class Email extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      saveRequest: false,
      showSelectUserDialog: false,
      cacheKey: +new Date(),
      showSelectCCUserDialog: false,
      showSelectBCUserDialog: false,
      fieldsVisible: false,
      fieldsData: [],
      showMJMLEditorDialog: false,
      mjmlEditIndex: -1,
      showMjmlReadonlyDialog: false,
      mjmlReadonlyValue: '',
      autoConvertForEmailLoading: false,
      mjmlPreviewThemeVersion: 0,
    };
  }

  componentDidMount() {
    this.mounted = true;
    this.getNodeDetail(this.props);
    emitter.addListener('CHANGE_THEME_MODE', this.handleMJMLPreviewThemeChange);
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      if (this.props.selectNodeId !== prevProps.selectNodeId) {
        this.getNodeDetail(this.props);
      }

      if (
        this.props.selectNodeName &&
        this.props.selectNodeName !== prevProps.selectNodeName &&
        this.props.selectNodeId === prevProps.selectNodeId &&
        !_.isEmpty(this.state.data)
      ) {
        this.updateSource({
          name: this.props.selectNodeName,
        });
      }
    }
  }

  componentWillUnmount() {
    this.mounted = false;
    emitter.removeListener('CHANGE_THEME_MODE', this.handleMJMLPreviewThemeChange);
  }

  /**
   * 修改选中的字段
   */
  genFields = data => {
    const { controls, fields } = data;
    controls.forEach(item => {
      fields.push({
        fieldId: item.controlId,
        type: item.type,
        enumDefault: item.enumDefault,
        nodeId: '',
        nodeName: '',
        fieldValueId: '',
        fieldValueName: '',
        fieldValue: item.type === 26 || item.type === 27 ? '[]' : '',
      });
    });

    this.updateSource({ fields });
  };

  /**
   * 获取节点详情
   */
  getNodeDetail(props) {
    const { processId, selectNodeId, selectNodeType, instanceId } = props;

    flowNode
      .getNodeDetail({ processId, nodeId: selectNodeId, flowNodeType: selectNodeType, instanceId })
      .then(result => {
        const nodeDetail = {
          ...result,
          bcAccounts: _.isArray(result.bcAccounts) && !result.bcAccounts.length ? null : result.bcAccounts,
        };

        if (!this.cacheResult) {
          this.cacheResult = _.cloneDeep(nodeDetail);
        }

        this.setState({ data: nodeDetail, cacheKey: +new Date() });
        if (!nodeDetail.fields.length) {
          this.genFields(nodeDetail);
        }
      });
  }

  /**
   * 更新data数据
   */
  updateSource = (obj, callback = () => {}) => {
    this.props.haveChange(true);
    this.setState({ data: Object.assign({}, this.state.data, obj) }, callback);
  };

  handleMJMLPreviewThemeChange = () => {
    if (!this.mounted) return;

    this.setState(({ mjmlPreviewThemeVersion }) => ({
      mjmlPreviewThemeVersion: mjmlPreviewThemeVersion + 1,
    }));
  };

  handleMJMLFieldInsert = field => {
    const { data } = this.state;

    this.updateSource({
      formulaMap: getFormulaMapWithInsertedField(data.formulaMap, field),
    });
  };

  /**
   * MJML 转邮件 HTML
   */
  convertMjml = mjmlValue => {
    return import('mjml-browser').then(module => {
      const mjml2html = module.default || module;

      return Promise.resolve(mjml2html(mjmlValue, { validationLevel: 'soft' })).then(result => {
        const errors = result.errors || [];

        if (errors.length) {
          throw new Error(
            errors
              .map(error => {
                const position = error.line ? `${_l('第%0行', error.line)} ` : '';

                return `${position}${error.message || error.formattedMessage || _l('MJML 格式错误')}`;
              })
              .join('\n'),
          );
        }

        return result;
      });
    });
  };

  /**
   * 保存
   */
  onSave = async () => {
    const { data, saveRequest } = this.state;
    const { name, fields, actionId, appType, accounts, ccAccounts, bcAccounts } = data;
    const emailContentType = getEmailContentType(data);
    let mjmlHtml = '';
    let hasError = false;

    if (!accounts.length) {
      alert(_l('必须先选择一个发送人'), 2);
      return;
    }

    data.controls.forEach(item => {
      if (item.required) {
        data.fields.forEach(o => {
          if (item.controlId === o.fieldId && !o.fieldValue && !o.fieldValueId) {
            hasError++;
          }
        });
      }
    });

    if (hasError > 0) {
      alert(_l('有必填字段未填写'), 2);
      return;
    }

    if (saveRequest || _.isEqual(data, this.cacheResult)) {
      return;
    }

    this.setState({ saveRequest: true });

    if (data.mjmlValue) {
      try {
        const result = await this.convertMjml(data.mjmlValue || '');

        mjmlHtml = result.html;
      } catch (err) {
        this.setState({ saveRequest: false });
        alert(err.message || _l('MJML 格式错误，请修正后再保存'), 2);
        return;
      }
    }

    flowNode
      .saveNode({
        processId: this.props.processId,
        nodeId: this.props.selectNodeId,
        flowNodeType: this.props.selectNodeType,
        name: name.trim(),
        fields,
        actionId,
        appType,
        accounts,
        ccAccounts,
        bcAccounts,
        emailContentType,
        mjmlValue: data.mjmlValue || '',
        mjmlHtml,
      })
      .then(result => {
        this.props.updateNodeData(result);
        this.props.closeDetail();
      })
      .catch(() => {
        this.setState({ saveRequest: false });
      });
  };

  renderMJMLContent = data => {
    return (
      <div className="workflowMjmlPreview mTop8 relative">
        {data.mjmlHtml ? (
          <iframe
            className="workflowMjmlPreviewFrame"
            title={_l('MJML 邮件效果预览')}
            sandbox=""
            srcDoc={getMjmlPreviewHtml(data.mjmlHtml, data.formulaMap, getMjmlPreviewTheme())}
          />
        ) : (
          <div className="workflowMjmlPlaceholder">
            <div className="Font20 bold">{_l('MJML编辑模式')}</div>
            <div className="Font15 mTop12 textSecondary">
              {_l('MJML 适合高级用户，可直接编辑 MJML 代码，并预览最终邮件效果。')}
            </div>
          </div>
        )}
      </div>
    );
  };

  handleAutoConvertForEmailClick = (item, index) => {
    const { data, autoConvertForEmailLoading } = this.state;
    const richTextValue = item.fieldValue || '';

    if (autoConvertForEmailLoading) return;

    if (data.mjmlValue) {
      this.updateSource({
        mjmlValue: '',
        mjmlHtml: '',
      });
      return;
    }

    this.setState({ autoConvertForEmailLoading: true });
    agentApi
      .agentExecute(
        {
          agentName: 'rich-text-to-mjml',
          sessionId: genBotSessionId(),
          message: richTextValue,
        },
        { silent: true },
      )
      .then(result => {
        if (!this.mounted) return;

        const responseText = _.get(result, 'data.response.text') || '';
        const mjmlValue = extractMjmlContent(responseText);
        const currentField = (this.state.data.fields || [])[index] || {};

        if ((currentField.fieldValue || '') !== richTextValue) return;

        this.updateSource({
          mjmlValue,
          mjmlHtml: '',
        });
      })
      .catch(error => {
        if (!this.mounted) return;
        alert(error.message || _l('转换失败，请稍后重试'), 2);
      })
      .finally(() => {
        if (this.mounted) {
          this.setState({ autoConvertForEmailLoading: false });
        }
      });
  };

  /**
   * 渲染内容
   */
  renderContent() {
    const {
      data,
      showSelectUserDialog,
      cacheKey,
      showSelectCCUserDialog,
      showSelectBCUserDialog,
      fieldsVisible,
      fieldsData,
      showMJMLEditorDialog,
      mjmlEditIndex,
      showMjmlReadonlyDialog,
      mjmlReadonlyValue,
      autoConvertForEmailLoading,
    } = this.state;
    const list = [
      { text: _l('标准（支持抄送，每个收件人都可以看到所有收件人和抄送人）'), value: ACTION_ID.SEND_EMAIL },
      {
        text: _l('群发单显（采用一对一单独发送，每个收件人只能看到自己的地址）'),
        value: ACTION_ID.SEND_EMAIL_SINGLE_DISPLAY,
      },
    ];
    const contentTypes = [
      { text: _l('纯文本'), value: CONTENT_TYPE.TEXT },
      { text: _l('富文本编辑'), value: CONTENT_TYPE.RICH_TEXT },
      { text: _l('MJML 编辑（高级）'), value: CONTENT_TYPE.MJML },
    ];
    const emailContentType = getEmailContentType(data);
    const autoConvertForEmailEnabled = emailContentType === CONTENT_TYPE.RICH_TEXT && !!data.mjmlValue;

    return (
      <Fragment>
        {window.platformENV.isPlatform && (
          <div className="textSecondary workflowDetailDesc">
            <PriceTip text={_l('邮件费用自动从组织信用点中扣除')} />
          </div>
        )}
        <div className="mTop20 bold">{_l('发送方式')}</div>
        <Dropdown
          className="flowDropdown mTop10"
          data={list}
          value={data.actionId}
          border
          onChange={actionId => {
            this.updateSource({
              actionId,
              ccAccounts: actionId === ACTION_ID.SEND_EMAIL_SINGLE_DISPLAY ? [] : data.ccAccounts,
            });
          }}
        />

        <div className="mTop20 t-justify-between flexRow">
          <div className="bold">{_l('收件人')}</div>
          {data.actionId === ACTION_ID.SEND_EMAIL && !data.bcAccounts && (
            <div
              className="colorPrimary hoverColorPrimaryDark pointer"
              onClick={() => this.updateSource({ bcAccounts: [] })}
            >
              + {_l('密送人')}
            </div>
          )}
        </div>
        <Member
          companyId={this.props.companyId}
          appId={this.props.relationType === RELATION_TYPE.APP ? this.props.relationId : ''}
          accounts={data.accounts}
          updateSource={this.updateSource}
        />
        <div
          className="flexRow mTop15 colorPrimary workflowDetailAddBtn"
          onClick={() => this.setState({ showSelectUserDialog: true })}
        >
          <i className="Font28 icon-task-add-member-circle mRight10" />
          {_l('选择人员、邮箱地址或输入邮箱')}
          <SelectUserDropDown
            appId={this.props.relationType === RELATION_TYPE.APP ? this.props.relationId : ''}
            specialType={5}
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

        {data.actionId === ACTION_ID.SEND_EMAIL && (
          <Fragment>
            <div className="mTop20 bold">{_l('抄送人')}</div>
            <Member
              companyId={this.props.companyId}
              appId={this.props.relationType === RELATION_TYPE.APP ? this.props.relationId : ''}
              accounts={data.ccAccounts}
              updateSource={({ accounts }) => this.updateSource({ ccAccounts: accounts })}
            />
            <div
              className="flexRow mTop15 colorPrimary workflowDetailAddBtn"
              onClick={() => this.setState({ showSelectCCUserDialog: true })}
            >
              <i className="Font28 icon-task-add-member-circle mRight10" />
              {_l('选择人员、邮箱地址或输入邮箱')}
              <SelectUserDropDown
                appId={this.props.relationType === RELATION_TYPE.APP ? this.props.relationId : ''}
                specialType={5}
                visible={showSelectCCUserDialog}
                companyId={this.props.companyId}
                processId={this.props.processId}
                nodeId={this.props.selectNodeId}
                unique={false}
                accounts={data.ccAccounts}
                updateSource={({ accounts }) => this.updateSource({ ccAccounts: accounts })}
                onClose={() => this.setState({ showSelectCCUserDialog: false })}
              />
            </div>
          </Fragment>
        )}

        {data.bcAccounts && (
          <Fragment>
            <div className="mTop20 bold">{_l('密送人')}</div>
            <Member
              companyId={this.props.companyId}
              appId={this.props.relationType === RELATION_TYPE.APP ? this.props.relationId : ''}
              accounts={data.bcAccounts}
              updateSource={({ accounts }) => this.updateSource({ bcAccounts: accounts })}
            />
            <div
              className="flexRow mTop15 colorPrimary workflowDetailAddBtn"
              onClick={() => this.setState({ showSelectBCUserDialog: true })}
            >
              <i className="Font28 icon-task-add-member-circle mRight10" />
              {_l('选择人员、邮箱地址或输入邮箱')}
              <SelectUserDropDown
                appId={this.props.relationType === RELATION_TYPE.APP ? this.props.relationId : ''}
                specialType={5}
                visible={showSelectBCUserDialog}
                companyId={this.props.companyId}
                processId={this.props.processId}
                nodeId={this.props.selectNodeId}
                unique={false}
                accounts={data.bcAccounts}
                updateSource={({ accounts }) => this.updateSource({ bcAccounts: accounts })}
                onClose={() => this.setState({ showSelectBCUserDialog: false })}
              />
            </div>
          </Fragment>
        )}

        {data.fields.map((item, i) => {
          const singleObj = _.find(data.controls, obj => obj.controlId === item.fieldId);

          return (
            <div key={i} className="relative">
              <div className="mTop15 ellipsis Font13 bold">
                {singleObj.controlName}
                {singleObj.required && <span className="mLeft5 red">*</span>}
              </div>
              {item.fieldId === 'attachments' && <div className="mTop5 textSecondary">{_l('附件总大小不超过50M')}</div>}

              {item.fieldId === 'content' && (
                <div className="flexRow mTop10 relative">
                  {contentTypes.map((obj, j) => (
                    <div className="workflowEmailContentType" key={j}>
                      <Radio
                        text={obj.text}
                        checked={emailContentType === obj.value}
                        onClick={() => {
                          this.updateSource({
                            emailContentType: obj.value,
                            mjmlValue: '',
                            mjmlHtml: '',
                          });
                        }}
                      />
                    </div>
                  ))}
                  <div className="flex" />
                  {emailContentType === CONTENT_TYPE.MJML ? (
                    <div
                      className="pointer textSecondary hoverColorPrimary"
                      onClick={() => this.setState({ showMJMLEditorDialog: true, mjmlEditIndex: i })}
                    >
                      <i className="icon-edit Font15 mRight6" />
                      {_l('编辑')}
                    </div>
                  ) : (
                    <div
                      className="pointer textSecondary hoverColorPrimary"
                      onClick={this.insertFields}
                      style={{ visibility: emailContentType !== CONTENT_TYPE.TEXT ? 'visible' : 'hidden' }}
                    >
                      <i className="icon-workflow_other Font14" />
                      {_l('节点对象')}
                    </div>
                  )}
                  {emailContentType !== CONTENT_TYPE.MJML && fieldsVisible && !!fieldsData.length && (
                    <ActionFields
                      className="actionFields"
                      openSearch
                      style={{ marginTop: -8 }}
                      title={_l('点击复制节点对象代码，粘贴到需要的位置')}
                      noItemTips={_l('没有可用的字段')}
                      noData={_l('没有可用的节点对象')}
                      condition={fieldsData}
                      handleFieldClick={({ nodeId, fieldValueId, nAlias, cAlias }) => {
                        this.setState({ fieldsVisible: false });
                        copy(`#{${nAlias || nodeId}.${cAlias || fieldValueId}}`, { format: 'text/plain' });
                        alert(_l('已复制'));
                      }}
                      onClose={() => this.setState({ fieldsVisible: false })}
                    />
                  )}
                </div>
              )}

              {item.fieldId === 'content' && emailContentType === CONTENT_TYPE.MJML ? (
                this.renderMJMLContent(data)
              ) : item.fieldId === 'content' && emailContentType === CONTENT_TYPE.RICH_TEXT ? (
                <Fragment>
                  <RichText
                    className="mTop8"
                    showTool
                    minHeight={200}
                    dropdownPanelPosition={{ left: '0px', right: 'initial' }}
                    toolbarList={[
                      'undo',
                      'redo',
                      'removeFormat',
                      '|',
                      'paragraph',
                      'heading1',
                      'heading2',
                      'heading3',
                      '|',
                      'fontFamily',
                      'fontSize',
                      'fontColor',
                      'highlight',
                      '|',
                      'bold',
                      'italic',
                      'underline',
                      'strikethrough',
                      'subscript',
                      'superscript',
                      '|',
                      'bulletedList',
                      'numberedList',
                      'todoList',
                      '|',
                      'alignment',
                      'indent',
                      'outdent',
                      '|',
                      'horizontalLine',
                      'blockQuote',
                      'link',
                      'code',
                      'imageUpload',
                      'mediaEmbed',
                      '-',
                      'insertTable',
                      'codeBlock',
                      '|',
                      'sourceEditing',
                      'findAndReplace',
                    ]}
                    data={item.fieldValue || ''}
                    onActualSave={value => {
                      if (!this.mounted) return;

                      let newFields = [].concat(data.fields);

                      newFields[i] = {
                        ...item,
                        fieldValue: value,
                      };
                      this.updateSource({
                        fields: newFields,
                        mjmlValue: '',
                        mjmlHtml: '',
                      });
                    }}
                  />
                  <div className="flexRow mTop10 alignItemsCenter">
                    <Checkbox
                      className="flexRow alignItemsCenter minHeight30"
                      disabled={autoConvertForEmailLoading}
                      checked={autoConvertForEmailEnabled}
                      text={
                        <Fragment>
                          {_l('自动转换为邮件兼容格式')}
                          {autoConvertForEmailLoading && (
                            <span style={{ color: 'var(--color-text-primary)' }}>{_l('(转换中...)')}</span>
                          )}
                        </Fragment>
                      }
                      onClick={() => this.handleAutoConvertForEmailClick(item, i)}
                    />
                    {autoConvertForEmailEnabled && data.mjmlValue && (
                      <Fragment>
                        <span
                          className="colorPrimary pointer mLeft10"
                          onClick={() =>
                            this.setState({
                              showMjmlReadonlyDialog: true,
                              mjmlReadonlyValue: data.mjmlValue,
                            })
                          }
                        >
                          {_l('查看转换后的邮件效果')}
                        </span>

                        <Tooltip
                          title={_l(
                            '为提升邮件兼容性，富文本内容将在发送时转换为邮件兼容格式，部分复杂样式可能无法完全保留，请预览确认最终效果。',
                          )}
                        >
                          <i className="icon-info Font16 mLeft5 textTertiary" />
                        </Tooltip>
                      </Fragment>
                    )}
                  </div>
                </Fragment>
              ) : (
                <SingleControlValue
                  key={cacheKey + i}
                  companyId={this.props.companyId}
                  relationId={this.props.relationId}
                  processId={this.props.processId}
                  selectNodeId={this.props.selectNodeId}
                  controls={data.controls}
                  formulaMap={data.formulaMap}
                  fields={data.fields}
                  updateSource={this.updateSource}
                  item={item}
                  i={i}
                />
              )}
            </div>
          );
        })}
        {showMJMLEditorDialog && data.fields[mjmlEditIndex] && (
          <MJMLEditorDialog
            value={data.mjmlValue}
            html={data.mjmlHtml}
            formulaMap={data.formulaMap}
            convertMjml={this.convertMjml}
            onFieldsClick={this.insertFields}
            onFieldInsert={this.handleMJMLFieldInsert}
            fieldsPanel={
              fieldsVisible && !!fieldsData.length ? (
                <ActionFields
                  className="actionFields"
                  openSearch
                  style={{ marginTop: -8 }}
                  title={_l('点击插入节点对象代码')}
                  noItemTips={_l('没有可用的字段')}
                  noData={_l('没有可用的节点对象')}
                  condition={fieldsData}
                  onClose={() => this.setState({ fieldsVisible: false })}
                />
              ) : null
            }
            onOk={(mjmlValue, html) => {
              const fields = [].concat(data.fields);

              fields[mjmlEditIndex] = {
                ...fields[mjmlEditIndex],
                fieldValue: mjmlValue,
              };

              this.updateSource(
                {
                  fields,
                  mjmlValue,
                  mjmlHtml: html,
                },
                () => this.setState({ showMJMLEditorDialog: false, mjmlEditIndex: -1 }),
              );
            }}
            onCancel={() => this.setState({ showMJMLEditorDialog: false, mjmlEditIndex: -1 })}
          />
        )}
        {showMjmlReadonlyDialog && (
          <MJMLEditorDialog
            readOnly
            title={_l('查看转换后的邮件效果')}
            value={mjmlReadonlyValue}
            formulaMap={data.formulaMap}
            convertMjml={this.convertMjml}
            onCancel={() => this.setState({ showMjmlReadonlyDialog: false })}
          />
        )}
      </Fragment>
    );
  }

  /**
   * 插入字段
   */
  insertFields = () => {
    const { processId, selectNodeId } = this.props;

    if (!this.state.fieldsData.length) {
      const interfaceFunc = obj =>
        flowNode.getFlowNodeAppDtos({
          ...obj,
          processId,
          type: 2,
        });

      interfaceFunc({ nodeId: selectNodeId }).then(result => {
        const fieldsData = result.map(obj => {
          return {
            text: obj.nodeName,
            id: obj.nodeId,
            nodeTypeId: obj.nodeTypeId,
            appName: obj.appName,
            appType: obj.appType,
            appTypeName: obj.appTypeName,
            actionId: obj.actionId,
            nAlias: obj.alias,
            toolsFunction: () => interfaceFunc({ nodeId: obj.nodeId, tool: true }),
            items: obj.controls.map(o => {
              return {
                type: o.type,
                value: o.controlId,
                field: getControlTypeName(o),
                text: o.controlName,
                cAlias: o.alias,
              };
            }),
          };
        });
        this.setState({ fieldsData, fieldsVisible: true });
      });
    } else {
      this.setState({ fieldsVisible: true });
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
          icon="icon-workflow_email"
          bg="BGBlue"
          updateSource={this.updateSource}
        />
        <div className="flex overflowHidden">
          <ScrollView>
            <div className="workflowDetailBox">{this.renderContent()}</div>
          </ScrollView>
        </div>
        <DetailFooter
          {...this.props}
          isCorrect={!!data.accounts.length && !_.isEqual(data, this.cacheResult)}
          onSave={this.onSave}
        />
      </Fragment>
    );
  }
}

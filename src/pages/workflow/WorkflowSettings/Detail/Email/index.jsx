import React, { Component, Fragment } from 'react';
import { ScrollView, LoadDiv, Dropdown, Radio, RichText } from 'ming-ui';
import { NODE_TYPE, ACTION_ID, CONTROLS_NAME } from '../../enum';
import flowNode from '../../../api/flowNode';
import {
  Member,
  SelectUserDropDown,
  SingleControlValue,
  DetailHeader,
  DetailFooter,
  ActionFields,
} from '../components';
import copy from 'copy-to-clipboard';

export default class Email extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      saveRequest: false,
      showSelectUserDialog: false,
      cacheKey: +new Date(),
      showSelectCCUserDialog: false,
      fieldsVisible: false,
      fieldsData: [],
    };
  }

  componentDidMount() {
    this.mounted = true;
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

  componentWillUnmount() {
    this.mounted = false;
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
    const { processId, selectNodeId, selectNodeType } = props;

    flowNode.getNodeDetail({ processId, nodeId: selectNodeId, flowNodeType: selectNodeType }).then(result => {
      this.setState({ data: result, cacheKey: +new Date() });
      if (!result.fields.length) {
        this.genFields(result);
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

  /**
   * 保存
   */
  onSave = () => {
    const { data, saveRequest } = this.state;
    const { name, fields, actionId, appType, accounts, ccAccounts } = data;
    let hasError = false;

    if (!accounts.length) {
      alert(_l('必须先选择一个发送人'), 2);
      return;
    }

    if (saveRequest) {
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
    const { data, showSelectUserDialog, cacheKey, showSelectCCUserDialog, fieldsVisible, fieldsData } = this.state;
    const list = [
      { text: _l('标准（支持抄送，每个收件人都可以看到所有收件人和抄送人）'), value: ACTION_ID.SEND_EMAIL },
      {
        text: _l('群发单显（采用一对一单独发送，每个收件人只能看到自己的地址）'),
        value: ACTION_ID.SEND_EMAIL_SINGLE_DISPLAY,
      },
    ];
    const contentTypes = [{ text: _l('纯文本'), value: 0 }, { text: _l('富文本（支持html样式）'), value: 1 }];

    return (
      <Fragment>

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

        <div className="mTop20 bold">{_l('收件人')}</div>
        <Member accounts={data.accounts} updateSource={this.updateSource} />
        <div
          className="flexRow mTop15 ThemeColor3 workflowDetailAddBtn"
          onClick={() => this.setState({ showSelectUserDialog: true })}
        >
          <i className="Font28 icon-task-add-member-circle mRight10" />
          {_l('选择人员、邮箱地址或输入邮箱')}
          <SelectUserDropDown
            appId={this.props.relationType === 2 ? this.props.relationId : ''}
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
              accounts={data.ccAccounts}
              updateSource={({ accounts }) => this.updateSource({ ccAccounts: accounts })}
            />
            <div
              className="flexRow mTop15 ThemeColor3 workflowDetailAddBtn"
              onClick={() => this.setState({ showSelectCCUserDialog: true })}
            >
              <i className="Font28 icon-task-add-member-circle mRight10" />
              {_l('选择人员、邮箱地址或输入邮箱')}
              <SelectUserDropDown
                appId={this.props.relationType === 2 ? this.props.relationId : ''}
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

        {data.fields.map((item, i) => {
          const singleObj = _.find(data.controls, obj => obj.controlId === item.fieldId);

          return (
            <div key={i} className="relative">
              <div className="mTop15 ellipsis Font13 bold">
                {singleObj.controlName}
                {singleObj.required && <span className="mLeft5 red">*</span>}
              </div>
              {item.fieldId === 'attachments' && <div className="mTop5 Gray_75">{_l('附件总大小不超过50M')}</div>}

              {item.fieldId === 'content' && (
                <div className="flexRow mTop10 relative">
                  {contentTypes.map((obj, j) => (
                    <div className="flex" key={j}>
                      <Radio
                        text={obj.text}
                        checked={!!obj.value === item.isRichText}
                        onClick={() => {
                          let newFields = [].concat(data.fields);

                          newFields[i].isRichText = !!obj.value;
                          newFields[i].fieldValue = '';
                          this.updateSource({ fields: newFields });
                        }}
                      />
                    </div>
                  ))}
                  <div
                    className="pointer Gray_75 ThemeHoverColor3 mLeft30"
                    onClick={this.insertFields}
                    style={{ visibility: item.isRichText ? 'visible' : 'hidden' }}
                  >
                    <i className="icon-workflow_other Font14" />
                    {_l('节点对象')}
                  </div>
                  {fieldsVisible && !!fieldsData.length && (
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
                        copy(`#{${nAlias || nodeId}.${cAlias || fieldValueId}}`);
                        alert(_l('已复制'));
                      }}
                      onClose={() => this.setState({ fieldsVisible: false })}
                    />
                  )}
                </div>
              )}

              {item.fieldId === 'content' && item.isRichText ? (
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

                      newFields[i].fieldValue = value;
                      this.updateSource({ fields: newFields });
                    }}
                  />
                </Fragment>
              ) : (
                <SingleControlValue
                  key={cacheKey + i}
                  companyId={this.props.companyId}
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
      </Fragment>
    );
  }

  /**
   * 插入字段
   */
  insertFields = () => {
    const { processId, selectNodeId } = this.props;

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
              nAlias: obj.alias,
              items: obj.controls.map(o => {
                return {
                  type: o.type,
                  value: o.controlId,
                  field: CONTROLS_NAME[o.type],
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
        <div className="flex mTop20">
          <ScrollView>
            <div className="workflowDetailBox">{this.renderContent()}</div>
          </ScrollView>
        </div>
        <DetailFooter {...this.props} isCorrect={!!data.accounts.length} onSave={this.onSave} />
      </Fragment>
    );
  }
}

import React, { Component, Fragment } from 'react';
import { ScrollView, LoadDiv } from 'ming-ui';
import { APP_TYPE, ACTION_ID } from '../../enum';
import flowNode from '../../../api/flowNode';
import { DetailHeader, DetailFooter } from '../components';
import UpdateSheetRecord from './UpdateSheetRecord';
import CreateRecordAndTask from './CreateRecordAndTask';
import DeleteNodeObj from './DeleteNodeObj';
import RelationFields from './RelationFields';
import { checkConditionsIsNull } from '../../utils';
import _ from 'lodash';

export default class Action extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      saveRequest: false,
      cacheKey: +new Date(),
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
   * 获取动作详情
   */
  getNodeDetail(props, autoObjType) {
    const { processId, selectNodeId, selectNodeType } = props;

    flowNode
      .getNodeDetail({ processId, nodeId: selectNodeId, flowNodeType: selectNodeType, autoObjType })
      .then(result => {
        this.setState({ data: result, cacheKey: +new Date() });
      });
  }

  /**
   * 获取自定义字段
   */
  getAppTemplateControls = (selectNodeId, appId) => {
    const { data } = this.state;

    flowNode
      .getAppTemplateControls({
        processId: this.props.processId,
        nodeId: this.props.selectNodeId,
        selectNodeId,
        appId,
        appType: data.appType,
      })
      .then(result => {
        this.updateSource({ controls: result }, () => {
          if (data.actionId === ACTION_ID.ADD) {
            this.changeFields(result);
          }
        });
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
  onSave = () => {
    const { data, saveRequest } = this.state;
    const {
      name,
      selectNodeId,
      appId,
      appType,
      fields,
      actionId,
      sourceAppId,
      sourceAppType,
      conditions,
      sorts,
      executeType,
      random,
    } = data;
    let hasError = false;

    if (actionId === ACTION_ID.ADD && !appId) {
      alert(_l('必须先选择一个工作表'), 2);
      return;
    } else if (actionId !== ACTION_ID.ADD && !selectNodeId && appType !== APP_TYPE.PROCESS) {
      alert(_l('必须先选择一个对象'), 2);
      return;
    }

    if (checkConditionsIsNull(conditions)) {
      alert(_l('筛选条件的判断值不能为空'), 2);
      return;
    }

    if (saveRequest) {
      return;
    }

    // 新增验证必填项
    if (actionId === ACTION_ID.ADD) {
      data.controls.forEach(item => {
        if (item.required || _.includes(['portal_mobile', 'portal_role'], item.controlId)) {
          fields.forEach(o => {
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
    }

    flowNode
      .saveNode({
        processId: this.props.processId,
        nodeId: this.props.selectNodeId,
        flowNodeType: this.props.selectNodeType,
        actionId,
        name: name.trim(),
        selectNodeId,
        appId,
        appType,
        fields,
        sourceAppId,
        sourceAppType,
        operateCondition: conditions,
        sorts,
        executeType,
        random,
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
    const { data, cacheKey } = this.state;

    // 新增工作表记录 || 创建任务 || 邀请外部用户
    if (data.actionId === ACTION_ID.ADD) {
      return (
        <CreateRecordAndTask
          key={cacheKey}
          {...this.props}
          data={data}
          SelectNodeObjectChange={this.SelectNodeObjectChange}
          updateSource={this.updateSource}
          getAppTemplateControls={this.getAppTemplateControls}
        />
      );
    }

    // 修改工作表记录 || 更新外部用户信息
    if (data.actionId === ACTION_ID.EDIT) {
      return (
        <UpdateSheetRecord
          key={cacheKey}
          {...this.props}
          data={data}
          SelectNodeObjectChange={this.SelectNodeObjectChange}
          updateSource={this.updateSource}
        />
      );
    }

    // 关联他表字段
    if (data.actionId === ACTION_ID.RELATION) {
      return (
        <RelationFields
          key={cacheKey}
          {...this.props}
          data={data}
          SelectNodeObjectChange={this.SelectNodeObjectChange}
          updateSource={this.updateSource}
        />
      );
    }

    /**
     * 删除节点对象
     */
    if (data.actionId === ACTION_ID.DELETE) {
      return <DeleteNodeObj data={data} SelectNodeObjectChange={this.SelectNodeObjectChange} />;
    }
  }
  /**
   * 下拉框更改
   */
  SelectNodeObjectChange = (selectNodeId, addFields) => {
    const { data } = this.state;
    const selectNodeObj = _.find(data.flowNodeList, item => item.nodeId === selectNodeId);

    this.updateSource(
      {
        selectNodeId,
        selectNodeObj,
        controls: [],
        fields: addFields
          ? [
              {
                fieldId: '',
                type: 0,
                fieldValue: '',
                fieldValueId: '',
                nodeId: '',
              },
            ]
          : [],
      },
      () => {
        if (data.actionId !== ACTION_ID.DELETE) {
          this.getAppTemplateControls(selectNodeId, selectNodeObj.appId);
        }
      },
    );
  };

  /**
   * 修改选中的字段
   */
  changeFields = controls => {
    const fields = [];

    /**
     * 对contorls以是否为关联他表字段排序
     */
    const relationList = controls.filter(v => v.type === 29);
    const otherList = controls.filter(v => v.type !== 29);
    const sortedList = [].concat(otherList, relationList);

    sortedList.forEach(item => {
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
   * 获取图标
   */
  getIcon = data => {
    const { appType, actionId } = data;
    const { TASK, PROCESS, EXTERNAL_USER } = APP_TYPE;
    const { EDIT, ADD, RELATION, DELETE } = ACTION_ID;

    if (appType === TASK) {
      return 'icon-custom_assignment';
    } else if (appType === PROCESS) {
      return 'icon-parameter';
    } else {
      if (actionId === EDIT) {
        return appType === EXTERNAL_USER ? 'icon-update_information' : 'icon-workflow_update';
      }
      if (actionId === ADD) {
        return appType === EXTERNAL_USER ? 'icon-invited_users' : 'icon-workflow_new';
      }
      if (actionId === RELATION) {
        return 'icon-workflow_search';
      }
      if (actionId === DELETE) {
        return 'icon-hr_delete';
      }
    }
  };

  render() {
    const { data } = this.state;
    const bgClassName = data.appType === APP_TYPE.TASK ? 'BGGreen' : 'BGYellow';

    if (_.isEmpty(data)) {
      return <LoadDiv className="mTop15" />;
    }

    return (
      <Fragment>
        <DetailHeader
          {...this.props}
          data={{ ...data }}
          icon={this.getIcon(data)}
          bg={bgClassName}
          updateSource={this.updateSource}
        />
        <div className="flex mTop20">
          <ScrollView>
            <div className="workflowDetailBox">
              {this.renderContent()}

              {((!data.selectNodeId &&
                !data.appId &&
                data.actionId !== ACTION_ID.DELETE &&
                data.appType !== APP_TYPE.PROCESS) ||
                (data.actionId === ACTION_ID.EDIT &&
                  data.selectNodeId &&
                  !data.selectNodeObj.nodeName &&
                  !data.selectNodeObj.appName) ||
                (data.actionId === ACTION_ID.ADD &&
                  data.appType !== APP_TYPE.EXTERNAL_USER &&
                  ((data.appId && !_.find(data.appList, item => item.id === data.appId)) || !data.appId))) && (
                <div className="Gray_9e Font13 flexRow flowDetailTips">
                  <i className="icon-task-setting_promet Font16" />
                  <div className="flex mLeft10">{_l('必须先选择一个对象后，才能设置可执行的动作')}</div>
                </div>
              )}

              {data.actionId === ACTION_ID.EDIT &&
                data.selectNodeId &&
                data.selectNodeObj.nodeName &&
                !data.selectNodeObj.appName && (
                  <div className="Gray_9e Font13 flexRow flowDetailTips">
                    <i className="icon-task-setting_promet Font16" />
                    <div
                      className="flex mLeft10"
                      dangerouslySetInnerHTML={{
                        __html: _l(
                          '节点所使用的数据来源%0中的应用数据实体已删除。必须修复此节点中的错误，或重新指定一个有效的节点对象后才能设置可执行的动作',
                          `<span class="mLeft5 mRight5 flowDetailTipsColor">“${data.selectNodeObj.nodeName}”</span>`,
                        ),
                      }}
                    />
                  </div>
                )}
            </div>
          </ScrollView>
        </div>
        <DetailFooter
          {...this.props}
          isCorrect={
            (data.actionId === ACTION_ID.ADD && data.appId) ||
            ((data.actionId === ACTION_ID.EDIT ||
              data.actionId === ACTION_ID.DELETE ||
              data.actionId === ACTION_ID.RELATION) &&
              data.selectNodeId) ||
            data.appType === APP_TYPE.PROCESS
          }
          onSave={this.onSave}
        />
      </Fragment>
    );
  }
}

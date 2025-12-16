import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import { LoadDiv, ScrollView } from 'ming-ui';
import flowNode from '../../../api/flowNode';
import { ACTION_ID, APP_TYPE } from '../../enum';
import { checkConditionsIsNull, getIcons } from '../../utils';
import { DetailFooter, DetailHeader } from '../components';
import CreateCalendar from './CreateCalendar';
import CreateRecordAndTask from './CreateRecordAndTask';
import DeleteNodeObj from './DeleteNodeObj';
import RefreshData from './RefreshData';
import RelationFields from './RelationFields';
import UpdateGlobalVariable from './UpdateGlobalVariable';
import UpdateSheetRecord from './UpdateSheetRecord';

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

  componentWillReceiveProps(nextProps) {
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
  getNodeDetail(props, sId) {
    const { processId, selectNodeId, selectNodeType, isApproval, instanceId } = props;

    flowNode
      .getNodeDetail({ processId, nodeId: selectNodeId, flowNodeType: selectNodeType, selectNodeId: sId, instanceId })
      .then(result => {
        if (result.appType === APP_TYPE.CALENDAR) {
          result.fields = this.handleCalendarDefault(result.fields);
        }

        this.setState({ data: result, cacheKey: +new Date() }, () => {
          if (isApproval && !result.selectNodeId) {
            this.SelectNodeObjectChange(result.flowNodeList[0].nodeId);
          }
        });
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
      destroy,
      filters = [],
    } = data;
    let hasError = false;

    if (actionId === ACTION_ID.ADD && !appId && appType !== APP_TYPE.CALENDAR) {
      alert(_l('必须先选择一个表'), 2);
      return;
    } else if (
      actionId !== ACTION_ID.ADD &&
      !selectNodeId &&
      !_.includes([APP_TYPE.PROCESS, APP_TYPE.CALENDAR], data.appType)
    ) {
      alert(_l('必须先选择一个对象'), 2);
      return;
    }

    if (checkConditionsIsNull(conditions)) {
      alert(_l('筛选条件的判断值不能为空'), 2);
      return;
    }

    // 新增验证必填项
    if (_.includes([ACTION_ID.ADD, ACTION_ID.CREATE_FILE], actionId)) {
      data.controls.forEach(item => {
        if (item.required || _.includes(['portal_role'], item.controlId)) {
          fields.forEach(o => {
            if (item.controlId === o.fieldId && !o.nodeId && !o.fieldValue && !o.fieldValueId) {
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

    if (filters.length) {
      filters.forEach(item => {
        if (checkConditionsIsNull(item.conditions)) {
          hasError = true;
        }
      });

      if (hasError) {
        alert(_l('筛选条件的判断值不能为空'), 2);
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
        selectNodeId,
        appId,
        appType,
        fields: appType === APP_TYPE.CALENDAR ? this.handleCalendarDefault(fields) : fields,
        sourceAppId,
        sourceAppType,
        operateCondition: conditions,
        sorts,
        executeType,
        random,
        destroy,
        filters,
      })
      .then(result => {
        this.props.updateNodeData(result);
        this.props.closeDetail();
      });

    this.setState({ saveRequest: true });
  };

  /**
   * 处理日程默认值
   */
  handleCalendarDefault(fields) {
    return fields.map(item => {
      if (
        _.includes(['is_all_day', 'is_private', 'create_file'], item.fieldId) &&
        !item.fieldValue &&
        !item.fieldValueId
      ) {
        item.fieldValue = '0';
      }

      if (item.fieldId === 'remind_time' && !item.fieldValue && !item.fieldValueId) {
        item.fieldValue = '15';
      }

      return item;
    });
  }

  /**
   * 渲染内容
   */
  renderContent() {
    const { data, cacheKey } = this.state;

    // 创建日程
    if (data.appType === APP_TYPE.CALENDAR) {
      return <CreateCalendar key={cacheKey} {...this.props} data={data} updateSource={this.updateSource} />;
    }

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

    /**
     * 更新全局变量
     */
    if (data.appType === APP_TYPE.GLOBAL_VARIABLE) {
      return <UpdateGlobalVariable {...this.props} data={data} updateSource={this.updateSource} />;
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
      return (
        <DeleteNodeObj
          data={data}
          SelectNodeObjectChange={this.SelectNodeObjectChange}
          updateSource={this.updateSource}
        />
      );
    }

    /**
     * 校准单条数据
     */
    if (data.actionId === ACTION_ID.REFRESH_SINGLE_DATA) {
      return (
        <RefreshData
          data={data}
          SelectNodeObjectChange={this.SelectNodeObjectChange}
          updateSource={this.updateSource}
        />
      );
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

  render() {
    const { selectNodeType } = this.props;
    const { data } = this.state;
    const bgClassName = _.includes([APP_TYPE.PROCESS, APP_TYPE.GLOBAL_VARIABLE], data.appType)
      ? 'BGBlueAsh'
      : data.appType === APP_TYPE.TASK || data.actionId === ACTION_ID.REFRESH_SINGLE_DATA
        ? 'BGGreen'
        : data.appType === APP_TYPE.CALENDAR
          ? 'BGRed'
          : 'BGYellow';

    if (_.isEmpty(data)) {
      return <LoadDiv className="mTop15" />;
    }

    return (
      <Fragment>
        <DetailHeader
          {...this.props}
          data={{ ...data }}
          icon={getIcons(selectNodeType, data.appType, data.actionId)}
          bg={bgClassName}
          updateSource={this.updateSource}
        />
        <div className="flex overflowHidden">
          <ScrollView>
            <div className="workflowDetailBox">
              {this.renderContent()}

              {((!data.selectNodeId &&
                !data.appId &&
                !_.includes([ACTION_ID.DELETE, ACTION_ID.REFRESH_SINGLE_DATA], data.actionId) &&
                !_.includes([APP_TYPE.PROCESS, APP_TYPE.CALENDAR], data.appType)) ||
                (data.actionId === ACTION_ID.EDIT &&
                  data.selectNodeId &&
                  !data.selectNodeObj.nodeName &&
                  !data.selectNodeObj.appName) ||
                (data.actionId === ACTION_ID.ADD &&
                  !_.includes([APP_TYPE.EXTERNAL_USER, APP_TYPE.CALENDAR], data.appType) &&
                  ((data.appId && !_.find(data.appList, item => item.id === data.appId)) || !data.appId))) && (
                <div className="Gray_75 Font13 flexRow flowDetailTips">
                  <i className="icon-error1 Font16 Gray_9e" />
                  <div className="flex mLeft10">{_l('必须先选择一个对象后，才能设置可执行的动作')}</div>
                </div>
              )}

              {data.actionId === ACTION_ID.EDIT &&
                data.selectNodeId &&
                data.selectNodeObj.nodeName &&
                !data.selectNodeObj.appName && (
                  <div className="Gray_75 Font13 flexRow flowDetailTips">
                    <i className="icon-error1 Font16 Gray_9e" />
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
            (_.includes(
              [ACTION_ID.EDIT, ACTION_ID.DELETE, ACTION_ID.RELATION, ACTION_ID.REFRESH_SINGLE_DATA],
              data.actionId,
            ) &&
              data.selectNodeId) ||
            _.includes([APP_TYPE.PROCESS, APP_TYPE.CALENDAR], data.appType)
          }
          onSave={this.onSave}
        />
      </Fragment>
    );
  }
}

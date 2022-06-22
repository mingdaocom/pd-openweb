import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import './index.less';
import flowNode from '../../../../api/flowNode';
import ActionFields from '../ActionFields';
import { CONTROLS_NAME, APP_TYPE } from '../../../enum';
import { MenuItem } from 'ming-ui';

export default class SelectOtherFields extends Component {
  static propTypes = {
    isFilter: PropTypes.bool,
    sourceNodeId: PropTypes.string,
    fieldsVisible: PropTypes.bool,
    showClear: PropTypes.bool,
    processId: PropTypes.string,
    selectNodeId: PropTypes.string,
    sourceAppId: PropTypes.string,
    conditionId: PropTypes.string,
    dataSource: PropTypes.string,
    handleFieldClick: PropTypes.func,
    openLayer: PropTypes.func,
    closeLayer: PropTypes.func,
    item: PropTypes.shape({
      fieldValueId: PropTypes.string,
      type: PropTypes.number,
      enumDefault: PropTypes.number,
    }),
  };

  static defaultProps = {
    isFilter: false,
    sourceAppId: '',
    sourceNodeId: '',
    showClear: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      fieldsData: null,
    };
  }

  componentWillReceiveProps(nextProps, nextState) {
    if (!_.isEqual(nextProps.item, this.props.item) || nextProps.sourceAppId !== this.props.sourceAppId) {
      this.setState({ fieldsData: null });
    }
  }

  /**
   * 获取更多控件的值
   */
  getFlowNodeAppDtos() {
    const { isFilter, processId, selectNodeId, sourceAppId, item, sourceNodeId, conditionId, dataSource } = this.props;

    flowNode[isFilter ? 'getFlowAppDtos' : 'getFlowNodeAppDtos']({
      processId,
      nodeId: selectNodeId,
      sourceAppId,
      type: item.type,
      enumDefault: item.enumDefault,
      selectNodeId: sourceNodeId,
      conditionId,
      dataSource,
    }).then(result => {
      const fieldsData = result.map(obj => {
        return {
          text: obj.nodeName,
          id: obj.nodeId,
          nodeTypeId: obj.nodeTypeId,
          appName: obj.appName,
          appType: obj.appType,
          appTypeName: obj.appTypeName,
          actionId: obj.actionId,
          isSourceApp: obj.isSourceApp,
          items: obj.controls.map(o => {
            return {
              type: o.type,
              value: o.controlId,
              field: CONTROLS_NAME[o.type],
              text:
                obj.appType === APP_TYPE.WEBHOOK
                  ? `[${o.enumDefault === 0 ? 'Body' : 'Header'}] ${o.controlName}`
                  : o.controlName,
            };
          }),
        };
      });
      this.setState({ fieldsData });
    });
  }

  /**
   * 渲染其他字段层
   */
  renderOtherFieldsBox() {
    const { item, fieldsVisible, handleFieldClick, closeLayer, showClear } = this.props;
    const { fieldsData } = this.state;

    if (!fieldsVisible || !_.isArray(fieldsData)) {
      return null;
    }

    return (
      <ActionFields
        className="actionFields"
        openSearch
        footer={showClear && this.footer()}
        noItemTips={_l('没有可用的字段')}
        noData={_l('没有可用的节点对象')}
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
          isSourceApp,
        }) => {
          handleFieldClick({
            nodeId,
            fieldValueId,
            nodeName,
            fieldValueName,
            fieldValue: item.type === 26 || item.type === 27 ? '[]' : '',
            fieldValueType,
            nodeTypeId,
            appType,
            actionId,
            isSourceApp,
          });
          closeLayer();
        }}
        onClose={closeLayer}
      />
    );
  }

  /**
   * 尾部
   */
  footer() {
    return (
      <ul
        className="flowDetailUserList clearAllFields"
        style={{ borderTopWidth: 1, borderTopStyle: 'solid', borderColor: '#ccc' }}
      >
        <MenuItem
          icon={<i className="icon-workflow_empty" />}
          onClick={() => {
            this.props.handleFieldClick({
              fieldValue: '',
              nodeId: '',
              fieldValueId: '',
              nodeName: '',
              fieldValueName: '',
              fieldValueType: '',
              nodeTypeId: null,
              appType: null,
              actionId: '',
              isSourceApp: '',
              isClear: true,
            });
          }}
        >
          {_l('清空')}
        </MenuItem>
      </ul>
    );
  }

  render() {
    const { item, openLayer } = this.props;

    return (
      <Fragment>
        <div
          className="actionControlMore ThemeColor3 tip-bottom-left"
          data-tip={_l('使用本流程节点对象的值')}
          onClick={() => {
            openLayer();
            this.getFlowNodeAppDtos(item.type, item.enumDefault);
          }}
        >
          <i
            className={
              item.fieldValueId || /\$.*\$/.test(item.fieldValue)
                ? 'icon-workflow_ok ThemeColor3'
                : 'icon-workflow_other'
            }
          />
        </div>
        {this.renderOtherFieldsBox()}
      </Fragment>
    );
  }
}

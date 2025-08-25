import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { MenuItem } from 'ming-ui';
import flowNode from '../../../../api/flowNode';
import SelectGlobalVar from 'src/pages/Admin/app/globalVariable/components/SelectGlobalVarDialog';
import { APP_TYPE, GLOBAL_VARIABLE, NODE_TYPE } from '../../../enum';
import { getControlTypeName } from '../../../utils';
import ActionFields from '../ActionFields';
import './index.less';

export default class SelectOtherFields extends Component {
  static propTypes = {
    isFilter: PropTypes.bool,
    sourceNodeId: PropTypes.string,
    fieldsVisible: PropTypes.bool,
    showClear: PropTypes.bool,
    showCurrent: PropTypes.bool,
    projectId: PropTypes.string,
    processId: PropTypes.string,
    relationId: PropTypes.string,
    selectNodeId: PropTypes.string,
    sourceAppId: PropTypes.string,
    isIntegration: PropTypes.bool,
    isPlugin: PropTypes.bool,
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
    disabledInterface: PropTypes.bool,
    filterType: PropTypes.number,
  };

  static defaultProps = {
    isFilter: false,
    sourceAppId: '',
    sourceNodeId: '',
    isIntegration: false,
    isPlugin: false,
    showClear: false,
    showCurrent: false,
    disabledInterface: false,
    filterType: 0,
  };

  constructor(props) {
    super(props);
    this.state = {
      fieldsData: null,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.item, this.props.item) || nextProps.sourceAppId !== this.props.sourceAppId) {
      this.setState({ fieldsData: null });
    }
  }

  /**
   * 获取更多控件的值
   */
  getFlowNodeAppDtos() {
    const {
      isFilter,
      processId,
      selectNodeId,
      sourceAppId,
      item,
      sourceNodeId,
      conditionId,
      dataSource,
      isIntegration,
      showCurrent,
      disabledInterface,
      filterType,
    } = this.props;

    // 禁止获取其他动态值
    if (disabledInterface) {
      this.setState({ fieldsData: [] });
      return;
    }

    flowNode[isFilter ? 'getFlowAppDtos' : 'getFlowNodeAppDtos'](
      {
        processId,
        nodeId: selectNodeId,
        sourceAppId,
        type: item.type,
        enumDefault: item.enumDefault,
        selectNodeId: sourceNodeId,
        conditionId,
        dataSource,
        current: showCurrent,
        filterType,
      },
      { isIntegration },
    ).then(result => {
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
              field: getControlTypeName(o),
              text:
                obj.appType === APP_TYPE.WEBHOOK
                  ? `[${o.enumDefault === 0 ? 'Body' : o.enumDefault === 1001 ? 'Params' : 'Header'}] ${o.controlName}`
                  : o.controlName,
              sourceType: o.sourceControlType,
            };
          }),
        };
      });
      this.setState({ fieldsData });
    });
  }

  /**
   * 头部
   */
  header() {
    const { projectId, relationId, item, handleFieldClick, closeLayer, isIntegration, isPlugin } = this.props;
    let filterTypes = [];

    if (!_.includes([1, 2, 3, 4, 5, 6, 7, 8, 33, 41], item.type) || isIntegration || isPlugin) return null;

    if (_.includes([6, 8], item.type)) {
      filterTypes = [6];
    }

    return (
      <ul className="flowDetailUserList">
        <MenuItem
          icon={<i className="icon-global_variable" />}
          onClick={() => {
            SelectGlobalVar({
              projectId,
              appId: relationId,
              filterTypes,
              onOk: ({ id, controlType, name, sourceType }) => {
                handleFieldClick({
                  nodeId: GLOBAL_VARIABLE,
                  fieldValueId: id,
                  nodeName: _l('全局变量'),
                  fieldValueName: name,
                  fieldValue: item.type === 26 || item.type === 27 ? '[]' : '',
                  fieldValueType: controlType,
                  nodeTypeId: NODE_TYPE.SYSTEM,
                  appType: APP_TYPE.GLOBAL_VARIABLE,
                  actionId: '',
                  isSourceApp: false,
                  sourceType,
                });
              },
            });
            closeLayer();
          }}
        >
          {_l('全局变量')}
        </MenuItem>
      </ul>
    );
  }

  /**
   * 渲染其他字段层
   */
  renderOtherFieldsBox() {
    const { item, fieldsVisible, handleFieldClick, closeLayer, showClear, disabledInterface } = this.props;
    const { fieldsData } = this.state;

    if (!fieldsVisible || !_.isArray(fieldsData)) {
      return null;
    }

    return (
      <ActionFields
        header={this.header()}
        className="actionFields"
        openSearch={!disabledInterface}
        footer={showClear && this.footer()}
        noItemTips={_l('没有可用的字段')}
        noData={!disabledInterface && _l('没有可用的节点对象')}
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
          sourceType,
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
            sourceType,
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
    const { item, disabledInterface } = this.props;

    return (
      <ul className={cx('flowDetailUserList clearAllFields', { BorderTopGrayC: !disabledInterface })}>
        <MenuItem
          icon={<i className="icon-workflow_empty" />}
          onClick={() => {
            this.props.handleFieldClick({
              fieldValue: item.type === 26 || item.type === 27 ? '[]' : '',
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

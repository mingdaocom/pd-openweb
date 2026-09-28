import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { LoadDiv } from 'ming-ui';
import { Button, Modal, Select } from 'ming-ui/antd-components';
import processVersion from '../../api/processVersion';
import ajaxRequest from 'src/api/appManagement';
import '../SelectUsersFromApp/index.less';

export default class SelectProcess extends Component {
  static propTypes = {
    appId: PropTypes.string,
    companyId: PropTypes.string.isRequired,
    processListType: PropTypes.string.isRequired,
    filterProcessId: PropTypes.string,
    onOk: PropTypes.func,
    onCancel: PropTypes.func,
  };

  static defaultProps = {
    appId: '',
    onOk: () => {},
    onCancel: () => {},
  };

  constructor(props) {
    super(props);

    this.state = {
      selectAppId: props.appId,
      selectProcessId: '',
      appList: null,
      processList: [],
    };
  }

  componentDidMount() {
    const { selectAppId } = this.state;

    this.getAppList();

    if (selectAppId) {
      this.getProcessByApp(selectAppId);
    }
  }

  /**
   * 获取所有的应用
   */
  getAppList() {
    const { selectAppId } = this.state;

    ajaxRequest.getManagerApps({ projectId: this.props.companyId }).then(result => {
      result = result.map(({ appId, appName }) => {
        if (selectAppId === appId) {
          appName += _l('（本应用）');
        }

        return {
          value: appId,
          label: appName,
        };
      });

      this.setState({ appList: result });

      if (!selectAppId && result.length) {
        this.setState({ selectAppId: result[0].value });
        this.getProcessByApp(result[0].value);
      }
    });
  }

  /**
   * 根据应用获取流程
   */
  getProcessByApp(appId) {
    const { processListType, filterProcessId } = this.props;

    processVersion.list({ relationId: appId, processListType }).then(data => {
      const processList = [];

      data.forEach(item => {
        item.processList
          .filter(
            item =>
              (processListType !== 13 || (processListType === 13 && item.triggerId)) && item.id !== filterProcessId,
          )
          .forEach(({ id, name, triggerId }) => {
            processList.push({
              value: id,
              label: name,
              triggerId,
            });
          });
      });

      this.setState({ processList });
    });
  }

  /**
   * 渲染内容
   */
  renderContent() {
    const { onOk, onCancel, processListType } = this.props;
    const { selectAppId, selectProcessId, appList, processList } = this.state;

    return (
      <Fragment>
        <div className="formItem flexRow mTop10">
          <div className="label">{_l('应用')}</div>
          <div className="content">
            <Select
              className="w100"
              placeholder={_l('请选择')}
              notFoundContent={_l('没有可选的应用')}
              showSearch
              optionFilterProp="label"
              value={selectAppId || undefined}
              options={appList}
              onChange={id => {
                this.setState({ selectAppId: id, selectProcessId: '' });
                this.getProcessByApp(id);
              }}
            />
          </div>
        </div>
        <div className="formItem flexRow mTop15">
          <div className="label">{processListType === 11 ? _l('审批流程') : _l('循环流程')}</div>
          <div className="content">
            <Select
              className="w100"
              placeholder={_l('请选择')}
              notFoundContent={processListType === 11 ? _l('没有可选的审批流程') : _l('没有可选的循环流程')}
              showSearch
              optionFilterProp="label"
              value={selectProcessId || undefined}
              options={processList}
              onChange={id => this.setState({ selectProcessId: id })}
            />
          </div>
        </div>
        <div className="btns TxtRight mTop20">
          <Button color="primary" variant="link" onClick={onCancel}>
            {_l('取消')}
          </Button>
          <Button
            type="primary"
            disabled={!selectAppId || !selectProcessId}
            onClick={() => {
              onOk({
                appId: selectAppId,
                processId: selectProcessId,
                triggerId: _.find(processList, o => o.value === selectProcessId).triggerId,
              });
              onCancel();
            }}
          >
            {_l('确定')}
          </Button>
        </div>
      </Fragment>
    );
  }

  render() {
    const { onCancel, processListType } = this.props;
    const { appList } = this.state;

    return (
      <Modal
        className="selectUserFromAppDialog"
        open
        title={processListType === 11 ? _l('从已有审批流程复制') : _l('选择循环流程')}
        mask={{ closable: false }}
        footer={null}
        onCancel={onCancel}
      >
        {appList === null ? <LoadDiv /> : this.renderContent()}
      </Modal>
    );
  }
}

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import ajaxRequest from 'src/api/appManagement';
import { Dialog, LoadDiv, Dropdown, Button } from 'ming-ui';
import '../SelectUsersFromApp/index.less';
import processVersion from '../../api/processVersion';

export default class SelectApprovalProcess extends Component {
  static propTypes = {
    appId: PropTypes.string,
    companyId: PropTypes.string.isRequired,
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
          text: appName,
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
    processVersion.list({ relationId: appId, processListType: 11 }).then(data => {
      const processList = [];

      data.forEach(item => {
        item.processList.forEach(({ id, name }) => {
          processList.push({
            value: id,
            text: name,
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
    const { onOk, onCancel } = this.props;
    const { selectAppId, selectProcessId, appList, processList } = this.state;

    return (
      <Fragment>
        <div className="formItem flexRow mTop10">
          <div className="label">{_l('应用')}</div>
          <div className="content">
            <Dropdown
              border
              className="w100"
              placeholder={_l('请选择')}
              noData={_l('没有可选的应用')}
              openSearch
              value={selectAppId}
              data={appList}
              onChange={id => {
                this.setState({ selectAppId: id, selectProcessId: '' });
                this.getProcessByApp(id);
              }}
            />
          </div>
        </div>
        <div className="formItem flexRow mTop15">
          <div className="label">{_l('审批流程')}</div>
          <div className="content">
            <Dropdown
              border
              className="w100"
              placeholder={_l('请选择')}
              noData={_l('没有可选的审批流程')}
              openSearch
              value={selectProcessId}
              data={processList}
              onChange={id => this.setState({ selectProcessId: id })}
            />
          </div>
        </div>
        <div className="btns TxtRight mTop20">
          <Button type="link" onClick={onCancel}>
            {_l('取消')}
          </Button>
          <Button
            disabled={!selectAppId || !selectProcessId}
            onClick={() => {
              onOk({ appId: selectAppId, processId: selectProcessId });
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
    const { onCancel } = this.props;
    const { appList } = this.state;

    return (
      <Dialog
        className="selectUserFromAppDialog"
        visible
        title={_l('从已有审批流程复制')}
        overlayClosable={false}
        footer={null}
        onCancel={onCancel}
      >
        {appList === null ? <LoadDiv /> : this.renderContent()}
      </Dialog>
    );
  }
}

import React, { Component } from 'react';
import _ from 'lodash';
import { Button, Icon, LoadDiv } from 'ming-ui';
import projectController from 'src/api/project';
import { formatValue } from 'src/pages/Admin/homePage/utils';
import { getCurrentProject } from 'src/utils/project';
import Config from '../../../config';

export default class CloseNet extends Component {
  constructor() {
    super();
    this.state = {
      isLoading: false,
      effectiveApkCount: undefined,
      effectiveWorksheetCount: undefined,
      effectiveWorksheetRowCount: undefined,
      disabled: false,
    };
  }

  componentDidMount() {
    this.getData();
  }

  getData() {
    this.setState({ isLoading: true });
    projectController
      .getProjectLicenseSupportInfo({
        projectId: Config.projectId,
        onlyNormal: false,
        onlyUsage: true,
      })
      .then(({ effectiveApkCount, effectiveWorksheetCount, effectiveWorksheetRowCount }) => {
        this.setState({
          isLoading: false,
          effectiveApkCount,
          effectiveWorksheetCount,
          effectiveWorksheetRowCount,
        });
      });
  }

  getFormatText = num => {
    return this.state.isLoading || !_.isNumber(num) ? '-' : formatValue(num);
  };

  onBack = () => this.props.setLevel(1);

  onCloseProject = () => {
    this.setState({ disabled: true });

    projectController
      .closeProject({
        projectId: Config.projectId,
      })
      .then(res => {
        if (res) {
          alert({
            msg: _l('组织已关闭'),
            onClose: function () {
              window.location.href = '/dashboard';
            },
          });
        } else {
          this.setState({ disabled: false });
          alert(_l('关闭组织失败，请重试'), 2);
        }
      });
  };

  render() {
    const { isLoading, effectiveApkCount, effectiveWorksheetCount, effectiveWorksheetRowCount, disabled } = this.state;
    const currentProject = getCurrentProject(Config.projectId);

    return (
      <div className="orgManagementWrap">
        <div className="orgManagementHeader justifyContentLeft">
          <Icon icon="backspace" className="Hand mRight18 TxtMiddle Font24" onClick={this.onBack} />
          <span className="Font17">{_l('关闭组织')}</span>
        </div>
        <div className="orgManagementContent">
          {isLoading ? (
            <LoadDiv />
          ) : (
            <div className="closeNet">
              <div id="stepOne">
                <div className="Bold Font24 title">
                  <i className="icon-error error Font28 mRight8" />
                  {_l('关闭组织：%0', currentProject.companyName)}
                </div>
                <div className="mTop22 Font14">
                  <span className="Gray_15">{_l('组织关闭后，所有人将无法访问组织和应用。')}</span>
                  <span className="Gray_15 Bold">
                    {_l('90天后组织内所有应用将自动进入回收站，进入回收站60天后将被彻底物理删除，')}
                  </span>
                  <span className="Red_e828 Bold">{_l('请谨慎操作！')}</span>
                </div>
                <div className="Font14 Gray_15">
                  {_l('若想恢复组织，请到个人账户 - 我的组织 找到已关闭的组织列表进行恢复')}
                </div>

                <div className="projectInfoCard mTop28 Font14 Gray_15">
                  <div className="mBottom20 Gray_75">{_l('包含以下数据：')}</div>
                  <div className="mBottom8">{_l('应用：%0个', this.getFormatText(effectiveApkCount))}</div>
                  <div className="mBottom8">{_l('工作表：%0个', this.getFormatText(effectiveWorksheetCount))}</div>
                  <div>{_l('行记录：%0行', this.getFormatText(effectiveWorksheetRowCount))}</div>
                </div>

                <div className="mTop36">
                  <Button type="danger" className="mRight12" disabled={disabled} onClick={this.onCloseProject}>
                    {_l('确认关闭')}
                  </Button>
                  <Button type="ghostgray" onClick={this.onBack}>
                    {_l('取消操作')}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}

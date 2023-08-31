import React, { Fragment, PureComponent } from 'react';
import flowMonitor from 'src/pages/workflow/api/processVersion.js';
import { settingEarlyWarning } from './EarlyWarningDialog';
import { justifyInfoData } from './enum';

const formatter = v => String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export default class RealTimeData extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      realTimeData: {
        consumer: '', // 消费量
        difference: '', // 在队列中的数量
        producer: '', // 生产量
      },
    };
  }

  componentDidMount() {
    this.getRealTimeData();
    this.getWarningSetting();
  }

  // 获取实时数据
  getRealTimeData = () => {
    const { projectId } = this.props;
    flowMonitor
      .getDifferenceByCompanyId({
        companyId: projectId,
      })
      .then(res => {
        this.setState({ realTimeData: res });
      });
  };

  // 获取预警设置
  getWarningSetting = () => {
    const { projectId } = this.props;
    flowMonitor.getWarning({ companyId: projectId }).then(res => {
      this.setState({
        warningValue: res.value,
        accountIds: (res.accountIds || []).map(it => ({ ...it, fullname: it.fullName })),
      });
    });
  };

  renderJustifyInfo = ({ type, name }) => {
    const { projectId } = this.props;
    let { realTimeData = {}, warningValue, accountIds = [] } = this.state;
    let isWarning = accountIds.length;
    return (
      <div className="infoBox flex" key={type}>
        <div className="description">{name}</div>
        <div className="countValue">{formatter(realTimeData[type]) || '-'}</div>
        {type === 'difference' ? (
          <div>
            {isWarning ? <span className="Gray_75">{_l('预警（%0）', warningValue)}</span> : ''}
            <span
              className="ThemeColor Hand"
              onClick={() => {
                settingEarlyWarning({
                  projectId,
                  warningValue,
                  isWarning,
                  accountIds,
                  onOk: (warningValue, accountIds) => {
                    this.setState({ warningValue, accountIds });
                  },
                });
              }}
            >
              {isWarning ? _l('设置') : _l('预警')}
            </span>
          </div>
        ) : (
          <div className="inTime">{_l('5分钟内')}</div>
        )}
      </div>
    );
  };

  render() {
    return (
      <Fragment>
        <div className="subTitle">{_l('实时')}</div>
        <div className="justifyInfo flexRow mBottom32">
          {justifyInfoData
            .filter(it => !_.includes(['routerIndex', 'waiting'], it.type))
            .map(item => this.renderJustifyInfo(item))}
        </div>
      </Fragment>
    );
  }
}

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
        notifiers: (res.accountIds || []).map(it => ({ ...it, fullname: it.fullName })),
        noticeTypes: _.concat(['1'], res.enableSms ? ['2'] : [], res.enableEmail ? ['3'] : []),
      });
    });
  };

  setWarningValue = (value, notifiers, noticeTypes = [], closeDialog = () => {}) => {
    const { projectId } = this.props;

    flowMonitor
      .updateWarning({
        accountIds: notifiers.map(it => it.accountId),
        companyId: projectId,
        value,
        enableSms: _.includes(noticeTypes, '2'),
        enableEmail: _.includes(noticeTypes, '3'),
      })
      .then(res => {
        if (res) {
          alert(_l('操作成功'));
          closeDialog();
          this.setState({ warningValue: value, notifiers, noticeTypes });
        } else {
          alert(_l('操作失败'), 2);
        }
      });
  };

  renderJustifyInfo = ({ type, name }) => {
    const { projectId } = this.props;
    let { realTimeData = {}, warningValue, notifiers = [], noticeTypes } = this.state;
    let isWarning = notifiers.length;
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
                  type: 'workflow',
                  projectId,
                  warningValue,
                  isWarning,
                  notifiers,
                  noticeTypes,
                  onOk: this.setWarningValue,
                  closeWarning: this.setWarningValue,
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

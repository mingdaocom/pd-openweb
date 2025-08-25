import React, { Component, Fragment } from 'react';
import ClipboardButton from 'react-clipboard.js';
import moment from 'moment';
import { Icon, Textarea, Tooltip } from 'ming-ui';
import privateGuide from 'src/api/privateGuide';
import { getRequest } from 'src/utils/common';
import ApplyPrivateKey from './ApplyPrivateKey';
import 'rc-trigger/assets/index.css';
import './privatekey.less';

const LicenseVersions = [_l('社区版'), _l('标准版'), _l('专业版'), _l('大型专业版'), _l('教学版'), _l('专业版试用')];

const formatDate = date => {
  const year = moment(date).format('YYYY');
  if (year == 9999) {
    return _l('永久');
  }
  return moment(date).format(`YYYY年MM月DD日`);
};

export default class PersonalEntrypoint extends Component {
  constructor(props) {
    super(props);
    const { hash } = location;
    this.state = {
      isApply: hash === '#apply',
      licenseList: [],
    };
  }

  componentDidMount() {
    if (!this.state.isApply) {
      this.getLicenseList();
    }
  }

  getLicenseList = callback => {
    privateGuide.getLicenseList().then(result => {
      this.setState(
        {
          licenseList: result,
        },
        callback,
      );
    });
  };

  handleSetVisible = (hide, targetIndex) => {
    const { licenseList } = this.state;
    this.setState({
      licenseList: licenseList.map((item, inde) => {
        if (inde === targetIndex) {
          item.visible = !hide;
        }
        return item;
      }),
    });
  };

  handleCloseApply = (event, result) => {
    location.hash = '';
    this.getLicenseList(() => {
      if (result) {
        this.handleSetVisible(false, 0);
      }
    });
    this.setState({ isApply: false });
  };

  renderLicenseItem(item, index) {
    const { serverId, licenseCode, startDate, expirationDate, licenseVersion, visible } = item;
    return (
      <Fragment key={index}>
        <div
          className="flexRow companyItem Hand"
          onClick={() => {
            this.handleSetVisible(visible, index);
          }}
        >
          <div className="flex flexRow valignWrapper">
            <Icon icon={visible ? 'expand_more' : 'navigate_next'} className="Gray_9e Font18 pointer" />
            <span className="mLeft5 serverId">{serverId}</span>
          </div>
          <div className="flex flexRow valignWrapper">{LicenseVersions[licenseVersion]}</div>
          <div className="flex flexRow valignWrapper">{formatDate(startDate)}</div>
          <div className="flex flexRow valignWrapper">{formatDate(expirationDate)}</div>
        </div>
        {visible && (
          <div className="flexRow valignWrapper companyPrivateKeyItem">
            <div className="flex flexRow w100">
              <div className="Gray_75 mBottom5 mRight5">{_l('产品密钥')}</div>
              <div className="flex Relative">
                <Textarea minHeight={90} readOnly defaultValue={licenseCode} />
                <Tooltip text={<span>{_l('复制')}</span>} popupPlacement="bottom">
                  <div className="copyWrapper">
                    <ClipboardButton
                      component="div"
                      data-clipboard-text={licenseCode}
                      onSuccess={() => {
                        alert(_l('复制成功'));
                      }}
                    >
                      <Icon icon="content-copy" className="pointer Gray_75 Font16" />
                    </ClipboardButton>
                  </div>
                </Tooltip>
              </div>
            </div>
          </div>
        )}
      </Fragment>
    );
  }

  renderContent() {
    const { licenseList } = this.state;
    const request = getRequest();
    return (
      <Fragment>
        <div className="personalEntrypointHeader flexRow">
          <div className="Bold Font18">{_l('产品密钥')}</div>
          <div className="flexRow valignWrapper">
            {request.serverId ? (
              <div
                className="applyPrivateKey pointer"
                onClick={() => {
                  this.setState({ isApply: true });
                }}
              >
                {_l('申请密钥')}
              </div>
            ) : null}
          </div>
        </div>
        <div className="personalEntrypointContent">
          <div className="flexRow titleWrapper">
            <div className="Bold">{_l('服务器ID')}</div>
            <div className="Bold">{_l('版本')}</div>
            <div className="Bold">{_l('开始时间')}</div>
            <div className="Bold">{_l('到期时间')}</div>
          </div>
          {licenseList.length ? (
            <Fragment>{licenseList.map((item, index) => this.renderLicenseItem(item, index))}</Fragment>
          ) : (
            <div className="withoutList flexColumn valignWrapper">
              <div className="iconWrapper flexRow valignWrapper">
                <Icon className="Font40" icon="Empty_nokey" />
              </div>
              <div className="Gray_75">{_l('暂无密钥')}</div>
            </div>
          )}
        </div>
      </Fragment>
    );
  }

  render() {
    const { isApply } = this.state;
    return (
      <div className="card personalEntrypointWrapper">
        {isApply ? <ApplyPrivateKey onClose={this.handleCloseApply} /> : this.renderContent()}
      </div>
    );
  }
}

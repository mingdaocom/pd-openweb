import React, { Component, Fragment } from 'react';
import { Pagination } from 'antd';
import copy from 'copy-to-clipboard';
import _ from 'lodash';
import moment from 'moment';
import { Icon, LoadDiv, Textarea } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import privateGuide from 'src/api/privateGuide';
import { getRequest } from 'src/utils/common';
import ApplyPrivateKey from './ApplyPrivateKey';
import 'rc-trigger/assets/index.css';
import './privatekey.less';

const LicenseVersions = [_l('社区版'), _l('标准版'), _l('专业版'), _l('大型专业版'), _l('教学版'), _l('专业版试用')];
const Products = ['hap', 'hdp'];
const PageSize = 50;

const getProduct = product => (_.toLower(product) === 'hdp' ? 'hdp' : 'hap');

const parseLicenseListResult = result => {
  const list = _.isArray(result) ? result : _.get(result, 'list');
  const licenseList = _.isArray(list) ? list : [];

  return {
    list: licenseList,
    count: _.toNumber(_.get(result, 'count')) || licenseList.length,
  };
};

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
    const request = getRequest();

    this.state = {
      isApply: hash === '#apply',
      activeProduct: getProduct(request.product),
      licenseList: [],
      licenseCount: 0,
      pageIndex: 1,
      loading: hash !== '#apply',
    };
    this.licenseListRequestId = 0;
  }

  componentDidMount() {
    if (!this.state.isApply) {
      this.getLicenseList();
    }
  }

  getLicenseList = (callback = _.noop) => {
    const { activeProduct, pageIndex } = this.state;
    const requestId = this.licenseListRequestId + 1;
    this.licenseListRequestId = requestId;

    privateGuide
      .getApplyLicenseList({
        product: activeProduct,
        pageIndex,
        pageSize: PageSize,
      })
      .then(result => {
        if (requestId !== this.licenseListRequestId) return;

        const { list, count } = parseLicenseListResult(result);
        this.setState(
          {
            licenseList: list,
            licenseCount: count,
            loading: false,
          },
          callback,
        );
      })
      .catch(() => {
        if (requestId !== this.licenseListRequestId) return;

        this.setState({ licenseList: [], licenseCount: 0, loading: false });
      });
  };

  reloadLicenseList = state => {
    this.setState({ licenseList: [], loading: true, ...state }, this.getLicenseList);
  };

  handleChangeProduct = activeProduct => {
    if (activeProduct === this.state.activeProduct) return;

    this.reloadLicenseList({ activeProduct, licenseCount: 0, pageIndex: 1 });
  };

  handleChangePage = pageIndex => {
    if (pageIndex === this.state.pageIndex) return;

    this.reloadLicenseList({ pageIndex });
  };

  handleSetVisible = (hide, targetIndex) => {
    const { licenseList } = this.state;
    this.setState({
      licenseList: licenseList.map((item, inde) => {
        if (inde === targetIndex) {
          return { ...item, visible: !hide };
        }

        return item;
      }),
    });
  };

  handleCloseApply = (event, result) => {
    location.hash = '';
    this.setState({ isApply: false, loading: true, ...(result ? { pageIndex: 1 } : {}) }, () => {
      this.getLicenseList(() => {
        if (result) {
          this.handleSetVisible(false, 0);
        }
      });
    });
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
          <div className="colServer flexRow valignWrapper">
            <Icon icon={visible ? 'expand_more' : 'navigate_next'} className="textTertiary Font18 pointer" />
            <span className="mLeft5 serverId">{serverId}</span>
          </div>
          <div className="colVersion flexRow valignWrapper">{LicenseVersions[licenseVersion]}</div>
          <div className="colDate flexRow valignWrapper">{formatDate(startDate)}</div>
          <div className="colDate flexRow valignWrapper">{formatDate(expirationDate)}</div>
        </div>
        {visible && (
          <div className="flexRow valignWrapper companyPrivateKeyItem">
            <div className="flex flexRow w100">
              <div className="textSecondary mBottom5 mRight5">{_l('产品密钥')}</div>
              <div className="flex Relative">
                <Textarea minHeight={90} readOnly defaultValue={licenseCode} />
                <Tooltip title={_l('复制')} placement="bottom">
                  <div className="copyWrapper">
                    <div
                      onClick={() => {
                        copy(licenseCode);
                        alert(_l('复制成功'));
                      }}
                    >
                      <Icon icon="content-copy" className="pointer textSecondary Font16" />
                    </div>
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
    const { activeProduct, licenseCount, licenseList, loading, pageIndex } = this.state;
    const request = getRequest();
    const paginationTotal = licenseCount || licenseList.length;

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
        <div className="personalEntrypointTabs flexRow valignWrapper">
          {Products.map(product => (
            <div
              key={product}
              className={`productTab flexRow valignWrapper pointer ${activeProduct === product ? 'active' : ''}`}
              onClick={() => {
                this.handleChangeProduct(product);
              }}
            >
              {product.toUpperCase()}
            </div>
          ))}
        </div>
        <div className="personalEntrypointContent">
          <div className="flexRow titleWrapper">
            <div className="colServer Bold">{_l('服务器ID')}</div>
            <div className="colVersion Bold">{_l('版本')}</div>
            <div className="colDate Bold">{_l('开始时间')}</div>
            <div className="colDate Bold">{_l('到期时间')}</div>
          </div>
          <div className="personalEntrypointList">
            {loading ? (
              <LoadDiv className="mTop10" />
            ) : licenseList.length ? (
              <Fragment>{licenseList.map((item, index) => this.renderLicenseItem(item, index))}</Fragment>
            ) : (
              <div className="withoutList flexColumn valignWrapper">
                <div className="iconWrapper flexRow valignWrapper">
                  <Icon className="Font40" icon="Empty_nokey" />
                </div>
                <div className="textSecondary">{_l('暂无密钥')}</div>
              </div>
            )}
          </div>
          {paginationTotal > PageSize && (
            <div className="personalEntrypointPagination flexRow">
              <Pagination
                current={pageIndex}
                pageSize={PageSize}
                total={paginationTotal}
                showSizeChanger={false}
                onChange={this.handleChangePage}
              />
            </div>
          )}
        </div>
      </Fragment>
    );
  }

  render() {
    const { activeProduct, isApply } = this.state;
    return (
      <div className="card personalEntrypointWrapper">
        {isApply ? <ApplyPrivateKey product={activeProduct} onClose={this.handleCloseApply} /> : this.renderContent()}
      </div>
    );
  }
}

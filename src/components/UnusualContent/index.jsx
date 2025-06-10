import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import { oneOf } from 'prop-types';
import { Button, Dialog, Skeleton, SvgIcon, Textarea, UserHead } from 'ming-ui';
import api from 'src/api/appManagement';
import marketplaceApi from 'src/api/marketplace';
import { checkCertification } from 'src/components/checkCertification';
import overduePic from './overdue.png';
import turnoffPic from './turnoff.png';
import unauthorizedPic from './unauthorized.png';
import './index.less';

const STATUS_TO_TEXT = {
  2: { src: turnoffPic, text: _l('应用已关闭') },
  3: { src: turnoffPic, text: _l('应用已删除') },
  4: { src: unauthorizedPic, text: _l('你还不是应用成员，无权访问此应用') },
  5: { src: unauthorizedPic, text: _l('未分配任何工作表，请联系此应用的管理员') },
  6: { src: turnoffPic, text: _l('工作表或自定义页面已删除') },
  20: { src: overduePic, text: _l('当前应用已过期，如要继续使用，请立即续订') },
  30: { src: turnoffPic, text: _l('应用已删除，如需使用请从回收站内恢复') },
  31: { src: turnoffPic, text: _l('应用已被彻底删除，如需使用请重新安装') },
};

export default class UnusualContent extends Component {
  static propTypes = {
    status: oneOf([2, 3, 4, 5]),
  };
  state = {
    remark: '',
    applyJoinAppVisible: false,
    reinstallLoading: false,
  };
  updateState = (obj, cb) => {
    this.setState({ obj }, cb);
  };
  applyJoinApp = () => {
    const { appId } = this.props;
    const { remark } = this.state;
    api.addAppApply({ appId, remark }).then(data => {
      if (data) {
        alert(_l('申请已提交'));
      }
      this.setState({ applyJoinAppVisible: false });
    });
  };
  reinstall = () => {
    const { appId } = this.props;
    this.setState({ reinstallLoading: true });
    marketplaceApi
      .reinstall({ appId })
      .then(data => {
        if (data) {
          alert(_l('安装成功'));
          location.href = '/dashboard';
        }
      })
      .finally(() => this.setState({ reinstallLoading: false }));
  };
  renderApply() {
    const { appPkg } = this.props;
    const { name, iconUrl, iconColor, projectId, managers = [], projectName } = appPkg;
    const { projects } = md.global.Account;
    const { companyName } = _.filter(projects, { projectId })[0] || { companyName: projectName };
    return (
      <div className="flexColumn alignItemsCenter justifyContentCenter applyContent">
        <div
          className="flexRow alignItemsCenter justifyContentCenter circle mBottom15"
          style={{ width: 80, height: 80, backgroundColor: iconColor }}
        >
          <SvgIcon url={iconUrl} fill="#fff" size={56} />
        </div>
        <div className="Font24 Gray bold mBottom5">{name}</div>
        {companyName && <div className="Font14 Gray_9e">{companyName}</div>}
        <div className="mTop15 mBottom30 flexRow alignItemsCenter">
          <div className="Gray_9e mRight20">{_l('管理员')}</div>
          <div className="flexRow">
            {managers.slice(0, 20).map(data => (
              <UserHead
                key={data.accountId}
                className="manager"
                projectId={projectId}
                size={32}
                user={{
                  ...data,
                  accountId: data.accountId,
                  userHead: data.avatar,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
  renderUpgrade = () => {
    return (
      <Fragment>
        <div className="imgWrap mBottom14">
          <i className="icon-unarchive Font56" style={{ color: '#4caf50' }} />
        </div>
        <div className="Font17 bold">{_l('应用正在升级中...')}</div>
      </Fragment>
    );
  };
  render() {
    const { status, appPkg } = this.props;
    const { src, text } = STATUS_TO_TEXT[status] || {};
    const { applyJoinAppVisible, remark, reinstallLoading } = this.state;
    return (
      <div className="unusualContentWrap">
        <div className="unusualSkeletonWrap">
          <Skeleton active={false} />
        </div>
        <div className="unusualContent">
          {status === 4 && _.get(appPkg, 'managers.length') ? (
            this.renderApply()
          ) : status === 10 ? (
            this.renderUpgrade()
          ) : (
            <Fragment>
              <div className="imgWrap">
                <img src={src} alt={_l('错误图片')} />
              </div>
              {_.includes([20], status) ? (
                _.get(appPkg.license, 'status') === 2 ? (
                  <div className="explainText">{text}</div>
                ) : (
                  <div className="explainText">{_l('应用已退单，如需使用，请重新购买')}</div>
                )
              ) : (
                <div className="explainText">{text}</div>
              )}
            </Fragment>
          )}
          {_.includes([4], status) &&
            !md.global.Account.isPortal && ( //外部门户无法申请
              <Button
                onClick={() => {
                  checkCertification({
                    projectId: appPkg.projectId,
                    checkSuccess: () => this.setState({ applyJoinAppVisible: true }),
                  });
                }}
              >
                {_l('申请加入')}
              </Button>
            )}
          {_.includes([31], status) && (
            <Button onClick={this.reinstall} loading={reinstallLoading}>
              {_l('重新安装')}
            </Button>
          )}
          {_.includes([20], status) && _.get(appPkg.license, 'status') === 2 && (
            <Button
              onClick={() => {
                if (md.global.Config.IsLocal) {
                  alert(_l('请前往市场操作续订'), 3);
                  return;
                }
                window.open(
                  `${md.global.Config.MarketUrl}/app/${appPkg.goodsId}?projectId=${appPkg.projectId}&purchaseRecordId=${appPkg.license.id}&buyTypeEnum=1&planType=${appPkg.license.planType}`,
                );
              }}
            >
              {_l('立即续订')}
            </Button>
          )}
        </div>
        {applyJoinAppVisible && (
          <Dialog
            className="applyJoinAppDialog"
            visible
            title={'申请加入应用'}
            onOk={() => this.applyJoinApp()}
            onCancel={() => this.setState({ applyJoinAppVisible: false })}
            okText={_l('申请加入')}
          >
            <Textarea
              height={120}
              value={remark}
              onChange={value => this.setState({ remark: value })}
              placeholder={_l('填写申请说明')}
            />
          </Dialog>
        )}
      </div>
    );
  }
}

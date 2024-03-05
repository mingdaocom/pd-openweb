import React, { Component, Fragment } from 'react';
import { oneOf } from 'prop-types';
import { Button, Dialog, Textarea, Skeleton } from 'ming-ui';
import api from 'src/api/appManagement';
import SvgIcon from 'src/components/SvgIcon';
import UserHead from 'src/components/userHead';
import unauthorizedPic from './unauthorized.png';
import turnoffPic from './turnoff.png';
import _ from 'lodash';
import './index.less';

const STATUS_TO_TEXT = {
  2: { src: turnoffPic, text: _l('应用已关闭') },
  3: { src: turnoffPic, text: _l('应用已删除') },
  4: { src: unauthorizedPic, text: _l('你还不是应用成员，无权访问此应用') },
  5: { src: unauthorizedPic, text: _l('未分配任何工作表，请联系此应用的管理员') },
  6: { src: turnoffPic, text: _l('工作表或自定义页面已删除') },
};

export default class UnusualContent extends Component {
  static propTypes = {
    status: oneOf([2, 3, 4, 5]),
  };
  state = {
    remark: '',
    applyJoinAppVisible: false,
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
    const { applyJoinAppVisible, remark } = this.state;
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
              <div className="explainText">{text}</div>
            </Fragment>
          )}
          {_.includes([4], status) &&
            !md.global.Account.isPortal && ( //外部门户无法申请
              <Button onClick={() => this.setState({ applyJoinAppVisible: true })}>{_l('申请加入')}</Button>
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

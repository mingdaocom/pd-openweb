import React, { Component } from 'react';
import { oneOf } from 'prop-types';
import { Button, Dialog, Textarea } from 'ming-ui';
import Skeleton from './Skeleton';
import api from 'api/appManagement';
import unauthorizedPic from './assets/unauthorized.png';
import turnoffPic from './assets/turnoff.png';
import './index.less';

const STATUS_TO_TEXT = {
  2: { src: turnoffPic, text: _l('应用已关闭') },
  3: { src: turnoffPic, text: _l('应用已删除') },
  4: { src: unauthorizedPic, text: _l('你还不是应用成员，无权访问此应用') },
  5: { src: unauthorizedPic, text: _l('未分配任何工作表，请联系此应用的管理员') },
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
  render() {
    const { status } = this.props;
    const { src, text } = STATUS_TO_TEXT[status];
    const { applyJoinAppVisible, remark } = this.state;
    return (
      <div className="unusualContentWrap">
        <div className="unusualSkeletonWrap">
          <Skeleton active={false} />
        </div>
        <div className="unusualContent">
          <div className="imgWrap">
            <img src={src} alt={_l('错误图片')} />
          </div>
          <div className="explainText">{text}</div>
          {_.includes([4], status) && <Button onClick={() => this.setState({ applyJoinAppVisible: true })}>{_l('申请加入')}</Button>}
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
            <Textarea height={120} value={remark} onChange={value => this.setState({ remark: value })} placeholder={_l('填写申请说明')} />
          </Dialog>
        )}
      </div>
    );
  }
}

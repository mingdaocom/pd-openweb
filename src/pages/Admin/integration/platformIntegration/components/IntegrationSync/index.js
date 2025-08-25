import React, { Component } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Button, Dialog } from 'ming-ui';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import { INTEGRATION_INFO } from '../../config';
import SyncDialog from '../SyncDialog';

export default class IntegrationSync extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showSyncDiaLog: false,
    };
  }

  checkSyncFn = showSyncDiaLog => {
    const { projectId, integrationType } = this.props;

    this.setState({ loading: true });
    INTEGRATION_INFO[integrationType]
      .checkAjax({
        projectId,
      })
      .then(res => {
        const { item1, item2, item3 = {} } = res;
        if (!item1) {
          alert(_l(item2 || '同步失败'), 2);
          this.setState({ loading: false });
          return;
        }

        const { logDetailItems = [], mingDaoUserInfos = [], tpTotalCount } = item3;
        let itemArr = logDetailItems.filter(item => item.type === 7);
        let overLimitLength = (itemArr && !_.isEmpty(itemArr) && itemArr[0].items.length) || 0;
        if (overLimitLength) {
          this.setState({ overLimitLength, dialogOverLimit: true, loading: false });
          return;
        } else {
          let temp = mingDaoUserInfos.map((item, index) => {
            const { wxUserInfo = {}, tpUserInfo = {} } = item;
            item.userInfo = integrationType === 3 ? wxUserInfo : tpUserInfo;
            let isSame = false;
            for (let i = 0; i < mingDaoUserInfos.length; i++) {
              if (
                item.userInfo &&
                mingDaoUserInfos[i].userInfo &&
                item.userInfo.userId === mingDaoUserInfos[i].userInfo.userId &&
                index !== i
              ) {
                isSame = true;
                break;
              }
            }
            if (isSame) {
              return { ...item, userInfo: {} };
            } else {
              return item;
            }
          });
          this.setState({
            tpTotalCount,
            mingDaoUserInfos: temp,
            bindQWUserIds: temp.filter(item => item.userInfo && item.userInfo.userId).map(v => v.userInfo.userId),
            filterMatchPhoneBindUserIds: temp
              .filter(item => item.userInfo && item.userInfo.userId && item.userInfo.matchType !== 1)
              .map(v => v.userInfo.userId),
            logDetailItems,
            loading: false,
            showSyncDiaLog,
            isBindRelationship: false,
          });
        }
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  };

  getCount = type => {
    const { logDetailItems = [] } = this.state;
    let itemArr = logDetailItems.filter(item => item.type === type);
    return (itemArr && !_.isEmpty(itemArr) && itemArr[0].items.length) || 0;
  };

  renderOverLimitDialog = () => {
    const { dialogOverLimit, overLimitLength } = this.state;
    return (
      <Dialog
        width="500px"
        title={_l('同步失败')}
        visible={dialogOverLimit}
        showCancel={false}
        onCancel={() => {
          this.setState({ dialogOverLimit: false });
        }}
        onOk={() => {
          this.setState({ dialogOverLimit: false });
        }}
      >
        <div>{_l('超出 %0 个企业微信用户需要被同步，请先增购组织用户', overLimitLength)}</div>
      </Dialog>
    );
  };

  render() {
    const { projectId, step, integrationType, syncDisabled, featureType, featureId } = this.props;
    const {
      loading,
      showSyncDiaLog,
      isBindRelationship,
      mingDaoUserInfos = [],
      bindQWUserIds = [],
      filterMatchPhoneBindUserIds = [],
      logDetailItems = [],
      tpTotalCount,
    } = this.state;
    const { text } = INTEGRATION_INFO[integrationType];

    return (
      <div className="stepItem">
        <h3 className="stepTitle Font16 Gray">{_l('%0数据同步', step)}</h3>
        <div className="mTop16 syncBox">
          <span className="Font14 syncTxt Gray_75">
            {_l('从%0通讯录同步到系统。', text)}
            <span
              className="ThemeColor Hand"
              onClick={() => {
                this.setState({
                  showSyncDiaLog: true,
                  isBindRelationship: true,
                });
              }}
            >
              {_l('账号绑定关系列表')}
            </span>
          </span>
          <Button
            type="primary"
            disabled={loading}
            className={cx('syncBtn', { isNO: syncDisabled || showSyncDiaLog })}
            onClick={() => {
              if (featureType === '2') {
                buriedUpgradeVersionDialog(projectId, featureId);
                return;
              }

              if (syncDisabled || showSyncDiaLog) {
                return;
              } else {
                this.checkSyncFn(true);
              }
            }}
          >
            {loading ? _l('正在计算，请稍等') : _l('同步')}
          </Button>
        </div>
        {this.renderOverLimitDialog()}

        <SyncDialog
          tpTotalCount={tpTotalCount}
          visible={showSyncDiaLog}
          isBindRelationship={isBindRelationship}
          projectId={projectId}
          integrationType={integrationType}
          mingDaoUserInfos={mingDaoUserInfos}
          bindQWUserIds={bindQWUserIds}
          filterMatchPhoneBindUserIds={filterMatchPhoneBindUserIds}
          logDetailItems={logDetailItems}
          getCount={this.getCount}
          onCancel={() => this.setState({ showSyncDiaLog: false, isBindRelationship: undefined })}
        />
      </div>
    );
  }
}

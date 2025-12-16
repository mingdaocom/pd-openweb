import React, { Fragment, useEffect, useState } from 'react';
import { Button, Modal } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import { Dialog, Icon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import projectAjax from 'src/api/project';
import addFriends from 'src/components/addFriends';
import { purchaseMethodFunc } from 'src/components/pay/versionUpgrade/PurchaseMethodModal';
import PurchaseIcon from '../image/purchaseIcon.png';
import TimeIcon from '../image/time.png';
import { FreeTrialWrap } from '../styled';
import { getValue } from '../utils';

// 组织管理首页-版本卡片
export default function VersionCard(props) {
  const { projectId, data, isTrial, isFree, isLocal, routerLocation, updateData = () => {} } = props;
  const { currentLicense = {}, nextLicense = {} } = data;
  const { endDate, expireDays, version = {} } = currentLicense;
  const versionIdV2 = parseInt(version.versionIdV2);
  const hasNextLicense = !_.isEmpty(nextLicense);
  const surplus = getValue(expireDays || 0);
  const { version: nextVersion } = nextLicense;
  const [freeTrialVisible, setVisible] = useState(_.includes(routerLocation.pathname, 'showInvite'));

  const handleClick = type => {
    switch (type) {
      case 'upgrade':
        location.assign(`/admin/upgradeservice/${projectId}`);
        break;
      case 'renew':
        purchaseMethodFunc({ projectId, isTrial });
        break;
      case 'toast':
        if (isLocal) {
          alert(_l('单应用版暂不支持线上续费，请联系顾问进行续费'), 3);
          return;
        }
        Dialog.confirm({
          width: 510,
          title: _l('续费'),
          description: _l('仅允许在市场中完成开发版购买与续费，请前往 市场-开发者 后台完成续费'),
          okText: _l('立即前往'),
          onOk: () => {
            window.open(`${md.global.Config.MarketUrl}/seller/profile`);
          },
        });
        break;
      default:
    }
  };

  useEffect(() => {
    if (!freeTrialVisible || data.rules) return;
    projectAjax.getInviteGiveRule({ projectId }).then(res => {
      updateData(res);
    });
  }, [freeTrialVisible]);

  return (
    <div className="infoCard row1">
      <div>
        <div className="Font16 bold Gray mBottom6">{_l('版本')}</div>
        <div className="Font28 bold Gray mBottom8 valignWrapper">
          {getValue(version.name)}
          {isTrial && <span className="trialTag Font14 Bold">{_l('试用中')}</span>}
        </div>
        {!data.basicLoading && (
          <Fragment>
            {hasNextLicense && (
              <div className="Font14 mBottom10">
                <span className="renewTag mRight10">
                  <Icon icon="done" className="doneIcon" />
                  <span className="Bold">{_l('已续费')}</span>
                </span>
                {_.get(nextLicense, 'version.versionIdV2') !== _.get(version, 'versionIdV2') && (
                  <span className="Gray">{nextVersion.name}</span>
                )}
              </div>
            )}
            {isTrial && (
              <div className="Font14 bold">
                <span className="mRight8 Yellow_de9">{_l('免费试用剩余 %0 天', surplus)}</span>
                {!hasNextLicense && !isLocal && (
                  <span className="ThemeColor Hand" onClick={() => setVisible(true)}>
                    {_l('延长试用')}
                  </span>
                )}
              </div>
            )}
            {!isFree && !isTrial && (
              <Fragment>
                <div className="Font14">
                  {hasNextLicense ? (
                    <span className="Gray_75 mRight5">{_l('当前授权')}</span>
                  ) : surplus < 31 ? (
                    <span className="Red_f00 bold mRight5">{_l('剩余 %0 天', surplus)}</span>
                  ) : null}
                  <span className="Gray_75">{_l('%0到期', getValue(createTimeSpan(endDate, 4)))}</span>
                </div>
                {hasNextLicense && (
                  <div className="Font14 Gray_75">
                    <span className="mRight5">{_l('下个授权')}</span>
                    {_l('%0到期', getValue(createTimeSpan(nextLicense.endDate, 4)))}
                    <Tooltip
                      title={
                        <span>
                          {_l('下个授权：%0', nextVersion.name)}
                          <br />
                          {`${createTimeSpan(nextLicense.startDate, 4)} ${moment(nextLicense.startDate).format(
                            'HH:mm',
                          )} ${_l('开始')}`}
                        </span>
                      }
                    >
                      <Icon icon="info" className="Gray_9e mLeft4 Hand" />
                    </Tooltip>
                  </div>
                )}
              </Fragment>
            )}
          </Fragment>
        )}
      </div>
      {!data.basicLoading && !isLocal && (
        <div className="buttons">
          {!isFree && _.isEmpty(nextLicense) && (
            <div
              className={cx('Bold', isTrial ? 'greenBtn' : 'blueBtn')}
              onClick={() => handleClick(versionIdV2 === 0 ? 'toast' : 'renew')}
            >
              <img src={isTrial ? PurchaseIcon : TimeIcon} />
              {isTrial ? _l('购买') : _l('续费')}
            </div>
          )}
          {(isFree || (versionIdV2 !== 3 && !isTrial)) && (
            <div
              className={cx('Bold', isFree ? 'greenBtn' : 'whiteBtn')}
              onClick={() => handleClick(isFree ? 'renew' : 'upgrade')}
            >
              <span className="mRight6">🚀</span>
              {_l('升级')}
            </div>
          )}
        </div>
      )}

      <Modal width={720} visible={freeTrialVisible} title={null} footer={null} onCancel={() => setVisible(false)}>
        <FreeTrialWrap>
          <div className="title">{_l('额外获赠最多30天免费试用')}</div>
          <div className="subTitle">{_l('试用期间邀请同事加入即可获赠相应试用天数')}</div>
          <div className="invitePerson">
            {_l('当前已邀请')}
            <span>{data.invitedUserCount || 0}</span>
            {_l('人')}
          </div>
          <div className="expire">
            {_l('试用到期时间：')}
            <span className="expireTime">{data.expireDate ? moment(data.expireDate).format('YYYY-MM-DD') : ''}</span>
            <span className="remainTime">{_l('(剩余时间%0天)', data.leftDays || 0)}</span>
          </div>
          <ul className="inviteRules">
            {(data.rules || []).map(({ inviteCount, achieveDays }, index) => (
              <li key={inviteCount} style={{ flex: index + 1 }}>
                <div className="achieveDays">
                  <span>{achieveDays}</span>
                  {_l('天')}
                </div>
                <div className={cx('symbolWrap', { activeSymbolWrap: data.invitedUserCount >= inviteCount })}>
                  <div className="iconWrap">
                    <i className="icon-ok" />
                  </div>
                </div>
                <span className="Font12 Gray_75">{_l('邀请%0位用户', inviteCount)}</span>
              </li>
            ))}
          </ul>
          <Button
            style={{ height: '48px', width: '320px' }}
            type="primary"
            block
            onClick={() => addFriends({ projectId: projectId, fromType: 4 })}
          >
            {_l('立即邀请同事加入')}
          </Button>
        </FreeTrialWrap>
      </Modal>
    </div>
  );
}

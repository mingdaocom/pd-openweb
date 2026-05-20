import React, { useEffect, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Dialog, Icon } from 'ming-ui';
import FunctionWrap from 'ming-ui/components/FunctionWrap';
import projectApi from 'src/api/project';
import { navigateTo } from 'src/router/navigateTo';
import { PRODUCT_TYPE_ENUM, SUBSCRIPTION_TABS, VERSION_CARD_LIST } from './config';

const DialogWrap = styled(Dialog)`
  .mui-dialog-close-btn {
    right: 22px !important;
    top: 20px !important;
    .Icon {
      width: 20px !important;
      height: 20px !important;
      color: #757575 !important;
    }
  }
  .mui-dialog-body {
    padding: 0 40px !important;
  }

  .headerTab {
    display: flex;
    align-items: center;
    width: 260px;
    height: 48px;
    background: rgba(0, 0, 0, 0.04);
    border-radius: 48px;
    padding: 3px;
    margin: 0 auto;

    .tabItem {
      flex: 1;
      height: 42px;
      line-height: 42px;
      border-radius: 48px;
      font-size: 17px;
      font-weight: 600;
      cursor: pointer;
      text-align: center;
      &.isActive {
        color: #2196f3;
        background: #fff;
        box-shadow: 0px 1px 2px 1px rgba(0, 0, 0, 0.08);
      }
    }
  }
  .versionWrap {
    margin-top: 24px;
    flex-wrap: wrap;
    gap: 30px;

    .versionItem {
      flex: 1;
      position: relative;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 30px;
      box-sizing: border-box;
      font-size: 14px;
      &:hover {
        box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.08);
      }
      .priceRow {
        align-items: end;
        .lineHeight1 {
          line-height: 1;
        }
        .greenText {
          color: #4caf50;
          font-weight: 600;
        }
      }
      .upgradeBtn {
        width: 100%;
        height: 40px;
        line-height: 40px;
        text-align: center;
        border-radius: 28px;
        color: #fff;
        background: #2196f3;
        cursor: pointer;
        margin-bottom: 25px;
        font-size: 16px;
        font-weight: 600;
        &.disabled {
          color: #757575;
          background: #fff;
          border: 1px solid #ddd;
        }
        &:not(.disabled):hover {
          background: #1565c0;
        }
      }
      .currentVersionTag {
        position: absolute;
        top: 0;
        right: 0;
        width: 68px;
        height: 26px;
        line-height: 26px;
        border-radius: 0 8px;
        background: #4caf50;
        font-weight: 600;
        color: #fff;
        text-align: center;
      }
    }
  }
  .footer {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 20px 0;
  }

  .contactWrapper {
    padding: 24px 0 72px;
    text-align: center;
  }
`;

export default function VersionUpgrade(props) {
  const {
    onCancel,
    projectId,
    type,
    externalType,
    userExpandCount,
    onUpdateLicenseCallback = () => {},
    showOffLine,
  } = props;
  const [loading, setLoading] = useState(true);
  const [currentLicense, setCurrentLicense] = useState({});
  const { versionId = '', period = 'monthly', isOffLine = false } = currentLicense;
  const [currentTab, setCurrentTab] = useState(period);

  useEffect(() => {
    ['manageSubscription', 'user', 'portalexpand'].includes(type)
      ? onPurchase()
      : projectApi.getCurrentLicense({ projectId }).then(res => {
          if (res) {
            const licenseKeys = (res.id || '').split('_');
            setCurrentLicense({
              versionId: licenseKeys[0],
              period: licenseKeys[1] || 'monthly',
              isOffLine: res.isOffLine,
            });
            setCurrentTab(licenseKeys[1] || 'monthly');
            setLoading(false);
            type && (!res.isOffLine || type === 'recharge') && onPurchase();
          }
        });
  }, []);

  const getProductType = v => {
    if (!type) {
      return v.type === 'standard'
        ? currentTab === 'monthly'
          ? PRODUCT_TYPE_ENUM.STANDARD_MONTHLY
          : PRODUCT_TYPE_ENUM.STANDARD_YEARLY
        : currentTab === 'monthly'
          ? PRODUCT_TYPE_ENUM.PROFESSIONAL_MONTHLY
          : PRODUCT_TYPE_ENUM.PROFESSIONAL_YEARLY;
    }

    const mapping = {
      dataSync: PRODUCT_TYPE_ENUM.DATASYNC_MONTHLY,
      workflow: PRODUCT_TYPE_ENUM.WORKFLOW_EXECUTION_MONTHLY,
      storage: PRODUCT_TYPE_ENUM.ATTACHMENT_UPLOAD_YEARLY,
      aggregationtable: PRODUCT_TYPE_ENUM.AGGREGATED_TABLE_MONTHLY,
      recharge: PRODUCT_TYPE_ENUM.RECHARGE,
      portalexpand: externalType === 'monthly' ? PRODUCT_TYPE_ENUM.EXTERNAL_MONTHLY : PRODUCT_TYPE_ENUM.EXTERNAL_YEARLY,
    };

    if (window.platformENV.isOverseas && !window.platformENV.isLocal) {
      mapping.chunks = PRODUCT_TYPE_ENUM.VECTOR_KNOWLEDGE_CHUNKS;
    }

    return mapping[type];
  };

  const hasUpgraded = v => {
    if (v.type === 'free') return true;

    if (versionId === 'standard') {
      return period === 'yearly' && v.type === 'standard' && currentTab === 'monthly';
    }

    if (versionId === 'professional') {
      return v.type === 'standard' || (period === 'yearly' && v.type === 'professional' && currentTab === 'monthly');
    }
  };

  const onPurchase = v => {
    if ((!type && hasUpgraded(v)) || showOffLine) {
      return;
    }

    if (type === 'user') {
      projectApi
        .updateStripeLicense({ projectId, userExpandCount })
        .then(res => {
          res && onUpdateLicenseCallback(true);
          res ? alert(_l('更新成功')) : alert(_l('更新失败'), 2);
        })
        .catch(() => onUpdateLicenseCallback(false));
      return;
    }

    alert(_l('正在准备跳转，请稍后...'), 5, 0, _.noop, 'subscriptionUrlLoading');

    if (type === 'manageSubscription' || (type === 'portalexpand' && !userExpandCount)) {
      projectApi
        .getManageSubscriptionUrl({ projectId })
        .then(res => res && location.assign(res))
        .catch(() => destroyAlert('subscriptionUrlLoading'));
      return;
    }

    projectApi
      .getUpgradeLicenseUrl({
        projectId,
        productType: getProductType(v),
        userExpandCount: userExpandCount ? userExpandCount / 100 : undefined, //100人一个单位
      })
      .then(res => {
        res && location.assign(res);
      })
      .catch(() => destroyAlert('subscriptionUrlLoading'));
  };

  if (loading && !showOffLine) return null;

  //是线下购买
  if ((isOffLine || showOffLine) && type !== 'recharge') {
    return (
      <DialogWrap visible width={420} showFooter={false} onCancel={onCancel}>
        <div className="contactWrapper">
          <Icon icon="history_edu" className="Font48 ThemeColor" />
          <div className="Font17 bold mTop16">{_l('请联系销售购买')}</div>
          <div className="Gray_75 mTop12">{_l('您的组织当前通过线下渠道购买 Nocoly 服务。请联系销售')}</div>
        </div>
      </DialogWrap>
    );
  }

  if (type) return null;

  return (
    <DialogWrap visible width={1100} showFooter={false} onCancel={onCancel}>
      <div className="headerTab">
        {SUBSCRIPTION_TABS.map(item => (
          <div className={cx('tabItem', { isActive: currentTab === item.key })} onClick={() => setCurrentTab(item.key)}>
            {item.text}
          </div>
        ))}
      </div>
      <div className="versionWrap flexRow">
        {VERSION_CARD_LIST.map(v => {
          const isCurrentVersion = versionId ? v.type === versionId && currentTab === period : v.type === 'free';
          const isFree = v.type === 'free' && !versionId;

          return (
            <div key={v.type} className="versionItem">
              <div className="Font26 bold mBottom25">{v.name}</div>
              <div className="priceRow flexRow">
                <div className="Font40 bold mRight8 lineHeight1">
                  <span>$</span>
                  <span className="mLeft4">{v.price[currentTab]}</span>
                </div>
                <div className="mLeft8">
                  {currentTab === 'yearly' && v.type !== 'free' && <div className="greenText">{_l('节省 18%')}</div>}
                  <div>{`/${_l('成员')}/` + (currentTab === 'monthly' ? _l('月') : _l('年'))}</div>
                </div>
              </div>
              <div className="Gray_75 mTop25 mBottom25">{v.description}</div>
              <div
                className={cx('upgradeBtn tip-top', { disabled: hasUpgraded(v) })}
                onClick={() => {
                  if (!hasUpgraded(v)) {
                    if (isCurrentVersion) {
                      navigateTo(`/admin/expansionservice/${projectId}/user`);
                      onCancel();
                    } else {
                      onPurchase(v);
                    }
                  }
                }}
                data-tip={hasUpgraded(v) && !isFree ? _l('您已升级至更高的版本') : undefined}
              >
                {hasUpgraded(v) ? (isFree ? _l('当前版本') : _l('已升级')) : _l('升级')}
              </div>
              <div className="mBottom20">{v.featureTitle}</div>
              {v.featureList.map((item, i) => (
                <div key={i} className="flexRow alignItemsCenter mBottom4">
                  <Icon icon="done" className="ThemeColor Font16" />
                  <span className="mLeft4">{item}</span>
                </div>
              ))}

              {isCurrentVersion && <div className="currentVersionTag">{_l('当前版本')}</div>}
            </div>
          );
        })}
      </div>
      <div
        className="TxtCenter mTop20 mBottom20 Font14 Gray_75 pointer ThemeHoverColor3"
        onClick={() => window.open('https://www.nocoly.com/pricing')}
      >
        <span>{_l('详细比较计划')}</span>
        <Icon icon="launch" className="mLeft8" />
      </div>
    </DialogWrap>
  );
}

export const versionUpgradeModal = props => FunctionWrap(VersionUpgrade, { ...props });

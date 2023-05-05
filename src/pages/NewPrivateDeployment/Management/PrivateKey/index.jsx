import React, { Fragment, Component, useState, useEffect } from 'react';
import cx from 'classnames';
import { Icon, LoadDiv, ScrollView, Tooltip, Radio } from 'ming-ui';
import { Button } from 'antd';
import Trigger from 'rc-trigger';
import privateGuideApi from 'src/api/privateGuide';
import ClipboardButton from 'react-clipboard.js';
import styled from 'styled-components';
import PrivateKeyDialog from './PrivateKeyDialog';
import DetailedDialog from './DetailedDialog';
import Projects from './Projects';
import weixinCode from '../../images/weixin.png';
import moment from 'moment';

const Wrap = styled.div`
  .paidUpgrade {
    position: absolute;
    right: 10px;
    top: 10px;
    padding: 0 10px;
    color: #FD9C27;
    font-size: 12px;
    display: flex;
    align-items: center;
    height: 25px;
    cursor: pointer;
    .icon {
      margin-right: 3px;
      font-size: 16px;
    }
  }
  .personalEntrypointInfo {
    color: #333333;
    background-color: #F5F5F5;
    padding: 10px;
    border-radius: 3px;
    a {
      text-decoration: none;
      margin: 0 3px 0 4px;
    }
  }
  .btnWrapper {
    margin-top: 20px;
    .detailed {
      color: #2196F3;
      font-size: 14px;
      margin-left: 20px;
      cursor: pointer;
    }
  }
  .addWeiXin {
    font-size: 13px;
    font-weight: bold;
    color: #47B14B;
    padding: 2px 10px;
    border-radius: 24px;
  }
  .personalEntrypointContent {
    margin-top: 24px;
    .justifyCenter {
      justify-content: center;
    }
    .titleWrapper {
      border-bottom: 1px solid #E3E3E3;
      padding: 0 10px 10px;
      margin-bottom: 10px;
      > div {
        flex: 1;
        text-align: center;
      }
    }
    .companyItem {
      padding: 10px;
      &:hover {
        background-color: #f6f6f6;
      }
      > div {
        flex: 1;
        text-align: center;
        justify-content: center;
      }
      .Radio-box {
        border-color: #47B14B;
      }
      .Radio-box-round {
        background-color: #47B14B;
      }
    }
    .associated {
      color: #2196F3;
    }
    .serverId {
      width: 200px;
      word-break: break-all;
    }
    .start {
      color: #47B14B;
    }
    .companyPrivateKeyItem {
      background-color: #F7F7F7;
      margin-top: 10px;
      padding: 20px;
    }
    .copyWrapper {
      position: absolute;
      right: 10px;
      bottom: 15px;
    }
    .withoutList {
      padding: 60px 0;
      .iconWrapper {
        color: #bdbdbd;
        width: 79px;
        height: 79px;
        border-radius: 50%;
        justify-content: center;
        background-color: #F5F5F5;
        margin-bottom: 20px;
      }
    }
    .applyBtn {
      color: #2196F3;
      font-size: 13px;
      padding: 8px 15px;
      border-radius: 3px;
      text-decoration: none;
      border: 1px solid #2196F3;
    }
  }
  .licenseCode {
    word-break: break-all;
    line-height: 28px;
  }
  .icon-content-copy {
    position: relative;
    top: 2px;
    left: 5px;
  }
`;


const LicenseVersions = [_l('社区版'), _l('标准版'), _l('专业版'), _l('大型企业版'), _l('教学版')];

const formatDate = date => {
  const year = moment(date).format('YYYY');
  if (year == 9999) {
    return _l('永久');
  }
  return moment(date).format('YYYY/MM/DD');
};

const isEfficacy = time => {
  let expirationDate = moment(time).add(1, 'd');
  return moment(expirationDate).isBefore(moment());
};

const PrivateKey = props => {
  const { SysSettings } = md.global;

  const [serverInfo, setServerInfo] = useState({});
  const [licenseList, setLicenseList] = useState([]);
  const [listLoading, setListLoading] = useState(true);

  const [privateKeyDialogVisible, setPrivateKeyDialogVisible] = useState(false);
  const [detailedDialogVisible, setDetailedDialogVisible] = useState(false);

  useEffect(() => {
    getServerLicenseList();
    privateGuideApi.getServerInfo().then(result => {
      setServerInfo(result);
    });
  }, []);

  const getServerLicenseList = () => {
    setListLoading(true);
    privateGuideApi.getServerLicenseList().then(result => {
      setLicenseList(result);
      setListLoading(false);
    });
  }

  const handleSetVisible = (visible, targetIndex) => {
    const data = licenseList.map((item, index) => {
      if (index === targetIndex) {
        item.visible = !visible;
      }
      return item;
    });
    setLicenseList(data);
  }

  const handleChangeState = (licenseCode, state, isEfficacyVlaue) => {
    if (state == 1 || isEfficacyVlaue) {
      return;
    }
    privateGuideApi.enableLicenseCode({
      licenseCode,
    }).then(result => {
      if (result) {
        const data = licenseList.map(item => {
          if (item.licenseCode === licenseCode) {
            item.state = 1;
          } else {
            item.state = -1;
          }
          return item;
        });
        setLicenseList(data);
      }
    });
  }

  const moreQueryParams = ('&ltv=' + serverInfo.licenseTemplateVersion);

  const renderLicenseItem = (item, index) => {
    const { serverId, licenseCode, startDate, expirationDate, licenseVersion, visible, state, technicalSupport, projectNum, projectUserNum, externalUserNum, applicationNum, workflowNum, worktableNum, worktableRowNum } = item;
    const isEfficacyVlaue = isEfficacy(expirationDate);
    return (
      <Fragment key={index}>
        <div className="flexRow companyItem">
          <div className="flex flexRow valignWrapper">
            <Icon
              icon={visible ? 'expand_more' : 'navigate_next'}
              className="Gray_9e Font18 pointer"
              onClick={() => handleSetVisible(visible, index)}
            />
            <Radio
              className="mLeft5 mRight0"
              value={index.toString()}
              checked={state == 1}
              onClick={() => handleChangeState(licenseCode, state, isEfficacyVlaue)}
            />
            {isEfficacyVlaue ? (
              <span className="Gray_75">{_l('已失效')}</span>
            ) : state == 1 ? (
              <span className="start">{_l('生效中')}</span>
            ) : (
              <span className="Gray_75">{_l('未生效')}</span>
            )}
          </div>
          <div className="flex flexRow valignWrapper">
            <span className="mLeft5 serverId">{LicenseVersions[licenseVersion]}</span>
          </div>
          <div className="flex flexRow valignWrapper">{formatDate(startDate)}</div>
          <div className="flex flexRow valignWrapper">{formatDate(expirationDate)}</div>
          <div className="flex flexRow valignWrapper">{technicalSupport ? formatDate(technicalSupport) : '--'}</div>
          <div className="flex flexRow valignWrapper">{projectNum == 2147483647 ? '不限' : projectNum}</div>
          <div className="flex flexRow valignWrapper">{projectUserNum == 2147483647 ? '不限' : projectUserNum}</div>
          <div className="flex flexRow valignWrapper">{externalUserNum == 2147483647 ? '不限' : externalUserNum}</div>
          <div className="flex flexRow valignWrapper">{applicationNum == 2147483647 ? '不限' : applicationNum}</div>
          <div className="flex flexRow valignWrapper">{worktableNum == 2147483647 ? '不限' : worktableNum}</div>
          <div className="flex flexRow valignWrapper">{worktableRowNum == 2147483647 ? '不限' : worktableRowNum}</div>
          <div className="flex flexRow valignWrapper">{workflowNum == 1000000 ? '不限' : workflowNum}</div>
          <div className="flex flexRow valignWrapper">
            <Projects usable={!isEfficacyVlaue && state == 1} />
          </div>
        </div>
        {visible && (
          <div className="flexColumn valignWrapper companyPrivateKeyItem">
            <div className="flex flexRow w100 mBottom10">
              <div className="Gray_75 mBottom5 mRight5">{_l('服务器ID')}</div>
              <div className="flex">{serverId}</div>
            </div>
            <div className="flex flexRow w100">
              <div className="Gray_75 mBottom5 mRight5">{_l('产品密钥')}</div>
              <div className="flex Relative">
                <span className="licenseCode">{licenseCode}</span>
                <Tooltip text={<span>{_l('复制')}</span>} popupPlacement="bottom">
                  <ClipboardButton
                    component="span"
                    data-clipboard-text={licenseCode}
                    onSuccess={() => {
                      alert(_l('复制成功'));
                    }}
                  >
                    <Icon icon="content-copy" className="pointer Gray_9e Font16" />
                  </ClipboardButton>
                </Tooltip>
              </div>
            </div>
          </div>
        )}
      </Fragment>
    );
  }

  const renderPrivateKeyDialog = () => {
    return (
      <PrivateKeyDialog
        visible={privateKeyDialogVisible}
        onCancel={() => {
          setPrivateKeyDialogVisible(false);
        }}
        onSave={() => {
          getServerLicenseList();
        }}
      />
    );
  }

  const renderDetailedDialog = () => {
    return (
      <DetailedDialog
        visible={detailedDialogVisible}
        serverInfo={serverInfo}
        onCancel={() => {
          setDetailedDialogVisible(false);
        }}
      />
    );
  }

  return (
    <Wrap className="privateCardWrap big h100 flexColumn Relative">
      <div className="Font17 bold mBottom8">{_l('密钥管理')}</div>
      <div
        className="paidUpgrade"
        onClick={() => {
          window.open('https://www.mingdao.com/privateDeployment.htm');
        }}
      >
        <Icon icon="enterprise_network" />
        <span>{_l('付费升级')}</span>
      </div>
      <div className="personalEntrypointInfo flexRow valignWrapper">
        {_l('密钥是用于激活')}
        <a className="pointer" href="https://www.mingdao.com/privateDeployment.htm" target="_blank">
          {_l('私有部署版本')}
        </a>
        ，{_l('建议您添加私有版微信客服，获得各类支持与问题解答')}
        <Trigger
          action={['hover']}
          popup={<img className="card z-depth-2" style={{ width: 300 }} src={weixinCode} />}
          popupAlign={{
            offset: [0, 7],
            points: ['tc', 'bc'],
            overflow: { adjustX: 1, adjustY: 2 },
          }}
        >
          <div className="addWeiXin pointer">
            <Icon icon="weixin" className="mRight2" />
            {_l('添加微信')}
          </div>
        </Trigger>
      </div>
      <div className="btnWrapper flexRow valignWrapper">
        <Button type="primary" onClick={() => setPrivateKeyDialogVisible(true)}>
          <Icon icon="add" />
          {_l('密钥')}
        </Button>
        <div className="detailed" onClick={() => setDetailedDialogVisible(true)}>{_l('详情')}</div>
      </div>
      <div className="personalEntrypointContent flex flexColumn">
        <div className="flexRow titleWrapper">
          <div className="Bold Gray_75">{_l('状态')}</div>
          <div className="Bold Gray_75">{_l('版本')}</div>
          <div className="Bold Gray_75">{_l('开始时间')}</div>
          <div className="Bold Gray_75">{_l('到期时间')}</div>
          <div className="Bold Gray_75">{_l('升级服务到期')}</div>
          <div className="Bold Gray_75">{_l('组织')}</div>
          <div className="Bold Gray_75">{_l('用户')}</div>
          <div className="Bold Gray_75">{_l('外部用户')}</div>
          <div className="Bold Gray_75">{_l('应用')}</div>
          <div className="Bold Gray_75">{_l('工作表')}</div>
          <div className="Bold Gray_75">{_l('行记录/表')}</div>
          <div className="Bold Gray_75">{_l('工作流执行/月')}</div>
          <div className="Bold Gray_75">{_l('关联组织')}</div>
        </div>
        {
          listLoading ? (
            <div className="mTop30"><LoadDiv size="middle" /></div>
          ) : (
            licenseList.length ? (
              <ScrollView className="flex">{licenseList.map((item, index) => renderLicenseItem(item, index))}</ScrollView>
            ) : (
              <div className="withoutList flexColumn valignWrapper">
                <div className="iconWrapper flexRow valignWrapper">
                  <Icon className="Font40" icon="Empty_nokey" />
                </div>
                <div className="Gray_75">{_l('暂无密钥')}</div>
                <div className="mTop30">
                  <a href={`https://www.mingdao.com/register?ReturnUrl=${encodeURIComponent(`/personal?type=privatekey${moreQueryParams}&serverId=${serverInfo.serverId}#apply`)}`} target="_blank" className="applyBtn mRight10">{_l('注册并申请')}</a>
                  <a href={`https://www.mingdao.com/personal?type=privatekey${moreQueryParams}&serverId=${serverInfo.serverId}#apply`} target="_blank" className="applyBtn">{_l('登录并申请')}</a>
                </div>
              </div>
            )
          )
        }
      </div>
      {renderPrivateKeyDialog()}
      {renderDetailedDialog()}
    </Wrap>
  );
};

export default PrivateKey;


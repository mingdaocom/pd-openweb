import React, { Fragment, useRef, useState } from 'react';
import cx from 'classnames';
import copy from 'copy-to-clipboard';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import { Dialog, Icon, LoadDiv, Textarea } from 'ming-ui';
import privateGuideApi from 'src/api/privateGuide';
import { LicenseVersions } from '../common';
import Projects from '../Management/PrivateKey/Projects';
import { LICENSE_TYPES } from './constant';

const CodeInfoWrap = styled.div`
  .item {
    width: 25%;
    margin-bottom: 20px;
  }
`;

export default props => {
  const {
    codeInfo = { didb: {}, dici: {}, mpc: {}, dp: {} },
    platformLicenseInfo = {},
    visible,
    onCancel,
    onSave,
  } = props;
  const [licenseCode, setLicenseCode] = useState('');
  const [verifyLicenseCode, setVerifyLicenseCode] = useState('');
  const [verifyLicenseInfo, setVerifyLicenseInfo] = useState({});
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const projectsRef = useRef(null);
  const { isPlatform = true } = platformLicenseInfo;

  const handleAddPrivateKey = () => {
    if (_.isEmpty(licenseCode)) {
      setPrompt(_l('请输入密钥'));
      setVerifyLicenseCode('');
      return;
    }
    if (loading) return;
    setLoading(true);
    setVerifyLicenseCode('');
    setPrompt('');
    if (!isPlatform) {
      privateGuideApi
        .verifyLicenseCode({
          licenseCode,
        })
        .then(result => {
          setLoading(false);
          setVerifyLicenseInfo({
            ...result,
            originCode: result.licenseCode,
            dp: result.dataPipelineJobNum > 0,
            sse: result.extraInfo.sse === '1',
            internalUserNum: result.projectUserNum,
            upgradeExpirationDate: result.technicalSupport,
          });
          onCancel();
          setLicenseCode('');
          setVerifyLicenseCode('');
          if (projectsRef.current) {
            projectsRef.current.handlePopupVisibleChange(true);
          }
        })
        .catch(error => {
          setLoading(false);
          setPrompt(error.errorMessage);
        });
      return;
    }
    privateGuideApi
      .bindLicenseCode({
        licenseCode,
      })
      .then(result => {
        setVerifyLicenseCode(result);
        setLoading(false);
        if (result) {
          alert(_l('添加成功'));
          onSave();
          onCancel();
          setLicenseCode('');
          setVerifyLicenseCode('');
        }
      })
      .catch(error => {
        setLoading(false);
        setPrompt(error.errorMessage);
      });
  };

  return (
    <Fragment>
      <Dialog
        visible={visible}
        anim={false}
        title={codeInfo ? _l('密钥信息') : _l('更新密钥')}
        width={codeInfo ? 680 : 560}
        onOk={() => {
          if (codeInfo) {
            onCancel();
          } else {
            handleAddPrivateKey();
          }
        }}
        onCancel={onCancel}
        showCancel={codeInfo ? false : true}
        okText={codeInfo ? _l('关闭') : isPlatform ? _l('确定') : _l('下一步')}
      >
        {codeInfo ? (
          <CodeInfoWrap className="overflowHidden">
            <div className="item left">
              <div className="Gray_9e">{_l('密钥类型')}</div>
              <div>{LICENSE_TYPES[codeInfo.licenseType]}</div>
            </div>
            {codeInfo.licenseType === 1 && (
              <div className="item left">
                <div className="Gray_9e">{_l('版本')}</div>
                <div>{codeInfo.isPlatform ? _l('平台版') : LicenseVersions[codeInfo.licenseVersion]}</div>
              </div>
            )}
            <div className="item left">
              <div className="Gray_9e">{_l('到期时间')}</div>
              <div>{moment(codeInfo.expirationDate).format('YYYY-MM-DD')}</div>
            </div>
            {codeInfo.licenseType === 2 && (
              <React.Fragment>
                <div className="item left">
                  <div className="Gray_9e">{_l('直接同步任务数')}</div>
                  <div>
                    {codeInfo.dp.dataPipelineJobNum === 2147483647 ? _l('不限') : codeInfo.dp.dataPipelineJobNum}
                  </div>
                </div>
                <div className="item left">
                  <div className="Gray_9e">{_l('数据同步算力数')}</div>
                  <div>
                    {codeInfo.dp.dataPipelineRowNum === 2147483647 ? _l('不限') : codeInfo.dp.dataPipelineRowNum}
                  </div>
                </div>
                <div className="item left">
                  <div className="Gray_9e">{_l('ETL同步算力数')}</div>
                  <div>
                    {codeInfo.dp.dataPipelineEtlJobNum === 2147483647 ? _l('不限') : codeInfo.dp.dataPipelineEtlJobNum}
                  </div>
                </div>
              </React.Fragment>
            )}
            {[3, 4].includes(codeInfo.licenseType) && (
              <div className="item left">
                <div className="Gray_9e">{_l('实例数')}</div>
                <div>{codeInfo.licenseType === 3 ? codeInfo.didb.instanceNum : codeInfo.dici.instanceNum}</div>
              </div>
            )}
            {[6].includes(codeInfo.licenseType) && (
              <div className="item left">
                <div className="Gray_9e">{_l('支付商户数')}</div>
                <div>{codeInfo.mpc.num}</div>
              </div>
            )}
            {codeInfo.licenseType === 1 && (
              <React.Fragment>
                <div className="item left">
                  <div className="Gray_9e">{_l('升级服务到期时间')}</div>
                  <div>
                    {codeInfo.upgradeExpirationDate ? moment(codeInfo.upgradeExpirationDate).format('YYYY-MM-DD') : '-'}
                  </div>
                </div>
                <div className="item left">
                  <div className="Gray_9e">{_l('内部用户配额')}</div>
                  <div>{codeInfo.internalUserNum ? codeInfo.internalUserNum.toLocaleString() : '-'}</div>
                </div>
                <div className="item left">
                  <div className="Gray_9e">{_l('外部用户配额')}</div>
                  <div>{codeInfo.externalUserNum ? codeInfo.externalUserNum.toLocaleString() : '-'}</div>
                </div>
                {!codeInfo.isPlatform && (
                  <Fragment>
                    <div className="item left">
                      <div className="Gray_9e">{_l('组织数')}</div>
                      <div>{codeInfo.projectNum}</div>
                    </div>
                    <div className="item left">
                      <div className="Gray_9e">{_l('应用总数上限')}</div>
                      <div>{codeInfo.applicationNum === 2147483647 ? _l('不限') : codeInfo.applicationNum}</div>
                    </div>
                    <div className="item left">
                      <div className="Gray_9e">{_l('工作表总数上限')}</div>
                      <div>{codeInfo.worktableNum === 2147483647 ? _l('不限') : codeInfo.worktableNum}</div>
                    </div>
                    <div className="item left">
                      <div className="Gray_9e">{_l('行记录总数上限/单表')}</div>
                      <div>{codeInfo.worktableRowNum === 2147483647 ? _l('不限') : codeInfo.worktableRowNum}</div>
                    </div>
                    <div className="item left">
                      <div className="Gray_9e">{_l('工作流总数上限/单月')}</div>
                      <div>{codeInfo.workflowNum >= 1000000 ? _l('不限') : codeInfo.workflowNum * 1000}</div>
                    </div>
                  </Fragment>
                )}
                <div className="item left">
                  <div className="Gray_9e">{_l('数据集成')}</div>
                  <div className="valignWrapper">
                    <Icon className={cx('Font20', codeInfo.dp ? 'ThemeColor' : 'Gray_bd')} icon="a-Data_integration1" />
                    <div>{codeInfo.dp ? _l('已授权') : _l('未授权')}</div>
                  </div>
                </div>
                <div className="item left">
                  <div className="Gray_9e">{_l('超级搜索')}</div>
                  <div className="valignWrapper">
                    <Icon className={cx('Font20', codeInfo.sse ? 'ThemeColor' : 'Gray_bd')} icon="search" />
                    {codeInfo.sse ? _l('已授权') : _l('未授权')}
                  </div>
                </div>
              </React.Fragment>
            )}
            <div className="item left">
              <div className="Gray_9e">{_l('密钥')}</div>
              <div className="valignWrapper" title={codeInfo.originCode}>
                <div className="ellipsis">{codeInfo.originCode}</div>
                <Icon
                  icon="copy"
                  className="Gray_9e Font17 pointer"
                  onClick={() => {
                    copy(codeInfo.originCode);
                    alert(_l('复制成功'));
                  }}
                />
              </div>
            </div>
          </CodeInfoWrap>
        ) : (
          <Fragment>
            <div className="mBottom10">
              <span className="Gray_75 Font13">{_l('请输入您的密钥')}</span>
            </div>
            <Textarea
              value={licenseCode}
              onChange={value => {
                setLicenseCode(value);
              }}
            />
            {loading ? (
              <div className="flexRow verifyInfo Gray_75 mBottom10">
                <LoadDiv className="mAll0 mRight5" size="small" />
                {_l('正在验证您的产品密钥')}
              </div>
            ) : (
              _.isBoolean(verifyLicenseCode) &&
              !verifyLicenseCode && <div className="mBottom10 Red">{_l('密钥验证失败, 请重新填写')}</div>
            )}
            {prompt ? <div className="mBottom10 Red">{prompt}</div> : null}
          </Fragment>
        )}
      </Dialog>
      {!codeInfo && !isPlatform && (
        <Projects
          title={_l('更新密钥')}
          ref={projectsRef}
          verifyLicenseInfo={verifyLicenseInfo}
          content={''}
          usable={true}
          onSave={onSave}
        />
      )}
    </Fragment>
  );
};

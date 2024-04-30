import React, { Fragment, useState, useEffect } from 'react';
import { Icon, Dialog, Textarea, LoadDiv } from 'ming-ui';
import privateGuideApi from 'src/api/privateGuide';
import { LicenseVersions } from '../common';
import moment from 'moment';
import cx from 'classnames';
import styled from 'styled-components';
import copy from 'copy-to-clipboard';
import _ from 'lodash';

const CodeInfoWrap = styled.div`
  .item {
    width: 25%;
    margin-bottom: 20px;
  }
`;

export default props => {
  const { codeInfo, visible, onCancel, onSave } = props;
  const [licenseCode, setLicenseCode] = useState('');
  const [verifyLicenseCode, setVerifyLicenseCode] = useState('');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

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
    privateGuideApi.bindLicenseCode({
      licenseCode,
    }).then(result => {
      setVerifyLicenseCode(result);
      setLoading(false);
      if (result) {
        alert(_l('添加成功'));
        onSave();
        onCancel();
        setLicenseCode('');
        setVerifyLicenseCode('');
      }
    }).catch(error => {
      setLoading(false);
      setPrompt(error.errorMessage);
    });
  }

  return (
    <Dialog
      visible={visible}
      anim={false}
      title={codeInfo ? _l('当前密钥') : _l('更新密钥')}
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
      okText={codeInfo ? _l('关闭') : _l('确定')}
    >
      {codeInfo ? (
        <CodeInfoWrap className="overflowHidden">
          <div className="item left">
            <div className="Gray_9e">{_l('版本')}</div>
            <div>{codeInfo.isPlatform ? _l('平台版') : LicenseVersions[codeInfo.licenseVersion]}</div>
          </div>
          <div className="item left">
            <div className="Gray_9e">{_l('密钥到期时间')}</div>
            <div>{moment(codeInfo.expirationDate).format('YYYY-MM-DD')}</div>
          </div>
          <div className="item left">
            <div className="Gray_9e">{_l('升级服务到期时间')}</div>
            <div>{codeInfo.upgradeExpirationDate ? moment(codeInfo.upgradeExpirationDate).format('YYYY-MM-DD') : '-'}</div>
          </div>
          <div className="item left">
            <div className="Gray_9e">{_l('内部用户配额')}</div>
            <div>{codeInfo.internalUserNum.toLocaleString()}</div>
          </div>
          <div className="item left">
            <div className="Gray_9e">{_l('外部用户配额')}</div>
            <div>{codeInfo.externalUserNum.toLocaleString()}</div>
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
                <div>{codeInfo.workflowNum >= 1000000 ? _l('不限') : codeInfo.workflowNum * 1000 }</div>
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
            { !md.global.Config.IsPlatformLocal && <span className="Red Font14">{_l('（多组织下请注意手动绑定组织）')}</span> }
          </div>
          <Textarea
            value={licenseCode}
            onChange={value => {
              setLicenseCode(value);
            }}
          />
          {
            loading ? (
              <div className="flexRow verifyInfo Gray_75 mBottom10">
                <LoadDiv className="mAll0 mRight5" size="small" />
                {_l('正在验证您的产品密钥')}
              </div>
            ) : (
              (_.isBoolean(verifyLicenseCode) && !verifyLicenseCode) && <div className="mBottom10 Red">{_l('密钥验证失败, 请重新填写')}</div>
            )
          }
          {prompt ? <div className="mBottom10 Red">{prompt}</div> : null}
        </Fragment>
      )}
    </Dialog>
  );
}

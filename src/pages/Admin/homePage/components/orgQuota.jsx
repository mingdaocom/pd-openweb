import React, { Fragment } from 'react';
import { Progress } from 'antd';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { navigateTo } from 'src/router/navigateTo';
import { getFeatureStatus } from 'src/utils/project';
import PurchaseExpandPack from '../../components/PurchaseExpandPack';
import { PERMISSION_ENUM } from '../../enum';
import { UPLOAD_COUNT } from '../config';
import { TitleWrap } from '../styled';
import { formatFileSize, getValue } from '../utils';

// 租住管理首页-组织额度
export default function orgQuota(props) {
  const { projectId, data, isFree, isTrial, isLocal, authority, updateData = () => {} } = props;
  const analysisPermission = authority.includes(PERMISSION_ENUM.USER_ANALYTICS);
  const IsPlatformLocal = md.global.Config.IsPlatformLocal;
  const hasBalance = IsPlatformLocal !== false && authority.includes(PERMISSION_ENUM.FINANCE);
  const isCloseProject = !_.find(md.global.Account.projects, l => l.projectId === projectId);

  const getNoLimit = key => {
    if (isCloseProject) return false;

    switch (key) {
      case 'limitApkCount':
      case 'limitWorksheetCount':
      case 'limitAllWorksheetRowCount':
      case 'limitDataPipelineRowCount':
      case 'limitDataPipelineJobCount':
      case 'limitAggregationTableCount':
      case 'limitDataPipelineEtlJobCount':
        return data[key] >= 2147483647;
      case 'limitExecCount':
        return data[key] >= 1000000000;
    }
    return false;
  };

  const getCountProcess = (key, limit) => {
    if (getValue(data[limit]) === '-' || getNoLimit(limit)) return 1;

    let percent = 0;

    if (
      [
        'effectiveDataPipelineRowCount',
        'useExecCount',
        'effectiveAggregationTableCount',
        'effectiveExternalUserCount',
        'effectiveWorksheetCount',
        'effectiveWorksheetRowCount',
      ].includes(key)
    ) {
      percent =
        data[key] / data[limit] > 0 && (data[key] / data[limit]) * 10000 <= 1
          ? 0.01
          : ((data[key] / data[limit]) * 100).toFixed(2);
    } else {
      percent = ((data[key] / (getValue(data[limit]) * Math.pow(1024, 3))) * 100).toFixed(2);
    }
    return percent;
  };

  const getAllowAdd = key => {
    switch (key) {
      case 'limitExternalUserCount':
        return !isFree && !isTrial;
      default:
        return !getNoLimit(key) && !isCloseProject;
    }
  };

  const getUsage = key => {
    if (getValue(data[key]) === '-' || getNoLimit(key)) return _l('不限');

    let value = key === 'effectiveApkStorageCount' ? formatFileSize(data[key]) : getValue(data[key]);
    let overMillion = false;
    let overTenThousand = false;
    if (key !== 'effectiveApkStorageCount') {
      overMillion = data[key] >= 100000000;
      overTenThousand = data[key] >= 10000;
      value = overMillion
        ? _.floor(getValue(data[key] / 100000000), 4)
        : overTenThousand
          ? getValue(data[key] / 10000)
          : value;
    }

    switch (key) {
      case 'effectiveApkStorageCount':
        return value;
      case 'effectiveWorksheetRowCount':
      case 'limitAllWorksheetRowCount':
      case 'effectiveDataPipelineRowCount':
      case 'limitDataPipelineRowCount':
        return overMillion ? _l('%0 亿+行', value) : overTenThousand ? _l('%0 万行', value) : _l('%0 行', value);
      case 'useExecCount':
      case 'limitExecCount':
        return overMillion ? _l('%0 亿+次', value) : overTenThousand ? _l('%0 万次', value) : _l('%0 次', value);
      case 'effectiveExternalUserCount':
      case 'limitExternalUserCount':
        return overMillion ? _l('%0 亿+人', value) : overTenThousand ? _l('%0 万人', value) : _l('%0 人', value);
      case 'effectiveApkCount':
      case 'limitApkCount':
      case 'effectiveWorksheetCount':
      case 'limitWorksheetCount':
      case 'effectiveAggregationTableCount':
      case 'limitAggregationTableCount':
      case 'effectiveDataPipelineJobCount':
      case 'limitDataPipelineJobCount':
      case 'effectiveDataPipelineEtlJobCount':
      case 'limitDataPipelineEtlJobCount':
        return overMillion ? _l('%0 亿+个', value) : overTenThousand ? _l('%0 万个', value) : _l('%0 个', value);
      default:
    }
  };

  const getCountText = (key, limit) => {
    const isAttachmentUpload = key === 'effectiveApkStorageCount'; // 附件上传量

    return (
      <div className="useCount">
        <div>
          {_l('已用:')} <span className="mLeft3">{getUsage(key)}</span>
        </div>
        <div className="flex TxtRight">
          <span className="mLeft4">{isAttachmentUpload ? `${getValue(data[limit])}GB` : getUsage(limit)}</span>
        </div>
      </div>
    );
  };

  return (
    <Fragment>
      <TitleWrap>
        <span className="flex overflow_ellipsis">{_l('组织额度')}</span>
        {analysisPermission && (
          <span className="titleBtn" onClick={() => navigateTo(`/admin/analytics/${projectId}`)}>
            <Icon icon="stats_line_chart" className="ThemeColor Font16 mRight3" />
            {_l('使用分析')}
          </span>
        )}
      </TitleWrap>
      <div className="infoWrap infoWrapCopy">
        <div className="infoBox pRight0">
          <div className="userInfo">
            <div className="content">
              <ul>
                {UPLOAD_COUNT.filter(item => (IsPlatformLocal || !isLocal ? item : item.isLocalFilter)).map(item => {
                  const { key, limit, text, link, click, featureId, routePath = undefined, autoPurchase } = item;

                  if (featureId && !getFeatureStatus(projectId, featureId)) return;

                  const percentValue = getCountProcess(key, limit);

                  return (
                    <li
                      className="Hand"
                      onClick={() => {
                        if (
                          [
                            'effectiveDataPipelineRowCount',
                            'effectiveDataPipelineJobCount',
                            'effectiveDataPipelineEtlJobCount',
                          ].includes(key)
                        ) {
                          localStorage.setItem('currentProjectId', projectId);
                          return location.assign('/integration/task');
                        }
                        link && navigateTo(`/admin/${link}/${projectId}`);
                      }}
                    >
                      <div className="workflowTitle flexRow">
                        <div className="flex">
                          <span className="Font15 Bold">{text}</span>
                          {key === 'effectiveApkStorageCount' && (
                            <Tooltip placement="top" title={_l('应用中本年的附件上传量，上传即占用，删除不会恢复')}>
                              <span className="icon-help1 Font13 Gray_9e" />
                            </Tooltip>
                          )}
                        </div>
                        {link && <span className="Gray_9e Bold Font13 Hover_21 detailBtn">{_l('查看')}</span>}
                        {!!item.PurchaseExpandPack && getAllowAdd(limit) && (
                          <PurchaseExpandPack
                            className="mLeft12 Bold Hover_theme"
                            text={_l('扩容')}
                            type={click}
                            projectId={projectId}
                            routePath={routePath}
                          />
                        )}
                      </div>
                      <Progress
                        showInfo={false}
                        style={{ margin: '7px 0', textAlign: 'left' }}
                        trailColor="#eaeaea"
                        strokeColor={
                          _.isNaN(Number(percentValue))
                            ? '#eaeaea'
                            : percentValue > 90
                              ? { from: '#F51744 ', to: '#FF5779' }
                              : { from: '#1677ff ', to: '#4bb2ff' }
                        }
                        strokeWidth={4}
                        percent={percentValue}
                      />
                      {getCountText(key, limit)}
                      {!isLocal && hasBalance && !!autoPurchase && !data[autoPurchase] && (
                        <span
                          className="mTop10 InlineBlock Gray_75 Font13 Underline Hover_21"
                          onClick={e => {
                            e.stopPropagation();
                            updateData({ balanceManageVisible: true });
                          }}
                        >
                          {_l('启用自动增补')}
                        </span>
                      )}
                      {data[autoPurchase] && item.autoPurchaseText && (
                        <div className="mTop10 Gray_75 Font13 mul2_overflow_ellipsis">{item.autoPurchaseText}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
}

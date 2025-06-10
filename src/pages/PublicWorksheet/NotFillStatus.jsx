import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { RichText } from 'ming-ui';
import { Hr } from 'worksheet/components/Basics';
import FixedContent from 'src/components/FixedContent';
import { getRequest } from 'src/utils/common';
import { renderText } from 'src/utils/control';
import { FILL_STATUS } from './enum';
import FilledRecord from './FilledRecord';
import { canSubmitByLimitFrequency } from './utils';

const Con = styled.div`
  height: 100%;
  justify-content: center;
  align-items: center;
  display: flex;
  text-align: center;
  padding: 100px 0 0 0;

  .unusualContentWrap {
    padding-bottom: 100px;
    .unusualContent {
      box-shadow: none !important;
    }
  }
`;
const Tip1 = styled.div`
  font-size: 24px;
  font-weight: 500;
  padding: 0 20px;
`;
const Tip2 = styled.div`
  font-size: 15px;
`;
const Receipt = styled.div`
  word-break: break-all;
  font-size: 14px;
  color: #757575;
  text-align: left;
  padding: 0 50px;
  white-space: pre-line;
  min-height: 200px;
  width: 100%;
  box-sizing: border-box;
  overflow: auto;
  ol,
  ul {
    list-style-position: outside;
    list-style: decimal;
    margin-left: 16px;
  }
  img {
    max-width: 100%;
  }
`;

function getIcon(status, worksheetId) {
  if (!worksheetId) {
    return { icon: 'icon-closeelement-bg-circle', color: '#f44133' };
  }
  switch (status) {
    case FILL_STATUS.COMPLETED:
      return { icon: 'icon-plus-interest', color: '#4CAF50' };
    default:
      return { icon: 'icon-task-folder-message', color: '#FF6200' };
  }
}

function getTip(worksheetId, status) {
  if (!worksheetId) {
    return _l('你访问的表单不存在');
  }

  switch (status) {
    case FILL_STATUS.CLOSE:
      return _l('你访问的表单已停止数据收集！');
    case FILL_STATUS.NOT_OPEN:
      return _l('你访问的表单暂未开放！');
    case FILL_STATUS.ONLY_WECHAT_FILL:
      return _l('此表单仅限在微信客户端中填写');
    case FILL_STATUS.NO_PROJECT_USER:
      return _l('此表单仅限本组织用户填写');
    case FILL_STATUS.COMPLETED:
      return _l('提交成功');
    default:
      return '';
  }
}

const StatusIcon = ({ status, worksheetId }) => {
  return (
    <i
      className={`icon ${getIcon(status, worksheetId).icon}`}
      style={{
        fontSize: 80,
        color: getIcon(status, worksheetId).color,
      }}
    ></i>
  );
};

StatusIcon.propTypes = { status: PropTypes.string };

export default function NotFillStatus(props) {
  const { status, publicWorksheetInfo, onRefill, formData, rules, fillData = [] } = props;
  const {
    worksheetId,
    name,
    limitWriteFrequencySetting,
    receipt,
    linkSwitchTime = {},
    abilityExpand = {},
    shareId,
    fixRemark,
    extendDatas,
  } = publicWorksheetInfo;
  const canSubmitByLimit = canSubmitByLimitFrequency(shareId, limitWriteFrequencySetting);
  const request = getRequest();
  const afterSubmit = safeParse(extendDatas.afterSubmit);

  const handleReceive = () => {
    const text = afterSubmit.content || '';
    const output = text.replace(/#\{([^}]+)\}/g, (match, controlId) => {
      const control = _.find(fillData, l => l.controlId === controlId);

      if (control.type === 14 && control.value && !_.isArray(safeParse(control.value))) {
        const fileValue = _.get(safeParse(control.value), 'attachments');
        fileValue &&
          fileValue.forEach(l => {
            l.ext = l.fileExt;
            l.originalFilename = l.originalFileName;
          });
        control.value = JSON.stringify(fileValue);
      }

      return control ? renderText(control) : '';
    });
    return output;
  };

  if (request.statusAll === 'no') {
    return null;
  }

  return (
    <Con className="notFillStatus">
      {status === FILL_STATUS.FIXED ? (
        <FixedContent showLeftSkeleton={false} appPkg={{ fixRemark }} hideFixAccount={true} />
      ) : (
        <div style={{ width: '100%' }}>
          <StatusIcon status={status} worksheetId={worksheetId} />

          {worksheetId && <Tip1 className="mTop10">{name || _l('未命名表单')}</Tip1>}

          <Tip2 className="mTop8">{getTip(worksheetId, status)}</Tip2>

          {status === FILL_STATUS.NOT_OPEN && (
            <Tip2 className="mTop8">
              {_l('表单将于') + moment(linkSwitchTime.startTime).format('YYYY年MM月DD日 HH:mm') + _l('开放填写')}
            </Tip2>
          )}

          {status === FILL_STATUS.COMPLETED &&
            request.statusExtra !== 'no' &&
            (canSubmitByLimit || !!_.get(abilityExpand, 'allowViewChange.isAllowViewChange')) && (
              <Tip2
                style={{ color: '#2196F3', margin: '24px 0', fontWeight: 600 }}
                className="flexRow justifyContentCenter alignItemsCenter"
              >
                <FilledRecord
                  isFillPage={false}
                  publicWorksheetInfo={publicWorksheetInfo}
                  formData={formData}
                  rules={rules}
                  status={status}
                />
                {canSubmitByLimit && (
                  <span className="Hand" onClick={onRefill}>
                    {_l('再填写一份')}
                  </span>
                )}
              </Tip2>
            )}

          <div style={{ minHeight: !receipt ? '224px' : '200px' }}>
            {afterSubmit.action === 1 && afterSubmit.content && status === FILL_STATUS.COMPLETED && (
              <React.Fragment>
                <Hr style={{ margin: '20px 0 4px' }} />
                <Receipt className="receipt">
                  <RichText data={handleReceive()} className="" disabled={true} />
                </Receipt>
              </React.Fragment>
            )}
          </div>
        </div>
      )}
    </Con>
  );
}

NotFillStatus.propTypes = {
  status: PropTypes.number,
  publicWorksheetInfo: PropTypes.shape({}),
  onRefill: PropTypes.func,
};

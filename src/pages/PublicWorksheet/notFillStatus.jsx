import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Hr } from 'worksheet/components/Basics';
import { FILL_TIMES } from 'src/pages/publicWorksheetConfig/enum';
import { FILL_STATUS } from './enum';
import { RichText } from 'ming-ui';
import moment from 'moment';
import _ from 'lodash';
import FilledRecord from './FilledRecord';

const Con = styled.div`
  height: 100%;
  justify-content: center;
  align-items: center;
  display: flex;
  text-align: center;
  padding: 100px 0 0 0;
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

function getTip(worksheetId, status, fillTimes) {
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
      return fillTimes === FILL_TIMES.DAILY ? _l('提交成功！明天还可以继续提交') : _l('提交成功');
    default:
      return '';
  }
}

const Icon = ({ status }) => {
  return (
    <i
      className={`icon ${status === FILL_STATUS.COMPLETED ? 'icon-plus-interest' : 'icon-task-folder-message'}`}
      style={{
        fontSize: 80,
        color: status === FILL_STATUS.COMPLETED ? '#4CAF50' : '#FF6200',
      }}
    ></i>
  );
};

Icon.propTypes = { status: PropTypes.string };

export default function NotFillStatus(props) {
  const { status, publicWorksheetInfo, onRefill, formData, rules } = props;
  const { worksheetId, name, fillTimes, receipt, linkSwitchTime = {}, abilityExpand = {} } = publicWorksheetInfo;

  return (
    <Con className="notFillStatus">
      <div style={{ width: '100%' }}>
        {worksheetId ? (
          <Icon status={status} />
        ) : (
          <i className="icon icon-closeelement-bg-circle" style={{ fontSize: 80, color: '#f44133' }}></i>
        )}
        {worksheetId && <Tip1 className="mTop10">{name || _l('未命名表单')}</Tip1>}
        <Tip2 className="mTop8">{getTip(worksheetId, status, fillTimes)}</Tip2>
        {status === FILL_STATUS.NOT_OPEN && (
          <Tip2 className="mTop8">
            {_l('表单将于') + moment(linkSwitchTime.startTime).format('YYYY年MM月DD日 HH:mm') + _l('开放填写')}
          </Tip2>
        )}
        {status === FILL_STATUS.COMPLETED &&
          (fillTimes === FILL_TIMES.UNLIMITED || !!_.get(abilityExpand, 'allowViewChange.isAllowViewChange')) && (
            <Tip2
              style={{ color: '#2196F3', margin: '24px 0 32px', fontWeight: 600 }}
              className="flexRow justifyContentCenter alignItemsCenter"
            >
              <FilledRecord
                isFillPage={false}
                publicWorksheetInfo={publicWorksheetInfo}
                formData={formData}
                rules={rules}
                status={status}
              />
              {fillTimes === FILL_TIMES.UNLIMITED && (
                <span className="Hand" onClick={onRefill}>
                  {_l('再填写一份')}
                </span>
              )}
            </Tip2>
          )}

        <div style={{ minHeight: !receipt ? '224px' : '200px' }}>
          {receipt && status === FILL_STATUS.COMPLETED && (
            <React.Fragment>
              <Hr style={{ margin: '20px 0 4px' }} />
              <Receipt className="receipt">
                <RichText data={receipt || ''} className="" disabled={true} />
              </Receipt>
            </React.Fragment>
          )}
        </div>
      </div>
    </Con>
  );
}

NotFillStatus.propTypes = {
  status: PropTypes.number,
  publicWorksheetInfo: PropTypes.shape({}),
  onRefill: PropTypes.func,
};

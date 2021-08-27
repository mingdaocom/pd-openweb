import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Linkify from 'react-linkify';
import { Hr } from 'src/pages/publicWorksheetConfig/components/Basics';
import { FILL_TIMES } from 'src/pages/publicWorksheetConfig/enum';
import { FILL_STATUS } from './enum';
import filterXSS from 'xss';
import { whiteList } from 'xss/lib/default';

const newWhiteList = Object.assign({}, whiteList, { span: ['style'] });
const Con = styled.div`height: 100%; justify-content: center; align-items: center; display: flex; text-align: center; padding: 100px 0 0 0;`;
const Tip1 = styled.div`font-size: 24px; font-weight: 500; padding: 0 20px;`;
const Tip2 = styled.div`font-size: 15px;`;
const Receipt = styled.div`word-break: break-all;font-size: 14px; color: #757575; text-align: left; padding: 0 50px; white-space: pre-line; min-height:200px; width: 100%; box-sizing: border-box; overflow: auto;
ol,ul {
    list-style-position: outside;
    list-style: decimal;
    margin-left: 16px;
  }
img{
  max-width: 100%;
}
`;

function getTip(status, fillTimes) {
  if (status === FILL_STATUS.CLOSE) {
    return _l('你访问的表单已停止数据收集！');
  } else if (fillTimes === FILL_TIMES.DAILY) {
    return _l('提交成功！明天还可以继续提交');
  } else {
    return _l('提交成功');
  }
}

const Icon = ({ status }) => {
  return <i
    className={`icon ${status === FILL_STATUS.CLOSE ? 'icon-task-folder-message' : 'icon-plus-interest'}`}
    style={{
      fontSize: 80,
      color: status === FILL_STATUS.CLOSE ? '#FF6200' : '#4CAF50',
    }}
  ></i>;
};

Icon.propTypes = { status: PropTypes.number };


export default function NotFillStatus(props) {
  const { status, publicWorksheetInfo, onRefill } = props;
  const { worksheetId, name, fillTimes, receipt } = publicWorksheetInfo;
  return <Con className="notFillStatus">
    <div style={{ width: '100%' }}>
      {worksheetId ? <Icon status={status} /> : <i className="icon icon-closeelement-bg-circle" style={{ fontSize: 80, color: '#f44133' }} ></i>}
      {worksheetId && <Tip1 className="mTop10">{name || _l('未命名表单')}</Tip1>}
      <Tip2 className="mTop8">{worksheetId ? getTip(status, fillTimes) : _l('你访问的表单不存在')}</Tip2>
      {status !== FILL_STATUS.CLOSE && fillTimes === FILL_TIMES.UNLIMITED && <Tip2 style={{ color: '#2196F3', margin: '20px 0 25px' }}>
        <span className="Hand" onClick={onRefill}>{_l('再填写一份')}</span>
      </Tip2>}
      {<div style={{ 'minHeight': !receipt ? '224px' : '200px' }} >
        {receipt && <React.Fragment>
          <Hr style={{ margin: '20px 0 4px' }} />
          {/* <Linkify properties={{ target: '_blank' }}><Receipt className="receipt">{receipt}</Receipt></Linkify> */}
          <Receipt className="receipt" dangerouslySetInnerHTML={{
            __html: filterXSS(receipt, {
              stripIgnoreTag: true,
              whiteList: newWhiteList,
            }),
          }}></Receipt>
        </React.Fragment>}
      </div>}
    </div>
  </Con>;
}

NotFillStatus.propTypes = {
  status: PropTypes.number,
  publicWorksheetInfo: PropTypes.shape({}),
  onRefill: PropTypes.func,
};

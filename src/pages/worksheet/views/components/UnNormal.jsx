import React from 'react';
import styled from 'styled-components';
import { Button } from 'ming-ui';
import abnormal from 'src/pages/worksheet/assets/abnormal.png';
import alreadyDelete from 'src/pages/worksheet/assets/alreadyDelete.png';
import withoutPermission from 'src/pages/worksheet/assets/withoutPermission.png';

const UnNormalWrap = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  overflow: hidden;
  .unNormalContent {
    flex: 1;
    margin: 15px;
    border-radius: 4px;
    background: #fff;
    justify-content: center;
    align-items: center;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.16);
  }
  .unNormalText {
    margin: 15px 0 20px;
    font-size: 17px;
    color: #151515;
    white-space: pre-wrap;
    text-align: center;
  }
  img {
    width: 110px;
  }
`;

const VIEW_CODE_TYPE = {
  '-10000': {
    src: abnormal,
    text: `${_l('地址无法访问')}\n${_l('被取消了查看权限或已删除')}`,
  },
  4: {
    src: alreadyDelete,
    text: _l('视图已删除'),
  },
  7: {
    src: withoutPermission,
    text: _l('视图无权限'),
  },
  13: {
    src: abnormal,
    text: _l('排序超过内存限制，请创建包含当前筛选条件与排序字段的索引后重试”'),
  },
};

const SHEET_CODE_TYPE = {
  '-20000': {
    src: abnormal,
    text: `${_l('地址无法访问')}\n${_l('应用项被移走了')}`,
  },
  '-10000': {
    src: abnormal,
    text: `${_l('地址无法访问')}\n${_l('被取消了查看权限或已删除')}`,
  },
  4: {
    src: alreadyDelete,
    text: _l('应用项已删除'),
  },
  7: {
    src: withoutPermission,
    text: _l('应用项无权限'),
  },
};

const UnNormal = props => {
  const { resultCode, errorText, type = 'view' } = props;
  const CODE_TYPE = type === 'view' ? VIEW_CODE_TYPE : SHEET_CODE_TYPE;
  let { src, text, renderRefresh } = CODE_TYPE[resultCode] || {
    src: abnormal,
    renderRefresh: true,
    text: _l('服务出错，请刷新重试'),
  };
  if (errorText) {
    text = errorText;
  }
  return (
    <UnNormalWrap>
      <div className="unNormalContent flexColumn">
        <img src={src} />
        <p className="unNormalText" dangerouslySetInnerHTML={{ __html: text }}></p>
        {renderRefresh && (
          <Button className="mTop25" onClick={() => location.reload()}>
            {_l('刷新')}
          </Button>
        )}
      </div>
    </UnNormalWrap>
  );
};

export default UnNormal;

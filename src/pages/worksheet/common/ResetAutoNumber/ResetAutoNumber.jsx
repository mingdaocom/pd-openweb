import React, { useState, Fragment, useEffect } from 'react';
import { string } from 'prop-types';
import { Modal, Popover } from 'antd';
import { Icon, Dialog, MenuItem, Button } from 'ming-ui';
import worksheetAjax from 'src/api/worksheet';
import styled from 'styled-components';
import { filter, get, isEmpty, pick } from 'lodash';

const DialogTitle = styled.h2`
  font-size: 16px;
  font-weight: 400;
  margin-top: 10px;
`;

const FooterBtn = styled.div`
  text-align: right;
`;

const ResetWrap = styled.div`
  .intro {
    padding-bottom: 8px;
    color: #757575;
  }
  .controls {
    min-height: 240px;
    max-height: 560px;
    overflow-y: auto;
  }
  .controlItem {
    margin-top: 16px;
  }
  .content {
    display: flex;
    justify-content: space-between;
    padding: 0 24px 0 10px;
    line-height: 36px;
    background: #f8f8f8;
    border-radius: 3px;
  }
  .info {
    span {
      margin-left: 12px;
    }
  }
  .hint {
    margin-top: 8px;
    color: #9e9e9e;
    font-size: 12px;
  }
  .reset {
    color: #2196f3;
    cursor: pointer;
  }
  .footerBtn {
    text-align: right;
    margin-top: 32px;
  }
`;

export default function ResetAutoNumber(props) {
  const { worksheetInfo, onHide } = props;
  const controls = get(worksheetInfo, ['template', 'controls']);
  const autoNumberControls = filter(controls, item => item.type === 33);
  const [activeIndex, setIndex] = useState(-1);

  const handleReset = controlId => {
    setIndex(-1);
    worksheetAjax.resetControlIncrease({ ...pick(worksheetInfo, ['appId', 'worksheetId']), controlId }).then(res => {
      alert(res ? _l('重置编号成功') : _l('重置编号失败'));
    });
  };

  return (
    <Dialog style={{ width: '480px' }} visible={true} title={_l('重置自动编号')} footer={null} onCancel={onHide}>
      <ResetWrap>
        <div className="intro">{_l('重置编号后，新增的记录会从初始值开始编号，之前的记录编号不变。')}</div>
        <div className="controls">
          {autoNumberControls.map((item, index) => {
            const { controlName, controlId, advancedSetting = {} } = item;
            const { start, length } =
              _.find(safeParse(advancedSetting.increase || '[]', 'array'), i => i.type === 1) || {};
            return (
              <div className="controlItem" key={controlId}>
                <div className="content">
                  <div className="info">
                    <Icon className="Gray_9e" icon={'auto_number'} />
                    <span>{controlName}</span>
                  </div>
                  <Popover
                    placement="bottomRight"
                    align={{ offset: [24] }}
                    visible={activeIndex === index}
                    onVisibleChange={visible => setIndex(visible ? index : -1)}
                    trigger="click"
                    overlayClassName={'resetReconfirm'}
                    title={<DialogTitle>{_l('此操作无法还原，你确定重置该编号吗？')}</DialogTitle>}
                    content={
                      <FooterBtn>
                        <Button
                          type="link"
                          size="small"
                          onClick={() => {
                            setIndex(-1);
                          }}
                        >
                          {_l('取消')}
                        </Button>
                        <Button
                          type="primary"
                          size="small"
                          onClick={() => {
                            handleReset(controlId);
                          }}
                        >
                          {_l('确定')}
                        </Button>
                      </FooterBtn>
                    }
                  >
                    <span className="reset">{_l('重置')}</span>
                  </Popover>
                </div>
                <div className="hint">{_l('重置后从%0开始编号', _.padStart(start, length, '0'))}</div>
              </div>
            );
          })}
        </div>
      </ResetWrap>
    </Dialog>
  );
}

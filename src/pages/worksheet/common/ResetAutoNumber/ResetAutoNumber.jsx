import React, { useState } from 'react';
import { Input, Popover } from 'antd';
import { filter, get, pick } from 'lodash';
import _ from 'lodash';
import styled from 'styled-components';
import { Button, Dialog, Icon } from 'ming-ui';
import worksheetAjax from 'src/api/worksheet';

const ResetContent = styled.div`
  width: 400px;
  .footerBtn {
    text-align: right;
  }
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
  .reset {
    color: #1677ff;
    cursor: pointer;
  }
`;

export default function ResetAutoNumber(props) {
  const { worksheetInfo, onHide } = props;
  const controls = get(worksheetInfo, ['template', 'controls']);
  const autoNumberControls = filter(controls, item => item.type === 33);
  const [activeIndex, setIndex] = useState(-1);
  const [initNum, setNum] = useState(1);
  const [startNum, setStartNum] = useState(1);

  const handleReset = controlId => {
    setIndex(-1);
    worksheetAjax
      .resetControlIncrease({
        ...pick(worksheetInfo, ['appId', 'worksheetId']),
        controlId,
        initNum: initNum - startNum + 1,
      })
      .then(res => {
        alert(res ? _l('重置成功') : _l('重置失败'));
        setNum(1);
      });
  };

  return (
    <Dialog style={{ width: '480px' }} visible={true} title={_l('重置自动编号')} footer={null} onCancel={onHide}>
      <ResetWrap>
        <div className="intro">{_l('指定下一条记录的编号，之后的编号将在此基础上递增。之前的记录编号不变。')}</div>
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
                    onVisibleChange={visible => {
                      setIndex(visible ? index : -1);
                      const startValue = visible ? _.padStart(start, length, '0') : 1;
                      setNum(startValue);
                      setStartNum(startValue);
                    }}
                    trigger="click"
                    overlayClassName={'resetReconfirm'}
                    title={null}
                    content={
                      <ResetContent>
                        <div className="Font16 Bold">{_l('重置')}</div>
                        <div className="mTop8 mBottom12">
                          <span className="Gray_75">
                            {_l(
                              '设置下一条记录的编号。设置的编号不得小于开始值，未设置时默认使用开始值。若编号为周期重复，则重置操作仅对当前周期有效。',
                            )}
                          </span>
                          <span className="Bold">{_l('重置不可逆，请谨慎操作')}</span>
                        </div>
                        <div className="flexCenter mBottom32">
                          <span className="InlineBlock Width120 TxtLeft">{_l('下一条记录的编号')}</span>
                          <Input
                            value={initNum}
                            className="flex Gray_9e"
                            onChange={e => setNum(e.target.value.replace(/[^\d]/g, ''))}
                            onBlur={() => {
                              if (initNum < startNum) {
                                setNum(startNum);
                              }
                            }}
                          />
                        </div>
                        <div className="footerBtn">
                          <Button
                            type="link"
                            size="small"
                            onClick={() => {
                              setIndex(-1);
                              setNum(1);
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
                            {_l('重置')}
                          </Button>
                        </div>
                      </ResetContent>
                    }
                  >
                    <span className="reset">{_l('重置')}</span>
                  </Popover>
                </div>
              </div>
            );
          })}
        </div>
      </ResetWrap>
    </Dialog>
  );
}

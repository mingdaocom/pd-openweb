import React from 'react';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Checkbox, Radio } from 'ming-ui/antd-components';

const HeaderRange = styled.div`
  display: block;
  padding: 16px 24px;
  font-weight: bold;
  border-bottom: 1px solid var(--color-border-secondary);
  .ming.icon-close {
    float: right;
  }
  .ming.icon-close:hover {
    color: var(--color-primary) !important;
  }
`;
const RangeDropContent = styled.div`
  width: 320px;
  box-sizing: border-box;
  line-height: 1;
  font-size: 14px;
  .con {
    padding: 24px;
    h5 {
      margin: 0;
      line-height: 1;
      margin-bottom: 20px;
      font-size: 14px;
    }
  }
  .dropOptionTrigger {
    padding: 24px;
    max-height: 260px;
    overflow: auto;
    .hap-radio-label,
    .viewRangeCheckbox {
      color: var(--color-text-primary);
    }
    .hap-radio-label {
      font-weight: initial;
    }
    .viewRangeCheckbox {
      display: flex;
      width: fit-content;
      align-items: center;
    }
  }
`;

export default function RangeDrop({ printData, views, setData, className, onClose }) {
  const viewList = views.filter(l => l.viewId !== l.worksheetId);

  return (
    <RangeDropContent className={className}>
      <HeaderRange className="headerRange Font14 textPrimary">
        {_l('使用范围')}
        <Icon icon="close" className="Font18 textTertiary Hand" onClick={onClose} />
      </HeaderRange>
      <ul className="dropOptionTrigger">
        <Radio
          checked={printData.range === 1}
          onChange={() => {
            setData({
              printData: {
                ...printData,
                range: 1,
              },
            });
          }}
          title={_l('所有记录')}
        >
          {_l('所有记录')}
        </Radio>
        <p className="mLeft25 mTop10 mBottom16"></p>
        <Radio
          checked={printData.range === 3}
          onChange={() => {
            setData({
              printData: {
                ...printData,
                range: 3,
              },
            });
          }}
          title={_l('应用于指定视图')}
        >
          {_l('应用于指定视图')}
        </Radio>
        {printData.range === 3 && (
          <div className="viewList">
            <div className="viewListLi">
              {viewList.map(it => (
                <Checkbox
                  key={it.viewId}
                  className="viewRangeCheckbox mTop15 mLeft25"
                  checked={printData.views.map(o => o.viewId).includes(it.viewId)}
                  onChange={event => {
                    setData({
                      printData: {
                        ...printData,
                        views: !event.target.checked
                          ? printData.views.filter(o => it.viewId !== o.viewId)
                          : printData.views.concat(it),
                      },
                    });
                  }}
                >
                  {it.name}
                </Checkbox>
              ))}
            </div>
          </div>
        )}
      </ul>
    </RangeDropContent>
  );
}

export { RangeDrop };

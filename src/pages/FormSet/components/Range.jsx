import React from 'react';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Checkbox, Radio, Tooltip } from 'ming-ui/antd-components';

const RangeContent = styled.div`
  width: 320px;
  box-sizing: border-box;
  line-height: 1;
  font-size: 14px;
  font-weight: bold;
  .con {
    padding: 24px;
    max-height: 350px;
    overflow: auto;
    h5 {
      margin: 0;
      line-height: 1;
      margin-bottom: 20px;
      font-size: 14px;
    }
    .hap-radio-label,
    .viewRangeCheckbox {
      color: var(--color-text-primary);
    }
    .hap-radio-label {
      font-weight: initial;
    }
    .rangeRadioLabel,
    .viewRangeCheckbox {
      align-items: center;
    }
    .rangeRadioLabel {
      display: inline-flex;
    }
    .viewRangeCheckbox {
      display: flex;
      width: fit-content;
    }
  }
  .conLine {
    margin: 0 24px;
    border-bottom: 1px solid var(--color-border-secondary);
  }
  .inputTxt {
    font-weight: normal;
  }
`;
const HeaderRange = styled.div`
  padding: 16px 24px;
  border-bottom: 1px solid var(--color-border-secondary);
  .ming.icon-close {
    float: right;
  }
  .ming.icon-close:hover {
    color: var(--color-primary) !important;
  }
`;

export default function Range(props) {
  const { data = {}, diaRang, text = {}, views = [] } = props;
  const { viewIds = [] } = data;

  return (
    <RangeContent>
      <HeaderRange className="headerRange Font14 textPrimary">
        {_l('使用范围')}
        <Icon icon="close" className="Font18 textTertiary Hand" onClick={props.closeFn} />
      </HeaderRange>
      <div className="con">
        <h5>{_l('用户')}</h5>
        <Radio checked={props.roleType !== 100} onChange={() => props.change(0)} title={_l('所有用户')}>
          {_l('所有用户')}
        </Radio>
        <p className="mLeft25 mTop10 mBottom16" />
        <Radio title={_l('仅系统角色')} checked={props.roleType === 100} onChange={() => props.change(100)}>
          <span className="rangeRadioLabel">
            {_l('仅系统角色')}
            <Tooltip placement="bottom" title={_l('包含管理员、运营者、开发者')}>
              <Icon icon="info_outline" className="textTertiary Font16 mLeft5" />
            </Tooltip>
          </span>
        </Radio>
      </div>
      {props.hasViewRange && (
        <React.Fragment>
          <div className="conLine"></div>
          <div className="con">
            <h5>{_l('视图')}</h5>
            <Radio
              checked={viewIds.length <= 0 && diaRang}
              onChange={() => props.changeViewRange({ viewIds: [], diaRang: true })}
              title={text.allview || _l('所有视图')}
            >
              {text.allview || _l('所有视图')}
            </Radio>
            <p className="mLeft25 mTop10 mBottom16"></p>
            <Radio
              checked={viewIds.length > 0 || !diaRang}
              onChange={() => props.changeViewRange({ viewIds: [], diaRang: false })}
              title={text.assignview || _l('应用于指定的视图')}
            >
              {text.assignview || _l('应用于指定的视图')}
            </Radio>
            <p className="mLeft25 mTop10 mBottom16"></p>
            {!diaRang &&
              views
                .filter(l => l.viewId !== l.worksheetId)
                .map(it => (
                  <Checkbox
                    key={it.viewId}
                    className="viewRangeCheckbox mTop15 mLeft25 Normal"
                    checked={viewIds.includes(it.viewId)}
                    onChange={event =>
                      props.changeViewRange({
                        viewIds: event.target.checked
                          ? viewIds.concat(it.viewId)
                          : viewIds.filter(viewId => viewId !== it.viewId),
                        diaRang: false,
                      })
                    }
                  >
                    {it.name}
                  </Checkbox>
                ))}
          </div>
        </React.Fragment>
      )}
      {props.otherSet && (
        <React.Fragment>
          <div className="conLine"></div>
          <div className="con">
            <h5>{_l('其他')}</h5>
            <Checkbox
              checked={data.displayFlowChart !== 1}
              onChange={() =>
                props.changeOtherSet({
                  displayFlowChart: data.displayFlowChart !== 1 ? 1 : 0,
                })
              }
            >
              <span className="Font14 Normal">{_l('显示流转图')}</span>
            </Checkbox>
          </div>
        </React.Fragment>
      )}
    </RangeContent>
  );
}

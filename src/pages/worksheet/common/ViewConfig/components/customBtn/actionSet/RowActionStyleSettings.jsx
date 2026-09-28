import React from 'react';
import { Icon } from 'ming-ui';
import { Checkbox, Popover, Segmented } from 'ming-ui/antd-components';
import NumInput from 'src/pages/worksheet/common/ViewConfig/components/NumInput.jsx';
import { BTN_TYPE, maxNum } from '../config';
import { WrapCount, WrapPopover } from './ActionSetStyled';

export default function RowActionStyleSettings({ acstyle, onChangeAcStyle }) {
  const { style = 1 } = acstyle || {};

  return (
    <React.Fragment>
      <p className="Bold textSecondary Font13 mTop20  mBottom0 flexRow">
        <span className="flex">{_l('按钮样式')}</span>
        {acstyle.style !== 3 && (
          <Checkbox
            className="hideBtn InlineFlex"
            checked={(acstyle || {}).icon !== 0}
            onChange={() => {
              onChangeAcStyle({
                icon: (acstyle || {}).icon !== 0 ? 0 : 1,
              });
            }}
          >
            {_l('显示图标')}
          </Checkbox>
        )}
      </p>
      <Segmented
        block
        className="mTop10"
        value={style}
        options={BTN_TYPE.map(item => ({ value: item.value, label: item.txt }))}
        onChange={value => onChangeAcStyle({ style: value })}
      />
      <WrapCount className="flexRow alignItemsCenter mTop25">
        <span>{_l('显示按钮数量')}</span>
        <div className="mLeft12 showCount flexRow alignItemsCenter">
          <NumInput
            className="flex"
            minNum={0}
            maxNum={maxNum}
            value={Number(acstyle.btncount > maxNum ? maxNum : acstyle.btncount || maxNum)}
            onChange={value => {
              const btncount = JSON.stringify(maxNum >= value ? value : maxNum);

              if (btncount !== (acstyle.btncount || maxNum)) {
                onChangeAcStyle({ btncount });
              }
            }}
          />
        </div>
        <span className="pLeft10">，{_l('超出后放在更多菜单中')}</span>
      </WrapCount>
      {![2, 3].includes(acstyle.style) && (
        <WrapCount className="flexRow alignItemsCenter mTop15">
          <span>{_l('首要按钮数量')}</span>
          <div className="mLeft12 showCount flexRow alignItemsCenter">
            <NumInput
              className="flex"
              minNum={0}
              maxNum={maxNum}
              value={Number(acstyle.primarycount || 1)}
              onChange={value => {
                const primarycount = JSON.stringify(maxNum >= value ? value : maxNum);

                if (primarycount !== (acstyle.primarycount || maxNum) && primarycount !== (acstyle.primarycount || 1)) {
                  onChangeAcStyle({ primarycount });
                }
              }}
            />
          </div>
          <Popover
            arrow={true}
            content={
              <WrapPopover className="Font13">
                <div>
                  {_l(
                    '通过首要按钮来强调主要操作。如：设置1个首要按钮，则第一个按钮显示为实心颜色。其他按钮则被显示为空心线框',
                  )}
                </div>
                <div className="textTertiary Bold Font13 mTop16">{_l('示例：')}</div>
                <div className="btns mTop12">
                  <div className="btn first">
                    <Icon type="send_8" className="first" />
                    <span className="mLeft2 Bold">{_l('创建订单')}</span>
                  </div>
                  <div className="btn mLeft8">
                    <Icon type="print" />
                    <span className="mLeft2 Bold">{_l('打印')}</span>
                  </div>
                  <div className="btn mLeft8">
                    <Icon type="trash" className="del" />
                    <span className="mLeft2 Bold">{_l('删除')}</span>
                  </div>
                </div>
              </WrapPopover>
            }
            trigger="hover"
          >
            <i className="icon-help Font16 textTertiary mLeft8 TxtMiddle" />
          </Popover>
        </WrapCount>
      )}
    </React.Fragment>
  );
}

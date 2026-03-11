import React, { useState } from 'react';
import { TinyColor } from '@ctrl/tinycolor';
import cx from 'classnames';
import styled from 'styled-components';
import { Button, ColorPicker, Dialog, FunctionWrap } from 'ming-ui';

const WrapCon = styled(Dialog)`
  .footer {
    justify-content: flex-end;
  }
  .colorBlack {
    width: 84px;
    height: 34px;
    padding: 5px;
    border-radius: 4px;
    border: 1px solid var(--color-border-secondary);
    > div {
      border-radius: 2px;
    }
  }
  .colorInput {
    width: 100%;
    height: 100%;
    opacity: 0;
    position: absolute;
    left: 0;
    top: 0;
  }
`;

const SelectColor = props => {
  const { onSave, onCancel } = props;
  const [color, setColor] = useState(props.color || '#000000');
  const colorData = new TinyColor(color);
  const hsv = colorData.toHsv();
  const s = Number((hsv.s * 100).toFixed(2));
  const v = Number((hsv.v * 100).toFixed(2));

  const getColorPopParent = () => {
    return document.querySelector('.addColorDialog');
  };

  return (
    <WrapCon className="addColorDialog" title={_l('自定义主题色')} visible footer={null} onCancel={onCancel}>
      <div className="flexColumn">
        <div style={{ color: 'var(--color-text-secondary)' }}>
          <div>
            {_l('饱和度建议不低于70')}
            <span className={cx({ Red: s < 70 })}>{_l('（现在 %0）', s)}</span>
          </div>
          <div>
            {_l('亮度建议不低于70')}
            <span className={cx({ Red: v < 70 })}>{_l('（现在 %0）', v)}</span>
          </div>
        </div>
        <div className="flexRow alignItemsCenter mTop10">
          <div className="selectColor Relative">{_l('选择颜色')}</div>
          <div className="colorBlack Relative mLeft8 mRight8">
            <ColorPicker
              value={color}
              onChange={value => {
                setColor(value);
              }}
              getPopupContainer={getColorPopParent}
            >
              <div className="w100 h100 pointer" style={{ backgroundColor: color }}></div>
            </ColorPicker>
          </div>
          <div>{color}</div>
        </div>
      </div>
      <div className="footer flexRow alignItemsCenter">
        <Button type="link" onClick={onCancel}>
          {_l('取消')}
        </Button>
        <Button
          onClick={() => {
            onSave(color);
            onCancel();
          }}
          className={cx('btnOk', { btnDel: !!color })}
        >
          {_l('保存')}
        </Button>
      </div>
    </WrapCon>
  );
};

export default props => FunctionWrap(SelectColor, { ...props });

import React, { useCallback, useRef, useState } from 'react';
import { TinyColor } from '@ctrl/tinycolor';
import cx from 'classnames';
import styled from 'styled-components';
import { ColorPicker } from 'ming-ui';
import { Modal } from 'ming-ui/antd-components';

const noop = () => {};

const ColorContent = styled.div`
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
`;

export const SelectColor = props => {
  const { onColorChange = noop } = props;
  const contentRef = useRef(null);
  const [color, setColor] = useState(props.color || '#000000');
  const colorData = new TinyColor(color);
  const hsv = colorData.toHsv();
  const s = Number((hsv.s * 100).toFixed(2));
  const v = Number((hsv.v * 100).toFixed(2));

  // Modal 面板层禁用了 pointer-events，Popover 需挂载到可交互的内容节点内。
  const getColorPopParent = useCallback(() => contentRef.current, []);

  return (
    <ColorContent ref={contentRef}>
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
                onColorChange(value);
              }}
              getPopupContainer={getColorPopParent}
            >
              <div className="w100 h100 pointer" style={{ backgroundColor: color }}></div>
            </ColorPicker>
          </div>
          <div>{color}</div>
        </div>
      </div>
    </ColorContent>
  );
};

export function dialogSelectColor(options = {}) {
  let modal;
  let color = options.color || '#000000';
  const handlePopState = () => modal.destroy();

  const handleCancel = () => {
    if (typeof options.onCancel === 'function') {
      options.onCancel();
    }
  };

  const handleSave = () => {
    const result = typeof options.onSave === 'function' ? options.onSave(color) : undefined;

    handleCancel();
    return result;
  };

  const handleColorChange = value => {
    color = value;
  };

  modal = Modal.info({
    afterClose: () => window.removeEventListener('popstate', handlePopState),
    centered: true,
    cancelText: _l('取消'),
    className: 'addColorDialog',
    content: <SelectColor {...options} onColorChange={handleColorChange} />,
    mask: { closable: options.overlayClosable !== false },
    okCancel: true,
    okText: _l('保存'),
    onCancel: handleCancel,
    onOk: handleSave,
    title: _l('自定义主题色'),
    width: 520,
    zIndex: options.zIndex,
  });

  window.addEventListener('popstate', handlePopState);

  return modal;
}

export default dialogSelectColor;

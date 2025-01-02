import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

const AutoHeightInput = ({ className, value, onChange, maxRows = 5, minRows = 1, placeholder, setRef, ...props }) => {
  const textareaRef = useRef(null);

  const calculateHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // 重置高度以获取正确的 scrollHeight
    textarea.style.height = 'auto';

    // 计算单行高度
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
    const paddingTop = parseInt(getComputedStyle(textarea).paddingTop);
    const paddingBottom = parseInt(getComputedStyle(textarea).paddingBottom);

    // 计算最大高度
    const maxHeight = lineHeight * maxRows + paddingTop + paddingBottom;

    // 计算实际需要的高度
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);

    textarea.style.height = `${newHeight}px`;
    textarea.style.overflow = newHeight < maxHeight ? 'hidden' : 'auto';
  };

  useEffect(() => {
    calculateHeight();
  }, [value]);

  return (
    <textarea
      className={className}
      ref={ref => {
        textareaRef.current = ref;
        if (setRef) {
          setRef(ref);
        }
      }}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={minRows}
      style={{
        resize: 'none',
        overflow: 'auto',
        minHeight: 'auto',
        boxSizing: 'border-box',
      }}
      {...props}
    />
  );
};

AutoHeightInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  maxRows: PropTypes.number,
  minRows: PropTypes.number,
  placeholder: PropTypes.string,
  setRef: PropTypes.func,
};

export default AutoHeightInput;

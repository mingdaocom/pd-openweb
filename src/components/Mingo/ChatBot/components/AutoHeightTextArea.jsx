import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

const AutoHeightTextArea = forwardRef(
  (
    {
      value = '',
      onChange,
      placeholder = '',
      minHeight = 80,
      maxHeight = 200,
      className = '',
      disabled = false,
      style = {},
      onKeyDown,
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const textAreaRef = useRef(null);
    const [textAreaHeight, setTextAreaHeight] = useState(minHeight);

    // 暴露给父组件的方法
    useImperativeHandle(ref, () => ({
      focus: () => textAreaRef.current?.focus(),
      blur: () => textAreaRef.current?.blur(),
      scrollToBottom: () => {
        if (textAreaRef.current) {
          textAreaRef.current.scrollTop = textAreaRef.current.scrollHeight;
        }
      },
      dom: textAreaRef.current,
    }));

    // 自动调整高度的函数
    const adjustHeight = () => {
      const textArea = textAreaRef.current;
      if (!textArea) return;

      // 重置高度以获取正确的scrollHeight
      textArea.style.height = 'auto';

      // 计算新的高度
      const scrollHeight = textArea.scrollHeight;
      let newHeight = Math.max(minHeight, scrollHeight);

      // 如果设置了最大高度，限制高度不超过最大值
      if (maxHeight > 0) {
        newHeight = Math.min(newHeight, maxHeight);
      }

      // 设置新的高度
      textArea.style.height = `${newHeight}px`;
      setTextAreaHeight(newHeight);
    };

    // 当value变化时调整高度
    useEffect(() => {
      adjustHeight();
    }, [value, minHeight, maxHeight]);

    // 处理输入变化
    const handleChange = e => {
      if (onChange) {
        onChange(e);
      }
      // 延迟调整高度，确保DOM已更新
      setTimeout(adjustHeight, 0);
    };

    // 处理键盘事件
    const handleKeyDown = e => {
      if (onKeyDown) {
        onKeyDown(e);
      }
      // 延迟调整高度
      setTimeout(adjustHeight, 0);
    };

    return (
      <textarea
        ref={textAreaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={className}
        rows="1"
        style={{
          minHeight: `${minHeight}px`,
          maxHeight: maxHeight > 0 ? `${maxHeight}px` : 'none',
          height: `${textAreaHeight}px`,
          resize: 'none',
          overflow: textAreaHeight >= maxHeight ? 'auto' : 'hidden',
          transition: 'height 0.1s ease',
          ...style,
        }}
        {...props}
      />
    );
  },
);

AutoHeightTextArea.displayName = 'AutoHeightTextArea';

export default AutoHeightTextArea;

import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';

export const Wrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 3px 6px;
  max-width: 250px;
  height: 24px;
  border-radius: 3px;
  font-size: 13px;
  color: var(--color-text-secondary);
  background-color: var(--color-background-tertiary);
  .icon {
    margin-right: 4px;
    font-size: 14px;
    color: var(--color-text-secondary);
    flex-shrink: 0;
  }
`;

const EllipsisText = ({ text, icon, className }) => {
  const textRef = useRef(null);
  const checkedRef = useRef(false);
  const [overflow, setOverflow] = useState(false);

  const check = () => {
    if (checkedRef.current) return;

    const el = textRef.current;
    if (!el) return;

    const isOverflow = el.scrollWidth > el.clientWidth;

    setOverflow(isOverflow);
    checkedRef.current = true;
  };

  useEffect(() => {
    checkedRef.current = false;
    setOverflow(false);
  }, [text]);

  return (
    <Tooltip title={overflow ? text : null}>
      <Wrapper className={className} onMouseEnter={check}>
        {icon && <Icon icon={icon} className="icon" />}
        <span ref={textRef} className="ellipsis">
          {text}
        </span>
      </Wrapper>
    </Tooltip>
  );
};

export default EllipsisText;

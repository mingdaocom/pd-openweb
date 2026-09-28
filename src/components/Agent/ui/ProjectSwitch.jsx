import React, { useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { ScrollView } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { emitter } from 'src/utils/platform/browser/dom';

// 组织（网络）切换下拉：复用首页 SwitchProject 的下拉视觉与切换行为
// （safeLocalStorageSetItem('currentProjectId') + emit CHANGE_CURRENT_PROJECT）。
// 自管理浮层（相对触发器绝对定位 + 文档 mousedown 关闭），避免在 overflow:hidden / 居中容器下
// 出现漂移、横向撑页、点选或点外不关闭等问题，定位与关闭都可控且不会撑开页面。
const Wrap = styled.div`
  position: relative;
  display: inline-flex;
  max-width: 100%;
`;

const Pop = styled.div`
  position: absolute;
  left: 0;
  z-index: 1000;
  width: 300px;
  max-width: 80vw;
  background: var(--color-background-card);
  border-radius: 3px;
  padding: 5px 0;
  box-shadow: var(--shadow-lg);
  ${p => (p.$placement === 'top' ? 'bottom: calc(100% + 6px);' : 'top: calc(100% + 6px);')}
`;

const ProjectItem = styled.div`
  cursor: pointer;
  padding: 0 20px;
  font-size: 15px;
  font-weight: 500;
  height: 40px;
  line-height: 40px;
  &.active {
    color: var(--color-primary);
    background: rgb(33, 150, 243, 0.08);
  }
  &:not(.active):not(.disabled):hover {
    background: var(--color-background-hover);
  }
  &.disabled {
    cursor: not-allowed;
    color: var(--color-text-disabled);
  }
`;

const ScrollCon = styled(ScrollView)`
  height: ${({ $height }) => $height}px !important;
`;

export default function ProjectSwitch({
  value,
  onChange = () => {},
  placement = 'bottom',
  getDisabledTip = () => '',
  children,
}) {
  const [visible, setVisible] = useState(false);
  const wrapRef = useRef(null);
  const projects = get(md, 'global.Account.projects', []) || [];

  // 点击浮层与触发器之外关闭（mousedown 捕获阶段，先于 React click，避免误判）
  useEffect(() => {
    if (!visible) return undefined;
    const onDocMouseDown = e => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setVisible(false);
    };

    document.addEventListener('mousedown', onDocMouseDown, true);
    return () => document.removeEventListener('mousedown', onDocMouseDown, true);
  }, [visible]);

  const handleSwitch = project => {
    if (getDisabledTip(project)) return;
    setVisible(false);
    if (project.projectId === value) return;
    safeLocalStorageSetItem('currentProjectId', project.projectId);
    onChange(project.projectId);
    emitter.emit('CHANGE_CURRENT_PROJECT', project);
  };

  const rowH = 40;
  const maxRows = Math.ceil((window.innerHeight - 160) / rowH);
  // 不可选组织（如已禁用 MingoAI）置灰并 hover 给出原因，仍展示在列表里便于用户知道为何选不了
  let list = projects.map(p => {
    const disabledTip = getDisabledTip(p);
    const item = (
      <ProjectItem
        key={p.projectId}
        className={cx('ellipsis', { active: p.projectId === value, disabled: !!disabledTip })}
        onClick={() => handleSwitch(p)}
      >
        {p.companyName}
      </ProjectItem>
    );

    return disabledTip ? (
      <Tooltip key={p.projectId} title={disabledTip} placement="left" mouseLeaveDelay={0.1}>
        <div>{item}</div>
      </Tooltip>
    ) : (
      item
    );
  });

  if (projects.length > maxRows) {
    list = <ScrollCon $height={maxRows * rowH}>{list}</ScrollCon>;
  }

  return (
    <Wrap ref={wrapRef}>
      <span className="t-inline-flex" onClick={() => setVisible(v => !v)}>
        {children}
      </span>
      {visible && <Pop $placement={placement}>{list}</Pop>}
    </Wrap>
  );
}

ProjectSwitch.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  placement: PropTypes.oneOf(['top', 'bottom']),
  // 返回非空字符串表示该组织不可选，作为置灰项的 hover 提示
  getDisabledTip: PropTypes.func,
  children: PropTypes.node,
};

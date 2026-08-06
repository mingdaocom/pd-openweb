import React from 'react';
import styled, { keyframes } from 'styled-components';

// 切换/加载历史会话期间的消息区占位：右侧用户气泡 + 左侧助手段落，
// 扫光配色复用全站骨架的 --skeleton-*（已在 ming-ui Skeleton 的 less 中按明暗主题定义）。
const shimmer = keyframes`
  from { background-position: 100% 50%; }
  to { background-position: 0 50%; }
`;

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding: 12px 0;
`;

const Turn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${({ $role }) => ($role === 'user' ? 'flex-end' : 'stretch')};
  gap: 10px;
`;

const Shimmer = styled.div`
  background: linear-gradient(90deg, var(--skeleton-start), var(--skeleton-middle), var(--skeleton-end));
  background-size: 400% 100%;
  animation: ${shimmer} 2s ease infinite;
  border-radius: 8px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Avatar = styled(Shimmer)`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  flex-shrink: 0;
`;

const Bar = styled(Shimmer)`
  height: 14px;
  width: ${({ $w }) => $w || '100%'};
`;

const UserBubble = styled(Shimmer)`
  height: 38px;
  width: ${({ $w }) => $w || '60%'};
  max-width: 680px;
  border-radius: 16px;
`;

const Lines = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export default function ConversationSkeleton() {
  return (
    <Wrap>
      <Turn $role="user">
        <UserBubble $w="46%" />
      </Turn>
      <Turn $role="assistant">
        <Header>
          <Avatar />
          <Bar $w="88px" />
        </Header>
        <Lines>
          <Bar $w="92%" />
          <Bar $w="78%" />
          <Bar $w="64%" />
        </Lines>
      </Turn>
      <Turn $role="user">
        <UserBubble $w="34%" />
      </Turn>
      <Turn $role="assistant">
        <Header>
          <Avatar />
          <Bar $w="88px" />
        </Header>
        <Lines>
          <Bar $w="85%" />
          <Bar $w="70%" />
        </Lines>
      </Turn>
    </Wrap>
  );
}

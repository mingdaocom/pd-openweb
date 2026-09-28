import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { LoadDiv } from 'ming-ui';
import { Drawer, Progress } from 'ming-ui/antd-components';
import { getSandboxQuotas } from '../core/quota';

const DRAWER_STYLES = { body: { padding: '20px 24px' } };

const Description = styled.div`
  margin-bottom: 28px;
  padding: 14px 12px;
  border-radius: 6px;
  background: var(--color-background-secondary);
`;

const DescriptionTitle = styled.div`
  color: var(--color-text-primary);
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
`;

const DescriptionText = styled.div`
  margin-top: 4px;
  color: var(--color-text-tertiary);
  font-size: 12px;
  line-height: 18px;
`;

const QuotaItem = styled.div`
  & + & {
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid var(--color-border-secondary);
  }
`;

const QuotaHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: var(--color-text-primary);
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
`;

const UsedText = styled.div`
  margin-top: 4px;
  color: var(--color-text-tertiary);
  font-size: 12px;
  line-height: 18px;
`;

const QuotaProgress = styled(Progress)`
  margin: 8px 0 5px;
  line-height: 4px;

  .ant-progress-inner {
    vertical-align: top;
  }
`;

const QuotaUsage = styled.div`
  display: flex;
  justify-content: space-between;
  color: var(--color-text-tertiary);
  font-size: 12px;
  line-height: 18px;
`;

const LoadFailed = styled.div`
  padding-top: 40px;
  color: var(--color-text-tertiary);
  text-align: center;
`;

export default function QuotaDrawer({ open, data, loading, error, onClose }) {
  const quotas = getSandboxQuotas(data);

  return (
    <Drawer open={open} width={420} mask={false} title={_l('额度')} styles={DRAWER_STYLES} onClose={onClose}>
      <Description>
        <DescriptionTitle>{_l('沙盒环境')}</DescriptionTitle>
        <DescriptionText>{_l('额度独立计算，仅统计当前沙盒环境资源用量，不影响正式环境。')}</DescriptionText>
      </Description>
      {loading ? (
        <LoadDiv className="mTop30" />
      ) : error ? (
        <LoadFailed>{_l('额度加载失败，请稍后重试')}</LoadFailed>
      ) : (
        quotas.map(item => (
          <QuotaItem key={item.key}>
            <QuotaHeader>
              <span className="overflow_ellipsis">{item.name}</span>
            </QuotaHeader>
            <UsedText>{item.usedText}</UsedText>
            <QuotaProgress
              showInfo={false}
              railColor="var(--color-border-secondary)"
              strokeColor="var(--color-primary)"
              size={[-1, 4]}
              percent={item.percent}
            />
            <QuotaUsage>
              <span>{item.percent}%</span>
              <span>
                {_l('总额度')} {item.limitText}
              </span>
            </QuotaUsage>
          </QuotaItem>
        ))
      )}
    </Drawer>
  );
}

QuotaDrawer.propTypes = {
  open: PropTypes.bool,
  data: PropTypes.object,
  loading: PropTypes.bool,
  error: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
};

import React, { Fragment, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon, LoadDiv } from 'ming-ui';
import { Button, Modal, Radio } from 'ming-ui/antd-components';
import { getCloseSandboxAppDescription } from 'src/components/AppSandbox/sandboxDescriptions';
import { SANDBOX_VERSION_DETAIL_MODE } from 'src/components/AppSandbox/version/constants';
import VersionDetailPage from 'src/components/AppSandbox/version/detail/VersionDetailPage';
import { isSandboxEnvironment, openPeerEnvironment } from 'src/utils/domain/app/sandbox';
import { ENVIRONMENT_CONFIG, OVERVIEW_DIALOG_TYPE, REVIEW_MODE, REVIEW_RULE_CONFIG } from '../constants';
import useOverview from '../hooks/useOverview';
import usePublishVersion from '../hooks/usePublishVersion';
import { createReleaseDraft } from '../version';

const getDisplayValue = value => value || '-';

const Card = styled.section`
  overflow: hidden;
  border: 1px solid var(--color-border-secondary);
  border-radius: 12px;
  background-color: var(--color-background-primary);
`;

const EnvironmentCard = styled(Card)`
  padding: 32px;
  flex-shrink: 0;
`;

const AppInfo = styled.div`
  display: flex;
  align-items: center;

  .appIcon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border: 1px solid var(--color-border-secondary);
    border-radius: 12px;
    background-color: var(--color-background-hover);
    color: var(--color-text-secondary);

    .Icon {
      font-size: 22px;
    }
  }

  .appContent {
    margin-left: 14px;
  }

  .appName {
    color: var(--color-text-primary);
    font-size: 18px;
    font-weight: 600;
  }

  .description {
    color: var(--color-text-secondary);
    font-size: 13px;
  }
`;

const EnvironmentInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-top: 24px;

  .infoItem {
    min-width: 0;
    padding: 16px;
    border-radius: 8px;
    background-color: var(--color-background-tertiary);
  }

  .label {
    color: var(--color-text-secondary);
    font-size: 13px;
    line-height: 20px;
  }

  .value {
    margin-top: 4px;
    color: var(--color-text-primary);
    font-size: 13px;
    font-weight: 600;
    line-height: 20px;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 32px;

  .productionAction {
    width: 140px;
  }

  .sandboxAction {
    width: 150px;
  }
`;

const ReviewRuleContent = styled.div`
  .reviewRuleOption {
    display: flex;
    align-items: center;
    width: 100%;
    height: 64px;
    padding: 8px 20px;
    border: 1px solid var(--color-border-secondary);
    border-radius: 8px;
    background-color: var(--color-background-primary);
    text-align: left;
    cursor: pointer;

    & + .reviewRuleOption {
      margin-top: 16px;
    }

    .reviewRuleText {
      margin-left: 10px;
    }

    .title {
      color: var(--color-text-primary);
      font-size: 13px;
      font-weight: 600;
      line-height: 18px;
    }

    .description {
      margin-top: 1px;
      color: var(--color-text-tertiary);
      font-size: 12px;
      line-height: 17px;
    }
  }
`;

const DEFAULT_APP_NAME = _l('应用');

export default function Overview({
  appId,
  appName = DEFAULT_APP_NAME,
  latestVersionNo,
  publishDisabled,
  onChangeData,
  onVersionPublished,
}) {
  const [activeDialog, setActiveDialog] = useState(null);
  const [releaseDraft, setReleaseDraft] = useState(null);
  const [selectedReviewRule, setSelectedReviewRule] = useState(REVIEW_MODE.ADMIN);
  const sandboxEnvironment = isSandboxEnvironment();
  const isReviewRuleDialog = activeDialog === OVERVIEW_DIALOG_TYPE.REVIEW_RULE;
  const handleDisabled = useCallback(() => {
    onChangeData({ sandboxStatus: 0, sandboxRecordId: '' });
  }, [onChangeData]);
  const { loading, reviewRule, summary, submitting, submit } = useOverview({
    appId,
    loadSummary: !sandboxEnvironment,
    onDisabled: handleDisabled,
  });
  const reviewRuleText = _l((REVIEW_RULE_CONFIG[reviewRule] || REVIEW_RULE_CONFIG[REVIEW_MODE.ADMIN]).label);
  const environmentConfig = sandboxEnvironment ? ENVIRONMENT_CONFIG.SANDBOX : ENVIRONMENT_CONFIG.PRODUCTION;
  const handlePublishSuccess = useCallback(() => {
    setReleaseDraft(null);
    onVersionPublished();
  }, [onVersionPublished]);
  const { publish, publishing } = usePublishVersion({
    appId,
    onSuccess: handlePublishSuccess,
  });

  if (loading) {
    return (
      <EnvironmentCard>
        <LoadDiv className="mTop20" />
      </EnvironmentCard>
    );
  }

  const submitDialog = async () => {
    const success = await submit({
      type: activeDialog,
      reviewMode: selectedReviewRule,
    });

    if (success) setActiveDialog(null);
  };

  return (
    <>
      <EnvironmentCard>
        <AppInfo>
          <div className="appIcon">
            <Icon icon={environmentConfig.icon} />
          </div>
          <div className="appContent">
            <div className="appName">{appName}</div>
            <div className="description">{_l(environmentConfig.description)}</div>
          </div>
        </AppInfo>
        {!sandboxEnvironment && (
          <EnvironmentInfo>
            <div className="infoItem">
              <div className="label">{_l('当前运行版本')}</div>
              <div className="value">{getDisplayValue(summary.currentVersionNo)}</div>
            </div>
            <div className="infoItem">
              <div className="label">{_l('最近更新时间')}</div>
              <div className="value">{getDisplayValue(summary.upgradeTime)}</div>
            </div>
            <div className="infoItem">
              <div className="label">{_l('审核规则')}</div>
              <div className="value">{reviewRuleText}</div>
            </div>
          </EnvironmentInfo>
        )}

        <Actions>
          {sandboxEnvironment ? (
            <Button
              className="sandboxAction"
              color="var(--color-warning)"
              variant="solid"
              size="large"
              disabled={publishDisabled}
              icon={<Icon icon="arrow_forward" />}
              onClick={
                publishDisabled
                  ? undefined
                  : () => setReleaseDraft(createReleaseDraft({ minimumVersion: latestVersionNo }))
              }
            >
              {_l('发布新版本')}
            </Button>
          ) : (
            <>
              <Button
                className="productionAction"
                size="large"
                icon={<Icon icon="arrow_forward" />}
                onClick={() => openPeerEnvironment(`/app/${appId}`)}
              >
                {_l('访问沙盒')}
              </Button>
              <Button
                className="productionAction"
                size="large"
                icon={<Icon icon="assignment" />}
                onClick={() => {
                  setSelectedReviewRule(reviewRule);
                  setActiveDialog(OVERVIEW_DIALOG_TYPE.REVIEW_RULE);
                }}
              >
                {_l('设置审核规则')}
              </Button>
              <Button
                danger
                className="productionAction closeSandbox"
                size="large"
                icon={<Icon icon="cancel_line" />}
                onClick={() => setActiveDialog(OVERVIEW_DIALOG_TYPE.CLOSE)}
              >
                {_l('关闭沙盒')}
              </Button>
            </>
          )}
        </Actions>
      </EnvironmentCard>

      <Modal
        open={Boolean(activeDialog)}
        keyboard
        focusable={{ focusTriggerAfterClose: false }}
        width={isReviewRuleDialog ? 480 : 560}
        title={isReviewRuleDialog ? _l('审核规则') : _l('关闭沙盒')}
        cancelText={_l('取消')}
        okText={isReviewRuleDialog ? _l('确定') : _l('确认关闭')}
        confirmLoading={submitting}
        onOk={submitDialog}
        onCancel={() => {
          if (!submitting) setActiveDialog(null);
        }}
      >
        {isReviewRuleDialog ? (
          <ReviewRuleContent>
            {Object.values(REVIEW_RULE_CONFIG).map(item => (
              <button
                key={item.value}
                type="button"
                className="reviewRuleOption"
                onClick={() => setSelectedReviewRule(item.value)}
              >
                <Radio checked={selectedReviewRule === item.value} />
                <div className="reviewRuleText">
                  <div className="title">{_l(item.label)}</div>
                  <div className="description">{_l(item.description)}</div>
                </div>
              </button>
            ))}
          </ReviewRuleContent>
        ) : (
          <div className="textPrimary">{getCloseSandboxAppDescription()}</div>
        )}
      </Modal>
      {releaseDraft && (
        <VersionDetailPage
          open
          appId={appId}
          version={releaseDraft}
          mode={SANDBOX_VERSION_DETAIL_MODE.RELEASE}
          submitting={publishing}
          onClose={() => !publishing && setReleaseDraft(null)}
          onSubmit={publish}
        />
      )}
    </>
  );
}

Overview.propTypes = {
  appId: PropTypes.string.isRequired,
  appName: PropTypes.string,
  latestVersionNo: PropTypes.string,
  publishDisabled: PropTypes.bool.isRequired,
  onChangeData: PropTypes.func.isRequired,
  onVersionPublished: PropTypes.func.isRequired,
};

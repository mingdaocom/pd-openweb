import React from 'react';
import PropTypes from 'prop-types';
import { Button, Flex, Space, Typography } from 'ming-ui/antd-components';

const { Text } = Typography;
const LINK_BUTTON_STYLE = { paddingInline: 0 };
const VOTE_ACTION_STYLE = {
  paddingTop: 12,
  marginTop: 12,
  borderTop: '1px solid var(--color-border-secondary)',
};

/**
 * 投票的操作项
 */
function VoteAction(props) {
  const voteItem = props.voteItem;
  let actions;

  if (props.isShowResult && !voteItem.isPostVote && !voteItem.isDeadline) {
    actions = (
      <Button type="link" size="small" style={LINK_BUTTON_STYLE} onClick={props.handleShowList}>
        {_l('返回投票')}
      </Button>
    );
  } else if ((!voteItem.isPostVote && !voteItem.isDeadline) || (voteItem.isPostVote && !props.isShowResult)) {
    actions = (
      <Space size={[12, 4]} wrap>
        {voteItem.Anonymous ? <Text type="secondary">{_l('匿名投票')}</Text> : undefined}
        <Text type="secondary">{_l('最多可以选择%0项', voteItem.AvailableNumber)}</Text>
        {voteItem.Deadline ? <Text type="secondary">{_l('%0 到期', voteItem.Deadline)}</Text> : undefined}
        {!voteItem.isMy ? <Text type="secondary">{_l('投票后可以查看结果')}</Text> : undefined}
      </Space>
    );
  } else if (!voteItem.isPostVote && voteItem.isDeadline) {
    actions = (
      <Space size={8}>
        <Text type="secondary">{_l('投票已到期')}</Text>
        <Button type="link" size="small" style={LINK_BUTTON_STYLE} onClick={props.handleReloadVote}>
          {_l('刷新结果')}
        </Button>
      </Space>
    );
  } else if (voteItem.isPostVote && props.isShowResult) {
    actions = voteItem.isDeadline ? (
      <Text type="secondary">{_l('投票已到期')}</Text>
    ) : (
      <Button type="link" size="small" style={LINK_BUTTON_STYLE} onClick={props.handleShowList}>
        {_l('更改我的投票')}
      </Button>
    );
  }

  return (
    <Flex align="center" gap={12} wrap style={VOTE_ACTION_STYLE}>
      <Text strong>{_l('总计 %0 票', voteItem.Num_Vote)}</Text>
      {actions}
    </Flex>
  );
}

VoteAction.propTypes = {
  isShowResult: PropTypes.bool,
  handleReloadVote: PropTypes.func,
  handleShowList: PropTypes.func,
  voteItem: PropTypes.object.isRequired,
};

export default VoteAction;

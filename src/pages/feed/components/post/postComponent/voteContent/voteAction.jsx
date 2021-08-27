import PropTypes from 'prop-types';
import React from 'react';

/**
 * 投票的操作项
 */
function VoteAction(props) {
  const voteItem = props.voteItem;
  let actions;

  if (props.isShowResult && !voteItem.isPostVote && !voteItem.isDeadline) {
    actions = <a onClick={props.handleShowList}>{_l('返回投票')}</a>;
  } else if ((!voteItem.isPostVote && !voteItem.isDeadline) || (voteItem.isPostVote && !props.isShowResult)) {
    // 没有投过票且没过期 或者 已经投过票并修改投票
    actions = (
      <span className="Gray_9">
        {voteItem.Anonymous ? <span className="mRight10">{_l('匿名投票')}</span> : undefined}
        <span className="mRight10">{_l('最多可以选择%0项', voteItem.AvailableNumber)}</span>
        {/* 过期时间*/ voteItem.Deadline ? <span className="mRight10">{_l('%0 到期', voteItem.Deadline)}</span> : undefined}
        {!voteItem.isMy ? <span>{_l('投票后可以查看结果') /* 投票后可以查看结果*/}</span> : undefined}
      </span>
    );
  } else if (!voteItem.isPostVote && voteItem.isDeadline) {
    // 如果没有投票但投票已过期
    actions = (
      <span>
        <span className="Gray_9 mRight10">{_l('投票已到期')}</span>
        <a onClick={props.handleReloadVote}>{_l('刷新结果') /* 刷新结果*/}</a>
      </span>
    );
  } else if (voteItem.isPostVote && props.isShowResult) {
    actions = (
      <span className="Gray_9">
        {voteItem.isDeadline ? /* 投票已过期*/ _l('投票已到期') : /* 更改我的投票*/ <a onClick={props.handleShowList}>{_l('更改我的投票')}</a>}
      </span>
    );
  }

  return (
    <div className="mTop10">
      <span className="mRight15">{_l('总计 %0 票', voteItem.Num_Vote)}</span>
      {actions}
    </div>
  );
}
VoteAction.propTypes = {
  isShowResult: PropTypes.bool,
  handleReloadVote: PropTypes.func,
  handleShowList: PropTypes.func,
  voteItem: PropTypes.object.isRequired,
};

module.exports = VoteAction;

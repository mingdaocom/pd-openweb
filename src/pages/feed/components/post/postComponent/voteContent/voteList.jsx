import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Button, Flex, Space } from 'ming-ui/antd-components';
import postAjax from 'src/api/post';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';
import { getPostDetail } from '../../../../redux/postActions';
import VoteItem from './voteItem';

const VOTE_BUTTONS_STYLE = { marginTop: 14 };

/**
 * 投票项列表
 */
class VoteList extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func,
    voteItem: PropTypes.object.isRequired,
    handleShowResult: PropTypes.func.isRequired,
  };

  state = {
    checkedOptions: _.map(
      _.filter(this.props.voteItem.Options, o => _.some(o.member, m => m.aid === md.global.Account.accountId)),
      'optionIndex',
    ),
    isVoting: false,
  };

  isVoting = false;
  isMounted = false;

  componentDidMount() {
    this.isMounted = true;
  }

  componentWillUnmount() {
    this.isMounted = false;
  }

  handleVote = () => {
    if (this.isVoting) {
      return;
    }

    const { dispatch } = this.props;
    const optionIndex = this.state.checkedOptions.join(',');

    if (!optionIndex) {
      return alert(_l('请选择投票项'), 3);
    }

    this.isVoting = true;
    this.setState({ isVoting: true });

    return postAjax
      .votePost({
        optionIndex,
        postId: this.props.voteItem.postID,
      })
      .then(success => {
        if (success) {
          dispatch(getPostDetail(this.props.voteItem.postID));
          this.props.handleShowResult();
        } else {
          alert(_l('投票失败'), 2);
        }
      })
      .catch(_requestError => {
        alertIfNotUnauthorized(_requestError, _l('投票失败'), 2);
      })
      .finally(() => {
        this.isVoting = false;
        if (this.isMounted) {
          this.setState({ isVoting: false });
        }
      });
  };

  handleOptionChange = (optionIndex, evt) => {
    let checkedOptions = [...this.state.checkedOptions];

    if (evt.target.checked) {
      if (this.props.voteItem.AvailableNumber > 1) {
        // 多选
        if (this.props.voteItem.AvailableNumber <= checkedOptions.length) {
          alert(_l('最多可以选择%0项', this.props.voteItem.AvailableNumber));
        } else {
          checkedOptions = _.uniq([...checkedOptions, optionIndex]);
        }
      } else {
        // 单选
        checkedOptions = [optionIndex];
      }

      this.setState({ checkedOptions });
    } else {
      checkedOptions = _.filter(checkedOptions, oi => oi != optionIndex);
      this.setState({ checkedOptions });
    }
  };

  render() {
    const voteItem = this.props.voteItem;
    return (
      <div>
        <Flex vertical gap={12}>
          {_.chain(voteItem.Options)
            .orderBy([voteItem.isPostVote ? 'count' : undefined, 'optionIndex'], [false, true])
            .map(o => (
              <VoteItem
                key={o.optionIndex}
                optionType={voteItem.AvailableNumber > 1 ? 'checkbox' : 'radio'}
                checked={this.state.checkedOptions.indexOf(o.optionIndex) >= 0}
                changeSelect={this.handleOptionChange}
                option={o}
              />
            ))
            .value()}
        </Flex>
        <Space size={8} wrap style={VOTE_BUTTONS_STYLE}>
          <Button type="primary" size="small" loading={this.state.isVoting} onClick={this.handleVote}>
            {_l('投票')}
          </Button>
          {voteItem.isPostVote ? (
            <Button size="small" onClick={this.props.handleShowResult}>
              {_l('取消更改')}
            </Button>
          ) : undefined}
          {voteItem.isAuthor && !voteItem.isPostVote ? (
            <Button size="small" onClick={this.props.handleShowResult}>
              {_l('查看结果')}
            </Button>
          ) : undefined}
        </Space>
      </div>
    );
  }
}

export default connect()(VoteList);

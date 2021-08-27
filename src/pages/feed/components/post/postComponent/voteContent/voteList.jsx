import React from 'react';
import _ from 'lodash';
import postAjax from 'src/api/post';
import { getPostDetail } from '../../../../redux/postActions';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import VoteItem from './voteItem';

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
    checkedOptions: _.pluck(_.filter(this.props.voteItem.Options, o => _.some(o.member, m => m.aid === md.global.Account.accountId)), 'optionIndex'),
  };

  handleVote = () => {
    const { dispatch } = this.props;
    const optionIndex = this.state.checkedOptions.join(',');
    if (!optionIndex) {
      return alert(_l('请选择投票项'), 3);
    }
    postAjax
      .votePost({
        optionIndex,
        postId: this.props.voteItem.postID,
      })
      .then((success) => {
        if (success) {
          dispatch(getPostDetail(this.props.voteItem.postID));
          this.props.handleShowResult();
        } else {
          alert(_l('投票失败'), 2);
        }
      });
  };

  handleOptionChange = (optionIndex, evt) => {
    let checkedOptions = this.state.checkedOptions;
    if (evt.target.checked) {
      if (this.props.voteItem.AvailableNumber > 1) {
        // 多选
        if (this.props.voteItem.AvailableNumber <= checkedOptions.length) {
          alert(_l('最多可以选择%0项', this.props.voteItem.AvailableNumber));
        } else {
          checkedOptions.push(optionIndex);
          checkedOptions = _.uniq(checkedOptions);
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
        <ul>
          {_(voteItem.Options)
            .sortByOrder([voteItem.isPostVote ? 'count' : undefined, 'optionIndex'], [false, true])
            .map((o, i) => (
              <VoteItem
                key={i}
                voteID={voteItem.VoteID}
                optionType={voteItem.AvailableNumber > 1 ? 'checkbox' : 'radio'}
                checked={this.state.checkedOptions.indexOf(o.optionIndex) >= 0}
                changeSelect={this.handleOptionChange}
                option={o}
              />
            ))
            .value()}
        </ul>
        <div className="mTop15">
          <a onClick={this.handleVote} className="btnBootstrap btnBootstrap-primary btnBootstrap-small mRight10">
            {_l('投票') /* 投票*/}
          </a>
          {voteItem.isPostVote ? (
            <a onClick={this.props.handleShowResult} className="btnBootstrap btnBootstrap-small mRight10">
              {_l('取消更改') /* 取消更改*/}
            </a>
          ) : (
            undefined
          )}
          {voteItem.isAuthor && !voteItem.isPostVote ? (
            <a onClick={this.props.handleShowResult} className="btnBootstrap btnBootstrap-small mRight10">
              {_l('查看结果') /* 查看结果*/}
            </a>
          ) : (
            undefined
          )}
        </div>
      </div>
    );
  }
}

module.exports = connect(state => ({}))(VoteList);

import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Card } from 'ming-ui/antd-components';
import { getPostDetail } from '../../../../redux/postActions';
import VoteAction from './voteAction';
import VoteList from './voteList';
import VoteResult from './voteResult';
import './voteContent.css';

const VOTE_CARD_STYLE = {
  maxWidth: 640,
  marginTop: 12,
  borderColor: 'var(--color-border-secondary)',
};
const VOTE_CARD_STYLES = { body: { padding: '14px 16px' } };

/**
 * 投票动态所带的投票内容
 */
class VoteContent extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func,
    voteItem: PropTypes.shape({
      VoteID: PropTypes.string.isRequired,
      postID: PropTypes.string.isRequired,
      isPostVote: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
      isDeadline: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
      Anonymous: PropTypes.string,
      AvailableNumber: PropTypes.number,
      Deadline: PropTypes.string,
      Options: PropTypes.arrayOf(
        PropTypes.shape({
          optionIndex: PropTypes.number,
          name: PropTypes.string, // vote message
        }),
      ),
    }),
  };

  constructor(props) {
    super(props);
    const isShowResult = !!(props.voteItem.isPostVote || props.voteItem.isDeadline);

    this.state = {
      isShowResult,
    };
  }

  handleReloadVote = () => {
    this.props.dispatch(getPostDetail(this.props.voteItem.postID));
    this.handleShowResult();
  };

  handleShowList = () => {
    this.setState({ isShowResult: false });
  };

  handleShowResult = () => {
    this.setState({ isShowResult: true });
  };

  render() {
    return (
      <Card className="voteContent" size="small" style={VOTE_CARD_STYLE} styles={VOTE_CARD_STYLES}>
        {this.state.isShowResult ? (
          <VoteResult {...this.props} />
        ) : (
          <VoteList handleShowResult={this.handleShowResult} {...this.props} />
        )}
        <VoteAction
          isShowResult={this.state.isShowResult}
          handleShowList={this.handleShowList}
          handleReloadVote={this.handleReloadVote}
          {...this.props}
        />
      </Card>
    );
  }
}

export default connect()(VoteContent);

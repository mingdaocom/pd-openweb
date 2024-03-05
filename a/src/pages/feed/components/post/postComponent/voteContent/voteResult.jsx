import _ from 'lodash';
import { previewQiniuUrl } from 'src/components/previewAttachments';
import VoteOptionMemberList from './voteOptionMemberList';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * 投票结果
 */
class VoteResult extends React.Component {
  static propTypes = {
    voteItem: PropTypes.object.isRequired,
  };

  state = {
    memberElements: {},
  };

  handleToggleVoteMembers = optionIndex => {
    const memberElements = this.state.memberElements;
    if (!memberElements[optionIndex]) {
      const option = _.find(this.props.voteItem.Options, o => o.optionIndex === optionIndex);
      memberElements[optionIndex] = React.createElement(VoteOptionMemberList, { members: option.member });
    } else {
      delete memberElements[optionIndex];
    }
    this.setState({ memberElements });
  };

  render() {
    const voteItem = this.props.voteItem;
    return (
      <ul className="voteResult">
        {_(voteItem.Options)
          .orderBy(['count', 'optionIndex'], [false, true])
          .map(o => (
            <li key={o.optionIndex}>
              <div>{o.name}</div>
              {o.file && o.file !== 'undefined' ? (
                <div onClick={() => previewQiniuUrl(o.file)}>
                  <img width={130} height={90} src={o.thumbnailFile} />
                </div>
              ) : undefined}
              <div className="clearfix">
                <div className="left outBar ThemeBGColor5">
                  <div className="inBar ThemeBGColor3" style={{ width: o.percentage + '%' }} />
                </div>
                <div className="left">
                  {o.count && !voteItem.Anonymous ? (
                    <a onClick={() => this.handleToggleVoteMembers(o.optionIndex)}>{o.count}</a>
                  ) : (
                    <span>{o.count}</span>
                  )}
                  <span>{_l('票')}</span>
                  {o.count ? <span>{'(' + o.percentage + '%)'}</span> : undefined}
                </div>
                {o.count && !voteItem.Anonymous ? (
                  <div className="right mRight30">
                    <a onClick={() => this.handleToggleVoteMembers(o.optionIndex)}>{_l('详细结果')}</a>
                  </div>
                ) : undefined}
              </div>
              {this.state.memberElements[o.optionIndex]}
            </li>
          ))
          .value()}
      </ul>
    );
  }
}

export default VoteResult;

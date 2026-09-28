import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Button, Flex, Image, Progress, Typography } from 'ming-ui/antd-components';
import previewAttachments, { transformQiniuUrl } from 'src/components/previewAttachments/previewAttachments';
import { getVoteFileUrl } from './utils';
import VoteOptionMemberList from './voteOptionMemberList';

const { Text } = Typography;
const VOTE_IMAGE_STYLE = {
  objectFit: 'contain',
  borderRadius: 4,
  cursor: 'pointer',
};
const RESULT_META_STYLE = { marginTop: 8 };
const RESULT_PROGRESS_STYLE = {
  flex: 1,
  minWidth: 160,
  maxWidth: 420,
  margin: 0,
};
const RESULT_COUNT_STYLE = { whiteSpace: 'nowrap' };
const COUNT_BUTTON_STYLE = { height: 'auto', paddingInline: 0, marginRight: 2 };
const DETAIL_BUTTON_STYLE = { marginLeft: 'auto', paddingInline: 0 };

/**
 * 投票结果
 */
class VoteResult extends React.Component {
  static propTypes = {
    voteItem: PropTypes.object.isRequired,
  };

  state = {
    expandedOptions: [],
  };

  handleToggleVoteMembers = optionIndex => {
    this.setState(prevState => ({
      expandedOptions: prevState.expandedOptions.includes(optionIndex)
        ? prevState.expandedOptions.filter(index => index !== optionIndex)
        : [...prevState.expandedOptions, optionIndex],
    }));
  };

  render() {
    const voteItem = this.props.voteItem;
    return (
      <Flex vertical gap={12}>
        {_.map(_.orderBy(voteItem.Options, ['count', 'optionIndex'], [false, true]), option => {
          const canShowMembers = !!option.count && !voteItem.Anonymous;
          const percentage = Number(option.percentage) || 0;

          return (
            <div key={option.optionIndex}>
              <div className="voteResultTitle">{option.name}</div>
              {option.file && option.file !== 'undefined' ? (
                <div className="voteResultImage">
                  <Image
                    preview={false}
                    width={130}
                    height={90}
                    src={option.thumbnailFile}
                    alt={option.name}
                    style={VOTE_IMAGE_STYLE}
                    onClick={() => previewAttachments(transformQiniuUrl(getVoteFileUrl(option.file)))}
                  />
                </div>
              ) : undefined}
              <Flex align="center" gap={10} wrap style={RESULT_META_STYLE}>
                <Progress
                  percent={percentage}
                  showInfo={false}
                  size={[-1, 6]}
                  strokeColor="var(--color-primary)"
                  railColor="var(--color-border-secondary)"
                  style={RESULT_PROGRESS_STYLE}
                />
                <Text style={RESULT_COUNT_STYLE}>
                  {canShowMembers ? (
                    <Button
                      type="link"
                      size="small"
                      style={COUNT_BUTTON_STYLE}
                      onClick={() => this.handleToggleVoteMembers(option.optionIndex)}
                    >
                      {option.count}
                    </Button>
                  ) : (
                    option.count
                  )}
                  {_l('票')}
                  {option.count ? ` (${percentage}%)` : undefined}
                </Text>
                {canShowMembers ? (
                  <Button
                    type="link"
                    size="small"
                    style={DETAIL_BUTTON_STYLE}
                    onClick={() => this.handleToggleVoteMembers(option.optionIndex)}
                  >
                    {_l('详细结果')}
                  </Button>
                ) : undefined}
              </Flex>
              {this.state.expandedOptions.includes(option.optionIndex) ? (
                <VoteOptionMemberList members={option.member} />
              ) : undefined}
            </div>
          );
        })}
      </Flex>
    );
  }
}

export default VoteResult;

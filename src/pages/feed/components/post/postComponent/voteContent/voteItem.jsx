import React from 'react';
import PropTypes from 'prop-types';
import { Checkbox, Image, Radio } from 'ming-ui/antd-components';
import previewAttachments, { transformQiniuUrl } from 'src/components/previewAttachments/previewAttachments';
import { getVoteFileUrl } from './utils';

const VOTE_IMAGE_STYLE = {
  objectFit: 'contain',
  borderRadius: 4,
  cursor: 'pointer',
};

/**
 * 单条投票项
 */
function VoteItem({ option, optionType, checked, changeSelect }) {
  const Selector = optionType === 'checkbox' ? Checkbox : Radio;

  return (
    <div>
      <Selector
        className="voteOptionControl"
        checked={checked}
        onChange={event => changeSelect(option.optionIndex, event)}
      >
        {option.name}
      </Selector>
      {option.file && option.file !== 'undefined' ? (
        <div className="voteOptionImage">
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
    </div>
  );
}

VoteItem.propTypes = {
  checked: PropTypes.bool,
  option: PropTypes.shape({
    file: PropTypes.string,
    name: PropTypes.string,
    optionIndex: PropTypes.number,
    thumbnailFile: PropTypes.string,
  }).isRequired,
  optionType: PropTypes.oneOf(['checkbox', 'radio']).isRequired,
  changeSelect: PropTypes.func.isRequired,
};

export default VoteItem;

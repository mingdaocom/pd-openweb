import PropTypes from 'prop-types';
import React from 'react';
import { previewQiniuUrl } from 'src/components/previewAttachments';
import cx from 'classnames';
/**
 * 单条投票项
 */
class VoteItem extends React.Component {
  static propTypes = {
    voteID: PropTypes.string,
    checked: PropTypes.bool,
    option: PropTypes.object,
    optionType: PropTypes.string,
    changeSelect: PropTypes.func,
  };

  render() {
    const { voteID, option, optionType, checked, changeSelect, ...restProps } = this.props;
    const itemDomId = voteID + option.optionIndex + Math.random();
    return (
      <li {...restProps}>
        <div className="voteItemContainer">
          <input
            className={cx({
              'with-gap': optionType === 'radio',
              'filled-in': optionType === 'checkbox',
            })}
            defaultChecked={option.selected}
            name={voteID}
            id={itemDomId}
            checked={checked}
            onChange={e => changeSelect(option.optionIndex, e)}
            type={optionType}
          />
          <label htmlFor={itemDomId}>{option.name}</label>
        </div>
        {option.file && option.file !== 'undefined' ? (
          <div onClick={() => previewQiniuUrl(option.file)}>
            <img className="mTop10 mLeft30" width={130} height={90} src={option.thumbnailFile} />
          </div>
        ) : undefined}
      </li>
    );
  }
}

export default VoteItem;

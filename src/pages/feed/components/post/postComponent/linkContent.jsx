import PropTypes from 'prop-types';
import React from 'react';
import { XmlEntities } from 'html-entities';

/**
 * 链接型动态所带的链接和图片
 */
class LinkContent extends React.Component {
  static propTypes = {
    linkItem: PropTypes.shape({
      linkUrl: PropTypes.string.isRequired,
      linkTitle: PropTypes.string.isRequired,
      linkDesc: PropTypes.string,
      flashUrl: PropTypes.string,
      linkThumb: PropTypes.string,
    }),
  };

  render() {
    const linkItem = this.props.linkItem;
    const entities = new XmlEntities();
    return (
      <div className="linkContent">
        <a target="_blank" rel="noopener noreferrer" href={linkItem.linkUrl}>
          {entities.decode(linkItem.linkTitle || _l('链接'))}
        </a>
        {(() => {
          if (linkItem.linkThumb) {
            return (
              <div className="mTop5">
                <img className="lazy" alt={linkItem.linkTitle} src={linkItem.linkThumb} />
              </div>
            );
          }
        })()}
        {linkItem.linkDesc && <div className="Gray mTop5">{linkItem.linkDesc.toLowerCase()}</div>}
      </div>
    );
  }
}

module.exports = LinkContent;

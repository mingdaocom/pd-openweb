import PropTypes from 'prop-types';
import React from 'react';
import ReactDom from 'react-dom';
import _ from 'lodash';
import UserName from '../../userName';

/**
 * 动态发布者姓名和发布到的群组
 */
class PostUsernameGroup extends React.Component {
  static displayName = 'PostUsernameGroup';

  static propTypes = {
    postItem: PropTypes.any.isRequired,
  };

  componentDidMount() {
    this.bindCard();
  }

  componentDidUpdate() {
    this.bindCard();
  }

  bindCard = () => {
    const $this = $(ReactDom.findDOMNode(this));
    require(['src/components/mdBusinessCard/mdBusinessCard'], () => {
      $this.find('[data-groupid]').mdBusinessCard();
    });
  };

  render() {
    const { postItem, ...props } = this.props;

    const children = [];
    if (postItem.Secretary) {
      // mingdao xiao mi shu
      children.push(<UserName key="username" isSecretary user={postItem.user} />);
    } else {
      // user name
      children.push(<UserName key="username" user={postItem.user} bindBusinessCard />);
      children.push(<div key="arrowRight" className="arrowRight InlineBlock" />);
      const shareProjects = (postItem.scope && postItem.scope.shareProjects) || [];
      const shareGroups = (postItem.scope && postItem.scope.shareGroups) || [];
      if (shareProjects.length || shareGroups.length) {
        _.forEach(shareProjects, (p) => {
          children.push(
            <span key={'project' + p.projectId} className="InlineBlock wMax100 breakAll ellipsis">
              <span className="breakAll">{p.companyDisplayName}</span> - {_l('所有同事')}
            </span>
          );
          children.push(', ');
        });
        _.forEach(shareGroups, (g) => {
          if (g.status === 1 /* open*/) {
            children.push(
              <a
                key={'group' + g.groupId}
                data-groupid={g.groupId}
                className="InlineBlock wMax100 breakAll ellipsis"
                href={'/group/groupValidate?gID=' + g.groupId}
              >
                {g.name}
              </a>
            );
          } else {
            children.push(
              <span key={'group' + g.groupId} data-groupid={g.groupId} className="InlineBlock wMax100 breakAll ellipsis">
                {g.name}
              </span>
            );
          }
          children.push(', ');
        });
        if (children[children.length - 1] === ', ') {
          children.pop();
        }
      } else {
        children.push(
          <span key="myself" className="InlineBlock wMax100 breakAll ellipsis">
            {_l('我自己')}
          </span>
        );
      }
    }
    children.push(<span key="colon">:</span>);
    let icon, postTypeName;
    switch (postItem.postType) {
      case '1':
        icon = 'link';
        postTypeName = _l('链接');
        break;
      case '4':
        icon = 'qa';
        postTypeName = _l('问答');
        break;
      case '7':
        icon = 'vote';
        postTypeName = _l('投票');
        break;
      case '8':
        icon = 'video';
        postTypeName = _l('音视频');
        break;
      case '2':
      case '3':
      case '9':
        icon = 'attachment';
        postTypeName = _l('附件');
        break;
    }
    if (icon) {
      children.push(<i key="icon" className={'mLeft5 Font16 ThemeColor3 icon-' + icon} data-titletip={postTypeName} />);
    }
    return <div {...props}>{children}</div>;
  }
}

module.exports = PostUsernameGroup;

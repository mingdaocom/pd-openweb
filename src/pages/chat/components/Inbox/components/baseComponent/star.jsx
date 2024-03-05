import React from 'react';
import Icon from 'ming-ui/components/Icon';
import { browserIsMobile } from 'src/util';
import inboxController from 'src/api/inbox';

export default class Star extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isFavorite: props.isFavorite,
    };
    this.clickHandler = this.clickHandler.bind(this);
  }

  clickHandler(flag) {
    const { inboxId } = this.props;
    return () => {
      inboxController.setInboxFavorite({
        inboxId,
        inboxFavorite: flag,
      }).then((res) => {
        if (res) {
          this.setState({
            isFavorite: flag,
          }, function () {
            alert(_l('操作成功'));
          });
        } else {
          alert(_l('操作失败'), 2);
        }
      });
    };
  }
  render() {
    const { isFavorite } = this.state;
    if (md.global.Account.isPortal && browserIsMobile()) {
      return null;
    }
    return (
      <div className="Right">
        {isFavorite === '1' ?
          <Icon icon='task-star' className='Font18 Hand' hint={_l('取消加星')} onClick={this.clickHandler('0')} style={{ color: '#fbc02d' }} /> :
          <Icon icon='star-hollow' className='Font18 LightGray Hand ThemeHoverColor3' hint={_l('加星')} onClick={this.clickHandler('1')} />
        }
      </div>
    );
  }
}

import React from 'react';
import withClickAway from 'ming-ui/decorators/withClickAway';

@withClickAway
class MoreActionDia extends React.Component {
  render() {
    if (!this.props.showMoreAction) {
      return ''
    }
    return <ul className='moreActionDia'>
      <li onClick={() => {
        this.props.inviteMore();
      }}>{_l('更多邀请')}</li>
      <li onClick={() => {
        this.props.importUser()
      }}>{_l('批量导入')}</li>
      <li onClick={() => {
        this.props.handleExportUser()
      }}>{_l('导出通讯录')}</li>
    </ul>
  }
}

export default MoreActionDia;

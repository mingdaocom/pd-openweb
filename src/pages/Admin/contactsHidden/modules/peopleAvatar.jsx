import React from 'react'
export default class PeopleAvatar extends React.Component {

  componentDidMount = () => {
    const { user = [] } = this.props;
    const { targetId = '' } = user;
    require(['mdBusinessCard'], () => {
      $(this.avatar).one('mouseover', () => {
        console.log(targetId)
        $(this.avatar).mdBusinessCard({
          accountId: targetId,
        }).trigger('mouseenter');
      });
    })
  }

  render() {
    const { user = [] } = this.props;
    return <img src={user.peopleAvatar} alt="" className="avatar" ref={avatar => this.avatar = avatar} />
  }
}

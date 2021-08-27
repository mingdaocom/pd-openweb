import React from 'react'
import account from 'src/api/account';
import './index.less'

export default class UserLevel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      list: []
    }
  }

  componentDidMount() {
    account.getAccountScore({}).then((data) => {
      this.setState({
        list: data.list
      })
    })
  }

  render() {
    const { list } = this.state
    return (
      <div className="userLvelBox">
        {
          list.map(item => {
            return <div className="levelItem">
              <span>{item.name}</span>
              <span className="ThemeColor3">{item.value}</span>
            </div>
          })
        }
      </div>
    )
  }
}
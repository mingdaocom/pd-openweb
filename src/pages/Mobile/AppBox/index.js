import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import TabBar from '../components/TabBar';
import './index.less';
import AppWarehouse from 'src/pages/AppHomepage/AppLib';
@withRouter
export default class AddBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      loading: true,
    }
  }
  componentDidMount() {
    // this.getlibraryByCategory();
  }
  // getlibraryByCategory() {
  //   this.setState({
  //     loading: true,
  //   });
  //   axios.post(`${__api_server__}AppManagement/GetAppsCategoryInfo`, {}).then(result => {
  //     const { data } = result.data;
  //     if (data) {
  //       this.setState({
  //         data,
  //         loading: false,
  //       });
  //     }
  //   });
  // }
  // renderAppList() {
  //   const { data } = this.state;
  //   return (
  //     <List className="categoryList">
  //       {
  //         data.map(item => (
  //           <List.Item
  //             key={item.categoryId}
  //             thumb={item.picture.fileUrl}
  //             onClick={() => {
  //               this.props.history.push(`/mobile/appBoxList/${item.categoryId}`);
  //             }}
  //           >
  //             {item.name}
  //           </List.Item>
  //         ))
  //       }
  //     </List>
  //   );
  // }
  render() {
    const { loading } = this.state;
    return (
      <div className="appBox h100">
        <div className="content">
          <AppWarehouse/>
        </div>
        <TabBar action="appBox" />
      </div>
    );
  }
}

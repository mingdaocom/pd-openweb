import React, { Fragment, Component } from 'react';
import { Icon } from 'ming-ui';
import { withRouter } from 'react-router-dom';
import { Modal, List, Toast } from 'antd-mobile';
import { navigateTo } from 'src/router/navigateTo';
import axios from 'axios';
import './AddDialog.less';

const getRef = WrapperdComponent => {
  return props => {
    const { getRef, ...otherProps }  = props;
    return <WrapperdComponent ref={getRef} {...otherProps} />
  }
}

@withRouter
@getRef
class AddDialog extends Component {
  constructor(props) {
    super(props);
  }

  installApp = (projectId, libraryId) => {
    if ((_.find(md.global.Account.projects, item => item.projectId === projectId) || {}).cannotCreateApp) {
      Toast.fail(_l('您没有权限安装应用'), 2);
      return;
    }

    Toast.loading(_l('正在添加'), 0);
    this.props.onCancel();

    axios.post(`https://pd.mingdao.com/api/AppManagement/GetLibraryToken`, {
      projectId,
      libraryId,
    }).then(result => {
      const { data } = result.data;
      if (!data) {
        Toast.fail(_l('安装失败，请稍后重试'), 2);
        return;
      }
      axios.post(`${md.global.Config.AppFileServer}Library/InstallApp`, {
        fileUrl: data,
        projectId,
        id: libraryId,
        accountId: md.global.Account.accountId,
      }).then(result => {
        const { appId } = result.data;
        if (!appId) {
          Toast.fail(_l('安装失败，请稍后重试'), 2);
          return;
        }
        Toast.success(_l('添加成功'), 2, () => {
          this.props.history.push(`/mobile/app/${appId}/true`);
        });
      }, err => {
        Toast.hide();
        this.props.onCancel();
      });
    });
  };

  render() {
    const { onCancel, visible, projectId } = this.props;
    const { length } = md.global.Account.projects;
    return (
      <Modal
        popup
        visible={visible}
        onClose={onCancel}
        animationType="slide-up"
      >
        <List renderHeader={() => <div>{_l('安装到')}</div>} style={{maxHeight: 390}}>
          {md.global.Account.projects.map((item, index) => (
            <List.Item
              key={item.projectId}
              thumb={<Icon className="Font20" icon={`chatnetwork-type${((length - 1 - index) % 6) + 1}`}/>}
              onClick={() => {
                this.installApp(item.projectId, this.props.libraryId);
              }}
            >
              {item.companyName}
            </List.Item>
          ))}
        </List>
      </Modal>
    );
  }
}

export default AddDialog;

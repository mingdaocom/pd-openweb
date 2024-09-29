import React, { Fragment, Component } from 'react';
import { Icon } from 'ming-ui';
import { withRouter } from 'react-router-dom';
import { Toast, ActionSheet } from 'antd-mobile';
import axios from 'axios';
import './AddDialog.less';
import _ from 'lodash';

const getRef = WrapperdComponent => {
  return props => {
    const { getRef, ...otherProps } = props;
    return <WrapperdComponent ref={getRef} {...otherProps} />;
  };
};

@withRouter
@getRef
class AddDialog extends Component {
  constructor(props) {
    super(props);
  }

  installApp = (projectId) => {
    if ((_.find(md.global.Account.projects, item => item.projectId === projectId) || {}).cannotCreateApp) {
      alert(_l('您没有权限安装应用'), 2);
      return;
    }

    Toast.show({
      icon: 'loading',
      content: _l('正在添加')
    });

    this.props.onCancel();
    let baseUrl =(md && md.global && md.global.SysSettings && md.global.SysSettings.templateLibraryTypes === '2') ? __api_server__.main : 'https://pd.mingdao.com/api/';
    const { libraryId } = this.props;
    axios
      .post(`${baseUrl}AppManagement/GetLibraryToken`, {
        projectId,
        libraryId,
      })
      .then(result => {
        const { data } = result.data;
        if (!data) {
          alert(_l('安装失败，请稍后重试'), 2);
          return;
        }
        axios
          .post(`${md.global.Config.AppFileServer}Library/InstallApp`, {
            fileUrl: data,
            projectId,
            id: libraryId,
            accountId: md.global.Account.accountId,
          })
          .then(
            result => {
              const { appId } = result.data;
              if (!appId) {
                alert(_l('安装失败，请稍后重试'), 2);
                return;
              }
              alert(_l('添加成功'), 1, 2000, () => {
                this.props.history.push(`/mobile/app/${appId}/true`);
              });
            },
            err => {
              Toast.clear();
              this.props.onCancel();
            },
          );
      });
  };

  render() {
    const { onCancel, visible, projectId } = this.props;
    const { length } = md.global.Account.projects;
    return (
      <ActionSheet
        visible={visible}
        extra={(
          <div className="flexRow header">
            <span className="Font13">{_l('安装到')}</span>
            <div className="closeIcon" onClick={onCancel}>
              <Icon icon="close" />
            </div>
          </div>
        )}
        actions={md.global.Account.projects.map((item, index) => {
          return {
            key: item.projectId,
            text: (
              <div className="Bold">
                {item.companyName}
              </div>
            ),
            onClick: () => this.installApp(item.projectId)
          }
        })}
        onClose={onCancel}
      >
      </ActionSheet>
    );
  }
}

export default AddDialog;

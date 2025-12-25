import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { Dialog } from 'ming-ui';
import homeApp from 'src/api/homeApp';
import { hasPermission } from 'src/components/checkPermission';
import { PERMISSION_ENUM } from 'src/pages/Admin/enum';
import SelectDBInstance from 'src/pages/AppHomepage/AppCenter/components/SelectDBInstance';
import { VersionProductType } from 'src/utils/enum';
import { getFeatureStatus } from 'src/utils/project';

const Title = styled.span`
  display: inline-block;
  max-width: 100%;
`;

const DataDBInstances = [{ label: _l('系统默认数据库'), value: '' }];

export default class CopyApp extends Component {
  static propTypes = {};
  static defaultProps = {};
  state = {
    pending: false,
    DBInstancesDialog: false,
    dataDBInstances: [],
    visible: true,
  };

  shouldComponentUpdate(nextProps, nextState) {
    return (
      !_.isEqual(nextState.pending, this.state.pending) ||
      !_.isEqual(nextState.DBInstancesDialog, this.state.DBInstancesDialog)
    );
  }

  copyApp = (dbInstanceId = undefined) => {
    const { para, onCopy, onCancel, title } = this.props;
    const { pending } = this.state;
    if (pending) return;
    this.setState({ pending: true });
    homeApp
      .copyApp({ appName: `${title}-复制`, ...para, dbInstanceId })
      .then(result => {
        onCancel();
        if (result && typeof result === 'string') {
          alert(_l('复制成功'));
          onCopy && onCopy({ appId: result });
        } else {
          Dialog.confirm({
            title: _l('复制失败'),
            removeCancelBtn: true,
            description: (
              <Fragment>
                <div className="Gray_75 mBottom15">{_l('以下工作表存在错误配置：')}</div>
                {result.worksheetNames.map((item, i) => {
                  return (
                    <div className="mTop5" key={i}>
                      {item}
                    </div>
                  );
                })}
              </Fragment>
            ),
          });
        }
      })
      .finally(() => {
        this.setState({ pending: false });
      });
  };

  handleCopy = () => {
    const { projectId, myPermissions = [] } = this.props;

    const hasDataBase =
      getFeatureStatus(projectId, VersionProductType.dataBase) === '1' &&
      (!md.global.Config.IsPlatformLocal || !md.global.Config.IsLocal);
    const hasAppResourceAuth = hasPermission(myPermissions, PERMISSION_ENUM.APP_RESOURCE_SERVICE);

    if (hasDataBase && hasAppResourceAuth) {
      homeApp.getMyDbInstances({ projectId }).then(res => {
        const list = res.map(l => {
          return {
            label: l.name,
            value: l.id,
          };
        });
        if (res && res.length) {
          this.setState({
            dataDBInstances: DataDBInstances.concat(list),
            DBInstancesDialog: true,
            visible: false,
          });
        } else {
          this.copyApp();
        }
      });
    } else {
      this.copyApp();
    }
  };

  render() {
    const { title, ...rest } = this.props;
    const { pending, visible, DBInstancesDialog, dataDBInstances } = this.state;
    return (
      <Fragment>
        <Dialog
          visible={visible}
          title={<Title className="overflow_ellipsis">{_l('复制应用 “%0”', title)}</Title>}
          okText={pending ? _l('复制中...') : _l('复制')}
          onOk={this.handleCopy}
          {...rest}
        >
          <div className="Gray_75">{_l('将复制目标应用的应用结构、流程和角色。应用下的数据和成员不会被复制')}</div>
        </Dialog>
        <SelectDBInstance
          visible={DBInstancesDialog}
          options={dataDBInstances}
          onOk={id => {
            this.copyApp(id);
          }}
          onCancel={() => {
            this.setState({ DBInstancesDialog: false });
            this.props.onCancel();
          }}
        />
      </Fragment>
    );
  }
}

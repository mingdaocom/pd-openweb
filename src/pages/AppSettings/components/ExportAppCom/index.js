import React, { Component, Fragment } from 'react';
import { Support } from 'ming-ui';
import ExportApp from 'src/pages/Admin/appManagement/modules/ExportApp';
import styled from 'styled-components';

const Btn = styled.div`
  width: 120px;
  height: 36px;
  line-height: 34px;
  text-align: center;
  border: 1px solid #2196f3;
  border-radius: 18px;
  color: #2196f3;
  font-weight: 500;
  cursor: pointer;
  &:hover {
    color: #fff;
    background-color: #2196f3;
  }
`;

export default class ExportAppCom extends Component {
  constructor(props) {
    super(props);
    this.state = {
      exportAppVisible: false,
    };
  }

  showExportDialog = () => this.setState({ exportAppVisible: true });
  render() {
    const { appId } = this.props;
    const { exportAppVisible } = this.state;
    return (
      <Fragment>
        <div className="Font17 bold mBottom8">{_l('导出')}</div>
        <div className="Gray_9e mBottom20">
          <span className="Gray_9e">
            {_l('将应用配置导出为文件，之后可以将此文件导入其他组织以实现应用迁移，可选择同时导出部分示例数据')}
          </span>
          {!md.global.Config.IsLocal && <Support text={_l('帮助')} type={3} href="https://help.mingdao.com/apply3" />}
        </div>
        <Btn radius onClick={this.showExportDialog}>
          <i className="icon icon-import mRight5" />
          {_l('导出应用')}
        </Btn>

        {exportAppVisible && (
          <ExportApp appIds={[appId]} closeDialog={() => this.setState({ exportAppVisible: false })} />
        )}
      </Fragment>
    );
  }
}

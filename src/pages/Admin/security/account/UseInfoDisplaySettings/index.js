import React, { Component, Fragment } from 'react';
import { Button } from 'ming-ui';
import projectSettingAjax from 'src/api/projectSetting';
import UserBaseInfoSetting from './components/UserBaseInfoSetting';
import './index.less';

export default class UseInfoDisplaySettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      settings: {},
      editStatus: 0, // 0:呈现 1:编辑
      saveLoading: false,
      flag: null,
      userInfo: {},
    };
    this.settingEle = null;
  }

  componentDidMount() {
    this.getUserFieldSettings();
  }

  getUserFieldSettings = () => {
    const { projectId } = this.props;
    projectSettingAjax
      .getUserFieldSettings({ projectId })
      .then(res => {
        this.setState({ loading: false, settings: res, flag: Date.now() });
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  };

  handleSave = () => {
    const { projectId } = this.props;
    const { saveLoading } = this.state;
    if (saveLoading || !this.settingEle) return;

    this.setState({ saveLoading: true, editStatus: 0 });
    const { baseSettingData, cardSettingData, displayFieldForName } = this.settingEle.state || {};

    const params = {
      projectId,
      psersonalSetList: baseSettingData.map(({ typeId }) => typeId),
      cardSetList: cardSettingData.map(({ typeId }) => typeId),
      displayFieldForName,
    };

    projectSettingAjax
      .setUserFieldSettings(params)
      .then(res => {
        if (res) {
          this.setState({
            settings: {
              psersonalSetList: baseSettingData.map(({ typeId }, index) => ({ typeId, order: index + 1 })),
              cardSetList: cardSettingData.map(({ typeId }, index) => ({ typeId, order: index + 51 })),
              displayFieldForName,
            },
            flag: Date.now(),
            saveLoading: false,
          });
        }
      })
      .catch(() => {
        this.setState({ saveLoading: false });
      });
  };

  render() {
    const { projectId, onClose = () => {} } = this.props;
    const { flag, settings, editStatus, saveLoading } = this.state;
    return (
      <div className="orgManagementWrap useInfoDisplayWrap">
        <div className="orgManagementHeader">
          <div className="flexRow alignItemsCenter">
            <i className="icon-backspace Font22 ThemeHoverColor3 Hand" onClick={onClose} />
            <h5 className="Font17 bold mLeft10 mBottom0">{_l('成员信息显示')}</h5>
          </div>
        </div>

        <div className="orgManagementContent">
          <UserBaseInfoSetting
            ref={ele => (this.settingEle = ele)}
            projectId={projectId}
            editStatus={editStatus}
            flag={flag}
            settings={settings}
          />
        </div>
        <div className="footer">
          {editStatus === 0 ? (
            <Button type="primary" onClick={() => this.setState({ editStatus: 1 })}>
              {_l('编辑')}
            </Button>
          ) : (
            <Fragment>
              <Button className="mRight24" type="primary" disabled={saveLoading} onClick={this.handleSave}>
                {saveLoading ? _l('处理中...') : _l('保存')}
              </Button>
              <Button type="link" onClick={() => this.setState({ editStatus: 0, flag: Date.now() })}>
                {_l('取消')}
              </Button>
            </Fragment>
          )}
        </div>
      </div>
    );
  }
}

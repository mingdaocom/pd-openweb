import React, { Component, Fragment } from 'react';
import { Icon, Dialog, RichText, LoadDiv } from 'ming-ui';
import { Tabs } from 'antd';
import privateDeclare from 'src/api/privateDeclare';

export default class DeclareDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      enableDeclareEdit: false,
      declareId: '',
      agreement: '',
      privacy: '',
      defaultData: null
    }
  }
  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.declareData, this.props.declareData)) {
      const { declareId, agreement, privacy } = nextProps.declareData;
      this.setState({
        declareId,
        agreement,
        privacy
      });
    }
  }
  handleSaveDeclare = () => {
    const { declareId, agreement, privacy } = this.state;

    if (_.isEmpty(agreement)) {
      alert(_l('请输入服务协议'), 3);
      return;
    }

    if (_.isEmpty(privacy)) {
      alert(_l('请输入隐私政策'), 3);
      return;
    }

    privateDeclare.editDeclare({
      declareId,
      agreement,
      privacy
    }).then(data => {
      if (data) {
        alert(_l('保存成功'));
        this.props.onChangeDeclareData({
          declareId,
          agreement,
          privacy
        });
      }
    });

    this.setState({ enableDeclareEdit: false});
    this.props.onCancel();
  }
  render() {
    const { enableDeclareEdit, agreement, privacy } = this.state;
    const { visible, onCancel } = this.props;
    return (
      <Dialog
        visible={visible}
        className="enableDeclareDialog"
        title={_l('服务协议和隐私政策')}
        description={_l('请根据自己所在组织的情况填写下方的服务协议和隐私政策')}
        width={900}
        type="fixed"
        footer={enableDeclareEdit ? undefined : (
          <div className="editFooter">
            <div
              className="flexRow valignWrapper pointer edit"
              onClick={() => { this.setState({ enableDeclareEdit: true }) }}
            >
              <Icon className="Gray_75 Font13" icon="edit" />
              <div className="mLeft5">{_l('编辑')}</div>
            </div>
          </div>
        )}
        okText={_l('保存')}
        onOk={this.handleSaveDeclare}
        onCancel={() => {
          const { declareData } = this.props;
          const { agreement, privacy } = this.state;
          if (_.isEqual({
            agreement: declareData.agreement,
            privacy: declareData.privacy,
          }, {
            agreement, privacy
          })) {
            onCancel();
            this.setState({ enableDeclareEdit: false});
          } else {
            Dialog.confirm({
              title: _l('确定退出编辑 ?'),
              description: _l('退出后，已编辑的内容不会保存'),
              onOk: () => {
                this.setState({
                  agreement: declareData.agreement,
                  privacy: declareData.privacy,
                });
                onCancel();
                this.setState({ enableDeclareEdit: false});
              }
            });
          }
        }}
      >
        <Tabs defaultActiveKey="serverAgreement" onChange={() => {}}>
          <Tabs.TabPane tab={_l('服务协议')} key="serverAgreement">
            <RichText
              data={agreement}
              maxWidth={900}
              className="enableDeclareRichText"
              showTool={enableDeclareEdit}
              disabled={!enableDeclareEdit}
              onActualSave={(html) => {
                this.setState({ agreement: html });
              }}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab={_l('隐私政策')} key="privacyPolicy">
            <RichText
              data={privacy}
              maxWidth={900}
              className="enableDeclareRichText"
              showTool={enableDeclareEdit}
              disabled={!enableDeclareEdit}
              onActualSave={(html) => {
                this.setState({ privacy: html });
              }}
            />
          </Tabs.TabPane>
        </Tabs>
      </Dialog>
    );
  }
}

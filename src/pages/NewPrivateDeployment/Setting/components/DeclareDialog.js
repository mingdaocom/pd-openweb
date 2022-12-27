import React, { Component, Fragment } from 'react';
import { Icon, Dialog, RichText, LoadDiv } from 'ming-ui';
import { Tabs } from 'antd';
import privateDeclare from 'src/api/privateDeclare';
import styled from 'styled-components';
import _ from 'lodash';

const DialogWrap = styled(Dialog)`
  .mui-dialog-body {
    overflow: hidden;
    padding-left: 0 !important;
    padding-right: 0 !important;
    display: flex;
    flex-direction: column;
  }
  .ant-tabs {
    flex: 1;
  }
  .ant-tabs-nav-wrap, .ant-tabs-nav-list {
    width: 100%;
  }
  .ant-tabs-tab {
    width: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .ant-tabs-nav {
    margin-bottom: 0 !important;
  }
  .ant-tabs-ink-bar {
    width: 100px !important;
    margin-left: 170px;
  }
  .ant-tabs-content-holder,
  .ant-tabs-content,
  .enableDeclareRichText,
  .ck-editor,
  .ck-rounded-corners,
  .ck-editor__main,
  .ck-content {
    height: 100% !important;
  }
  .ck-editor__main {
    box-sizing: border-box;
    height: calc(100% - 70px) !important;
    overflow: auto;
  }
  .ck .ck-content {
    background-color: #fff !important;
  }
  .ck .ck-content, .ck .ck-content.ck-focused, .editorNull {
    border: none !important;
  }
  .edit{
    &:hover, &:hover .icon {
      color: #2196f3 !important;
    }
  }
  .editFooter {
    display: flex;
    justify-content: flex-end;
  }
`;

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
      <DialogWrap
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
      </DialogWrap>
    );
  }
}

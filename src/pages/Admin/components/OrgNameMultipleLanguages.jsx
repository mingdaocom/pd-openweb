import React, { Component } from 'react';
import { Icon, Dialog, FunctionWrap, Input, LoadDiv } from 'ming-ui';
import langConfig from 'src/common/langConfig';
import appManagementAjax from 'src/api/appManagement';
import _ from 'lodash';
import styled from 'styled-components';

const InputWrap = styled(Input)`
  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

class SetOrgNameMultipleLanguages extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      settingLanguageData: [],
    };
  }

  componentDidMount() {
    this.getProjectLangs();
  }

  getProjectLangs = () => {
    const { projectId, type, correlationId } = this.props;
    const { settingLanguageData } = this.state;

    this.setState({ loading: true });

    appManagementAjax
      .getProjectLangs({
        correlationIds: correlationId ? [correlationId] : [],
        projectId,
        type,
      })
      .then((res = []) => {
        this.setState({
          settingLanguageData: !_.isEmpty(res)
            ? res.map(({ langType, data }) => ({ langType, data }))
            : settingLanguageData,
          loading: false,
        });
      });
  };

  onOk = () => {
    const { projectId, type, correlationId, onCancel = () => {}, updateName = () => {} } = this.props;
    const { settingLanguageData = [] } = this.state;

    appManagementAjax
      .editProjectLangs({
        projectId,
        type,
        correlationId: correlationId || projectId,
        data: settingLanguageData,
      })
      .then(res => {
        if (res) {
          const currentLang = _.find(settingLanguageData, v => v.langType === getCurrentLangCode());

          alert(_l('设置成功'));
          currentLang && updateName(currentLang);
          onCancel();
        } else {
          alert(_l('设置失败'), 2);
        }
      });
  };

  render() {
    const { onCancel = () => {}, currentLangName } = this.props;
    const { loading, settingLanguageData = [] } = this.state;

    return (
      <Dialog title={_l('设置多语言')} visible onCancel={onCancel} okText={_l('保存')} onOk={this.onOk}>
        {loading ? (
          <LoadDiv />
        ) : (
          langConfig.map(item => {
            const { code, value } = item;
            const currentLanguageData = (_.find(settingLanguageData, v => v.langType === code) || {}).data || [];
            const currentName =
              code === getCurrentLangCode(md.global.Config.DefaultLang) || _.isEmpty(currentLanguageData)
                ? currentLangName
                : currentLanguageData[0].value;

            return (
              <div key={code} className="mBottom15">
                <div className="mBottom5">{value}</div>
                <InputWrap
                  disabled={code === getCurrentLangCode(md.global.Config.DefaultLang)}
                  value={currentName}
                  className="w100"
                  onChange={value => {
                    let newData = _.clone(settingLanguageData);
                    const index = _.findIndex(newData, v => v.langType === code);
                    const temp = {
                      langType: code,
                      data: [{ key: 'name', value }],
                    };
                    if (index === -1) {
                      newData.push(temp);
                    } else {
                      newData[index] = temp;
                    }

                    this.setState({ settingLanguageData: newData });
                  }}
                />
              </div>
            );
          })
        )}
      </Dialog>
    );
  }
}

const setLanguages = props => FunctionWrap(SetOrgNameMultipleLanguages, { ...props });

export default function OrgNameMultipleLanguages(props) {
  return (
    <Icon
      icon="language"
      className={`ThemeColor Hand Font18 Gray_75 hoverText ${props.className}`}
      onClick={() => setLanguages(props)}
    />
  );
}

import React, { Component } from 'react';
import { Icon, Dialog, FunctionWrap, Input, LoadDiv, Textarea } from 'ming-ui';
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
    const { projectId, type, correlationId, currentLangName } = this.props;
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
            ? res.map(({ langType, data }) => {
                if (type === 30 && !!currentLangName && langType === getCurrentLangCode(md.global.Config.DefaultLang)) {
                  return { langType, data: [{ key: 'name', value: currentLangName }] };
                }
                return { langType, data };
              })
            : settingLanguageData,
          loading: false,
        });
      });
  };

  onOk = () => {
    const { projectId, type, correlationId, onCancel = () => {}, updateName = () => {} } = this.props;
    const { settingLanguageData = [] } = this.state;
    let AjaxFetch = null;
    if (type === 30) {
      AjaxFetch = appManagementAjax.editPasswordRegexTipLangs({
        data: settingLanguageData,
      });
    } else {
      AjaxFetch = appManagementAjax.editProjectLangs({
        projectId,
        type,
        correlationId: correlationId || projectId,
        data: settingLanguageData,
      });
    }

    AjaxFetch.then(res => {
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
    const { onCancel = () => {}, currentLangName, type } = this.props;
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

            const param = {
              disabled: code === getCurrentLangCode(md.global.Config.DefaultLang),
              className: 'w100',
              onChange: value => {
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
              },
            };

            return (
              <div key={code} className="mBottom15">
                <div className="mBottom5">{value}</div>
                {type === 30 ? (
                  <Textarea
                    {...param}
                    className={'w100 pTop6 pBottom6'}
                    minHeight={36}
                    maxHeight={120}
                    defaultValue={currentName || ''}
                  />
                ) : (
                  <InputWrap {...param} value={currentName} />
                )}
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

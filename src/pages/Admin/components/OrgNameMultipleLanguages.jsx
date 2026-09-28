import React, { Component } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, LoadDiv } from 'ming-ui';
import { Input, Modal } from 'ming-ui/antd-components';
import useFunctionWrapComponent from 'ming-ui/hooks/useFunctionWrapComponent';
import appManagementAjax from 'src/api/appManagement';
import langConfig from 'src/utils/platform/i18n/langConfig';

const InputWrap = styled(Input)`
  &:disabled {
    background-color: var(--color-background-secondary);
    cursor: not-allowed;
  }
`;
const TEXTAREA_STYLE = { minHeight: 36, maxHeight: 120 };

class SetOrgNameMultipleLanguages extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      settingLanguageData: [],
    };
    this.requestPending = false;
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
                if (
                  (window.platformENV.isLocal || window.platformENV.isOverseas) &&
                  type === 30 &&
                  !!currentLangName &&
                  langType === md.global.SysSettings.defaultLang
                ) {
                  // 更新提示说明对默认语言
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
    if (this.requestPending) return;

    const { projectId, type, correlationId, onCancel = () => {}, updateName = () => {} } = this.props;
    const { settingLanguageData = [] } = this.state;
    let AjaxFetch = null;

    if ((window.platformENV.isLocal || window.platformENV.isOverseas) && type === 30) {
      // 密码提示支持多语言
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

    this.requestPending = true;
    return AjaxFetch.then(res => {
      if (res) {
        const currentLang = _.find(settingLanguageData, v => v.langType === getCurrentLangCode());

        alert(_l('设置成功'));
        currentLang && updateName(currentLang);
        onCancel();
      } else {
        alert(_l('设置失败'), 2);
      }
    }).finally(() => {
      this.requestPending = false;
    });
  };

  render() {
    const { onCancel = () => {}, currentLangName, type } = this.props;
    const { loading, settingLanguageData = [] } = this.state;
    const defaultLangCode = md.global.SysSettings.defaultLang;

    return (
      <Modal
        width={480}
        open
        title={_l('设置语言')}
        okText={_l('保存')}
        mask={{ closable: true }}
        keyboard
        onCancel={onCancel}
        onOk={this.onOk}
      >
        {loading ? (
          <LoadDiv />
        ) : (
          langConfig.map(item => {
            const { code, value } = item;
            const currentLanguageData = (_.find(settingLanguageData, v => v.langType === code) || {}).data || [];
            const currentName =
              code === defaultLangCode || _.isEmpty(currentLanguageData)
                ? currentLangName
                : currentLanguageData[0].value;

            const param = {
              disabled: code === defaultLangCode,
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
                  <Input.TextArea
                    {...param}
                    autoSize
                    className={'w100 pTop6 pBottom6'}
                    style={TEXTAREA_STYLE}
                    defaultValue={currentName || ''}
                    onChange={event => param.onChange(event.target.value)}
                  />
                ) : (
                  <InputWrap {...param} value={currentName} onChange={e => param.onChange(e.target.value)} />
                )}
              </div>
            );
          })
        )}
      </Modal>
    );
  }
}

export default function OrgNameMultipleLanguages(props) {
  const { open: openSetLanguages, holder } = useFunctionWrapComponent(SetOrgNameMultipleLanguages);

  return (
    <>
      {holder}
      <Icon
        icon="language"
        className={`colorPrimary Hand Font18 textSecondary hoverText ${props.className}`}
        onClick={() => openSetLanguages(props)}
      />
    </>
  );
}

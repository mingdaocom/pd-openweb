import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import styled from 'styled-components';
import { TagTextarea } from 'ming-ui';
import { Input, Modal, Select } from 'ming-ui/antd-components';
import { API_EXTENDS, PLUGIN_TYPE, pluginApiConfig, pluginConstants } from '../config';

const PUBLISH_MODAL_STYLES = { body: { paddingTop: 12 } };

const FormItem = styled.div`
  margin-bottom: 24px;
  .labelText {
    font-weight: 500;
    margin-bottom: 10px;
    .requiredStar {
      color: var(--color-error);
      margin-left: -4px;
    }
  }
  .Width60 {
    width: 60px;
  }
  .selectItem {
    width: 100% !important;
    font-size: 13px;
  }
`;

const compareVersion = (newVersion, oldVersion) => {
  const newParts = newVersion.split('.').map(part => parseInt(part) || 0);
  const oldParts = oldVersion.split('.').map(part => parseInt(part) || 0);

  for (let i = 0; i < 3; i++) {
    if (newParts[i] !== oldParts[i]) {
      return newParts[i] > oldParts[i];
    }
  }

  return false; // 版本号相同
};

export default function PublishVersion(props) {
  const {
    onClose,
    latestVersion = '',
    debugConfiguration,
    pluginId,
    commitId,
    onRefreshDetail,
    source = 0,
    pluginType = PLUGIN_TYPE.VIEW,
    onRefreshPublishList = () => {},
  } = props;
  const defaultConfigValue = !_.isEmpty(debugConfiguration) ? JSON.stringify(debugConfiguration) : '';
  const [commitList, setCommitList] = useState([]);
  const [formData, setFormData] = useSetState({ configuration: defaultConfigValue, commitId });
  const [fetchState, setFetchState] = useSetState({ loading: true, pageIndex: 1, noMore: false });
  const textareaRef = useRef();
  const isWorkflowPlugin = pluginType === PLUGIN_TYPE.WORKFLOW;

  const pluginApi = pluginApiConfig[pluginType];

  const fetchCommitHistory = useCallback(() => {
    if (!fetchState.loading) {
      return;
    }

    pluginApi
      .getCommitHistory({ id: pluginId, pageSize: 50, pageIndex: fetchState.pageIndex, source }, API_EXTENDS)
      .then(res => {
        if (res) {
          setFetchState({ loading: false, noMore: res.history.length < 50 });
          setCommitList(prevCommitList =>
            fetchState.pageIndex > 1 ? prevCommitList.concat(res.history) : res.history,
          );
        }
      });
  }, [fetchState.loading, fetchState.pageIndex, pluginApi, pluginId, setFetchState, source]);

  useEffect(() => {
    //设置版本号默认值
    if (latestVersion) {
      const versionArr = latestVersion.split('.');
      setFormData({
        v1: parseInt(versionArr[0]),
        v2: parseInt(versionArr[1]),
        v3: parseInt(versionArr[2]) + 1,
      });
    } else {
      setFormData({ v1: 0, v2: 0, v3: 1 });
    }
  }, [latestVersion, setFormData]);

  useEffect(() => {
    !isWorkflowPlugin && fetchCommitHistory();
  }, [fetchCommitHistory, isWorkflowPlugin]);

  const onChangeVersionValue = (value, objName) => {
    if (!value) {
      setFormData({ [objName]: '' });
      return;
    }

    setFormData({ [objName]: isNaN(parseInt(value)) ? 0 : parseInt(value) });
  };

  // 比较版本号

  const onValidate = () => {
    if (!isWorkflowPlugin && !formData.commitId) {
      alert(_l('请选择一个已提交的代码'), 3);
      return;
    }

    if (_.includes([formData.v1, formData.v2, formData.v3], '')) {
      alert(_l('请正确填写版本号'), 3);
      return;
    }

    if (latestVersion) {
      const newVersion = [formData.v1, formData.v2, formData.v3].join('.');

      if (!compareVersion(newVersion, latestVersion)) {
        alert(_l(`版本号必须大于${latestVersion}`), 3);
        return;
      }
    }

    if (!formData.description) {
      alert(_l('发布说明不能为空'), 3);
      return;
    }

    if (formData.description.length > 150) {
      alert(_l('发布说明最多150个字符'), 3);
      return;
    }

    if (
      !isWorkflowPlugin &&
      !!formData.configuration.replace(/\s/g, '') &&
      formData.configuration.replace(/\s/g, '') !== '{}' &&
      _.isEmpty(safeParse(formData.configuration))
    ) {
      alert(_l('发布配置格式不正确,请输入JSON格式'), 3);
      return;
    }

    return true;
  };

  const onPublish = () => {
    if (onValidate()) {
      pluginApi
        .release(
          {
            id: formData.commitId,
            versionCode: [formData.v1, formData.v2, formData.v3].join('.'),
            description: formData.description,
            configuration: safeParse(formData.configuration),
            pluginSource: source,
            pluginId,
          },
          API_EXTENDS,
        )
        .then(res => {
          if (res) {
            alert(_l('发布成功'));
            onRefreshDetail();
            onRefreshPublishList();
            onClose();
          }
        });
    }
  };

  return (
    <Modal
      open
      mask={{ closable: true }}
      keyboard
      width={800}
      title={
        <React.Fragment>
          <div>{_l('发布新版本到组织')}</div>
          <div className="Font13 Normal textSecondary mTop8">{pluginConstants[pluginType].publishDescription}</div>
        </React.Fragment>
      }
      styles={PUBLISH_MODAL_STYLES}
      onOk={onPublish}
      onCancel={onClose}
    >
      {!isWorkflowPlugin && (
        <FormItem>
          <div className="labelText">
            <span className="requiredStar">*</span>
            {_l('选择已提交的代码')}
          </div>
          <Select
            className="selectItem"
            options={commitList.map(item => {
              return {
                label: <span>{`${item.author.fullname}，${item.commitTime} ${item.message || ''}`}</span>,
                value: item.id,
              };
            })}
            notFoundContent={_l('暂无已提交的代码')}
            value={formData.commitId}
            onChange={commitId => setFormData({ commitId })}
            onPopupScroll={e => {
              if (e.target && e.target.scrollTop + e.target.offsetHeight === e.target.scrollHeight) {
                // 滚动到底部实现分页加载逻辑
                setFetchState({ loading: true, pageIndex: fetchState.pageIndex + 1 });
              }
            }}
          />
        </FormItem>
      )}

      <FormItem>
        <div className="labelText">
          <span className="requiredStar">*</span>
          {_l('版本号')}
        </div>
        <Input
          className="Width60"
          maxLength={3}
          value={formData.v1}
          onChange={event => onChangeVersionValue(event.target.value, 'v1')}
        />
        <span className="mLeft2 mRight2">.</span>
        <Input
          className="Width60"
          maxLength={3}
          value={formData.v2}
          onChange={event => onChangeVersionValue(event.target.value, 'v2')}
        />
        <span className="mLeft2 mRight2">.</span>
        <Input
          className="Width60"
          maxLength={3}
          value={formData.v3}
          onChange={event => onChangeVersionValue(event.target.value, 'v3')}
        />
        {!!latestVersion && <span className="textSecondary mLeft12">{_l('版本号必须大于：') + latestVersion}</span>}
      </FormItem>
      <FormItem>
        <div className="labelText">
          <span className="requiredStar">*</span>
          {_l('发布说明')}
        </div>
        <Input
          className="w100"
          value={formData.description}
          onChange={event => setFormData({ description: event.target.value })}
        />
      </FormItem>

      {!isWorkflowPlugin && (
        <FormItem>
          <div className="labelText">{_l('发布给其他用户时的默认环境参数配置,采用JSON格式')}</div>
          <TagTextarea
            height={180}
            getRef={ref => (textareaRef.current = ref)}
            defaultValue={defaultConfigValue}
            codeMirrorMode="javascript"
            onChange={(_, configuration) => {
              setFormData({ configuration });
            }}
          />
          <div
            className="mTop12 InlineBlock pointer textSecondary hoverColorPrimary"
            onClick={() => {
              textareaRef.current.setValue(defaultConfigValue);
              setFormData({ configuration: defaultConfigValue });
            }}
          >
            {_l('重新载入开发时的环境参数配置')}
          </div>
        </FormItem>
      )}
    </Modal>
  );
}

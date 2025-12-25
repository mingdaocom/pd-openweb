import React, { useEffect, useRef, useState } from 'react';
import { useSetState } from 'react-use';
import { Select } from 'antd';
import _ from 'lodash';
import styled from 'styled-components';
import { Dialog, Input, TagTextarea } from 'ming-ui';
import { API_EXTENDS, PLUGIN_TYPE, pluginApiConfig, pluginConstants } from '../config';

const PublishDialog = styled(Dialog)`
  .mui-dialog-desc {
    font-size: 13px !important;
    padding-top: 8px !important;
  }
  .mui-dialog-body {
    padding-top: 12px !important;
  }
`;

const FormItem = styled.div`
  margin-bottom: 24px;
  .labelText {
    font-weight: 500;
    margin-bottom: 10px;
    .requiredStar {
      color: #f44336;
      margin-left: -4px;
    }
  }
  .ming.Input {
    font-size: 13px;
  }
  .Width60 {
    width: 60px;
  }
  .selectItem {
    width: 100% !important;
    font-size: 13px;
    .ant-select-selector {
      min-height: 36px;
      padding: 2px 11px !important;
      border: 1px solid #ccc !important;
      border-radius: 3px !important;
      box-shadow: none !important;
    }
    &.ant-select-focused {
      .ant-select-selector {
        border-color: #1e88e5 !important;
      }
    }
  }
`;

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
  }, []);

  useEffect(() => {
    !isWorkflowPlugin && fetchCommitHistory();
  }, [fetchState.pageIndex]);

  const fetchCommitHistory = () => {
    if (!fetchState.loading) {
      return;
    }
    pluginApi
      .getCommitHistory({ id: pluginId, pageSize: 50, pageIndex: fetchState.pageIndex, source }, API_EXTENDS)
      .then(res => {
        if (res) {
          setFetchState({ loading: false, noMore: res.history.length < 50 });
          setCommitList(fetchState.pageIndex > 1 ? commitList.concat(res.history) : res.history);
        }
      });
  };

  const onChangeVersionValue = (value, objName) => {
    if (!value) {
      setFormData({ [objName]: '' });
      return;
    }
    setFormData({ [objName]: isNaN(parseInt(value)) ? 0 : parseInt(value) });
  };

  // 比较版本号
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
    <PublishDialog
      visible
      width={800}
      title={_l('发布新版本到组织')}
      description={pluginConstants[pluginType].publishDescription}
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
          onChange={value => onChangeVersionValue(value, 'v1')}
        />
        <span className="mLeft2 mRight2">.</span>
        <Input
          className="Width60"
          maxLength={3}
          value={formData.v2}
          onChange={value => onChangeVersionValue(value, 'v2')}
        />
        <span className="mLeft2 mRight2">.</span>
        <Input
          className="Width60"
          maxLength={3}
          value={formData.v3}
          onChange={value => onChangeVersionValue(value, 'v3')}
        />
        {!!latestVersion && <span className="Gray_75 mLeft12">{_l('版本号必须大于：') + latestVersion}</span>}
      </FormItem>
      <FormItem>
        <div className="labelText">
          <span className="requiredStar">*</span>
          {_l('发布说明')}
        </div>
        <Input className="w100" value={formData.description} onChange={description => setFormData({ description })} />
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
            className="mTop12 InlineBlock pointer Gray_75 Hover_21"
            onClick={() => {
              textareaRef.current.setValue(defaultConfigValue);
              setFormData({ configuration: defaultConfigValue });
            }}
          >
            {_l('重新载入开发时的环境参数配置')}
          </div>
        </FormItem>
      )}
    </PublishDialog>
  );
}

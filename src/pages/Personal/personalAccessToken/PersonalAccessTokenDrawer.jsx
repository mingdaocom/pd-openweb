import React, { useEffect, useRef, useState } from 'react';
import { useSetState } from 'react-use';
import { Drawer, Select } from 'antd';
import _ from 'lodash';
import moment from 'moment';
import { Button, Dropdown, Input, LoadDiv, MdAntDatePicker, RadioGroup } from 'ming-ui';
import { dialogSelectApp } from 'ming-ui/functions';
import openAuthorAjax from 'src/api/openAuthor';
import ApiScopeList from 'src/pages/Admin/components/ApiScopeList';
import { SCOPE_LIST } from 'src/pages/Admin/components/ApiScopeList/enum';
import AuthAppList from 'src/pages/Admin/components/AuthAppList';

const CUSTOM_VALIDITY = 'custom';
const DATE_FORMAT = 'YYYY-MM-DD HH:mm';
const VALIDITY_EXPIRE_FORMAT = 'M月D日 HH:mm';
const ALL_PROJECTS_VALUE = 'all_projects';
const ENTITY_SCOPE_TYPE = {
  ALL: 1,
  SPECIFIC: 2,
};
const CREATE_PAT_STATUS = {
  SUCCESS: 1,
  PROJECT_NOT_ALLOWED: 2,
};

export const VALIDITY_OPTIONS = [
  { text: _l('永久有效'), value: 0 },
  { text: _l('1天'), value: 1 },
  { text: _l('7天'), value: 7 },
  { text: _l('30天'), value: 30 },
  { text: _l('自定义'), value: CUSTOM_VALIDITY },
];

const APP_SCOPE_OPTIONS = [
  { text: _l('所有应用'), value: 1 },
  { text: _l('指定应用'), value: 2 },
];

export const DEFAULT_INTERFACE_CODES = _.uniq(
  SCOPE_LIST.flatMap(scope =>
    (scope.children || []).length ? [scope.code, ...scope.children.map(item => item.code)] : [scope.code],
  ),
);

const getValidityValue = ({ validityType, days }) =>
  validityType === 1 ? days : validityType === 2 ? CUSTOM_VALIDITY : 0;

const getValidityExpireTime = days =>
  _.isNumber(days) && days > 0 ? moment().add(days, 'days').format(VALIDITY_EXPIRE_FORMAT) : '';

const getValidityFields = value => {
  if (value === CUSTOM_VALIDITY) {
    return { validityType: 2, days: null, customTime: moment().add(1, 'days').format(DATE_FORMAT) };
  }

  return {
    validityType: value ? 1 : 0,
    days: value || null,
    customTime: null,
  };
};

const createFormData = () => ({
  name: '',
  entityScopeType: ENTITY_SCOPE_TYPE.ALL,
  projectIds: [],
  scopeCodes: DEFAULT_INTERFACE_CODES,
  appScopeType: 1,
  appIds: [],
  validityType: 0,
  days: null,
  customTime: null,
});

const isSingleProjectScope = data =>
  data.entityScopeType === ENTITY_SCOPE_TYPE.SPECIFIC && (data.projectIds || []).length === 1;

const getDisabledCustomTime = date => {
  const current = moment();

  if (date && !moment(date).isSame(current, 'day')) {
    return {
      disabledHours: () => [],
      disabledMinutes: () => [],
    };
  }

  return {
    disabledHours: () => Array.from({ length: current.hour() }, (_, index) => index),
    disabledMinutes: hour =>
      hour === current.hour() ? Array.from({ length: current.minute() }, (_, index) => index) : [],
  };
};

export default function PersonalAccessTokenDrawer(props) {
  const { tokenId, visible, onClose, onSuccess = () => {} } = props;
  const isEdit = !!tokenId;
  const projectOptions = (md.global.Account.projects || [])
    .filter(project => project.projectId)
    .map(project => ({ label: project.companyName, value: project.projectId }));
  const [formData, setFormData] = useSetState(createFormData());
  const [selectedApps, setSelectedApps] = useState([]);
  const [detailLoading, setDetailLoading] = useState(isEdit);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [customDateOpen, setCustomDateOpen] = useState(false);
  const nameInputRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => nameInputRef.current?.focus(), 200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!tokenId) return;

    setDetailLoading(true);
    openAuthorAjax
      .getPAT({ id: tokenId })
      .then(res => {
        const apps = (res.apps || []).map(app => ({ ...app, iconUrl: app.iconUrl || app.icon }));
        setFormData(res);
        setSelectedApps(apps);
      })
      .catch(() => {
        alert(_l('获取令牌详情失败'), 2);
        onClose();
      })
      .finally(() => setDetailLoading(false));
  }, [tokenId]);

  const canSelectSpecifiedApps = isSingleProjectScope(formData);

  const onSelectApps = () => {
    if (!canSelectSpecifiedApps) return;

    dialogSelectApp({
      projectId: formData.projectIds[0],
      title: _l('选择授权应用'),
      ajaxFun: 'getManagerApps',
      ajaxParam: { projectId: formData.projectIds[0] },
      onOk: apps => {
        const nextApps = _.uniqBy(selectedApps.concat(apps), 'appId');
        setSelectedApps(nextApps);
        setFormData({ appIds: nextApps.map(item => item.appId) });
      },
    });
  };

  const onRemoveApp = appId => {
    const nextApps = selectedApps.filter(item => item.appId !== appId);
    setSelectedApps(nextApps);
    setFormData({ appIds: nextApps.map(item => item.appId) });
  };

  const onValidityChange = value => {
    setFormData(getValidityFields(value));
    setCustomDateOpen(value === CUSTOM_VALIDITY);
  };

  const onProjectChange = values => {
    const selectedValues = values || [];
    const hasAllProjects = selectedValues.includes(ALL_PROJECTS_VALUE);
    let entityScopeType = ENTITY_SCOPE_TYPE.SPECIFIC;
    let projectIds = selectedValues.filter(value => value !== ALL_PROJECTS_VALUE);

    if (hasAllProjects) {
      if (formData.entityScopeType === ENTITY_SCOPE_TYPE.ALL && projectIds.length) {
        entityScopeType = ENTITY_SCOPE_TYPE.SPECIFIC;
      } else {
        entityScopeType = ENTITY_SCOPE_TYPE.ALL;
        projectIds = [];
      }
    }

    const shouldUseAllApps = entityScopeType === ENTITY_SCOPE_TYPE.ALL || projectIds.length !== 1;

    setSelectedApps([]);
    setFormData({
      entityScopeType,
      projectIds,
      appScopeType: shouldUseAllApps ? 1 : formData.appScopeType,
      appIds: [],
    });
  };

  const onValidate = () => {
    const name = _.trim(formData.name);

    if (!name) return alert(_l('请输入名称'), 3) || false;
    if (name.length > 40) return alert(_l('名称最多40个字符'), 3) || false;

    if (formData.entityScopeType !== ENTITY_SCOPE_TYPE.ALL && !(formData.projectIds || []).length)
      return alert(_l('请选择组织'), 3) || false;
    if (formData.validityType === 2 && !formData.customTime) return alert(_l('请选择自定义时间'), 3) || false;
    if (canSelectSpecifiedApps && formData.appScopeType === 2 && !(formData.appIds || []).length)
      return alert(_l('请选择授权应用'), 3) || false;
    if (!(formData.scopeCodes || []).length) return alert(_l('请选择接口范围'), 3) || false;

    return true;
  };

  const getSubmitData = name => ({
    name,
    scopeCodes: formData.scopeCodes,
    appScopeType: canSelectSpecifiedApps ? formData.appScopeType : 1,
    validityType: formData.validityType,
    appIds: canSelectSpecifiedApps && formData.appScopeType === 2 ? formData.appIds : [],
    days: formData.validityType === 1 ? formData.days : null,
    customTime: formData.validityType === 2 ? formData.customTime : null,
  });

  const getProjectNames = projectIds => {
    return (projectIds || '')
      .split(',')
      .map(projectId => _.trim(projectId))
      .filter(_.identity)
      .map(projectId => {
        const project = projectOptions.find(item => item.value === projectId);
        return project?.label || projectId;
      });
  };

  const onSubmit = name => {
    const request = isEdit ? openAuthorAjax.updatePAT : openAuthorAjax.createPAT;
    const data = isEdit
      ? { id: tokenId, ...getSubmitData(name) }
      : {
          entityScopeType: formData.entityScopeType,
          projectIds: formData.entityScopeType === ENTITY_SCOPE_TYPE.SPECIFIC ? formData.projectIds : [],
          ...getSubmitData(name),
        };

    request(data)
      .then(res => {
        if (isEdit) {
          if (res) {
            alert(_l('编辑成功'));
            onSuccess();
            onClose();
          } else {
            alert(_l('编辑失败'), 2);
          }
        } else {
          if (res?.status === CREATE_PAT_STATUS.PROJECT_NOT_ALLOWED) {
            const projectNames = getProjectNames(res.notAllowedProjectId);
            alert(_l('%0 不允许使用个人访问令牌', projectNames.join(', ')), 2);
            return;
          }

          if (res?.status === CREATE_PAT_STATUS.SUCCESS && res?.rawToken) {
            alert(_l('创建成功'));
            onSuccess({ rawToken: res.rawToken });
            onClose();
          } else {
            alert(_l('创建失败'), 2);
          }
        }
      })
      .finally(() => setSubmitLoading(false));
  };

  const onOk = () => {
    if (!onValidate()) return;

    setSubmitLoading(true);
    const name = _.trim(formData.name);
    onSubmit(name);
  };

  const renderName = () => (
    <div className="formItem">
      <div className="label required">{_l('名称')}</div>
      <Input
        className="w100"
        manualRef={nameInputRef}
        value={formData.name}
        placeholder={_l('请填写')}
        maxLength={40}
        onChange={value => setFormData({ name: value })}
      />
    </div>
  );

  const renderValidity = () => (
    <div className="formItem">
      <div className="label required">{_l('有效期')}</div>
      <Dropdown
        border
        isAppendToBody
        className="w100"
        data={VALIDITY_OPTIONS}
        value={getValidityValue(formData)}
        renderItem={item => {
          const expireTime = getValidityExpireTime(item.value);

          return (
            <div className="flexRow alignItemsCenter">
              <span>{item.text}</span>
              {!!expireTime && <span className="mLeft16 textSecondary">{expireTime}</span>}
            </div>
          );
        }}
        onChange={onValidityChange}
      />
      {formData.validityType === 2 && (
        <div className="mTop10">
          <MdAntDatePicker
            className="w100 customDatePicker"
            showTime={{ format: 'HH:mm' }}
            autoFocus
            inputReadOnly
            open={customDateOpen}
            onOpenChange={setCustomDateOpen}
            format={DATE_FORMAT}
            value={formData.customTime ? moment(formData.customTime) : null}
            getPopupContainer={() => document.body}
            disabledDate={date => date && moment(date).isBefore(moment(), 'day')}
            disabledTime={getDisabledCustomTime}
            onChange={value => setFormData({ customTime: value ? value.format(DATE_FORMAT) : '' })}
          />
        </div>
      )}
    </div>
  );

  const renderProject = () => (
    <div className="formItem">
      <div className="label required">{_l('组织')}</div>
      <Select
        mode="multiple"
        allowClear
        showSearch
        optionLabelProp="label"
        className="w100 mdAntSelect projectSelect"
        dropdownClassName="patProjectSelectDropdown"
        disabled={isEdit}
        placeholder={_l('请选择组织')}
        value={formData.entityScopeType === ENTITY_SCOPE_TYPE.ALL ? [ALL_PROJECTS_VALUE] : formData.projectIds || []}
        notFoundContent={<span className="textTertiary">{_l('暂无数据')}</span>}
        getPopupContainer={() => document.body}
        filterOption={(inputValue, option) => {
          return String(option?.label || '')
            .toLowerCase()
            .includes(inputValue.toLowerCase());
        }}
        onChange={onProjectChange}
      >
        <Select.Option className="mdAntSelectOption" value={ALL_PROJECTS_VALUE} label={_l('所有组织')}>
          <div className="allProjectsOption">
            <span className="allProjectsName">{_l('所有组织')}</span>
            <span className="allProjectsDesc">{_l('包含当前及未来所有开启个人访问令牌的组织')}</span>
          </div>
        </Select.Option>
        {projectOptions.map(project => (
          <Select.Option className="mdAntSelectOption" key={project.value} value={project.value} label={project.label}>
            {project.label}
          </Select.Option>
        ))}
      </Select>
    </div>
  );

  const renderAppScope = () => (
    <div className="formItem">
      <div className="label required">{_l('应用范围')}</div>
      <RadioGroup
        className="scopeRadio"
        data={APP_SCOPE_OPTIONS.map(item => ({
          ...item,
          disabled: item.value === 2 && !canSelectSpecifiedApps,
        }))}
        checkedValue={formData.appScopeType}
        onChange={value => {
          if (value === 2 && !canSelectSpecifiedApps) return;
          setFormData({ appScopeType: value });
        }}
      />
      {canSelectSpecifiedApps && formData.appScopeType === 2 && (
        <div className="specifyAppWrap">
          <div className="addAppRow">
            <span className="addAppBtn Hand" onClick={onSelectApps}>
              {_l('+添加')}
            </span>
          </div>
          <AuthAppList className="authAppList" authApps={selectedApps} onRemove={onRemoveApp} />
        </div>
      )}
    </div>
  );

  const renderApiScope = () => (
    <div className="formItem">
      <div className="label required">{_l('接口范围')}</div>
      <ApiScopeList
        scopes={SCOPE_LIST}
        showCheckbox
        codes={formData.scopeCodes}
        onChange={scopeCodes => setFormData({ scopeCodes })}
      />
    </div>
  );

  const footer = (
    <div className="drawerFooter">
      <Button type="link" onClick={onClose}>
        {_l('取消')}
      </Button>
      <Button type="primary" disabled={submitLoading || detailLoading} onClick={onOk}>
        {submitLoading ? _l('保存中...') : _l('确认')}
      </Button>
    </div>
  );

  return (
    <Drawer
      visible={visible}
      width={600}
      title={_l('个人访问令牌')}
      className="personalAccessTokenDrawer"
      onClose={onClose}
      placement="right"
      destroyOnClose={true}
      closeIcon={<i className="icon-close Font18" />}
      footer={footer}
    >
      {detailLoading ? (
        <div className="h100 flexRow alignItemsCenter justifyContentCenter">
          <LoadDiv />
        </div>
      ) : (
        <div className="dialogContent">
          {renderName()}
          {renderValidity()}
          {renderProject()}
          {renderAppScope()}
          {renderApiScope()}
        </div>
      )}
    </Drawer>
  );
}

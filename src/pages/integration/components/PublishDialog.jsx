import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Dialog, Icon, LoadDiv, Radio, Switch } from 'ming-ui';
import FunctionWrap from 'ming-ui/components/FunctionWrap';
import packageVersionAjax from 'src/pages/workflow/api/packageVersion';
import { hrefReg } from 'src/pages/customPage/components/previewContent/index.jsx';
import { WrapFooter } from '../apiIntegration/style';
import APITable from './APITable';

// 表单字段配置
const FORM_FIELDS = [
  { key: 'name', txt: _l('连接名称'), required: true },
  { key: 'explain', txt: _l('说明'), required: true },
  { key: 'company', txt: _l('API 服务厂商'), required: true },
  { key: 'docUrl', txt: _l('官网地址'), required: true },
  { key: 'identity', txt: _l('连接模板作者') },
  { key: 'allowEdit', txt: _l('是否允许编辑'), required: true },
];

// 默认表单数据
const getDefaultInfo = () => ({
  name: '',
  explain: '',
  accountId: md.global.Account.accountId,
  companyId: '',
  allowEdit: false, //是否允许编辑暂定allowEdit
});

const WrapHeader = styled.div`
  .publishInfo {
    height: 72px;
    background: var(--color-background-secondary);
    border: 1px solid var(--color-border-primary);
    border-radius: 6px;
    line-height: 72px;
    padding: 0 20px;
  }
`;

const Wrap = styled.div`
  p {
    margin: 0;
  }
  .desCon .title {
    width: 116px;
    line-height: 36px;
  }
  .desCon input {
    width: 100%;
    height: 36px;
    line-height: 36px;
    padding: 0 12px;
    background: var(--color-background-primary);
    border: 1px solid var(--color-border-primary);
    border-radius: 3px;
  }
  .warnCon {
    padding: 5px 10px;
    color: var(--color-warning);
    background: rgba(243, 180, 84, 0.1);
    border-radius: 3px;
  }
`;

function PublishDialog(props) {
  const { onCancel = () => {}, hasManageAuth, currentProjectId: propsCurrentProjectId, id } = props;
  const currentProjectId = propsCurrentProjectId || localStorage.getItem('currentProjectId');

  const [state, setState] = useSetState({
    connectInfo: null,
    info: getDefaultInfo(),
    list: [],
    selectedList: [],
    isCheckAll: true,
    status: null,
    loadingList: true,
    loadingDetail: true,
  });

  const { info, selectedList, list, isCheckAll, connectInfo, status, loadingList, loadingDetail } = state;

  useEffect(() => {
    fetchApiList();
    fetchDetail();
  }, []);

  // 表单是否可提交
  const canSubmit = () =>
    selectedList.length > 0 &&
    (info.docUrl || '').trim() &&
    (info.explain || '').trim() &&
    (info.name || '').trim() &&
    (info.company || '').trim();

  // 获取 API 列表
  const fetchApiList = () => {
    packageVersionAjax
      .getApiList(
        { companyId: currentProjectId, pageIndex: 1, pageSize: 100000, keyword: '', relationId: id },
        { isIntegration: true },
      )
      .then(res => {
        const enabledList = res.filter(o => o.enabled);
        setState({
          list: enabledList,
          selectedList: enabledList.map(o => o.id),
          loadingList: false,
        });
      });
  };

  // 获取详情
  const fetchDetail = () => {
    packageVersionAjax
      .getDetail({ isPublic: true, id }, { isIntegration: true })
      .then(res => {
        if (!hasManageAuth && !res.isOwner) {
          handleNoPermission();
          return;
        }

        const detailInfo = res.info || {
          name: _.get(res, 'name'),
          explain: _.get(res, 'explain'),
          accountId: md.global.Account.accountId,
          companyId: '',
        };
        setState({
          connectInfo: res,
          info: { ...detailInfo, allowEdit: _.get(res, 'info.allowEdit', false) },
          status: res.status,
          loadingDetail: false,
        });
      })
      .catch(() => handleNoPermission());
  };

  const handleNoPermission = () => {
    alert({
      msg: _l('你暂时没有权限查看该连接！'),
      type: 2,
      duration: 2000,
      onClose: () => {
        location.href = '/integration';
      },
    });
  };

  // 提交上架
  const handleSubmit = () => {
    if (!canSubmit() || status === 2) return;
    if (!hrefReg.test(info.docUrl || '')) {
      return alert(_l('请填入正确的官网地址'), 2);
    }

    const params = {
      apis: selectedList,
      accountId: info.accountId,
      companyId: info.companyId,
      docUrl: (info.docUrl || '').trim(),
      explain: (info.explain || '').trim(),
      name: (info.name || '').trim(),
      company: (info.company || '').trim(),
      allowEdit: info.allowEdit,
    };
    packageVersionAjax
      .upper({ ...params, id, companyId: currentProjectId || info.companyId }, { isIntegration: true })
      .then(res => {
        if (res) {
          onCancel();
          alert(_l('已申请上架，请等待审核'));
        } else {
          alert(_l('申请失败，请稍后再试'), 2);
        }
      });
  };

  const updateInfo = updates => setState({ info: { ...info, ...updates } });

  const renderFormField = field => {
    if (field.key === 'allowEdit') {
      return <Switch checked={!!info[field.key]} onClick={() => updateInfo({ [field.key]: !info[field.key] })} />;
    }

    if (field.key === 'identity') {
      const displayName = info.accountId
        ? md.global.Account.fullname
        : md.global.Account.projects.find(o => o.projectId === currentProjectId)?.companyName || '';
      return (
        <div>
          <div className="mTop12">
            <Radio
              text={_l('以企业组织身份')}
              checked={!!info.companyId}
              disabled={!hasManageAuth}
              onClick={() => hasManageAuth && updateInfo({ companyId: currentProjectId, accountId: '' })}
            />
            <Radio
              text={_l('以个人身份')}
              checked={!!info.accountId}
              onClick={() => updateInfo({ accountId: md.global.Account.accountId, companyId: '' })}
            />
          </div>
          <input type="text" className="mTop20" value={displayName} readOnly placeholder={_l('请输入')} />
        </div>
      );
    }

    const maxLength = ['name', 'company'].includes(field.key) ? 20 : field.key === 'explain' ? 600 : 200;
    return (
      <input
        type="text"
        value={info[field.key] || ''}
        placeholder={_l('请输入')}
        maxLength={maxLength}
        onChange={e => updateInfo({ [field.key]: e.target.value })}
        onBlur={e => updateInfo({ [field.key]: e.target.value.trim() })}
      />
    );
  };

  const isLoading = loadingDetail || loadingList;
  const isPublished = [2, 3].includes(status);
  const submitBtnText =
    status === 2 ? _l('已申请，请等待审核') : status === 3 || status ? _l('申请上架新版本') : _l('申请上架');

  return (
    <Dialog
      width="660"
      oneScreen
      oneScreenGap={240}
      visible
      title={<span className="Font17 Bold">{_l('申请上架到API 库')}</span>}
      footer={
        <WrapFooter className="flexRow textSecondary TxtLeft mTop24">
          <span className="flex">{_l('共 %0 个API，已选择 %1 个', list.length, selectedList.length)}</span>
          <span className="cancel Hand Font14" onClick={onCancel}>
            {_l('取消')}
          </span>
          <div
            className={cx('btn Bold Font14', { disable: status === 2 || !canSubmit() })}
            onClick={e => {
              e.stopPropagation();
              handleSubmit();
            }}
          >
            {submitBtnText}
          </div>
        </WrapFooter>
      }
      onCancel={onCancel}
    >
      {isLoading ? (
        <LoadDiv />
      ) : (
        <Wrap className="flexColumn">
          <WrapHeader>
            {isPublished && (
              <div className="publishInfo flexRow">
                <span className="textSecondary flex">
                  {_l('上架 API 量')} <span className="Bold textPrimary Font20">{info.apiCount}</span>
                </span>
                <span className="textSecondary flex">
                  {_l('安装量')} <span className="Bold textPrimary Font20">{info.installCount}</span>
                </span>
                <span className="flex Green">
                  {_l('上架时间')}：{info.time}
                </span>
              </div>
            )}
          </WrapHeader>

          {connectInfo?.hasAuth && !info.allowEdit && (
            <div className="warnCon flexRow alignItemsCenter mTop10">
              <Icon type="info" className="Font16 mRight5" />
              {_l('注意：该类型连接上架后，用户需要授权使用，共用一套API配置，且只能查看自己使用的数据')}
            </div>
          )}

          <div className="desCon">
            {FORM_FIELDS.map(field => (
              <div key={field.key} className={cx('flexRow mTop10', { alignItemsCenter: field.key === 'allowEdit' })}>
                <div className="title">
                  {field.txt} {field.required && <span className="Red">*</span>}
                </div>
                <div className="flex">{renderFormField(field)}</div>
              </div>
            ))}
          </div>

          <p className="Bold mTop24">{_l('请选择要上架的 API')}</p>
          <div className="table flex">
            <APITable
              list={list}
              count={list.length}
              selectedList={selectedList}
              onChange={selectedList => setState({ selectedList, isCheckAll: selectedList.length >= list.length })}
              isCheckAll={isCheckAll}
              onCheck={checked => setState({ selectedList: checked ? list.map(o => o.id) : [], isCheckAll: checked })}
            />
          </div>
        </Wrap>
      )}
    </Dialog>
  );
}

export default props => FunctionWrap(PublishDialog, { ...props });

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import _ from 'lodash';
import apiKeyAjax from 'src/pages/Admin/api/cloudApi/apiKey';
import { checkCertification } from 'src/components/checkCertification';
import { getCurrentProject } from 'src/utils/project';
import Config from '../../config';
import CreateKeyDialog from './CreateKeyDialog';
import KeyListTable from './KeyListTable';
import SuccessDialog from './SuccessDialog';
import WhiteListDialog from './WhiteListDialog';
import './index.less';

const DEFAULT_PAGE_SIZE = 50;

function CloudService({ match }) {
  const projectId = _.get(match, 'params.projectId');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [description, setDescription] = useState('');
  const [createVisible, setCreateVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [whiteListVisible, setWhiteListVisible] = useState(false);
  const [currentWhiteListId, setCurrentWhiteListId] = useState('');
  const [currentEditKey, setCurrentEditKey] = useState({});
  const [createdSecretInfo, setCreatedSecretInfo] = useState({ description: '', rawKey: '' });

  const listRequestIdRef = useRef(0);
  const isFree = _.get(getCurrentProject(projectId), 'licenseType') === 0;

  const debouncedSearch = useMemo(
    () =>
      _.debounce(value => {
        const trimmed = _.trim(value);
        setDescription(trimmed);
        if (!trimmed && value !== '') {
          setSearchInput('');
        }
      }, 500),
    [],
  );

  useEffect(() => () => debouncedSearch.cancel(), [debouncedSearch]);

  useLayoutEffect(() => {
    debouncedSearch.cancel();
    setSearchInput('');
    setDescription('');
  }, [projectId, debouncedSearch]);

  const fetchList = useCallback(
    (page = 1) => {
      listRequestIdRef.current += 1;
      const requestId = listRequestIdRef.current;
      setLoading(true);
      const payload = {
        projectId,
        page,
        pageSize: DEFAULT_PAGE_SIZE,
      };

      if (description) {
        payload.description = description;
      }

      apiKeyAjax
        .keysList(payload)
        .then(res => {
          if (requestId !== listRequestIdRef.current) {
            return;
          }

          const items = (res.items || []).map(item => ({
            id: item.apiKeyId,
            description: item.description,
            maskedKey: item.maskedKey,
            permission: item.permission,
            status: item.status,
            ipWhitelist: item.ipWhitelist,
            creater: item.creater || {},
            createTime: item.createTime,
            updateTime: item.updateTime,
            totalConsumedAmount: item.totalConsumedAmount,
          }));
          setList(items);
          setTotal(res.total || 0);
          setPageIndex(page);
        })
        .finally(() => {
          if (requestId === listRequestIdRef.current) {
            setLoading(false);
          }
        });
    },
    [projectId, description],
  );

  useEffect(() => {
    Config.setPageTitle(_l('组织 - 云服务'));
  }, []);

  useEffect(() => {
    if (projectId) {
      fetchList(1);
    }
  }, [projectId, description, fetchList]);

  const handleSearchChange = useCallback(
    value => {
      setSearchInput(value);
      debouncedSearch(value);
    },
    [debouncedSearch],
  );

  const handleSearchClear = useCallback(() => {
    debouncedSearch.cancel();
    setSearchInput('');
    setDescription('');
  }, [debouncedSearch]);

  const handleOpenWhiteList = item => {
    setCurrentWhiteListId(item.id);
    setWhiteListVisible(true);
  };

  const handleOpenEdit = item => {
    setCurrentEditKey(item);
    setEditVisible(true);
  };

  const handleCreate = () => {
    if (!isFree) {
      setCreateVisible(true);
      return;
    }

    // 免费版创建云服务密钥前，需要先完成组织企业认证。
    checkCertification({
      projectId,
      authType: 2,
      checkSuccess: () => setCreateVisible(true),
    });
  };

  return (
    <div className="orgManagementWrap cloudServiceWrap">
      <div className="orgManagementHeader">{_l('云服务')}</div>
      <div className="orgManagementContent cloudServiceContent">
        <div className="serviceTip">
          {_l(
            '云服务用于调用明道云提供的在线服务能力（如 AI 模型服务）。创建云服务密钥后，可在接口调用中使用该密钥进行身份校验，便于统一管理授权与调用记录。为了增强安全性，API 密钥采用加密存储；创建后的密钥将不再以明文形式展示。请在创建时及时复制您的密钥，之后无法重新查看。',
          )}
        </div>
        <KeyListTable
          list={list}
          loading={loading}
          total={total}
          pageIndex={pageIndex}
          pageSize={DEFAULT_PAGE_SIZE}
          searchInput={searchInput}
          onSearchChange={handleSearchChange}
          onSearchClear={handleSearchClear}
          onFetchList={fetchList}
          onOpenWhiteList={handleOpenWhiteList}
          onOpenEdit={handleOpenEdit}
          onCreate={handleCreate}
        />
      </div>

      <CreateKeyDialog
        visible={createVisible}
        projectId={projectId}
        onSuccess={info => {
          setCreatedSecretInfo(info);
          setCreateVisible(false);
          setSuccessVisible(true);
          fetchList(1);
        }}
        onCancel={() => setCreateVisible(false)}
      />

      <CreateKeyDialog
        visible={editVisible}
        mode="edit"
        data={currentEditKey}
        projectId={projectId}
        onSuccess={() => {
          setEditVisible(false);
          setCurrentEditKey({});
          fetchList(pageIndex);
        }}
        onCancel={() => {
          setEditVisible(false);
          setCurrentEditKey({});
        }}
      />

      <SuccessDialog
        visible={successVisible}
        secretInfo={createdSecretInfo}
        onClose={() => {
          setSuccessVisible(false);
          setCreatedSecretInfo({ description: '', rawKey: '' });
        }}
      />

      <WhiteListDialog
        visible={whiteListVisible}
        apiKeyId={currentWhiteListId}
        onSave={() => fetchList(pageIndex)}
        onCancel={() => {
          setWhiteListVisible(false);
          setCurrentWhiteListId('');
        }}
      />
    </div>
  );
}

export default CloudService;

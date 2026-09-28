import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import styled from 'styled-components';
import { LoadDiv } from 'ming-ui';
import { Checkbox, Modal } from 'ming-ui/antd-components';
import useFunctionWrapComponent from 'ming-ui/hooks/useFunctionWrapComponent';
import AppManagement from 'src/pages/workflow/api/ApiManagement.js';
import PackageVersionAjax from 'src/pages/workflow/api/packageVersion';
import APITable from 'src/pages/integration/components/APITable.jsx';

const EXPORT_MODAL_STYLES = { body: { overflowY: 'auto' } };

const Wrap = styled.div`
  .exportBottomOption {
    display: flex;
    align-items: center;
    justify-content: end;
    .flexCenter {
      display: flex;
      align-items: center;
    }
    .importBtn {
      width: 107px;
      height: 36px;
      border-radius: 2px;
    }
  }
`;

function ExportDialog(props) {
  const { projectId, info, onClose = () => {} } = props;
  const [{ selectedList, list, isCheckAll, loading, notCheck }, setState] = useSetState({
    list: [],
    selectedList: [],
    isCheckAll: true,
    loading: true,
    notCheck: false,
  });

  useEffect(() => {
    getList();
  }, []);

  // 获取api列表
  const getList = () => {
    const param = {
      companyId: projectId,
      pageIndex: 1,
      pageSize: 100000, //PageSize, API列表不分页、全部加载、排序按排序号+创建时间升序
      keyword: '',
      relationId: info.id,
    };
    PackageVersionAjax.getApiList(param, { isIntegration: true }).then(res => {
      let list = res || [];
      setState({
        loading: false,
        list,
        selectedList: list.map(o => o.id),
      });
    });
  };

  const keys = [
    {
      key: 'checkCon',
      render: (item, selectedList, handleSelect, isCheckAll, notCheck) => {
        const disabled = notCheck && !item.enabled;
        return (
          <Checkbox
            className="mLeft5"
            disabled={disabled}
            checked={(selectedList.includes(item.id) || isCheckAll) && !disabled}
            size="small"
          />
        );
      },
    },
    {
      key: 'name',
      name: _l('API 名称'),
    },
    {
      key: 'explain',
      name: _l('描述'),
      render: item => {
        return (
          <span className="" title={item.explain}>
            {item.explain}
          </span>
        );
      },
    },
    {
      key: 'enabled',
      name: _l('状态'),
      render: item => {
        const { enabled } = item;
        return <span className={cx(enabled ? 'Green' : 'textSecondary')}>{enabled ? _l('开启') : _l('关闭')}</span>;
      },
    },
  ];

  // 导出
  const exportConnect = () => {
    if (selectedList.length <= 0) return;
    AppManagement.export(
      {
        apiIds: selectedList,
        projectId,
        id: info.id,
      },
      { isIntegration: true },
    ).then(() => {
      onClose();
    });
  };

  return (
    <Modal
      title={_l('导出连接')}
      open
      type="fixed"
      mask={{ closable: false }}
      keyboard
      styles={EXPORT_MODAL_STYLES}
      footer={loading ? null : undefined}
      footerLeftElement={
        loading ? null : (
          <Checkbox
            key="notCheck"
            checked={notCheck}
            onChange={() => {
              const param = { notCheck: !notCheck };

              if (!notCheck) {
                param.selectedList = selectedList.filter(
                  id =>
                    !list
                      .filter(item => !item.enabled)
                      .map(item => item.id)
                      .includes(id),
                );
                param.isCheckAll = false;
              }

              setState(param);
            }}
          >
            {_l('不导出关闭中的 API')}
          </Checkbox>
        )
      }
      okText={_l('立即导出')}
      okDisabled={!selectedList.length}
      onOk={exportConnect}
      width={640}
      onCancel={() => onClose()}
    >
      {loading ? (
        <LoadDiv />
      ) : (
        <Wrap className="flexColumn">
          <div className="mBottom24">
            <span className="textSecondary">
              {_l('将API配置导出为文件，之后可以将此文件导入其他组织以实现 API 迁移或升级')}
            </span>
          </div>
          <div className="title">
            <h5 className="Font20 Bold InlineBlock">{info.name}</h5>
            <span className="mLeft10">{`(${selectedList.length}/${list.length})`}</span>
          </div>
          <APITable
            list={list}
            count={list.length}
            selectedList={selectedList}
            notCheck={notCheck}
            onChange={data => {
              const selectedList = data.filter(o => (notCheck ? list.find(it => it.id === o).enabled : true));
              setState({
                selectedList,
                isCheckAll: data.length >= list.length,
              });
            }}
            keys={keys}
            isCheckAll={isCheckAll}
            onCheck={checked => {
              setState({
                selectedList: checked ? list.filter(o => (notCheck ? o.enabled : true)).map(o => o.id) : [],
                isCheckAll: checked,
              });
            }}
          />
        </Wrap>
      )}
    </Modal>
  );
}

export function useExportDialog() {
  return useFunctionWrapComponent(ExportDialog);
}

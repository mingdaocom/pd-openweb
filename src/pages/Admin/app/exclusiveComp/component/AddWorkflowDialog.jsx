import React, { useEffect, useState, Fragment, useCallback, useRef } from 'react';
import { useSetState } from 'react-use';
import styled from 'styled-components';
import { Select, Input } from 'antd';
import { Dialog, Icon, Checkbox, LoadDiv, ScrollView, Button, Tooltip, SvgIcon } from 'ming-ui';
import _ from 'lodash';
import Search from 'src/pages/workflow/components/Search';
import appManagement from 'src/api/appManagement';
import resourceApi from 'src/pages/workflow/api/resource';
import processVersion from 'src/pages/workflow/api/processVersion';
import { START_APP_TYPE } from 'src/pages/workflow/WorkflowList/utils';
import projectAjax from 'src/api/project';
import IsAppAdmin from '../../../components/IsAppAdmin';
import { navigateTo } from 'src/router/navigateTo';

const TYPE_LIST = [
  { label: _l('工作表事件'), value: 1 },
  { label: _l('时间'), value: 2 },
  { label: _l('人员事件'), value: 9 },
  { label: _l('Webhook'), value: 6 },
  { label: _l('子流程'), value: 8 },
  { label: _l('自定义动作'), value: 7 },
  { label: _l('审批流程'), value: 11 },
  { label: _l('封装业务流程'), value: 10 },
];

const AddWorkflowDialogContentWrap = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  .Grey_21 {
    color: #212121;
  }
  .selectItem {
    width: 100%;
    height: 48px;
    font-size: 13px !important;
    .ant-select-arrow {
      right: 16px !important;
    }
    .ant-select-selector {
      height: 48px !important;
      border-radius: 53px !important;
      box-shadow: none !important;
      .ant-select-selection-item {
        line-height: 48px !important;
        padding-left: 13px !important;
      }
      .ant-select-selection-placeholder {
        line-height: 48px !important;
        padding-left: 13px !important;
      }
    }
  }
  .filterWrap {
    .label {
      margin-right: 4px;
    }
    .filterItem {
      width: 160px;
      margin-right: 20px;
      .ant-select-selector {
        height: 36px;
        line-height: 36px;
      }
      .ant-select-selection-item {
        line-height: 36px;
      }
      input {
        height: 36px !important;
      }
    }
  }
  .headerCon {
    border-color: #ddd;
    color: #757575;
  }
  .workflowListWrap .listItem,
  .headerCon.listItem {
    padding: 12px 24px;
    border-bottom: 1px solid #eaeaea;
    display: flex;
    align-items: center;
    color: #aaa;
    .Checkbox-box {
      margin-right: 12px;
    }
    .columnType,
    .columnStatus {
      width: 150px;
    }
  }
  .workflowListWrap .listItem .columnName {
    display: flex;
    align-items: center;
    color: #212121;
    .workflowInfoWrap {
      align-items: center;
      width: 100%;
      .iconWrap {
        width: 36px;
        height: 36px;
        display: flex;
        justify-content: center;
        align-items: center;
        .icon {
          color: #fff;
          font-size: 24px;
        }
      }
    }
  }
`;

const SelectAppOption = styled.div`
  display: flex;
  align-items: center;
  .imgCon {
    width: 20px;
    height: 20px;
    display: inline-block;
    border-radius: 3px;
    margin-right: 8px;
    text-align: center;
    svg {
      margin-top: 2px;
    }
  }
`;

const DropDownInputWrap = styled.div`
  margin-left: 10px;
  margin-right: 10px;
  .searchApp {
    border: none;
    border-bottom: 1px solid #f0f0f0 !important;
    box-shadow: none;
    padding-left: 3px;
    padding-right: 3px;
  }
`;

const EmptyWrap = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  text-align: center;
  width: 100%;
  .iconCon {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: #f5f5f5;
    display: inline-block;
    line-height: 100px;
    color: #c2c3c3;
  }
`;

const CheckedWorkflowWrap = styled.div`
  height: 100%;
  .headerCon {
    border-color: #ddd;
    color: #757575;
  }
  .workflowListWrap .listItem,
  .headerCon.listItem {
    padding: 12px 24px;
    border-bottom: 1px solid #eaeaea;
    display: flex;
    align-items: center;
    color: #aaa;
    .Checkbox-box {
      margin-right: 12px;
    }
    .columnType,
    .columnStatus {
      width: 150px;
    }
  }
  .workflowListWrap .listItem .columnName {
    display: flex;
    align-items: center;
    .workflowInfoWrap {
      width: 100%;
    }
    .iconWrap {
      align-items: center;
      border-radius: 5px;
      display: flex;
      height: 36px;
      justify-content: center;
      width: 36px;
      .icon {
        color: #fff;
        font-size: 24px;
      }
    }
  }
`;

const enabledList = [
  { label: _l('全部状态'), value: 0 },
  { label: _l('开启'), value: true },
  { label: _l('关闭'), value: false },
];

const renderEmpty = appId => {
  return (
    <EmptyWrap>
      <span className="iconCon icon-department Font48"></span>
      <div className="mTop12 Gray_9e">{appId ? _l('暂无工作流') : _l('请选择应用')}</div>
    </EmptyWrap>
  );
};

function AddWorkflowDialog(props) {
  const { visible = false, onOk, onCancel, projectId, resourceId } = props;

  const [value, setValue] = useState([]);
  const [searchApp, setSearchApp] = useState('');
  const [appId, setAppId] = useState(undefined);
  const [workflowList, setWorkflowList] = useState([]);
  const [filters, setFilters] = useState({
    workflowType: 1, // 类型
    enabled: 0, //状态
    search: '',
  });
  const [loading, setLoading] = useState(false);
  const [checkedDialog, setCheckedDialog] = useState({
    visible: false,
    list: [],
    checked: [],
  });

  const [{ appList, appLoading, appIndex, total }, setApp] = useSetState({
    appList: [],
    appLoading: false,
    appIndex: 1,
    total: 0,
  });

  const searchRef = useRef();

  useEffect(() => {
    visible && getAppList();
  }, [visible]);

  useEffect(() => {
    visible && getWorkflow();
  }, [appId, filters.workflowType]);

  useEffect(() => {
    if (checkedDialog.list.length === 0) return;
  }, [checkedDialog.list]);

  const getAppList = (pageIndex, keywords) => {
    const _pageIndex = pageIndex || appIndex;

    if (_pageIndex > 1 && appList.length >= total || appLoading) return;

    setApp({ appLoading: true });
    const searchText = keywords !== undefined ? keywords : searchApp;

    appManagement
      .getAppsForProject({
        projectId,
        status: '',
        order: 3,
        pageIndex: _pageIndex,
        pageSize: 100,
        keyword: searchText,
      })
      .then(({ apps, total }) => {
        setApp({
          appList: _pageIndex > 1 ? appList.concat(apps) : apps,
          appLoading: false,
          appIndex: _pageIndex + 1,
          total,
        });
      });
  };

  const getWorkflow = () => {
    if (!appId) return;
    setLoading(true);

    processVersion
      .list({
        relationId: appId,
        processListType: filters.workflowType,
      })
      .then(res => {
        setLoading(false);
        let data = [];
        res.map(item => {
          data = data.concat(item.processList);
        });
        setWorkflowList(data);
      });
  };

  const init = () => {
    setAppId(undefined);
    setValue([]);
    setSearchApp('');
    setWorkflowList([]);
    setFilters({
      workflowType: 1,
      enabled: 0,
      servies: '',
      search: '',
    });
    setCheckedDialog({
      visible: false,
      list: [],
      checked: [],
    });
  };

  const addWorkflow = ids => {
    resourceApi
      .addProcess({
        apkId: appId,
        companyId: projectId,
        processIds: ids,
        resourceId: resourceId,
      })
      .then(res => {
        if (res.length === 0) {
          alert(_l('添加成功'));
          onOk();
          init();
        } else {
          projectAjax
            .getComputingInstances({ projectId, resourceIds: res.map(l => l.resourceId) })
            .then(resourceRes => {
              setCheckedDialog({
                visible: true,
                list: res.map(item => {
                  let _name = (resourceRes.find(l => l.resourceId === item.resourceId) || {}).name;
                  return {
                    ...item,
                    name: _name,
                  };
                }),
                checked: res.map(l => l.id),
              });
            });
        }
      });
  };

  const moveWorkflow = () => {
    if (checkedDialog.checked.length === 0) return;

    let list = checkedDialog.list.filter(l => checkedDialog.checked.includes(l.id));
    let listResourceIds = _.uniq(list.map(l => l.resourceId));

    let promiseList = Promise.all(
      listResourceIds.map(item => {
        return resourceApi.moveProcess({
          moveToResourceId: resourceId,
          processIds: list.filter(l => l.resourceId === item).map(l => l.id),
          resourceId: item,
          companyId: projectId,
        });
      }),
    );
    promiseList.then(res => {
      alert(_l('移动成功'));
      init();
      onOk();
    });
  };

  const renderList = list => {
    if (!list || list.length === 0) return null;

    return (
      <ScrollView className="flex">
        {list.map(item => {
          return (
            <div className="listItem" key={`addWorkflowList-${item.id}`}>
              <div className="columnCheckbox">
                <Checkbox
                  value={item.id}
                  text={null}
                  checked={value.includes(item.id)}
                  onClick={(checkd, id) => {
                    let _value = checkd ? value.filter(l => l !== id) : value.concat(id);
                    setValue(_value);
                  }}
                />
              </div>
              <div className="columnName flex">
                <IsAppAdmin
                  className="alignItemsCenter workflowInfoWrap"
                  appId={item.relationId}
                  appName={item.name}
                  defaultIcon={(START_APP_TYPE[item.child ? 'subprocess' : item.startAppType] || {}).iconName}
                  iconColor={(START_APP_TYPE[item.child ? 'subprocess' : item.startAppType] || {}).iconColor}
                  createType={2}
                  ckeckSuccessCb={() => {
                    navigateTo(`/workflowedit/${item.id}`);
                  }}
                />
              </div>
              <div className="columnType">
                {(START_APP_TYPE[item.child ? 'subprocess' : item.startAppType] || {}).text}
              </div>
              <div
                className="columnStatus"
                style={{
                  color: item.enabled ? '#00C985' : '#aaa',
                }}
              >
                {item.enabled ? _l('开启') : _l('关闭')}
              </div>
            </div>
          );
        })}
        {loading && <LoadDiv className="mTop15" size="small" />}
      </ScrollView>
    );
  };

  const renderCheckedList = list => {
    if (!list || list.length === 0) return null;

    return (
      <ScrollView className="flex workflowListWrap">
        {list.map(item => {
          return (
            <div className="listItem" key={`checkedWorkflowList-${item.id}`}>
              <div className="columnCheckbox">
                <Checkbox
                  value={item.id}
                  text={null}
                  checked={checkedDialog.checked.includes(item.id)}
                  onClick={(checkd, id) => {
                    let _value = checkd
                      ? checkedDialog.checked.filter(l => l !== id)
                      : checkedDialog.checked.concat(id);
                    setCheckedDialog({
                      ...checkedDialog,
                      checked: _value,
                    });
                  }}
                />
              </div>
              <div className="columnName flex">
                <IsAppAdmin
                  className="alignItemsCenter workflowInfoWrap"
                  appId={item.app.id}
                  appName={item.process.name}
                  defaultIcon={
                    (START_APP_TYPE[item.process.child ? 'subprocess' : item.process.startAppType] || {}).iconName
                  }
                  iconColor={
                    (START_APP_TYPE[item.process.child ? 'subprocess' : item.process.startAppType] || {}).iconColor
                  }
                  createType={2}
                />
              </div>
              <div className="columnType">
                {(START_APP_TYPE[item.process.child ? 'subprocess' : item.process.startAppType] || {}).text}
              </div>
              <div className="columnStatus Gray">{item.name}</div>
            </div>
          );
        })}
      </ScrollView>
    );
  };

  const onSearch = _.debounce(() => {
    const keywords = searchRef.current.input.value || '';
    setSearchApp(keywords);
    getAppList(1, keywords);
  }, 500);

  return (
    <Fragment>
      <Dialog
        type="fixed"
        className="addWorkflowDialog"
        dialogClasses="addWorkflowDialogContainer"
        visible={visible}
        width={1000}
        title={
          <span className="Font17 bold">
            {_l('添加工作流')}
            <Tooltip text={_l('工作流中引用的子流程、封装业务流程，会在工作流所在的专属算力资源上运行。')}>
              <span className="mLeft8 Font17 Gray_bd icon-info_outline"></span>
            </Tooltip>
          </span>
        }
        okText={value.length === 0 ? _l('添加') : _l('添加(%0)', value.length)}
        onOk={() => {
          let _value = value;
          if (_value.length === 0) {
            alert(_l('未选择工作流'), 3);
            return;
          }
          addWorkflow(_value);
        }}
        onCancel={() => {
          init();
          onCancel();
        }}
      >
        <AddWorkflowDialogContentWrap>
          <div className="mTop8 bold Grey_21">{_l('选择应用')}</div>
          <Select
            className="selectItem mTop16 mBottom32"
            size="large"
            placeholder={_l('选择应用')}
            notFoundContent={appLoading ? null : <span className="Gray_9e">{_l('无搜索结果')}</span>}
            loading={appLoading}
            onChange={value => {
              setAppId(value);
            }}
            onFocus={() => {
              const input = document.getElementById('selectSearchApp');
              input.focus();
            }}
            dropdownRender={menu => (
              <Fragment>
                <DropDownInputWrap>
                  <Input
                    id="selectSearchApp"
                    className="searchApp"
                    size="large"
                    prefix={<Icon icon="search" className="Gray_bd" />}
                    placeholder={_l('搜索应用名称')}
                    ref={searchRef}
                    onChange={onSearch}
                  />
                </DropDownInputWrap>
                {menu}
                {appLoading && <LoadDiv />}
              </Fragment>
            )}
            onPopupScroll={e => {
              const { scrollTop, offsetHeight, scrollHeight } = e.target;

              if (scrollTop + offsetHeight === scrollHeight) {
                getAppList();
              }
            }}
          >
            {appList
              .filter(l => l.appName.toLowerCase().indexOf(searchApp ? searchApp.toLowerCase() : '') > -1)
              .map(item => {
                return (
                  <Select.Option value={item.appId}>
                    <SelectAppOption>
                      <span className="imgCon" style={{ background: item.iconColor }}>
                        <SvgIcon url={item.iconUrl} fill="#FFF" size={16} />
                      </span>
                      {item.appName}
                    </SelectAppOption>
                  </Select.Option>
                );
              })}
          </Select>
          {appId && (
            <Fragment>
              <div className="valignWrapper filterWrap">
                <span className="label">{_l('类型')}</span>
                <Select
                  className="filterItem"
                  defaultValue={filters.workflowType}
                  options={TYPE_LIST}
                  suffixIcon={<Icon icon="arrow-down-border Font14" />}
                  onChange={value =>
                    setFilters({
                      ...filters,
                      workflowType: value,
                    })
                  }
                />
                <span className="label">{_l('状态')}</span>
                <Select
                  className="filterItem"
                  defaultValue={filters.enabled}
                  options={enabledList}
                  suffixIcon={<Icon icon="arrow-down-border Font14" />}
                  onChange={value =>
                    setFilters({
                      ...filters,
                      enabled: value,
                    })
                  }
                />
                <div className="flex" />
                <Search
                  placeholder={_l('工作流名称')}
                  handleChange={keyWords => setFilters({ ...filters, search: keyWords })}
                />
              </div>
            </Fragment>
          )}
          {appId && (
            <div className="headerCon listItem mTop8">
              <div className="columnCheckbox">
                <Checkbox
                  value={undefined}
                  text={null}
                  onClick={(checkd, value) => {
                    let ids = [];
                    if (checkd) {
                      ids = workflowList
                        .filter(
                          l =>
                            (filters.enabled === 0 || l.enabled === filters.enabled) && l.name.includes(filters.search),
                        )
                        .map(l => l.id);
                    }
                    setValue(ids);
                  }}
                />
              </div>
              <div className="columnName flex">{_l('工流程名称')}</div>
              <div className="columnType">{_l('类型')}</div>
              <div className="columnStatus">{_l('状态')}</div>
            </div>
          )}
          <div className="flex relative workflowListWrap">
            {workflowList.length === 0
              ? renderEmpty(appId)
              : renderList(
                  workflowList.filter(
                    l => (filters.enabled === 0 || l.enabled === filters.enabled) && l.name.includes(filters.search),
                  ),
                )}
          </div>
        </AddWorkflowDialogContentWrap>
      </Dialog>
      <Dialog
        className="checkedWorkflowDialog"
        dialogClasses="addWorkflowDialogContainer"
        visible={checkedDialog.visible}
        width={740}
        title={<span className="Font17 bold">{_l('检测到工作流已存在其他专属算力中，是否移动？')}</span>}
        footer={
          <div>
            <Button type="ghostgray" onClick={moveWorkflow}>
              {`${_l('移动')}(${checkedDialog.checked.length})`}
            </Button>
            <Button
              onClick={() => {
                init();
                onOk();
              }}
            >
              {_l('不移动')}
            </Button>
          </div>
        }
        onOk={() => {}}
        onCancel={() => {
          init();
          onOk();
        }}
      >
        <CheckedWorkflowWrap>
          <div className="headerCon listItem mTop8">
            <div className="columnCheckbox">
              <Checkbox
                checked={
                  checkedDialog.checked.length !== 0 && checkedDialog.list.length === checkedDialog.checked.length
                }
                text={null}
                value={checkedDialog.list.map(l => l.id)}
                onClick={(checkd, value) => {
                  setCheckedDialog({
                    ...checkedDialog,
                    checked: value,
                  });
                }}
              />
            </div>
            <div className="columnName flex">{_l('工流程名称')}</div>
            <div className="columnType">{_l('类型')}</div>
            <div className="columnStatus">{_l('所属算力服务')}</div>
          </div>
          {renderCheckedList(checkedDialog.list)}
        </CheckedWorkflowWrap>
      </Dialog>
    </Fragment>
  );
}

export default AddWorkflowDialog;

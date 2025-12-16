import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import { Select } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Dialog, Icon, LoadDiv } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import appManagementApi from 'src/api/appManagement';
import homeAppApi from 'src/api/homeApp';
import dataSourceApi from 'src/pages/integration/api/datasource';
import dataMirrorAjax from 'src/pages/integration/api/dw.js';
import { emitter } from 'src/utils/common';
import EditDest from './EditDest';
import Tables from './Tables';

export const isValidName = name => {
  return name.indexOf('\\') < 0;
};

const Wrap = styled.div`
  .selectItem {
    .ant-select-selector {
      min-height: 36px;
      input {
        min-height: 32px;
      }
    }
    .ant-select-selection-placeholder {
      line-height: 34px !important;
    }
  }
`;

export default function CreateDialog(props) {
  const { onHide, onOk, visible, className, projectId } = props;
  const [
    {
      step,
      appList,
      fetching,
      appInfo,
      worksheetInfos,
      tableOptionList,
      dest,
      dbOptionList,
      doubleWriteTables,
      isCreating,
      schemaOptionList,
    },
    setState,
  ] = useSetState({
    step: 0,
    fetching: true,
    appList: [],
    appInfo: props.appInfo || {},
    worksheetInfos: [],
    tableOptionList: [],
    dest: {},
    dbOptionList: [],
    doubleWriteTables: [],
    isCreating: false,
    schemaOptionList: [],
  });

  // 获取应用列表
  useEffect(() => {
    if (step !== 1) {
      appManagementApi.getAppForManager({ projectId, type: 0 }).then(res => {
        if (res) {
          const optionList = res.map(item => {
            return { ...item, label: item.appName, value: item.appId };
          });
          setState({
            fetching: false,
            appList: optionList,
          });
        }
      });
    }
  }, [step]);
  // 获取工作表
  useEffect(() => {
    if (appInfo.appId && step !== 1) {
      homeAppApi.getWorksheetsByAppId({ appId: appInfo.appId, getAlias: true }).then(res => {
        if (res) {
          const tableOptionList = res
            .filter(o => o.type == 0)
            .map(item => {
              const isValidTable = isValidName(item.workSheetName);
              return {
                ...item,
                label: !isValidTable ? (
                  <React.Fragment>
                    {item.workSheetName}
                    <Tooltip title={_l('名称包含特殊字符，无法同步')}>
                      <Icon icon="info" className="Gray_bd mLeft5 pointer" />
                    </Tooltip>
                  </React.Fragment>
                ) : (
                  item.workSheetName
                ),
                value: item.workSheetId,
                workSheetName: item.workSheetName,
              };
            });
          setState({ tableOptionList });
        }
      });
    }
  }, [appInfo.appId, step]);

  useEffect(() => {
    if (dest.dataDestId && step !== 1) {
      // 获取数据源下数据库列表
      dataSourceApi.getDatabases({ projectId: props.projectId, datasourceId: dest.dataDestId }).then(res => {
        if (res) {
          const dbOptionList = res.map(item => {
            return { label: item, value: item };
          });
          setState({ dbOptionList });
        }
      });
    }
  }, [step, dest.dataDestId]);

  const getWorksheetList = () => {
    if (tableOptionList) {
      return tableOptionList.map(item => {
        const isValidTable = isValidName(item.workSheetName);
        return {
          ...item,
          disabled: !isValidTable,
        };
      });
    }
    return tableOptionList;
  };

  const onChangeDb = db => {
    setState({ dest: { ...dest, db, schemaName: '' }, schemaOptionList: [] });
    if (['POSTGRESQL', 'ALIYUN_POSTGRES', 'TENCENT_POSTGRES'].includes(dest.dsType)) {
      //获取指定数据库下schema列表
      dataSourceApi
        .getSchemas({ projectId: props.projectId, datasourceId: dest.dataDestId, dbName: dest.db })
        .then(res => {
          if (res) {
            const schemaOptionList = res.map(item => {
              return { label: item, value: item };
            });
            setState({ schemaOptionList });
          }
        });
    }
  };

  const onChangeSchema = data => {
    setState({ dest: { ...dest, schemaName: data.value } });
  };

  const onCreate = doubleWriteTables => {
    dataMirrorAjax
      .createJob({
        dataSourceId: dest.dataDestId,
        dbName: dest.db,
        doubleWriteTables: doubleWriteTables.map(o => _.pick(o, ['wsId', 'wsName', 'tableName'])),
        projectId: props.projectId,
        appId: appInfo.appId,
        appName: appInfo.sourceName,
        schemaName: dest.schemaName,
      })
      .then(res => {
        const { errorMsgList } = res;
        if (errorMsgList) {
          return alert(errorMsgList ? errorMsgList[0] : _l('创建失败'), 2);
        } else {
          setTimeout(() => {
            //3秒后关闭弹层
            onOk();
          }, 3000);
        }
      });
  };

  const renderCreate = () => {
    return (
      <React.Fragment>
        <div className="Bold mTop15">{_l('从应用')}</div>
        <Select
          className="selectItem w100 mTop4"
          suffixIcon={<Icon icon="arrow-down-border Font14" />}
          labelInValue={true}
          allowClear={true}
          showSearch={true}
          placeholder={_l('请选择')}
          notFoundContent={fetching ? <LoadDiv size="small" /> : _l('暂无应用')}
          options={appList}
          value={appInfo && appInfo.appId ? { label: appInfo.sourceName, value: appInfo.appId } : undefined}
          filterOption={(inputValue, option) => {
            return option.label.toLowerCase().includes(inputValue.toLowerCase());
          }}
          onChange={(app = {}) => {
            if (app.value === appInfo.appId) return;
            setState({
              appInfo: { appId: app.value, sourceName: app.label },
              worksheetInfos: [],
              doubleWriteTables: [],
              tableOptionList: [],
            });
          }}
        />
        <div className="mTop10 Bold">{_l('将工作表')}</div>
        <Select
          className="selectItem w100 mTop4"
          suffixIcon={<Icon icon="arrow-down-border Font14" />}
          mode="multiple"
          allowClear={true}
          showSearch={true}
          labelInValue={true}
          placeholder={_l('请选择')}
          notFoundContent={_l('暂无数据')}
          options={getWorksheetList()}
          value={worksheetInfos}
          filterOption={(inputValue, option) => {
            return option.workSheetName.toLowerCase().includes(inputValue.toLowerCase());
          }}
          onChange={worksheetInfos => {
            setState({
              worksheetInfos,
              doubleWriteTables: worksheetInfos.map(o => {
                const data = tableOptionList.find(a => a.value === o.value) || {};
                return {
                  wsName: data.workSheetName,
                  wsId: data.workSheetId,
                  worksheetId: data.workSheetId,
                  alias: data.alias,
                  tableName: `ws_${data.workSheetId}`,
                };
              }),
            });
          }}
        />
        <div className="mTop20 Bold mBottom10">{_l('同步到数据库')}</div>
        <EditDest
          {...props}
          projectId={props.projectId}
          dest={{ ...dest, tableName: dest.db }}
          onUpdate={dest => {
            setState({
              dest: { ...dest, db: '', tableName: '', schemaName: '' },
              schemaOptionList: [],
            });
          }}
          canEdit={true}
        />
        {dest.dsType && (
          <React.Fragment>
            <div className="mTop10">{_l('数据库')}</div>
            <Select
              className="selectItem w100 mTop4"
              suffixIcon={<Icon icon="arrow-down-border Font14" />}
              allowClear={true}
              showSearch={true}
              placeholder={_l('请选择')}
              notFoundContent={_l('暂无数据')}
              options={dbOptionList}
              value={dest.db}
              onChange={onChangeDb}
            />
          </React.Fragment>
        )}
        {['POSTGRESQL', 'ALIYUN_POSTGRES', 'TENCENT_POSTGRES'].includes(dest.dsType) && (
          <React.Fragment>
            <div className="mTop10">schema</div>
            <Select
              className="selectItem w100 mTop4"
              showSearch={true}
              allowClear={true}
              labelInValue={true}
              placeholder={_l('请选择')}
              notFoundContent={_l('暂无数据')}
              value={dest.schemaName}
              options={schemaOptionList}
              onChange={schema => onChangeSchema(schema)}
            />
          </React.Fragment>
        )}
      </React.Fragment>
    );
  };
  return (
    <Dialog
      dialogClasses={className}
      className={cx('')}
      visible={visible}
      anim={false}
      title={_l('创建镜像')}
      width={680}
      onCancel={() => {
        if (step === 1) {
          setState({
            step: 0,
          });
        } else {
          onHide();
        }
      }}
      okText={step === 1 ? _l('创建并同步') : _l('下一步')}
      cancelText={step === 1 ? _l('上一步') : _l('取消')}
      okDisabled={
        isCreating ||
        !(
          (step === 1 &&
            doubleWriteTables.filter(o => o.isErr || !o.tableName.trim()).length <= 0 &&
            doubleWriteTables.filter(o => doubleWriteTables.filter(a => a.tableName === o.tableName).length > 1)
              .length <= 0) ||
          (step !== 1 &&
            worksheetInfos.length > 0 &&
            !!dest.db &&
            !(['POSTGRESQL', 'ALIYUN_POSTGRES', 'TENCENT_POSTGRES'].includes(dest.dsType) && !dest.schemaName))
        )
      }
      onOk={() => {
        if (step === 1) {
          setState({
            isCreating: true,
          });
          if (isCreating) {
            return;
          }
          emitter.emit('CHECK_TABLE_EXISTS');
        } else {
          setState({
            step: 1,
          });
        }
      }}
    >
      <Wrap className="">
        {step === 1 ? (
          <Tables
            dest={dest}
            projectId={props.projectId}
            doubleWriteTables={doubleWriteTables}
            worksheetInfos={worksheetInfos}
            onChange={(doubleWriteTables, nextCreate, isChecking) => {
              if (isChecking) {
                setState({ isCreating: isChecking });
                return;
              }
              setState({ doubleWriteTables, isCreating: nextCreate ? nextCreate : false });
              nextCreate && onCreate(doubleWriteTables);
            }}
          />
        ) : (
          renderCreate()
        )}
      </Wrap>
    </Dialog>
  );
}

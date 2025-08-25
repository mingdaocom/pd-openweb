import React, { useState } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Button, Dialog, Icon, LoadDiv } from 'ming-ui';
import dataSourceApi from '../../../../api/datasource';
import syncTaskApi from '../../../../api/syncTask';
import taskFlowApi from '../../../../api/taskFlow';
import { upgradeVersionDialog } from 'src/components/upgradeVersion';
import ConfigForm from '../../../components/configForm';
import ConfigGuide from '../../../components/configGuide';
import { CREATE_CONNECTOR_STEP_LIST, CREATE_TYPE, DATABASE_TYPE, ROLE_TYPE } from '../../../constant';
import { getExtraParams } from '../../../utils';
import CreateSyncTask from '../CreateSyncTask';
import '../../style.less';

const ConnectorAddWrapper = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
`;

const HeaderWrapper = styled.div`
  display: flex;
  z-index: 1;
  height: 64px;
  min-height: 64px;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.16);

  .headerLeft {
    display: flex;
    align-items: center;
    padding-left: 32px;
    cursor: pointer;
  }

  .headerMiddle {
    ul {
      text-align: center;
      li {
        display: inline-flex;
        align-items: center;
        box-sizing: border-box;
        .stepIcon {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #f4f4f4;
          color: #9e9e9e;
        }
        span {
          line-height: 20px;
          margin-left: 5px;
          color: #9e9e9e;
        }
        .connectLine {
          height: 1px;
          width: 50px;
          margin: 0 16px;
          background-color: #ddd;
        }

        &.isActive {
          .stepIcon {
            background: #1677ff;
            color: #fff;
          }
          span {
            color: #151515;
          }
        }
        &.isComplete {
          .stepIcon {
            background-color: #ecf6fe;
            color: #1677ff;
          }
          span {
            color: #9e9e9e;
          }
          .connectLine {
            background-color: #1677ff;
          }
        }
      }
    }
  }

  .headerRight {
    display: inline-flex;
    padding-right: 32px;
    .commonButton {
      height: 36px;
      min-width: 102px;
      &.disabled {
        background: #93c4f1 !important;
      }
    }
    .lastStepButton {
      margin-right: 16px;
      border: 1px solid #1677ff;
      background: #fff;
      color: #1677ff;
    }
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  height: 100%;
  background-color: #fafafa;

  .configForm {
    flex: 2;
    height: calc(100vh - 64px);
    overflow: auto;
    padding: 0px 80px;
    background-color: #fff;
    font-size: 13px;
  }

  .configGuide {
    flex: 1;
    padding: 20px;
    height: calc(100vh - 50px);
    min-width: 400px;
    overflow: auto;
  }
`;

export default function AddConnector(props) {
  const { onClose } = props;
  const [connectorConfigData, setConnectorConfigData] = useSetState(props.connectorConfigData);
  const [currentStep, setCurrentStep] = useState(0);
  const [nextOrSaveDisabled, setNextOrSaveDisabled] = useState(true);
  const [submitData, setSubmitData] = useState([]);
  const [resDialog, setResDialog] = useState({ visible: false });
  const isSourceAppType = connectorConfigData.source.type === DATABASE_TYPE.APPLICATION_WORKSHEET;
  const isDestAppType = connectorConfigData.dest.type === DATABASE_TYPE.APPLICATION_WORKSHEET;

  const getRoleType = () => (currentStep === 0 ? ROLE_TYPE.SOURCE : ROLE_TYPE.DEST).toLowerCase();

  const onClickNext = () => {
    const currentRoleType = getRoleType();
    const currentData = connectorConfigData[currentRoleType];
    const { formData } = currentData;

    if (currentData.type !== DATABASE_TYPE.APPLICATION_WORKSHEET && !(currentData.sourceName || '').trim()) {
      alert(_l('数据源名称不能为空'), 2);
      return;
    }

    if ((currentStep === 0 && !_.includes([24, 36], connectorConfigData.dest.id.length)) || currentStep !== 0) {
      setNextOrSaveDisabled(true);
    }

    setCurrentStep(currentStep + 1);

    if (
      currentData.createType !== CREATE_TYPE.SELECT_EXIST &&
      currentData.type !== DATABASE_TYPE.APPLICATION_WORKSHEET
    ) {
      const addParams = {
        projectId: props.currentProjectId,
        name: currentData.sourceName,
        hosts: [`${formData.address}:${formData.post}`],
        user: formData.user,
        password: formData.password,
        initDb: formData.initDb,
        connectOptions: formData.connectOptions,
        cdcParams: formData.cdcParams,
        type: currentData.type,
        fromType: currentData.fromType,
        roleType: currentStep === 0 ? ROLE_TYPE.SOURCE : ROLE_TYPE.DEST,
        extraParams: getExtraParams(currentData.type, formData),
      };

      dataSourceApi.addDatasource(addParams).then(res => {
        if (res) {
          setConnectorConfigData({
            [currentRoleType]: Object.assign({}, currentData, { id: res }),
          });
        }
      });
    }
  };

  const validateSubmitData = () => {
    // 所有同步任务都没选目的数据库
    if (submitData.length === 0) {
      alert(isDestAppType ? _l('没有可创建的同步任务') : _l('请先选择目标数据库'), 2);
      return false;
    }

    //选了数据库，没有选择Schema -- 仅针对有schema数据库
    if (
      connectorConfigData.dest.hasSchema &&
      submitData.filter(item => !_.get(item, ['destNode', 'config', 'schema'])).length > 0
    ) {
      alert(_l('未选择Schema'), 2);
      return false;
    }

    //选了数据库，没有选择或填写数据表
    if (submitData.filter(item => !(_.get(item, ['destNode', 'config', 'tableName']) || '').trim()).length > 0) {
      alert(_l('未选择或填写数据表'), 2);
      return false;
    }

    //目的地是工作表-选择已有，未设置识别重复数据字段
    // if (
    //   submitData.filter(
    //     item =>
    //       _.get(item, ['destNode', 'config', 'dsType']) === DATABASE_TYPE.APPLICATION_WORKSHEET &&
    //       !_.get(item, ['destNode', 'config', 'createTable']) &&
    //       !_.get(item, ['destNode', 'config', 'fieldForIdentifyDuplicate']),
    //   ).length > 0
    // ) {
    //   alert(_l('未设置重复数据识别方式'), 2);
    //   return false;
    // }

    //主键是否勾选
    let isSourcePkCheckAndMap = true;
    let isDestPkCheck = true;
    //是否有勾选
    let hasCheck = true;
    //字段信息是否填写完整
    let isComplete_new = true;
    //新建表名称是否已存在
    let isExistTableName = false;
    //目的地是库，是否存在相同新建表名称
    let hasRepeatNewTable = false;
    //是否存在重名字段
    let hasRepeatFields = false;
    //新建工作表字段是否超过最大限制
    let isFieldsExceedMax = false;
    //目的地是表，是否设置标题
    let isSetTitle = true;
    //HANA库 依据字段更新时 是否选择依据字段
    let hanaHasBaseField = true;
    // HANA库 依据字段更新时 首次读取值校验是否为空
    let isEmptyFirstValue = false;
    // HANA库 依据字段更新时 首次读取值校验是否有效
    let validFirstValue = true;
    // HANA库 读取间隔为每天，具体时间是否选择
    let isSetReadTime = true;

    submitData.forEach(item => {
      const isCreateTable = _.get(item, ['destNode', 'config', 'createTable']);

      if (item.destNode.fields.length === 0) {
        hasCheck = false;
        return;
      }

      if (item.scheduleConfig) {
        if (item.scheduleConfig.readType === 1) {
          const basisField = _.get(item, 'scheduleConfig.config.basisField') || {};
          const firstValue = _.get(item, 'scheduleConfig.config.firstValue');
          if (!basisField.id) {
            hanaHasBaseField = false;
            return;
          }

          if (!firstValue && firstValue !== 0) {
            isEmptyFirstValue = true;
            return;
          }

          if ([91, 93].includes(basisField.jdbcTypeId) && !basisField.isPk) {
            //日期格式
            const regex =
              /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])(?:\s(0\d|1\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?)?$/;
            if (!regex.test(firstValue)) {
              validFirstValue = false;
              return;
            }
          }
        }

        if (item.scheduleConfig.readIntervalType === 1 && !item.scheduleConfig.readTime) {
          isSetReadTime = false;
          return;
        }
      }

      if (isCreateTable) {
        if (isDestAppType && item.destNode.fields.filter(field => field.isTitle).length === 0) {
          isSetTitle = false;
          return;
        }
        item.destNode.fields.forEach(field => {
          switch (true) {
            case isSourceAppType && isDestAppType:
              if (!field.name.trim()) {
                isComplete_new = false;
              }
              break;
            case !isSourceAppType && isDestAppType:
              if (!field.name.trim() || !field.alias || !field.jdbcTypeId || !field.mdType) {
                isComplete_new = false;
              }
              break;
            default:
              if (!field.name.trim() || !field.alias || !field.jdbcTypeId) {
                isComplete_new = false;
              }
              break;
          }
        });
      } else {
        if (
          (item.destNode.config.fieldsMapping || []).filter(
            map => map.sourceField.isPk && map.sourceField.isCheck && map.destField && map.destField.id,
          ).length === 0
        ) {
          isSourcePkCheckAndMap = false;
          return;
        }

        const checkPkCount = item.destNode.fields.filter(item => item.isPk && item.id).length;

        if ((checkPkCount === 0 || checkPkCount < item.destPkCount) && !isDestAppType) {
          isDestPkCheck = false;
          return;
        }
      }

      const tableName = _.get(item, ['destNode', 'config', 'tableName']);
      const tableList = item.tableList || [];
      if (isCreateTable) {
        if (isDestAppType) {
          if (item.destNode.fields.length > 200) {
            isFieldsExceedMax = true;
          }
        } else {
          if (tableList.filter(item => item.value === tableName).length > 0) {
            isExistTableName = true;
          }
          const fieldNames = item.destNode.fields.map(item => item.name);
          if (fieldNames.length > _.uniq(fieldNames).length) {
            hasRepeatFields = true;
          }
        }
      }
    });

    const newTableNames = submitData
      .filter(item => !!_.get(item, ['destNode', 'config', 'createTable']) && !isDestAppType)
      .map(item => item.destNode.config.tableName);
    if (newTableNames.length > _.uniq(newTableNames).length) {
      hasRepeatNewTable = true;
    }

    if (!isSourcePkCheckAndMap) {
      alert(_l('有同步任务未选择主键字段'), 2);
      return false;
    }

    if (!isDestPkCheck) {
      alert(_l('目的地主键未设置相关映射'), 2);
      return false;
    }

    if (!hasCheck) {
      alert(_l('有同步任务未选择任何字段'), 2);
      return false;
    }

    if (!isComplete_new) {
      alert(_l('已勾选的字段信息未填写完整'), 2);
      return false;
    }

    if (isExistTableName) {
      alert(_l('目标表名称已存在, 需要修改目的地表名称'), 2);
      return false;
    }

    if (hasRepeatFields) {
      alert(_l('字段名不能重复'), 2);
      return false;
    }

    if (hasRepeatNewTable) {
      alert(_l('新建表名不能重复'), 2);
      return false;
    }

    if (isFieldsExceedMax) {
      alert(_l('新建工作表字段数不能超过200'), 2);
      return false;
    }

    if (!isSetTitle) {
      alert(_l('目标工作表未设置标题字段'), 2);
      return false;
    }

    if (!hanaHasBaseField) {
      alert(_l('定时设置依据字段未设置'), 2);
      return false;
    }

    if (isEmptyFirstValue) {
      alert(_l('首次读取开始值不允许为空'), 2);
      return false;
    }

    if (!validFirstValue) {
      alert(_l('首次读取开始值格式不完整'), 2);
      return false;
    }

    if (!isSetReadTime) {
      alert(_l('请选择每天读取具体时间'), 2);
      return false;
    }

    return true;
  };

  const onCreateTask = () => {
    //校验数据
    if (validateSubmitData()) {
      //获取当前任务数和最大限制数
      syncTaskApi.createOnlySyncTaskPreCheck({ projectId: props.currentProjectId }).then(res => {
        if (res.currentTaskNum + submitData.length > res.maxTaskNum) {
          upgradeVersionDialog({
            projectId: props.currentProjectId,
            hint: _l('余量不足'),
            explainText: _l('当前版本最多可创建%0个同步任务, 请升级版本以创建更多同步任务', res.maxTaskNum),
            isFree: true,
          });
        } else {
          setNextOrSaveDisabled(true);
          setResDialog({ visible: true, type: 'loading' });
          //创建同步任务
          const submitParams = submitData.map(item => _.omit(item, ['tableList', 'destPkCount']));
          taskFlowApi
            .createSyncTasks(submitParams)
            .then(res => {
              setResDialog({
                visible: true,
                type: res.isSucceeded ? 'success' : 'error',
                errorMsgList: res.errorMsgList,
              });
            })
            .catch(() => {
              setNextOrSaveDisabled(false);
              setResDialog({ visible: false });
            });
        }
      });
    }
  };

  return (
    <ConnectorAddWrapper>
      <HeaderWrapper>
        <div className="headerLeft" onClick={onClose}>
          <Icon icon="backspace" className="Gray_75 Font22 bold" />
          <span className="Gray Font16 bold pLeft10">{_l('创建连接器')}</span>
        </div>

        <div className="headerMiddle">
          <ul>
            {CREATE_CONNECTOR_STEP_LIST.map((item, index) => {
              return (
                <li key={index} className={cx({ isActive: index === currentStep, isComplete: index < currentStep })}>
                  <div className="stepIcon">
                    {index < currentStep ? <Icon icon="done" className="Font16" /> : index + 1}
                  </div>
                  <span>{item.text}</span>
                  {index !== CREATE_CONNECTOR_STEP_LIST.length - 1 && <div className="connectLine" />}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="headerRight">
          {currentStep !== 0 && (
            <Button
              type="primary"
              className="commonButton lastStepButton"
              onClick={() => {
                setCurrentStep(currentStep - 1);
                setNextOrSaveDisabled(false);
              }}
            >
              {_l('上一步')}
            </Button>
          )}

          <Button
            type="primary"
            className={cx('commonButton', { disabled: nextOrSaveDisabled })}
            disabled={nextOrSaveDisabled}
            onClick={currentStep !== 2 ? onClickNext : onCreateTask}
          >
            {currentStep === 2
              ? submitData.length
                ? _l('创建%0个同步任务', submitData.length)
                : _l('创建同步任务')
              : _l('下一步')}
          </Button>
        </div>
      </HeaderWrapper>

      {currentStep === 2 ? (
        <CreateSyncTask
          {...props}
          source={connectorConfigData.source}
          dest={connectorConfigData.dest}
          submitData={submitData}
          setSubmitData={setSubmitData}
          setNextOrSaveDisabled={setNextOrSaveDisabled}
        />
      ) : (
        <ContentWrapper>
          <div className="configForm">
            <ConfigForm
              {...props}
              connectorConfigData={connectorConfigData}
              setConnectorConfigData={setConnectorConfigData}
              isCreateConnector={true}
              setSaveDisabled={setNextOrSaveDisabled}
              roleType={getRoleType()}
            />
          </div>
          <div className="configGuide">
            <ConfigGuide source={connectorConfigData[getRoleType()]} current={currentStep === 0 ? 'source' : 'dest'} />
          </div>
        </ContentWrapper>
      )}

      {resDialog.visible &&
        (resDialog.type !== 'error' ? (
          <Dialog visible width={640} className="connectorResultDialog" showFooter={false} closable={false}>
            <div className="flexColumn alignItemsCenter justifyContentCenter h100 TxtCenter">
              {resDialog.type === 'success' ? (
                <React.Fragment>
                  <img src="/staticfiles/images/trophy.png" width={190} height={170} />
                  <div className="Font20 bold mTop20">{_l('太棒了！同步任务创建成功')}</div>
                  <div className="Font14 Gray_75 mTop20">
                    {_l('可在')}
                    <a
                      className="mLeft5 mRight5"
                      onClick={() => {
                        window.location.href = '/integration/task';
                      }}
                    >
                      {_l('数据同步任务')}
                    </a>
                    {_l('中查看任务的运行状态与同步详情')}
                  </div>
                  <div className="flexRow alignItemsCenter mTop20">
                    <Icon icon="info_outline" className="Gray_9e Font16" />
                    <span className="Gray_9e mLeft8">{_l('连续60天无数据同步，会自动停止')}</span>
                  </div>
                  <Button
                    type="primary"
                    className="mTop36"
                    onClick={() => (window.location.href = '/integration/task')}
                  >
                    {_l('查看同步任务')}
                  </Button>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <LoadDiv />
                  <div className="Font20 bold mTop36">{_l('任务创建中...')}</div>
                  <div className="Font14 Gray_75 mTop8">{_l('可能需要一些时间，请耐心等待')}</div>
                </React.Fragment>
              )}
            </div>
          </Dialog>
        ) : (
          <Dialog
            visible
            title={_l('报错信息')}
            width={480}
            className="connectorErrorDialog"
            showCancel={false}
            okText={_l('关闭')}
            onOk={() => {
              setResDialog({ visible: false });
              setNextOrSaveDisabled(false);
            }}
            onCancel={() => {
              setResDialog({ visible: false });
              setNextOrSaveDisabled(false);
            }}
          >
            {resDialog.errorMsgList && resDialog.errorMsgList.length > 0 && (
              <div className="errorInfo">
                {resDialog.errorMsgList.map((error, index) => {
                  return <div key={index} className="mTop5">{`${index + 1}. ${error}`}</div>;
                })}
              </div>
            )}
          </Dialog>
        ))}
    </ConnectorAddWrapper>
  );
}

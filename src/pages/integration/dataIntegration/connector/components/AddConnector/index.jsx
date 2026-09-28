import React, { useEffect, useRef, useState } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, LoadDiv } from 'ming-ui';
import { Button, Modal } from 'ming-ui/antd-components';
import syncTaskApi from '../../../../api/syncTask';
import taskFlowApi from '../../../../api/taskFlow';
import { upgradeVersionDialog } from 'src/components/upgradeVersion';
import { pathCompletion } from 'src/utils/platform/navigation/path';
import ConfigForm from '../../../components/configForm';
import ConfigGuide from '../../../components/configGuide';
import { CREATE_CONNECTOR_STEP_LIST, CREATE_TYPE, DATABASE_TYPE, ROLE_TYPE } from '../../../constant';
import dataSourceApi from '../../../services/datasource';
import { getSensitiveRequestErrorMessages } from '../../../services/sensitiveRequest';
import { getExtraParams } from '../../../utils';
import CreateSyncTask from '../CreateSyncTask';
import '../../style.less';

const CONNECTOR_RESULT_MODAL_STYLES = {
  container: { height: 450 },
  body: { padding: '0 24px 36px' },
};

const HIDDEN_CANCEL_BUTTON_PROPS = { style: { display: 'none' } };

const ConnectorAddWrapper = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
  background-color: var(--color-background-secondary);
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
  background-color: var(--color-background-primary);
  box-shadow: var(--shadow-sm);

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
          background: var(--color-background-disabled);
          color: var(--color-text-tertiary);
        }
        span {
          line-height: 20px;
          margin-left: 5px;
          color: var(--color-text-tertiary);
        }
        .connectLine {
          height: 1px;
          width: 50px;
          margin: 0 16px;
          background-color: var(--color-border-primary);
        }

        &.isActive {
          .stepIcon {
            background: var(--color-primary);
            color: var(--color-white);
          }
          span {
            color: var(--color-text-title);
          }
        }
        &.isComplete {
          .stepIcon {
            background-color: var(--color-primary-transparent);
            color: var(--color-primary);
          }
          span {
            color: var(--color-text-tertiary);
          }
          .connectLine {
            background-color: var(--color-primary);
          }
        }
      }
    }
  }

  .headerRight {
    display: inline-flex;
    padding-right: 32px;
    .lastStepButton {
      margin-right: 16px;
    }
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  height: 100%;
  background-color: var(--color-background-secondary);

  .configForm {
    flex: 2;
    height: calc(100vh - 64px);
    overflow: auto;
    padding: 0px 80px;
    background-color: var(--color-background-primary);
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
  const [creating, setCreating] = useState(false);
  const [savingSource, setSavingSource] = useState(false);
  const sourceRequest = useRef(null);
  useEffect(
    () => () => {
      sourceRequest.current?.abort();
      sourceRequest.current = null;
    },
    [],
  );
  const [submitData, setSubmitData] = useState([]);
  const [resDialog, setResDialog] = useState({ visible: false });
  const isSourceAppType = connectorConfigData.source.type === DATABASE_TYPE.APPLICATION_WORKSHEET;
  const isDestAppType = connectorConfigData.dest.type === DATABASE_TYPE.APPLICATION_WORKSHEET;

  const getRoleType = () => (currentStep === 0 ? ROLE_TYPE.SOURCE : ROLE_TYPE.DEST).toLowerCase();

  const onClickNext = async () => {
    if (sourceRequest.current) return;
    const currentRoleType = getRoleType();
    const currentData = connectorConfigData[currentRoleType];
    const { formData } = currentData;

    if (currentData.type !== DATABASE_TYPE.APPLICATION_WORKSHEET && !(currentData.sourceName || '').trim()) {
      alert(_l('数据源名称不能为空'), 2);
      return;
    }

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

      const controller = new AbortController();
      sourceRequest.current = controller;
      setSavingSource(true);
      try {
        const res = await dataSourceApi.addDatasource(addParams, { abortController: controller });
        if (controller.signal.aborted) return;
        if (typeof res !== 'string' || !res) {
          alert(_l('数据源创建失败'), 2);
          return;
        }

        setConnectorConfigData({
          [currentRoleType]: { ...currentData, id: res },
        });
      } catch (error) {
        if (!controller.signal.aborted) {
          const messages = getSensitiveRequestErrorMessages(error, _l('数据源创建失败'));
          if (messages.length) alert(messages[0], 2);
        }

        return;
      } finally {
        if (sourceRequest.current === controller) {
          sourceRequest.current = null;
          setSavingSource(false);
        }
      }
    }

    if ((currentStep === 0 && !_.includes([24, 36], connectorConfigData.dest.id.length)) || currentStep !== 0) {
      setNextOrSaveDisabled(true);
    }

    setCurrentStep(currentStep + 1);
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
    if (creating) return;

    //校验数据
    if (validateSubmitData()) {
      //获取当前任务数和最大限制数
      setCreating(true);
      return syncTaskApi
        .createOnlySyncTaskPreCheck({ projectId: props.currentProjectId })
        .then(res => {
          if (res.currentTaskNum + submitData.length > res.maxTaskNum) {
            upgradeVersionDialog({
              projectId: props.currentProjectId,
              hint: _l('余量不足'),
              explainText: _l('当前版本最多可创建%0个同步任务, 请升级版本以创建更多同步任务', res.maxTaskNum),
              isFree: true,
            });
            return;
          }

          setNextOrSaveDisabled(true);
          setResDialog({ visible: true, type: 'loading' });
          const submitParams = submitData.map(item => _.omit(item, ['tableList', 'destPkCount']));
          return taskFlowApi.createSyncTasks(submitParams).then(res => {
            setResDialog({
              visible: true,
              type: res.isSucceeded ? 'success' : 'error',
              errorMsgList: res.errorMsgList,
            });
          });
        })
        .catch(() => {
          setNextOrSaveDisabled(false);
          setResDialog({ visible: false });
        })
        .finally(() => {
          setCreating(false);
        });
    }
  };

  return (
    <ConnectorAddWrapper>
      <HeaderWrapper>
        <div className="headerLeft" onClick={onClose}>
          <Icon icon="backspace" className="textSecondary Font22 bold" />
          <span className="textPrimary Font16 bold pLeft10">{_l('创建连接器')}</span>
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
              color="primary"
              variant="outlined"
              className="lastStepButton"
              disabled={savingSource}
              onClick={() => {
                if (sourceRequest.current) return;
                setCurrentStep(currentStep - 1);
                setNextOrSaveDisabled(false);
              }}
            >
              {_l('上一步')}
            </Button>
          )}

          <Button
            type="primary"
            loading={creating || savingSource}
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
              key={getRoleType()}
              {...props}
              connectorConfigData={connectorConfigData}
              setConnectorConfigData={setConnectorConfigData}
              isCreateConnector={true}
              setSaveDisabled={setNextOrSaveDisabled}
              roleType={getRoleType()}
              disabled={savingSource}
            />
          </div>
          <div className="configGuide">
            <ConfigGuide source={connectorConfigData[getRoleType()]} current={currentStep === 0 ? 'source' : 'dest'} />
          </div>
        </ContentWrapper>
      )}

      {resDialog.visible &&
        (resDialog.type !== 'error' ? (
          <Modal open width={640} styles={CONNECTOR_RESULT_MODAL_STYLES} closable={false}>
            <div className="flexColumn alignItemsCenter justifyContentCenter h100 TxtCenter">
              {resDialog.type === 'success' ? (
                <React.Fragment>
                  <img src="/staticfiles/images/trophy.png" width={190} height={170} />
                  <div className="Font20 bold mTop20">{_l('太棒了！同步任务创建成功')}</div>
                  <div className="Font14 textSecondary mTop20">
                    {_l('可在')}
                    <a
                      className="mLeft5 mRight5"
                      onClick={() => {
                        window.location.href = pathCompletion('/integration/task');
                      }}
                    >
                      {_l('数据同步任务')}
                    </a>
                    {_l('中查看任务的运行状态与同步详情')}
                  </div>
                  <div className="flexRow alignItemsCenter mTop20">
                    <Icon icon="info_outline" className="textTertiary Font16" />
                    <span className="textTertiary mLeft8">{_l('连续60天无数据同步，会自动停止')}</span>
                  </div>
                  <Button
                    type="primary"
                    className="mTop36"
                    onClick={() => (window.location.href = pathCompletion('/integration/task'))}
                  >
                    {_l('查看同步任务')}
                  </Button>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <LoadDiv />
                  <div className="Font20 bold mTop36">{_l('任务创建中...')}</div>
                  <div className="Font14 textSecondary mTop8">{_l('可能需要一些时间，请耐心等待')}</div>
                </React.Fragment>
              )}
            </div>
          </Modal>
        ) : (
          <Modal
            open
            title={_l('报错信息')}
            width={480}
            className="connectorErrorDialog"
            okText={_l('关闭')}
            cancelButtonProps={HIDDEN_CANCEL_BUTTON_PROPS}
            mask={{ closable: true }}
            keyboard
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
          </Modal>
        ))}
    </ConnectorAddWrapper>
  );
}

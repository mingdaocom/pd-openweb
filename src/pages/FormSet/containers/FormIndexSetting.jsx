import React, { Fragment, useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, LoadDiv, Support } from 'ming-ui';
import { Button, Drawer, Input, Tooltip } from 'ming-ui/antd-components';
import worksheetAjax from 'src/api/worksheet';
import CreateIndex from 'worksheet/common/CreateIndex';
import MoreOption from '../components/MoreOption';

const Con = styled.div`
  width: 100%;
  height: 100%;
  background: var(--color-background-primary);
  position: relative !important;
  overflow: hidden;
  .setIndexList {
    width: 100%;
    height: 100%;
    overflow: auto;
    padding: 35px 40px 32px;
    display: flex;
    flex-direction: column;
    .noData {
      width: 130px;
      height: 130px;
      background: var(--color-background-secondary);
      border-radius: 50%;
      margin: 200px auto 0;
      text-align: center;
      color: var(--color-text-tertiary);
      .icon {
        font-size: 60px;
        line-height: 130px;
      }
    }
    .printTemplatesList {
      width: 100%;
      .printTemplatesList-box {
        overflow-y: scroll;
        position: relative;
        &::-webkit-scrollbar {
          width: 0px !important;
        }
        -ms-overflow-style: none; /* Internet Explorer和Edge */
        scrollbar-width: none; /* Firefox */
      }
      .printTemplatesList-header {
        display: flex;
        align-items: center;
        font-size: 13px;
        color: var(--color-text-secondary);
        font-weight: 600;
        padding-bottom: 11px;
        border-bottom: 1px solid var(--color-border-primary);
      }
      .printTemplatesList-tr {
        display: flex;
        align-items: center;
        border-bottom: 1px solid var(--color-border-secondary);
        height: auto !important;
        min-height: 68px !important;
        &:hover {
          background: var(--color-background-hover);
        }
        .field {
          padding: 10px 0;
        }
        .field .viewsBox {
          width: fit-content;
          max-width: 100%;
        }
        .status {
          display: flex;
          justify-content: space-between;
          line-height: 24px;
          margin-top: 0px;
          .fail,
          .inLine {
            height: 24px;
            padding: 0 12px;
            border-radius: 12px;
            color: var(--color-error);
            background-color: var(--color-error-bg);
          }
          .opacity0 {
            opacity: 0;
          }
          .edit {
            color: var(--color-primary);
            &:hover {
              opacity: 0.8;
            }
          }
        }
        .activeCon {
          display: flex;

          & > span {
            display: inline-flex;
            color: var(--color-primary);

            &:hover {
              opacity: 0.8;
            }
          }
        }
      }
      .printTemplatesList-header,
      .printTemplatesList-tr {
        .w120px {
          width: 120px;
        }
        .w80px {
          width: 80px;
        }
        .w150px {
          width: 150px;
        }
        .name {
          padding-left: 11px;
        }
      }
    }
  }
  .uniqueIndexColor {
    color: var(--color-success);
  }
  .wildcardIndexColor {
    color: var(--color-warning);
  }
  .sortFields:hover {
    color: var(--color-primary);
  }
`;

const ArrowUp = styled.span`
  border-width: 5px;
  border-style: solid;
  border-color: transparent transparent var(--color-text-tertiary) transparent;
  cursor: pointer;
  &:hover,
  &.active {
    border-color: transparent transparent #1677ff transparent;
  }
`;

const ArrowDown = styled.span`
  border-width: 5px;
  border-style: solid;
  border-color: var(--color-text-tertiary) transparent transparent transparent;
  cursor: pointer;
  margin-top: 2px;
  &:hover,
  &.active {
    border-color: var(--color-primary) transparent transparent transparent;
  }
`;

const sortRules = { 1: _l('升序'), '-1': _l('降序'), text: _l('文本索引') };
const FILTER_TYPE_LIST = [40, 42, 43, 21, 25, 45, 14, 34, 22, 10010, 30, 47, 49, 50, 51, 52, 54];

export const getMoreOptionOpenState = ({ open, source, targetId }) => {
  if (!open && source === 'menu') return null;

  return {
    showMoreOption: open,
    templateId: open ? targetId : '',
  };
};

function FormIndexSetting(props) {
  const { worksheetInfo } = props;
  const { worksheetId, appId } = worksheetInfo;
  const input = useRef(null);
  const [showCreateIndex, setShowCreateIndex] = useState(false);
  const [isRename, setIsRename] = useState(false);
  const [currentIndexInfo, setCurrentIndexInfo] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [indexList, setIndexList] = useState([]); // indexStateId: 1: 成功 -1: 失败 0:排队
  const [templateId, setTemplateId] = useState('');
  const [showMoreOption, setShowMoreOption] = useState();
  const [isloading, setIsloading] = useState(true);
  const [selectedIndexList, setSelectedIndexList] = useState([{}]);
  const [worksheetFields, setWorksheetFields] = useState([]);
  const [worksheetAvailableFields, setWorksheetAvailableFields] = useState([]);
  const [worksheetRowIndexLimit, setWorksheetRowIndexLimit] = useState(0);
  const [sort, setSort] = useState('');

  useEffect(() => {
    if (!worksheetId) return;
    getIndexesInfo();
  }, [worksheetId]);

  useEffect(() => {
    if (isRename) {
      input.current?.focus();
    }
  }, [isRename]);

  const getIndexesInfo = () => {
    worksheetAjax.getRowIndexes({ worksheetId }).then(res => {
      setIndexList(res.worksheetRowIndexConfigs || []);
      setWorksheetFields(res.worksheetAvailableFields || []);
      let worksheetAvailableFields = (res.worksheetAvailableFields || []).filter(item =>
        item.controlType === 30
          ? (item.strDefault || '').split('')[0] !== '1'
          : !_.includes(FILTER_TYPE_LIST, item.controlType),
      );
      setWorksheetAvailableFields(worksheetAvailableFields);
      setIsloading(false);
      setWorksheetRowIndexLimit(res.worksheetRowIndexLimit);
    });
  };

  // 重命名
  const editIndex = obj => {
    worksheetAjax
      .updateRowIndexCustomeIndexName({
        appId,
        worksheetId, // 工作表Id
        indexConfigId: obj.indexConfigId, // 索引配置Id （系统级索引可为空）
        customeIndexName: obj.customeIndexName, // 自定义索引名称
      })
      .then(res => {
        if (res === 0) {
          alert(_l('修改成功'));
        } else {
          alert(_l('修改失败'), 2);
        }

        getIndexesInfo();
      });
  };

  // 根据字段id值获取字段信息;
  const getFieldObjById = id => {
    return (
      (!_.isEmpty(_.filter(worksheetAvailableFields, item => item.id === id)) &&
        _.filter(worksheetAvailableFields, item => item.id === id)[0]) ||
      {}
    );
  };

  if (isloading) {
    return <LoadDiv />;
  }

  let list = indexList;

  if (sort !== '') {
    list = indexList.sort((a, b) => {
      return sort === 'ASC'
        ? a.customeIndexName.charCodeAt(0) - b.customeIndexName.charCodeAt(0)
        : b.customeIndexName.charCodeAt(0) - a.customeIndexName.charCodeAt(0);
    });
  }

  return (
    <Fragment>
      <Con className="Relative">
        <div className="setIndexList">
          <div className="flexRow">
            <div className="flex">
              <h5 className="formName textPrimary Font17 Bold">
                {_l('检索加速')}
                <Icon
                  icon="workflow_cycle"
                  className="Font12 mLeft12 Hand textTertiary"
                  onClick={() => {
                    setIsloading(true);
                    getIndexesInfo();
                  }}
                />
              </h5>
              <p className="desc mTop8">
                <span className="Font13 textTertiary">
                  {_l(
                    '手动为大数据量的工作表建立合适的索引，可以加快工作表检索速度，最多创建%0个。',
                    worksheetRowIndexLimit,
                  )}
                </span>
                <Support type={3} text={_l('帮助')} href="https://help.mingdao.com/worksheet/index-acceleration" />
              </p>
            </div>
            <Button
              type="primary"
              shape="round"
              icon={<Icon icon="plus" />}
              disabled={(indexList || []).filter(item => !item.isSystem).length >= worksheetRowIndexLimit}
              onClick={() => {
                setShowCreateIndex(true);
                setIsEdit(false);
                setCurrentIndexInfo({});
                setSelectedIndexList([
                  {
                    fieldId: worksheetAvailableFields.length ? worksheetAvailableFields[0].id : '',
                    name: worksheetAvailableFields.length ? worksheetAvailableFields[0].name : '',
                    type: worksheetAvailableFields.length ? worksheetAvailableFields[0].type : '',
                    indexType: '1',
                    selectFiledsList: worksheetAvailableFields,
                  },
                ]);
              }}
            >
              {_l('创建索引')}
            </Button>
          </div>
          {_.isEmpty(indexList) ? (
            <div className="noData">
              <Icon icon="db_index" />
              <div className="mTop20 textTertiary Font15">{_l('暂无索引')}</div>
            </div>
          ) : (
            <div className="printTemplatesList flex overflowHidden flexColumn">
              <div className="printTemplatesList-header">
                <div
                  className="name flex mRight20 valignWrapper sortFields Hand"
                  onClick={() => setSort(sort === 'ASC' ? 'DESC' : 'ASC')}
                >
                  <div className="flex">{_l('名称')}</div>
                  <div className="flexColumn">
                    <ArrowUp className={cx({ active: sort === 'ASC' })} />
                    <ArrowDown className={cx({ active: sort === 'DESC' })} />
                  </div>
                </div>
                <div className="type mRight20 w120px">{_l('索引类型')}</div>
                <div className="field flex mRight20">{_l('索引字段')}</div>
                <div className="action mRight8 w80px">{_l('操作')}</div>
                <div className="more w80px"></div>
              </div>
              <div className="printTemplatesList-box flex">
                {list.map(item => {
                  // 运维创建索引且非升降序、文本类型
                  let notSystemIndexTypeList = [1, -1, 'text'];
                  let isSpecial =
                    item.isSystem && item.indexFields.some(item => !_.includes(notSystemIndexTypeList, item.indexType));
                  if (!isSpecial && item.isSystem) return '';

                  const type =
                    item.uniqueIndex && !item.wildcardIndex
                      ? 1
                      : item.wildcardIndex || item.indexFields.some(item => item.indexType === 'text')
                        ? 2
                        : 0;

                  return (
                    <div className="printTemplatesList-tr" key={`formIndexSetting-${item.indexConfigId}`}>
                      <div className="name flex mRight20 valignWrapper overflowHidden">
                        <Icon
                          icon={type === 0 ? 'db_index' : type === 1 ? 'score' : 'title'}
                          className={cx(
                            'iconTitle Font24 mRight13',
                            type === 0 ? 'textSecondary' : type === 1 ? 'uniqueIndexColor' : 'wildcardIndexColor',
                          )}
                        />
                        {isRename && templateId === item.indexConfigId ? (
                          <Input
                            type="text"
                            ref={input}
                            defaultValue={item.customeIndexName}
                            onBlur={e => {
                              setTemplateId('');
                              setIsRename(false);
                              if (!_.trim(e.target.value)) {
                                alert(_l('请输入索引名称'), 3);
                                input.current?.focus();
                                return;
                              }

                              if (_.trim(e.target.value) === item.customeIndexName) return;
                              let data = indexList.map(os => {
                                if (os.indexConfigId === item.indexConfigId) {
                                  return {
                                    ...os,
                                    customeIndexName: _.trim(e.target.value),
                                  };
                                } else {
                                  return os;
                                }
                              });
                              setIndexList(data || []);
                              editIndex({
                                ...item,
                                customeIndexName: _.trim(e.target.value),
                              });
                            }}
                          />
                        ) : (
                          <Tooltip title={item.customeIndexName}>
                            <span className="overflow_ellipsis"> {item.customeIndexName}</span>
                          </Tooltip>
                        )}
                        <span className="status mLeft12 nowrap">
                          {item.indexStateId === 1 && item.uniqueIndex && (
                            <span className="textTertiary">{_l('唯一索引')}</span>
                          )}
                          {item.indexStateId === -1 && <span className="fail">{_l('后台执行失败')}</span>}
                          {item.indexStateId === 0 && <span className="inLine">{_l('排队中')}</span>}
                        </span>
                      </div>
                      <div className="type mRight20 w120px">
                        {type === 0 ? _l('普通索引') : type === 1 ? _l('唯一索引') : _l('文本索引')}
                      </div>
                      <div className="field flex mRight20">
                        <div className="viewsBox">
                          {(item.indexFields || []).map((it, i) => {
                            const availableField = getFieldObjById(it.fieldId);
                            const worksheetField = _.find(worksheetFields, field => field.id === it.fieldId) || {};
                            const isDelete = it.isDelete && !item.isSystem;
                            const isUnsupported =
                              worksheetField.controlType === 30 && (worksheetField.strDefault || '')[0] === '1';
                            const fieldName =
                              availableField.name || (isUnsupported && worksheetField.name) || it.fieldId;

                            return (
                              <span className="ruleItem flexCenter" key={it.fieldId}>
                                <span className={cx('filed', { Red: isDelete || isUnsupported })}>
                                  {isDelete ? _l('字段已删除') : fieldName}
                                  {!isDelete && isUnsupported && (
                                    <Tooltip title={_l('字段类型不支持索引')}>
                                      <Icon icon="error1" className="Font15 textTertiary mLeft5 Red" />
                                    </Tooltip>
                                  )}
                                </span>
                                <span className="rule textTertiary">
                                  {!isSpecial ? `（${sortRules[it.indexType]}）` : `（${it.indexType}）`}
                                </span>
                                {i < item.indexFields.length - 1 ? '、' : ''}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                      <div className="activeCon mRight8 w80px">
                        {!isSpecial && (
                          <span
                            className="Hand edit Bold"
                            onClick={() => {
                              let selectFiledsList = _.differenceWith(
                                worksheetAvailableFields,
                                item.indexFields,
                                (item1, item2) => item1.id === item2.fieldId,
                              );
                              let newFields = (item.indexFields || []).map(n => {
                                let currentAvailableFileds = worksheetFields.filter(t => t.id === n.fieldId) || [];
                                return {
                                  ...n,
                                  type: _.get(getFieldObjById(n.fieldId), 'type'),
                                  selectFiledsList: currentAvailableFileds.concat(selectFiledsList),
                                };
                              });
                              setSelectedIndexList([...newFields]);
                              setCurrentIndexInfo(item);
                              setShowCreateIndex(true);
                              setIsEdit(true);
                            }}
                          >
                            {_l('编辑')}
                          </span>
                        )}
                      </div>
                      <div className="more w80px TxtCenter">
                        <MoreOption
                          open={
                            showMoreOption &&
                            (templateId === item.indexConfigId ||
                              (item.isSystem && templateId === item.systemIndexName))
                          }
                          placement="bottomRight"
                          onOpenChange={(open, info) => {
                            const nextState = getMoreOptionOpenState({
                              open,
                              source: info?.source,
                              targetId: item.indexConfigId || item.systemIndexName,
                            });
                            if (!nextState) return;

                            setShowMoreOption(nextState.showMoreOption);
                            setTemplateId(nextState.templateId);
                          }}
                          disabledRename={item.isSystem}
                          delTxt={_l('删除')}
                          description={_l('确定删除索引吗？删除后将无法恢复')}
                          setFn={data => {
                            data.isRename && setIsRename(true);
                            setShowMoreOption(false);
                          }}
                          deleteFn={() => {
                            worksheetAjax
                              .removeRowIndex({
                                appId,
                                worksheetId: item.worksheetId,
                                indexConfigId: item.indexConfigId,
                                isSystemIndex: item.isSystem,
                                systemIndexName: item.systemIndexName,
                              })
                              .then(res => {
                                if (res.responseEnum === 0) {
                                  alert(_l('操作成功。为保障性能，系统将在空闲时删除此索引'));
                                  getIndexesInfo();
                                } else if (res.responseEnum === -1) {
                                  alert(_l('删除失败'), 2);
                                }
                              });
                          }}
                        >
                          <Button
                            color="default"
                            variant="text"
                            size="small"
                            icon={<Icon icon="more_horiz" />}
                            onClick={event => event.stopPropagation()}
                          />
                        </MoreOption>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <Drawer
          size={497}
          placement="right"
          zIndex={10}
          onClose={() => setShowCreateIndex(false)}
          open={showCreateIndex}
          mask={{ enabled: false, closable: false }}
          getContainer={false}
          closable={false}
          styles={{ body: { padding: 0 } }}
        >
          {showCreateIndex && (
            <CreateIndex
              isEdit={isEdit}
              currentIndexInfo={currentIndexInfo}
              selectedIndexList={selectedIndexList}
              worksheetAvailableFields={worksheetAvailableFields}
              appId={appId}
              worksheetId={worksheetId}
              worksheetRowIndexLimit={worksheetRowIndexLimit}
              getIndexesInfo={getIndexesInfo}
              indexList={indexList}
              onClose={() => {
                setShowCreateIndex(false);
              }}
              getFieldObjById={getFieldObjById}
            />
          )}
        </Drawer>
      </Con>
    </Fragment>
  );
}

export default FormIndexSetting;

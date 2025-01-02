import React, { Fragment, useState, useEffect } from 'react';
import { Drawer } from 'antd';
import Trigger from 'rc-trigger';
import MoreOption from '../components/MoreOption';
import worksheetAjax from 'src/api/worksheet';
import { CreateIndex } from 'worksheet/common';
import { Support, Icon, LoadDiv, Tooltip } from 'ming-ui';
import styled from 'styled-components';
import cx from 'classnames';
import _ from 'lodash';
import '../components/MoreOption.less';

const Con = styled.div`
  width: 100%;
  height: 100%;
  background: #fff;
  position: relative !important;
  overflow: hidden;
  .setIndexList {
    width: 100%;
    height: 100%;
    overflow: auto;
    padding: 32px 40px;
    display: flex;
    flex-direction: column;
    .add {
      padding: 0 16px;
      line-height: 38px;
      height: 38px;
      background: #2196f3 0% 0% no-repeat padding-box;
      border-radius: 32px;
      text-align: center;
      font-size: 13px;
      letter-spacing: 0px;
      color: #ffffff;
      cursor: pointer;
      &.disabled {
        background-color: #9e9e9e;
        cursor: not-allowed;
      }
    }
    .noData {
      width: 130px;
      height: 130px;
      background: #f5f5f5;
      border-radius: 50%;
      margin: 200px auto 0;
      text-align: center;
      color: #9e9e9e;
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
        color: #757575;
        font-weight: 600;
        padding-bottom: 11px;
        border-bottom: 1px solid #dddddd;
      }
      .printTemplatesList-tr {
        display: flex;
        align-items: center;
        border-bottom: 1px solid #eaeaea;
        height: auto !important;
        min-height: 68px !important;
        &:hover {
          background: #fafafa;
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
            color: #f44336;
            background-color: #fbe9e7;
          }
          .opacity0 {
            opacity: 0;
          }
          .edit {
            color: #2196f3;
            &:hover {
              opacity: 0.8;
            }
          }
        }
        .activeCon {
          display: flex;

          & > span {
            display: inline-flex;
            color: #2196f3;

            &:hover {
              opacity: 0.8;
            }
          }
        }
        .more {
          position: relative;
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
    color: #4caf50;
  }
  .wildcardIndexColor {
    color: #ffa340;
  }
`;

const ArrowUp = styled.span`
  border-width: 5px;
  border-style: solid;
  border-color: transparent transparent #9e9e9e transparent;
  cursor: pointer;
  &:hover,
  &.active {
    border-color: transparent transparent #2196f3 transparent;
  }
`;

const ArrowDown = styled.span`
  border-width: 5px;
  border-style: solid;
  border-color: #9e9e9e transparent transparent transparent;
  cursor: pointer;
  margin-top: 2px;
  &:hover,
  &.active {
    border-color: #2196f3 transparent transparent transparent;
  }
`;

const MAX_COUNT = md.global.Config.IsLocal ? 10 : 5;
const sortRules = { 1: _l('升序'), '-1': _l('降序'), text: _l('文本索引') };
const FILTER_TYPE_LIST = [40, 42, 43, 21, 25, 45, 14, 34, 22, 10010, 30, 47, 49, 50, 51, 52, 54];

function FormIndexSetting(props) {
  const { worksheetInfo } = props;
  const { worksheetId, appId, template } = worksheetInfo;
  const input = React.createRef();
  const [showCreateIndex, setShowCreateIndex] = useState(false);
  const [isRename, setIsRename] = useState(false);
  const [currentIndexInfo, setCurrentIndexInfo] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [indexList, setIndexList] = useState([]); // indexStateId: 1: 成功 -1: 失败 0:排队
  const [templateId, setTemplateId] = useState('');
  const [showMoreOption, setShowMoreOption] = useState();
  const [isloading, setIsloading] = useState(true);
  const [selectedIndexList, setSelectedIndexList] = useState([{}]);
  const [worksheetAvailableFields, setWorksheetAvailableFields] = useState([]);
  const [sort, setSort] = useState('');

  useEffect(() => {
    if (!worksheetId) return;
    getIndexesInfo();
  }, [worksheetId]);

  useEffect(() => {
    if (isRename) {
      input.current.focus();
    }
  }, [isRename]);

  const getIndexesInfo = () => {
    worksheetAjax.getRowIndexes({ worksheetId }).then(res => {
      setIndexList(res.worksheetRowIndexConfigs || []);
      let worksheetAvailableFields = (res.worksheetAvailableFields || []).filter(
        item => !_.includes(FILTER_TYPE_LIST, item.controlType),
      );
      setWorksheetAvailableFields(worksheetAvailableFields);
      setIsloading(false);
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
              <h5 className="formName Gray Font17 Bold">
                {_l('检索加速')}
                <Icon
                  icon="workflow_cycle"
                  className="Font12 mLeft12 Hand Gray_9e"
                  onClick={() => {
                    setIsloading(true);
                    getIndexesInfo();
                  }}
                />
              </h5>
              <p className="desc mTop8">
                <span className="Font13 Gray_9e">
                  {_l('手动为大数据量的工作表建立合适的索引，可以加快工作表检索速度，最多创建%0个。', MAX_COUNT)}
                </span>
                <Support type={3} text={_l('帮助')} href="https://help.mingdao.com/worksheet/index-acceleration" />
              </p>
            </div>
            <span
              className={cx('add Relative bold', {
                disabled: (indexList || []).filter(item => !item.isSystem).length >= MAX_COUNT,
              })}
              onClick={() => {
                if ((indexList || []).filter(item => !item.isSystem).length >= MAX_COUNT) return;
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
              <Icon icon="plus" className="mRight8" />
              {_l('创建索引')}
            </span>
          </div>
          {_.isEmpty(indexList) ? (
            <div className="noData">
              <Icon icon="db_index" />
              <div className="mTop20 Gray_9e Font15">{_l('暂无索引')}</div>
            </div>
          ) : (
            <div className="printTemplatesList flex overflowHidden flexColumn">
              <div className="printTemplatesList-header">
                <div className="name flex mRight20 valignWrapper">
                  <div className="flex">{_l('名称')}</div>
                  <div className="flexColumn">
                    <ArrowUp className={cx({ active: sort === 'ASC' })} onClick={() => setSort('ASC')} />
                    <ArrowDown className={cx({ active: sort === 'DESC' })} onClick={() => setSort('DESC')} />
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
                          icon={type === 0 ? 'db_index' : type === 1 ? 'score' : 'task_custom_text-box'}
                          className={cx(
                            'iconTitle Font24 mRight13',
                            type === 0 ? 'Gray_75' : type === 1 ? 'uniqueIndexColor' : 'wildcardIndexColor',
                          )}
                        />
                        {isRename && templateId === item.indexConfigId ? (
                          <input
                            type="text"
                            ref={input}
                            defaultValue={item.customeIndexName}
                            onBlur={e => {
                              setTemplateId('');
                              setIsRename(false);
                              if (!_.trim(e.target.value)) {
                                alert(_l('请输入索引名称'), 3);
                                input.current.focus();
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
                          <Tooltip text={item.customeIndexName}>
                            <span className="overflow_ellipsis"> {item.customeIndexName}</span>
                          </Tooltip>
                        )}
                        <span className="status mLeft12 nowrap">
                          {item.indexStateId === 1 && item.uniqueIndex && (
                            <span className="Gray_9e">{_l('唯一索引')}</span>
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
                          {(item.indexFields || []).map((it, i) => (
                            <span className="ruleItem" key={it.fieldId}>
                              <span className={cx('filed', { Red: it.isDelete && !item.isSystem })}>
                                {it.isDelete && !item.isSystem
                                  ? _l('字段已删除')
                                  : _.get(getFieldObjById(it.fieldId), 'name')
                                  ? _.get(getFieldObjById(it.fieldId), 'name')
                                  : it.fieldId}
                              </span>
                              <span className="rule Gray_9e">
                                {!isSpecial ? `（${sortRules[it.indexType]}）` : `（${it.indexType}）`}
                              </span>
                              {i < item.indexFields.length - 1 ? '、' : ''}
                            </span>
                          ))}
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
                                let currentAvailableFileds =
                                  worksheetAvailableFields.filter(t => t.id === n.fieldId) || [];
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
                        <Trigger
                          popupVisible={
                            showMoreOption &&
                            (templateId === item.indexConfigId ||
                              (item.isSystem && templateId === item.systemIndexName))
                          }
                          action={['click']}
                          popupAlign={{
                            points: ['tr', 'br'],
                            overflow: { adjustX: true, adjustY: true },
                          }}
                          getPopupContainer={() => document.body}
                          onPopupVisibleChange={showDropOption => {
                            setShowMoreOption(showDropOption);
                            setTemplateId(
                              showDropOption ? (item.indexConfigId ? item.indexConfigId : item.systemIndexName) : '',
                            );
                          }}
                          popup={
                            <MoreOption
                              disabledRename={item.isSystem}
                              delTxt={_l('删除索引')}
                              description={_l('确定删除索引吗？删除后将无法恢复')}
                              showMoreOption={showMoreOption}
                              setFn={data => {
                                setIsRename(true);
                                setShowMoreOption(false);
                              }}
                              deleteFn={data => {
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
                            />
                          }
                        >
                          <Icon
                            icon="task-point-more"
                            className="moreActive Hand Font18 Gray_9e Hover_21"
                            onClick={() => {
                              setShowMoreOption(true);
                              setTemplateId(item.indexConfigId ? item.indexConfigId : item.systemIndexName);
                            }}
                          />
                        </Trigger>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <Drawer
          width={497}
          className="Absolute"
          zIndex={9}
          placement="right"
          onClose={() => setShowCreateIndex(false)}
          visible={showCreateIndex}
          maskClosable={false}
          getContainer={false}
          mask={false}
          closable={false}
        >
          {showCreateIndex && (
            <CreateIndex
              isEdit={isEdit}
              currentIndexInfo={currentIndexInfo}
              selectedIndexList={selectedIndexList}
              worksheetAvailableFields={worksheetAvailableFields}
              appId={appId}
              worksheetId={worksheetId}
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

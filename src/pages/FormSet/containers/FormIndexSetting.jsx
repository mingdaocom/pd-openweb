import React, { Fragment, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import CSSTransitionGroup from 'react-addons-css-transition-group';
import MoreOption from '../components/MoreOption';
import worksheetAjax from 'src/api/worksheet';
import { CreateIndex } from 'worksheet/common';
import { Support, Icon, LoadDiv } from 'ming-ui';
import styled from 'styled-components';
import cx from 'classnames';
import _ from 'lodash';

const Con = styled.div`
  width: 100%;
  height: 100%;
  background: #fff;
  position: relative !important;
  .setIndexList {
    width: 100%;
    height: 100%;
    overflow: auto;
    padding: 32px 40px;
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
    .contentBox {
      .templates {
        position: relative;
        margin-right: 16px;
        margin-top: 20px;
        margin-bottom: 4px;
        display: inline-block;
        border-radius: 3px;
        width: 300px;
        // height: 130px;
        background: #ffffff 0% 0% no-repeat padding-box;
        opacity: 1;
        .topBox {
          border-radius: 3px 3px 0px 0px;
          height: 40px;
          background: #f5f5f5 0% 0% no-repeat padding-box;
          padding: 0 15px;
          line-height: 40px;
          width: 100%;
          color: #333;
          display: flex;
          &.defaulteTem {
            background: #465a65;
          }
          .iconTitle {
            // margin-right: 6px;
            width: 16px;
            line-height: 40px;
          }
          span {
            flex: 1;
            padding: 0 12px;
            max-width: 100%;
            word-break: break-all;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          input {
            flex: 1;
            width: 100%;
            height: 25px;
            background: #ffffff 0% 0% no-repeat padding-box;
            border-radius: 2px;
            line-height: 25px;
            padding: 0px 12px;
            box-sizing: border-box;
            color: #333333;
            margin: 7px 0;
            border: 1px solid #2196f3;
          }

          .moreActive {
            line-height: 40px;
            margin-left: 6px;
          }
        }
        .con {
          border-bottom: 1px solid #dddddd;
          border-left: 1px solid #dddddd;
          border-right: 1px solid #dddddd;
          border-radius: 0px 0px 3px 3px;
          padding: 12px 15px;
          .content {
            display: flex;
            flex-wrap: wrap;
            height: 70px;
            overflow: scroll;
            .ruleItem {
              .rule{
                col
              }
            }
          }
          .activeCon {
            display: flex;
            justify-content: space-between;
            line-height: 24px;
            margin-top: 0px;
            .fail,
            .inLine {
              height: 24px;
              padding: 0 17px;
              border-radius: 12px;
              color: #f44336;
              background-color: #fbe9e7;
            }
            .opacity0{
              opacity: 0;
            }
            .edit {
              color: #2196f3;
              &:hover {
                opacity: 0.8;
              }
            }
          }
        }
      }
      .moreOptionTrigger {
        top: 30px;
        right: 7px;
        position: absolute;
        padding: 6px 0;
        background: #fff;
        box-shadow: 0px 4px 16px #0000003d;
        border-radius: 2px;
        z-index: 1;
        li {
          width: 120px;
          height: 36px;
          line-height: 36px;
          padding: 0 20px;
          box-sizing: border-box;
          color: #333;
          cursor: pointer;
          &:hover {
            background: #eaeaea;
          }
          &.red {
            color: red;
            &:hover {
              background: red;
              color: #fff;
            }
          }
        }
      }
    }
  }
`;

const MAX_COUNT = md.global.Config.IsLocal ? 10 : 5;
const sortRules = { 1: _l('升序'), '-1': _l('降序'), text: _l('文本索引') };
const FILTER_TYPE_LIST = [40, 42, 43, 21, 25, 45, 14, 34, 22, 10010, 30, 47, 49, 50, 51];

function FormIndexSetting(props) {
  const { worksheetId, appId } = props;
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
                <Support type={3} text={_l('帮助')} href="https://help.mingdao.com/sheet34" />
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
            <div className="contentBox">
              {indexList.map(item => {
                // 运维创建索引且非升降序、文本类型
                let notSystemIndexTypeList = [1, -1, 'text'];
                let isSpecial =
                  item.isSystem && item.indexFields.some(item => !_.includes(notSystemIndexTypeList, item.indexType));
                if (!isSpecial && item.isSystem) return '';
                return (
                  <div key={item.indexConfigId} className="templates">
                    <div className="topBox">
                      <Icon icon="db_index" className="iconTitle Font16 Gray_75" />
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
                        <span className="Bold"> {item.customeIndexName}</span>
                      )}
                      {
                        <Icon
                          icon="task-point-more"
                          className="moreActive Hand Font18 Gray_9e"
                          onClick={() => {
                            setShowMoreOption(true);
                            setTemplateId(item.indexConfigId ? item.indexConfigId : item.systemIndexName);
                          }}
                        />
                      }
                      {showMoreOption &&
                        (templateId === item.indexConfigId ||
                          (item.isSystem && templateId === item.systemIndexName)) && (
                          <MoreOption
                            disabledRename={item.isSystem}
                            delTxt={_l('删除索引')}
                            description={_l('确定删除索引吗？删除后将无法恢复')}
                            showMoreOption={showMoreOption}
                            onClickAwayExceptions={[]}
                            onClickAway={() => {
                              setShowMoreOption(false);
                            }}
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
                        )}
                    </div>
                    <div className="con">
                      <div className="content">
                        {(item.indexFields || []).map((it, i) => (
                          <div className="ruleItem" key={it.fieldId}>
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
                            {i < item.indexFields.length - 1 ? '，' : ''}
                          </div>
                        ))}
                      </div>
                      <div className="activeCon">
                        {item.indexStateId === 1 && item.uniqueIndex && (
                          <span className="Gray_9e">{_l('唯一索引')}</span>
                        )}
                        {item.indexStateId === -1 && <span className="fail">{_l('后台执行失败')}</span>}
                        {item.indexStateId === 0 && <span className="inLine">{_l('排队中')}</span>}
                        <span className="opacity0">{_l('占位')}</span>
                        {!isSpecial && (
                          <span
                            className="Hand mLeft24 edit"
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
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <CSSTransitionGroup
          transitionName="ViewConfigCreateCustomBtn"
          transitionEnterTimeout={500}
          transitionLeaveTimeout={300}
        >
          {showCreateIndex && (
            <CreateIndex
              isEdit={isEdit}
              currentIndexInfo={currentIndexInfo}
              selectedIndexList={selectedIndexList}
              worksheetAvailableFields={worksheetAvailableFields}
              getIndexesInfo={getIndexesInfo}
              indexList={indexList}
              onClose={() => {
                setShowCreateIndex(false);
              }}
              getFieldObjById={getFieldObjById}
            />
          )}
        </CSSTransitionGroup>
      </Con>
    </Fragment>
  );
}

export default connect(state => {
  const { worksheetId, worksheetInfo = {} } = state.formSet;
  const { appId } = worksheetInfo;
  return { worksheetId, appId };
})(FormIndexSetting);

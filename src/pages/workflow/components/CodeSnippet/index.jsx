import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { func, number, string } from 'prop-types';
import styled from 'styled-components';
import { LoadDiv, ScrollView, TagTextarea } from 'ming-ui';
import { Checkbox, Dropdown, Input, Modal, Radio } from 'ming-ui/antd-components';
import flowNodeAjax from '../../api/flowNode';
import { PERMISSION_ENUM } from 'src/utils/domain/security/permission';
import { checkPermission } from 'src/utils/services/security/permission';

const EditDialogContent = styled.div`
  .codeSnippetEditLabel {
    width: 180px;
  }
  .mRight90 {
    margin-right: 90px !important;
  }
`;

const DialogContent = styled.div`
  .codeSnippetHeader {
    border-bottom: 1px solid var(--color-border-primary);
    li {
      padding: 14px;
      font-size: 14px;
      cursor: pointer;
      position: relative;
      &:not(.active) {
        color: var(--color-text-title) !important;
      }
      &.active:after {
        position: absolute;
        bottom: -1px;
        left: 0;
        right: 0;
        content: '';
        height: 3px;
        background: var(--color-primary);
      }
    }
    .codeSnippetSearch {
      width: 220px;
    }
  }
  .codeSnippetLeft {
    padding: 16px 0;
    width: 240px;
    border-right: 1px solid var(--color-border-primary);
    .codeSnippetLangType {
      height: 36px;
      background: var(--color-background-secondary);
      border-radius: 9px;
      padding: 2px;
      text-align: center;
      margin-right: 20px;
      > div {
        cursor: pointer;
      }
      .active {
        height: 32px;
        background: var(--color-background-primary);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.16);
        border-radius: 7px;
        color: var(--color-primary);
      }
    }
    li {
      height: 36px;
      margin-right: 20px;
      padding-left: 15px;
      position: relative;
      cursor: pointer;
      &.active {
        background: var(--color-primary-transparent);
        color: var(--color-primary);
        &:after {
          width: 3px;
          height: 18px;
          background: var(--color-primary);
          border-radius: 4px;
          position: absolute;
          content: '';
          position: absolute;
          left: 4px;
          top: 9px;
        }
      }
      &:hover {
        background: var(--color-primary-transparent);
        color: var(--color-primary);
        .codeSnippetOperator {
          display: flex;
        }
      }
      .ellipsis {
        padding-right: 15px;
      }
      .codeSnippetOperator {
        width: 28px;
        height: 28px;
        border-radius: 4px;
        color: var(--color-text-secondary);
        margin-right: 4px;
        display: none;
        &:hover {
          background: var(--color-background-primary);
          color: var(--color-primary);
        }
        &.active {
          display: flex;
        }
      }
    }
  }
  .codeSnippetRight {
    padding: 16px 0 20px 16px;
    .tagInputareaIuput {
      border: none !important;
    }
  }
  .codeSnippetNull {
    width: 120px;
    height: 120px;
    background: var(--color-background-secondary);
    border-radius: 50%;
    font-size: 60px;
    color: var(--color-text-disabled);
  }
`;

export const CodeSnippetEdit = ({
  projectId,
  id = '',
  codeName = '',
  code,
  inputDatas,
  source = md.global.Account.accountId,
  type,
  onSave = () => {},
  onClose = () => {},
}) => {
  const [name, setName] = useState(codeName);
  const [position, setPosition] = useState(source);
  const hasAppResourceAuth = checkPermission(projectId, PERMISSION_ENUM.APP_RESOURCE_SERVICE);

  const save = () => {
    flowNodeAjax[id ? 'updateCodeTemplate' : 'createCodeTemplate'](
      {
        id,
        name,
        source: position,
        type: id ? undefined : type,
        code,
        inputDatas,
      },
      {
        isWorkflow: true,
      },
    ).then(res => {
      if (res) {
        onSave({ id: id || res.id, name, source: position });
      }
    });
  };

  return (
    <Modal
      open
      mask={{ closable: false }}
      width={640}
      title={id ? _l('编辑代码片段') : _l('保存代码片段')}
      onOk={() => {
        if (!name.trim()) {
          alert(_l('代码片段名称不能为空'), 2);
          return;
        }

        save();
      }}
      onCancel={onClose}
    >
      <EditDialogContent>
        <div className="flexRow alignItemsCenter">
          <div className="codeSnippetEditLabel">{_l('代码片段名称')}</div>
          <Input className="flex" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="flexRow alignItemsCenter mTop30">
          <div className="codeSnippetEditLabel">{_l('保存到')}</div>
          <div className="flex flexRow minHeight0">
            {[
              { text: _l('个人'), value: md.global.Account.accountId },
              {
                text: _l('组织'),
                value: projectId,
                disabled: !hasAppResourceAuth,
              },
            ].map(item => {
              return (
                <Radio
                  key={item.value}
                  disabled={item.disabled}
                  className="mRight90"
                  checked={position === item.value}
                  onChange={() => setPosition(item.value)}
                  title={item.text}
                >
                  {item.text}
                </Radio>
              );
            })}
          </div>
        </div>
      </EditDialogContent>
    </Modal>
  );
};

const TITLE = {
  0: _l('选择代码片段'),
  1: _l('插入JavaScript代码片段'),
  2: _l('插入Python代码片段'),
};
const TYPES = [
  { text: _l('系统预设'), value: 1 },
  { text: _l('组织'), value: 2 },
  { text: _l('个人'), value: 3 },
];

const CodeSnippet = ({ projectId, type = 0, onSave = () => {}, onClose = () => {} }) => {
  const [tabIndex, setTabIndex] = useState(window.platformENV.isOverseas || window.platformENV.isLocal ? 2 : 1);
  const [keywords, setKeywords] = useState('');
  const [langType, setLangType] = useState(type === 2 ? '103' : '102');
  const [clearParams, setParams] = useState(false);
  const [popupVisibleId, setPopupVisibleId] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [selectId, setSelectId] = useState('');
  const [editCodeId, setEditCodeId] = useState('');
  const tagtextarea = useRef(null);
  const requestIdRef = useRef(0);
  const loadingRequestRef = useRef(false);
  const hasAppResourceAuth = checkPermission(projectId, PERMISSION_ENUM.APP_RESOURCE_SERVICE);

  if (window.platformENV.isOverseas || window.platformENV.isLocal) {
    _.remove(TYPES, o => o.value === 1);
  }

  const updateKeywords = useMemo(
    () =>
      _.debounce(value => {
        setKeywords(value);
      }, 300),
    [],
  );

  useEffect(() => () => updateKeywords.cancel(), [updateKeywords]);

  const deleteCode = ({ id, name }) => {
    Modal.confirm({
      title: <span className="textError">{_l('您确定要删除片段“%0”吗？', name)}</span>,
      content: _l('删除后将无法恢复'),
      okText: _l('删除'),
      okButtonProps: { danger: true },
      onOk: () => {
        flowNodeAjax
          .updateCodeTemplate(
            {
              id,
              deleted: true,
            },
            {
              isWorkflow: true,
            },
          )
          .then(res => {
            if (res) {
              alert(_l('删除成功'));
              removeTemplateItem(id);
            }
          });
      },
    });
  };

  const removeTemplateItem = id => {
    const newData = data.filter(item => item.id !== id);
    setData(newData);
    setSelectId(newData.length ? newData[0].id : '');
  };

  const getCodeTemplateList = useCallback(
    (nextPageIndex, { force = false } = {}) => {
      if (loadingRequestRef.current && !force) return Promise.resolve();
      const requestId = ++requestIdRef.current;
      loadingRequestRef.current = true;
      setLoading(true);

      return flowNodeAjax
        .getCodeTemplateList(
          {
            keyword: keywords,
            pageIndex: nextPageIndex,
            pageSize: 50,
            source: tabIndex === 1 ? '' : tabIndex === 2 ? projectId : md.global.Account.accountId,
            type: langType,
          },
          {
            isWorkflow: true,
          },
        )
        .then(res => {
          if (requestId !== requestIdRef.current) return;
          setPageIndex(nextPageIndex);
          setHasMore(res.length === 50);
          setData(currentData => (nextPageIndex === 1 ? res : currentData.concat(res)));
          if (nextPageIndex === 1) setSelectId(res[0]?.id || '');
        })
        .catch(() => {})
        .finally(() => {
          if (requestId !== requestIdRef.current) return;
          loadingRequestRef.current = false;
          setLoading(false);
        });
    },
    [keywords, langType, projectId, tabIndex],
  );

  const onScroll = () => {
    if (hasMore && !loading) {
      return getCodeTemplateList(pageIndex + 1);
    }
  };

  useEffect(() => {
    getCodeTemplateList(1, { force: true });
  }, [getCodeTemplateList]);

  useEffect(() => {
    if (tagtextarea.current) {
      tagtextarea.current.setValue(selectId ? (_.find(data, o => o.id === selectId) || {}).code : '');
    }
  }, [data, selectId]);

  return (
    <Modal
      open
      mask={{ closable: false }}
      type="fixed"
      width={1000}
      title={TITLE[type]}
      styles={{ body: { paddingBottom: 0 } }}
      onCancel={onClose}
      onOk={() => {
        const selectItem = _.find(data, o => o.id === selectId) || {};

        onSave({
          actionId: langType,
          clearParams,
          inputData: selectItem.inputData,
          code: selectItem.code,
        });
      }}
      okButtonProps={{ disabled: !selectId }}
      footerLeftElement={
        type !== 0 && !!data.length ? (
          <Checkbox checked={clearParams} onChange={event => setParams(event.target.checked)}>
            {_l('使用时清空现有input参数与代码块')}
          </Checkbox>
        ) : null
      }
    >
      <DialogContent className="flexColumn h100">
        <div className="flexRow codeSnippetHeader alignItemsCenter">
          <ul className="flexRow">
            {TYPES.map((item, index) => {
              return (
                <li
                  key={index}
                  className={cx({ 'colorPrimary active': tabIndex === item.value })}
                  onClick={() => {
                    setData([]);
                    setTabIndex(item.value);
                  }}
                >
                  <span className="bold">{item.text}</span>
                </li>
              );
            })}
          </ul>
          <div className="flex" />
          <Input
            allowClear
            className="codeSnippetSearch"
            radius
            variant="filled"
            placeholder={_l('搜索')}
            prefix={<i className="icon-search Font16 textSecondary" />}
            onChange={e => updateKeywords(e.target.value)}
          />
        </div>
        <div className="flex flexRow minHeight0">
          <div className="codeSnippetLeft flexColumn minHeight0">
            {type === 0 && (
              <div className="codeSnippetLangType flexRow alignItemsCenter mBottom16">
                {[
                  { text: 'JavaScript', value: '102' },
                  { text: 'Python', value: '103' },
                ].map(item => (
                  <div
                    key={item.value}
                    className={cx('flex flexRow alignItemsCenter justifyContentCenter', {
                      active: langType === item.value,
                    })}
                    onClick={() => {
                      setData([]);
                      setLangType(item.value);
                    }}
                  >
                    {item.text}
                  </div>
                ))}
              </div>
            )}

            <ScrollView className="flex" onScrollEnd={onScroll}>
              <ul>
                {data.map(item => {
                  return (
                    <li
                      key={item.id}
                      className={cx('flexRow alignItemsCenter', { active: item.id === selectId })}
                      onClick={() => setSelectId(item.id)}
                    >
                      <div className="ellipsis flex">{item.name}</div>
                      {(tabIndex === 3 || (tabIndex === 2 && hasAppResourceAuth)) && (
                        <Dropdown
                          open={popupVisibleId === item.id}
                          onOpenChange={open => {
                            setPopupVisibleId(open ? item.id : '');
                          }}
                          trigger={['click']}
                          placement="bottomLeft"
                          menu={{
                            onClick: ({ domEvent }) => domEvent.stopPropagation(),
                            style: { minWidth: 180 },
                            items: [
                              {
                                key: 'edit',
                                label: _l('编辑'),
                                onClick: () => {
                                  setPopupVisibleId('');
                                  setEditCodeId(item.id);
                                },
                              },
                              {
                                key: 'delete',
                                label: _l('删除'),
                                onClick: () => {
                                  setPopupVisibleId('');
                                  deleteCode(item);
                                },
                              },
                            ],
                          }}
                        >
                          <div
                            className={cx('codeSnippetOperator flexRow alignItemsCenter justifyContentCenter', {
                              active: popupVisibleId === item.id,
                            })}
                          >
                            <i className="icon-moreop Font16" />
                          </div>
                        </Dropdown>
                      )}
                    </li>
                  );
                })}
              </ul>
              {loading && <LoadDiv className="mTop10" />}
            </ScrollView>
          </div>
          <div className="codeSnippetRight flex flexColumn minHeight0">
            {!data.length ? (
              <div className="flex flexColumn alignItemsCenter justifyContentCenter">
                <div className="codeSnippetNull flexRow alignItemsCenter justifyContentCenter">
                  <i className="icon-url" />
                </div>
                <div className="mTop20">
                  {keywords ? (
                    <Fragment>
                      {_l('未搜索到')}
                      <span className="colorPrimary"> "{keywords}" </span>
                      {_l('相关的代码片段')}
                    </Fragment>
                  ) : (
                    _l('无代码片段')
                  )}
                </div>
              </div>
            ) : (
              <ScrollView className="flex">
                <TagTextarea
                  defaultValue={selectId ? (_.find(data, o => o.id === selectId) || {}).code : ''}
                  codeMirrorMode="javascript"
                  getRef={tag => (tagtextarea.current = tag)}
                  lineNumbers
                  readonly
                  maxHeight
                />
              </ScrollView>
            )}
          </div>
        </div>
      </DialogContent>

      {!!editCodeId && (
        <CodeSnippetEdit
          projectId={projectId}
          id={editCodeId}
          codeName={data.find(item => item.id === editCodeId).name}
          source={data.find(item => item.id === editCodeId).source}
          onSave={({ id, name, source }) => {
            setEditCodeId('');

            // 不是当前分组的移除
            if (
              (source === md.global.Account.accountId && tabIndex !== 3) ||
              (source === projectId && tabIndex !== 2)
            ) {
              removeTemplateItem(id);
            } else {
              setData(
                data.map(item => {
                  if (item.id === id) {
                    item.name = name;
                  }

                  return item;
                }),
              );
            }
          }}
          onClose={() => setEditCodeId('')}
        />
      )}
    </Modal>
  );
};

CodeSnippet.propTypes = {
  projectId: string.isRequired,
  type: number, // 0: 全部 1: javascript 2: python
  onSave: func,
  onClose: func,
};

export default CodeSnippet;

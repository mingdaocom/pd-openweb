import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { func, number, string } from 'prop-types';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Button, Checkbox, Dialog, LoadDiv, Menu, MenuItem, Radio, ScrollView, TagTextarea } from 'ming-ui';
import flowNodeAjax from '../../api/flowNode';
import { checkPermission } from 'src/components/checkPermission';
import { PERMISSION_ENUM } from 'src/pages/Admin/enum';
import './index.less';

const EditDialogBox = styled(Dialog)`
  .codeSnippetEditLabel {
    width: 180px;
  }
  input {
    border: 1px solid #ddd;
    padding: 9px 12px;
    height: 36px;
    line-height: 18px;
    border-radius: 3px;
    &:focus {
      border-color: #1677ff;
    }
  }
  .mRight90 {
    margin-right: 90px !important;
  }
`;

const DialogBox = styled(Dialog)`
  .mui-dialog-body {
    padding-bottom: 0 !important;
  }
  .codeSnippetHeader {
    border-bottom: 1px solid #ddd;
    li {
      padding: 14px;
      font-size: 14px;
      cursor: pointer;
      position: relative;
      &:not(.active) {
        color: #151515 !important;
      }
      &.active:after {
        position: absolute;
        bottom: -1px;
        left: 0;
        right: 0;
        content: '';
        height: 3px;
        background: #1677ff;
      }
    }
    .codeSnippetSearch {
      position: relative;
      .icon-search {
        position: absolute;
        top: 8px;
        left: 10px;
      }
      .icon-cancel {
        position: absolute;
        top: 8px;
        right: 10px;
        cursor: pointer;
      }
      input {
        width: 220px;
        height: 32px;
        line-height: 18px;
        background: #f5f5f5;
        border-radius: 16px;
        padding: 7px 32px 7px 32px;
        border: none;
      }
    }
  }
  .codeSnippetLeft {
    padding: 16px 0;
    width: 240px;
    border-right: 1px solid #ddd;
    .codeSnippetLangType {
      height: 36px;
      background: #f5f5f5;
      border-radius: 9px;
      padding: 2px;
      text-align: center;
      margin-right: 20px;
      > div {
        cursor: pointer;
      }
      .active {
        height: 32px;
        background: #fff;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.16);
        border-radius: 7px;
        color: #1677ff;
      }
    }
    li {
      height: 36px;
      margin-right: 20px;
      padding-left: 15px;
      position: relative;
      cursor: pointer;
      &.active {
        background: rgba(33, 150, 243, 0.08);
        color: #1677ff;
        &:after {
          width: 3px;
          height: 18px;
          background: #1677ff;
          border-radius: 4px;
          position: absolute;
          content: '';
          position: absolute;
          left: 4px;
          top: 9px;
        }
      }
      &:hover {
        background: rgba(33, 150, 243, 0.08);
        color: #1677ff;
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
        color: #757575;
        margin-right: 4px;
        display: none;
        &:hover {
          background: #fff;
          color: #1677ff;
        }
        &.active {
          display: flex;
        }
      }
      .Menu.ming {
      }
    }
  }
  .codeSnippetRight {
    padding: 16px 0 20px 16px;
    .tagInputareaIuput {
      border: none !important;
    }
  }
  .codeSnippetFooter {
  }
  .codeSnippetNull {
    width: 120px;
    height: 120px;
    background: #f5f5f5;
    border-radius: 50%;
    font-size: 60px;
    color: #bdbdbd;
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
    <EditDialogBox
      visible
      overlayClosable={false}
      width={640}
      title={id ? _l('编辑代码片段') : _l('保存代码片段')}
      handleClose={onClose}
      onOk={() => {
        if (!name.trim()) {
          alert(_l('代码片段名称不能为空'), 2);
          return;
        }

        save();
      }}
      onCancel={onClose}
    >
      <div className="flexRow alignItemsCenter">
        <div className="codeSnippetEditLabel">{_l('代码片段名称')}</div>
        <input type="text" className="flex" value={name} onChange={e => setName(e.target.value)} />
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
                text={item.text}
                onClick={() => setPosition(item.value)}
              />
            );
          })}
        </div>
      </div>
    </EditDialogBox>
  );
};

const CodeSnippet = ({ projectId, type = 0, onSave = () => {}, onClose = () => {} }) => {
  const [tabIndex, setTabIndex] = useState(md.global.Config.IsLocal ? 2 : 1);
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
  const inputName = useRef(null);
  const tagtextarea = useRef(null);
  const hasAppResourceAuth = checkPermission(projectId, PERMISSION_ENUM.APP_RESOURCE_SERVICE);

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

  if (md.global.Config.IsLocal) {
    _.remove(TYPES, o => o.value === 1);
  }

  const updateKeywords = useMemo(
    () =>
      _.debounce(value => {
        setKeywords(value);
      }, 300),
    [],
  );

  const deleteCode = ({ id, name }) => {
    Dialog.confirm({
      className: 'deleteCodeSnippet',
      title: _l('您确定要删除片段“%0”吗？', name),
      description: _l('删除后将无法恢复'),
      okText: _l('删除'),
      onOk: () => {
        flowNodeAjax
          .updateCodeTemplate(
            { id, deleted: true },
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

  const getCodeTemplateList = pageIndex => {
    setLoading(true);

    flowNodeAjax
      .getCodeTemplateList(
        {
          keyword: keywords,
          pageIndex,
          pageSize: 50,
          source: tabIndex === 1 ? '' : tabIndex === 2 ? projectId : md.global.Account.accountId,
          type: langType,
        },
        {
          isWorkflow: true,
        },
      )
      .then(res => {
        setPageIndex(pageIndex);
        setHasMore(res.length === 50);
        setLoading(false);
        setData(pageIndex === 1 ? res : data.concat(res));
        pageIndex === 1 && !!res.length && setSelectId(res[0].id);
      });
  };

  const onScroll = () => {
    if (hasMore && !loading) {
      getCodeTemplateList(pageIndex + 1);
    }
  };

  useEffect(() => {
    setSelectId('');
    getCodeTemplateList(1);
  }, [tabIndex, keywords, langType]);

  useEffect(() => {
    if (tagtextarea.current) {
      tagtextarea.current.setValue(selectId ? (_.find(data, o => o.id === selectId) || {}).code : '');
    }
  }, [selectId]);

  return (
    <DialogBox
      visible
      overlayClosable={false}
      type="fixed"
      width={1000}
      title={TITLE[type]}
      handleClose={onClose}
      showFooter={false}
    >
      <div className="flexColumn h100">
        <div className="flexRow codeSnippetHeader alignItemsCenter">
          <ul className="flexRow">
            {TYPES.map((item, index) => {
              return (
                <li
                  key={index}
                  className={cx({ 'ThemeColor3 active': tabIndex === item.value })}
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
          <div className="codeSnippetSearch">
            <i className="icon-search Font16 Gray_75"></i>
            <input
              type="text"
              placeholder={_l('搜索')}
              ref={inputName}
              onChange={e => updateKeywords(e.target.value)}
            />
            {keywords && (
              <i
                className="icon-cancel Font16 Gray_75 ThemeHoverColor3"
                onClick={() => {
                  setKeywords('');
                  inputName.current.value = '';
                }}
              />
            )}
          </div>
        </div>
        <div className="flex flexRow">
          <div className="codeSnippetLeft flexColumn">
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
                        <Trigger
                          popupVisible={popupVisibleId === item.id}
                          onPopupVisibleChange={visible => {
                            setPopupVisibleId(visible ? item.id : '');
                          }}
                          action={['click']}
                          popup={() => {
                            return (
                              <Menu>
                                <MenuItem
                                  onClick={() => {
                                    setPopupVisibleId('');
                                    setEditCodeId(item.id);
                                  }}
                                >
                                  {_l('编辑')}
                                </MenuItem>
                                <MenuItem
                                  onClick={() => {
                                    setPopupVisibleId('');
                                    deleteCode(item);
                                  }}
                                >
                                  {_l('删除')}
                                </MenuItem>
                              </Menu>
                            );
                          }}
                          popupAlign={{
                            points: ['tl', 'bl'],
                            offset: [1, 1],
                            overflow: { adjustX: true, adjustY: true },
                          }}
                        >
                          <div
                            className={cx('codeSnippetOperator flexRow alignItemsCenter justifyContentCenter', {
                              active: popupVisibleId === item.id,
                            })}
                          >
                            <i className="icon-moreop Font16" />
                          </div>
                        </Trigger>
                      )}
                    </li>
                  );
                })}
              </ul>
              {loading && <LoadDiv className="mTop10" />}
            </ScrollView>
          </div>
          <div className="codeSnippetRight flex flexColumn">
            {!data.length ? (
              <div className="flex flexColumn alignItemsCenter justifyContentCenter">
                <div className="codeSnippetNull flexRow alignItemsCenter justifyContentCenter">
                  <i className="icon-url" />
                </div>
                <div className="mTop20">
                  {keywords ? (
                    <Fragment>
                      {_l('未搜索到')}
                      <span className="ThemeColor3"> "{keywords}" </span>
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

            <div className="codeSnippetFooter mTop20 flexRow alignItemsCenter">
              {type !== 0 && !!data.length && (
                <Checkbox
                  className="InlineBlock"
                  text={_l('使用时清空现有input参数与代码块')}
                  checked={clearParams}
                  onClick={checked => setParams(!checked)}
                />
              )}
              <div className="flex" />
              <Button type="link" onClick={onClose}>
                {_l('取消')}
              </Button>
              <Button
                className="mLeft15"
                type="primary"
                disabled={!selectId}
                onClick={() => {
                  const selectItem = _.find(data, o => o.id === selectId) || {};

                  onSave({
                    actionId: langType,
                    clearParams,
                    inputData: selectItem.inputData,
                    code: selectItem.code,
                  });
                }}
              >
                {_l('确认')}
              </Button>
            </div>
          </div>
        </div>
      </div>

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
    </DialogBox>
  );
};

CodeSnippet.propTypes = {
  projectId: string.isRequired,
  type: number, // 0: 全部 1: javascript 2: python
  onSave: func,
  onClose: func,
};

export default CodeSnippet;

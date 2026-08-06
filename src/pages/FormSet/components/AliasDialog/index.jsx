import React, { useCallback, useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Dialog, Icon, Support } from 'ming-ui';
import sheetAjax from 'src/api/worksheet';
import { ALL_SYS } from 'src/pages/widgetConfig/config/widget.js';
import { VIEW_DISPLAY_TYPE, VIEW_TYPE_ICON } from 'src/pages/worksheet/constants/enum';
import './index.less';

const CONFIG = {
  control: {
    title: _l('设置字段别名'),
    desc: _l('字段别名仅允许使用字母（不区分大小写）、数字和下划线组合，且必须以字母开头，不可重复。'),
    helpLink: 'https://help.mingdao.com/worksheet/field-property/#syestem-field-alias',
  },
  view: {
    title: _l('设置视图别名'),
    desc: _l('视图别名仅允许使用字母（不区分大小写）、数字和下划线组合，且必须以字母开头，不可重复。'),
    helpLink: 'https://help.mingdao.com/worksheet/field-property/#syestem-field-alias',
  },
};

export default function AliasDialog(props) {
  const { onClose, data = [], worksheetId, appId, controlTypeList: controlTypeListProp = [], type = 'control' } = props;
  const isEditControl = type === 'control';

  const [focusId, setFocusId] = useState('');
  const [aliasData, setAliasData] = useState([]);
  const [isChange, setIsChange] = useState(false);
  const [originalData, setOriginalData] = useState([]);
  const [isUpdate, setIsUpdate] = useState(false);
  const [isError, setIsError] = useState(false);
  const [controlTypeList, setControlTypeList] = useState(controlTypeListProp);
  const inputRef = useRef(null);
  const mountedRef = useRef(false);
  const initializedRef = useRef(false);
  const loadingRef = useRef(false);

  // 用于在回调中读取最新的 aliasData / originalData / isChange / isError
  const stateRef = useRef({});
  stateRef.current = { aliasData, originalData, isChange, isError };

  useEffect(() => {
    mountedRef.current = true;

    if (!initializedRef.current) {
      initializedRef.current = true;

      if (isEditControl) {
        if (data.length <= 0) {
          sheetAjax.getWorksheetInfo({ worksheetId, getTemplate: true, getViews: true }).then(res => {
            if (!mountedRef.current) return;

            const controls = res.template?.controls || [];
            const controlsList = controls.filter(item => !_.includes(ALL_SYS, item.controlId));
            setAliasData(controlsList);
            setOriginalData(controlsList);
          });
        } else {
          const controlsList = data.filter(item => !_.includes(ALL_SYS, item.controlId));
          setAliasData(controlsList);
          setOriginalData(controlsList);
        }

        if (controlTypeListProp.length <= 0) {
          sheetAjax.getWorksheetApiInfo({ worksheetId, appId }).then(res => {
            if (!mountedRef.current) return;

            setControlTypeList(res[0]?.controls || []);
          });
        }
      } else {
        setAliasData(data);
        setOriginalData(data);
      }
    }

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const onBatchGenerate = useCallback(() => {
    if (loadingRef.current) return;

    Dialog.confirm({
      title: _l('确定批量生成别名？'),
      description: isEditControl
        ? _l('根据字段名的拼音自动生成别名，若字段名为英文则直接取字段名作为别名，此操作不会影响已设置的别名。')
        : _l('根据视图名的拼音自动生成别名，若视图名为英文则直接取视图名作为别名，此操作不会影响已设置的别名。'),
      onOk: () => {
        loadingRef.current = true;
        sheetAjax[isEditControl ? 'editGenerateControlsDefaultAlias' : 'editGenerateViewDefaultAlias'](
          isEditControl ? { worksheetId, appId } : { worksheetId },
        )
          .then(res => {
            if (!mountedRef.current) return;

            setAliasData(res.data.controls || res.data);
            setIsUpdate(true);
          })
          .catch(() => {
            if (mountedRef.current) {
              alert(_l('生成失败'), 2);
            }
          })
          .finally(() => {
            loadingRef.current = false;
          });
      },
    });
  }, [worksheetId, appId, isEditControl]);

  const onChangeAlias = useCallback(
    (value, item) => {
      const newAliasData = (aliasData || []).map(o =>
        (isEditControl ? item.controlId === o.controlId : item.viewId === o.viewId) ? { ...o, alias: value } : o,
      );
      const hasError =
        value && (newAliasData.filter(o => value === o.alias).length > 1 || !/^[a-zA-Z]{1}\w*$/.test(value));
      setIsChange(true);
      setAliasData(newAliasData);
      setIsError(hasError);
    },
    [isEditControl, aliasData],
  );

  const onSaveAlias = useCallback(
    item => {
      const {
        aliasData: curAliasData,
        originalData: curOriginalData,
        isChange: curIsChange,
        isError: curIsError,
      } = stateRef.current;

      setFocusId('');

      if (!curIsChange) return;

      if (item.alias && (curAliasData.filter(o => item.alias === o.alias).length > 1 || ALL_SYS.includes(item.alias))) {
        setIsChange(false);
        setAliasData(curOriginalData);
        setIsError(false);
        alert(ALL_SYS.includes(item.alias) ? _l('该别名与系统字段的别名相同，请重新输入') : _l('该别名已存在'), 2);
        return;
      }

      if ((item.alias && !/^[a-zA-Z]{1}\w*$/.test(item.alias)) || curIsError) {
        setIsChange(false);
        setAliasData(curOriginalData);
        setIsError(false);
        return;
      }

      setIsChange(false);
      const params = isEditControl
        ? { worksheetId, appId, controls: [_.pick(item, ['controlId', 'alias'])] }
        : { worksheetId, views: [_.pick(item, ['viewId', 'alias'])] };

      sheetAjax[isEditControl ? 'editControlsAlias' : 'editViewAlias'](params)
        .then(res => {
          if (!mountedRef.current) return;

          if (res.code === 15) {
            setAliasData(curOriginalData);
            alert(_l('该别名与系统字段的别名相同，请重新输入'), 2);
          } else {
            setOriginalData(curAliasData);
            setIsUpdate(true);
          }
        })
        .catch(() => {
          if (mountedRef.current) {
            alert(_l('修改失败'), 2);
          }
        });
    },
    [worksheetId, appId, isEditControl],
  );

  return (
    <Dialog
      visible={true}
      className="aliasDialog"
      width={720}
      onCancel={() => onClose(isUpdate, aliasData)}
      footer={null}
      title={CONFIG[type].title}
    >
      <p className="text">
        {CONFIG[type].desc}
        <Support type={3} href={CONFIG[type].helpLink} text={_l('了解更多')} />
      </p>
      <div className="tableAlias">
        <div className="topDiv">
          <span>{isEditControl ? _l('字段名称') : _l('视图名称')}</span>
          <span>{_l('类型')}</span>
          <span>
            {isEditControl ? _l('字段别名') : _l('视图别名')}
            <i className="batchAlias mLeft10 InlineBlock Hand" onClick={onBatchGenerate}>
              {_l('批量生成')}
            </i>
          </span>
        </div>
        {aliasData.map((item, i) => {
          const controlType = _.get(controlTypeList, `${i}.type`) || '';
          const displayType = isEditControl
            ? controlType
            : _.find(VIEW_TYPE_ICON, { id: VIEW_DISPLAY_TYPE[controlTypeList[i]?.type] })?.text;

          return (
            <div className="listDiv" key={isEditControl ? item.controlId : item.viewId}>
              <span className="breakAll">{isEditControl ? item.controlName : item.name}</span>
              <span>{displayType}</span>
              <span
                className={cx('aliasBox', {
                  onFocusSpan: focusId === (isEditControl ? item.controlId : item.viewId),
                  isError,
                })}
              >
                {focusId !== (isEditControl ? item.controlId : item.viewId) ? (
                  <span
                    className="aliasTxt"
                    onClick={() => {
                      const id = isEditControl ? item.controlId : item.viewId;
                      setFocusId(id);
                      setTimeout(() => $(inputRef.current).focus(), 0);
                    }}
                  >
                    <span className={cx('txt', { noData: !item.alias })}>{item.alias || _l('请输入别名')}</span>
                    <Icon icon="edit_17" />
                  </span>
                ) : (
                  <input
                    ref={inputRef}
                    type="text"
                    value={item.alias}
                    onChange={e => onChangeAlias(e.target.value, item)}
                    onBlur={() => onSaveAlias(item)}
                  />
                )}
              </span>
            </div>
          );
        })}
      </div>
    </Dialog>
  );
}

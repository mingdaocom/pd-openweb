import React, { useRef, useEffect } from 'react';
import { Icon, ScrollView } from 'ming-ui';
import AliasDialog from '../components/AliasDialog';
import cx from 'classnames';
import './alias.less';
import sheetAjax from 'src/api/worksheet';
import { ALL_SYS } from 'src/pages/widgetConfig/config/widget.js';
import _ from 'lodash';
import { useSetState } from 'react-use';

export default function Alias(props) {
  const { match = {}, onChange } = props;
  const { worksheetId = '' } = match.params || {};
  const [state, setState] = useSetState({
    loading: true,
    worksheetInfo: props.worksheetInfo || {},
    name: '记录',
    nameFocus: false,
    showAliasDialog: false,
    btnname: '',
  });

  const { name, nameFocus, showAliasDialog, worksheetInfo = {}, btnname } = state;
  const { projectId = '', appId = '' } = worksheetInfo;

  useEffect(() => {
    init(props);
  }, [props]);

  const init = nextProps => {
    const { worksheetInfo = {} } = nextProps;
    setState({
      worksheetInfo: nextProps.worksheetInfo || {},
      name: worksheetInfo.entityName || _l('记录'),
      btnname: _.get(worksheetInfo, 'advancedSetting.btnname'),
      nameFocus: false,
    });
  };

  const onChangeSetting = data => {
    const { advancedSetting = {} } = worksheetInfo;
    let newValues = { ...advancedSetting, ...data };
    setState({ worksheetInfo: { ...worksheetInfo, advancedSetting: newValues } });
    sheetAjax
      .editWorksheetSetting({ workSheetId: worksheetId, appId, advancedSetting: data, editAdKeys: Object.keys(data) })
      .then(res => {
        if (!res) {
          alert(_l('修改失败，请稍后再试'), 2);
          return;
        } else {
          onChange({ ...worksheetInfo, advancedSetting: newValues });
        }
      });
  };

  const changeEntityName = () => {
    if (!name) {
      setState({ name: '记录' });
    }
    setState({ nameFocus: false });
    sheetAjax
      .updateEntityName({ worksheetId: worksheetId, entityName: name, projectId })
      .then(data => {
        onChange({ ...worksheetInfo, entityName: name });
      })
      .catch(err => alert(_l('修改失败'), 2));
  };

  const changeAlias = e => {
    sheetAjax.updateWorksheetAlias({ appId, worksheetId, alias: e.target.value.trim() }).then(res => {
      //0:成功 1：失败 2：别名重复 3：格式不匹配
      if (res === 0) {
        setState({ alias: e.target.value.trim() });
      } else if (res === 3) {
        alert(_l('工作表别名格式不匹配'), 3);
      } else if (res === 2) {
        alert(_l('工作表别名已存在，请重新输入'), 3);
      } else {
        alert(_l('别名修改失败'), 3);
      }
    });
  };

  const changeNotes = e => {
    const value = e.target.value.trim();
    sheetAjax.editDeveloperNotes({ worksheetId, developerNotes: value }).then(res => {
      if (res) {
        onChange({ ...worksheetInfo, developerNotes: value });
      } else {
        alert(_l('开发者备注修改失败'), 3);
      }
    });
  };

  return (
    <React.Fragment>
      <ScrollView>
        <div className="aliasCon">
          <div className="conBox">
            <h5>{_l('记录名称')}</h5>
            <p>
              {_l('设置在添加按钮，消息通知等需要指代记录时所使用的名称，如：可以修改“客户管理”表的记录名称为“客户”。')}
            </p>
            <input
              type="text"
              className="name mTop6"
              placeholder={_l('请输入')}
              value={name}
              onFocus={() => setState({ nameFocus: true })}
              onBlur={changeEntityName}
              onChange={e => setState({ name: e.target.value })}
            />
            <h6 className="Font14 mTop24">{_l('新建按钮名称')}</h6>
            <p>{_l('设置新建记录时的按钮名称，未设置时默认使用记录名称')}</p>
            <input
              type="text"
              className="name mTop6"
              placeholder={name || _l('请输入')}
              value={btnname}
              onChange={e => setState({ btnname: e.target.value })}
              onBlur={e => onChangeSetting({ btnname: e.target.value.trim() })}
            />
            <div className="preview mTop18">
              <div className="btn">
                <span className="title WordBreak">{_l('按钮预览')}</span>
                <span className="btnCon TxtTop WordBreak">
                  <Icon icon="plus" className="mRight8" />
                  <span className="Bold">{(btnname || '').trim() || name}</span>
                </span>
              </div>
              <div className="notice mTop18">
                <span className="title WordBreak">{_l('通知预览')}</span>
                <span className="noticeCon">
                  <span className="appIcon">
                    <Icon icon="workbench" className="Font18" />
                  </span>
                  <span className="textCon">
                    <span className="text">
                      {_l('应用消息:您已被')}
                      <span className="">@{_l('刘兰')}</span>
                      {_l('添加为')}
                      <b className={cx('Normal', { nameFocus })}>{name}</b>：
                      <span className="">{_l('销售线索管理')}</span>
                      {_l('的负责人')}
                    </span>
                    <span className="time mTop20 Block">2020-05-09 10:21:35</span>
                  </span>
                </span>
              </div>
            </div>
            <span className="line"></span>
            <h5 className="Font17">{_l('工作表/字段别名')}</h5>
            <p>{_l('通过设置工作表和字段别名，使得它们在API、webhook、自定义打印等场景使用的时候更具有辨识度。')}</p>
            <h6 className="Font14 mTop24">{_l('工作表别名')}</h6>
            <input
              type="text"
              className="name mTop6"
              placeholder={_l('请输入')}
              defaultValue={worksheetInfo.alias}
              onBlur={changeAlias}
            />
            <h6 className="Font14 mTop24">{_l('字段别名')}</h6>
            <div className="btnAlias mTop6" onClick={() => setState({ showAliasDialog: !showAliasDialog })}>
              {_l('设置字段别名')}
            </div>
            <span className="line"></span>
            <h5 className="Font17">{_l('开发者备注')}</h5>
            <p>{_l('设置开发者备注，仅应用管理员、开发者和API中可见')}</p>
            <h6 className="Font14 mTop24">{_l('开发者备注')}</h6>
            <input
              type="text"
              className="name mTop6"
              placeholder={_l('请输入')}
              defaultValue={worksheetInfo.developerNotes}
              onBlur={changeNotes}
            />
          </div>
        </div>
      </ScrollView>
      {showAliasDialog && (
        <AliasDialog
          showAliasDialog={showAliasDialog}
          controls={(_.get(worksheetInfo, 'template.controls') || []).filter(it => !ALL_SYS.includes(it.controlId))}
          worksheetId={worksheetId}
          appId={appId}
          setFn={data => {
            setState({
              ...data,
            });
            if (data.controls) {
              onChange({
                ...worksheetInfo,
                template: { ...(worksheetInfo || {}).template, controls: (data || {}).controls },
              });
            }
          }}
        />
      )}
    </React.Fragment>
  );
}

import React, { useState, useRef } from 'react';
import { Input, Tooltip } from 'antd';
import AutoIcon from '../../../components/Icon';
import _ from 'lodash';
import ClipboardButton from 'react-clipboard.js';
import worksheetAjax from 'src/api/worksheet';
import Options from './Options';
import { SettingItem, EditOptionDialog } from '../../../styled';
import { getDefaultOptions } from '../../../util/setting';
import DeleteDialog from './DelateDialog';
import DeleteOptionList from 'src/pages/AppSettings/components/AllOptionList/DeleteOptionList';
import { checkOptionsRepeat } from '../../../util';

export default function EditOptionList(props) {
  const { onOk, options = [], globalSheetInfo = {}, onCancel, worksheetIds = [], ...rest } = props;
  const appId = props.appId || globalSheetInfo.appId;
  const $ref = useRef(null);
  const [name, setName] = useState(props.name);
  const [data, setData] = useState(_.isEmpty(options) ? getDefaultOptions() : options);
  const [colorful, setColorful] = useState(props.colorful);
  const [enableScore, setEnableScore] = useState(props.enableScore);
  const [quoteVisible, setQuoteVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);

  const deleteOptions = (data || []).filter(i => i.isDeleted);

  const handleOk = () => {
    if (!name) {
      alert(_l('选项集标题不能为空'), 3);
      return;
    }
    const nextData = { ...rest, name, colorful, enableScore, options: data };

    if (checkOptionsRepeat([{ ...nextData, type: 9 }])) {
      alert(_l('选项字段存在重复选项'), 3);
      return;
    }

    worksheetAjax.saveOptionsCollection({ appId, ...nextData }).then(({ code, data, msg }) => {
      if (code === 1) {
        onOk(_.isEmpty(data) ? nextData : data);
      } else {
        alert(msg);
      }
    });
  };

  const getOptionCount = () => {
    return data.filter(item => !item.isDeleted).length;
  };

  const getCopyValue = () => {
    const copyOptions = data.filter(i => !i.isDeleted);
    return copyOptions.reduce((p, c, i) => (i === data.length - 1 ? `${p}${c.value}` : `${p}${c.value}\n`), '');
  };

  const checkQuote = () => {
    setQuoteVisible(true);
  };

  return (
    <EditOptionDialog
      ref={$ref}
      visible
      bodyClass="editOptionDialog"
      title={_.isEmpty(options) ? _l('新建选项集') : _l('编辑选项集')}
      okText={_l('保存')}
      overlayClosable={false}
      onCancel={onCancel}
      onOk={handleOk}
    >
      <SettingItem className="pLeft24 pRight24 mTop0">
        <div className="settingItemTitle flexRow">
          <div className="flex">{_l('名称')}</div>
          {!_.isEmpty(options) && (
            <div className="ThemeColor bold Hand" onClick={checkQuote}>
              {_l('查看引用')}
            </div>
          )}
        </div>
        <Input value={name} placeholder={_l('选项集')} onChange={e => setName(e.target.value)} />
      </SettingItem>
      <SettingItem className="pLeft24 pRight24">
        <div className="settingItemTitle">{_l('选项（ %0 ）', getOptionCount())}</div>
        <div className="flexCenter" style={{ justifyContent: 'space-between' }}>
          <div className="flexCenter">
            <i
              style={{ color: colorful ? '#43bd36' : '#bdbdbd' }}
              className={`Font24 pointer icon-${colorful ? 'toggle_on' : 'toggle_off'}`}
              onClick={e => setColorful(colorful ? false : true)}
            ></i>
            <span style={{ marginLeft: '8px' }}>{_l('彩色')}</span>
          </div>
          <div className="flexCenter">
            <ClipboardButton
              component="span"
              data-clipboard-text={getCopyValue()}
              onSuccess={() => alert(_l('复制成功，请去批量添加选项'))}
              data-tip={_l('复制')}
            >
              <AutoIcon icon="content-copy" className="Font16 hoverText" />
            </ClipboardButton>
            {deleteOptions.length > 0 && (
              <Tooltip title={_l('恢复选项')} placement="bottom">
                <span className="mLeft15 flexCenter pointer" onClick={() => setDeleteVisible(true)}>
                  <AutoIcon icon="trash-loop" className="Font20" />
                </span>
              </Tooltip>
            )}
          </div>
        </div>
      </SettingItem>
      <Options
        className="optionsWrap"
        isDialog={true}
        mode="list"
        options={data}
        colorful={colorful}
        enableScore={enableScore}
        showAssign={true}
        onChange={({ options, enableScore }) => {
          setData(options);
          if (typeof enableScore === 'boolean') {
            setEnableScore(enableScore);
          }
        }}
      />

      {quoteVisible && (
        <DeleteOptionList
          type="checkQuote"
          collectionId={props.collectionId}
          name={props.name}
          title={_l('查看引用')}
          onOk={() => setQuoteVisible(false)}
          onCancel={() => setQuoteVisible(false)}
        />
      )}
      {deleteVisible && (
        <DeleteDialog
          options={data}
          colorful={colorful}
          onCancel={() => setDeleteVisible(false)}
          onOk={newOptions => {
            setData(newOptions);
          }}
        />
      )}
    </EditOptionDialog>
  );
}

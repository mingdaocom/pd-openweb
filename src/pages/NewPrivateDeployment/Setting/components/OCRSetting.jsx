import React, { Fragment, useEffect, useState } from 'react';
import { Switch, MenuItem, Input, Dialog, Dropdown, Icon } from 'ming-ui';
import { useSetState } from 'react-use';
import { updateSysSettings } from 'src/pages/NewPrivateDeployment/common.js';
import _ from 'lodash';
import { EmptyWrap, MyItem, ActionWrap } from './Item';
import Trigger from 'rc-trigger';
import PrivateOcr from 'src/api/privateOcr.js';
import { encrypt } from 'src/util';
import tencentyunIcon from 'src/pages/NewPrivateDeployment/images/tencentyunIcon.png';

const list = [
  {
    value: 2,
    text: _l('腾讯云'),
    iconImg: tencentyunIcon,
  },
  {
    value: 1,
    text: _l('自主集成'),
    iconImg: 'construction',
  },
];
const EmptyStatus = ({ onEdit }) => (
  <EmptyWrap className="pLeft16 mTop12 flexRow pRight16" onClick={onEdit}>
    <div className="flex">{_l('未设置模型，功能不可用')}</div>
    <span className="ThemeColor3 Hand">{_l('设置')}</span>
  </EmptyWrap>
);

function SetDialog(props) {
  const { onClose, onOk } = props;
  const [{ type, secretId, secretKey, baseUrl, loading }, setState] = useSetState({
    type: props.type,
    secretId: props.secretId,
    secretKey: props.secretKey,
    baseUrl: props.baseUrl,
    loading: false,
  });
  return (
    <Dialog
      visible={true}
      anim={false}
      title={_l('配置文本识别服务')}
      width={480}
      okText={_l('保存')}
      onOk={() => {
        if (loading) return;
        if (![1, 2].includes(type)) {
          alert(_l('请选择类型'), 3);
          return;
        }
        if (secretKey === 1 && !baseUrl) {
          alert(_l('请输入baseURL'), 3);
          return;
        }
        if (!secretId) {
          alert(_l('请输入ID'), 3);
          return;
        }
        if (!secretKey) {
          alert(_l('请输入key'), 3);
          return;
        }
        setState({ loading: true });
        const param = { type, secretId, secretKey: encrypt(secretKey) };
        if (type === 1) {
          param.baseUrl = baseUrl;
        }
        PrivateOcr.editOcr(param).then(res => {
          onOk({ type, secretId, secretKey, baseUrl });
          setState({ loading: false });
        });
      }}
      onCancel={onClose}
    >
      <div className="flexColumn">
        <div className="flex">
          <Fragment>
            <div className="flexColumn">
              <div className="Font14 mBottom5">
                <span className="Red pRight5">*</span>
                {_l('类型')}
              </div>
              <Dropdown
                data={list}
                value={[1, 2].includes(type) ? type : undefined}
                isAppendToBody
                className="w100"
                border
                onChange={newValue => setState({ type: newValue })}
              />
              {type === 1 && (
                <React.Fragment>
                  <span className="mTop5">
                    {_l('根据接口规范自主集成')}&nbsp;
                    <a className="pointer" target="_blank" href="https://docs-pd.mingdao.com/faq/integrate/ocr/custom">
                      {_l('查看')}
                    </a>
                  </span>
                  <div className="Font14 mTop15 mBottom5">
                    <span className="Red pRight5">*</span>baseURL
                  </div>
                  <Input
                    className="w100"
                    defaultValue={baseUrl}
                    onBlur={e => setState({ baseUrl: e.target.value.trim() })}
                  />
                </React.Fragment>
              )}
              <div className="Font14 mTop15 mBottom5">
                <span className="Red pRight5">*</span>ID
              </div>
              <Input className="w100" defaultValue={secretId} onBlur={e => setState({ secretId: e.target.value })} />
              <div className="Font14 mTop15 mBottom5">
                <span className="Red pRight5">*</span>key
              </div>
              <Input
                className="w100"
                value={secretKey}
                type="password"
                onChange={value => setState({ secretKey: value.trim() })}
              />
            </div>
          </Fragment>
        </div>
      </div>
    </Dialog>
  );
}

function Item(props) {
  const { handleDelete, onEdit, type } = props;
  const [visible, setVisible] = useState(false);
  const data = list.find(o => o.value === type);
  return (
    <MyItem className="pLeft16 mTop12">
      <div className="flex">
        {type === 2 ? (
          <img src={data.iconImg} className="iconImg mRight8" width={20} />
        ) : (
          <Icon icon={data.iconImg} className="mRight8 Font20 ThemeColor3" />
        )}
        {data.text}
      </div>
      <span className="ThemeColor3 Hand" onClick={onEdit}>
        {_l('设置')}
      </span>
      <Trigger
        popupVisible={visible}
        onPopupVisibleChange={value => setVisible(value)}
        action={['click']}
        popupAlign={{
          points: ['tr', 'br'],
          offset: [-160, 15],
          overflow: { adjustX: true, adjustY: true },
        }}
        popup={() => {
          return (
            <ActionWrap>
              <MenuItem className="delete" onClick={handleDelete}>
                {_l('清空配置')}
              </MenuItem>
            </ActionWrap>
          );
        }}
      >
        <Icon icon="moreop" className="Font16 Hand mLeft15" />
      </Trigger>
    </MyItem>
  );
}

export default function (props) {
  const [{ hideOCR, showEdit, type, secretId, secretKey, baseUrl }, setState] = useSetState({
    hideOCR: md.global.SysSettings.hideOCR,
    showEdit: false,
    type: undefined,
    secretId: '',
    secretKey: '',
    baseUrl: '',
  });

  useEffect(() => {
    !hideOCR && getOcr();
  }, [hideOCR]);

  const getOcr = () => {
    PrivateOcr.getOcr().then(res => {
      setState({ ...res });
    });
  };

  const onDel = () => {
    PrivateOcr.removeOcr().then(res => {
      setState({ type: 0, secretId: '', secretKey: '', baseUrl: '' });
    });
  };

  const renderList = () => {
    if (![1, 2].includes(type)) return <EmptyStatus onEdit={() => setState({ showEdit: true })} />;
    return (
      <Item
        secretKey={`aiBasic-item-${type}`}
        type={type}
        secretId={secretId}
        className="pLeft20"
        onEdit={() => setState({ showEdit: true })}
        handleDelete={onDel}
      />
    );
  };

  return (
    <Fragment>
      <div className="privateCardWrap flexColumn">
        <div className="flexRow">
          <div className="flex mBottom8">
            <div className="Font17 bold">{_l('文本识别')}</div>
          </div>
          <Switch
            checked={!hideOCR}
            onClick={value => {
              updateSysSettings(
                {
                  hideOCR: value,
                },
                () => {
                  setState({ hideOCR: value });
                  md.global.SysSettings.hideOCR = value;
                },
              );
            }}
          />
        </div>
        <div className="Gray_9e flex mRight20">
          {_l(
            '开启后将显示文本识别相关功能入口（如：工作表文本识别字段）。若要保证功能正常使用，还需要在下方配置相应服务。',
          )}
        </div>
        {!hideOCR && renderList()}
      </div>
      {showEdit && (
        <SetDialog
          type={type}
          secretId={secretId}
          secretKey={secretKey}
          baseUrl={baseUrl}
          onClose={() => setState({ showEdit: false })}
          onOk={data => setState({ ...data, showEdit: false })}
        />
      )}
    </Fragment>
  );
}

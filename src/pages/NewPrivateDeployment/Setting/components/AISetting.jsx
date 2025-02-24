import React, { Fragment, useEffect, useState } from 'react';
import { Switch, MenuItem, Input, Dropdown, Dialog, Icon } from 'ming-ui';
import { Divider } from 'antd';
import { useSetState } from 'react-use';
import { updateSysSettings } from 'src/pages/NewPrivateDeployment/common.js';
import _ from 'lodash';
import { EmptyWrap, MyItem, ActionWrap } from './Item';
import Trigger from 'rc-trigger';
import PrivateAi from 'src/api/privateAi.js';
import openAI from 'src/pages/NewPrivateDeployment/images/openAI.png';

const list = [
  {
    value: 2,
    text: 'OpenAI',
    iconImg: openAI,
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
  const [{ type, model, key, baseUrl, loading }, setState] = useSetState({
    type: props.type,
    model: props.model,
    key: props.keyStr,
    baseUrl: props.baseUrl,
    loading: false,
  });
  return (
    <Dialog
      visible={true}
      anim={false}
      title={_l('配置AI模型')}
      width={480}
      okText={_l('保存')}
      onOk={() => {
        if (loading) return;
        if (![1, 2].includes(type)) {
          alert(_l('请选择类型'), 3);
          return;
        }
        if (type === 1 && !baseUrl) {
          alert(_l('请输入请求地址'), 3);
          return;
        }
        if (!model) {
          alert(_l('请输入模型名称'), 3);
          return;
        }
        if (!key) {
          alert(_l('请输入key'), 3);
          return;
        }
        
        setState({ loading: true });
        const param = { type, model, key };
        if (type === 1) {
          param.baseUrl = baseUrl;
        }
        PrivateAi.editAi(param).then(res => {
          onOk({ type, model, key, baseUrl });
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
                    <a
                      className="pointer"
                      target="_blank"
                      href="https://docs-pd.mingdao.com/faq/integrate/ai/basic/custom"
                    >
                      {_l('查看')}
                    </a>
                  </span>
                  <div className="Font14 mTop15 mBottom5">
                    <span className="Red pRight5">*</span>{_l('请求地址')}
                  </div>
                  <Input
                    className="w100"
                    defaultValue={baseUrl}
                    onBlur={e => setState({ baseUrl: e.target.value.trim() })}
                  />
                </React.Fragment>
              )}
              <div className="Font14 mTop15 mBottom5">
                <span className="Red pRight5">*</span>
                {_l('模型名称')}
              </div>
              <Input className="w100" defaultValue={model} onBlur={e => setState({ model: e.target.value })} />
              <div className="Font14 mTop15 mBottom5">
                <span className="Red pRight5">*</span>key
              </div>
              <Input
                className="w100"
                value={key}
                type="password"
                onChange={value => setState({ key: value.trim() })}
              />
            </div>
          </Fragment>
        </div>
      </div>
    </Dialog>
  );
}

function Item(props) {
  const { handleDelete, onEdit, type, name } = props;
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
        {data.text}-{name}
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
  const [{ hideAIBasicFun, hideAIGCNode, showEdit, type, model, key, baseUrl }, setState] = useSetState({
    hideAIBasicFun: md.global.SysSettings.hideAIBasicFun,
    hideAIGCNode: md.global.SysSettings.hideAIGCNode,
    showEdit: false,
    type: undefined,
    model: '',
    key: '',
    baseUrl: '',
  });

  useEffect(() => {
    !hideAIBasicFun && getAI();
  }, [hideAIBasicFun]);

  const getAI = () => {
    PrivateAi.getAi().then(res => {
      setState({ ...res });
    });
  };

  const onDel = () => {
    PrivateAi.removeAi().then(res => {
      setState({ type: 0, model: '', key: '', baseUrl: '' });
    });
  };

  const renderList = () => {
    if (![1, 2].includes(type)) return <EmptyStatus onEdit={() => setState({ showEdit: true })} />;
    return (
      <Item
        key={`aiBasic-item-${type}`}
        type={type}
        name={model}
        className="pLeft20"
        onEdit={() => setState({ showEdit: true })}
        handleDelete={onDel}
      />
    );
  };

  return (
    <Fragment>
      <div className="privateCardWrap flexColumn">
        <div className="Font17 bold mBottom8">{_l('AI服务')}</div>
        <div className="mBottom15 Gray_9e flex mRight20">
          {_l('开启后将显示AI相关功能入口。若要保证功能正常使用，还需要在下方配置相应服务。如未完成配置，可先关闭。')}
        </div>
        <div>
          <div className="flexRow w100">
            <div className="Font14 bold flex">{_l('基础AI功能')}</div>
            <Switch
              checked={!hideAIBasicFun}
              onClick={value => {
                updateSysSettings(
                  {
                    hideAIBasicFun: value,
                  },
                  () => {
                    setState({ hideAIBasicFun: value });
                    md.global.SysSettings.hideAIBasicFun = value;
                  },
                );
              }}
            />
          </div>
          <div className="Font13 Gray_9e">
            {_l('如：工作表字段建议、工作表自定义字段、工作流代码块自动生成、应用多语言智能翻译')}
          </div>
          {!hideAIBasicFun && renderList()}
        </div>
        <Divider className="mTop20 mBottom20" />
        <div>
          <div className="flexRow w100">
            <div className="Font14 bold flex">{_l('工作流AIGC节点')}</div>
            <Switch
              checked={!hideAIGCNode}
              onClick={value => {
                updateSysSettings(
                  {
                    hideAIGCNode: value,
                  },
                  () => {
                    setState({ hideAIGCNode: value });
                    md.global.SysSettings.hideAIGCNode = value;
                  },
                );
              }}
            />
          </div>
          <div className="Font13 Gray_9e">
            {_l('使用工作流AIGC节点时可根据需要选择不同的模型，备选模型的配置需在配置文件中完成')}{' '}
            <a className="pointer" target="_blank" href="https://docs-pd.mingdao.com/faq/integrate/ai/workflow/openai">
              {_l('了解服务配置')}
            </a>
          </div>
        </div>
      </div>
      {showEdit && (
        <SetDialog
          type={type}
          model={model}
          keyStr={key}
          baseUrl={baseUrl}
          onClose={() => setState({ showEdit: false })}
          onOk={data => setState({ ...data, showEdit: false })}
        />
      )}
    </Fragment>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import cx from 'classnames';
import { Icon, Support, LoadDiv } from 'ming-ui';
import { useSetState } from 'react-use';
import { CardTopWrap } from '../apiIntegration/style';
import flowNodeAjax from 'src/pages/workflow/api/flowNode';
import { Wrap } from './style';
import Detail from 'src/pages/workflow/WorkflowSettings/Detail';
import axios from 'axios';
import { CustomTextarea } from 'src/pages/workflow/WorkflowSettings/Detail/components';
import copy from 'copy-to-clipboard';
import 'src/pages/workflow/WorkflowSettings/Detail/components/Tag/index.less';

const info = {
  authorization_back: {
    name: _l('授权回调地址'),
    icon: 'link1',
    des: _l('复制下方地址填入您的Oauth2.0授权回调配置中'),
    tap: 1,
  },
  authorization_address: {
    name: _l('授权认证地址'),
    icon: 'link1',
    des: _l('配置授权认证地址，用户点击发起授权。state值不需要额外配置，发起授权时会自动生成拼接。'),
    tap: 2,
  },
  authorization_code: {
    name: _l('获取 Access Token'),
    icon: 'key1',
    canEdit: true,
    des: _l('根据 code 获取访问令牌'),
    tap: 3,
  },
  refresh_token: {
    name: _l('刷新 Access Token'),
    icon: 'key1',
    canEdit: true,
    des: _l('复制下方地址填入您的Oauth2.0授权回调配置中'),
    tap: 4,
  },
};
const taps = ['authorization_back', 'authorization_address', 'authorization_code', 'refresh_token'];
//授权回调
function AuthParam(props) {
  const cache = useRef({});
  const { href, companyId, index, onChange } = props;
  const [node, setNode] = useState(props.node);
  const [{ showEdit, key }, setState] = useSetState({ showEdit: false, key: '' });
  useEffect(() => {
    getParam();
  }, []);

  const getParam = () => {
    flowNodeAjax
      .getNodeDetail(
        {
          processId: props.id,
          nodeId: node.id,
          flowNodeType: node.typeId,
        },
        { isIntegration: true },
      )
      .then(res => {
        cache.current.node = { ...node, ...res };
        setNode(cache.current.node);
        setState({
          key: taps[index],
        });
      });
  };
  // 获取连接详情
  const getInfo = () => {
    if (!node || !node.id) {
      return;
    }
    axios
      .all([
        flowNodeAjax.get(
          {
            processId: props.connectId,
          },
          { isIntegration: true },
        ),
        flowNodeAjax.getNodeDetail(
          {
            processId: props.id,
            nodeId: node.id,
            flowNodeType: node.typeId,
          },
          { isIntegration: true },
        ),
      ])
      .then(res => {
        cache.current.node = {
          ...node,
          ...((res[0] || {}).flowNodeMap || {})[node.id],
          ...res[1],
        };
        setNode(cache.current.node);
      });
  };

  //保存参数
  const update = data => {
    flowNodeAjax
      .saveNode(
        {
          processId: props.id,
          nodeId: node.id,
          flowNodeType: node.typeId,
          name: node.name,
          ...cache.current.node,
          ...data,
        },
        { isIntegration: true },
      )
      .then(function (result) {
        // getInfo();
      });
  };

  if (!key) {
    return <LoadDiv />;
  }

  const renderBtn = () => {
    let str = '';
    if (node.appType !== 33) {
      str = !node.controls ? _l('开始配置') : _l('编辑');
    } else {
      str = (node.fields || []).filter(o => !!o.fieldValue).length <= 0 ? _l('开始配置') : _l('编辑');
    }
    return (
      <div
        className="btn Hand"
        onClick={() => {
          setState({
            showEdit: true,
          });
        }}
      >
        {str}
      </div>
    );
  };

  const renderOAuth = () => {
    if ((node.webHookNodes || []).length <= 0) {
      return '';
    }
    return <div className="flexRow mBottom20 pLeft20 pRight20">{_.get(node, 'webHookNodes[0].url')}</div>;
  };

  const renderUrl = withTime => {
    return (
      <div className=" pLeft20 pRight20">
        <div className="flexRow mBottom20">{_.get(node, 'webHookNodes[0].url')}</div>
        {withTime && node.expireAfterSeconds !== undefined && (
          <div className="flexRow mBottom20">
            {node.expireAfterSeconds <= 0 ? (
              <div className="title Gray_75"> {_l('不刷新')}</div>
            ) : (
              <React.Fragment>
                <div className="title Gray_75">{_l('刷新频率')}</div>
                <div className="txt flex pLeft5">
                  {node.expireAfterSeconds} {_l('秒')}
                </div>
              </React.Fragment>
            )}
          </div>
        )}
      </div>
    );
  };

  //安装的连接 只能填写参数值和设置隐藏 props.connectType === 2
  return (
    <Wrap className={props.className}>
      <CardTopWrap className="flexRow pBottom15">
        <div className={cx('iconCon')}>
          {(key === 'refresh_token' && node.expireAfterSeconds && _.get(node, 'webHookNodes[0].url')) ||
          (key === 'authorization_address' && node.sendContent) ||
          (key === 'authorization_code' && _.get(node, 'webHookNodes[0].url')) ? (
            <Icon icon="check_circle1" className="Green_right tip" />
          ) : null}
          <Icon icon={info[key].icon} className="iconParam Font24" />
        </div>
        <div className="flex pLeft16">
          <p className="Font17 Bold">{info[key].name || node.name}</p>
          <p className="Font13 Gray_75 mTop4">
            <span className="TxtMiddle">{info[key].des}</span>
            <Support href={href} type={3} text={_l('使用帮助')} />
          </p>
        </div>
        {info[key].canEdit && props.canEdit && renderBtn()}
      </CardTopWrap>
      {key === 'authorization_address' && (
        <div className="customTextareaCon workflowDetail">
          <CustomTextarea
            className="minH100"
            projectId={companyId}
            processId={props.id}
            relationId={props.relationId}
            selectNodeId={node.id}
            type={2}
            content={_.get(cache, 'current.node.sendContent')}
            formulaMap={_.get(cache, 'current.node.formulaMap')}
            isIntegration={true}
            onChange={(err, value, obj) => {
              cache.current.node = { ...cache.current.node, sendContent: value };
              setNode(cache.current.node);
            }}
            onBlur={(err, value, obj) => {
              update();
            }}
            key={JSON.stringify(_.get(cache, 'current.node.formulaMap'))}
            updateSource={(obj, cb) => {
              cache.current.node = { ...cache.current.node, ...obj };
              setNode(cache.current.node);
              update(obj);
              cb();
            }}
          />
        </div>
      )}
      {['authorization_back'].includes(key) && (
        <div class="flexRow mLeft20 mRight20 mBottom20">
          <div className="urlForCopy flex ellipsis">{node.sendContent}</div>
          <span
            className="copyBtn mLeft8 Hand"
            onClick={content => {
              copy(node.sendContent);
              alert(_l('复制成功'));
            }}
          >
            {_l('复制')}
          </span>
        </div>
      )}
      {['authorization_code'].includes(key) && renderOAuth()}
      {['refresh_token'].includes(key) && renderUrl(true)}
      {showEdit && (
        <div className="workflowSettings">
          <Detail
            companyId={companyId}
            processId={props.id}
            relationId={props.relationId}
            relationType={props.relationType}
            selectNodeId={node.id}
            selectNodeType={node.typeId}
            closeDetail={() => {
              setState({
                showEdit: false,
              });
            }}
            hasAuth={props.hasAuth}
            customNodeName={info[key].name || node.name}
            isIntegration
            updateNodeData={data => {
              getInfo();
            }}
          />
        </div>
      )}
    </Wrap>
  );
}

export default AuthParam;

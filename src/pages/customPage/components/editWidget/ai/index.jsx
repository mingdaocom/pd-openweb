import React, { useState, Fragment, useEffect } from 'react';
import { Icon, Dialog, RadioGroup, LoadDiv, SvgIcon } from 'ming-ui';
import styled from 'styled-components';
import cx from 'classnames';
import assistantApi from 'src/api/assistant';
import { checkPermission } from 'src/components/checkPermission';
import { PERMISSION_ENUM } from 'src/pages/Admin/enum';

const Wrap = styled.div`
  height: 520px;
  .header {
    .create:hover * {
      color: #2196f3 !important;
    }
  }
  .ming.Radio {
    margin-right: 32px !important;
    .Radio-box {
      margin-right: 8px !important;
    }
  }
  .aiItem {
    border: 1px solid #ccc;
    padding: 14px 12px;
    border-radius: 4px;
    .iconWrap {
      width: 40px;
      height: 40px;
      border-radius: 50%;
    }
    &.disable {
      cursor: inherit;
      background-color: #f5f5f5;
    }
    &:hover {
      border-color: #2196f3;
    }
  }
  .emptyState {
    padding: 20px 0;
    .circle {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background-color: #f5f5f5;
    }
    .create {
      color: #2196f3;
      border: 1px solid #2196f3;
      padding: 5px 20px;
      border-radius: 24px;
    }
  }
`;

const EmptyState = props => {
  return (
    <div className="w100 h100 flexColumn alignItemsCenter justifyContentCenter emptyState">
      <div className="circle flexRow alignItemsCenter justifyContentCenter">
        <Icon className="Gray_9e Font56" icon="contact_support" />
      </div>
      <div className="mTop10 mBottom20 Gray_75">{_l('AI问答助手可以帮助企业知识组学习')}</div>
      {props.hasAssistantAuth && (
        <div className="create pointer" onClick={() => window.open('/plugin/assistant')}>
          {_l('插件中心创建')}
        </div>
      )}
    </div>
  );
};

export default function Ai(props) {
  const { projectId, ids, widget, components, onEdit, updateWidget, onClose } = props;
  const [showType, setShowType] = useState('embed');
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);
  const aiComponent = components.filter(c => [8, 'ai'].includes(c.type));
  const aiComponentIds = aiComponent.map(c => c.value);
  const suspensionAi = aiComponent.filter(n => n.config.showType === 'suspension');
  const hasAssistantAuth = checkPermission(projectId, PERMISSION_ENUM.MANAGE_PLUGINS);

  const handleCreateAi = id => {
    if (aiComponentIds.includes(id)) return;
    if (showType === 'embed') {
      onEdit({ value: id, config: { showType } });
    } else {
      if (suspensionAi.length) {
        updateWidget({ widget: suspensionAi[0], value: id });
        onClose();
      } else {
        onEdit({ value: id, config: { showType } });
      }
    }
  };

  useEffect(() => {
    assistantApi
      .getList({
        projectId,
        status: 2,
      })
      .then(data => {
        setList(data);
        setLoading(false);
      });
  }, []);

  return (
    <Dialog visible overlayClosable={false} width={640} footer={null} title={_l('AI助手设置')} onCancel={onClose}>
      <Wrap>
        {loading ? (
          <LoadDiv />
        ) : (
          <Fragment>
            {!!list.length && (
              <div className="flexRow alignItemsCenter Font14 mBottom20 header">
                <div className="flexRow alignItemsCenter flex">
                  <span className="Gray_75 mRight16">{_l('显示方式')}</span>
                  <RadioGroup
                    size="middle"
                    data={[
                      {
                        text: _l('嵌入页面'),
                        value: 'embed',
                      },
                      {
                        text: _l('悬浮框'),
                        value: 'suspension',
                        disabled: !!suspensionAi.length,
                      },
                    ]}
                    checkedValue={showType}
                    onChange={value => setShowType(value)}
                  />
                </div>
                {hasAssistantAuth && (
                  <div className="flexRow alignItemsCenter pointer create">
                    <span className="Gray_75" onClick={() => window.open('/plugin/assistant')}>
                      {_l('插件中心创建')}
                    </span>
                    <Icon className="Gray_9e mLeft5 Font18" icon="launch" />
                  </div>
                )}
              </div>
            )}
            {list.map(item => (
              <div
                key={item.id}
                className={cx('aiItem pointer flexRow alignItemsCenter mBottom12', {
                  disable: aiComponentIds.includes(item.id),
                })}
                onClick={() => handleCreateAi(item.id)}
              >
                <div
                  className="iconWrap flexRow alignItemsCenter justifyContentCenter"
                  style={{ background: aiComponentIds.includes(item.id) ? '#bdbdbd' : item.iconColor || '#2196f3' }}
                >
                  <SvgIcon url={item.iconUrl} fill="#fff" />
                </div>
                <div className="flexColumn mLeft10 Font14 flex overflowHidden">
                  <div className="mBottom2">{item.name}</div>
                  <div className="Gray_9e ellipsis" title={item.description}>
                    {item.description}
                  </div>
                </div>
              </div>
            ))}
            {!list.length && <EmptyState hasAssistantAuth={hasAssistantAuth} />}
          </Fragment>
        )}
      </Wrap>
    </Dialog>
  );
}

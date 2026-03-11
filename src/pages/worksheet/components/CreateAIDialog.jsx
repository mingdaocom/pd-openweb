import React, { Fragment, useState } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button, Dialog, Icon, SvgIcon, Textarea } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import LoadingDots from 'src/pages/widgetConfig/widgetSetting/components/DevelopWithAI/ChatBot/LoadingDots';
import loadAiImg from 'src/pages/worksheet/assets/aiLoad.png';

const AIActionDialogWrap = styled(Dialog)`
  .aiContentWrap {
    height: 130px;
  }
  .aiContent {
    transition: transform 0.3s ease-in-out;
  }

  .aiItem {
    width: 180px;
    height: 130px;
    flex-shrink: 0;
    padding: 10px 12px;
    border: 1px solid var(--color-border-primary);
    border-radius: 6px;
    &.firstItem {
      margin-left: 0 !important;
    }
    .description {
      height: 54px;
      display: -webkit-box !important;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      white-space: pre-wrap;
      overflow: hidden;
    }
    img {
      width: 100%;
      height: 100%;
    }
    .loadingDots {
      justify-content: end;
    }
    .icon-arrow_forward:hover {
      color: var(--app-primary-color) !important;
    }
    &.aiItemContent:hover {
      background: var(--color-background-secondary);
    }
    &.active {
      background: color-mix(in srgb, var(--app-primary-color) 6%, transparent);
      border: 1px solid var(--app-primary-color);
      .summary {
        color: var(--app-primary-color);
      }
    }
  }

  .lastWrap,
  .nextWrap {
    position: absolute;
    top: 0;
    right: 0;
    width: 32px;
    height: 100%;
    background: linear-gradient(to right, rgba(255, 255, 255, 0) 0%, #ffffff 34%, #ffffff 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    .switchIcon {
      width: 32px;
      height: 32px;
      background: var(--color-background-primary);
      box-shadow: 0px 1px 3px 1px rgba(0, 0, 0, 0.16);
      text-align: center;
      border-radius: 50%;
      background: linear-gradient(to right, rgba(255, 255, 255, 0) 0%, #ffffff 34%, #ffffff 100%);
      cursor: pointer;
    }
  }

  .lastWrap {
    left: 0;
    background: linear-gradient(to left, rgba(255, 255, 255, 0) 0%, #ffffff 34%, #ffffff 100%);
  }

  .line {
    height: 1px;
    background: var(--color-border-primary);
    margin: 32px 0;
  }

  .textAreaDisabled {
    background: var(--color-background-secondary) !important;
  }

  .mui-dialog-footer {
    .createBtn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100% !important;
      border-radius: 3px !important;
      line-height: 36px;
      min-height: 36px;
    }
  }
  .icon-refresh1 {
    vertical-align: text-bottom;
    &:hover {
      color: var(--color-link-hover) !important;
    }
  }
`;

export default function CreateAIDialog(props) {
  const {
    width,
    visible,
    title,
    description,
    okText,
    okDisabled,
    aiTitle,
    customTitle,
    customDescription,
    placeholder,
    loadingAIsuggestions,
    generateLoading,
    aiList,
    defaultAIsuggestions = [],
    onOk,
    onCancel,
    updateData = () => {},
    refresh = () => {},
  } = props;
  const [name, setName] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [customRemark, setCustomRemark] = useState();

  const renderItem = (item, index) => {
    const isActive = item.summary === name;

    return (
      <div key={index} className={cx('aiItem aiItemContent mLeft10', { firstItem: index === 0, active: isActive })}>
        <div className="flexRow mBottom10 alignItemsCenter">
          {item.icon ? (
            <div className="iconCon mRight5">
              <SvgIcon
                url={`https://fp1.mingdaoyun.cn/customIcon/${item.icon}.svg`}
                size={20}
                fill="var(--app-primary-color)"
              />
            </div>
          ) : null}
          <div className="summary bold ellipsis">{item.summary}</div>
        </div>
        {!item.description ? (
          <div className="description textSecondary Font12 mBottom10">- - -</div>
        ) : (
          <Tooltip title={item.description}>
            <div className="description textSecondary Font12 mBottom10">{item.description}</div>
          </Tooltip>
        )}
        {generateLoading && isActive ? (
          <LoadingDots className="loadingDots" dotNumber={3} />
        ) : (
          <div className="TxtRight">
            <div
              className="Hand InlineBlock"
              onClick={() => {
                if (generateLoading) return;
                setCustomRemark('');
                setName(item.summary);
                updateData({ name: item.summary, remark: item.description }, onOk);
              }}
            >
              <Icon icon="arrow_forward" className="textTertiary Font18" />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <AIActionDialogWrap
      width={width || 800}
      visible={visible}
      title={title}
      description={description}
      okDisabled={okDisabled || !!name}
      showCancel={false}
      onOk={() => onOk(true)}
      onCancel={onCancel}
      footer={
        <Button
          disabled={okDisabled || !!name}
          className={cx('createBtn', {
            disabled: generateLoading || okDisabled || !!name,
          })}
          onClick={() => onOk(true)}
        >
          {generateLoading ? (
            <Fragment>
              <LoadingDots className="loadingDots" dotNumber={3} />
              <span className="mLeft3"> {_l('生成中')}</span>
            </Fragment>
          ) : (
            okText || _l('创建')
          )}
        </Button>
      }
    >
      <div className="bold mBottom10">{customTitle}</div>
      <div className="customDescription textSecondary Font13 mBottom16">{customDescription}</div>
      <Textarea
        autoFocus
        className={cx('w100 Font13', { textAreaDisabled: !!name || generateLoading })}
        minHeight={100}
        value={customRemark}
        placeholder={placeholder}
        disabled={!!name}
        onChange={remark => {
          setCustomRemark(remark);
          updateData({ remark });
        }}
      />
      <div className="line"></div>
      <div className="mBottom10">
        <span className="bold">{aiTitle}</span>
        <Tooltip title={_l('重新生成')}>
          <Icon icon="refresh1" className="textTertiary Font16 pointer mLeft10" onClick={refresh} />
        </Tooltip>
      </div>
      <div className="aiContentWrap overflowHidden Relative">
        {loadingAIsuggestions ? (
          <div className="aiContent flexRow">
            {[...defaultAIsuggestions, ...Array(4 - defaultAIsuggestions.length)].map((item, index) =>
              item?.summary ? (
                renderItem(item, index)
              ) : (
                <div key={index} className={cx('aiItem mLeft10 pAll0', { firstItem: index === 0 })}>
                  <img src={loadAiImg} alt="aiLoad" className="aiLoadImg" />
                </div>
              ),
            )}
          </div>
        ) : (
          <Fragment>
            {currentIndex > 0 && (
              <div className="lastWrap">
                <div
                  className="switchIcon"
                  onClick={() => (currentIndex > 0 ? setCurrentIndex(currentIndex - 1) : null)}
                >
                  <Icon icon="arrow-left-border" className="textTertiary Font20 LineHeight32" />
                </div>
              </div>
            )}
            <div
              className="aiContent flexRow Absolute"
              style={{ transform: currentIndex > 0 ? `translateX(-${currentIndex * (180 + 10)}px)` : 'none' }}
            >
              {aiList.map((item, index) => renderItem(item, index))}
            </div>
            {aiList.length > 4 && currentIndex < aiList.length - 4 && (
              <div className="nextWrap">
                <div
                  className="switchIcon"
                  onClick={() => (currentIndex < aiList.length - 1 ? setCurrentIndex(currentIndex + 1) : null)}
                >
                  <Icon icon="arrow-right-border" className="textTertiary Font20 LineHeight32" />
                </div>
              </div>
            )}
          </Fragment>
        )}
      </div>
    </AIActionDialogWrap>
  );
}

CreateAIDialog.propTypes = {
  width: PropTypes.number,
  visible: PropTypes.bool,
  title: PropTypes.string,
  okText: PropTypes.string,
  okDisabled: PropTypes.bool,
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
  aiTitle: PropTypes.string,
  customTitle: PropTypes.string,
  customDescription: PropTypes.string,
  placeholder: PropTypes.string,
  loadingAIsuggestions: PropTypes.bool,
  generateLoading: PropTypes.bool,
  aiList: PropTypes.array,
  updateData: PropTypes.func,
  refresh: PropTypes.func,
};

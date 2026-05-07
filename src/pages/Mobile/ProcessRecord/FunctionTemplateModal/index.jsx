import React, { Component, Fragment } from 'react';
import { createRoot } from 'react-dom/client';
import { Button, Popup } from 'antd-mobile';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import instanceAJAX from 'src/pages/workflow/apiV2/instance';

const Wrap = styled.div`
  .searchWrap {
    padding: 7px 15px;
    border-radius: 25px;
    background-color: var(--color-background-secondary);
    position: relative;
    margin: 10px;
    input {
      width: 100%;
      border: none;
      padding-left: 10px;
      background-color: var(--color-background-secondary);
    }
    .icon-close {
      position: absolute;
      right: 10px;
    }
  }
  .opinionsWrap {
    overflow-y: auto;
    padding: 0 10px;
    .opinionItem {
      font-size: 17px;
      padding: 12px 0;
      border-bottom: 1px solid var(--color-border-secondary);
    }
  }
`;

class ModalWrap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchValue: '',
      opinionList: props.opinionList || [],
    };
  }
  renderInput() {
    const { searchValue } = this.state;
    return (
      <div className="searchWrap valignWrapper">
        <Icon icon="search" className="textTertiary Font20 pointer" />
        <input
          value={searchValue}
          type="text"
          placeholder={_l('搜索')}
          onChange={e => {
            this.setState({
              searchValue: e.target.value,
            });
          }}
        />
        {searchValue && (
          <Icon
            icon="close"
            className="textSecondary Font20 pointer"
            onClick={() => {
              this.setState({
                searchValue: '',
              });
            }}
          />
        )}
      </div>
    );
  }

  deleteOpinion = opinion => {
    const { instanceId, updateOpinionList } = this.props;
    const { opinionList } = this.state;

    instanceAJAX.removeOperation({ id: instanceId, opinion }).then(res => {
      if (res) {
        const list = opinionList.filter(item => item.opinion !== opinion);

        this.setState({ opinionList: list });
        updateOpinionList(list);
        alert(_l('删除成功'));
      }
    });
  };

  render() {
    const { visible, onSelect, onClose, onCustom, opinions = [], inputType } = this.props;
    const { searchValue, opinionList } = this.state;

    return (
      <Popup visible={visible} onClose={onClose} className="mobileModal full">
        <Wrap className="flexColumn leftAlign h100">
          {this.renderInput()}
          <div className="flex opinionsWrap">
            {inputType === 2 && (
              <div
                className="opinionItem colorPrimary"
                onClick={() => {
                  onSelect('');
                  onClose();
                }}
              >
                {_l('清除选择')}
              </div>
            )}

            {opinions
              .filter(data => data.value.toLocaleLowerCase().includes(searchValue.toLocaleLowerCase()))
              .map((data, index) => (
                <Fragment key={index}>
                  {index === 0 && <div className="opinionItem bold Font14">{_l('选择预设')}</div>}
                  <div
                    className="opinionItem textPrimary"
                    onClick={() => {
                      onSelect(data.value);
                      onClose();
                    }}
                  >
                    {data.value}
                  </div>
                </Fragment>
              ))}

            {opinionList
              .filter(data => data.opinion.toLocaleLowerCase().includes(searchValue.toLocaleLowerCase()))
              .map((data, index) => (
                <Fragment key={index}>
                  {index === 0 && <div className="opinionItem bold Font14">{_l('上次输入')}</div>}
                  <div
                    className="opinionItem textPrimary flexRow alignItemsCenter justifyContentBetween"
                    onClick={() => {
                      onSelect(data.opinion);
                      onClose();
                    }}
                  >
                    <div>{data.opinion}</div>
                    <i
                      className="Font20 icon-delete2 textSecondary"
                      onClick={e => {
                        e.stopPropagation();
                        this.deleteOpinion(data.opinion);
                      }}
                    />
                  </div>
                </Fragment>
              ))}
          </div>
          {inputType === 1 && (
            <div className="btnsWrapper valignWrapper flexRow pAll10">
              <Button
                color="primary"
                className="flex Font12 bold"
                onClick={() => {
                  onClose();
                  onCustom();
                }}
              >
                {_l('手动输入')}
              </Button>
            </div>
          )}
        </Wrap>
      </Popup>
    );
  }
}

export default function functionTemplateModal(props) {
  const div = document.createElement('div');

  document.body.appendChild(div);

  const root = createRoot(div);

  function destory() {
    root.unmount();
    document.body.removeChild(div);
  }

  root.render(<ModalWrap visible {...props} onClose={destory} />);
}

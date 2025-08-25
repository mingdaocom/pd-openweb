import React, { Component, Fragment } from 'react';
import { createRoot } from 'react-dom/client';
import { Button, Popup } from 'antd-mobile';
import styled from 'styled-components';
import { Icon } from 'ming-ui';

const Wrap = styled.div`
  .searchWrap {
    padding: 7px 15px;
    border-radius: 25px;
    background-color: #f6f6f6;
    position: relative;
    margin: 10px;
    input {
      width: 100%;
      border: none;
      padding-left: 10px;
      background-color: #f6f6f6;
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
      padding: 10px 0;
      border-bottom: 1px solid #f6f6f6;
    }
  }
`;

class ModalWrap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchValue: '',
    };
  }
  renderInput() {
    const { searchValue } = this.state;
    return (
      <div className="searchWrap valignWrapper">
        <Icon icon="search" className="Gray_9e Font20 pointer" />
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
            className="Gray_75 Font20 pointer"
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
  render() {
    const { visible, onSelect, onClose, onCustom, opinions = [], inputType, opinionList = [] } = this.props;
    const { searchValue } = this.state;

    return (
      <Popup visible={visible} onClose={onClose} className="mobileModal full">
        <Wrap className="flexColumn leftAlign h100">
          {this.renderInput()}
          <div className="flex opinionsWrap">
            {inputType === 2 && (
              <div
                className="opinionItem ThemeColor"
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
                    className="opinionItem Gray"
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
                    className="opinionItem Gray"
                    onClick={() => {
                      onSelect(data.opinion);
                      onClose();
                    }}
                  >
                    {data.opinion}
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

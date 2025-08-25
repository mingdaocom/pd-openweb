import React from 'react';
import styled from 'styled-components';
import { Checkbox, Icon, Radio } from 'ming-ui';
import withClickAway from 'ming-ui/decorators/withClickAway';

const HeaderRange = styled.div`
  display: block;
  padding: 16px 24px;
  font-weight: bold;
  border-bottom: 1px solid #eaeaea;
  .ming.icon-close {
    float: right;
  }
  .ming.icon-close:hover {
    color: #1677ff !important;
  }
`;
const RangeBox = styled.div`
  position: absolute;
  z-index: 10;
  width: 320px;
  background: #ffffff 0% 0% no-repeat padding-box;
  box-shadow: 0px 12px 24px #0000003d;
  box-sizing: border-box;
  line-height: 1;
  font-size: 14px;
  transition: all 0.3s;
  animation-name: fadeInUp;
  animation-duration: 0.3s;
  animation-timing-function: ease-in-out;
  animation-iteration-count: 1;
  animation-direction: normal;
  animation-fill-mode: forwards;
  @keyframes fadeInUp {
    from {
      opacity: 0;
      box-shadow: 0px 0px 0px #fff;
      -webkit-transform: translate3d(-30px, 0, 0);
      transform: translate3d(-30px, 0, 0);
    }

    to {
      opacity: 1;
      box-shadow: 0px 12px 24px #0000003d;
      -webkit-transform: translate3d(0, 0, 0);
      transform: translate3d(0, 0, 0);
    }
  }
  .con {
    padding: 24px;
    h5 {
      margin: 0;
      line-height: 1;
      margin-bottom: 20px;
      font-size: 14px;
    }
    .Radio-text {
      font-weight: initial;
      color: #151515;
    }
  }
  .dropOptionTrigger {
    padding: 24px;
    max-height: 260px;
    overflow: auto;
  }
`;
@withClickAway
export class RangeDrop extends React.Component {
  constructor(props) {
    super(props);
  }

  getViews(list) {
    return list.filter(l => l.viewId !== l.worksheetId);
  }

  render() {
    const { printData, views, setData, className } = this.props;
    const viewList = this.getViews(views);

    return (
      <RangeBox className={className}>
        <HeaderRange className="headerRange Font14 Gray">
          {_l('使用范围')}
          <Icon
            icon="close"
            className="Font18 Gray_9e Hand"
            onClick={() => {
              this.props.onClose();
            }}
          />
        </HeaderRange>
        <ul className="dropOptionTrigger">
          <Radio
            text={_l('所有记录')}
            checked={printData.range === 1}
            onClick={() => {
              setData({
                printData: {
                  ...printData,
                  range: 1,
                },
              });
            }}
          />
          <p className="mLeft25 mTop10 mBottom16"></p>
          <Radio
            text={_l('应用于指定视图')}
            checked={printData.range === 3}
            onClick={() => {
              setData({
                printData: {
                  ...printData,
                  range: 3,
                },
              });
            }}
          />
          {printData.range === 3 && (
            <div className="viewList">
              <div className="viewListLi">
                {viewList.map(it => {
                  return (
                    <Checkbox
                      className="mTop15 mLeft25"
                      text={it.name}
                      checked={printData.views.map(o => o.viewId).includes(it.viewId)}
                      onClick={checked => {
                        setData({
                          printData: {
                            ...printData,
                            views: checked
                              ? printData.views.filter(o => it.viewId !== o.viewId)
                              : printData.views.concat(it),
                          },
                        });
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </ul>
      </RangeBox>
    );
  }
}

export default RangeDrop;

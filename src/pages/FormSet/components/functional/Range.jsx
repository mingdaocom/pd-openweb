import React from 'react';
import withClickAway from 'ming-ui/decorators/withClickAway';
import { Icon, Radio } from 'ming-ui';
import styled from 'styled-components';

const RangeBox = styled.div`
  width: 320px;
  background: #ffffff 0% 0% no-repeat padding-box;
  box-shadow: 0px 12px 24px #0000003d;
  box-sizing: border-box;
  line-height: 1;
  font-size: 14px;
  font-weight: bold;
  // margin-bottom: 50px;
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
    max-height: 350px;
    overflow: auto;
    h5 {
      margin: 0;
      line-height: 1;
      margin-bottom: 20px;
      font-size: 14px;
    }
    .Radio-text {
      font-weight: initial;
      color: #333;
    }
  }
  .conLine {
    margin: 0 24px;
    border-bottom: 1px solid #eaeaea;
  }
  .inputTxt {
    font-weight: normal;
  }
`;
const HeaderRange = styled.div`
  padding: 16px 24px;
  border-bottom: 1px solid #eaeaea;
  .ming.icon-close {
    float: right;
  }
  .ming.icon-close:hover {
    color: #2196f3 !important;
  }
`;
@withClickAway
class Range extends React.Component {
  el = null;
  componentDidMount() {
    this.getTop(this.props);
  }
  componentWillReceiveProps(nextProps) {
    this.getTop(nextProps);
  }
  getTop = props => {
    setTimeout(() => {
      const el = this.el;
      if (el) {
        let l = $(el).height() + props.top - $('.switchBoxCon').height();
        $(el).css({
          transition: 'none',
        });
        if (l > 0) {
          $(el).css({
            top: props.top - $(el).height() + 48,
            transition: 'all 0.3s',
          });
        } else {
          $(el).css({
            top: props.top,
            transition: 'all 0.3s',
          });
        }
      }
    }, 0);
  };
  render() {
    const { data = {}, diaRang } = this.props;
    const { viewIds = [] } = data;
    return (
      <RangeBox
        className="rangeBox Absolute"
        style={{ left: 645 }}
        ref={el => {
          this.el = el;
        }}
      >
        <HeaderRange className="headerRange Font14 Gray">
          {_l('使用范围')}
          <Icon
            icon="close"
            className="Font18 Gray_9e Hand"
            onClick={() => {
              this.props.closeFn();
            }}
          />
        </HeaderRange>
        <div className="con">
          <h5 className="Blod">{_l('用户')}</h5>
          <Radio
            text={_l('所有用户')}
            checked={this.props.roleType !== 100}
            onClick={() => {
              this.props.change(0);
            }}
          />
          <p className="mLeft25 mTop10 mBottom16">
            {
              // _l('由用户所在角色的权限配置决定')
            }
          </p>
          <Radio
            text={_l('仅管理员')}
            checked={this.props.roleType === 100}
            onClick={() => {
              this.props.change(100);
            }}
          />
        </div>
        {this.props.hasViewRange && (
          <React.Fragment>
            <div className="conLine"></div>
            <div className="con">
              <h5 className="Blod">{_l('视图')}</h5>
              <Radio
                text={this.props.text.allview || _l('所有视图')}
                checked={viewIds.length <= 0 && diaRang}
                onClick={() => {
                  this.props.changeViewRange({
                    viewIds: [],
                    diaRang: true,
                  });
                }}
              />
              <p className="mLeft25 mTop10 mBottom16"></p>
              <Radio
                text={this.props.text.assignview || _l('应用于指定的视图')}
                checked={viewIds.length > 0 || !diaRang}
                onClick={() => {
                  this.props.changeViewRange({
                    // viewIds: this.props.views.map(o => {
                    //   return o.viewId;
                    // }),
                    viewIds: [],
                    diaRang: false,
                  });
                }}
              />
              <p className="mLeft25 mTop10 mBottom16"></p>
              {!diaRang &&
                this.props.views.map(it => {
                  return (
                    <div
                      className="mTop15 mLeft25 inputTxt Hand"
                      onClick={() => {
                        if (viewIds.includes(it.viewId)) {
                          // if (viewIds.length <= 1) {
                          //   alert('至少选中一个视图！');
                          //   return;
                          // }
                          this.props.changeViewRange({
                            viewIds: _.pull(viewIds, it.viewId),
                            diaRang: false,
                          });
                        } else {
                          this.props.changeViewRange({
                            viewIds: (viewIds || []).concat(it.viewId),
                            diaRang: false,
                          });
                        }
                      }}
                    >
                      <input
                        type="checkbox"
                        className="viewInput TxtMiddle"
                        checked={viewIds.includes(it.viewId)}
                      />
                      <span className="TxtMiddle">{it.name}</span>
                    </div>
                  );
                })}
            </div>
          </React.Fragment>
        )}
      </RangeBox>
    );
  }
}

export default Range;

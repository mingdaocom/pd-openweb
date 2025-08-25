import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { Checkbox, Icon, Radio, Tooltip } from 'ming-ui';
import withClickAway from 'ming-ui/decorators/withClickAway';

const RangeBox = styled.div`
  z-index: 100;
  width: 320px;
  border-radius: 3px;
  background: #ffffff 0% 0% no-repeat padding-box;
  box-shadow: 0px 12px 24px #0000003d;
  box-sizing: border-box;
  line-height: 1;
  font-size: 14px;
  font-weight: bold;
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
      color: #151515;
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
    color: #1677ff !important;
  }
`;

@withClickAway
class Range extends React.Component {
  el = null;
  containerRef = null;

  componentDidMount() {
    this.updatePosition();
    this.containerRef = document.querySelector('.switchBoxCon');
    window.addEventListener('resize', this.handleResize);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.top !== this.props.top) {
      this.updatePosition();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  handleResize = () => {
    this.updatePosition();
  };

  updatePosition = () => {
    setTimeout(() => {
      if (!this.el || !this.containerRef) return;

      const el = this.el;
      const { offsetWidth: w, offsetHeight: h } = el;
      const ul = document.querySelector('.switchBoxCon ul')?.getBoundingClientRect();

      Object.assign(el.style, {
        transition: 'all 0.3s',
        left: ul && ul.width + w + ul.left <= window.innerWidth ? `${Math.max(10, ul.width)}px` : 'initial',
        right: ul && ul.width + w + ul.left > window.innerWidth ? '-40px' : 'initial',
        top: `${this.props.top - (h + this.props.top > this.containerRef.offsetHeight ? h - 48 : 0)}px`,
      });
    }, 0);
  };

  render() {
    const { data = {}, diaRang } = this.props;
    const { viewIds = [] } = data;

    return (
      <RangeBox
        className="rangeBox Absolute"
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
          <h5>{_l('用户')}</h5>
          <Radio
            text={_l('所有用户')}
            checked={this.props.roleType !== 100}
            onClick={() => {
              this.props.change(0);
            }}
          />
          <p className="mLeft25 mTop10 mBottom16" />
          <Radio
            title={_l('仅系统角色')}
            text={
              <span className="TxtMiddle">
                {_l('仅系统角色')}
                <Tooltip popupPlacement="bottom" text={<span>{_l('包含管理员、运营者、开发者')}</span>}>
                  <Icon icon="info_outline" className="Gray_9e Font16 TxtTop mLeft5" />
                </Tooltip>
              </span>
            }
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
              <h5>{_l('视图')}</h5>
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
                    viewIds: [],
                    diaRang: false,
                  });
                }}
              />
              <p className="mLeft25 mTop10 mBottom16"></p>
              {!diaRang &&
                this.props.views
                  .filter(l => l.viewId !== l.worksheetId)
                  .map(it => {
                    return (
                      <Checkbox
                        key={it.viewId}
                        className="mTop15 mLeft25 Normal"
                        text={it.name}
                        checked={viewIds.includes(it.viewId)}
                        onClick={checked => {
                          this.props.changeViewRange({
                            viewIds: checked ? _.pull(viewIds, it.viewId) : (viewIds || []).concat(it.viewId),
                            diaRang: false,
                          });
                        }}
                      />
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

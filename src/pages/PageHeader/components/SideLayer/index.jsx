import React, { Component, Fragment } from 'react';
import { string } from 'prop-types';
import { Motion, spring } from 'react-motion';
import HomepageIcon from '../HomepageIcon';
import IndexSide from '../IndexSide';
import styled from 'styled-components';

const HomepageIconWrap = styled.div`
  .homepageIcon .item {
    background-color: rgba(0, 0, 0, 0.6);
  }
`;
export default class SideLayer extends Component {
  static propTypes = {};
  static defaultProps = {};
  state = {
    indexSideVisible: false,
  };
  changeIndexVisible = (visible = true) => {
    this.timer = setTimeout(() => {
      this.setState({ indexSideVisible: visible });
    }, 100);
  };
  render() {
    const { indexSideVisible } = this.state;
    return (
      <Fragment>
        <HomepageIconWrap
          className="homepageIconWrap"
          onClick={this.changeIndexVisible}
          onMouseEnter={this.changeIndexVisible}
          onMouseLeave={() => clearTimeout(this.timer)}>
          <HomepageIcon />
        </HomepageIconWrap>
        <Motion style={{ x: spring(indexSideVisible ? 0 : -352) }}>
          {({ x }) => (
            <IndexSide
              posX={x}
              visible={indexSideVisible}
              onClose={() => this.setState({ indexSideVisible: false })}
              onClickAway={() => indexSideVisible && this.setState({ indexSideVisible: false })}
            />
          )}
        </Motion>
      </Fragment>
    );
  }
}

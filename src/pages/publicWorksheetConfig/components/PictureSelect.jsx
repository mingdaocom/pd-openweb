import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import styled from 'styled-components';

const PicList = styled.div`
  margin-top: 10px;
  height: 260px;
`;
const Pic = styled.div`
  cursor: pointer;
  position: relative;
  width: 80px;
  height: 60px;
  display: inline-block;
  margin-right: 6px;
  background-size: cover !important;
  background-color: rgba(0, 0, 0, 0.4) !important;
  :nth-child(3n) {
    margin-right: 0px;
  }
  .picMask,
  .icon {
    visibility: hidden;
  }
  :hover {
    .picMask {
      visibility: visible;
    }
  }
  .active.picMask {
    visibility: visible;
  }
  .active.picMask .icon {
    visibility: visible;
  }
`;
const PicMask = styled.div`
  position: absolute;
  width: 80px;
  height: 60px;
  background-color: rgba(0, 0, 0, 0.2);
  text-align: center;
  line-height: 60px;
  font-size: 20px;
  color: #fff;
`;
const Pages = styled.div`
  text-align: center;
`;
const PageCon = styled.div`
  cursor: pointer;
  display: inline-block;
  padding: 3px 5px;
`;
const Page = styled.div(
  ({ active }) => `
  width: 8px;
  height: 8px;
  border-radius: 6px;
  background: ${active ? '#9E9E9E' : '#E0E0E0'};
  vertical-align: middle;
`,
);

export default class extends React.Component {
  static propTypes = {
    coverUrl: PropTypes.string,
    images: PropTypes.arrayOf(PropTypes.string),
    onChange: PropTypes.func,
  };
  constructor(props) {
    super(props);
    this.state = {
      pageIndex: 0,
    };
  }
  render() {
    const { images, coverUrl, onChange = () => {} } = this.props;
    const { pageIndex } = this.state;
    return (
      <div>
        <PicList>
          {images.slice(pageIndex * 12, (pageIndex + 1) * 12).map(url => (
            <Pic
              onClick={() => onChange(md.global.FileStoreConfig.pubHost + url)}
              style={{ background: `url(${md.global.FileStoreConfig.pubHost + url}?imageView2/1/w/160)` }}
            >
              <PicMask className={cx('picMask', { active: md.global.FileStoreConfig.pubHost + url === coverUrl })}>
                <i className="icon icon-hr_ok"></i>
              </PicMask>
            </Pic>
          ))}
        </PicList>
        <Pages>
          {[...new Array(Math.ceil(images.length / 12))].map((a, i) => (
            <PageCon
              onClick={() => {
                this.setState({ pageIndex: i });
              }}
            >
              <Page active={i === pageIndex} />
            </PageCon>
          ))}
        </Pages>
      </div>
    );
  }
}

import React from 'react';
import PropTypes from 'prop-types';

/**
 * 动态和回复的脚，左侧是发布时间和来源，右侧由父组件通过children传入
 */
function PostFooter(props) {
  const { source, location } = props;

  let from;
  if (source) {
    if (!source.detailUrl) {
      from = _l('通过 %0', `<a target="_blank" rel="noopener noreferrer" href='${source.appUrl}'>${source.name}</a>`);
    } else {
      from = _l(
        '通过 %0 的 %1',
        `<a target="_blank" rel="noopener noreferrer" href='${source.appUrl}'>${source.name}</a>`,
        `<a target="_blank" rel="noopener noreferrer" href='${source.detailUrl}' title="${source.detailName}"><span class="detailName ellipsis">${
          source.detailName
        }</span></a>`
      );
    }
  }

  return (
    <div className="postFooter">
      <a href={props.detailUrl} target="_blank" rel="noopener noreferrer" className="Gray_a">
        {!props.updateTime || props.createTime === props.updateTime ? (
          <span title={_l('点击查看详情')}>{createTimeSpan(props.createTime)}</span>
        ) : (
          <span data-tip={_l('发布于 %0', createTimeSpan(props.createTime))}>{_l('编辑于 %0', createTimeSpan(props.updateTime))}</span>
        )}
      </a>
      {from && (
        <span>
          <span className="Gray_a mLeft5" dangerouslySetInnerHTML={{ __html: from }} />
          {source.detailType && <span className="Gray_a"> {source.detailType} </span>}
        </span>
      )}
      {location && (
        <span
          onClick={(e) => {
            if (!location.longitude || !location.latitude) {
              alert(_l('对不起，没有获取到该地点详细信息'), 3);
              e.preventDefault();
            }
          }}
        >
          <a
            href={`http://ditu.amap.com/regeo?lng=${location.longitude}&lat=${location.latitude}&name=${location.name || ''}&src=uriapi`}
            className="postLocation Font12 ThemeColor3 Hand"
            rel="noopener noreferrer"
            target="_blank"
          >
            <span className="icon icon-locate" />
            {location.name}
          </a>
        </span>
      )}
      <span className="actions right">{props.children}</span>
    </div>
  );
}
PostFooter.propTypes = {
  children: PropTypes.any,
  createTime: PropTypes.string.isRequired,
  updateTime: PropTypes.string,
  source: PropTypes.object,
  location: PropTypes.object,
  detailUrl: PropTypes.string,
};

export default PostFooter;

import React, { useRef } from 'react';
import DialogLayer from 'mdDialog';
import ReactDom from 'react-dom';
import ViewEmblem from 'src/pages/Personal/personalInfo/modules/ViewEmblem';

function BadgedInfo(props) {
  const { userInfo, isMe, getAccountId } = props;

  const viewEmblemRef = useRef(null);
  const handleViewEmblem = () => {
    const accountMedal = userInfo.accountMedal || [];
    const options = {
      container: {
        content: '',
        yesText: null,
        noText: null,
        header: _l('我的徽章'),
        noFn: () => {
          const arr1 = viewEmblemRef.current.state.showIds.sort().join('');
          const arr2 = accountMedal
            .map(x => x.medalId)
            .sort()
            .join('');
          if (arr1 !== arr2) {
            getAccountId();
          }
        },
      },
      dialogBoxID: 'viewEmblemDialogId',
      width: '960px',
    };
    ReactDom.render(
      <DialogLayer {...options}>
        <ViewEmblem ref={viewEmblemRef} />
      </DialogLayer>,
      document.createElement('div'),
    );
  };

  return (
    <div className="card mrItem BoderRadAll_5">
      <div className="mrItemTitle pLeft20 pRight20 pTop20">
        <span className="Font14 Hand">
          {isMe ? (
            <React.Fragment>
              <span className="bagedName">{_l('我的徽章')}</span>
              <span className="TxtMiddle">
                <span className="Right ThemeColor3 Hand Hover_49" onClick={handleViewEmblem}>
                  {_l('查看我的徽章')}
                </span>
              </span>
            </React.Fragment>
          ) : (
            <span className="bagedName">{_l('他的徽章')}</span>
          )}
        </span>
      </div>
      <div className="BorderBottom" />
      <div className="bagedBox pLeft20 pRight20 pBottom10 clearfix">
        {!userInfo.accountMedal || userInfo.accountMedal.length <= 0 ? (
          <li className="TxtLeft LineHeight40 Gray_a mTop10 Width200">{_l('暂无正在展示的徽章')}</li>
        ) : (
          userInfo.accountMedal.map((item, index) => {
            return (
              <li className="Left Relative mRight5 mTop5" key={index}>
                <img src={item.smallPath} title={item.medalName} />
                <span className="badgeCount Absolute boderRadAll_3 TxtCenter card Font12 Gray_8">
                  {item.count ? item.count : 1}
                </span>
              </li>
            );
          })
        )}
      </div>
    </div>
  );
}

export default BadgedInfo;

import React from 'react';
import MedalContent from './medalContent';
import VoteContent from './voteContent';
import UploadFiles from 'src/components/UploadFiles';
import LinkContent from './linkContent';

/**
 * 获取相应类型动态附加的信息
 */
function getSpecificComponent(postItem, isReshare) {
  let component;
  const postType = parseInt(postItem.postType, 10);
  if (isReshare && postType !== 1 && postType !== 2 && postType !== 3 && postType !== 8 && postType !== 9) {
    return false;
  }
  switch (postType) {
    case 0: // medal
      if (postItem.MedalPost) {
        component = <MedalContent medal={postItem.MedalPost} />;
      }
      break;
    case 1: // link
      component = <LinkContent linkItem={postItem} />;
      break;
    case 2: // pic
    case 3: // doc
    case 9: // pic and doc
      component = (
        <div className="mTop10">
          <UploadFiles isUpload={false} attachmentData={postItem.attachments} />
        </div>
      );
      break;
    case 7: // vote
      if (postItem.VoteID) {
        component = <VoteContent voteItem={postItem} />;
      }
      break;
  }

  return component || false;
}

export default getSpecificComponent;

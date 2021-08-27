#### Commenter.jsx    讨论回复框组件
	import Comment from 'src/components/comment/commenter';
	var Comment = require('src/components/comment/commenter.jsx').default;

	<Comment onSubmit={回调方法  Function  参数：{ message, attachments, kcAttachmentData }}
		mentionsOptions={{ searchType: 1, isTaskAtAll: true }}
		uploadAttachmentOptions={{ uploadFrom: 2 }}
		selectGroupOptions={{ projectId:  }}
		storageId={数据id  缓存未发送的内容用的 string}
		appId={string}
		remark={数据id + '|' + '名称' + '|' + '模块名'} />

#### CommentList.jsx  列表組件
	import CommentList from 'src/components/comment/commentList';
	var CommentList = require('src/components/comment/commentList.jsx').default;

	<CommentList addComment={回调方法  Function  参数：{ message, attachments, kcAttachmentData }}
		commentList={列表数据源  Array}
		getTalkMessage={获取回复内容 Function  参数：{ replyId }}
		removeTalk={删除讨论  Function  参数：{ id }}
		placeholder={string}
		isFocus={true}
		mentionsOptions={{ searchType: 1, isTaskAtAll: true }}
		uploadAttachmentOptions={{ uploadFrom: 2 }}
		selectGroupOptions={{ projectId:  }}
		appId={string}
		submitButtonText="string"
		remark={数据id + '|' + '名称' + '|' + '模块名'} />

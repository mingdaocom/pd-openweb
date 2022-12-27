import _ from 'lodash';
export default function (url, navigate = toUrl => (location.href = toUrl)) {
  if (url === '/app/my') {
    const latestGroup = safeParse(localStorage.getItem(`latest_group_${md.global.Account.accountId}`));
    if (!_.isEmpty(latestGroup)) {
      navigate(`/app/my/group/${latestGroup.projectId}/${latestGroup.groupType}/${latestGroup.groupId}`);
      return true;
    }
  }
}

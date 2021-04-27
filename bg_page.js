chrome.runtime.onMessage.addListener(
  function(core, sender, onSuccess) {
    const jiraUrl = localStorage.getItem('jiraUrl')
    const jiraUserName = localStorage.getItem('jiraUserName')
    const jiraUserSecret = localStorage.getItem('jiraUserSecret')
    const jiraBoardId = localStorage.getItem('jiraBoardId')
    const jiraProjectName = localStorage.getItem('jiraProjectName')

    if(core.action == 'isHoliday') {
      // const url = 'http://s-proj.com/utils/checkHoliday.php?date=20210424'
      const isHolidayUrl = `http://s-proj.com/utils/checkHoliday.php?date=${core.date}`
      fetch(isHolidayUrl)
        .then(response => response.text())
        .then(responseText => onSuccess(responseText))
    } else if (core.action == 'activeSprint') {
      // Jira Rest Apiを叩き（Basic認証）activeなスプリントのデータを取得
      const activeSprintUrl = jiraUrl + '/rest/agile/1.0/board/' + jiraBoardId + '/sprint?state=active'
      let headers = new Headers()
      headers.set('Authorization', 'Basic ' + btoa(jiraUserName + ":" + jiraUserSecret))
      fetch(activeSprintUrl, {method:'GET',
        headers: headers
      })
      .then(response => response.json())
      .then(responseText => onSuccess(responseText))
    } else if (core.action == 'fetchAllParentTasks') {
      const fetchAllParentTasksUrl = `${jiraUrl}/rest/api/3/search?jql=project = ${jiraProjectName} AND sprint in openSprints()`
      let headers = new Headers()
      headers.set('Authorization', 'Basic ' + btoa(jiraUserName + ":" + jiraUserSecret))
      fetch(fetchAllParentTasksUrl, {method:'GET',
        headers: headers
      })
      .then(response => response.json())
      .then(responseText => onSuccess(responseText))
    } else if (core.action == 'fetchAllChildrenTaskTime') {
      const fetchAllChildrenTaskTimeUrl = `${jiraUrl}/rest/api/3/search?jql=${core.parentTasksForJql}`
      let headers = new Headers()
      headers.set('Authorization', 'Basic ' + btoa(jiraUserName + ":" + jiraUserSecret))
      fetch(fetchAllChildrenTaskTimeUrl, {method:'GET',
        headers: headers
      })
      .then(response => response.json())
      .then(responseText => onSuccess(responseText))
    }
    // TODO: 残り2つJira Rest Apiを叩く部分を実装
    return true;  // Will respond asynchronously.
  }
);

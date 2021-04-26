chrome.runtime.onMessage.addListener(
  function(core, sender, onSuccess) {
    const jiraUrl = localStorage.getItem('jiraUrl')
    const jiraUserName = localStorage.getItem('jiraUserName')
    const jiraUserSecret = localStorage.getItem('jiraUserSecret')
    const jiraBoardId = localStorage.getItem('jiraBoardId')
    const jiraProjectName = localStorage.getItem('jiraProjectName')

    if(core.action == 'isHoliday') {
      // const url = 'http://s-proj.com/utils/checkHoliday.php?date=20210424'
      const url = `http://s-proj.com/utils/checkHoliday.php?date=${core.date}`
      fetch(url)
        .then(response => response.text())
        .then(responseText => onSuccess(responseText))
    } else if (core == 'getSprint') {
      // Jira Rest Apiを叩き（Basic認証）activeなスプリントのデータを取得
      const url2 = jiraUrl + '/rest/agile/1.0/board/' + jiraBoardId + '/sprint?state=active'
      let headers = new Headers()
      headers.set('Authorization', 'Basic ' + btoa(jiraUserName + ":" + jiraUserSecret))
      fetch(url2, {method:'GET',
        headers: headers
      })
      .then(response => response.json())
      .then(responseText => onSuccess(responseText))
    }
    // TODO: 残り2つJira Rest Apiを叩く部分を実装
    return true;  // Will respond asynchronously.
  }
);

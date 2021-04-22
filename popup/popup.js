async function isHoliday() {
  // const action = 'isHoliday'
  const action = 'getSprint'
  chrome.runtime.sendMessage( //goes to bg_page.js
    action,
    function (response) {
      alert(response)
      console.log(response)
    }
  )
  
  return true
}

document.querySelector('#render').addEventListener('click', async (e) => {
  e.preventDefault()
  try {
    isHoliday()
  } catch (e) {
    console.log(e)
  }
})

document.querySelector('#settings').addEventListener('click', async (e) => {
  e.preventDefault()
  try {
    const jiraUrl = localStorage.getItem('jiraUrl')
    const jiraUserName = localStorage.getItem('jiraUserName')
    const jiraUserSecret = localStorage.getItem('jiraUserSecret')
    const jiraBoardId = localStorage.getItem('jiraBoardId')
    const jiraProjectName = localStorage.getItem('jiraProjectName')
    const message = `JiraのURL: ${jiraUrl}\nJiraのユーザー名: ${jiraUserName}\nJiraのユーザーSecret: ${jiraUserSecret}\nJiraのboardID: ${jiraBoardId}\nJiraのプロジェクト名: ${jiraProjectName}\n設定を変更しますか？`
    const changeSettings = window.confirm(message)
    if (changeSettings) {
      const newJiraUrl = window.prompt('JiraのURL', jiraUrl)
      localStorage.setItem('jiraUrl', newJiraUrl)
      const newJiraUserName = window.prompt('Jiraのユーザー名', jiraUserName)
      localStorage.setItem('jiraUserName', newJiraUserName)
      const newJiraUserSecret = window.prompt('JiraのユーザーSecret', jiraUserSecret)
      localStorage.setItem('jiraUserSecret', newJiraUserSecret)
      const newJiraBoardId = window.prompt('JiraのboardID', jiraBoardId)
      localStorage.setItem('jiraBoardId', newJiraBoardId)
      const newJiraProjectName = window.prompt('Jiraのプロジェクト名', jiraProjectName)
      localStorage.setItem('jiraProjectName', newJiraProjectName)
    }
  } catch (e) {
    console.log(e)
  }
})

var ctx = document.getElementById("chart").getContext('2d');
var chart = new Chart(ctx, {
  type: 'line',
data: {
  labels: ['8月1日', '8月2日', '8月3日', '8月4日', '8月5日', '8月6日', '8月7日'],
  datasets: [
    {
      label: '計画',
      lineTension: 0,
      backgroundColor: '#7FC3FF',
      fill: false,
      borderColor: '#7FC3FF',
      borderWidth: 3,
      pointHitRadius: 15,
      hoverRadius: 10,
      radius: 5,
      pointStyle: 'circle',
      data: [35, 30, 25, 20, 15, 10, 5, 0],
      borderDash: [5, 5]
    },
    {
      label: '実績',
      lineTension: 0,
      backgroundColor: '#00bfff',
      fill: false,
      borderColor: '#00bfff',
      borderWidth: 5,
      pointHitRadius: 15,
      hoverRadius: 10,
      radius: 5,
      pointStyle: 'rectRounded',
      data: [35, 27, 24, 16, 13, 8]
    }
  ],
},
options: {
  title: {
    display: true,
    text: '気温（8月1日~8月7日）'
  },
  scales: {
    yAxes: [{
      ticks: {
        suggestedMax: 40,
        suggestedMin: 0,
        stepSize: 10,
        callback: function(value, index, values){
          return  value +  '度'
        }
      }
    }]
  },
}
});
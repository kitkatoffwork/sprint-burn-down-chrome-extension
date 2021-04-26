async function renderChart() {
  // アクティブなスプリントを取得
  const activeSprintResponse = await coreAPI({ action: 'activeSprint' })
  console.log(activeSprintResponse)

  // 今回のスプリントで開発できる日付リストを取得
  let startDate = moment(activeSprintResponse.values[0].startDate)
  let endDate = moment(activeSprintResponse.values[0].endDate)
  const days = await businessDays(startDate, endDate)
  console.log('days')
  console.log(days)

  // 今回スプリントの全親タスク（Story）を取得

  // 全ての子タスク分の時間を取得

  // スプリント開始から今日まで日ごとに消化したタスク取得

  // issues.fields.resolutiondateの日付でタスク完了日を取得、issues.fields.timeestimateでタスクの所要時間を取得しグラフ描画情報を設定
  
  return true
}

async function businessDays (sDate, eDate) {
  let dateList = [] // start-end範囲内に存在する日付リスト
  // スプリント最終日は開発を行わない（レビュー日）ため計画から除く
  for (let d = sDate; d < eDate; d.add(1, "days")) {
    const response = await coreAPI({ action: 'isHoliday', date: d.format("YYYYMMDD") })
    if (response != 'holiday') dateList.push(d.format("YYYYMMDD"))
  }
  return dateList
}

// backgroundのAPICallをPromiseでラップすることでasync/awaitが使えるようになる
function coreAPI(payload) {
  return new Promise(function (resolve) {
    chrome.runtime.sendMessage( //goes to bg_page.js
      payload,
      function (response) {
        resolve(response)
      }
    )
  })
}

document.querySelector('#render').addEventListener('click', async (e) => {
  e.preventDefault()
  try {
    renderChart()
  } catch (e) {
    console.log(e)
  }
})

// "Settings"ボタンクリック→Jira Rest APIへアクセスするための情報をセット
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

// チャート描画データ
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
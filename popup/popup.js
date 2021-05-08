window.onload = function() {
  try {
    if (isSettingIncludesNull()) throw 'Setting includes null'
    renderChart()
  } catch (e) {
    alert('Settingsの登録値を見直してください')
    // loadingアニメーション終了
    const spinner = document.getElementById('loading');
    spinner.classList.add('loaded');
    console.log(e)
  }
}

async function renderChart() {
  try {
    // アクティブなスプリントを取得
    const activeSprintResponse = await coreAPI({ action: 'activeSprint' })

    // 今回のスプリントで開発できる日付リストを取得
    let startDate = moment(activeSprintResponse.values[0].startDate)
    let endDate = moment(activeSprintResponse.values[0].endDate)  
    const days = await businessDays(startDate, endDate)

    // 今回スプリントの全親タスク（Story）を取得
    const allParentTasksResponse = await coreAPI({action: 'fetchAllParentTasks'})
    const parentTasksForJql = makeParentTasksForJql(allParentTasksResponse.issues)

    // 全ての子タスク分の時間を取得
    const allChildrenTaskTimeResponse = await coreAPI({action: 'fetchAllChildrenTaskTime', parentTasksForJql: parentTasksForJql})
    const issues = allChildrenTaskTimeResponse.issues
    const sprintFullTime = calcSprintFullTime(issues)
    const timeLeftPlan = makeTimeLeftPlan(sprintFullTime, days)

    // スプリント開始から今日まで日ごとに消化したタスク取得
    let timeLeft = sprintFullTime
    let timeLeftLog = []

    // issues.fields.resolutiondateの日付でタスク完了日を取得、issues.fields.timeestimateでタスクの所要時間を取得しグラフ描画情報を設定
    for (const day of days) {
      if (moment(day).isAfter(moment())) {
        break
      }
      for (const issue of issues) {
        if (day == moment(issue.fields.resolutiondate).format("YYYY-MM-DD")) {
          timeLeft -= convertSecond2Hour(issue.fields.timeestimate)
        }
      }
      // 残り時間の実績に追加
      timeLeftLog.push(timeLeft)
      // タスク残時間・先行遅れ・進捗率を更新
      taskLeft = timeLeftLog.slice(-1)[0].toFixed(1)
    }

    // チャートを描画する
    updateChart(days, timeLeftPlan, timeLeftLog)
  } catch (e) {
    alert('Settingsの登録値を見直してください')
    console.log(e)
  }

  // loadingアニメーション終了
  const spinner = document.getElementById('loading');
  spinner.classList.add('loaded');

  return true
}

async function businessDays (sDate, eDate) {
  let dateList = [] // start-end範囲内に存在する日付リスト
  // スプリント最終日は開発を行わない（レビュー日）ため計画から除く
  for (let d = sDate; d < eDate; d.add(1, "days")) {
    const response = await coreAPI({ action: 'isHoliday', date: d.format("YYYY-MM-DD") })
    if (response != 'holiday') dateList.push(d.format("YYYY-MM-DD"))
  }
  return dateList
}

function calcSprintFullTime (issues) {
  let sprintFullTime = 0
  for (const el of issues) {
    sprintFullTime += el.fields.timeestimate
  }
  // 秒単位→時間単位へ変換
  return this.convertSecond2Hour(sprintFullTime)
}

function convertSecond2Hour (sec) {
  return sec / 3600
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

function makeParentTasksForJql (issues) {
  let parentTasksForJql = ''
  for (const el of issues) {
    parentTasksForJql += 'parent = ' + el.key
    if (el != issues.slice(-1)[0]) {
      parentTasksForJql += ' OR '
    }
  }
  return parentTasksForJql
}

function makeTimeLeftPlan (sprintFullTime, sprintDays) {
  const timeAvailablePerDay = sprintFullTime / (sprintDays.length - 1)
  let timeLeftPlanNum = sprintFullTime
  let timeLeftPlan = []
  for (const day of sprintDays) {
    timeLeftPlan.push(timeLeftPlanNum)
    timeLeftPlanNum -= timeAvailablePerDay
  }
  // 最終日は0に固定（浮動小数点演算のため計算結果が0にならないケースがあるため）
  timeLeftPlan.pop()
  timeLeftPlan.push(0)
  return timeLeftPlan
}

function isSettingIncludesNull () {
  const jiraUrl = localStorage.getItem('jiraUrl')
  const jiraUserName = localStorage.getItem('jiraUserName')
  const jiraUserSecret = localStorage.getItem('jiraUserSecret')
  const jiraBoardId = localStorage.getItem('jiraBoardId')
  const jiraProjectName = localStorage.getItem('jiraProjectName')
  if ([jiraUrl, jiraUserName, jiraUserSecret, jiraBoardId, jiraProjectName].includes(null)) return true
  return false
}

document.querySelector('#render').addEventListener('click', async (e) => {
  e.preventDefault()
  try {
    if (isSettingIncludesNull()) throw 'Setting includes null'
    if (chart) {
      // loadingアニメーション開始
      const spinner = document.getElementById('loading');
      spinner.classList.remove('loaded');
      chart.destroy();
    }
    renderChart()
  } catch (e) {
    alert('Settingsの登録値を見直してください')
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

function updateChart(days, timeLeftPlan, timeLeftLog) {
  // チャート描画データ
  var ctx = document.getElementById("chart").getContext('2d');
  window.chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: days,
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
          data: timeLeftPlan,
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
          data: timeLeftLog
        }
      ],
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            suggestedMax: 40,
            suggestedMin: 0,
            stepSize: 10
          }
        }]
      },
    }
  });
}

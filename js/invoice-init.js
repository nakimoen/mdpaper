// 初期化

//日付
(() => {
  const date = new Date();
  // const day = date.getDay();
  // if (day !== 5) {
  //   date.setDate(date.getDate() - (day === 6 ? 1 : day + 2));
  // }
  const y = date.getFullYear();
  const m = date.getMonth() + 1 + '';
  const d = date.getDate() + '';
  const input = document.querySelector('#date-input');
  input.value = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;

  input.dispatchEvent(new Event('change'));
})();

// テンプレート
(() => {
  const template = localStorage.getItem('template');
  if (template) {
    const obj = JSON.parse(template);
    const sele = document.querySelector('#sele-template');
    Object.keys(obj)
      .sort()
      .forEach((key) => {
        const opt = document.createElement('option');
        opt.value = key;
        opt.innerText = key;
        sele.appendChild(opt);
      });
  }
})();
//給与
const id = '#' + (localStorage.feeType == 1 ? 'fee-week' : 'fee-month');
document.querySelector(id).classList.add('fee-mark');

// document.querySelector('#start-date-input').dispatchEvent(new Event('change'));
(() => {
  const today = new Date();
  let ind = today.getDay();
  ind = ind - (ind >= 5 ? 5 : -2);

  const name = nameStorage();
  document.querySelector('#name-text').innerText = name;

  // 記入日セット
  // document.querySelector('#date-select').selectedIndex = ind;

  // 色付け
  document
    .querySelector('#row_3 > table > tbody > tr:nth-child(' + (ind + 1) + ')')
    .classList.add('active');

  // load
  loadALlRow();
  // ポスト数
  drawPostSum();
  // 残業
  drawOvertimeSum();
  // 経費合計
  drawSumOfFee();

  // 就業時間
  const srartfridaystr = getStartFriday(today, true);
  const data = JSON.parse(localStorage.getItem(srartfridaystr));
  // const ind = (() => {
  //   const day = today.getDay();
  //   if (day / 5 >= 1) {
  //     return day % 5;
  //   }
  //   return (day % 5) + 2;
  // })();
  if (data && data[ind]) {
    document.querySelector('#start-time-input').value =
      data[ind].worktime.start;
    document.querySelector('#finish-time-input').value =
      data[ind].worktime.finish;
  }

  setThisMonthFee(today.getFullYear(), today.getMonth() + 1);
})();

function setThisMonthFee(y, m) {
  document.querySelector('#thisMonthFee').innerText = getMonthData(
    y,
    m
  ).toLocaleString();
}
function reset() {
  const rows = document.querySelectorAll('#row_3 > table > tbody > tr');
  rows.forEach((row) => {
    row.querySelector('td:nth-child(11)').innerText = '';

    const cols = row.querySelectorAll('td:nth-of-type(n+3):nth-of-type(-n+6)');
    cols.forEach((col, ind) => {
      if (ind == 0) {
        col.querySelectorAll('td').forEach((td) => {
          td.innerText = '';
        });
      } else if (ind == 1) {
        col.querySelector('td span').innerText = '';
      } else if (ind == 2) {
        try {
          col.querySelector('.way-selected').classList.remove('way-selected');
        } catch {}
      } else {
        col.querySelector('div').innerHTML = '';
      }
    });
  });

  drawPostSum();
  drawOvertimeSum();
  drawSumOfFee();

  clearDetails();
  clearWorkRestTime();
}

//================ポスト数
function drawPostSum() {
  document.querySelector(
    '#row_3 #table-foot > tr > td:nth-child(2) span'
  ).textContent = (() => {
    let count = 0;
    const rows = document.querySelectorAll('#row_3 > table > tbody > tr');
    for (let i = 0; i < 7; i++) {
      const row = rows[i];
      const cell = row.querySelector('td:nth-child(3) td');
      const sitecell = row.querySelector('td:nth-child(3) tr:nth-child(2) td');
      const text = cell.innerText;
      let color = 'black';
      if (text && text.trim()) {
        const half = text.match(/【((半日)|(巡回))】.*/);
        const cancel = text.match(/.*【((..)中止)】.*/);
        if (half) {
          count += 0.5;
          color = 'blue';
        } else if (cancel) {
          if (cancel[2] === '現着') {
            count += 0.5;
            color = 'blue';
          } else {
            color = 'red';
          }
        } else {
          count++;
        }
      }
      cell.style.color = color;
      sitecell.style.color = color;
    }
    return count;
  })();
}

//残業
function drawOvertimeSum() {
  const rows = document.querySelectorAll('#row_3 > table > tbody > tr');

  let overtime = 0;
  let flg = false;
  rows.forEach((row) => {
    const time = Number(row.querySelector('td:nth-child(4) span').innerText);
    if (!isNaN(time)) {
      flg = true;
      overtime += time;
    }
  });

  if (flg)
    document.querySelector(
      '#row_3 #table-foot > tr > td:nth-child(4) span'
    ).innerText = overtime;
}

function drawSumOfFee() {
  const rows = document.querySelectorAll('#row_3 > table > tbody > tr');

  let sum = 0;
  rows.forEach((row) => {
    const fee = Number(row.querySelector('td:nth-child(11)').innerText);
    if (!isNaN(fee)) {
      sum += fee;
    }
  });

  document.querySelector(
    '#row_3 #table-foot > tr > td:nth-child(6)'
  ).innerHTML = `<b class='font-big'>${sum.toLocaleString()}</b>`;
}
//================書き出し
function output() {
  const startDateStr = document
    .querySelector('#date-input')
    .value.replaceAll('-', '');
  const data = {};
  Object.keys(localStorage).filter((key) => {
    if (/(^\d{8}$)|(name)/.test(key)) {
      data[key] = localStorage.getItem(key);
    }
  });
  // const data = localStorage.getItem(startDateStr);
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });

  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'md_' + startDateStr + '.json';
  a.click();
}
//================読み込み

document.getElementById('file-input').addEventListener('change', (evt) => {
  let input = evt.target;
  if (input.files.length == 0) {
    console.log('No file selected');
    return;
  }
  const file = input.files[0];
  const reader = new FileReader();
  reader.onload = () => {
    const json = JSON.parse(reader.result);
    Object.keys(json).forEach((datekey) => {
      localStorage.setItem(datekey, json[datekey]);
    });
  };

  reader.readAsText(file);
});

//================保存・呼び出し
function setName() {
  nameStorage(document.querySelector('#name-input').value);
}
function nameStorage(name = null) {
  if (name) {
    return localStorage.setItem('name', name);
  } else {
    return localStorage.getItem('name');
  }
}
function loadALlRow() {
  clearDetails();
  clearWorkRestTime();

  NEXT_DETAIL_NUMBER = 0;

  for (let i = 0; i < 7; i++) {
    loadRow(i);
  }
}
function loadRow(rowInd) {
  const startDateStr = formatDate(
    getStartFriday(document.querySelector('#date-input').value)
  );
  // .value.replaceAll('-', '');

  const rows = document.querySelectorAll('#row_3 > table > tbody > tr');
  let data = localStorage.getItem(startDateStr);
  if (data) {
    data = JSON.parse(data);
    const row = rows[rowInd];
    const rowData = data[rowInd];

    const [tdVendor, tdSite] = row.querySelectorAll('td:nth-child(3) td');
    tdVendor.textContent = rowData.vendor;
    tdSite.innerHTML =
      '<div><div>' + rowData.site.replaceAll('\n', '<br>') + '</div></div>';
    autoFontSizeHeight(
      tdSite.querySelector('div'),
      tdSite.querySelector('div > div')
    );

    const overtime = row.querySelector('td:nth-child(4) span');
    overtime.textContent = rowData.overtime;

    const pathWays = row.querySelectorAll('td .path-select .path-way');
    for (let way of pathWays) {
      way.classList.remove('way-selected');
      if (data[rowInd].way == way.innerHTML) {
        way.classList.add('way-selected');
        break;
      }
    }

    const path = row.querySelector('.path-detail-cell > div');
    path.innerHTML = rowData.path;
    path.querySelectorAll('div').forEach((div) => {
      const number = div.getAttribute('no');
      if (NEXT_DETAIL_NUMBER <= number) {
        NEXT_DETAIL_NUMBER = Number(number) + 1;
      }
      DETAILS[rowInd].push(div);
    });

    calcRowFee(row);

    //
    // 就業時間・休憩時間
    //
    const { start, finish } = data[rowInd].worktime;
    loadSaveWorkTime(rowInd, start, finish);

    RESTTIME[rowInd] = data[rowInd].resttime;
  }
}

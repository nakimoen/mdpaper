// 初期化
document.querySelector('#start-date-input').dispatchEvent(new Event('change'));
(() => {
  const today = new Date();
  let ind = today.getDay();
  ind = ind - (ind >= 5 ? 5 : -2);

  const name = nameStorage();
  const nameInput = document.querySelector('#name-input');
  nameInput.value = name;
  nameInput.dispatchEvent(new Event('change'));

  // 記入日セット
  document.querySelector('#date-select').selectedIndex = ind;

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
})();

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

document.querySelector('#date-select').dispatchEvent(new Event('change'));

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
      const text = cell.innerText;
      if (text && text.trim()) {
        const found = text.match(/.*((..)中止).*/);
        if (found) {
          const sitecell = row.querySelector(
            'td:nth-child(3) tr:nth-child(2) td'
          );

          if (found[2] === '現着') {
            count += 0.5;
            cell.style.color = 'blue';
            sitecell.style.color = 'blue';
          } else {
            cell.style.color = 'red';
            sitecell.style.color = 'red';
          }
        } else {
          count++;
        }
      }
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
    .querySelector('#start-date-input')
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
  const startDateStr = document
    .querySelector('#start-date-input')
    .value.replaceAll('-', '');

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

//
// テンプレート呼び出し
//
(() => {
  const site = localStorage.getItem('siteList');
  if (site) {
    const list = JSON.parse(site);
    const sele = document.querySelector('#site-select');
    list.forEach((item) => {
      const opt = document.createElement('option');
      opt.value = item;
      opt.innerText = item;
      sele.appendChild(opt);
    });
  }
})();

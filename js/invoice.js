let ROW_ID; // md
const COST_PER_KM = 20;
let NEXT_DETAIL_NUMBER = 0;
const DETAILS = [];
const WORKTIME = [];
const RESTTIME = [];
for (let i = 0; i < 7; i++) {
  DETAILS.push([]);
  WORKTIME.push({});
  RESTTIME.push([]);
}

function clearDetails() {
  for (let i = 0; i < 7; i++) {
    DETAILS[i] = [];
  }
}
function clearWorkRestTime() {
  for (let i = 0; i < 7; i++) {
    WORKTIME[i] = {};
    RESTTIME[i] = [];
  }
}

function getCurrentRow() {
  return document.querySelector('#' + ROW_ID);
}
//日付
(() => {
  const date = new Date();
  const day = date.getDay();
  if (day !== 5) {
    date.setDate(date.getDate() - (day === 6 ? 1 : day + 2));
  }
  const y = date.getFullYear();
  const m = date.getMonth() + 1 + '';
  const d = date.getDate() + '';
  const input = document.querySelector('#start-date-input');
  input.value = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
})();

document.querySelector('#name-input').addEventListener('change', function () {
  document.querySelector('#name-text').innerText = this.value;
});

// 開始日を入力（インプト）
document
  .querySelector('#start-date-input')
  .addEventListener('change', function (e) {
    reset();
    const [year, month, day] = this.value.split('-');
    loadALlRow();

    const date = new Date(this.value);

    if (date.getDay() !== 5) {
      alert('金曜日を選択してください');
      return;
    }
    // 各曜日の日付を表示
    document.querySelectorAll('.date-cell').forEach((elem, ind) => {
      const month = Number(date.getMonth() + 1);
      const d = Number(date.getDate());
      // row に ID（m-d）を振る
      elem.closest('tr').setAttribute('id', 'r' + month + d);
      elem.closest('tr').setAttribute('no', ind);
      elem.querySelector('.month').innerHTML = month;
      elem.querySelector('.day').innerHTML = d;
      date.setDate(date.getDate() + 1);
    });

    // 入力する日付リストを生成
    const select = document.querySelector('#date-select');
    select.innerHTML = '';
    const start = new Date(this.value);
    start.setDate(start.getDate());
    for (i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const opt = document.createElement('option');
      const mm = date.getMonth() + 1;
      opt.text =
        mm +
        '/' +
        date.getDate() +
        `(${['金', '土', '日', '月', '火', '水', '木'][i]})`;
      opt.value = i + 1;

      select.appendChild(opt);
    }
    document.querySelector('#date-select').dispatchEvent(new Event('change'));

    const today = new Date();
    today.getDate();

    setPostSum();
    setOvertimeSum();
  });

document.querySelector('#date-select').addEventListener('change', function () {
  const md = this.selectedOptions[0].text.slice(0, -3);
  ROW_ID = 'r' + md.replaceAll('/', '');

  const startDateStr = document
    .querySelector('#start-date-input')
    .value.replaceAll('-', '');

  const data = localStorage.getItem(startDateStr);
  const ind = this.selectedIndex;
  const rowData = data ? JSON.parse(data)[ind] : null;
  //TODO: validation
  document.querySelector('#vendor-input').value =
    data && rowData.vendor ? rowData.vendor : '';
  document.querySelector('#site-input').value =
    data && rowData.site ? rowData.site : '';
  document.querySelector('#overtime-input').value =
    data && rowData.overtime ? rowData.overtime : 0;

  document.querySelector('[name=way-radio]').checked = true;
  for (let way of document.querySelectorAll('[name=way-radio]')) {
    const label = way.closest('label');
    if (data && label.textContent.trim() == rowData.way) {
      way.checked = true;
      break;
    }
  }
  //
  // 各経路情報の読み込み
  //
  const rowdetails = DETAILS[this.selectedIndex];
  // reset list
  resetDetailOL();
  rowdetails.forEach((detail, ind) => {
    addDetailList(detail.innerHTML, true, detail.getAttribute('no'));
  });

  clearRestDraw();
  rowData.resttime.forEach((resttime) => {
    loadRestTime(ind, resttime.start, resttime.finish);
  });

  setPostSum();
  setOvertimeSum();
});

//業者・現場
function setname(self, id) {
  const name = self.value;
  const row = getCurrentRow();
  const query = `td:nth-child(3) tr:${
    id == 0 ? 'first-child' : 'nth-child(2)'
  } td`;
  row.querySelector(query).textContent = name;
}
document.querySelector('#vendor-input').addEventListener('change', function () {
  setname(this, 0);
});
document.querySelector('#site-input').addEventListener('change', function () {
  setname(this, 1);
});

// 残業
document
  .querySelector('#overtime-input')
  .addEventListener('change', function () {
    const row = getCurrentRow();
    row.querySelector('td:nth-child(4) span').textContent = this.value;
    setOvertimeSum();
  });

// 移動手段
document.querySelectorAll('#way-wrapper [type=radio]').forEach((elem) => {
  elem.addEventListener('change', function () {
    const wayind = Number(this.value);
    const row = getCurrentRow();
    const waydivs = row.querySelectorAll(
      'td:nth-child(5) .path-select .path-way'
    );
    // リセット
    waydivs.forEach((elem) => {
      elem.classList.remove('way-selected');
    });
    // セット
    if (wayind != -1) waydivs[wayind].classList.add('way-selected');
  });
});

// 就業時間
function loadSaveWorkTime(ind, start, finish) {
  if (start && finish) {
    WORKTIME[ind].start = start;
    WORKTIME[ind].finish = finish;
  }

  document.querySelector('#work-time-label span').innerHTML =
    !start || !finish
      ? ''
      : '<button onclick="clearWorktime()">×</button>' + start + '~' + finish;
}
function setWorkTime(load = false, start = null, finish = null) {
  const ind = Number(getCurrentRow().getAttribute('no'));
  const info = ((st, fin) => {
    if (load) {
      return WORKTIME[ind];
    } else {
      const sinput = document.querySelector('#start-time-input');
      const finput = document.querySelector('#finish-time-input');
      const start = st ? st : sinput.value;
      const finish = fin ? fin : finput.value;
      return { start, finish };
    }
  })(start, finish);

  loadSaveWorkTime(ind, info.start, info.finish);

  return info;
}

function clearWorktime() {
  const ind = Number(getCurrentRow().getAttribute('no'));
  WORKTIME[ind] = {};
  document.querySelector('#work-time-label span').innerHTML = '';
}
document
  .querySelector('#set-work-time-button')
  .addEventListener('click', function () {
    setWorkTime();
  });

//休憩時間
function setRestTimeInput(start, finish) {
  document.querySelector('#rest-start-input').value = start;
  document.querySelector('#rest-finish-input').value = finish;
}

function clearRestDraw() {
  document.querySelector('#rest-list ol').innerHTML = '';
}
function loadRestTime(ind, start, finish) {
  const li = document.createElement('li');
  li.innerHTML = `<button class="remove-button" onclick="removeRestTime('${start}', '${finish}',this)">×</button>${start}~${finish}`;

  document.querySelector('#rest-list ol').appendChild(li);
}
function addRestTime() {
  const start = document.querySelector('#rest-start-input').value;
  const finish = document.querySelector('#rest-finish-input').value;
  const ind = Number(getCurrentRow().getAttribute('no'));

  loadRestTime(ind, start, finish);
  RESTTIME[ind].push({ start: start, finish: finish });
}

function removeRestTime(start, finish, self) {
  const ind = Number(getCurrentRow().getAttribute('no'));
  RESTTIME[ind] = RESTTIME[ind].filter((val) => {
    return val.start != start && val.finish != finish;
  });
  self.closest('li').remove();

  // const v = RESTTIME[ind].indexOf({ start: start, finish: finish });
  // if (v !== -1) {
  //   RESTTIME[ind].splice(v, 1);
  // }
}
//料金 追加ボタン

function addTextToDetailsDiv(text) {
  const detailDiv = getCurrentRow().querySelector('.path-detail-cell div');
  const newline = document.createElement('div');
  newline.setAttribute('no', NEXT_DETAIL_NUMBER);
  newline.innerHTML = text;
  detailDiv.appendChild(newline);

  //フォントサイズ自動調整
  // そもそも最初のサイズが小さいので、無限ループにすぐ入る
  // TODO: 読み込み時
  while (detailDiv.scrollWidth > detailDiv.offsetWidth) {
    const fontSize = parseFloat(window.getComputedStyle(newline).fontSize);
    if (fontSize < 10) {
      newline.style.textWrap = 'wrap';
      break;
    }
    const newSize = fontSize - 1;
    newline.style.fontSize = newSize + 'px';
  }

  const ind = Number(getCurrentRow().getAttribute('no'));
  DETAILS[ind].push(newline);
}

function resetDetailOL() {
  document.querySelector('#added-details ol').innerHTML = '';
}
function addDetailList(strHTML, notbutton = false, numberstr) {
  const row = getCurrentRow();

  calcRowFee(row);

  const detail_number = numberstr ? Number(numberstr) : NEXT_DETAIL_NUMBER;
  const li = document.createElement('li');
  li.setAttribute('no', detail_number);
  li.innerHTML =
    '<button class="remove-button" no="' +
    detail_number +
    '">×</button>' +
    strHTML;
  li.querySelector('button').addEventListener('click', function () {
    const number = this.getAttribute('no');
    removeDetail(Number(number));
  });
  document.querySelector('#added-details ol').appendChild(li);

  if (!notbutton) NEXT_DETAIL_NUMBER++;

  setSumOfFee();
  setPostSum();
  setOvertimeSum();

  document.querySelector('#overtime-input').dispatchEvent(new Event('change'));

  setWorkTime(notbutton);
}

function calcRowFee(row) {
  let sumfee = 0;
  row.querySelectorAll('.path-detail-cell b').forEach((elem) => {
    sumfee += Number(elem.innerText);
  });
  row.querySelector('td:nth-child(11)').innerText =
    sumfee == 0 ? '' : new String(sumfee).toLocaleString();
}

function removeDetail(number) {
  // リストから削除
  const li = document.querySelector('li[no="' + number + '"]');
  li.remove();

  // DETAILS
  const arr = DETAILS[Number(getCurrentRow().getAttribute('no'))];
  DETAILS[Number(getCurrentRow().getAttribute('no'))] = arr.filter((item) => {
    return item.getAttribute('no') != number;
  });

  // 帳票から削除
  document.querySelector('div[no="' + number + '"]').remove();

  //小計再計算
  calcRowFee(getCurrentRow());

  setSumOfFee();
}
document
  .querySelector('#add-detail-button')
  .addEventListener('click', function (e) {
    const roundtriprate = document.querySelector(
      '[name=roundtrip-rate-radio]:checked'
    ).value;
    const fromElem = document.querySelector('#from-input');
    const toElem = document.querySelector('#to-input');
    const distanceElem = document.querySelector('#distance-input');

    if (!(fromElem.value && toElem.value && distanceElem.value)) {
      return alert('空欄があります。');
    }

    const fee = distanceElem.value * COST_PER_KM * roundtriprate;

    const str = `${fromElem.value} ⇒ ${toElem.value}　${
      roundtriprate == 2 ? '2×' : ''
    }${distanceElem.value}km×${COST_PER_KM}＝<b>${fee}</b>`;

    fromElem.value = '';
    toElem.value = '';
    addTextToDetailsDiv(str);
    addDetailList(str);
  });

document
  .querySelector('#add-others-button')
  .addEventListener('click', function (e) {
    const textElem = document.querySelector('#others-input');
    const feeElem = document.querySelector('#others-fee-input');
    if (!textElem.value && !feeElem.value) {
      return alert('空欄があります。');
    }
    const str =
      textElem.value + (feeElem.value ? '＝<b>' + feeElem.value + '</b>' : '');
    addTextToDetailsDiv(str);
    addDetailList(str);
  });

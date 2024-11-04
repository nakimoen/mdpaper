document
  .querySelector('#sele-template')
  .addEventListener('change', function () {
    key = this.value;
    const template = JSON.parse(localStorage.template);
    const obj = template[key];

    function setvalue(inputId, key) {
      const input = document.querySelector('#' + inputId);
      input.value = obj[key];
      input.dispatchEvent(new Event('change'));
    }
    setvalue('vendor-input', 'vendor');
    setvalue('site-input', 'site');
    setvalue('start-time-input', 'start');
    setvalue('finish-time-input', 'close');

    // TODO: 手段チェックボックス化
    obj.way.forEach((way) => {
      document.querySelector('#way-' + way).checked = true;
      document.querySelector('#way-' + way).dispatchEvent(new Event('change'));
    });

    setvalue('from-input', 'from');
    setvalue('to-input', 'to');

    let str = '';
    obj.via.forEach((location) => {
      str += ' ⇒ ' + location;
    });
    const to = document.querySelector('#to-input');
    to.value = str + to.value;

    setvalue('distance-input', 'distance');
    document.querySelector('#add-detail-button').click();
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

    drawPostSum();
    drawOvertimeSum();
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
    data && rowData.site ? rowData.site.replaceAll('<br>', '\n') : '';
  document.querySelector('#overtime-input').value =
    data && rowData.overtime ? rowData.overtime : 0;

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

  //
  // TODO: 就業時間読み込み直し
  //
  if (rowData) {
    loadSaveWorkTime(ind, rowData.worktime.start, rowData.worktime.finish);
    clearRestDraw();
    rowData.resttime.forEach((resttime) => {
      loadRestTime(ind, resttime.start, resttime.finish);
    });
  }

  drawPostSum();
  drawOvertimeSum();
});

document.querySelector('#vendor-input').addEventListener('change', function () {
  setname(this, 0);
  drawPostSum();
});
document.querySelector('#site-input').addEventListener('change', function (e) {
  setname(this, 1);
  // if (!e.ignoreAdd)
  if (e.bubbles) addSiteTemplate();
});

// 現場セレクト
document.querySelector('#site-select').addEventListener('change', function () {
  const siteinput = document.querySelector('#site-input');
  siteinput.value = this.value.replaceAll('<br>', '\n');
  siteinput.dispatchEvent(new Event('change'));
  this.selectedIndex = 0;
});

document.querySelectorAll('#work-time-wrapper input').forEach((input) => {
  input.addEventListener('change', () => {
    const sinput = document.querySelector('#start-time-input');
    const finput = document.querySelector('#finish-time-input');

    const ind = Number(getCurrentRow().getAttribute('no'));
    WORKTIME[ind].start = sinput.value;
    WORKTIME[ind].finish = finput.value;
  });
});
// 残業
document
  .querySelector('#overtime-input')
  .addEventListener('change', function () {
    const row = getCurrentRow();
    row.querySelector('td:nth-child(4) span').textContent = this.value;
    drawOvertimeSum();
  });

// 移動手段
document.querySelectorAll('#way-wrapper [type=checkbox]').forEach((elem) => {
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

    if (this.checked && wayind != -1)
      waydivs[wayind].classList.add('way-selected');
  });
});

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

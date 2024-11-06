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

function loadWeek(datestr) {
  reset();
  const [year, month, day] = datestr.split('-');
  loadALlRow();

  const date = new Date(datestr);

  if (date.getDay() !== 5) {
    alert('金曜日を選択してください');
    return;
  }
  // 各曜日の日付を表示
  document.querySelectorAll('.date-cell').forEach((elem, ind) => {
    const month = new String(date.getMonth() + 1).padStart(2, 0);
    const d = new String(date.getDate()).padStart(2, 0);
    // row に ID（m-d）を振る
    elem.closest('tr').setAttribute('id', 'r' + month + d);
    elem.closest('tr').setAttribute('no', ind);
    elem.querySelector('.month').innerHTML = Number(month);
    elem.querySelector('.day').innerHTML = Number(d);
    date.setDate(date.getDate() + 1);
  });

  drawPostSum();
  drawOvertimeSum();
}
document.querySelector('#date-input').addEventListener('change', function () {
  const date = getStartFriday(this.value);

  const datestr = formatDate(date, '-');
  // paper
  loadWeek(datestr);
  // input row
  const d = new Date(this.value);
  const diff = d.getTime() - date.getTime();
  setDate(datestr, diff / (1000 * 60 * 60 * 24));
});
function setDate(startdatestr, dayindex) {
  const splited = startdatestr.split('-');
  const startDateStr = splited.join('');

  ROW_ID = 'r' + splited.splice(1, 2).join('');

  const data = localStorage.getItem(startDateStr);
  const ind = dayindex;
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
  const rowdetails = DETAILS[dayindex];
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
}
document.querySelector('#vendor-input').addEventListener('change', function () {
  setname(this, 0);
  drawPostSum();
});
document.querySelector('#site-input').addEventListener('change', function (e) {
  setname(this, 1);
  // if (!e.ignoreAdd)
  if (e.bubbles) addSiteTemplate();
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

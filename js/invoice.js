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

//業者・現場
function setname(self, id) {
  const name = typeof self == 'string' ? self : self.value;
  const row = getCurrentRow();
  const query = `td:nth-child(3) tr:${
    id == 0 ? 'first-child' : 'nth-child(2)'
  } td`;
  const cell = row.querySelector(query);
  cell.innerHTML =
    '<div><div>' + name.replaceAll('\n', '<br>') + '</div></div>';
  autoFontSizeHeight(
    cell.querySelector('div'),
    cell.querySelector('div > div')
  );
}

// 就業時間
function loadSaveWorkTime(ind, start, finish) {
  if (start && finish) {
    WORKTIME[ind].start = start;
    WORKTIME[ind].finish = finish;
    document.querySelector('#work-time-label span').innerHTML =
      !start || !finish
        ? ''
        : '<button onclick="clearWorktime()">×</button>' + start + '~' + finish;
  }
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

  drawSumOfFee();
  drawPostSum();
  drawOvertimeSum();

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

  drawSumOfFee();
}

//
// 文字サイズ
//
function autoFontSizeWidth(wrap, elem) {
  while (wrap.scrollWidth > wrap.offsetWidth) {
    const fontSize = parseFloat(window.getComputedStyle(elem).fontSize);
    if (fontSize < 10) {
      elem.style.textWrap = 'wrap';
      break;
    }
    const newSize = fontSize - 1;
    elem.style.fontSize = newSize + 'px';
  }
}
function autoFontSizeHeight(wrap, elem) {
  while (wrap.scrollHeight > wrap.offsetHeight) {
    const fontSize = parseFloat(window.getComputedStyle(elem).fontSize);
    if (fontSize < 10) {
      elem.style.textWrap = 'wrap';
      break;
    }
    const newSize = fontSize - 1;
    elem.style.fontSize = newSize + 'px';
  }
}

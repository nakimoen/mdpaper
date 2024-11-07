function save() {
  const startDayKey = formatDate(
    getStartFriday(document.querySelector('#date-input').value)
  );

  const data = (() => {
    const data = localStorage.getItem(startDayKey);
    return data ? JSON.parse(data) : new Object();
  })();

  const rows = document.querySelectorAll('#row_3 > table > tbody > tr');

  for (let i = 0; i < 7; i++) {
    if (!data[i]) {
      data[i] = {};
    }
    const row = rows[i];
    const [tdVendor, tdSite] = row.querySelectorAll('td:nth-child(3) td');
    data[i].vendor = tdVendor.textContent;
    data[i].site = (() => {
      const text = tdSite.querySelector('div > div');
      return text ? text.innerHTML : '';
    })();

    const overtime = row.querySelector('td:nth-child(4) span').textContent;
    data[i].overtime = overtime;

    const pathWay = row.querySelector('.path-select .way-selected');
    if (pathWay) {
      data[i].way = pathWay.textContent;
    } else {
      data[i].way = 'なし';
    }

    const path = row.querySelector('.path-detail-cell > div').innerHTML;
    data[i].path = path;

    const fee = row.cells[10].textContent;
    data[i].fee = fee;

    //就業時間
    data[i].worktime = WORKTIME[i];

    // 休憩
    data[i].resttime = RESTTIME[i];
  }

  localStorage.setItem(startDayKey, JSON.stringify(data));

  alert('保存しました');
}

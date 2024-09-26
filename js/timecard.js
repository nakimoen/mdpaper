DATA = null;

(() => {
  document.querySelector('#name-text').innerText = localStorage.getItem('name');
})();

document.addEventListener('DOMContentLoaded', () => {
  const d = new Date();
  if (d.getDay() !== 5) {
    while (d.getDay() != 5) {
      d.setDate(d.getDate() - 1);
    }
  }
  document.querySelector('#start-date-input').value = formatDate(d, '-');
  document
    .querySelector('#start-date-input')
    .dispatchEvent(new Event('change'));
});

function drawWorkSF() {
  document.querySelectorAll('.start-cell').forEach((cell, i) => {
    let start,
      finish = null;
    if (DATA[i].worktime.start) {
      start = DATA[i].worktime.start;
      cell.innerText = start;

      const rowData = DATA[i];

      finish = rowData.worktime.finish;
      document.querySelectorAll('.finish-cell')[i].innerText = finish;

      let resttotal = 0;
      rowData.resttime.forEach((rest) => {
        const [h, m] = rest.start.split(':');
        const [fh, fm] = rest.finish.split(':');
        resttotal += Number(fh) + Number(fm) / 60 - (Number(h) + m / 60);
      });
      document
        .querySelectorAll('.rest-cell')
        [i].querySelector('span').innerText = resttotal;

      const [h, m] = start.split(':');
      const [fh, fm] = finish.split(':');
      document
        .querySelectorAll('.work-cell')
        [i].querySelector('span').innerText =
        Number(fh) - Number(h) + (fm - m) / 60 - resttotal;

      document
        .querySelectorAll('.overtime-cell')
        [i].querySelector('span').innerText = rowData.overtime;

      // 就業時間マーク
      document.querySelectorAll('[data-label="' + start + '"]')[i].innerText =
        'S';
      document.querySelectorAll('[data-label="' + finish + '"]')[i].innerText =
        'F';

      // 休憩時間マーク
      rowData.resttime.forEach((rest) => {
        // const [ns, minutes] = rest.start.split(':');
        const startlabel = rest.start;
        const [nfs, fminutes] = rest.finish.split(':');
        const finishlabel = Number(nfs) + ':' + fminutes;

        let label = startlabel;
        const finishCond = finishlabel.replace(':', '') - 0;
        while (label.replace(':', '') - 0 < finishCond) {
          document.querySelectorAll('[data-label="' + label + '"]')[
            i
          ].innerText = '○';
          let [h, m] = label.split(':');
          m = ~~m + 15;
          const hour = new String(~~h + Math.floor(m / 60)).padStart(2, 0);
          const minutes = new String((m % 60) + '').padStart(2, 0);
          label = hour + ':' + minutes;
        }
      });
    }
  });
}

function drawSums() {
  const set = (label) => {
    let time = 0;
    document.querySelectorAll('.' + label + '-cell').forEach((cell) => {
      const t = cell.querySelector('span').innerText;
      time += parseFloat(t ? t : 0);
    });
    document.querySelector('#sum-' + label).innerText = time;
  };
  set('work');
  set('rest');
  set('overtime');
}
document
  .querySelector('#start-date-input')
  .addEventListener('change', function () {
    function drawData(cellname) {
      document
        .querySelectorAll('.' + cellname + '-cell')
        .forEach((cell, ind) => {
          cell.innerHTML = DATA ? DATA[ind][cellname] : '';
        });
    }
    const key = this.value.replace(/-/g, '');
    DATA = JSON.parse(localStorage.getItem(key));

    const date = new Date(this.value);
    document.querySelectorAll('.date-cell').forEach((cell) => {
      cell.innerText = date.getMonth() + 1 + '/' + date.getDate();
      date.setDate(date.getDate() + 1);
    });

    resetDraw();
    drawData('vendor');
    drawData('site');

    drawWorkSF();

    drawSums();
  });

function resetDraw() {
  function resetCell(label) {
    if (!label) return;
    document.querySelectorAll('.' + label + '-cell').forEach((cell) => {
      if (cell.querySelector('span')) {
        cell.querySelector('span').innerText = '';
      } else {
        cell.innerText = '';
      }
    });
  }
  function resetCells(labels) {
    labels.forEach((label) => {
      resetCell(label);
    });
  }
  resetCells([
    'vendor',
    'site',
    'start',
    'finish',
    'rest',
    'work',
    'overtime',
    'time',
  ]);

  drawSums();
}

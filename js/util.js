function formatDate(date, sep = '') {
  const yyyy = date.getFullYear();
  const mm = ('00' + (date.getMonth() + 1)).slice(-2);
  const dd = ('00' + date.getDate()).slice(-2);
  return `${yyyy}${sep}${mm}${sep}${dd}`;
}

function getStartFriday(datestr, getString = false) {
  const date = new Date(datestr);
  const day = date.getDay();
  let diff;
  let ind;
  switch (day) {
    case 5:
    case 6:
      ind = diff = day % 5;
      break;

    default:
      ind = diff = day + 2;
      break;
  }
  date.setDate(date.getDate() - diff);

  if (getString) {
    return formatDate(date);
  }
  return date;
}

function getMonthData(year, month) {
  year = '' + year;
  month = '' + month;
  let total = 0;

  const [fyear, fmonth] = (() => {
    if (month == 1) {
      return [year - 1 + '', '12'];
    }
    return [year + '', month - 1 + ''];
  })();
  Object.keys(localStorage)
    .sort((a, b) => b - a)
    .filter((x) => {
      return (
        x.match(/^\d{8}$/) &&
        x <= `${year}${month.padStart(2, 0)}31` &&
        x >= `${fyear}${fmonth.padStart(2, 0)}21`
      );
    })
    .forEach((key) => {
      const data = JSON.parse(localStorage.getItem(key));
      for (let i = 0; i < 6; i++) {
        const y = key.substr(0, 4);
        const m = key.substr(4, 2) - 1;
        const d = parseInt(key.substr(6, 2)) + i;
        const date = new Date(y, m, d);
        if (date.getFullYear() == year && date.getMonth() == month - 1) {
          const [price, overprice] = (() => {
            if (data[i].isHoliday) {
              return [40000, 6330];
            }
            return [30000, 4690];
          })();
          if (data[i].vendor) {
            total += price + data[i].overtime * overprice;
          }
        }
      }
    });

  return total;
}

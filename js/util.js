function formatDate(date, sep = '') {
  const yyyy = date.getFullYear();
  const mm = ('00' + (date.getMonth() + 1)).slice(-2);
  const dd = ('00' + date.getDate()).slice(-2);
  return `${yyyy}${sep}${mm}${sep}${dd}`;
}

function getStartFriday(datestr, isString = false) {
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

  if (isString) {
    return formatDate(date);
  }
  return date;
}

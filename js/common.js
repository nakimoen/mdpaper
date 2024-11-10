window.OrginTitle = document.querySelector('title').innerText;
function changeTitle() {
  const name = localStorage.getItem('name').replaceAll('　', '');
  const date = getStartFriday(
    document.querySelector('#date-input').value,
    true
  );
  const title = document.querySelector('title');
  const titleText = (() => {
    const arr = document.querySelector('title').innerText.split('_');
    if (arr.length > 1) return arr[1];
    else return arr[0];
  })();

  title.innerText = date + name + '_' + titleText;
}

window.onbeforeprint = () => {
  const sheet = document.querySelector('section.sheet');
  sheet.style.display = 'block';
  changeTitle();
};
window.onafterprint = () => {
  const sheet = document.querySelector('section.sheet');
  if (sheet.dataset['toggle'] != 'on') {
    sheet.style.display = 'none';
  }
  document.querySelector('title').innerText = window.OrginTitle;
};

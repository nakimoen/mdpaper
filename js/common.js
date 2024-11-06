function changeTitle() {
  const name = localStorage.getItem('name').replaceAll('　', '');
  const date = getStartFriday(document.querySelector('#date-input').value);
  const title = document.querySelector('title');
  const titleText = (() => {
    const arr = document.querySelector('title').innerText.split('_');
    if (arr.length > 1) return arr[1];
    else return arr[0];
  })();

  title.innerText = date + name + '_' + titleText;
}

window.onbeforeprint = () => {
  document.querySelector('section.sheet').style.display = 'block';
  changeTitle();
};
window.onafterprint = () => {
  document.querySelector('section.sheet').style.display = 'none';
};

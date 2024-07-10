function changeTitle() {
  const name = localStorage.getItem('name').replaceAll('　', '');
  const date = document
    .querySelector('#start-date-input')
    .value.replaceAll('-', '');
  const title = document.querySelector('title');
  const titleText = (() => {
    const arr = document.querySelector('title').innerText.split('_');
    if (arr.length > 1) return arr[1];
    else return arr[0];
  })();

  title.innerText = date + name + '_' + titleText;
}

window.onbeforeprint = () => {
  changeTitle();
};

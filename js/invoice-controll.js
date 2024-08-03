function addSiteTemplate() {
  const val = document.querySelector('#site-input').value;
  const listStr = localStorage.getItem('siteList');
  const list = (() => {
    if (!listStr) {
      return [];
    }
    return JSON.parse(listStr);
  })();
  list.push(val);
  localStorage.setItem('siteList', JSON.stringify([...new Set(list)]));
}
document.querySelector('#site-select').addEventListener('change', function () {
  document.querySelector('#site-input').value = this.value;
});

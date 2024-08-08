function addSiteTemplate() {
  const val = document.querySelector('#site-input').value;
  const listStr = localStorage.getItem('siteList');
  const list = (() => {
    if (!listStr || !listStr.trim()) {
      return [];
    }
    return JSON.parse(listStr);
  })();
  list.push(val);
  localStorage.setItem('siteList', JSON.stringify([...new Set(list)]));

  const opt = document.createElement('option');
  opt.innerText = val;
  opt.value = val;
  document.querySelector('#site-select').appendChild(opt);
}

function deleteSiteTemplate() {
  const val = document.querySelector('#site-input').value;
  const listStr = localStorage.getItem('siteList');
  const list = (() => {
    if (!listStr) {
      return [];
    }
    return JSON.parse(listStr);
  })();

  localStorage.setItem(
    'siteList',
    JSON.stringify(list.filter((x) => x != val))
  );
  document
    .querySelector('#site-select')
    .querySelectorAll('option')
    .forEach((opt) => {
      if (opt.innerText === val) opt.remove();
    });
}

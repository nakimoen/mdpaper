document.querySelector('#bt-add-via').addEventListener('click', () => {
  const div = document.createElement('div');
  div.classList.add('path-row');
  div.innerHTML = document.querySelector('#template-via').innerHTML;

  document.querySelector('#via-wrapper').appendChild(div);
});

function removeVia(self) {
  self.closest('div').remove();
}
document.querySelector('#bt-save').addEventListener('click', function (e) {
  const key = document.querySelector('#input-template-id').value;

  const object = {};
  object.vendor = document.querySelector('#input-vendor').value;
  object.site = document.querySelector('#input-site').value;
  object.way = (() => {
    const wayList = [];
    document.querySelectorAll('input[name="cb-way"]:checked').forEach((cb) => {
      wayList.push(cb.value);
    });
    return wayList;
  })();
  object.from = document.querySelector('#input-path-from').value;
  object.to = document.querySelector('#input-path-to').value;
  object.via = (() => {
    const list = [];
    document.querySelectorAll('.input-path-via').forEach((input) => {
      list.push(input.value);
    });
    return list;
  })();

  object.distance = document.querySelector('#input-distance').value;
  object.start = document.querySelector('#input-time-start').value;
  object.close = document.querySelector('#input-time-close').value;

  object.rest = (() => {
    const list = [];
    document.querySelectorAll('.rest-line').forEach((line) => {
      list.push({
        start: line.querySelector('.input-rest-time-start').value,
        close: line.querySelector('.input-rest-time-close').value,
      });
    });
    return list;
  })();

  const templateObject = (() => {
    const templateString = localStorage.getItem('template');
    return templateString ? JSON.parse(templateString) : {};
  })();
  templateObject[key] = object;
  localStorage.template = JSON.stringify(templateObject);
});

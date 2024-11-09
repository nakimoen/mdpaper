function setValue(id, val) {
  document.querySelector(id).value = val;
}
function clear() {
  document.querySelectorAll('.rm-via').forEach((button) => {
    button.dispatchEvent(new Event('click'));
  });

  setValue('#input-vendor', '');
  setValue('#input-site', '');
  setValue('#input-path-from', '');
  setValue('#input-path-to', '');
  setValue('#input-distance', '');

  document
    .querySelectorAll('[name="cb-way"]')
    .forEach((cb) => (cb.checked = false));
  setValue('#input-time-start', '');
  setValue('#input-time-close', '');
}

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
  if (!key) {
    return alert('テンプレート名を入力してください。');
  }

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

  function getValue(id) {
    return document.querySelector(id).value;
  }
  function validate() {
    let viaValidate = true;
    document.querySelectorAll('.path-via').forEach((via) => {
      viaValidate = via.value ? true : false;
    });

    return (
      viaValidate &&
      getValue('#input-path-from') &&
      getValue('#input-path-to') &&
      getValue('#input-distance')
    );
  }

  let message = '';
  if (!validate()) {
    message +=
      '\n＿／＿／＿／＿／＿／\n＿／経路に関して空欄があります。\n＿／このテンプレートは経路情報を正しく読み取れません。\n＿／＿／＿／＿／＿／';
  }

  const templateObject = (() => {
    const templateString = localStorage.getItem('template');
    return templateString ? JSON.parse(templateString) : {};
  })();
  templateObject[key] = object;
  localStorage.template = JSON.stringify(templateObject);
  alert('保存しました。' + message);
});

// テンプレート
(() => {
  const templates = JSON.parse(localStorage.getItem('template'));

  // keys は　略称
  const keys = Object.keys(templates);
  const select = document.querySelector('#template-list-sele');
  keys.forEach((key) => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.innerText = key;
    select.appendChild(opt);
  });

  select.addEventListener('change', function () {
    const inputTemplate = document.querySelector('#input-template-id');
    if (inputTemplate.value == this.value) {
      return alert('選択中のテンプレートです。');
    } else if (
      this.dataset['turned'] &&
      !confirm(
        '編集中のデータは保存されません。別テンプレートの選択を続行しますか？'
      )
    ) {
      return;
    }

    if (!this.dataset['turned']) {
      this.dataset['turned'] = 1;
    }

    inputTemplate.value = this.value;
    const data = templates[this.value];

    setValue('#input-vendor', data.vendor);
    setValue('#input-site', data.site);

    data.way.forEach((way) => {
      document.querySelector('#cb-way-' + way).checked = true;
    });

    setValue('#input-path-from', data.from);
    setValue('#input-path-to', data.to);

    data.via.forEach((via) => {
      document.querySelector('#bt-add-via').dispatchEvent(new Event('click'));
      document.querySelector(
        '#via-wrapper > .path-row:last-child .input-path-via'
      ).value = via;
    });

    setValue('#input-distance', data.distance);

    setValue('#input-time-start', data.start);
    setValue('#input-time-close', data.close);
    // 終了処理
    this.selectedIndex = 0;
  });
})();

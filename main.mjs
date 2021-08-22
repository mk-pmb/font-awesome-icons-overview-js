// -*- coding: utf-8, tab-width: 2 -*-

const browserWindow = window; // eslint-disable-line no-undef
const jq = browserWindow.jQuery;

const icons = {
  byName: new Map(),
  byFirstName: new Map(),
  byUnicodeHex: new Map(),
};
Object.assign(browserWindow, { icons });


async function main() {
  const faCss = jq('#fa-css');
  const cssUrl = faCss.data('url');
  faCss.html('@import url("' + cssUrl + '");');
  const reply = await jq.get(cssUrl);

  const iconRgx = /\.fa-([\w\-]+):before\{content:"\\(\w+)"/g;
  function learn(match, name, unicodeHex) {
    const info = (icons.byUnicodeHex.get(unicodeHex)
      || { names: [], unicodeHex });
    if (!info.names.length) {
      icons.byUnicodeHex.set(unicodeHex, info);
      icons.byFirstName.set(name, info);
    }
    info.names.push(name);
    icons.byName.set(name, info);
  }
  reply.replace(/\s+/g, '').replace(iconRgx, learn);

  const iconList = jq('<ul class="iconlist">').appendTo('body');

  function renderByName(name) {
    const info = icons.byName.get(name);
    const li = jq('<li>').appendTo(iconList);
    li.addClass(name === info.names[0] ? 'firstname' : 'alias');
    jq('<div class="icon-container"><i class="fa fa-'
      + name + '">').appendTo(li);
    const nameTag = jq('<input class="name">');
    jq('<div class="name-container">').appendTo(li).append(nameTag);
    nameTag.attr({
      title: name,
      value: name,
    });
    nameTag.data({ iconName: name });
    const aliases = info.names.filter(n => (n !== name));
    if (aliases.length) {
      nameTag.attr('title', 'aliases: ' + aliases.join(', '));
      jq('<span class="number-of-aliases">'
      ).text(aliases.length).appendTo(nameTag);
    }
  }

  Array.from(icons.byName.keys()).sort().forEach(renderByName);

  const modifEventNames = [
    'blur',
    'change',
    'focus',
    'keydown',
    'keyup',
  ];
  function restoreValue(ev) {
    const el = jq(ev.target).closest('input');
    el.val(el.data('iconName'));
  }
  modifEventNames.forEach(n => iconList.on(n, 'input', restoreValue));
  function selectAll(ev) {
    jq(ev.target).closest('input')[0].select();
  }
  iconList.on('focus', 'input', selectAll);
}


main().then(null, function fail(err) {
  console.error('Oh no!', err);
  jq('body').text('Oh no! Error! See browser console.');
});




setTimeout(() => browserWindow.location.reload(), 2e6);

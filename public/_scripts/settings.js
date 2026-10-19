function getValueForSetting(setting) {
  return localStorage.getItem('settings.' + setting);
}

function setValueForSetting(setting, value) {
  localStorage.setItem('settings.' + setting, value);
}

document.getElementById('backgroundStarsActive').addEventListener('change', function () {
  setValueForSetting('backgroundStarsActive', this.checked);
});

if (getValueForSetting('backgroundStarsActive') === null) {
  setValueForSetting('backgroundStarsActive', true);
}
document.getElementById('backgroundStarsActive').checked = getValueForSetting('backgroundStarsActive') === 'true';

'use strict';

/* eslint-env browser */

const { ipcRenderer } = require('electron');
const moment = require('moment');

const time = ipcRenderer.sendSync('synchronous-message', 'get_time');

const detailsInput = document.getElementById('inputDetails');
const stateInput = document.getElementById('inputState');
const largeImageTextInput = document.getElementById('inputLargeImageText');
const smallImageTextInput = document.getElementById('inputSmallImageText');
const largeImageKeySelect = document.getElementById('selectLargeImageKey');
const smallImageKeySelect = document.getElementById('selectSmallImageKey');
const submitButton = document.getElementById('buttonSubmit');

const data = {
  	details: 'Using MyRPC',
  	state: 'Being totally awesome',
  	largeImageText: 'MyRPC',
  	smallImageText: 'Made by RailRunner16',
  	largeImageKey: 'large_default',
  	smallImageKey: 'small_default',
};

const assets = {
	large_default: 'https://cdn.discordapp.com/app-assets/528735337015410712/528749698408906752.png',
	small_default: 'https://cdn.discordapp.com/app-assets/528735337015410712/528761124267753473.png',
};

const updateInputs = () => {
  	detailsInput.value = data.details;
  	stateInput.value = data.state;
  	largeImageTextInput.value = data.largeImageText;
  	smallImageTextInput.value = data.smallImageText;
  	largeImageKeySelect.value = data.largeImageKey;
  	smallImageKeySelect.value = data.smallImageKey;
};

const updatePreview = () => {
	data.details = detailsInput.value;
	data.state = stateInput.value;
	data.largeImageText = largeImageTextInput.value;
	data.smallImageText = smallImageTextInput.value;
	data.largeImageKey = largeImageKeySelect.value;
	data.smallImageKey = smallImageKeySelect.value;

	document.getElementById('previewDetailsText').innerHTML = data.details;
	document.getElementById('previewStateText').innerHTML = data.state;
	document.getElementById('previewTimestampText').innerHTML = `${moment(time).fromNow(true)} elapsed`;

	document.getElementById('previewBigImg').alt = data.largeImageText;
	document.getElementById('previewSmallImg').alt = data.smallImageText;

	document.getElementById('previewBigImg').src = assets[data.largeImageKey];
	document.getElementById('previewSmallImg').src = assets[data.smallImageKey];
};

detailsInput.onchange = updatePreview;
stateInput.onchange = updatePreview;
largeImageTextInput.onchange = updatePreview;
smallImageTextInput.onchange = updatePreview;
largeImageKeySelect.onchange = updatePreview;
smallImageKeySelect.onchange = updatePreview;

updateInputs();

submitButton.onclick = () => {
  	data.details = `${detailsInput.value}`;
  	data.state = `${stateInput.value}`;
  	data.largeImageText = `${largeImageTextInput.value}`;
  	data.smallImageText = `${smallImageTextInput.value}`;
  	data.largeImageKey = `${largeImageKeySelect.value}`;
  	data.smallImageKey = `${smallImageKeySelect.value}`;

	ipcRenderer.send('asynchronous-message', data);

	updateInputs();
	updatePreview();
};

setInterval(updatePreview, 100);

document.onerror = console.error;

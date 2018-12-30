'use strict';

/* eslint-env browser */

const { ipcRenderer } = require('electron');
// const fetch = require('electron-fetch');
const moment = require('moment');

const time = ipcRenderer.sendSync('synchronous-message', 'get_time');

const detailsInput = document.getElementById('inputDetails');
const stateInput = document.getElementById('inputState');
const largeImageTextInput = document.getElementById('inputLargeImageText');
const smallImageTextInput = document.getElementById('inputSmallImageText');
const largeImageKeySelect = document.getElementById('selectLargeImageKey');
const smallImageKeySelect = document.getElementById('selectSmallImageKey');
const submitButton = document.getElementById('buttonSubmit');

function createElementFromHTML(htmlString) {
	var div = document.createElement('div');
	div.innerHTML = htmlString.trim();
  
	// Change this to div.childNodes to support multiple top-level nodes
	return div.firstChild; 
} //thanks stackoverflow!

const data = {
  	details: 'Using MyRPC',
  	state: 'Being totally awesome',
  	largeImageText: 'MyRPC',
  	smallImageText: 'Made by RailRunner16',
  	largeImageKey: 'large_default',
  	smallImageKey: 'small_default',
};

const assets = {};

fetch('http://165.227.63.75:3500/images')
.then(resp => resp.json())
.then(body => {
	for (const item of body) { 
		assets[item.id] = item.url;
		const option = createElementFromHTML(`<option value="${item.id}">${item.name}</option>`);
		const option2 = createElementFromHTML(`<option value="${item.id}">${item.name}</option>`);
		smallImageKeySelect.appendChild(option);
		largeImageKeySelect.appendChild(option2);
	}

	smallImageKeySelect.selectedIndex = 0;
	largeImageKeySelect.selectedIndex = 0;
});

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

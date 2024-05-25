const $id = (id) => document.getElementById(id);
// const form = $id('form');
// const outputElt = $id('output');

function setDownloadLink(data, name = 'download') {
	const str = JSON.stringify(data, null, '\t');
	const blob = new Blob([str], { type: 'application/json' });
	const a = $id('download');
	a.href = URL.createObjectURL(blob);
	a.download = `${name}.json`;
}

function unflattenObject(obj) {
	return Object.entries(obj).reduce((o, [key, val]) => {
		const keys = key.split('.');
		// if (keys.length === 1) return { ...o, [key]: val };
		let destination = o;
		keys.forEach((k, i) => {
			if (i >= keys.length - 1) {
				destination[k] = val;
				return;
			}
			if (!destination[k]) destination[k] = {};
			destination = destination[k];
		});
		return o;
	}, {});
}

function getFieldInput(form, key) {
	return form.querySelector(`[name="${key}"]`);
}

function loopOverFields(form, fieldInfo, fn) {
	fieldInfo.forEach((f) => {
		const input = getFieldInput(form, f.key);
		fn(input, f);
	});
}

function getFormData(form, fieldInfo) {
	const o = {};
	loopOverFields(form, fieldInfo, (input, field) => {
		const { type } = field;
		// TODO: correct for other types
		o[input.name] = (type === 'number') ? Number(input.value) : input.value;
	});
	return o;
}

/** Will update/mutate output element */
function updateOutput(form, fieldInfo, outputElt) {
	const data = unflattenObject(getFormData(form, fieldInfo));
	// eslint-disable-next-line no-param-reassign
	outputElt.value = JSON.stringify(data, null, '\t');
	setDownloadLink(data);
}

function populateFormDataFromOutput(form, outputElt) {
	const data = JSON.parse(outputElt.value);
	const flatObj = flattenObject(data);
	Object.entries(flatObj).forEach(([key, val]) => {
		getFieldInput(form, key).value = val;
	});
}

function setupListeners(form, fieldInfo, outputElt) {
	const update = () => updateOutput(form, fieldInfo, outputElt);
	loopOverFields(form, fieldInfo, (input) => {
		input.addEventListener('blur', update);
		input.addEventListener('change', update);
	});
	outputElt.addEventListener('change', () => populateFormDataFromOutput(form, outputElt));
}

function flattenObjectToArray(data, prefix = '') {
	// From https://stackoverflow.com/a/58266092
	return Object.entries(data).flatMap(([key, val]) => {
		const newPrefix = `${prefix}${key}`;
		if (val === null || typeof val !== 'object') return [[newPrefix, val]];
		return flattenObjectToArray(val, `${newPrefix}.`);
	});
}

function flattenObject(data) {
	return flattenObjectToArray(data).reduce((o, [key, val]) => {
		return { ...o, [key]: val };
	}, {});
}

/** Mutates obj */
function addDefaultProps(obj, defaultObj) {
	Object.keys(defaultObj).forEach((key) => {
		// eslint-disable-next-line no-param-reassign
		if (typeof obj[key] === 'undefined') obj[key] = defaultObj[key];
	});
}

/** Mutates the form */
function buildJsonForm(data, form, fieldInfo = [], outputElt) {
	const flatObj = flattenObject(data);
	const fields = structuredClone(fieldInfo);
	Object.entries(flatObj).forEach(([key, val]) => {
		const type = typeof val;
		const defaultField = {
			key, classes: [], placeholder: `e.g., ${val}`, type, spellcheck: false,
		};
		const field = fields.find((f) => f.key === key);
		if (field) {
			addDefaultProps(field, defaultField);
			return;
		}
		fields.push(defaultField);
	});
	const html = fields.reduce((h, f) => {
		const { key, placeholder = '', classes = [], spellcheck } = f;
		const { label = key } = f;
		return (`${h}
			<div>
				<label for="f-${key}">${label}</label>
				<textarea
					id="f-${key}"
					name="${key}"
					class="${classes.join(' ')}"
					spellcheck="${spellcheck ? 'true' : 'false'}"
					placeholder="${placeholder}"></textarea>
			</div>`
		);
	}, '');
	form.innerHTML = html; // eslint-disable-line no-param-reassign
	setupListeners(form, fields, outputElt);
	updateOutput(form, fields);
}

export { buildJsonForm, flattenObject };

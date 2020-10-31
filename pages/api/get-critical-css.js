const criticalcss = require('criticalcss');
const cheerio = require('cheerio');
const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');
const tmpDir = require('os').tmpdir();

const cssPath = path.join(tmpDir, 'style.css');

function getRules(cssPath) {
	return new Promise(function(resolve, reject) {
		criticalcss.getRules(cssPath, function(err, output) {
			if (err) reject(err);
			resolve(output);
		});
	});
}

async function call(promise) {
	let res, err;
	try {
		res = await promise;
	} catch (e) {
		err = e;
	}
	return [res, err];
}

function findCritical(url, rules) {
	return new Promise(function(resolve, reject) {
		criticalcss.findCritical(url, { rules: JSON.parse(rules) }, function(err, output) {
			if (err) reject(err);
			resolve(output);
		});
	});
}

export default async (req, res) => {
	const response = await fetch(req.query.url);
	const html = await response.text();

	const $ = cheerio.load(html);
	const cssFilePaths = [];
	$('link[rel="stylesheet"]').each(function() {
		const href = $(this).attr('href');
		if (href.charAt(0) === '/') {
			cssFilePaths.push(`${req.query.url}${href}`);
		} else {
			cssFilePaths.push(href);
		}
	});

	const styleContents = [];
	for (let file of cssFilePaths) {
		const fileRes = await fetch(file);
		const fileContent = await fileRes.text();
		styleContents.push(fileContent);
	}
	const combinedStyles = styleContents.join('');
	fs.writeFileSync(cssPath, combinedStyles);

	const [rules, rulesErr] = await call(getRules(cssPath));
	if (rulesErr) {
		res.statusCode = 500;
		res.send('Whoops!');
		return;
	}

	const [crit, critErr] = await call(findCritical(req.query.url, rules));
	if (critErr) {
		res.statusCode = 500;
		res.send('Whoops!');
		return;
	}

	res.statusCode = 200
	res.send(crit);
}

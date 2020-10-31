const cheerio = require('cheerio');
const fetch = require('node-fetch');
const critical = require('critical');

async function call(promise) {
	let res, err;
	try {
		res = await promise;
	} catch (e) {
		err = e;
	}
	return [res, err];
}

export default async (req, res) => {
	const response = await fetch(req.query.url);
	const body = await response.text();

	const $ = cheerio.load(body);
	const cssFilePaths = [];
	$('link[rel="stylesheet"]').each(function() {
		const href = $(this).attr('href');
		if (href.charAt(0) === '/') {
			cssFilePaths.push(`${req.query.url}${href}`);
		} else {
			cssFilePaths.push(href);
		}
	});

	const [{css, html, uncritical}, err] = await call(critical.generate({
		html: body,
		css: cssFilePaths,
		dimensions: [
			{
				width: 414,
				height: 736,
			},
			{
				width: 1440,
				height: 900,
			},
		],
	}));
	if (err) {
		res.statusCode = 500;
		res.send('Something broke...');
		return;
	}

	res.statusCode = 200
	res.send(css);
}

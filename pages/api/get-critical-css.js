const cheerio = require('cheerio');
const fetch = require('node-fetch');
// const critical = require('critical');
const penthouse = require('penthouse');

async function call(promise) {
	let res, err;
	try {
		res = await promise;
	} catch (e) {
		err = e;
	}
	return [res, err];
}

function sendError(res, err = 'Something broke...') {
	res.status = 502;
	res.send(err);
}

export default async (req, res) => {
	if (!req.query || !req.query.url) {
		sendError(res, 'No url provided');
		return;
	}

	const [body, bodyErr] = await call(fetch(req.query.url), 'text');
	if (bodyErr) {
		sendError(res, 'body error');
		return;
	}

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

	let allStyles = [];
	for (let path of cssFilePaths) {
		const [styles, err] = await call(fetch(path), 'text');
		if (err) {
			sendError(res, err);
			return;
		}
		allStyles.push(styles)
	}
	allStyles = allStyles.join('');

	const [crit, critErr] = await call(penthouse({ url: req.query.url, cssString: allStyles }));
	if (critErr) {
		console.log(critErr);
		sendError(res, 'crit err');
		return;
	}

	res.statusCode = 200;
	res.send(crit);
}

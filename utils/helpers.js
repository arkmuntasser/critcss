export async function call(promise) {
	let res, err;
	try {
		res = await promise;
	} catch (e) {
		err = e;
	}
	return [res, err];
}

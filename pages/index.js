import Head from 'next/head'
import { useState } from 'react'
import styles from '../styles/Home.module.css'
import { call } from '../utils/helpers';

export default function Home() {
	const [url, setUrl] = useState('https://togotoronto.com');
	const [critical, setCritical] = useState('');
	const [fetchStatus, setFetchStatus] = useState('ready');

	async function getCriticalCSS(e) {
		e.preventDefault();
		if (url === '' && fetchStatus === 'ready') return;

		setFetchStatus('loading');
		const [res, err] = await call(fetch(`/api/get-critical-css?url=${url}`));
		if (err) {
			fetchStatus(err);
			console.log(err);
			return;
		}

		setFetchStatus('complete');
		const criticalStyles = await res.text();
		setCritical(criticalStyles);
		setFetchStatus('ready');
	}

  return (
    <div className={styles.container}>
      <Head>
        <title>CritCSS - Get the critical CSS for any site!</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

			<form onSubmit={getCriticalCSS}>
				<input
					type="url"
					value={url}
					onChange={e => setUrl(e.target.value)}
					placeholder="https://www.example.com/"
					autoComplete="false"
				/>
				<button type="submit">Get that CRIT!</button>
			</form>

			<textarea readOnly value={critical}></textarea>
    </div>
  )
}

import Head from 'next/head';
import { useState } from 'react';
import styles from '../styles/Home.module.css';
import { call } from '../utils/helpers';
import { FiLoader } from 'react-icons/fi';

export default function Home() {
	const [url, setUrl] = useState('');
	const [critical, setCritical] = useState('');
	const [fetchStatus, setFetchStatus] = useState('ready');

	async function getCriticalCSS(e) {
		e.preventDefault();
		if (url === '' && fetchStatus === 'ready') return;

		setCritical('');
		setFetchStatus('loading');
		const [res, err] = await call(fetch(`/api/get-critical-css?url=${url}`));
		if (err) {
			setFetchStatus('error');
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

	  <main className={styles.main}>
		  <section className={styles.header}>
			<h1>CritCSS</h1>
			<p>Get the critical CSS for any site!</p>
			<form onSubmit={getCriticalCSS} className={styles.form}>
				<label>
					<span>URL</span>
					<input
						type="url"
						value={url}
						onChange={e => setUrl(e.target.value)}
						placeholder="https://www.example.com/"
						autoComplete="false"
					/>
				</label>
				<button type="submit">Crit It!</button>
			</form>
		  </section>

		  <section className={styles.code}>
			  {fetchStatus === 'loading' ?<FiLoader className={styles.spin}/> : null}
			  {critical !== '' ? <code>{critical}</code> : null}
		  </section>
	  </main>
    </div>
  )
}

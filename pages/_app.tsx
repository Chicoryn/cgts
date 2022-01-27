import '../styles/globals.css'
import Head from 'next/head'
import type { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
  return <>
    <Head>
      <title>Computer Go Tournament Server</title>
      <link rel="icon" href="/favicon.ico" />
    </Head>

    <header className='site-header'>
      <nav>
        <a href='/'>
          <img src='' />
        </a>
        <a href='/'>Tournaments</a>
        <a href='/tournament'>New Tournament</a>
      </nav>
    </header>
    <div className='site-content'>
      <div className='container'>
        <Component {...pageProps} />
      </div>
    </div>
  </>
}

export default MyApp

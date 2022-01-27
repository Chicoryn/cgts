import '../styles/globals.css'
import Head from 'next/head'
import type { AppProps } from 'next/app'
import Link from 'next/link';
import Image from 'next/image';

function MyApp({ Component, pageProps }: AppProps) {
  return <>
    <Head>
      <title>Computer Go Tournament Server</title>
      <link rel="icon" href="/favicon.ico" />
    </Head>

    <header className='site-header'>
      <nav>
        <Link href='/' passHref>
          <Image src='/null.png' alt='CGTS' width='100px' height="40px" />
        </Link>
        <Link href='/'>Tournaments</Link>
        <Link href='/tournament'>New Tournament</Link>
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

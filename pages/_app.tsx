import { useMemo } from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { Grid, GridItem } from '@chakra-ui/layout';
import { ChakraProvider } from '@chakra-ui/react';
import { extendTheme } from '@chakra-ui/theme-utils';
import { RainbowKitProvider, getDefaultWallets } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { WagmiConfig, createClient } from 'wagmi';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { TokenListProvider } from '@/contexts/TokenContext';
import { useRailgunProvider } from '@/hooks/useRailgunProvider';
import '@/styles/globals.css';
import { chains, provider, webSocketProvider } from '@/utils/networks';
import { initialize } from '@/utils/railgun';

const APP_TITLE = 'Token Shielder';
const APP_DESCRIPTION = 'Shield funds by depositing them into Railgun';

const colors = {
  brand: {
    900: '#1a365d',
    800: '#153e75',
    700: '#2a69ac',
  },
};
const theme = extendTheme({ colors });

const { connectors } = getDefaultWallets({
  appName: APP_TITLE,
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
  webSocketProvider,
});

function MyApp({ Component, pageProps }: AppProps) {
  useMemo(initialize, []);
  const { isProviderLoaded, shieldingFees } = useRailgunProvider();
  return (
    <>
      <Head>
        <title>{APP_TITLE}</title>
        <meta name="description" content={APP_DESCRIPTION} />
        <link rel="icon" href="protect-icon.svg" />

        <meta property="og:title" content={APP_TITLE} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://tokenshielder.com" />
        <meta
          property="og:image"
          content="https://raw.githubusercontent.com/ScopeLift/token-shielder/77a5dcfe7530f70f3883af54aa16034fdbd34252/public/home.png"
        />
        <meta property="og:image:alt" content={`${APP_TITLE} site preview`} />
        <meta property="og:description" content={APP_DESCRIPTION} />
        <meta
          name="keywords"
          content="privacy, private, shield, railgun, tokens, ethereum, bsc, polygon, arbitrum, goerli"
        />
      </Head>
      <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider chains={chains}>
          <ChakraProvider theme={theme}>
            {isProviderLoaded && (
              <TokenListProvider shieldingFees={shieldingFees}>
                <Grid
                  templateAreas={`". header ."
                                  ". body ."
									                ". footer ."
										`}
                  gridTemplateRows={'4.8rem 1fr 4.8rem'}
                  gridTemplateColumns={'1fr minmax(auto, 150rem) 1fr'}
                  gap="1"
                  h="100vh"
                  marginX="1rem"
                >
                  <GridItem area={'header'}>
                    <Header />
                  </GridItem>
                  <GridItem area={'body'}>
                    <Component {...pageProps} />
                  </GridItem>
                  <GridItem area={'footer'}>
                    <Footer />
                  </GridItem>
                </Grid>
              </TokenListProvider>
            )}
          </ChakraProvider>
        </RainbowKitProvider>
      </WagmiConfig>
    </>
  );
}

export default MyApp;

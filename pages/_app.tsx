import type { AppProps } from 'next/app';
import Head from 'next/head';
import { Grid, GridItem } from '@chakra-ui/layout';
import { ChakraProvider } from '@chakra-ui/react';
import { extendTheme } from '@chakra-ui/theme-utils';
import { RainbowKitProvider, getDefaultWallets } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { WagmiConfig, configureChains, createClient } from 'wagmi';
import { bsc, goerli, mainnet, polygon } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import Header from '@/components/Header';
import { TokenListProvider } from '@/contexts/TokenContext';
import { useRailgunProvider } from '@/hooks/useRailgunProvider';
import '@/styles/globals.css';
import { bscIcon } from '@/utils/constants';
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

const { chains, provider, webSocketProvider } = configureChains(
  [
    mainnet,
    {
      ...bsc,
      iconUrl: bscIcon,
    },
    polygon,
    goerli,
  ],
  [
    alchemyProvider({
      apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY!,
    }),
    publicProvider(),
  ]
);

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
  initialize();
  const { isProviderLoaded } = useRailgunProvider();
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
          content="https://raw.githubusercontent.com/ScopeLift/railgun-shielder/9d8b5dda5826c8121a9934da484a29645de161e6/public/home.png"
        />
        <meta property="og:image:alt" content={`${APP_TITLE} site preview`} />
        <meta property="og:description" content={APP_DESCRIPTION} />
      </Head>
      <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider chains={chains}>
          <ChakraProvider theme={theme}>
            {isProviderLoaded && (
              <TokenListProvider>
                <Grid
                  templateAreas={`". header ."
                  ". body ."`}
                  gridTemplateRows={'4.8rem 100vh'}
                  gridTemplateColumns={'1fr minmax(auto, 150rem) 1fr'}
                  gap="1"
                  marginX="1rem"
                >
                  <GridItem area={'header'}>
                    <Header />
                  </GridItem>
                  <GridItem area={'body'}>
                    <Component {...pageProps} />
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

import Header from "@/components/Header";
import { TokenListProvider } from "@/contexts/TokenContext";
import { useRailgunProvider } from "@/hooks/useRailgunProvider";
import { bscIcon } from "@/utils/constants";
import { initialize } from "@/utils/railgun";
import { Grid, GridItem } from "@chakra-ui/layout";
import { ChakraProvider } from "@chakra-ui/react";
import { extendTheme } from "@chakra-ui/theme-utils";
import { RainbowKitProvider, getDefaultWallets } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { mainnet, bsc, goerli } from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";

const colors = {
  brand: {
    900: "#1a365d",
    800: "#153e75",
    700: "#2a69ac",
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
    // polygon,
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
  appName: "Railgun Shielder App",
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
        <title>Railgun Shielder App</title>
        <meta
          name="description"
          content="An app to shield funds into railgun"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider chains={chains}>
          <ChakraProvider theme={theme}>
            {isProviderLoaded && (
              <TokenListProvider>
                <Grid
                  templateAreas={`". header ."
                  ". body ."`}
                  gridTemplateRows={"4.8rem 100vh"}
                  gridTemplateColumns={"1fr minmax(auto, 150rem) 1fr"}
                  gap="1"
                  marginX="1rem"
                >
                  <GridItem area={"header"}>
                    <Header />
                  </GridItem>
                  <GridItem area={"body"}>
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

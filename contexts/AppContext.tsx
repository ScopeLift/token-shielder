import useNotifications from "@/hooks/useNotifications";
import useToken from "@/hooks/useToken";
import { useTokenList, TokenListItem } from "@/hooks/useTokenList";
import { BigNumber } from "@ethersproject/bignumber";
import React, { ReactNode, createContext, useContext } from "react";
import { useAccount } from "wagmi";

export type AppContextType = {
  tokenList: TokenListItem[];
  isLoading: boolean;
  tokenMap: Map<string, BigNumber>;
};
const initialContext = {
  isLoading: false,
  tokenList: [],
  tokenMap: new Map(),
};

const AppContext = createContext<AppContextType>(initialContext);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { notifyUser } = useNotifications();
  const { isLoading, error, tokenList } = useTokenList();
  const { isConnected } = useAccount();
  const {
    isLoading: tokenIsLoading,
    error: tokenError,
    data: tokenMap,
  } = useToken({ tokenList: tokenList || [] });

  if (error) {
    console.error(error);
    notifyUser({
      alertType: "error",
      message: "Something went wrong fetching the token list",
    });
  }
  if (tokenError && isConnected) {
    console.error(tokenError);
    notifyUser({
      alertType: "error",
      message:
        "Something went wrong fetching the token balances and allowances",
    });
  }
  return (
    <AppContext.Provider
      value={{
        tokenList: tokenList || [],
        isLoading: isLoading || tokenIsLoading,
        tokenMap: tokenMap || new Map(),
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);

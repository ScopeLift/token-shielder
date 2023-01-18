import useNotifications from "@/hooks/useNotifications";
import useTokenAllowances from "@/hooks/useTokenAllowances";
import useTokenBalances from "@/hooks/useTokenBalances";
import { useTokenList, TokenListItem } from "@/hooks/useTokenList";
import { BigNumber } from "@ethersproject/bignumber";
import React, { ReactNode, createContext, useContext } from "react";
import { useAccount } from "wagmi";

type TokenListContextItem = TokenListItem & { balance: BigNumber | null };

export type TokenContextType = {
  tokenList: TokenListContextItem[];
  isLoading: boolean;
  tokenAllowances: Map<string, BigNumber>;
  weth?: string;
};
const initialContext = {
  isLoading: false,
  weth: "",
  tokenList: [],
  tokenAllowances: new Map(),
};

const TokenContext = createContext<TokenContextType>(initialContext);

export const TokenListProvider = ({ children }: { children: ReactNode }) => {
  const { notifyUser } = useNotifications();
  const { isLoading, error, tokenList, weth } = useTokenList();
  const { isConnected } = useAccount();
  const {
    isLoading: balanceIsLoading,
    error: balanceError,
    data,
  } = useTokenBalances({ tokenList: tokenList || [] });
  const {
    isLoading: allowanceIsLoading,
    error: allowanceError,
    data: allowances,
  } = useTokenAllowances({ tokenList: tokenList || [] });

  if (error) {
    console.error(error);
    notifyUser({
      alertType: "error",
      message: "Something went wrong fetching the token list",
    });
  }
  if (balanceError && isConnected) {
    console.error(balanceError);
    notifyUser({
      alertType: "error",
      message: "Something went wrong fetching the token balances",
    });
  }
  if (allowanceError && isConnected) {
    console.error(allowanceError);
    notifyUser({
      alertType: "error",
      message: "Something went wrong fetching the token allowances",
    });
  }
  return (
    <TokenContext.Provider
      value={{
        tokenList: data || [],
        isLoading: isLoading || balanceIsLoading || allowanceIsLoading,
        tokenAllowances: allowances || new Map(),
        weth,
      }}
    >
      {children}
    </TokenContext.Provider>
  );
};

export const useToken = () => useContext(TokenContext);

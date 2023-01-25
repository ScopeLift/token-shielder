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
};
const initialContext = {
  isLoading: false,
  tokenList: [],
  tokenAllowances: new Map(),
};

const TokenContext = createContext<TokenContextType>(initialContext);

export const TokenListProvider = ({ children }: { children: ReactNode }) => {
  const { notifyUser } = useNotifications();
  const { tokenList } = useTokenList();
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
        isLoading: balanceIsLoading || allowanceIsLoading,
        tokenAllowances: allowances || new Map(),
      }}
    >
      {children}
    </TokenContext.Provider>
  );
};

export const useToken = () => useContext(TokenContext);

import useNotifications from "@/hooks/useNotifications";
import useTokenBalances from "@/hooks/useTokenBalances";
import { useTokenList, TokenListItem } from "@/hooks/useTokenList";
import { BigNumber } from "@ethersproject/bignumber";
import React, { ReactNode, createContext, useContext } from "react";
import { useAccount } from "wagmi";

type TokenListContextItem = TokenListItem & { balance: BigNumber | null };

export type TokenContextType = {
  tokenList: TokenListContextItem[];
  isLoading: boolean;
};
const initialContext = {
  isLoading: false,
  tokenList: [],
};

const TokenContext = createContext<TokenContextType>(initialContext);

export const TokenListProvider = ({ children }: { children: ReactNode }) => {
  const { notifyUser } = useNotifications();
  const { isLoading, error, tokenList } = useTokenList();
  const { isConnected } = useAccount();
  const {
    isLoading: balanceIsLoading,
    error: balanceError,
    data,
  } = useTokenBalance({ tokenList: tokenList || [] });
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
  return (
    <TokenContext.Provider
      value={{
        tokenList: data || [],
        isLoading: isLoading && balanceIsLoading,
      }}
    >
      {children}
    </TokenContext.Provider>
  );
};

export const useToken = () => useContext(TokenContext);

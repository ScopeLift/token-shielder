import useNotifications from "@/hooks/useNotifications";
import useTokenBalance from "@/hooks/useTokenBalance";
import { useTokenList, TokenListItem } from "@/hooks/useTokenList";
import { BigNumber } from "@ethersproject/bignumber";
import React, { ReactNode, createContext, useContext } from "react";

type TokenListContextItem = TokenListItem & { balance: BigNumber | null };

// 1. Add token list fetching from networks object
// 2. Filter token list by name
// 2. Store list of tokens in object
// 3. Fetch balances for each token in a multicall
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
  const {
    isLoading: balanceIsLoading,
    error: balanceError,
    data,
  } = useTokenBalance({ tokenList: tokenList || [] });
  if (error) {
    notifyUser({
      alertType: "error",
      message: "Something went wrong fetching the token list",
    });
  }
  if (balanceError) {
    notifyUser({
      alertType: "error",
      message: "Something went wrong fetching the token balances",
    });
  }
  console.log(data);
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

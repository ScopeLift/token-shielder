import useTokenList from "@/hooks/useTokenList";
import React, { createContext, useContext } from "react";

// 1. Add token list fetching from networks object
// 2. Filter token list by name
// 2. Store list of tokens in object
// 3. Fetch balances for each token in a multicall
export type TokenContextType = {};
const initialContext = {};

const TokenContext = createContext<TokenContextType>(initialContext);

export const TokenListProvider = ({ children }) => {
  const { isLoading, error, tokenList } = useTokenList();
  const balances = null;
  // Add multicall
  // tokenAddress to balance
  console.log(isLoading);
  console.log(error);
  console.log(tokenList);
  return (
    <TokenContext.Provider value={{ tokenList }}>
      {children}
    </TokenContext.Provider>
  );
};

export const useToken = () => useContext(TokenContext);

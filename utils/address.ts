export const shortenAddress = (address: string) => {
  if (address.length < 9) {
    return address;
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

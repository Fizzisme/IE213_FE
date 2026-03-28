import { WEB3AUTH_NETWORK } from "@web3auth/modal";

const clientId = "BAEeOqQNYqgCqLI-JKYZupp4LjylYFWfngrk2uvRCXQjgb4_uYfL46fE-woEuCBMXO4beTFeSAoHpnliJFB1_Hc";

const web3AuthContextConfig = {
  web3AuthOptions: {
    clientId,
    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  },
};

export default web3AuthContextConfig;

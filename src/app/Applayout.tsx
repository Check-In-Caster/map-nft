"use client";
import { GetSiweMessageOptions } from "@rainbow-me/rainbowkit-siwe-next-auth";
import "@rainbow-me/rainbowkit/styles.css";
import type { Metadata } from "next";
import React from "react";

import Footer from "@/components/home/footer";
import Header from "@/components/home/header";
import PromoModal from "@/components/home/promo-modal";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { RainbowKitSiweNextAuthProvider } from "@rainbow-me/rainbowkit-siwe-next-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { usePathname } from "next/navigation";
import { Toaster } from "sonner";
import { http, WagmiProvider } from "wagmi";
import { baseSepolia } from "wagmi/chains";

export const metadata: Metadata = {
  title: "Maps by Checkin",
  description: "",
};

const getSiweMessageOptions: GetSiweMessageOptions = () => ({
  statement: "Sign in to Maps by Checkin!",
});

const config = getDefaultConfig({
  appName: "Maps by Checkin",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(),
  },
});

const queryClient = new QueryClient();

const Applayout = ({
  children,
  session = null,
}: {
  children: React.ReactNode;
  session?: Session | null;
}) => {
  const pathName = usePathname();

  return (
    <WagmiProvider config={config}>
      <SessionProvider refetchInterval={0} session={session}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitSiweNextAuthProvider
            getSiweMessageOptions={getSiweMessageOptions}
          >
            <RainbowKitProvider initialChain={baseSepolia.id}>
              <div className="bg-custom-gray-30 text-[#000] pb-8">
                {pathName !== "/maintenance" ? (
                  <>
                    <Header />
                    <PromoModal />
                  </>
                ) : null}
                {children}
                {pathName !== "/maintenance" ? (
                  <>
                    <Footer />{" "}
                  </>
                ) : null}
                <Toaster position="top-center" />
              </div>
            </RainbowKitProvider>
          </RainbowKitSiweNextAuthProvider>
        </QueryClientProvider>
      </SessionProvider>
    </WagmiProvider>
  );
};

export default Applayout;

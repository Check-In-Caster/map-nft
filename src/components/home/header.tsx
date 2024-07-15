"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import useLocalStorage from "@/hooks/useLocalStorage";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useAccount } from "wagmi";

const NavLink = ({
  href,
  label,
  onClick,
  external = false,
  mobile = false,
}: {
  href?: string;
  label: string;
  onClick?: () => void;
  external?: boolean;
  mobile?: boolean;
}) => {
  const path = usePathname();

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        className={`${
          mobile ? "" : "border-r hidden md:block"
        } w-full border-gray-900 p-3 text-center`}
      >
        {label}
      </a>
    );
  }

  if (!href)
    return (
      <span
        className={`${
          mobile ? "" : "border-r hidden md:block"
        } cursor-pointer w-full border-gray-900 p-3 text-center`}
        onClick={onClick}
      >
        {label}
      </span>
    );

  return (
    <Link
      href={href}
      passHref
      className={`${
        mobile ? "" : "border-r hidden md:block"
      } w-full border-gray-900 p-3 text-center ${
        path.includes(href.replace("/", "")) ? "bg-[#BAE1EB]" : ""
      } `}
    >
      {label}
    </Link>
  );
};

const Navigation = ({ mobileNav }: { mobileNav?: boolean }) => {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");

  const [, setReferrer] = useLocalStorage("referrer", "");

  const wallet = useAccount();
  const [address, setAddress] = useState<`0x${string}`>();

  useEffect(() => {
    setAddress(wallet.address);
  }, [wallet.address]);

  const handleMyStatsClick = () => {
    if (!address) {
      try {
        (
          document.querySelector(".connect-wallet button") as HTMLButtonElement
        ).click();

        if (mobileNav) {
          (
            document.querySelector(
              "#menu-sidebar .sheet-close"
            ) as HTMLButtonElement
          ).click();
        }
      } catch {}
    }
  };

  useEffect(() => {
    if (ref) {
      setReferrer(ref);
    }
  }, [searchParams, ref]);

  if (!mobileNav)
    return (
      <>
        <NavLink
          label="My Portfolio"
          href={address ? `/stats/${address}` : undefined}
          onClick={handleMyStatsClick}
        />
        <NavLink label="Leaderboard" href="/leaderboard" />
        <NavLink
          label="Litepaper"
          href="https://checkin.gitbook.io/"
          external
        />
        <NavLink label="Checkin app" href="https://www.checkin.gg/" external />
        <div className="bg-[#EF9854] min-h-[48px] w-full grid place-items-center connect-wallet">
          <ConnectButton
            showBalance={false}
            accountStatus={"address"}
            chainStatus={"icon"}
          />
        </div>
      </>
    );

  return (
    <>
      <NavLink
        label="My Portfolio"
        href={address ? `/stats/${address}` : undefined}
        onClick={handleMyStatsClick}
        mobile
      />
      <NavLink label="Leaderboard" href="/leaderboard" mobile />
      <NavLink
        label="Litepaper"
        href="https://checkin.gitbook.io/"
        external
        mobile
      />
      <NavLink
        label="Checkin app"
        href="https://www.checkin.gg/"
        external
        mobile
      />
    </>
  );
};

const Header = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header className="mt-8 flex w-full max-w-7xl items-center justify-between mx-auto  border border-gray-900">
      <div className="text-[#000] flex justify-center items-center w-full">
        <Sheet open={isMobile ? undefined : false}>
          <SheetTrigger className="border-r border-gray-900 h-[48px] px-3 block md:hidden">
            <Menu />
          </SheetTrigger>
          <SheetContent
            side={"left"}
            id="menu-sidebar"
            className="flex flex-col pt-12"
          >
            <Navigation mobileNav />
          </SheetContent>
        </Sheet>

        <Link
          href="/"
          passHref
          className="flex text-center justify-center items-center w-full px-5 border-r border-gray-900 h-[48px]"
        >
          <img src="/assets/images/logo.svg" className="w-20 h-auto" />{" "}
          <span className="text-xs relative pt-3">Property NFTs</span>
        </Link>
        <Suspense fallback={<div>Loading</div>}>
          <Navigation />
        </Suspense>
      </div>
    </header>
  );
};

export default Header;

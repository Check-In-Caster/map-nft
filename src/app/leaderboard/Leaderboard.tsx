"use client";

import Heading from "@/components/ui/heading";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Tabs from "@/components/ui/tabs";
import { inter } from "@/fonts";
import { formatNumberWithCommas, shortenAddress } from "@/lib/utils";
import { CountryRank, PropertyRank, UserRank } from "@/types/leaderboard";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getFnamesFromAddresses } from "./actions";

const Leaderboard = ({
  data,
}: {
  data: {
    userRank: UserRank[];
    userProfileRank: UserRank[] | null;
    countryRank: CountryRank[];
    propertyRank: PropertyRank[];
  };
}) => {
  const [active, setActive] = useState("User Rank");
  const [addressMap, setAddressMap] = useState<Map<string, string>>(
    new Map(
      data.userRank.map((user) => [
        user.wallet_address.toLowerCase(),
        user.wallet_address.toLowerCase(),
      ])
    )
  );

  useEffect(() => {
    (async () => {
      if (data.userRank.length === 0) return;

      const addresses = data.userRank.map((user) => user.wallet_address);
      const newAddressMap = await getFnamesFromAddresses(addresses);
      const prevAddressMap = new Map(
        data.userRank.map((user) => [
          user.wallet_address.toLowerCase(),
          user.wallet_address.toLowerCase(),
        ])
      );

      if (newAddressMap) {
        newAddressMap.forEach((value, key) => {
          prevAddressMap.set(key.toLowerCase(), value);
        });

        setAddressMap(prevAddressMap);
      }
    })();
  }, [data.userRank]);

  return (
    <div className="mt-8 w-full max-w-7xl mx-auto mb-8">
      <Heading label="Leaderboard" />
      <div className="">
        <Tabs
          tabs={["User Rank", "Country Rank", "Property Rank"]}
          onChange={(tab) => setActive(tab)}
          active={active}
        />

        <div className="text-right mt-14 mb-2">
          Leaderboard refreshes every 10mins
        </div>

        <div className="bg-white border border-gray-900 p-2 md:p-16">
          {active === "User Rank" ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-md font-semibold text-black w-[50px]">
                    Rank
                  </TableHead>
                  <TableHead className="text-md font-semibold text-black text-left">
                    User
                  </TableHead>
                  <TableHead className="text-md font-semibold text-black">
                    # Properties
                  </TableHead>
                  <TableHead className="text-md font-semibold text-black text-right">
                    Total Property Score
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className={`${inter.className} tracking-tight`}>
                {data?.userProfileRank && data.userProfileRank.length != 0 ? (
                  <>
                    <TableRow>
                      <TableCell className="font-medium w-[50px]"></TableCell>
                      <TableCell>
                        <div>
                          <Link
                            href={`/stats/${data.userProfileRank[0].wallet_address}`}
                            passHref
                          >
                            <span>
                              {shortenAddress(
                                data.userProfileRank[0].wallet_address
                              )}
                            </span>
                          </Link>{" "}
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatNumberWithCommas(
                          data.userProfileRank[0].properties_purchased.toString()
                        )}
                        {Number(data.userProfileRank[0].properties_purchased) >
                        1
                          ? " properties"
                          : " property"}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumberWithCommas(
                          data.userProfileRank[0].total_score.toString()
                        )}
                      </TableCell>
                    </TableRow>
                  </>
                ) : null}

                {data.userRank.map((user) => (
                  <TableRow key={user.rank}>
                    <TableCell className="font-medium w-[50px]">
                      {user.rank.toString()}
                    </TableCell>
                    <TableCell>
                      <Link href={`/stats/${user.wallet_address}`} passHref>
                        {(() => {
                          const address = user.wallet_address;
                          const addressFromMap = addressMap.get(
                            address.toLowerCase()
                          );

                          if (addressFromMap && addressFromMap != address) {
                            return addressFromMap;
                          } else {
                            return shortenAddress(address);
                          }
                        })()}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {formatNumberWithCommas(
                        user.properties_purchased.toString()
                      )}{" "}
                      properties
                    </TableCell>
                    <TableCell className="text-right">
                      {formatNumberWithCommas(user.total_score)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : null}

          {active === "Country Rank" ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-md font-semibold text-black w-[50px]">
                    Rank
                  </TableHead>
                  <TableHead className="text-md font-semibold text-black text-left">
                    Country
                  </TableHead>
                  <TableHead className="text-md font-semibold text-black">
                    # Properties Minted
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.countryRank.map((country) => {
                  return (
                    <TableRow key={country.rank.toString()}>
                      <TableCell className="font-medium w-[50px]">
                        {country.rank.toString()}
                      </TableCell>
                      <TableCell>{country.country}</TableCell>
                      <TableCell>
                        {formatNumberWithCommas(
                          country.properties_sold.toString()
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : null}
          {active === "Property Rank" ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-md font-semibold text-black w-[50px]">
                    Rank
                  </TableHead>
                  <TableHead className="text-md font-semibold text-black text-left">
                    Property
                  </TableHead>
                  <TableHead className="text-md font-semibold text-black">
                    # Minted
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.propertyRank.map((property) => (
                  <TableRow key={property.rank}>
                    <TableCell className="font-medium w-[50px]">
                      {property.rank.toString()}
                    </TableCell>
                    <TableCell>{property.location_info}</TableCell>
                    <TableCell>
                      {formatNumberWithCommas(
                        property.properties_sold.toString()
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;

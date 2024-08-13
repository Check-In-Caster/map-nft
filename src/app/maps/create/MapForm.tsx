"use client";

import AppleMap from "@/components/home/map";
import Search from "@/components/home/search";
import { Button } from "@/components/ui/button";
import ImageUpload from "@/components/ui/file-upload";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { CHAIN_ID, CONTRACT_ADDRESS, RPC_PROVIDER } from "@/config";
import { mapsABI } from "@/constants/maps";
import { zodResolver } from "@hookform/resolvers/zod";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import EmojiPicker, { EmojiStyle } from "emoji-picker-react";
import { ethers } from "ethers";
import { PlusIcon, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useAccount, useWriteContract } from "wagmi";
import { z } from "zod";
import { createMap, getLocationsInfo, updateMap } from "../actions";

const PlaceCard = ({
  property_id,
  placeSearch,
  placeDescription,
  placesMap,
  removePlace,
}: {
  property_id: string;
  placeSearch: React.ReactNode;
  placeDescription: React.ReactNode;
  placesMap: Map<
    string,
    {
      name: string;
      image: string;
      rating: number;
      category: string;
      coordinates: { lat: number; lng: number };
    }
  >;
  removePlace?: React.ReactNode;
}) => {
  const location = placesMap.get(property_id);

  return (
    <>
      <div className="mt-4 flex gap-x-6">
        {location ? (
          <div>
            <img
              src={location?.image ?? "https://via.placeholder.com/96"}
              alt=""
              className="aspect-square w-24 rounded object-cover"
            />
          </div>
        ) : null}
        <div className="relative w-full">
          {location ? (
            <>
              <div className="text-xl">{location.name}</div>
              <div className="flex items-center font-normal">
                {location.rating}
                <img
                  src="/assets/icons/ratings.svg"
                  alt=""
                  className="inline pl-1 pr-4"
                />
              </div>
              <div className="font-light">{location.category}</div>
            </>
          ) : (
            placeSearch
          )}

          <div className="absolute right-0 top-0">{removePlace}</div>
        </div>
      </div>

      {location ? placeDescription : null}
    </>
  );
};

const formSchemaFn = (isEdit?: boolean) => {
  return z.object({
    map_id: z.string().optional(),
    price: z.string().optional(),
    creator_bio: isEdit ? z.string().optional() : z.string(),
    name: z
      .string()
      .min(2, { message: "Name must have at least 2 characters" }),
    thumbnail: z.string(),
    description: z
      .string()
      .min(3, { message: "Description must have at least 3 characters" }),
    emoji: z.string().min(1, { message: "Please select an emoji" }),
    places: z
      .array(
        z.object({
          property_id: z.string(),
          description: z.string(),
        }),
      )
      .min(1, { message: "You must add at least one place" }),
  });
};

async function checkTransaction(txHash: string, interval = 4000) {
  const provider = new ethers.providers.JsonRpcProvider(RPC_PROVIDER);

  while (true) {
    try {
      const receipt = await provider.getTransactionReceipt(txHash);

      if (receipt.status === 1) {
        return true;
      } else if (receipt.status === 0) {
        toast.error("Transaction reverted");
        return false;
      }
    } catch (error) {
      console.error("Error checking transaction:", error);
    }

    await new Promise((resolve) => setTimeout(resolve, interval));
  }
}

const MapForm = ({
  heading = "Create a map",
  buttonText = "Create a map",
  mapToken = "",
  bio = "",
  values = {
    price: "0",
    map_id: "",
    thumbnail: "",
    name: "",
    description: "",
    creator_bio: "",
    emoji: "",
    places: [],
  },
}: {
  heading?: string;
  buttonText?: string;
  mapToken?: string | undefined;
  bio?: string | null;
  values?: {
    map_id?: string;
    price?: string;
    creator_bio?: string;
    name: string;
    thumbnail: string;
    description: string;
    emoji: string;
    places: {
      property_id: string;
      description: string;
    }[];
  };
}) => {
  const [creatorBio, setCreatorBio] = useState(bio);

  const [loading, setLoading] = useState(false);
  const [freeOption, setFreeOption] = useState(true);
  const { writeContractAsync, data } = useWriteContract();
  const account = useAccount();

  const router = useRouter();
  const [placesMap, setPlacesMap] = useState<
    Map<
      string,
      {
        name: string;
        image: string;
        rating: number;
        category: string;
        coordinates: { lat: number; lng: number };
      }
    >
  >(new Map());

  useEffect(() => {
    (async () => {
      const propertyIds = values.places.map((place) => place.property_id);

      if (propertyIds.length === 0) return;

      const locationsMap = await getLocationsInfo(propertyIds);

      const newPlacesMap = new Map() as typeof placesMap;

      locationsMap.forEach((location, property_id) => {
        newPlacesMap.set(property_id, {
          name: location.location ?? "",
          image: location.image ?? "",
          rating: location.rating ?? 0,
          category: location.category ?? "",
          coordinates: location.coordinates as { lat: number; lng: number },
        });
      });

      setPlacesMap(newPlacesMap);
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    (async () => {
      if (account.address && !creatorBio) {
        const response = await fetch(`/api/account/${account.address}`);
        const data = await response.json();
        if (data.bio) {
          setCreatorBio(data.bio);
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account.address]);

  const formSchema = formSchemaFn(values.map_id ? true : false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: values,
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "places",
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!account.address) {
      toast.error("Connect wallet to continue");
      return;
    }

    if (values.thumbnail === "" && values.emoji === "") {
      toast.error("Please upload a thumbnail or select an emoji");
      return;
    }

    const {
      map_id,
      name,
      description,
      emoji,
      places,
      thumbnail,
      creator_bio,
      price,
    } = values;

    let txHash = null;
    setLoading(true);

    if (!map_id) {
      toast.info("Confirm the transaction to create NFT");

      const amount =
        price && Number(price) != 0
          ? ethers.utils.parseEther(String(price))
          : 0;

      try {
        const _mint = await writeContractAsync({
          address: CONTRACT_ADDRESS!,
          chainId: CHAIN_ID,
          abi: mapsABI,
          functionName: "createToken",
          args: [
            ethers.constants.MaxUint256,
            ethers.constants.MaxUint256,
            account.address,
            amount,
          ],
          value: ethers.utils.parseUnits((0).toString(), "ether").toBigInt(),
        });

        if (_mint) {
          txHash = _mint;
        }

        if (_mint == null) {
          toast.error("Failed to create token id");
          setLoading(false);
          return;
        }

        if (!(await checkTransaction(_mint))) {
          setLoading(false);
          return;
        }
      } catch (e: unknown) {
        console.log(e);

        if (typeof e === "object" && e !== null && "message" in e) {
          const error = e as Error;
          if (error.message.includes("User denied transaction signature")) {
            toast.error("User rejected the transaction");
          } else {
            toast.error("Failed to create token id");
          }
        } else {
          console.error("Unexpected error:", e);
        }

        setLoading(false);
        return;
      }
    }

    const response = map_id
      ? await updateMap({
          map_id,
          description: description,
          emoji: emoji,
          thumbnail,
          name: name,
          places: places,
          creator_bio: creator_bio as string,
        })
      : await createMap({
          description: description,
          emoji: emoji,
          name: name,
          thumbnail,
          txHash: String(txHash),
          owner_address: account.address,
          places: places,
          creator_bio: creator_bio as string,
          price,
        });

    setLoading(false);
    if (response.status == "error") {
      toast.error(response.message);
    } else {
      toast.success(
        map_id ? "Map updated successfully" : "Map created successfully",
      );

      // redirect to the map page
      router.push(`/maps/${response.slug}`);
    }
  };

  const emojiValue = form.watch("emoji");

  return (
    <div className="mx-auto mb-8 mt-8 w-full max-w-7xl p-4 md:p-0">
      <div className="my-10 text-center text-2xl md:text-4xl">{heading}</div>
      {!account.address ? (
        <div className="grid place-items-center">
          <p className="my-10 text-center text-xl">
            Connect wallet to create your map!
          </p>
          <div className="connect-wallet grid min-h-[48px] place-items-center bg-[#5844C1] px-10">
            <ConnectButton
              showBalance={false}
              accountStatus={"address"}
              chainStatus={"icon"}
            />
          </div>
        </div>
      ) : (
        <div className="mt-24 grid gap-10 md:grid-cols-2">
          <div className="space-y-5">
            <FormProvider {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)} // Use handleSubmit from useForm
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Map Name*</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      {form.formState.errors.name && (
                        <div className="text-sm text-red-500">
                          {form.formState.errors.name.message}
                        </div>
                      )}
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Map Description*</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      {form.formState.errors.description && (
                        <div className="text-sm text-red-500">
                          {form.formState.errors.description.message}
                        </div>
                      )}
                    </FormItem>
                  )}
                />

                {creatorBio || values.map_id ? null : (
                  <>
                    <FormField
                      control={form.control}
                      name="creator_bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Creator Bio*</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormDescription>
                            This bio can only be set once.
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {values.map_id ? null : (
                  <div className="relative">
                    <div className="absolute right-0">
                      <label className="inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          value=""
                          className="peer sr-only"
                          checked={freeOption}
                          onChange={() => {
                            setFreeOption(!freeOption);

                            if (!freeOption) {
                              form.setValue("price", "0");
                            }
                          }}
                        />
                        <div className="peer relative h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#5844C1] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800 rtl:peer-checked:after:-translate-x-full"></div>
                        <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                          Free
                        </span>
                      </label>
                    </div>
                    <FormField
                      control={form.control}
                      name="price"
                      disabled={freeOption}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price in ETH</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <div>
                  <FormLabel className="mb-4 block">Thumbnail*</FormLabel>
                  <ImageUpload
                    path="checkin-maps"
                    label="Thumbnail"
                    multimedia
                    handleUploadFile={(e) => {
                      form.setValue("thumbnail", e);
                    }}
                  />
                  <FormDescription>Recommended size: 500x500px</FormDescription>
                </div>

                <Popover>
                  <PopoverTrigger asChild>
                    <div>
                      <FormLabel className="mb-4 block">Map Emoji*</FormLabel>

                      <Button type="button" variant="outline">
                        {emojiValue ? (
                          <img src={emojiValue} className="mr-4 h-6 w-6" />
                        ) : null}
                        Select Emoji
                      </Button>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-full">
                    <EmojiPicker
                      emojiStyle={EmojiStyle.TWITTER}
                      onEmojiClick={(e) => {
                        form.setValue("emoji", e.imageUrl);
                      }}
                    />
                  </PopoverContent>
                </Popover>

                <div>
                  {fields.map((item, index) => (
                    <PlaceCard
                      key={item.id}
                      property_id={item.property_id}
                      placesMap={placesMap}
                      removePlace={
                        <button
                          type="button"
                          className="mt-2"
                          onClick={() => remove(index)}
                        >
                          <X size={24} />{" "}
                        </button>
                      }
                      placeSearch={
                        <div className="pr-8">
                          <Search
                            setProperty={(property) => {
                              update(index, {
                                ...fields[index],
                                property_id: property.property_id,
                              });

                              const newPlacesMap = new Map(
                                JSON.parse(
                                  JSON.stringify(Array.from(placesMap)),
                                ),
                              ) as typeof placesMap;
                              newPlacesMap.set(property.property_id, {
                                name: property.Locations.location ?? "",
                                image: property.Locations.image ?? "",
                                rating: property.Locations.rating ?? 0,
                                category: property.Locations.category ?? "",
                                coordinates: property.Locations.coordinates as {
                                  lat: number;
                                  lng: number;
                                },
                              });
                              setPlacesMap(newPlacesMap);
                            }}
                          />
                        </div>
                      }
                      placeDescription={
                        <FormField
                          control={form.control}
                          name={`places.${index}.description`}
                          render={({ field }) => (
                            <FormItem className="mt-5">
                              <FormControl>
                                <Textarea
                                  // {...field}
                                  minLength={15}
                                  {...form.register(
                                    `places.${index}.description`,
                                  )}
                                  placeholder="Description of the place (min 15 characters)"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      }
                    />
                  ))}

                  <a
                    className="mt-8 flex cursor-pointer items-center"
                    onClick={() => {
                      append({
                        description: "",
                        property_id: "",
                      });
                    }}
                  >
                    <PlusIcon size={24} className="mr-2 text-[#EF9854]" />
                    Add a Place
                  </a>
                  {form.formState.errors.places && (
                    <div className="mt-2 text-sm text-red-500">
                      {form.formState.errors.places.message}
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="connect-wallet grid min-h-[48px] w-full place-items-center bg-[#5844C1] text-[#fff]"
                >
                  {loading ? "Loading..." : buttonText}
                </button>
              </form>
            </FormProvider>
          </div>
          <div className="grid max-h-[800px] place-items-center">
            <AppleMap
              token={mapToken}
              coordinatesArray={(() => {
                const propertyIds = form
                  .getValues()
                  .places.map((place) => place.property_id);

                let coordinates: {
                  lat: number;
                  lng: number;
                }[] = [];

                for (const propertyId of propertyIds) {
                  const location = placesMap.get(propertyId);
                  if (location?.coordinates)
                    coordinates.push(location.coordinates);
                }

                return coordinates;
              })()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MapForm;

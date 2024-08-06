"use client";

import AppleMap from "@/components/home/map";
import Search from "@/components/home/search";
import { Button } from "@/components/ui/button";
import ImageUpload from "@/components/ui/file-upload";
import {
  FormControl,
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
import { zodResolver } from "@hookform/resolvers/zod";
import EmojiPicker, { EmojiStyle } from "emoji-picker-react";
import { PlusIcon, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
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
      <div className="flex mt-4 gap-x-6">
        {location ? (
          <div>
            <img
              src={location?.image ?? "https://via.placeholder.com/96"}
              alt="place"
              className="rounded w-24 aspect-square object-cover"
            />
          </div>
        ) : null}
        <div className="w-full relative">
          {location ? (
            <>
              <div className="text-xl">{location.name}</div>
              <div className="flex items-center font-normal">
                {location.rating}
                <img
                  src="/assets/icons/ratings.svg"
                  alt=""
                  className="inline pr-4 pl-1"
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
        })
      )
      .min(1, { message: "You must add at least one place" }),
  });
};

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
  const [freeOption, setFreeOption] = useState(true);
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
          places: places,
          creator_bio: creator_bio as string,
          price,
        });

    if (response.status == "error") {
      toast.error(response.message);
    } else {
      toast.success(
        map_id ? "Map updated successfully" : "Map created successfully"
      );

      // redirect to the map page
      router.push(`/maps/${response.slug}`);
    }
  };

  const emojiValue = form.watch("emoji");

  return (
    <div className="mt-8 w-full max-w-7xl mx-auto mb-8 p-4 md:p-0">
      <div className="text-center text-2xl md:text-4xl my-10">{heading}</div>
      <div className="grid md:grid-cols-2 gap-10 mt-24">
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
                      <div className="text-red-500 text-sm">
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
                      <div className="text-red-500 text-sm">
                        {form.formState.errors.description.message}
                      </div>
                    )}
                  </FormItem>
                )}
              />

              {bio || values.map_id ? null : (
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
                      </FormItem>
                    )}
                  />
                </>
              )}

              {values.map_id ? null : (
                <div className="relative">
                  <div className="absolute right-0">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        value=""
                        className="sr-only peer"
                        checked={freeOption}
                        onChange={() => {
                          setFreeOption(!freeOption);

                          if (!freeOption) {
                            form.setValue("price", "0");
                          }
                        }}
                      />
                      <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#5844C1]"></div>
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
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <div>
                    <FormLabel className="mb-4 block">Map Emoji*</FormLabel>

                    <Button type="button" variant="outline">
                      {emojiValue ? (
                        <img src={emojiValue} className="w-6 h-6 mr-4" />
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
                              JSON.parse(JSON.stringify(Array.from(placesMap)))
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
                                  `places.${index}.description`
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
                  className="mt-8 flex items-center cursor-pointer"
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
                  <div className="text-red-500 text-sm mt-2">
                    {form.formState.errors.places.message}
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="bg-[#5844C1] min-h-[48px] w-full grid place-items-center connect-wallet text-[#fff]"
              >
                {buttonText}
              </button>
            </form>
          </FormProvider>
        </div>
        <div className="grid place-items-center max-h-[800px]">
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
    </div>
  );
};

export default MapForm;

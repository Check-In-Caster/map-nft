"use client";

import AppleMap from "@/components/home/map";
import Search from "@/components/home/search";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
import EmojiPicker, { EmojiStyle } from "emoji-picker-react";
import { PlusIcon, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { createMap, getLocationInfo, updateMap } from "../actions";

const PlaceCard = ({
  property_id,
  placeDescription,
  removePlace,
}: {
  property_id: string;
  placeDescription: React.ReactNode;
  removePlace?: React.ReactNode;
}) => {
  const [location, setLocation] = useState<{
    name: string;
    image: string;
    rating: number;
    category: string;
  } | null>(null);

  useEffect(() => {
    (async () => {
      const location = await getLocationInfo(property_id);

      if (location)
        setLocation({
          name: location.location ?? "",
          image: location.image ?? "",
          rating: location.rating ?? 0,
          category: location.category ?? "",
        });
    })();
  }, [property_id]);

  return (
    <>
      <div className="flex mt-4">
        <div>
          <img
            src={location?.image ?? "https://via.placeholder.com/96"}
            alt="place"
            className="rounded w-24 aspect-square object-cover"
          />
        </div>
        <div className="w-full pl-6 relative">
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
          ) : null}

          <div className="absolute right-0 top-0">{removePlace}</div>
        </div>
      </div>

      {placeDescription}
    </>
  );
};

const MapForm = ({
  heading = "Create a map",
  buttonText = "Create a map",
  mapToken = "",
  bio = "",
  values = {
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
  const router = useRouter();
  const [openModal, setOpenModal] = useState(false);
  const form = useForm({
    defaultValues: values,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "places",
  });

  const onSubmit = async (values: any) => {
    const { map_id, name, description, emoji, places, thumbnail, creator_bio } =
      values;

    const response = map_id
      ? await updateMap({
          map_id,
          description: description,
          emoji: emoji,
          thumbnail,
          name: name,
          places: places,
          creator_bio,
        })
      : await createMap({
          description: description,
          emoji: emoji,
          name: name,
          thumbnail,
          places: places,
          creator_bio,
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

  console.log(form.getValues());

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
                    <FormLabel>Map Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Map Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
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
                        <FormLabel>Creator Bio</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </>
              )}

              <div>
                <FormLabel className="mb-4 block">Thumbnail</FormLabel>
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
                  <Button variant="outline">
                    {emojiValue ? (
                      <img src={emojiValue} className="w-6 h-6 mr-4" />
                    ) : null}
                    Map Emoji
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full">
                  <EmojiPicker
                    emojiStyle={EmojiStyle.TWITTER}
                    onEmojiClick={(e) => {
                      console.log(e.imageUrl);
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
                    removePlace={
                      <button type="button" onClick={() => remove(index)}>
                        <X size={24} />{" "}
                      </button>
                    }
                    placeDescription={
                      <FormField
                        control={form.control}
                        name={`places.${index}.description`}
                        render={({ field }) => (
                          <FormItem className="mt-5">
                            <FormControl>
                              <Input
                                // {...field}
                                {...form.register(
                                  `places.${index}.description`
                                )}
                                placeholder="Description"
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
                    setOpenModal(true);
                  }}
                >
                  <PlusIcon size={24} className="mr-2 text-[#EF9854]" />
                  Add a Place
                </a>
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
        <div className="grid place-items-center">
          <AppleMap
            token={mapToken}
            // coordinatesArray={userProperties
            //   .map((property) => {
            //     const coordinates = property.PropertyInfo?.Locations
            //       .coordinates as { lat: number; lng: number } | undefined;
            //     if (coordinates)
            //       return {
            //         lat: coordinates.lat,
            //         lng: coordinates.lng,
            //       };
            //   })
            //   .filter((c): c is { lat: number; lng: number } => !!c)}
          />
        </div>
      </div>

      <Dialog
        open={openModal}
        onOpenChange={(open) => {
          if (!open) {
            setOpenModal(false);
          }
        }}
      >
        <DialogContent className="h-96 max-w-[800px] w-full">
          <div>
            <div className="bg-white">
              <Search
                setProperty={(property) => {
                  append({
                    description: "",
                    property_id: property.property_id,
                  });
                  setOpenModal(false);
                }}
              />
            </div>
            <div className="text-center h-full flex items-center justify-center pb-20">
              Search to get a list of locations
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MapForm;

"use client";

import AppleMap from "@/components/home/map";
import { Button } from "@/components/ui/button";
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
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { createMap, updateMap } from "../actions";

const PlaceCard = ({
  name,
  image,
  rating,
  reviews,
  category,
  placeDescription,
  removePlace,
}: {
  name: string;
  image: string;
  rating: number;
  reviews: number;
  category: string;
  placeDescription: React.ReactNode;
  removePlace?: React.ReactNode;
}) => {
  return (
    <>
      <div className="flex mt-4">
        <div>
          <img src={image} alt="place" className="rounded" />
        </div>
        <div className="w-full pl-6 relative">
          <div className="text-xl">{name}</div>
          <div className="flex items-center font-normal">
            {rating}
            <img
              src="/assets/icons/ratings.svg"
              alt=""
              className="inline pr-4 pl-1"
            />
            ({reviews})
          </div>
          <div className="font-light">{category}</div>

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
  values = {
    map_id: "",
    name: "",
    description: "",
    emoji: "",
    places: [],
  },
}: {
  heading?: string;
  buttonText?: string;
  mapToken?: string;
  values?: {
    map_id?: string;
    name: string;
    description: string;
    emoji: string;
    places: {
      location_id: string;
      description: string;
    }[];
  };
}) => {
  const router = useRouter();

  const form = useForm({
    defaultValues: values,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "places",
  });

  const onSubmit = async (values: any) => {
    const { map_id, name, description, emoji, places } = values;

    const response = map_id
      ? await updateMap({
          map_id,
          description: description,
          emoji: emoji,
          name: name,
          places: places,
        })
      : await createMap({
          description: description,
          emoji: emoji,
          name: name,
          places: places,
        });

    toast.success(
      map_id ? "Map updated successfully" : " Map created successfully"
    );

    // redirect to the map page
    router.push(`/map/${response.map_id}`);
  };

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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">Map Emoji</Button>
                </PopoverTrigger>
                <PopoverContent className="w-full">
                  <EmojiPicker emojiStyle={EmojiStyle.TWITTER} />
                </PopoverContent>
              </Popover>

              <FormField
                control={form.control}
                name="emoji"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Map Emoji</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div>
                {fields.map((item, index) => (
                  <PlaceCard
                    name="Ramen Nagi"
                    key={item.id}
                    image="https://via.placeholder.com/80"
                    rating={4.6}
                    reviews={442}
                    category="Ramen Restaurants"
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
                  onClick={() => {
                    append({ description: "", location_id: "" });
                  }}
                  className="mt-8 flex items-center"
                >
                  <PlusIcon size={24} className="mr-2" />
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
    </div>
  );
};

export default MapForm;

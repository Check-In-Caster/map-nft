import { Locations, PropertyInfo } from "@prisma/client";

export type Properties = (PropertyInfo & { Locations: Partial<Locations> })[];

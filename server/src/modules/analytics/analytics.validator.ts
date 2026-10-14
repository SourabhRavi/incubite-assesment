import { z } from "zod";
import { COUNTRIES } from "../../constants/constants.js";

export const countryQuerySchema = z.object({
  country: z.enum(COUNTRIES),
});

export type CountryQuery = z.infer<typeof countryQuerySchema>;

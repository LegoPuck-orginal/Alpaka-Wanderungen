import { z } from "zod";

export const TourSchema = z.object({
  title: z.string().min(3, 'Titel zu kurz'),
  description: z.string().min(10, 'Beschreibung zu kurz'),
  durationMin: z.coerce.number().int().min(30, 'Mindestens 30 Minuten'),
  priceCents: z.coerce.number().int().min(0, 'Preis ungültig'),
  capacity: z.coerce.number().int().min(1, 'Kapazität ungültig'),
});

export const SlotSchema = z.object({
  tourId: z.string().min(1, 'Tour erforderlich'),
  start: z.string().min(1, 'Start erforderlich'),
  end: z.string().min(1, 'Ende erforderlich'),
  capacity: z.coerce.number().int().min(1, 'Kapazität ungültig'),
});

export const BookingSchema = z.object({
  slotId: z.string().min(1, 'Slot fehlt'),
  persons: z.coerce.number().int().min(1, 'Mindestens 1 Person'),
});

export type TourInput = z.infer<typeof TourSchema>;
export type SlotInput = z.infer<typeof SlotSchema>;
export type BookingInput = z.infer<typeof BookingSchema>;

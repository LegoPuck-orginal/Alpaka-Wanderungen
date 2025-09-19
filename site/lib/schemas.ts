import { z } from "zod";

export const TourSchema = z.object({
  title: z.string().min(3, 'Titel zu kurz'),
  description: z.string().min(10, 'Beschreibung zu kurz'),
  durationMin: z.coerce.number().int().min(30, 'Mindestens 30 Minuten'),
  priceCents: z.coerce.number().int().min(0, 'Preis ungültig'),
  capacity: z.coerce.number().int().min(1, 'Kapazität ungültig'),
  minPersonsPerBooking: z.coerce.number().int().min(1).max(50).default(1),
  maxPersonsPerBooking: z.coerce.number().int().min(1).max(50).default(6),
}).refine((v) => v.maxPersonsPerBooking >= v.minPersonsPerBooking, {
  message: 'Max muss ≥ Min sein',
  path: ['maxPersonsPerBooking']
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
  email: z.string().email('Bitte gültige E-Mail angeben'),
});

export const UserCreateSchema = z.object({
  email: z.string().email('Bitte gültige E-Mail'),
  name: z.string().min(1, 'Name erforderlich').optional().default(''),
  password: z.string().min(6, 'Mindestens 6 Zeichen'),
  role: z.enum(['admin','user']).default('admin'),
});

export const UserRoleSchema = z.object({
  id: z.string().min(1),
  role: z.enum(['admin','user']),
});

export const UserPasswordSchema = z.object({
  id: z.string().min(1),
  password: z.string().min(6, 'Mindestens 6 Zeichen'),
});

export type TourInput = z.infer<typeof TourSchema>;
export type SlotInput = z.infer<typeof SlotSchema>;
export type BookingInput = z.infer<typeof BookingSchema>;

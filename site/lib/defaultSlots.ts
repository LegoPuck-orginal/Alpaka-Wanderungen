import { prisma } from "./prisma";

export type SlotTemplateId = "morning" | "afternoon";

export const SLOT_TEMPLATES: Array<{
  id: SlotTemplateId;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
}> = [
  {
    id: "morning",
    startHour: 9,
    startMinute: 0,
    endHour: 12,
    endMinute: 0,
  },
  {
    id: "afternoon",
    startHour: 14,
    startMinute: 0,
    endHour: 17,
    endMinute: 0,
  },
];

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export async function ensureDefaultSlots({
  start,
  end,
  tourId,
}: {
  start: Date;
  end: Date;
  tourId?: string;
}) {
  const startDate = startOfDay(start);
  const endDate = startOfDay(end);
  if (endDate < startDate) {
    return;
  }

  const tours = await prisma.tour.findMany({
    where: tourId ? { id: tourId } : undefined,
    select: { id: true, capacity: true },
  });

  if (tours.length === 0) {
    return;
  }

  const tourIds = tours.map((t) => t.id);
  const existingSlots = await prisma.eventSlot.findMany({
    where: {
      tourId: { in: tourIds },
      start: { gte: startDate, lte: endOfDay(endDate) },
    },
    select: { id: true, tourId: true, start: true },
  });

  const existingKey = new Set(
    existingSlots.map(
      (slot) => `${slot.tourId}-${slot.start.toISOString()}`
    )
  );

  const data: Array<{
    tourId: string;
    start: Date;
    end: Date;
    capacity: number;
  }> = [];

  for (
    let cursor = new Date(startDate);
    cursor <= endDate;
    cursor = addDays(cursor, 1)
  ) {
    for (const tour of tours) {
      for (const template of SLOT_TEMPLATES) {
        const startTime = new Date(cursor);
        startTime.setHours(template.startHour, template.startMinute, 0, 0);
        const endTime = new Date(cursor);
        endTime.setHours(template.endHour, template.endMinute, 0, 0);
        const key = `${tour.id}-${startTime.toISOString()}`;
        if (existingKey.has(key)) continue;
        data.push({
          tourId: tour.id,
          start: startTime,
          end: endTime,
          capacity: tour.capacity,
        });
        existingKey.add(key);
      }
    }
  }

  if (data.length > 0) {
    await prisma.eventSlot.createMany({ data });
  }
}

export function getSlotTimeOfDay(date: Date): SlotTemplateId {
  const hour = date.getHours();
  const afternoon = SLOT_TEMPLATES.find((t) => t.id === "afternoon");
  if (!afternoon) {
    return SLOT_TEMPLATES[0]?.id ?? "morning";
  }
  return hour < afternoon.startHour ? "morning" : "afternoon";
}

export function formatDateKey(date: Date) {
  return date.toLocaleDateString("sv-SE");
}

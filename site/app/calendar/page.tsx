import CalendarView from "@/components/CalendarView";
import { getManyContent } from "@/lib/content";
import { getContentDefaultsForSections } from "@/lib/contentRegistry";

export default async function CalendarPage() {
  const content = await getManyContent(
    getContentDefaultsForSections(["calendar.page", "calendar.component"])
  );
  const copy = {
    prev: content["calendar.component.prev"],
    next: content["calendar.component.next"],
    legendAvailable: content["calendar.component.legendAvailable"],
    legendPartial: content["calendar.component.legendPartial"],
    legendFull: content["calendar.component.legendFull"],
    legendToday: content["calendar.component.legendToday"],
    loading: content["calendar.component.loading"],
    halfMorning: content["calendar.component.halfMorning"],
    halfAfternoon: content["calendar.component.halfAfternoon"],
    statusFull: content["calendar.component.statusFull"],
    statusFree: content["calendar.component.statusFree"],
    statusPartial: content["calendar.component.statusPartial"],
  };
  return (
    <div className="mx-auto max-w-6xl px-6 pb-24 pt-16">
      <div className="mb-10 space-y-4">
        <span className="tag">{content["calendar.page.tag"]}</span>
        <h1 className="text-4xl font-semibold text-[color:var(--foreground)]">{content["calendar.page.title"]}</h1>
        <p className="max-w-xl text-sm text-[color:var(--foreground)]/65">
          {content["calendar.page.description"]}
        </p>
      </div>
      <CalendarView copy={copy} />
    </div>
  );
}

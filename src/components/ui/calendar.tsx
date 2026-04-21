import * as React from "react"
import {
  DayPicker,
  getDefaultClassNames,
  type DayButton,
  type Locale,
} from "react-day-picker"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.js"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from "lucide-react"

const CALENDAR_LEGEND = [
    {  label: "Phẫu thuật", color: "#22d3ee" }, // Xanh cyan
    {  label: "Tư vấn", color: "#fbbf24" },      // Vàng
    { label: "Xét nghiệm",   color: "#F75C5C" },   // đỏ    – có xét nghiệm

]

export type CalendarEvent = {
    id: string      // dùng làm key cho modifier (ví dụ: 'xetNghiem')
    label: string   // chữ hiển thị ở legend
    color: string   // màu sắc của border/chấm
    dates: Date[]   // mảng các ngày thuộc loại này
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  locale,
  formatters,
  components,
  events = [],
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
  events?: CalendarEvent[]
}) {
  const defaultClassNames = getDefaultClassNames()
    const isSameDay = (date1: Date, date2: Date) => {
        return (
            date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
        )
    }

    // Tự động tạo object modifiers từ prop events
    const customModifiers = React.useMemo(() => {
        const mods: Record<string, (date: Date) => boolean> = {}
        events.forEach((event) => {
            mods[event.id] = (date) => event.dates.some((d) => isSameDay(d, date))
        })
        return mods
    }, [events])



  return (
      <div className="bg-background rounded-xl pb-2 flex flex-col w-fit border-[2px] border-[#f5f5f5]">
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "group/calendar p-2 [--cell-radius:var(--radius-md)] [--cell-size:--spacing(7)] in-data-[slot=card-content]:bg-transparent in-data-[slot=popover-content]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      modifiers={customModifiers}
      captionLayout={captionLayout}
      locale={locale}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString(locale?.code, { month: "short" }),
        formatWeekdayName: (day) => {
            const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]
            return days[day.getDay()]
          },
        ...formatters,
      }}
      classNames={{
        root: cn("w-full", defaultClassNames.root),
        months: cn(
          "relative flex flex-col gap-4 md:flex-row",
          defaultClassNames.months
        ),
        month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "cursor-pointer size-7 xl:size-9 p-0 select-none aria-disabled:opacity-50 rounded-full border-2 border-[#e3e3e3]",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "cursor-pointer size-7 xl:size-9 p-0 select-none aria-disabled:opacity-50 rounded-full border-2 border-[#e3e3e3]",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "flex h-(--cell-size) w-full items-center justify-center gap-0.5 text-sm font-medium",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "relative rounded-(--cell-radius) [&>select]:hidden",
          // defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "hidden pointer-events-none",
          // defaultClassNames.dropdown
        ),
        caption_label: cn(
          "font-medium select-none",
          captionLayout === "label"
            ? "text-sm"
            : "flex items-center gap-1 rounded-(--cell-radius) text-sm [&>svg]:size-3.5 [&>svg]:text-muted-foreground",
          defaultClassNames.caption_label
        ),
        table: "w-full border-separate border-spacing-y-2 border-spacing-x-1",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "flex-1 rounded-(--cell-radius) text-[0.8rem] font-semibold text-muted-foreground select-none",
          defaultClassNames.weekday
        ),
        week: cn("mt-2 flex w-full", defaultClassNames.week),
        week_number_header: cn(
          "w-(--cell-size) select-none",
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          "text-[0.8rem] text-muted-foreground select-none",
          defaultClassNames.week_number
        ),
        day: cn(
            "group/day relative aspect-square h-full w-full p-0 text-center select-none flex items-center justify-center",
            defaultClassNames.day
        ),
        range_start: cn(
          "relative isolate z-0 rounded-l-(--cell-radius) bg-muted after:absolute after:inset-y-0 after:right-0 after:w-4 after:bg-muted",
          defaultClassNames.range_start
        ),
        range_middle: cn("rounded-none", defaultClassNames.range_middle),
        range_end: cn(
          "relative isolate z-0 rounded-r-(--cell-radius) bg-muted after:absolute after:inset-y-0 after:left-0 after:w-4 after:bg-muted",
          defaultClassNames.range_end
        ),
        today: cn(
            "text-foreground",
            defaultClassNames.today
        ),
        outside: cn(
          "text-muted-foreground aria-selected:text-muted-foreground",
          defaultClassNames.outside
        ),
        disabled: cn(
          "text-muted-foreground opacity-50",
          defaultClassNames.disabled
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          )
        },
        Dropdown: ({ value, onChange, options }) => {

          const handleChange = (newValue: string) => {

            // Tạo một native select element giả để dispatch event
            const nativeSelect = document.createElement("select")
            Object.defineProperty(nativeSelect, "value", { get: () => newValue })
            onChange?.({ target: nativeSelect } as React.ChangeEvent<HTMLSelectElement>)
          }

          const selected = options?.find((o) => o.value === value)

          return (
              <Select value={value?.toString()} onValueChange={handleChange}>
                <SelectTrigger className="h-7 z-50 w-fit gap-1 border-none bg-transparent px-1 py-0 text-[1rem] font-extrabold shadow-none focus:ring-0 focus:ring-offset-0 [&>svg]:hidden cursor-pointer focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
                >
                  <SelectValue>{selected?.label}</SelectValue>
                </SelectTrigger>
                <SelectContent position="popper" className="min-w-[var(--radix-select-trigger-width)]">
                  <ScrollArea className="h-60">
                    {options?.map((option) => (
                        <SelectItem
                            key={option.value}
                            value={option.value.toString()}
                            className="text-sm cursor-pointer"
                        >
                          {option.label}
                        </SelectItem>
                    ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
          )
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon className={cn("size-4", className)} {...props} />
            )
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon className={cn("size-4", className)} {...props} />
            )
          }

          return (
            <ChevronDownIcon className={cn("size-4", className)} {...props} />
          )
        },
        DayButton: ({ ...props }) => (
          <CalendarDayButton locale={locale} {...props} events={events} />
        ),
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center">
                {children}
              </div>
            </td>
          )
        },
        ...components,
      }}
      {...props}
    />
          <div className="flex flex-wrap items-center justify-center gap-x-4 px-2 pb-1 min-w-[250px] xl:min-w-[300px]">
              {events.map((event) => (
                  <span key={event.id} className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <span
                className="inline-block size-2 rounded-full"
                style={{ backgroundColor: event.color }}
            />
                      {event.label}
          </span>
              ))}
          </div>
      </div>
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  locale,
  events,
  ...props
}: React.ComponentProps<typeof DayButton> & { locale?: Partial<Locale>, events: CalendarEvent[]  }) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  const activeEvents = events.filter(event => modifiers[event.id]);

  const dayKey = `${day.date.getFullYear()}-${day.date.getMonth()}-${day.date.getDate()}`;

  const gradientSegments = activeEvents.length > 0 && !modifiers.selected
      ? activeEvents.map((e, i) => {
        const p = 100 / activeEvents.length;
        return `${e.color} ${i * p}% ${(i + 1) * p}%`;
      }).join(", ")
      : null;

  return (
      <>
        {gradientSegments && (
            <style>{`
        [data-day="${dayKey}"] {
          border: 2px solid transparent !important;
          background-image: linear-gradient(white, white), conic-gradient(${gradientSegments}) !important;
          background-origin: border-box !important;
          background-clip: padding-box, border-box !important;
        }
      `}</style>
        )}

        <button
            ref={ref}
            data-day={dayKey}
            data-selected-single={
                modifiers.selected &&
                !modifiers.range_start &&
                !modifiers.range_end &&
                !modifiers.range_middle
            }
            data-range-start={modifiers.range_start}
            data-range-end={modifiers.range_end}
            data-range-middle={modifiers.range_middle}
            className={cn(
                "cursor-pointer text-xs rounded-full relative isolate z-10 flex size-6 lg:size-7 xl:size-8 items-center justify-center flex-col gap-1 leading-none font-semibold",
                "group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] group-data-[focused=true]/day:ring-ring/50",
                "data-[range-end=true]:rounded-(--cell-radius) data-[range-end=true]:rounded-r-(--cell-radius) data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground",
                "data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-muted data-[range-middle=true]:text-foreground",
                "data-[range-start=true]:rounded-(--cell-radius) data-[range-start=true]:rounded-l-(--cell-radius) data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground",
                "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-white",
                "dark:hover:text-foreground [&>span]:text-xs [&>span]:opacity-70",

                !modifiers.selected && activeEvents.length === 0 && "border-2 border-[#e3e3e3]",
                modifiers.selected && activeEvents.length === 0 && "border-none",
                modifiers.today && !modifiers.selected && "bg-muted",
                defaultClassNames.day,
                className
            )}
            {...props}
        />
      </>
  )
}

export { Calendar, CalendarDayButton }

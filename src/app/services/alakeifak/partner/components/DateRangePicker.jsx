"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Calendar, Clock, ChevronRight, ChevronLeft, X, ChevronDown, 
  History, CalendarDays, MousePointer2, Sun, CalendarMinus, 
  CalendarRange, Globe
} from "lucide-react";

const ARABIC_MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
];
const ARABIC_DAYS_SHORT = ["ح", "ن", "ث", "ر", "خ", "ج", "س"];

export default function DateRangePicker({ value, onChange, themeColor = "#f97316" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState("preset"); 
  const [viewDate, setViewDate] = useState(new Date());
  const [rangeStep, setRangeStep] = useState("from"); 
  const [selectedDay, setSelectedDay] = useState(null);
  const [fromHour, setFromHour] = useState(0);
  const [toHour, setToHour] = useState(23);
  const [rangeFrom, setRangeFrom] = useState(null);
  const [rangeTo, setRangeTo] = useState(null);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Safely handle hour slider overlaps without causing UI layout shifts
  const handleFromHourChange = (val) => {
    setFromHour(val);
    if (val > toHour) setToHour(val);
  };

  const handleToHourChange = (val) => {
    setToHour(val);
    if (val < fromHour) setFromHour(val);
  };

  const apply = (from, to) => {
    onChange({ from, to });
    setIsOpen(false);
  };

  const applyPreset = (id) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    switch (id) {
      case "today":
        apply(today, endOfDay); break;
      case "yesterday": {
        const y = new Date(today); y.setDate(y.getDate() - 1);
        const ye = new Date(y); ye.setHours(23, 59, 59, 999);
        apply(y, ye); break;
      }
      case "this_week": {
        const dow = today.getDay();
        const wStart = new Date(today); wStart.setDate(today.getDate() - dow);
        apply(wStart, endOfDay); break;
      }
      case "last_week": {
        const dow = today.getDay();
        const lwe = new Date(today); lwe.setDate(today.getDate() - dow - 1);
        const lws = new Date(lwe); lws.setDate(lwe.getDate() - 6); lws.setHours(0, 0, 0, 0);
        lwe.setHours(23, 59, 59, 999);
        apply(lws, lwe); break;
      }
      case "this_month": {
        const ms = new Date(now.getFullYear(), now.getMonth(), 1);
        apply(ms, endOfDay); break;
      }
      case "all":
        apply(null, null); break;
    }
  };

  const applyDay = () => {
    if (!selectedDay) return;
    const from = new Date(selectedDay);
    from.setHours(fromHour, 0, 0, 0);
    const to = new Date(selectedDay);
    to.setHours(toHour, 59, 59, 999);
    apply(from, to);
  };

  const applyRange = () => {
    if (!rangeFrom) return;
    const from = new Date(rangeFrom);
    from.setHours(0, 0, 0, 0);
    const to = rangeTo ? new Date(rangeTo) : new Date(rangeFrom);
    to.setHours(23, 59, 59, 999);
    apply(from, to);
  };

  const handleDayClick = (date) => {
    if (mode === "day") {
      setSelectedDay(new Date(date));
    } else {
      if (rangeStep === "from") {
        setRangeFrom(new Date(date));
        setRangeTo(null);
        setRangeStep("to");
      } else {
        if (date < rangeFrom) {
          setRangeTo(rangeFrom);
          setRangeFrom(new Date(date));
        } else {
          setRangeTo(new Date(date));
        }
        setRangeStep("from");
      }
    }
  };

  const isSameDay = (a, b) => a && b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const isInRange = (d) => {
    if (!rangeFrom || !rangeTo) return false;
    return d > rangeFrom && d < rangeTo;
  };

  const formatLabel = () => {
    if (!value?.from) return "كل الأوقات (عرض الكل)";
    const fmt = (d) => d.toLocaleDateString("ar-EG", { day: "numeric", month: "short" });
    const fmtH = (d) => d.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
    if (!value.to) return "كل الأوقات";
    if (isSameDay(value.from, value.to)) {
      return `${fmt(value.from)} · ${fmtH(value.from)} ← ${fmtH(value.to)}`;
    }
    return `${fmt(value.from)} ← ${fmt(value.to)}`;
  };

  const PRESETS = [
    { id: "today", label: "اليوم", icon: Sun, desc: "بيانات اليوم الحالي" },
    { id: "yesterday", label: "أمس", icon: CalendarMinus, desc: "إحصائيات اليوم السابق" },
    { id: "this_week", label: "هذا الأسبوع", icon: CalendarRange, desc: "منذ بداية الأسبوع" },
    { id: "last_week", label: "الأسبوع الماضي", icon: History, desc: "الأسبوع المنصرم كاملاً" },
    { id: "this_month", label: "هذا الشهر", icon: CalendarDays, desc: "أداء الشهر الحالي" },
    { id: "all", label: "كل الأوقات", icon: Globe, desc: "كافة البيانات المسجلة" },
  ];

  const Modal = (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
      dir="rtl"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="w-full max-w-[500px] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Mobile friendly pull-indicator */}
        <div className="w-full flex justify-center pt-3 pb-1 sm:hidden bg-white">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
        </div>

        <div className="shrink-0 p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl flex items-center justify-center bg-slate-50 text-slate-700 border border-slate-100">
              <Calendar size={20} strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">تحديد الفترة الزمنية</h3>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">اختر نطاق البيانات المطلوب عرضها</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all active:scale-95 flex items-center justify-center"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="shrink-0 p-1.5 bg-slate-100/80 flex gap-1 mx-4 sm:mx-6 mt-4 sm:mt-6 rounded-2xl border border-slate-200/60">
          {[
            { id: "preset", label: "اختصارات", icon: History },
            { id: "day", label: "يوم مخصص", icon: CalendarDays },
            { id: "range", label: "نطاق تواريخ", icon: MousePointer2 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMode(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 rounded-xl text-[13px] sm:text-sm font-bold transition-all duration-200 ${
                mode === tab.id
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              }`}
            >
              <tab.icon size={16} strokeWidth={mode === tab.id ? 2.5 : 2} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {mode === "preset" && (
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => applyPreset(p.id)}
                  className="group flex flex-col items-start text-right p-3 sm:p-4 rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 transition-all active:scale-[0.98]"
                >
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 mb-2 sm:mb-3 group-hover:scale-110 group-hover:text-slate-900 transition-all duration-300">
                    <p.icon size={18} strokeWidth={2} />
                  </div>
                  <span className="text-[13px] sm:text-sm font-bold text-slate-900">{p.label}</span>
                  <span className="text-[11px] sm:text-xs font-medium text-slate-500 mt-1">{p.desc}</span>
                </button>
              ))}
            </div>
          )}

          {mode === "day" && (
            <div className="space-y-4 sm:space-y-6">
              <CalendarGrid
                viewDate={viewDate}
                setViewDate={setViewDate}
                onDayClick={handleDayClick}
                selectedDay={selectedDay}
                mode="day"
                themeColor={themeColor}
                isSameDay={isSameDay}
              />
              <div className="rounded-2xl bg-slate-50 p-4 sm:p-5 border border-slate-100 space-y-4 sm:space-y-5">
                <div className="flex items-center gap-2 text-slate-800">
                  <Clock size={18} strokeWidth={2} />
                  <span className="text-sm font-bold">تحديد الساعات (الوردية)</span>
                </div>
                <HourSlider label="بداية الوردية" value={fromHour} onChange={handleFromHourChange} themeColor={themeColor} />
                <HourSlider label="نهاية الوردية" value={toHour} onChange={handleToHourChange} themeColor={themeColor} />
                <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-slate-200 shadow-sm">
                  <span className="text-xs font-semibold text-slate-500">الفترة المحددة</span>
                  <span className="text-sm font-bold text-slate-900" dir="ltr">
                    {formatHour(fromHour)} — {formatHour(toHour)}
                  </span>
                </div>
              </div>
              <button
                disabled={!selectedDay}
                onClick={applyDay}
                className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                style={{ backgroundColor: themeColor }}
              >
                تطبيق الوردية
              </button>
            </div>
          )}

          {mode === "range" && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
                <div className={`flex-1 py-2.5 sm:py-3 px-4 rounded-xl text-center text-xs sm:text-sm font-bold transition-all ${rangeStep === "from" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>
                   {rangeFrom ? rangeFrom.toLocaleDateString("ar-EG", { day: "numeric", month: "short" }) : "من تاريخ"}
                </div>
                <div className={`flex-1 py-2.5 sm:py-3 px-4 rounded-xl text-center text-xs sm:text-sm font-bold transition-all ${rangeStep === "to" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>
                   {rangeTo ? rangeTo.toLocaleDateString("ar-EG", { day: "numeric", month: "short" }) : "إلى تاريخ"}
                </div>
              </div>
              <CalendarGrid
                viewDate={viewDate}
                setViewDate={setViewDate}
                onDayClick={handleDayClick}
                selectedDay={null}
                rangeFrom={rangeFrom}
                rangeTo={rangeTo}
                mode="range"
                themeColor={themeColor}
                isSameDay={isSameDay}
                isInRange={isInRange}
              />
              <button
                disabled={!rangeFrom}
                onClick={applyRange}
                className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                style={{ backgroundColor: themeColor }}
              >
                {rangeFrom && rangeTo ? "تطبيق النطاق المختار" : "اختر تاريخ النهاية"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 sm:gap-3 rounded-xl bg-white border border-slate-200 px-3 sm:px-4 py-2 sm:py-2.5 text-[13px] sm:text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98]"
        style={value?.from ? { borderColor: `${themeColor}60` } : {}}
      >
        <Calendar size={16} className="sm:w-[18px] sm:h-[18px]" style={value?.from ? { color: themeColor } : { color: "#64748b" }} />
        <span className="max-w-[140px] sm:max-w-[180px] truncate">{formatLabel()}</span>
        <ChevronDown size={14} className="sm:w-4 sm:h-4 text-slate-400" />
      </button>

      {isOpen && typeof document !== "undefined" && createPortal(Modal, document.body)}
    </>
  );
}

function CalendarGrid({ viewDate, setViewDate, onDayClick, selectedDay, rangeFrom, rangeTo, mode, themeColor, isSameDay, isInRange }) {
  const y = viewDate.getFullYear();
  const m = viewDate.getMonth();
  const totalDays = new Date(y, m + 1, 0).getDate();
  const firstDay = new Date(y, m, 1).getDay();
  const today = new Date();

  const prevMonth = () => setViewDate(new Date(y, m - 1, 1));
  const nextMonth = () => setViewDate(new Date(y, m + 1, 1));

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(new Date(y, m, d));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <button onClick={nextMonth} className="h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center rounded-lg bg-slate-50 hover:bg-slate-100 transition-all active:scale-95 border border-slate-200">
          <ChevronRight size={18} className="text-slate-600" />
        </button>
        <span className="text-[15px] sm:text-base font-bold text-slate-900">
          {ARABIC_MONTHS[m]} {y}
        </span>
        <button onClick={prevMonth} className="h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center rounded-lg bg-slate-50 hover:bg-slate-100 transition-all active:scale-95 border border-slate-200">
          <ChevronLeft size={18} className="text-slate-600" />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-2 sm:mb-3 text-center">
        {ARABIC_DAYS_SHORT.map((d, i) => (
          <div key={i} className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1 sm:gap-y-2">
        {cells.map((date, i) => {
          if (!date) return <div key={`e-${i}`} />;
          
          const isSelectedDay = mode === "day" && isSameDay(date, selectedDay);
          const isRangeStart = mode === "range" && isSameDay(date, rangeFrom);
          const isRangeEnd = mode === "range" && isSameDay(date, rangeTo);
          const isSelected = isSelectedDay || isRangeStart || isRangeEnd;
          const inRange = mode === "range" && isInRange(date);
          const isFuture = date > today;

          // Compute responsive Range Background Wrapper logic
          let wrapperClass = "relative flex h-9 sm:h-10 w-full items-center justify-center";
          let wrapperStyle = {};

          if (mode === "range" && rangeFrom && rangeTo) {
            if (isRangeStart || isRangeEnd || inRange) {
              // Appends '20' to the hex color for a 12% opacity tint background
              wrapperStyle = { backgroundColor: `${themeColor}20` };
              
              if (isRangeStart && isRangeEnd) {
                 wrapperClass += " rounded-xl";
              } else if (isRangeStart) {
                 wrapperClass += " rounded-r-xl rounded-l-none";
              } else if (isRangeEnd) {
                 wrapperClass += " rounded-l-xl rounded-r-none";
              } else if (inRange) {
                 wrapperClass += " rounded-none";
              }
            }
          }

          return (
            <div key={date.toISOString()} className={wrapperClass} style={wrapperStyle}>
              <button
                onClick={() => !isFuture && onDayClick(date)}
                disabled={isFuture}
                className={`relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl text-[13px] sm:text-sm font-bold transition-all duration-200
                  ${isFuture ? "opacity-30 cursor-not-allowed" : "hover:scale-105 active:scale-95"}
                  ${isSelected ? "text-white shadow-md z-10" : "text-slate-700 hover:bg-slate-100"}
                  ${isSameDay(date, today) && !isSelected ? "border-2 border-slate-200" : ""}
                `}
                style={isSelected ? { backgroundColor: themeColor } : {}}
              >
                {date.getDate()}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HourSlider({ label, value, onChange, themeColor }) {
  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] sm:text-xs font-semibold text-slate-500">{label}</span>
        <span className="text-[13px] sm:text-sm font-bold text-slate-900 bg-white px-2 py-1 rounded-md border border-slate-200 shadow-sm">
          {formatHour(value)}
        </span>
      </div>
      <div className="relative">
        {/* We enforce min 0 and max 23 here so the UI thumb never shifts unexpectedly */}
        <input
          type="range" min={0} max={23} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1.5 sm:h-2 appearance-none rounded-full outline-none cursor-pointer bg-slate-200 transition-all hover:bg-slate-300"
          style={{ accentColor: themeColor }}
        />
        <div className="flex justify-between mt-1.5 sm:mt-2 px-1">
          {[0, 6, 12, 18, 23].map((h) => (
            <span key={h} className="text-[9px] sm:text-[10px] font-bold text-slate-400">{h}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatHour(h) {
  const period = h < 12 ? "ص" : "م";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:00 ${period}`;
}
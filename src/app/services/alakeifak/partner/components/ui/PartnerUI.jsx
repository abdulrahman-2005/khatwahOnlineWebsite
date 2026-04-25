import { Loader2, LayoutGrid } from "lucide-react";

export const InputField = ({ label, ...props }) => (
  <div className="space-y-2 w-full">
    {label && <label className="text-[13px] sm:text-[14px] font-bold text-gray-500 px-1">{label}</label>}
    <input
      {...props}
      className={`w-full rounded-[20px] sm:rounded-[24px] border border-gray-200 bg-white px-4 sm:px-5 py-3 sm:py-4 text-[15px] sm:text-[16px] font-bold text-gray-900 outline-none transition-all placeholder:text-gray-300 focus:border-[var(--dynamic-color)] focus:ring-[4px] focus:ring-[var(--dynamic-color)]/10 shadow-sm ${props.className || ""}`}
    />
  </div>
);

export const PrimaryBtn = ({ icon: Icon, children, ...props }) => (
  <button
    {...props}
    className={`flex items-center justify-center gap-2.5 rounded-[20px] sm:rounded-[24px] bg-[var(--dynamic-color)] px-6 sm:px-7 py-3.5 sm:py-4 text-[15px] sm:text-[16px] font-black text-white transition-all shadow-[0_10px_20px_-5px_var(--dynamic-color)] hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 ${props.className || ""}`}
  >
    {Icon && <Icon className="w-[18px] h-[18px] sm:w-5 sm:h-5" strokeWidth={2.5} />}
    {children}
  </button>
);

export const IconButton = ({ icon: Icon, colorClass, borderClass, ...props }) => (
  <button
    {...props}
    className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-[14px] sm:rounded-[18px] transition-all active:scale-90 ${borderClass || "bg-gray-50 hover:bg-gray-100 border border-gray-200"} ${colorClass || "text-gray-500 hover:text-gray-900"} ${props.className || ""}`}
  >
    <Icon size={18} strokeWidth={2.5} />
  </button>
);

export const NeoRow = ({ children }) => (
  <div className="flex items-center justify-between gap-4 rounded-[24px] sm:rounded-[28px] border border-gray-100 bg-white p-4 sm:p-5 shadow-sm transition-all hover:shadow-md">
    {children}
  </div>
);

export function LoadingSpinner() {
  return (
    <div className="flex justify-center py-24">
      <div className="relative flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-[var(--dynamic-color)]" />
        <div className="absolute inset-0 rounded-full blur-[20px] opacity-20" style={{ backgroundColor: "var(--dynamic-color)" }} />
      </div>
    </div>
  );
}

export function EmptyState({ text, icon: Icon = LayoutGrid }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[36px] border border-dashed border-gray-200 bg-white py-24 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-[28px] bg-gray-50 shadow-sm border border-gray-100">
        <Icon size={40} className="text-gray-300" strokeWidth={1.5} />
      </div>
      <p className="text-[17px] font-black text-gray-400 tracking-wide">{text}</p>
    </div>
  );
}

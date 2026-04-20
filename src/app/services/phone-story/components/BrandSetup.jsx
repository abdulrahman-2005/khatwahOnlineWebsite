"use client";

export default function BrandSetup({
  brandName,
  setBrandName,
  brandLogo,
  setBrandLogo,
  primaryColor,
  setPrimaryColor,
  secondaryColor,
  setSecondaryColor
}) {
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBrandLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div 
      className="rounded-xl border p-6"
      style={{ 
        borderColor: "var(--color-border)",
        backgroundColor: "var(--color-background)"
      }}
    >
      <h2 
        className="mb-4 text-xl font-bold" 
        style={{ color: "var(--color-text)" }}
      >
        Brand Setup
      </h2>
      
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Brand Name */}
        <div>
          <label 
            className="mb-2 block text-sm font-bold"
            style={{ color: "var(--color-text)" }}
          >
            Brand Name
          </label>
          <input
            type="text"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="e.g., PrimePhone"
            className="w-full rounded-lg border px-4 py-2"
            style={{
              borderColor: "var(--color-border)",
              backgroundColor: "var(--color-surface)",
              color: "var(--color-text)"
            }}
          />
        </div>

        {/* Brand Logo */}
        <div>
          <label 
            className="mb-2 block text-sm font-bold"
            style={{ color: "var(--color-text)" }}
          >
            Brand Logo
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="w-full rounded-lg border px-4 py-2 text-sm"
            style={{
              borderColor: "var(--color-border)",
              backgroundColor: "var(--color-surface)",
              color: "var(--color-text)"
            }}
          />
        </div>

        {/* Primary Color */}
        <div>
          <label 
            className="mb-2 block text-sm font-bold"
            style={{ color: "var(--color-text)" }}
          >
            Primary Color
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="h-10 w-16 cursor-pointer rounded-lg border"
              style={{ borderColor: "var(--color-border)" }}
            />
            <input
              type="text"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="flex-1 rounded-lg border px-4 py-2 text-sm"
              style={{
                borderColor: "var(--color-border)",
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text)"
              }}
            />
          </div>
        </div>

        {/* Secondary Color */}
        <div>
          <label 
            className="mb-2 block text-sm font-bold"
            style={{ color: "var(--color-text)" }}
          >
            Secondary Color
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={secondaryColor}
              onChange={(e) => setSecondaryColor(e.target.value)}
              className="h-10 w-16 cursor-pointer rounded-lg border"
              style={{ borderColor: "var(--color-border)" }}
            />
            <input
              type="text"
              value={secondaryColor}
              onChange={(e) => setSecondaryColor(e.target.value)}
              className="flex-1 rounded-lg border px-4 py-2 text-sm"
              style={{
                borderColor: "var(--color-border)",
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text)"
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

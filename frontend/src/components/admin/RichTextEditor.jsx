import React from "react";

const RichTextEditor = ({ value, onChange, label, placeholder, ...rest }) => {
  return (
    <div className="form-group">
      <label className="form-label mb-2 font-semibold text-sm block text-primary">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows="6"
        // --- STYLING FIX: Use input-luxury class from theme.css ---
        className="input-luxury w-full"
        placeholder={placeholder}
        {...rest}
      />
      <p className="text-xs text-muted mt-1">
        This is a plain text area. A production app would use a rich text
        editor.
      </p>
    </div>
  );
};

export default RichTextEditor;

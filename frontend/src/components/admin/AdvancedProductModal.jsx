import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  X,
  UploadCloud,
  Trash2,
  Palette,
  Ruler,
  Info,
  Tag,
  Package as PackageIcon,
  BarChart2,
  Image as ImageIcon,
  Type,
  LayoutGrid,
  DollarSign,
  Eye,
  EyeOff,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import RichTextEditor from "./RichTextEditor";
import toast from "react-hot-toast";
import LoadingSpinner from "../UI/LoadingSpinner";

// --- Slugify Function ---
const slugify = (text) => {
  if (!text) return `product-${Date.now()}`;
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// --- Mock Data/Helpers (Using placeholder structure for robustness) ---
const MOCK_CATEGORIES = [
  {
    _id: "1",
    name: "Women",
    slug: "women",
    subcategories: ["Dresses", "Tops", "Skirts"],
  },
  {
    _id: "2",
    name: "Men",
    slug: "men",
    subcategories: ["Shirts", "Pants", "Jackets"],
  },
  {
    _id: "3",
    name: "Accessories",
    slug: "accessories",
    subcategories: ["Bags", "Jewelry", "Watches"],
  },
];
const AVAILABLE_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "One Size"];
const PREDEFINED_COLORS = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Red", hex: "#FF0000" },
  { name: "Navy", hex: "#000080" },
  { name: "Beige", hex: "#F5F5DC" },
  { name: "Gold", hex: "#BFA76F" },
];
// --- Generate Unique ID Helper ---
const generateUniqueId = (prefix = "id") =>
  `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;

// --- Helper Components ---
const FormLabel = ({ htmlFor, children, icon: Icon, className = "" }) => (
  <label
    htmlFor={htmlFor}
    className={`form-label flex items-center gap-1.5 ${className}`}
  >
    {" "}
    {Icon && (
      <Icon size={14} className="text-muted dark:text-dark-muted" />
    )}{" "}
    <span>{children}</span>{" "}
  </label>
);
const FormError = ({ children }) => <p className="form-error">{children}</p>;

const AdvancedProductModal = ({
  isOpen,
  onClose,
  productToEdit,
  onSubmit,
  isSaving,
  categories = MOCK_CATEGORIES, // Use actual categories if provided
}) => {
  const isEditing = !!productToEdit;

  // Helper to safely access product properties
  const safeAccess = (path, defaultValue = undefined) => {
    let current = productToEdit;
    if (!current) return defaultValue;
    const parts = path.split(".");
    for (const part of parts) {
      if (current === undefined || current === null) return defaultValue;
      current = current[part];
    }
    return current !== undefined ? current : defaultValue;
  };

  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: useMemo(() => {
      const stockQuantity = safeAccess("inventory.quantity", 0);

      return {
        name: safeAccess("name", ""),
        description: safeAccess("description", ""),
        category: safeAccess("category._id", safeAccess("category", "")),
        subcategory: safeAccess("subcategory", ""),
        price: safeAccess("price", 0),
        discount: safeAccess("discount", 0),
        stock: stockQuantity, // Mapped from inventory.quantity
        isAvailable: safeAccess("isAvailable", stockQuantity > 0),
        colors: safeAccess("colors", []),
        sizes: safeAccess("sizes", []),
        images:
          safeAccess("images", [])?.map((img, index) => ({
            url: img.url,
            isNew: false,
            file: null,
            // We map public_id to publicId here for consistency
            publicId: img.public_id || generateUniqueId(`existing-${index}`),
          })) || [],
        status: safeAccess("status", "draft"),
        showQuantityLeft: safeAccess("showQuantityLeft", true),
        slug: safeAccess("slug", ""),
      };
    }, [productToEdit]),
  });

  const [customColorInput, setCustomColorInput] = useState("");
  const [price, discount, categoryId, productName] = watch([
    "price",
    "discount",
    "category",
    "name",
  ]);
  const currentImages = watch("images"); // Watch images for UI updates

  const finalPrice = useMemo(() => {
    const p = parseFloat(price) || 0;
    const d = parseFloat(discount) || 0;
    if (p <= 0) return (0).toFixed(2);
    if (d < 0 || d >= 100) return p.toFixed(2);
    return (p - p * (d / 100)).toFixed(2);
  }, [price, discount]);

  const primaryCategories = useMemo(
    () => categories.filter((c) => !c.parent),
    [categories]
  );

  const subCategories = useMemo(
    () => categories.filter((sub) => sub.parent?._id === categoryId),
    [categoryId, categories]
  );

  useEffect(() => {
    if (isOpen) {
      const defaultFormValues = {
        name: "",
        description: "",
        category: categories.find((c) => !c.parent)?._id || "",
        subcategory: "",
        price: 0,
        discount: 0,
        stock: 0,
        isAvailable: true,
        colors: [],
        sizes: [],
        images: [],
        status: "draft",
        showQuantityLeft: false,
        slug: "",
      };
      if (isEditing && productToEdit) {
        const stockQuantity = safeAccess("inventory.quantity", 0);

        reset({
          ...defaultFormValues,
          name: safeAccess("name", ""),
          description: safeAccess("description", ""),
          category: safeAccess("category._id", ""),
          subcategory: safeAccess("subcategory", ""),
          price: safeAccess("price", 0),
          discount: safeAccess("discount", 0),
          stock: stockQuantity,
          isAvailable: safeAccess("isAvailable", stockQuantity > 0),
          colors: safeAccess("colors", []),
          sizes: safeAccess("sizes", []),
          // Reset maps public_id to publicId
          images:
            safeAccess("images", [])?.map((img, index) => ({
              url: img.url,
              isNew: false,
              file: null,
              publicId: img.public_id || generateUniqueId(`existing-${index}`),
            })) || [],
          status: safeAccess("status", "draft"),
          showQuantityLeft: safeAccess("showQuantityLeft", true),
          slug: safeAccess("slug", ""),
        });
      } else {
        reset(defaultFormValues);
      }
    }
  }, [productToEdit, isEditing, isOpen, reset, categories]);

  const handleColorToggle = (colorName) => {
    const c = getValues("colors") || [];
    const s = c.includes(colorName);
    setValue(
      "colors",
      s ? c.filter((x) => x !== colorName) : [...c, colorName],
      { shouldDirty: true }
    );
  };
  const handleAddCustomColor = () => {
    const n = customColorInput.trim();
    const c = getValues("colors") || [];
    if (n && !c.includes(n)) {
      setValue("colors", [...c, n], { shouldDirty: true });
      setCustomColorInput("");
    } else if (c.includes(n)) toast.error(`"${n}" is already added.`);
    else toast.error("Enter a color name or hex value.");
  };

  // --- Image Upload ---
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const currentImagesValue = getValues("images") || [];
    const maxUploads = 5 - currentImagesValue.length;
    const filesToProcess = files.slice(0, maxUploads);

    if (filesToProcess.length === 0) {
      if (files.length > 0) toast.error("Max 5 images allowed.");
      e.target.value = null;
      return;
    }

    const newImagesToAdd = filesToProcess
      .map((file) => {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} exceeds 5MB limit.`);
          return null;
        }
        const uniqueId = generateUniqueId("new");
        return {
          url: URL.createObjectURL(file), // This creates the 'blob:' URL
          file: file,
          isNew: true,
          publicId: uniqueId,
        };
      })
      .filter(Boolean);

    if (newImagesToAdd.length > 0) {
      const updatedImages = [...currentImagesValue, ...newImagesToAdd];
      setValue("images", updatedImages, { shouldDirty: true });
    }

    e.target.value = null;
  };

  // --- Image Deletion ---
  const removeImage = (publicIdToRemove) => {
    const currentImagesValue = getValues("images") || [];
    const imageToRemove = currentImagesValue.find(
      (img) => img.publicId === publicIdToRemove
    );

    if (!imageToRemove) {
      toast.error("Error removing image. Please try again.");
      return;
    }

    const updatedImages = currentImagesValue.filter(
      (img) => img.publicId !== publicIdToRemove
    );

    setValue("images", updatedImages, { shouldDirty: true });

    if (imageToRemove.url && imageToRemove.url.startsWith("blob:")) {
      URL.revokeObjectURL(imageToRemove.url);
    }
  };

  const handleModalSubmit = (data) => {
    const slug =
      data.slug?.trim() || slugify(data.name || `product-${Date.now()}`);

    // 1. Prepare image data for submission
    const imagesForSubmission = (data.images || [])
      .filter((i) => i && i.url)
      .map((i) => ({
        url: i.url,
        public_id: i.publicId,
        file: i.isNew ? i.file : undefined,
        isNew: i.isNew,
      }));

    // 2. Separate new files from the rest (for the POST /images endpoint)
    const newImageFiles = imagesForSubmission
      .filter((img) => img.isNew)
      .map((img) => img.file);

    // 3. Create the final data object to send
    const final = {
      ...data,
      price: parseFloat(data.price) || 0,
      discount: parseFloat(data.discount) || 0,
      inventory: {
        quantity: parseInt(data.stock, 10) || 0,
        trackQuantity: true,
      },
      finalPrice: parseFloat(finalPrice) || 0,
      isAvailable: data.isAvailable,
      slug: slug,
      newImageFiles: newImageFiles, // Pass new files to the save handler
      _id: productToEdit?._id,
      category: data.category,
    };

    // Clean up unnecessary top-level properties before submission
    delete final.stock;
    delete final.images; // <-- THIS IS THE FIX. Stops 'blob:' URLs from being sent.

    onSubmit(final);
  };

  const onError = (formErrors) => {
    console.error("Form Errors:", formErrors);
    const k = Object.keys(formErrors)[0];
    let m = "Please fix the form errors.";
    if (k && formErrors[k]?.message) m = formErrors[k].message;
    else if (k) m = `Invalid input for ${k}.`;
    toast.error(m);
    if (k) {
      const element =
        document.getElementById(k) || document.querySelector(`[name="${k}"]`);
      if (element) {
        element.focus({ preventScroll: true });
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        console.warn(`Could not find element for error field: ${k}`);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[rgba(var(--bg),0.7)] dark:bg-[rgba(var(--dark-bg),0.85)] backdrop-blur-lg"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="bg-card dark:bg-card w-full max-w-5xl max-h-[90vh] flex flex-col relative shadow-xl dark:shadow-2xl dark:shadow-black/40 border border-border dark:border-dark-border/50 rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-card dark:bg-card px-5 md:px-6 py-4 border-b border-border dark:border-dark-border/50 z-10 flex justify-between items-center rounded-t-xl">
          <h2 className="text-xl lg:text-2xl font-display font-semibold text-primary dark:text-dark-primary">
            {" "}
            {isEditing ? "Edit Product" : "Add New Product"}{" "}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-muted dark:text-dark-muted hover:bg-accent/10 dark:hover:bg-dark-accent/10 hover:text-accent dark:hover:text-dark-accent transition-colors focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-dark-accent focus:ring-offset-2 focus:ring-offset-card dark:focus:ring-offset-card"
            aria-label="Close modal"
          >
            {" "}
            <X size={20} />{" "}
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit(handleModalSubmit, onError)}
          className="flex-grow overflow-y-auto p-5 md:p-8 space-y-8"
        >
          {/* Product Details Section */}
          <div className="p-6 bg-surface dark:bg-dark-surface rounded-lg border border-border dark:border-dark-border/50 shadow-sm">
            <h3 className="text-lg font-semibold text-primary dark:text-dark-primary mb-5 border-b border-border dark:border-dark-border/50 pb-3 flex items-center gap-2 text-accent dark:text-dark-accent">
              {" "}
              <Info size={18} /> Product Information{" "}
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Name, Desc, Slug */}
              <div className="lg:col-span-2 space-y-5">
                <div>
                  {" "}
                  <FormLabel htmlFor="name" icon={Type}>
                    {" "}
                    Product Name <span className="text-red-500">*</span>{" "}
                  </FormLabel>{" "}
                  <input
                    type="text"
                    id="name"
                    {...register("name", {
                      required: "Product name is required",
                    })}
                    className={`input ${errors.name ? "!border-red-500" : ""}`}
                    placeholder="e.g., Silk Maxi Dress"
                  />{" "}
                  {errors.name && <FormError>{errors.name.message}</FormError>}{" "}
                </div>
                <div>
                  {" "}
                  <FormLabel icon={Type}>
                    {" "}
                    Description <span className="text-red-500">*</span>{" "}
                  </FormLabel>{" "}
                  <Controller
                    name="description"
                    control={control}
                    rules={{ required: "Description is required" }}
                    render={({ field }) => (
                      <RichTextEditor
                        placeholder="Enter detailed product description..."
                        value={field.value}
                        onChange={field.onChange}
                        className={`min-h-[120px] ${
                          errors.description ? "!border-red-500" : ""
                        }`}
                      />
                    )}
                  />{" "}
                  {errors.description && (
                    <FormError>{errors.description.message}</FormError>
                  )}{" "}
                </div>
                <div>
                  {" "}
                  <FormLabel htmlFor="slug" icon={Tag}>
                    {" "}
                    Product Slug{" "}
                  </FormLabel>{" "}
                  <input
                    type="text"
                    id="slug"
                    {...register("slug")}
                    className="input bg-highlight/30 dark:bg-dark-highlight/20"
                    placeholder={slugify(productName) || "auto-generated-slug"}
                    readOnly={isEditing}
                    title={
                      isEditing ? "Slug cannot be changed after creation" : ""
                    }
                  />{" "}
                  <p className="text-xs text-muted dark:text-dark-muted/80 mt-1">
                    {" "}
                    {isEditing
                      ? "Slug cannot be changed."
                      : "Leave empty to auto-generate."}{" "}
                  </p>{" "}
                </div>
              </div>
              {/* Category, Stock, Status */}
              <div className="lg:col-span-1 space-y-5">
                <div className="p-4 bg-highlight/30 dark:bg-dark-highlight/20 rounded-lg border border-border dark:border-dark-border/50">
                  {" "}
                  <FormLabel htmlFor="category" icon={LayoutGrid}>
                    {" "}
                    Category <span className="text-red-500">*</span>{" "}
                  </FormLabel>{" "}
                  <select
                    id="category"
                    {...register("category", { required: "Category required" })}
                    className={`input ${
                      errors.category ? "!border-red-500" : ""
                    }`}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='rgb(var(--muted))' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: "right 0.5rem center",
                      backgroundSize: "1.5em 1.5em",
                      appearance: "none",
                    }}
                  >
                    {" "}
                    <option value="">Select...</option>{" "}
                    {categories
                      .filter((c) => !c.parent)
                      .map((c) => (
                        <option key={c._id} value={c._id}>
                          {" "}
                          {c.name}{" "}
                        </option>
                      ))}{" "}
                  </select>{" "}
                  {errors.category && (
                    <FormError>{errors.category.message}</FormError>
                  )}{" "}
                  {subCategories.length > 0 && (
                    <div className="mt-4">
                      {" "}
                      <FormLabel htmlFor="subcategory">
                        Subcategory
                      </FormLabel>{" "}
                      <select
                        id="subcategory"
                        {...register("subcategory")}
                        className="input"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='rgb(var(--muted))' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: "right 0.5rem center",
                          backgroundSize: "1.5em 1.5em",
                          appearance: "none",
                        }}
                      >
                        {" "}
                        <option value="">Select (Optional)...</option>{" "}
                        {subCategories.map((s) => (
                          <option
                            key={s._id} // FIX: Use subcategory ID as key
                            value={s._id}
                          >
                            {" "}
                            {s.name}{" "}
                          </option>
                        ))}{" "}
                      </select>{" "}
                    </div>
                  )}{" "}
                </div>
                <div className="p-4 bg-highlight/30 dark:bg-dark-highlight/20 rounded-lg border border-border dark:border-dark-border/50 space-y-4">
                  {" "}
                  <h4 className="text-sm font-semibold text-accent dark:text-dark-accent border-b border-border dark:border-dark-border/50 pb-2 mb-3 flex items-center gap-1.5">
                    {" "}
                    <PackageIcon size={16} /> Inventory & Status{" "}
                  </h4>{" "}
                  <div>
                    {" "}
                    <FormLabel htmlFor="stock">
                      {" "}
                      Stock Quantity <span className="text-red-500">
                        *
                      </span>{" "}
                    </FormLabel>{" "}
                    <input
                      type="number"
                      id="stock"
                      min="0"
                      {...register("stock", {
                        required: "Stock required",
                        min: { value: 0, message: ">= 0" },
                      })}
                      className={`input ${
                        errors.stock ? "!border-red-500" : ""
                      }`}
                      placeholder="0"
                    />{" "}
                    {errors.stock && (
                      <FormError>{errors.stock.message}</FormError>
                    )}{" "}
                  </div>{" "}
                  <div className="flex items-center justify-between pt-1">
                    {" "}
                    <FormLabel
                      htmlFor="isAvailable"
                      className="mb-0 flex items-center gap-1.5"
                    >
                      {" "}
                      Available to Sell{" "}
                    </FormLabel>{" "}
                    <Controller
                      name="isAvailable"
                      control={control}
                      render={({ field }) => (
                        <button
                          type="button"
                          role="switch"
                          aria-checked={field.value}
                          onClick={() => field.onChange(!field.value)}
                          className={`${
                            field.value
                              ? "bg-accent dark:bg-dark-accent"
                              : "bg-gray-200 dark:bg-dark-muted/70"
                          } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-dark-accent focus:ring-offset-2 focus:ring-offset-highlight dark:focus:ring-offset-dark-highlight`}
                        >
                          {" "}
                          <span className="sr-only">
                            Available to Sell
                          </span>{" "}
                          <span
                            aria-hidden="true"
                            className={`${
                              field.value ? "translate-x-5" : "translate-x-0"
                            } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                          />{" "}
                        </button>
                      )}
                    />{" "}
                  </div>{" "}
                  <label
                    htmlFor="showQuantityLeft"
                    className="flex items-center space-x-2 cursor-pointer pt-1"
                  >
                    {" "}
                    <Controller
                      name="showQuantityLeft"
                      control={control}
                      render={({ field }) => (
                        <input
                          type="checkbox"
                          id="showQuantityLeft"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="h-4 w-4 rounded border-border dark:border-dark-border text-accent dark:text-dark-accent focus:ring-accent dark:focus:ring-dark-accent bg-card dark:bg-dark-surface cursor-pointer focus:ring-offset-0"
                        />
                      )}
                    />{" "}
                    <span className="text-xs text-muted dark:text-dark-muted flex items-center gap-1">
                      {" "}
                      {watch("showQuantityLeft") ? (
                        <Eye size={12} />
                      ) : (
                        <EyeOff size={12} />
                      )}{" "}
                      Show "Quantity Left"{" "}
                    </span>{" "}
                  </label>{" "}
                  <div className="pt-3 border-t border-border dark:border-dark-border/50">
                    {" "}
                    <FormLabel htmlFor="status" icon={BarChart2}>
                      {" "}
                      Product Status{" "}
                    </FormLabel>{" "}
                    <select
                      id="status"
                      {...register("status")}
                      className="input"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='rgb(var(--muted))' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: "right 0.5rem center",
                        backgroundSize: "1.5em 1.5em",
                        appearance: "none",
                      }}
                    >
                      {" "}
                      <option value="draft">Draft (Hidden)</option>{" "}
                      <option value="active">Published (Live)</option>{" "}
                      <option value="archived">Archived</option>{" "}
                    </select>{" "}
                  </div>{" "}
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="p-6 bg-surface dark:bg-dark-surface rounded-lg border border-border dark:border-dark-border/50 shadow-sm">
            <h3 className="text-lg font-semibold text-primary dark:text-dark-primary mb-5 border-b border-border dark:border-dark-border/50 pb-3 flex items-center gap-2 text-accent dark:text-dark-accent">
              {" "}
              <DollarSign size={18} /> Pricing{" "}
            </h3>{" "}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {" "}
              <div>
                {" "}
                <FormLabel htmlFor="price">
                  {" "}
                  Base Price (₹) <span className="text-red-500">*</span>{" "}
                </FormLabel>{" "}
                <div className="relative flex items-center">
                  {" "}
                  <span className="absolute left-3 text-sm text-muted dark:text-dark-muted pointer-events-none z-10">
                    {" "}
                    ₹{" "}
                  </span>{" "}
                  <input
                    type="number"
                    id="price"
                    step="0.01"
                    {...register("price", {
                      required: "Price required",
                      min: { value: 0.01, message: "> 0" },
                    })}
                    className={`input pl-7 ${
                      errors.price ? "!border-red-500" : ""
                    }`}
                    placeholder="0.00"
                  />{" "}
                </div>{" "}
                {errors.price && <FormError>{errors.price.message}</FormError>}{" "}
              </div>{" "}
              <div>
                {" "}
                <FormLabel htmlFor="discount">Discount (%)</FormLabel>{" "}
                <div className="relative flex items-center">
                  {" "}
                  <input
                    type="number"
                    id="discount"
                    min="0"
                    max="99"
                    {...register("discount", {
                      min: { value: 0, message: "Min 0" },
                      max: { value: 99, message: "Max 99" },
                    })}
                    className={`input pr-8 ${
                      errors.discount ? "!border-red-500" : ""
                    }`}
                    placeholder="0"
                  />{" "}
                  <span className="absolute right-3 text-sm text-muted dark:text-dark-muted pointer-events-none z-10">
                    {" "}
                    %{" "}
                  </span>{" "}
                </div>{" "}
                {errors.discount && (
                  <FormError>{errors.discount.message}</FormError>
                )}{" "}
              </div>{" "}
              <div>
                {" "}
                <FormLabel>Final Price</FormLabel>{" "}
                <div className="mt-1.5 px-3 py-2 h-10 flex items-center rounded-lg border border-border dark:border-dark-border bg-highlight/30 dark:bg-dark-highlight/20">
                  {" "}
                  <span className="font-semibold text-sm text-primary dark:text-dark-primary">
                    {" "}
                    ₹{parseFloat(finalPrice).toLocaleString("en-IN")}{" "}
                  </span>{" "}
                </div>{" "}
              </div>{" "}
            </div>
          </div>

          {/* Variants Section */}
          <div className="p-6 bg-surface dark:bg-dark-surface rounded-lg border border-border dark:border-dark-border/50 shadow-sm space-y-6">
            <h3 className="text-lg font-semibold text-primary dark:text-dark-primary border-b border-border dark:border-dark-border/50 pb-3 mb-4 flex items-center gap-2 text-accent dark:text-dark-accent">
              {" "}
              <Palette size={18} /> Variants & Options{" "}
            </h3>{" "}
            {/* Colors */}{" "}
            <div>
              {" "}
              <FormLabel icon={Palette}>Colors</FormLabel>{" "}
              <Controller
                name="colors"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2.5 mt-2">
                    {" "}
                    {PREDEFINED_COLORS.map((c) => (
                      <ColorChip
                        key={c.name}
                        color={c}
                        selected={field.value?.includes(c.name)}
                        onToggle={handleColorToggle}
                      />
                    ))}{" "}
                    {(getValues("colors") || [])
                      .filter(
                        (c) => !PREDEFINED_COLORS.some((pc) => pc.name === c)
                      )
                      .map((custom) => (
                        <CustomChip
                          key={custom}
                          name={custom}
                          onToggle={handleColorToggle}
                        />
                      ))}{" "}
                  </div>
                )}
              />{" "}
              <div className="mt-3 flex gap-2">
                {" "}
                <input
                  type="text"
                  value={customColorInput}
                  onChange={(e) => setCustomColorInput(e.target.value)}
                  className="input text-sm flex-grow max-w-[240px] !rounded-md h-9"
                  placeholder="Add color name or #hex"
                />{" "}
                <button
                  type="button"
                  onClick={handleAddCustomColor}
                  className="btn btn-outline !text-xs !py-1 !px-3 !rounded-md h-9"
                >
                  {" "}
                  Add{" "}
                </button>{" "}
              </div>{" "}
            </div>{" "}
            {/* Sizes */}{" "}
            <div>
              {" "}
              <FormLabel icon={Ruler}>Sizes</FormLabel>{" "}
              <Controller
                name="sizes"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2.5 mt-2">
                    {" "}
                    {AVAILABLE_SIZES.map((s) => (
                      <SizeChip
                        key={s}
                        size={s}
                        selected={field.value?.includes(s)}
                        onChange={(sel) => {
                          if (sel) field.onChange([...(field.value || []), s]);
                          else
                            field.onChange(
                              (field.value || []).filter((x) => x !== s)
                            );
                        }}
                      />
                    ))}{" "}
                  </div>
                )}
              />{" "}
            </div>
          </div>

          {/* Images Section */}
          <div className="p-6 bg-surface dark:bg-dark-surface rounded-lg border border-border dark:border-dark-border/50 shadow-sm space-y-4">
            <h3 className="text-lg font-semibold text-primary dark:text-dark-primary border-b border-border dark:border-dark-border/50 pb-3 mb-4 flex items-center gap-2 text-accent dark:text-dark-accent">
              <ImageIcon size={18} /> Product Images{" "}
              <span className="text-red-500 ml-1">*</span>
            </h3>
            {/* Render based on watched 'currentImages' state for immediate UI feedback */}
            <AnimatePresence>
              {currentImages && currentImages.length > 0 && (
                <motion.div
                  layout
                  className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3"
                >
                  {currentImages.map((img) => (
                    <motion.div
                      key={img.publicId}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                      }}
                      className="relative group aspect-square rounded-lg overflow-hidden shadow"
                    >
                      <img
                        // --- FIX 2: Check for blob: URL ---
                        // This shows local file previews (blob:) instantly
                        // and cache-busts remote Cloudinary URLs.
                        src={
                          img.url
                            ? img.url.startsWith("blob:")
                              ? img.url // Don't cache-bust blob URLs
                              : `${img.url}?v=${new Date().getTime()}` // Cache-bust Cloudinary URLs
                            : "/images/placeholder.jpg"
                        }
                        // --- END OF FIX 2 ---
                        alt={`Preview ${img.publicId}`}
                        className="w-full h-full object-cover border border-border dark:border-dark-border/50 rounded-lg"
                        onLoad={(e) => {
                          if (
                            img.url.startsWith("blob:") &&
                            e.target.src !== img.url
                          ) {
                            URL.revokeObjectURL(img.url);
                          }
                        }}
                        onError={(e) => {
                          e.target.src =
                            "/images/placeholder.jpg"; /* Fallback */
                        }}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(img.publicId);
                        }}
                        className="absolute top-1 right-1 p-1 bg-red-600/90 text-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 focus:ring-offset-card hover:bg-red-700 z-10"
                        aria-label="Remove image"
                      >
                        <Trash2 size={12} />
                      </button>
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded-lg"></div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Dropzone - Controlled by React Hook Form Controller for validation */}
            <Controller
              name="images"
              control={control}
              rules={{
                validate: (value) =>
                  (Array.isArray(value) && value.length > 0) ||
                  "At least one image is required",
              }}
              render={({ fieldState: { error } }) => (
                <>
                  <label
                    className={`mt-4 flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-200 ${
                      error
                        ? "border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-900/10"
                        : "border-border dark:border-dark-border/80 hover:border-accent dark:hover:border-dark-accent"
                    } bg-highlight/30 dark:bg-dark-highlight/20 hover:bg-highlight/50 dark:hover:bg-dark-highlight/40`}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                      <UploadCloud className="w-8 h-8 mb-2 text-muted dark:text-dark-muted/80" />
                      <p className="mb-1 text-sm text-muted dark:text-dark-muted">
                        <span className="font-semibold text-accent dark:text-dark-accent">
                          {" "}
                          Click to upload{" "}
                        </span>{" "}
                        or drag & drop
                      </p>
                      <p className="text-xs text-muted dark:text-dark-muted/70">
                        {" "}
                        PNG, JPG up to 5MB (Max 5 images){" "}
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                      disabled={isSaving || (currentImages?.length || 0) >= 5}
                    />
                  </label>
                  {error && <FormError>{error.message}</FormError>}
                </>
              )}
            />
          </div>

          {/* Action Buttons */}
          <div className="sticky bottom-0 bg-surface dark:bg-dark-surface p-5 md:p-6 border-t border-border dark:border-dark-border flex justify-end space-x-3 rounded-b-xl -mx-5 md:-mx-8 -mb-6 md:-mb-8 shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.07)] dark:shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.5)]">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline !rounded-lg"
              disabled={isSaving}
            >
              {" "}
              Cancel{" "}
            </button>
            <button
              type="submit"
              className="btn btn-primary !rounded-lg flex items-center min-w-[140px] justify-center"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  {" "}
                  <LoadingSpinner
                    size="small"
                    className="mr-2 !w-4 !h-4 border-white dark:border-white"
                  />{" "}
                  {isEditing ? "Updating..." : "Creating..."}{" "}
                </>
              ) : isEditing ? (
                "Update Product"
              ) : (
                "Create Product"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// --- Helper Components (Unchanged) ---
const ColorChip = ({ color, selected, onToggle }) => (
  <button
    type="button"
    onClick={() => onToggle(color.name)}
    className={`flex items-center space-x-1.5 p-1 pl-1.5 border rounded-full cursor-pointer transition-all duration-150 shadow-sm ${
      selected
        ? "border-accent dark:border-dark-accent bg-accent/10 dark:bg-dark-accent/20 ring-1 ring-accent dark:ring-dark-accent ring-offset-1 ring-offset-surface dark:ring-offset-dark-surface"
        : "border-border dark:border-dark-border bg-surface dark:bg-dark-surface hover:border-gray-400 dark:hover:border-gray-500"
    }`}
  >
    {" "}
    <span
      className="w-5 h-5 rounded-full border border-black/10 dark:border-white/10 shadow-inner"
      style={{ backgroundColor: color.hex }}
      title={color.name}
    />{" "}
    <span className="text-xs font-medium text-primary dark:text-dark-primary pr-2">
      {" "}
      {color.name}{" "}
    </span>{" "}
  </button>
);
const CustomChip = ({ name, onToggle }) => (
  <button
    type="button"
    onClick={() => onToggle(name)}
    className={`flex items-center space-x-1.5 p-1.5 pr-2.5 border rounded-full cursor-pointer transition-all duration-150 shadow-sm border-accent dark:border-dark-accent bg-accent/10 dark:bg-dark-accent/20 ring-1 ring-accent dark:ring-dark-accent ring-offset-1 ring-offset-surface dark:ring-offset-dark-surface`}
  >
    {" "}
    <Palette
      size={14}
      className="text-muted dark:text-dark-muted ml-0.5"
    />{" "}
    <span className="text-xs font-medium text-primary dark:text-dark-primary">
      {" "}
      {name}{" "}
    </span>{" "}
    <X
      size={12}
      className="text-red-500/70 hover:text-red-600 ml-1"
      title="Remove"
    />{" "}
  </button>
);
const SizeChip = ({ size, selected, onChange }) => (
  <label
    className={`flex items-center justify-center min-w-[40px] h-9 px-3 border rounded-lg cursor-pointer transition-all font-medium text-sm shadow-sm ${
      selected
        ? "border-accent dark:border-dark-accent bg-accent text-white dark:bg-dark-accent dark:text-white ring-1 ring-accent dark:ring-dark-accent ring-offset-1 ring-offset-surface dark:ring-offset-dark-surface"
        : "border-border dark:border-dark-border text-muted dark:text-dark-muted bg-surface dark:bg-dark-surface hover:border-gray-400 dark:hover:border-gray-500"
    }`}
  >
    {" "}
    <input
      type="checkbox"
      checked={selected}
      onChange={(e) => onChange(e.target.checked)}
      className="sr-only"
    />{" "}
    {size}{" "}
  </label>
);

export default AdvancedProductModal;

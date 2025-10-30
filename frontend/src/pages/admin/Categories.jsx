import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import {
  Box,
  Typography,
  Button,
  TextField,
  Grid,
  Paper, // Keep Paper for modal
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Plus, Edit, Trash2, X, CornerRightDown } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import toast from "react-hot-toast";

import categoriesAPI from "../../api/categories";
import LoadingSpinner from "../../components/UI/LoadingSpinner";


// ... (imports remain the same)

// --- Main Categories Component ---
const Categories = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery(
    "admin-categories",
    categoriesAPI.getAll,
    { staleTime: 1000 * 60 * 5 }
  );

  const categories = data?.categories || [];

  const deleteMutation = useMutation(categoriesAPI.remove, {
    onSuccess: (data) => {
      queryClient.invalidateQueries("admin-categories");
      toast.success(data.message || "Category deleted successfully!");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to delete category."
      );
    },
  });

  const handleDelete = (id, name) => {
    if (
      window.confirm(
        `Delete ${name}? (Will fail if subcategories/products exist)`
      )
    ) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleCreateSubcategory = (parentCategory) => {
    setSelectedCategory({
      isSubcategoryCreation: true,
      parent: { _id: parentCategory._id, name: parentCategory.name },
    });
    setIsModalOpen(true);
  };

  // --- RENDERING HELPERS ---
  const primaryCategories = categories.filter((c) => !c.parent);

  // Function to Render Subcategories (no changes needed here)
  const renderSubcategories = (parentId) => {
    const subcats = categories.filter((c) => c.parent?._id === parentId);
    if (subcats.length === 0) return null;

    return (
      <Box
        sx={{ mt: 2, pt: 2, borderTop: "1px solid rgba(var(--border), 0.5)" }}
      >
        {subcats.map((subcat) => (
          <Box
            key={subcat._id}
            sx={{
              p: 1.5,
              mb: 1,
              borderRadius: "8px",
              bgcolor: "rgb(var(--highlight))",
              border: "1px solid rgb(var(--border))",
            }}
          >
            <Typography
              fontWeight={600}
              color="rgb(var(--text))"
              sx={{ display: "flex", alignItems: "center" }}
            >
              <CornerRightDown className="w-4 h-4 mr-2 text-accent" />{" "}
              {subcat.name}
            </Typography>
            <Typography
              variant="body2"
              color="rgb(var(--muted))"
              sx={{ mb: 1, mt: 0.5, pl: "24px" }}
            >
              {subcat.description || "No description."}
            </Typography>
            <Box display="flex" justifyContent="flex-end" mt={1}>
              <IconButton
                size="small"
                onClick={() => handleEdit(subcat)}
                sx={{
                  color: "rgb(var(--muted))",
                  "&:hover": { color: "rgb(var(--text))" },
                }}
                aria-label={`Edit ${subcat.name}`}
              >
                <Edit className="w-4 h-4" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => handleDelete(subcat._id, subcat.name)}
                sx={{
                  color: "rgb(var(--muted))",
                  "&:hover": { color: "rgb(var(--error))" },
                  ml: 1,
                }}
                disabled={deleteMutation.isLoading}
                aria-label={`Delete ${subcat.name}`}
              >
                <Trash2 className="w-4 h-4" />
              </IconButton>
            </Box>
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <>
      <Helmet>
        <title>Categories - Luxe Heritage Admin</title>
      </Helmet>

      {isModalOpen && (
        <CategoryForm
          category={selectedCategory}
          categories={categories}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
            flexDirection: { xs: "column", md: "row" },
          }}
        >
          <Typography
            variant="h5"
            className="font-display"
            fontWeight={600}
            color="rgb(var(--text))"
            mb={{ xs: 2, md: 0 }}
          >
            Category Management
          </Typography>
          <Button
            onClick={handleCreate}
            variant="contained"
            startIcon={<Plus className="w-4 h-4" />}
            className="btn-luxury-primary"
            sx={{ "& .MuiButton-startIcon": { m: 0 } }}
          >
            Add New Primary Category
          </Button>
        </Box>

        <div
          className="card-luxury"
          style={{ padding: "24px" }}
        >
          {isLoading && (
            <Box className="flex justify-center items-center py:10">
              <LoadingSpinner />
            </Box>
          )}
          {isError && (
            <Typography color="error" align="center" py={5}>
              Failed to load categories.
            </Typography>
          )}

          {!isLoading && !isError && (
            <Grid container spacing={3} columns={12}> {/* Added columns prop for modern MUI */}
              {primaryCategories.map((cat) => (
                <Grid 
                    key={cat._id}
                    // FIX: Replaced legacy props (item, xs, sm, md, lg) with the 'span' prop via `sx` to match old behavior:
                    // 12/12 = 100% (xs), 6/12 = 50% (sm), 4/12 = 33.3% (md), 3/12 = 25% (lg)
                    xs={12} // Use the new span shorthand
                    sm={6}
                    md={4}
                    lg={3}
                  >
                  <Box
                    className="card-luxury"
                    sx={{
                      p: 2,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      height: "100%",
                      bgcolor: "rgb(var(--surface))",
                    }}
                  >
                    {/* Top Section */}
                    <div>
                      <Typography
                        fontWeight={600}
                        color="rgb(var(--text))"
                        className="font-display"
                        variant="h6"
                      >
                        {cat.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="rgb(var(--muted))"
                        sx={{ mb: 1, mt: 0.5 }}
                      >
                        {cat.description || "No description."}
                      </Typography>
                    </div>

                    {renderSubcategories(cat._id)}

                    {/* Actions Row */}
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mt={2}
                      pt={1}
                      borderTop="1px solid rgba(var(--border), 0.5)"
                    >
                      <Button
                        onClick={() => handleCreateSubcategory(cat)}
                        startIcon={<Plus className="w-4 h-4" />}
                        size="small"
                        sx={{
                          fontSize: "0.75rem",
                          p: 0.5,
                          color: "rgb(var(--accent))",
                          "&:hover": {
                            backgroundColor: "rgba(var(--accent-rgb), 0.1)",
                          },
                        }}
                      >
                        Subcategory
                      </Button>
                      <Box display="flex">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(cat)}
                          sx={{
                            color: "rgb(var(--muted))",
                            "&:hover": { color: "rgb(var(--text))" },
                          }}
                          aria-label={`Edit ${cat.name}`}
                        >
                          <Edit className="w-4 h-4" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(cat._id, cat.name)}
                          disabled={deleteMutation.isLoading}
                          aria-label={`Delete ${cat.name}`}
                          sx={{
                            color: "rgb(var(--muted))",
                            "&:hover": { color: "rgb(var(--error))" },
                            ml: 1,
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              ))}
              {categories.length === 0 && !isLoading && (
                <Grid item xs={12}>
                  <Typography align="center" color="rgb(var(--muted))" py={5}>
                    No categories found.
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </div>
        <Typography
          variant="caption"
          color="rgb(var(--muted))"
          sx={{ mt: 2, display: "block" }}
        >
          *Subcategories are displayed nested under their parent.
        </Typography>
      </motion.div>
    </>
  );
};

export default Categories;
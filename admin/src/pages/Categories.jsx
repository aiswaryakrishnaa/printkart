import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  CircularProgress,
  FormControlLabel,
  Switch,
  Tooltip,
  Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CategoryIcon from '@mui/icons-material/Category';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PrintIcon from '@mui/icons-material/Print';
import api from '../services/api';
import { gsap } from 'gsap';

const CategoryCard = ({ category, onEdit, onDelete }) => (
  <Card
    elevation={0}
    sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: '0 20px 40px -15px rgba(0,0,0,0.1)',
        '& .category-icon-box': {
          transform: 'scale(1.1) rotate(5deg)',
          bgcolor: category.type === 'book' ? 'primary.main' : 'secondary.main',
          color: '#fff'
        }
      },
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 5,
      position: 'relative',
      overflow: 'hidden',
      bgcolor: '#fff'
    }}
  >
    <Box
      sx={{
        height: 6,
        width: '100%',
        bgcolor: category.type === 'book' ? 'primary.main' : 'secondary.main',
        opacity: category.isActive ? 1 : 0.3
      }}
    />
    <CardContent sx={{ p: 3, flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box
          className="category-icon-box"
          sx={{
            p: 1.5,
            borderRadius: 3,
            bgcolor: category.type === 'book' ? 'primary.light' : 'secondary.light',
            color: category.type === 'book' ? 'primary.dark' : 'secondary.dark',
            display: 'flex',
            opacity: category.isActive ? 1 : 0.5,
            transition: 'all 0.3s ease'
          }}
        >
          {category.type === 'book' ? <MenuBookIcon /> : <PrintIcon />}
        </Box>
        <Chip
          label={category.isActive ? 'Active' : 'Inactive'}
          size="small"
          variant={category.isActive ? 'filled' : 'outlined'}
          color={category.isActive ? 'success' : 'default'}
          sx={{ fontWeight: 600, fontSize: '0.7rem' }}
        />
      </Box>

      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, fontFamily: 'Outfit' }}>
        {category.name}
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          mb: 2,
          minHeight: 40,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}
      >
        {category.description || 'No description provided for this category.'}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Chip
          label={category.type === 'book' ? 'Book' : 'Printed Item'}
          size="small"
          sx={{ bgcolor: 'rgba(0,0,0,0.04)', fontWeight: 500 }}
        />
        <Typography variant="caption" color="text.secondary">
          Order: {category.sortOrder}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 'auto', pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Tooltip title="Edit Category">
          <IconButton size="small" onClick={() => onEdit(category)} sx={{ '&:hover': { color: 'primary.main' } }}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete Category">
          <IconButton size="small" color="error" onClick={() => onDelete(category.id)} sx={{ '&:hover': { bgcolor: 'error.lighter' } }}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </CardContent>
  </Card>
);

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'book',
    isActive: true,
    sortOrder: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  const containerRef = useRef(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  // GSAP Animation for cards
  useEffect(() => {
    if (!loading && categories.length > 0 && containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          ".category-card-item",
          {
            opacity: 0,
            y: 50,
            scale: 0.9
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: "back.out(1.2)"
          }
        );
      }, containerRef);
      return () => ctx.revert();
    }
  }, [loading, categories]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/admin/categories');
      if (response.data.success) {
        setCategories(response.data.data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (category = null) => {
    if (category) {
      setIsEdit(true);
      setSelectedId(category.id);
      setFormData({
        name: category.name || '',
        description: category.description || '',
        type: category.type || 'book',
        isActive: category.isActive !== undefined ? category.isActive : true,
        sortOrder: category.sortOrder || 0,
      });
    } else {
      setIsEdit(false);
      setSelectedId(null);
      setFormData({
        name: '',
        description: '',
        type: 'book',
        isActive: true,
        sortOrder: 0,
        sortOrder: categories.length + 1 // Auto-increment sort order
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEdit) {
        await api.put(`/api/admin/categories/${selectedId}`, formData);
      } else {
        await api.post('/api/admin/categories', formData);
      }
      fetchCategories();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving category:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await api.delete(`/api/admin/categories/${id}`);
        fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={40} thickness={4} sx={{ color: 'primary.main' }} />
      </Box>
    );
  }

  return (
    <Box ref={containerRef}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, fontFamily: 'Outfit' }}>
            Categories
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your product catalog structure
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            borderRadius: 3,
            px: 3,
            py: 1,
            boxShadow: '0 8px 16px rgba(99, 102, 241, 0.2)',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 20px rgba(99, 102, 241, 0.3)'
            }
          }}
        >
          Add New Category
        </Button>
      </Box>

      {categories.length === 0 ? (
        <Paper
          sx={{
            p: 8,
            textAlign: 'center',
            borderRadius: 4,
            bgcolor: 'rgba(0,0,0,0.01)',
            border: '2px dashed rgba(0,0,0,0.05)'
          }}
          elevation={0}
        >
          <CategoryIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No categories yet
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
            Create categories to start organizing your books and printed items.
          </Typography>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            Create First Category
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {categories.map((category) => (
            <Grid item xs={12} sm={6} md={4} key={category.id} className="category-card-item">
              <CategoryCard
                category={category}
                onEdit={handleOpenDialog}
                onDelete={handleDelete}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Category Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 4, p: 1 }
        }}
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 700, fontFamily: 'Outfit', pb: 1 }}>
            {isEdit ? 'Edit Category' : 'Add New Category'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
              <TextField
                fullWidth
                label="Category Name"
                placeholder="e.g. Fiction, Educational, Office Supplies"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                placeholder="Briefly describe what this category contains..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Category Type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                  >
                    <MenuItem value="book">Book</MenuItem>
                    <MenuItem value="printed_item">Printed Item</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Display Order"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                    inputProps={{ min: 0 }}
                  />
                </Grid>
              </Grid>
              <Box sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: 'rgba(0,0,0,0.02)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <Box>
                  <Typography variant="subtitle2">Category Visibility</Typography>
                  <Typography variant="caption" color="text.secondary">Inactive categories won't show in the storefront.</Typography>
                </Box>
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  color="primary"
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleCloseDialog} sx={{ color: 'text.secondary' }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{ borderRadius: 2, px: 4 }}
            >
              {submitting ? <CircularProgress size={24} color="inherit" /> : isEdit ? 'Save Changes' : 'Create Category'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

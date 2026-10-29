import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { assets, url } from '../assets/assets.js'
import './List.css'

const categories = [
  'Salad',
  'Rolls',
  'Desserts',
  'Sandwich',
  'Cake',
  'Pure Veg',
  'Pasta',
  'Noodles',
]

const List = () => {
  const [foods, setFoods] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  // Add modal state
  const [showAddModal, setShowAddModal] = useState(false)
  const [addFormData, setAddFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Salad',
  })
  const [addImageFile, setAddImageFile] = useState(null)
  const [addImagePreview, setAddImagePreview] = useState(assets.upload_area)
  const [adding, setAdding] = useState(false)

  // Edit modal state
  const [editTarget, setEditTarget] = useState(null)
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Salad',
  })
  const [editImageFile, setEditImageFile] = useState(null)
  const [editImagePreview, setEditImagePreview] = useState('')
  const [updating, setUpdating] = useState(false)

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fetchFoods = async () => {
    setLoading(true)
    setLoadError('')
    try {
      const { data } = await axios.get(`${url}/api/food/list`)
      if (!data.success || !Array.isArray(data.data)) {
        throw new Error(data.message || 'Invalid food catalog response.')
      }
      setFoods(data.data)
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Could not load food items.'
      setLoadError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let ignore = false

    axios
      .get(`${url}/api/food/list`)
      .then(({ data }) => {
        if (!ignore) {
          if (!data.success || !Array.isArray(data.data)) {
            throw new Error(data.message || 'Invalid food catalog response.')
          }
          setFoods(data.data)
        }
      })
      .catch((err) => {
        if (!ignore) {
          const msg = err.response?.data?.message || err.message || 'Could not load food items.'
          setLoadError(msg)
          toast.error(msg)
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [])

  // Filtered food list
  const filteredFoods = useMemo(() => {
    return foods.filter((food) => {
      const matchesCategory =
        selectedCategory === 'All' || food.category === selectedCategory
      const matchesSearch =
        food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        food.description?.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [foods, searchQuery, selectedCategory])

  // --- Add Food Handler ---
  const handleAddSubmit = async (e) => {
    e.preventDefault()

    if (!addImageFile) {
      toast.error('Please upload a food image.')
      return
    }
    if (!addFormData.name.trim()) {
      toast.error('Please enter the food name.')
      return
    }
    if (!addFormData.description.trim()) {
      toast.error('Please enter a description.')
      return
    }
    const priceNum = Number(addFormData.price)
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error('Please enter a valid price.')
      return
    }

    const token = localStorage.getItem('token')
    if (!token) {
      toast.error('Administrator authentication required.')
      return
    }

    setAdding(true)
    try {
      const data = new FormData()
      data.append('name', addFormData.name.trim())
      data.append('description', addFormData.description.trim())
      data.append('price', priceNum)
      data.append('category', addFormData.category)
      data.append('image', addImageFile)

      const res = await axios.post(`${url}/api/food/add`, data, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.data.success) {
        throw new Error(res.data.message || 'Failed to add food item.')
      }

      toast.success(`${addFormData.name} added successfully!`)
      setShowAddModal(false)
      setAddFormData({ name: '', description: '', price: '', category: 'Salad' })
      setAddImageFile(null)
      setAddImagePreview(assets.upload_area)

      // Refresh list
      fetchFoods()
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to add food.'
      toast.error(msg)
    } finally {
      setAdding(false)
    }
  }

  // --- Edit Food Handler ---
  const openEditModal = (food) => {
    setEditTarget(food)
    setEditFormData({
      name: food.name,
      description: food.description || '',
      price: food.price,
      category: food.category || 'Salad',
    })
    setEditImageFile(null)
    setEditImagePreview(`${url}/images/${food.image}`)
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()

    if (!editFormData.name.trim()) {
      toast.error('Food name cannot be empty.')
      return
    }
    const priceNum = Number(editFormData.price)
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error('Price must be greater than zero.')
      return
    }

    const token = localStorage.getItem('token')
    if (!token) {
      toast.error('Administrator authentication required.')
      return
    }

    setUpdating(true)
    try {
      const data = new FormData()
      data.append('id', editTarget._id)
      data.append('name', editFormData.name.trim())
      data.append('description', editFormData.description.trim())
      data.append('price', priceNum)
      data.append('category', editFormData.category)
      if (editImageFile) {
        data.append('image', editImageFile)
      }

      const res = await axios.patch(`${url}/api/food/update`, data, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.data.success) {
        throw new Error(res.data.message || 'Failed to update food item.')
      }

      const updated = res.data.data
      setFoods((prev) =>
        prev.map((item) => (item._id === updated._id ? updated : item))
      )

      toast.success(`${updated.name} updated successfully!`)
      setEditTarget(null)
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Could not update food item.'
      toast.error(msg)
    } finally {
      setUpdating(false)
    }
  }

  // --- Delete Food Handler ---
  const confirmDelete = async () => {
    if (!deleteTarget) return
    const token = localStorage.getItem('token')
    if (!token) {
      toast.error('Administrator authentication required.')
      return
    }

    setDeleting(true)
    try {
      const res = await axios.delete(`${url}/api/food/remove`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { id: deleteTarget._id },
      })

      if (!res.data.success) {
        throw new Error(res.data.message || 'Could not remove food item.')
      }

      setFoods((prev) => prev.filter((item) => item._id !== deleteTarget._id))
      toast.success(`${deleteTarget.name} removed successfully.`)
      setDeleteTarget(null)
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to delete food item.'
      toast.error(msg)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="list-container">
      {/* Top Header */}
      <div className="list-top-bar">
        <div>
          <h1>Manage Food Items</h1>
          <p className="list-subtitle">View, add, edit, or delete items from the food catalog.</p>
        </div>
        <button
          type="button"
          className="add-new-btn"
          onClick={() => setShowAddModal(true)}
        >
          + Add Food Item
        </button>
      </div>

      {/* Filter and Search */}
      <div className="list-filters-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by food name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
            >
              &times;
            </button>
          )}
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="filter-select"
        >
          <option value="All">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Table Content */}
      {loading ? (
        <div className="list-loading-state">
          <div className="spinner" />
          <p>Loading food catalog from database...</p>
        </div>
      ) : loadError ? (
        <div className="list-error-state" role="alert">
          <p>{loadError}</p>
          <button type="button" onClick={fetchFoods}>Retry</button>
        </div>
      ) : filteredFoods.length === 0 ? (
        <div className="list-empty-state">
          <p>No food items found.</p>
        </div>
      ) : (
        <div className="food-table-container">
          <table className="food-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFoods.map((food) => (
                <tr key={food._id}>
                  <td className="food-thumb-td">
                    <img
                      src={`${url}/images/${food.image}`}
                      alt={food.name}
                      className="food-table-thumbnail"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = '/vite.svg'
                      }}
                    />
                  </td>
                  <td><strong>{food.name}</strong></td>
                  <td><span className="category-pill">{food.category}</span></td>
                  <td className="food-price-td">Rs. {Number(food.price).toLocaleString()}</td>
                  <td className="actions-cell">
                    <div className="action-buttons-wrap">
                      <button
                        type="button"
                        className="edit-food-btn"
                        onClick={() => openEditModal(food)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="delete-food-btn"
                        onClick={() => setDeleteTarget(food)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Food Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-card edit-modal-card">
            <div className="edit-modal-header">
              <h3>Add New Food Item</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowAddModal(false)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="edit-food-form">
              <div className="edit-form-group">
                <label className="field-label">Food Image</label>
                <div className="edit-image-preview-wrap">
                  <img
                    src={addImagePreview}
                    alt="Upload Preview"
                    className="edit-image-preview"
                  />
                  <label className="change-img-label" htmlFor="add-img-input">
                    Choose Image File
                    <input
                      id="add-img-input"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setAddImageFile(file)
                          setAddImagePreview(URL.createObjectURL(file))
                        }
                      }}
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>

              <div className="edit-form-group">
                <label className="field-label" htmlFor="add-name">Food Name</label>
                <input
                  id="add-name"
                  type="text"
                  placeholder="e.g. Garlic Bread"
                  value={addFormData.name}
                  onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
                  required
                />
              </div>

              <div className="edit-form-group">
                <label className="field-label" htmlFor="add-desc">Description</label>
                <textarea
                  id="add-desc"
                  rows="3"
                  placeholder="Write a brief description..."
                  value={addFormData.description}
                  onChange={(e) => setAddFormData({ ...addFormData, description: e.target.value })}
                  required
                />
              </div>

              <div className="edit-form-row">
                <div className="edit-form-group">
                  <label className="field-label" htmlFor="add-cat">Category</label>
                  <select
                    id="add-cat"
                    value={addFormData.category}
                    onChange={(e) => setAddFormData({ ...addFormData, category: e.target.value })}
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="edit-form-group">
                  <label className="field-label" htmlFor="add-price">Price (Rs.)</label>
                  <input
                    id="add-price"
                    type="number"
                    min="1"
                    placeholder="200"
                    value={addFormData.price}
                    onChange={(e) => setAddFormData({ ...addFormData, price: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowAddModal(false)}
                  disabled={adding}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-confirm-save"
                  disabled={adding}
                >
                  {adding ? 'Saving...' : 'Add Food'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Food Modal */}
      {editTarget && (
        <div className="modal-backdrop">
          <div className="modal-card edit-modal-card">
            <div className="edit-modal-header">
              <h3>Edit Food Item</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setEditTarget(null)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="edit-food-form">
              <div className="edit-form-group">
                <label className="field-label">Food Image (Optional change)</label>
                <div className="edit-image-preview-wrap">
                  <img
                    src={editImagePreview}
                    alt="Preview"
                    className="edit-image-preview"
                  />
                  <label className="change-img-label" htmlFor="edit-img-input">
                    Change Image
                    <input
                      id="edit-img-input"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setEditImageFile(file)
                          setEditImagePreview(URL.createObjectURL(file))
                        }
                      }}
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>

              <div className="edit-form-group">
                <label className="field-label" htmlFor="edit-name">Food Name</label>
                <input
                  id="edit-name"
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  required
                />
              </div>

              <div className="edit-form-group">
                <label className="field-label" htmlFor="edit-desc">Description</label>
                <textarea
                  id="edit-desc"
                  rows="3"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  required
                />
              </div>

              <div className="edit-form-row">
                <div className="edit-form-group">
                  <label className="field-label" htmlFor="edit-cat">Category</label>
                  <select
                    id="edit-cat"
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="edit-form-group">
                  <label className="field-label" htmlFor="edit-price">Price (Rs.)</label>
                  <input
                    id="edit-price"
                    type="number"
                    min="1"
                    value={editFormData.price}
                    onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setEditTarget(null)}
                  disabled={updating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-confirm-save"
                  disabled={updating}
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3>Confirm Deletion</h3>
            <p>
              Are you sure you want to delete <strong>{deleteTarget.name}</strong> from MongoDB?
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-confirm-delete"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default List

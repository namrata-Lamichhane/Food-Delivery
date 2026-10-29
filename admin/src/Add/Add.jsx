import { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { assets, url } from '../assets/assets.js'
import './Add.css'

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

const Add = ({ onSuccess }) => {
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(assets.upload_area)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Salad',
  })

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview !== assets.upload_area) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file (PNG, JPG, WebP).')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB.')
      return
    }

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!imageFile) {
      toast.error('Please upload a food image.')
      return
    }

    if (!formData.name.trim()) {
      toast.error('Please enter the food item name.')
      return
    }

    if (!formData.description.trim()) {
      toast.error('Please write a food description.')
      return
    }

    const priceNum = Number(formData.price)
    if (!formData.price || isNaN(priceNum) || priceNum <= 0) {
      toast.error('Please enter a valid price greater than zero.')
      return
    }

    const token = localStorage.getItem('token')
    if (!token) {
      toast.error('You must be logged in as an administrator.')
      return
    }

    setSubmitting(true)
    try {
      const data = new FormData()
      data.append('name', formData.name.trim())
      data.append('description', formData.description.trim())
      data.append('price', priceNum)
      data.append('category', formData.category)
      data.append('image', imageFile)

      const response = await axios.post(`${url}/api/food/add`, data, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to add food item.')
      }

      toast.success(`${formData.name} added to the menu successfully!`)

      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        category: 'Salad',
      })
      setImageFile(null)
      setImagePreview(assets.upload_area)

      if (onSuccess) onSuccess()
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Could not add food item.'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="add-container">
      <div className="add-card">
        <div className="add-header">
          <h1>Add New Food Item</h1>
          <p>Fill in the product details to add a new dish to your restaurant catalog.</p>
        </div>

        <form className="add-form" onSubmit={handleSubmit} noValidate>
          {/* Image Upload Area */}
          <div className="add-form-group">
            <span className="field-label">Food Image Upload</span>
            <label className="image-dropzone" htmlFor="food-image-input">
              <input
                id="food-image-input"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="sr-only"
              />
              <div className="dropzone-content">
                <img
                  src={imagePreview}
                  alt="Food preview"
                  className={imageFile ? 'preview-active' : 'preview-placeholder'}
                />
                <div className="dropzone-hint">
                  <span className="dropzone-action">
                    {imageFile ? 'Click to change image' : 'Click or drop food image here'}
                  </span>
                  <span className="dropzone-format">PNG, JPG, WebP up to 5MB</span>
                </div>
              </div>
            </label>
          </div>

          {/* Food Name */}
          <div className="add-form-group">
            <label htmlFor="food-name" className="field-label">Food Item Name</label>
            <input
              id="food-name"
              name="name"
              type="text"
              placeholder="e.g. Greek Salad with Feta"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Description */}
          <div className="add-form-group">
            <label htmlFor="food-desc" className="field-label">Description</label>
            <textarea
              id="food-desc"
              name="description"
              rows="4"
              placeholder="Provide a delicious description, ingredients, or taste notes..."
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          {/* Category & Price */}
          <div className="add-form-row">
            <div className="add-form-group">
              <label htmlFor="food-category" className="field-label">Category</label>
              <select
                id="food-category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="add-form-group">
              <label htmlFor="food-price" className="field-label">Price (Rs.)</label>
              <div className="price-input-wrap">
                <span className="price-prefix">Rs.</span>
                <input
                  id="food-price"
                  name="price"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="250"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <button type="submit" className="add-submit-btn" disabled={submitting}>
            {submitting ? (
              <span className="spinner-btn-wrap">
                <span className="add-spinner" /> Saving to Database...
              </span>
            ) : (
              'Save & Add to Menu'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Add


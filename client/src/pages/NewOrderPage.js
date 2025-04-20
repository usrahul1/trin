"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import Layout from "../components/Layout"
import { productsApi, ordersApi } from "../services/api"
import { useAuth } from "../contexts/AuthContext"
import { toast } from "react-toastify"

export default function NewOrderPage() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  const [cart, setCart] = useState({})
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [orderId, setOrderId] = useState(null)

  const [formData, setFormData] = useState({
    buyer_name: currentUser?.displayName || "",
    buyer_contact: "",
    delivery_address: "",
    delivery_date: "",
    notes: "",
  })

  const [formErrors, setFormErrors] = useState({})

  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        if (Object.keys(parsedCart).length === 0) {
          setError("Your cart is empty. Please add products to your order.")
        }
        setCart(parsedCart)
      } catch (e) {
        console.error("Error parsing cart from localStorage:", e)
        setError("Error loading your cart. Please try again.")
      }
    } else {
      setError("Your cart is empty. Please add products to your order.")
    }

    async function fetchProducts() {
      try {
        const response = await productsApi.getAll()
        setProducts(response.data)
        setLoading(false)
      } catch (err) {
        setError("Failed to fetch products. Please try again later.")
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null,
      })
    }
  }

  const validateForm = async () => {
    const errors = {}

    if (!formData.buyer_name.trim()) {
      errors.buyer_name = "Name is required"
    }

    if (!formData.buyer_contact.trim()) {
      errors.buyer_contact = "Contact information is required"
    }

    if (!formData.delivery_address.trim()) {
      errors.delivery_address = "Delivery address is required"
    }

    if (!formData.delivery_date) {
      errors.delivery_date = "Delivery date is required"
    }

    if (Object.keys(cart).length === 0) {
      errors.cart = "Your cart is empty"
    }

    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setSubmitting(true)

    try {
      const items = Object.entries(cart).map(([productId, quantity]) => {
        const product = getProductById(productId)
        return {
          product_id: Number.parseInt(productId),
          product_name: product ? product.name : "Unknown Product",
          quantity,
          price: product ? product.price : 0,
        }
      })

      const orderData = {
        ...formData,
        user_id: currentUser?.uid || null,
        user_email: currentUser?.email || null,
        items,
      }

      console.log("Submitting orderData:", orderData)


      const response = await ordersApi.create(orderData)
      console.log(response)

      setOrderId(response.data.id)
      setSuccess(true)

      localStorage.removeItem("cart")
      setCart({})

      toast.success("Order placed successfully!")
    } catch (err) {
      setError("Failed to place order. Please try again.")
      toast.error("Failed to place order")

    } finally {
      setSubmitting(false)
    }
  }

  const getProductById = (id) => {
    return products.find((product) => product.id === Number.parseInt(id))
  }

  const calculateTotal = () => {
    return Object.entries(cart).reduce((total, [productId, quantity]) => {
      const product = getProductById(productId)
      return total + (product ? product.price * quantity : 0)
    }, 0)
  }

  const getTotalItems = () => {
    return Object.values(cart).reduce((total, quantity) => total + quantity, 0)
  }

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mt-6 flex justify-center">
              <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm text-primary-600">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Loading...
              </div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (success) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg max-w-2xl mx-auto">
            <div className="px-4 py-5 sm:px-6 text-center">
              <svg
                className="mx-auto h-12 w-12 text-green-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <h3 className="mt-2 text-xl leading-6 font-medium text-gray-900">Order Placed Successfully!</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Your order has been received and is being processed.
              </p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
              <dl className="sm:divide-y sm:divide-gray-200">
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Order ID</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-bold">{orderId}</dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
            <div className="px-4 py-5 sm:px-6 flex justify-center space-x-4">
              <Link
                to="/orders/track"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Track Order
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout cartItemCount={getTotalItems()}>
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto lg:max-w-none">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-8">Complete Your Order</h2>

            {error && (
              <div className="rounded-md bg-red-50 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
              <div>
                <form onSubmit={handleSubmit}>
                  <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="grid grid-cols-6 gap-6">
                        <div className="col-span-6">
                          <label htmlFor="buyer_name" className="block text-sm font-medium text-gray-700">
                            Full Name
                          </label>
                          <input
                            type="text"
                            name="buyer_name"
                            id="buyer_name"
                            value={formData.buyer_name}
                            onChange={handleInputChange}
                            className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          />
                          {formErrors.buyer_name && (
                            <p className="mt-2 text-sm text-red-600">{formErrors.buyer_name}</p>
                          )}
                        </div>

                        <div className="col-span-6">
                          <label htmlFor="buyer_contact" className="block text-sm font-medium text-gray-700">
                            Contact Number
                          </label>
                          <input
                            type="text"
                            name="buyer_contact"
                            id="buyer_contact"
                            value={formData.buyer_contact}
                            onChange={handleInputChange}
                            className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          />
                          {formErrors.buyer_contact && (
                            <p className="mt-2 text-sm text-red-600">{formErrors.buyer_contact}</p>
                          )}
                        </div>

                        <div className="col-span-6">
                          <label htmlFor="delivery_address" className="block text-sm font-medium text-gray-700">
                            Delivery Address
                          </label>
                          <textarea
                            id="delivery_address"
                            name="delivery_address"
                            rows="3"
                            value={formData.delivery_address}
                            onChange={handleInputChange}
                            className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          ></textarea>
                          {formErrors.delivery_address && (
                            <p className="mt-2 text-sm text-red-600">{formErrors.delivery_address}</p>
                          )}
                        </div>

                        <div className="col-span-6">
                          <label htmlFor="delivery_date" className="block text-sm font-medium text-gray-700">
                            Preferred Delivery Date
                          </label>
                          <input
                            type="date"
                            name="delivery_date"
                            id="delivery_date"
                            value={formData.delivery_date}
                            onChange={handleInputChange}
                            min={new Date().toISOString().split("T")[0]}
                            className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          />
                          {formErrors.delivery_date && (
                            <p className="mt-2 text-sm text-red-600">{formErrors.delivery_date}</p>
                          )}
                        </div>

                        <div className="col-span-6">
                          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                            Additional Notes (Optional)
                          </label>
                          <textarea
                            id="notes"
                            name="notes"
                            rows="2"
                            value={formData.notes}
                            onChange={handleInputChange}
                            className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          ></textarea>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 flex justify-between">
                      <Link
                        to="/products"
                        className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        Back to Products
                      </Link>
                      <button
                        type="submit"
                        disabled={submitting || Object.keys(cart).length === 0}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                      >
                        {submitting ? "Placing Order..." : "Place Order"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              <div className="mt-10 lg:mt-0">
                <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>

                {formErrors.cart && <p className="mt-2 text-sm text-red-600">{formErrors.cart}</p>}

                <div className="mt-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                  <h3 className="sr-only">Items in your cart</h3>
                  <ul className="divide-y divide-gray-200">
                    {Object.keys(cart).length === 0 ? (
                      <li className="flex py-6 px-4 sm:px-6">
                        <p className="text-sm text-gray-500">Your cart is empty</p>
                      </li>
                    ) : (
                      Object.entries(cart).map(([productId, quantity]) => {
                        const product = getProductById(productId)
                        if (!product) return null

                        return (
                          <li key={productId} className="flex py-6 px-4 sm:px-6">
                            <div className="flex-shrink-0">
                              {product.image_url ? (
                                <img
                                  src={product.image_url || "/placeholder.svg"}
                                  alt={product.name}
                                  className="w-20 h-20 rounded-md object-center object-cover"
                                />
                              ) : (
                                <div className="w-20 h-20 rounded-md bg-gray-200 flex items-center justify-center text-gray-400">
                                  No Image
                                </div>
                              )}
                            </div>

                            <div className="ml-6 flex-1 flex flex-col">
                              <div className="flex">
                                <div className="min-w-0 flex-1">
                                  <h4 className="text-sm">
                                    <span className="font-medium text-gray-700 hover:text-gray-800">
                                      {product.name}
                                    </span>
                                  </h4>
                                  <p className="mt-1 text-sm text-gray-500">${product.price} per kg</p>
                                </div>
                              </div>

                              <div className="flex-1 pt-2 flex items-end justify-between">
                                <p className="mt-1 text-sm font-medium text-gray-900">
                                  ${(product.price * quantity).toFixed(2)}
                                </p>

                                <div className="ml-4">
                                  <label htmlFor={`quantity-${productId}`} className="sr-only">
                                    Quantity, {quantity}
                                  </label>
                                  <span className="text-gray-500">{quantity} kg</span>
                                </div>
                              </div>
                            </div>
                          </li>
                        )
                      })
                    )}
                  </ul>
                  <dl className="border-t border-gray-200 py-6 px-4 space-y-6 sm:px-6">
                    <div className="flex items-center justify-between">
                      <dt className="text-sm">Subtotal</dt>
                      <dd className="text-sm font-medium text-gray-900">${calculateTotal().toFixed(2)}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-sm">Delivery Fee</dt>
                      <dd className="text-sm font-medium text-gray-900">$10.00</dd>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                      <dt className="text-base font-medium">Total</dt>
                      <dd className="text-base font-medium text-gray-900">${(calculateTotal() + 10).toFixed(2)}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

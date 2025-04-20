"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import Layout from "../components/Layout"
import { ordersApi } from "../services/api"
import { toast } from "react-toastify"

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("")
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!orderId.trim()) {
      setError("Please enter an order ID")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await ordersApi.getById(orderId)
      setOrder(response.data)
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError("Order not found. Please check the ID and try again.")
      } else {
        setError("Failed to fetch order details. Please try again.")
      }
      toast.error("Failed to find order")
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "shipped":
        return "bg-indigo-100 text-indigo-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-8">Track Your Order</h1>

            <div className="bg-white shadow overflow-hidden sm:rounded-md mb-8">
              <div className="px-4 py-5 sm:p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="orderId" className="block text-sm font-medium text-gray-700">
                      Enter your Order ID
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="text"
                        name="orderId"
                        id="orderId"
                        className="focus:ring-primary-500 focus:border-primary-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300"
                        placeholder="e.g. 12345"
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                      />
                      <button
                        type="submit"
                        disabled={loading}
                        className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                      >
                        {loading ? "Tracking..." : "Track"}
                      </button>
                    </div>
                    {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                  </div>
                </form>
              </div>
            </div>

            {order && (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Order #{order.id}</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">Placed on {formatDate(order.created_at)}</p>
                  </div>
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                      order.status,
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>
                <div className="border-t border-gray-200">
                  <dl>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Shipping Address</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {order.buyer_name}
                        <br />
                        {order.delivery_address}
                      </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Contact Information</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{order.buyer_contact}</dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Delivery Date</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {formatDate(order.delivery_date)}
                      </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Order Items</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                          {order.items.map((item, index) => (
                            <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                              <div className="w-0 flex-1 flex items-center">
                                <span className="ml-2 flex-1 w-0 truncate">
                                  {item.product_name} - {item.quantity} kg
                                </span>
                              </div>
                              <div className="ml-4 flex-shrink-0">
                                <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Total</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span>
                            ${order.items.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between mt-2">
                          <span>Delivery Fee</span>
                          <span>$10.00</span>
                        </div>
                        <div className="flex justify-between mt-2 pt-2 border-t border-gray-200 font-medium">
                          <span>Total</span>
                          <span>
                            $
                            {(order.items.reduce((total, item) => total + item.price * item.quantity, 0) + 10).toFixed(
                              2,
                            )}
                          </span>
                        </div>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}

            <div className="mt-8 text-center">
              <Link to="/" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

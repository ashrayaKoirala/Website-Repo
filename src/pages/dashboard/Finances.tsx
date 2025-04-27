"use client"

import { motion } from "framer-motion"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { CreditCard, DollarSign, Receipt, TrendingUp } from "lucide-react"

const Finances = () => {
  // Mock data for financial charts
  const revenueData = [
    { name: "Jan", revenue: 4500, expenses: 2100 },
    { name: "Feb", revenue: 5200, expenses: 2300 },
    { name: "Mar", revenue: 4800, expenses: 2200 },
    { name: "Apr", revenue: 6000, expenses: 2500 },
    { name: "May", revenue: 5500, expenses: 2400 },
    { name: "Jun", revenue: 6500, expenses: 2700 },
    { name: "Jul", revenue: 7000, expenses: 2900 },
  ]

  const incomeSourcesData = [
    { name: "AdSense", value: 3500 },
    { name: "Memberships", value: 2800 },
    { name: "Sponsors", value: 4200 },
    { name: "Merch", value: 1500 },
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-3xl font-bold font-mono mb-1">Financial Overview</h1>
        <p className="text-gray-600 mb-6">Track your revenue, expenses, and financial growth.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue & Expenses */}
        <motion.div
          variants={item}
          className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-black opacity-[0.02] pointer-events-none" />
          <h2 className="text-xl font-semibold font-mono mb-4 flex items-center">
            <TrendingUp size={20} className="mr-2" />
            Revenue & Expenses
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e0e0e0",
                    borderRadius: "4px",
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#000" strokeWidth={2} dot={{ fill: "#000" }} />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#777"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: "#777" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Income Sources */}
        <motion.div
          variants={item}
          className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-black opacity-[0.02] pointer-events-none" />
          <h2 className="text-xl font-semibold font-mono mb-4 flex items-center">
            <DollarSign size={20} className="mr-2" />
            Income Sources
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeSourcesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e0e0e0",
                    borderRadius: "4px",
                  }}
                />
                <Bar dataKey="value" fill="#000" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Upcoming Payments */}
        <motion.div
          variants={item}
          className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-black opacity-[0.02] pointer-events-none" />
          <h2 className="text-xl font-semibold font-mono mb-4 flex items-center">
            <CreditCard size={20} className="mr-2" />
            Upcoming Payments
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 border-b border-gray-100">
              <div>
                <p className="font-medium">Adobe Subscription</p>
                <p className="text-sm text-gray-500">Monthly recurring</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">$52.99</p>
                <p className="text-sm text-gray-500">Due in 3 days</p>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 border-b border-gray-100">
              <div>
                <p className="font-medium">Web Hosting</p>
                <p className="text-sm text-gray-500">Annual billing</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">$120.00</p>
                <p className="text-sm text-gray-500">Due in 15 days</p>
              </div>
            </div>
            <div className="flex justify-between items-center p-3">
              <div>
                <p className="font-medium">Equipment Lease</p>
                <p className="text-sm text-gray-500">Monthly</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">$299.99</p>
                <p className="text-sm text-gray-500">Due in 21 days</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          variants={item}
          className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-black opacity-[0.02] pointer-events-none" />
          <h2 className="text-xl font-semibold font-mono mb-4 flex items-center">
            <Receipt size={20} className="mr-2" />
            Recent Transactions
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center mr-3">
                  <DollarSign size={16} className="text-white" />
                </div>
                <div>
                  <p className="font-medium">Brand Partnership</p>
                  <p className="text-sm text-gray-500">Income</p>
                </div>
              </div>
              <p className="font-semibold text-green-600">+$2,500.00</p>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center mr-3">
                  <CreditCard size={16} className="text-white" />
                </div>
                <div>
                  <p className="font-medium">Software Subscription</p>
                  <p className="text-sm text-gray-500">Expense</p>
                </div>
              </div>
              <p className="font-semibold text-red-600">-$89.99</p>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center mr-3">
                  <DollarSign size={16} className="text-white" />
                </div>
                <div>
                  <p className="font-medium">Ad Revenue</p>
                  <p className="text-sm text-gray-500">Income</p>
                </div>
              </div>
              <p className="font-semibold text-green-600">+$743.21</p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default Finances

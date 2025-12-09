import Link from "next/link"
import { Landmark, Percent, Clock, FileText, Calculator, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import prisma from "@/lib/prisma"

async function getLoans() {
  try {
    return await prisma.loan.findMany({
      where: { isActive: true },
      orderBy: { interestRate: "asc" },
    })
  } catch {
    return []
  }
}

const banks = [
  { name: "State Bank of India", rate: 8.40, maxAmount: "5 Cr", tenure: "30 years" },
  { name: "HDFC Bank", rate: 8.45, maxAmount: "5 Cr", tenure: "30 years" },
  { name: "ICICI Bank", rate: 8.50, maxAmount: "5 Cr", tenure: "30 years" },
  { name: "Axis Bank", rate: 8.55, maxAmount: "5 Cr", tenure: "30 years" },
  { name: "Bank of Baroda", rate: 8.40, maxAmount: "5 Cr", tenure: "30 years" },
  { name: "Punjab National Bank", rate: 8.45, maxAmount: "5 Cr", tenure: "30 years" },
]

export default async function LoansPage() {
  const loans = await getLoans()
  const displayLoans = loans.length > 0 ? loans : banks.map((b, i) => ({
    id: String(i),
    bankName: b.name,
    interestRate: b.rate,
    maxAmount: 50000000,
    tenure: b.tenure,
    processingFee: "0.5%",
    features: JSON.stringify(["Quick Approval", "Low Processing Fee", "No Hidden Charges"]),
    link: "#",
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold">Home Loan Calculator</h1>
          <p className="mt-4 text-lg text-green-100 max-w-2xl mx-auto">
            Compare home loan interest rates from top banks and find the best deal for your dream home.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <Percent className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-gray-900">8.40%</p>
              <p className="text-sm text-gray-500">Lowest Interest Rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Landmark className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-gray-900">50+</p>
              <p className="text-sm text-gray-500">Partner Banks</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-gray-900">48 Hrs</p>
              <p className="text-sm text-gray-500">Quick Approval</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <FileText className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-gray-900">Simple</p>
              <p className="text-sm text-gray-500">Documentation</p>
            </CardContent>
          </Card>
        </div>

        {/* EMI Calculator */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              EMI Calculator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loan Amount (₹)
                </label>
                <input
                  type="number"
                  placeholder="50,00,000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interest Rate (%)
                </label>
                <input
                  type="number"
                  placeholder="8.5"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tenure (Years)
                </label>
                <input
                  type="number"
                  placeholder="20"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Your Monthly EMI</p>
              <p className="text-3xl font-bold text-green-600">₹43,391</p>
              <p className="text-sm text-gray-500 mt-1">
                Total Interest: ₹54,13,816 | Total Amount: ₹1,04,13,816
              </p>
            </div>
            <Button className="mt-4 bg-green-600 hover:bg-green-700">Calculate EMI</Button>
          </CardContent>
        </Card>

        {/* Bank Comparison */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Compare Home Loan Rates</h2>
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-xl border">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left py-4 px-6 font-semibold text-gray-600">Bank</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600">Interest Rate</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600">Max Amount</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600">Tenure</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600">Processing Fee</th>
                <th className="text-right py-4 px-6 font-semibold text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {displayLoans.map((loan) => (
                <tr key={loan.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Landmark className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="font-medium">{loan.bankName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-green-600 font-semibold">{loan.interestRate}%</span>
                    <span className="text-gray-500 text-sm"> p.a.</span>
                  </td>
                  <td className="py-4 px-6">
                    {typeof loan.maxAmount === 'number'
                      ? `₹${(loan.maxAmount / 10000000).toFixed(0)} Cr`
                      : loan.maxAmount}
                  </td>
                  <td className="py-4 px-6">{loan.tenure}</td>
                  <td className="py-4 px-6">{loan.processingFee}</td>
                  <td className="py-4 px-6 text-right">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 gap-1">
                      Apply <ArrowRight className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Quick Approval</h3>
              <p className="text-gray-600 text-sm">
                Get your home loan approved within 48 hours with minimal documentation.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Best Rates</h3>
              <p className="text-gray-600 text-sm">
                We negotiate with banks to get you the best interest rates available.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Expert Guidance</h3>
              <p className="text-gray-600 text-sm">
                Our loan experts guide you through the entire process from application to disbursement.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

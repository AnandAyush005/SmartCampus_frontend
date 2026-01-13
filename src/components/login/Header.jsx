import { Mail } from "lucide-react"

export default function Header(){

    return <div className="text-center mb-8">
          <div className="w-20 h-20 bg-linear-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Mail className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
            SmartCampus Hub
          </h1>
          <p className="text-gray-600">Sign in to your account</p>
    </div>

}
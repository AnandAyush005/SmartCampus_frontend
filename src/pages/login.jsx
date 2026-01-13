// src/pages/Login.jsx - PERFECT MATCH FOR YOUR CONTROLLER

import Header from '../components/login/Header';
import Form from '../components/login/Form';

const Login = () => {

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-linear-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md">
        {/* Header */}
        <Header />

        {/* Form */}
        <Form />
      </div>
    </div>
  );
};

export default Login;

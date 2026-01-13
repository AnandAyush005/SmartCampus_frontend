export default function LoadingSpinner({ size = "lg" }) {
  const sizeClasses = {
    sm: "w-8 h-8 border-2",
    md: "w-12 h-12 border-4", 
    lg: "w-16 h-16 border-4"
  };

  return (
    <div className={`border-emerald-200 border-t-emerald-600 rounded-full animate-spin ${sizeClasses[size]} mx-auto`} />
  );
}

import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="text-center py-24">
      <h1 className="text-5xl font-bold mb-4">404</h1>
      <p className="text-gray-500 mb-6">পেজটি খুঁজে পাওয়া যায়নি</p>
      <Link to="/" className="text-primary underline">
        হোমে ফিরে যান
      </Link>
    </div>
  );
}

import { Package } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import CheckoutBlock from "../components/ui/checkout-block";

export default function CheckoutPage() {
  const { cart } = useCart();

  // Guard: Empty cart
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
        <Package className="h-12 w-12 text-gray-300 mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Your bag is empty</h1>
        <p className="text-center text-gray-600 max-w-md mb-8">
          Add items to your bag to proceed with checkout.
        </p>
        <Link
          to="/shop"
          className="px-8 py-3 bg-black text-white text-sm font-medium hover:bg-gray-900 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  // Render checkout
  return <CheckoutBlock cartItems={cart} />;
}

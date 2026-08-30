import { useCart } from "../../context/CartContext";
import "./CartToast.css";

export default function CartToast() {
  const { toastMessage } = useCart();

  if (!toastMessage) return null;

  return (
    <div className="cart-toast" role="status">
      <span className="cart-toast__check" aria-hidden="true">
        ✓
      </span>
      <span>{toastMessage}</span>
    </div>
  );
}

// 'use client';

// import React from 'react';
// import { useApi } from '@/contexts/ApiContext';
// import { useSession } from 'next-auth/react';

// export default function CartPage() {
//   const { cart, loading, error, removeFromCart, updateCartItem, checkout } = useApi();
//   const { data: session } = useSession();

//   const handleQuantityChange = (itemId: number, newQuantity: number) => {
//     if (newQuantity <= 0) {
//       removeFromCart(itemId);
//     } else {
//       updateCartItem(itemId, newQuantity);
//     }
//   };

//   const handleCheckout = () => {
//     if (!session) {
//       alert('Please log in to checkout');
//       return;
//     }
//     checkout();
//   };

//   const calculateTotal = () => {
//     return cart.reduce((total, item) => total + (item.product.unit_price * item.quantity), 0);
//   };

//   if (!session) {
//     return (
//       <div className="text-center py-12">
//         <div className="text-gray-400 text-6xl mb-4">🛒</div>
//         <h3 className="text-lg font-medium text-gray-900 mb-2">Please log in to view your cart</h3>
//         <p className="text-gray-500">You need to be logged in to access your shopping cart</p>
//       </div>
//     );
//   }

//   if (loading.cart) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="text-lg">Loading cart...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>

//       {error && (
//         <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
//           {error}
//         </div>
//       )}

//       {cart.length === 0 ? (
//         <div className="text-center py-12">
//           <div className="text-gray-400 text-6xl mb-4">🛒</div>
//           <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
//           <p className="text-gray-500">Add some products to get started</p>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Cart Items */}
//           <div className="lg:col-span-2 space-y-4">
//             {cart.map((item) => (
//               <div key={item.id} className="bg-white rounded-lg shadow-md p-6">
//                 <div className="flex items-center space-x-4">
//                   <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
//                     {item.product.images && item.product.images.length > 0 ? (
//                       <img
//                         src={item.product.images[0].image}
//                         alt={item.product.name}
//                         className="w-full h-full object-cover rounded-lg"
//                       />
//                     ) : (
//                       <div className="text-gray-400 text-2xl">📦</div>
//                     )}
//                   </div>
                  
//                   <div className="flex-1">
//                     <h3 className="text-lg font-semibold text-gray-900">{item.product.name}</h3>
//                     <p className="text-gray-600 text-sm">{item.product.description}</p>
//                     <p className="text-indigo-600 font-semibold">₹{item.product.unit_price}</p>
//                   </div>
                  
//                   <div className="flex items-center space-x-2">
//                     <button
//                       onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
//                       className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
//                     >
//                       -
//                     </button>
//                     <span className="w-12 text-center">{item.quantity}</span>
//                     <button
//                       onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
//                       className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
//                     >
//                       +
//                     </button>
//                   </div>
                  
//                   <div className="text-right">
//                     <p className="text-lg font-semibold text-gray-900">
//                       ₹{(item.product.unit_price * item.quantity).toFixed(2)}
//                     </p>
//                     <button
//                       onClick={() => removeFromCart(item.id)}
//                       className="text-red-600 hover:text-red-800 text-sm"
//                     >
//                       Remove
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Order Summary */}
//           <div className="bg-white rounded-lg shadow-md p-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
            
//             <div className="space-y-3">
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Subtotal</span>
//                 <span className="font-semibold">₹{calculateTotal().toFixed(2)}</span>
//               </div>
              
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Tax (18%)</span>
//                 <span className="font-semibold">₹{(calculateTotal() * 0.18).toFixed(2)}</span>
//               </div>
              
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Delivery</span>
//                 <span className="font-semibold">₹50.00</span>
//               </div>
              
//               <hr className="my-4" />
              
//               <div className="flex justify-between text-lg font-bold">
//                 <span>Total</span>
//                 <span>₹{(calculateTotal() * 1.18 + 50).toFixed(2)}</span>
//               </div>
//             </div>
            
//             <button
//               onClick={handleCheckout}
//               className="w-full mt-6 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
//             >
//               Proceed to Checkout
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

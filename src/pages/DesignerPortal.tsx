import React, { useState } from 'react';
import { useUser, SignInButton } from '@clerk/clerk-react';
import { useQuery, useMutation } from '@/hooks/useConvex';
import { api } from '../../convex/_generated/api';
import { Scissors, Search, Clock, CheckCircle2, ChevronRight, Menu, X, LogOut, MessageSquare } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function DesignerPortal() {
  const { user, isLoaded } = useUser();
  const convexUser = useQuery(api.users.getCurrentUser);
  const orders = useQuery(api.orders.getAll) || [];
  const updateProductionStatus = useMutation(api.orders.updateProductionStatus);
  const addNote = useMutation(api.orderActivity.addNote);

  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [newNote, setNewNote] = useState('');

  if (!isLoaded || (user && convexUser === undefined)) {
    return <div className="min-h-screen bg-surface flex items-center justify-center font-sans tracking-widest text-primary text-sm uppercase">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-surface text-primary font-sans">
        <Scissors className="w-12 h-12 mb-4 text-outline" />
        <h1 className="font-serif text-3xl mb-2 text-primary">Designer Portal</h1>
        <p className="text-on-surface-variant mb-8">Please sign in to view your assigned orders.</p>
        <SignInButton mode="modal" fallbackRedirectUrl="/designer">
          <button className="px-6 py-3 bg-primary text-surface font-sans text-xs tracking-widest uppercase hover:bg-tertiary transition-colors rounded-none">
            Log In
          </button>
        </SignInButton>
      </div>
    );
  }

  // Basic check: they must be a staff user (or have a role) to access this
  if (!convexUser?.roleId && convexUser?.role === 'client') {
    return <Navigate to="/" replace />;
  }

  // Filter orders assigned to this designer
  const assignedOrders = orders.filter(o => o.assignedDesignerId === convexUser?._id);

  return (
    <div className="min-h-screen bg-surface-container-lowest font-sans flex flex-col">
      <header className="bg-surface border-b border-surface-variant px-6 py-4 flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Scissors className="w-6 h-6 text-primary" />
          <h1 className="font-serif text-2xl text-primary tracking-tight">Designer Workspace</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-primary hidden sm:block">Welcome, {user.firstName}</span>
          <a href="/" className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2">
            <LogOut className="w-4 h-4" /> Exit
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-8 flex gap-8 flex-1 w-full relative">
        {/* Order List */}
        <div className={`flex-1 ${selectedOrder ? 'hidden lg:block' : 'block'}`}>
          <div className="mb-6">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-4">Your Active Tasks ({assignedOrders.filter(o => o.productionStatus !== 'completed').length})</h2>
          </div>

          <div className="grid gap-4">
            {assignedOrders.length === 0 ? (
              <div className="text-center py-12 bg-surface border border-surface-variant">
                <p className="text-on-surface-variant text-sm italic">You have no assigned orders right now.</p>
              </div>
            ) : (
              assignedOrders.map(order => (
                <div 
                  key={order._id}
                  onClick={() => setSelectedOrder(order)}
                  className={`bg-surface border p-5 cursor-pointer transition-colors hover:border-primary/50 ${
                    selectedOrder?._id === order._id ? 'border-primary shadow-sm' : 'border-surface-variant'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-xs font-mono bg-surface-variant/50 text-primary px-2 py-1 rounded">
                        {order.orderId || order._id.substring(0, 10)}
                      </span>
                      <h3 className="font-medium text-primary mt-2">{order.customerDetails?.firstName} {order.customerDetails?.lastName}</h3>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">
                      {order.productionStatus?.replace('_', ' ') || 'Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between items-end mt-4">
                    <p className="text-xs text-on-surface-variant">
                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                    </p>
                    <ChevronRight className="w-4 h-4 text-primary" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Order Details Panel */}
        {selectedOrder && (
          <div className="flex-1 lg:max-w-xl bg-surface border border-surface-variant flex flex-col h-[calc(100vh-100px)] sticky top-24">
            <div className="p-6 border-b border-surface-variant flex justify-between items-start bg-surface-container-lowest">
              <div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="lg:hidden text-[10px] uppercase tracking-widest font-bold text-on-surface-variant flex items-center gap-1 mb-4 hover:text-primary"
                >
                  ← Back to List
                </button>
                <h2 className="font-serif text-2xl text-primary">{selectedOrder.customerDetails?.firstName}'s Order</h2>
                <p className="text-sm text-on-surface-variant mt-1">{selectedOrder.orderId}</p>
              </div>
              <select
                value={selectedOrder.productionStatus || 'pending'}
                onChange={async (e) => {
                  try {
                    await updateProductionStatus({ orderId: selectedOrder._id, status: e.target.value });
                    toast.success("Status updated");
                    setSelectedOrder({...selectedOrder, productionStatus: e.target.value});
                  } catch (err: any) {
                    toast.error(err.message);
                  }
                }}
                className="bg-primary text-surface px-3 py-2 text-[10px] uppercase tracking-widest font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
              >
                <option value="pending">Not Started</option>
                <option value="cutting">Cutting</option>
                <option value="stitching">Stitching</option>
                <option value="fitting">Fitting</option>
                <option value="finishing">Finishing</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
              {/* Measurements & Items */}
              <section>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-4">Measurements & Requirements</h3>
                <div className="space-y-4">
                  {selectedOrder.items.map((item: any, idx: number) => (
                    <div key={idx} className="bg-surface-container-lowest border border-surface-variant p-4">
                      <p className="font-medium text-primary mb-3">{item.productName} (x{item.quantity})</p>
                      {item.measurements && Object.keys(item.measurements).length > 0 ? (
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                          {Object.entries(item.measurements).map(([key, val]) => (
                            <div key={key} className="flex justify-between items-end border-b border-surface-variant pb-1">
                              <span className="text-[10px] uppercase text-on-surface-variant">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                              <span className="text-xs font-bold text-primary">{String(val)}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-on-surface-variant italic">Standard size ({item.variantSku || 'N/A'})</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* Work Notes */}
              <section>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-4 flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5" /> Progress Notes
                </h3>
                <div className="flex gap-2 mb-4">
                  <input 
                    type="text"
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    placeholder="Add a work note..."
                    className="flex-1 bg-surface-container-lowest border border-surface-variant px-3 py-2 text-sm focus:outline-none focus:border-primary"
                    onKeyDown={e => {
                      if (e.key === 'Enter' && newNote.trim()) {
                        addNote({ orderId: selectedOrder._id, note: newNote }).then(() => setNewNote(''));
                      }
                    }}
                  />
                  <button 
                    onClick={() => {
                      if (newNote.trim()) {
                        addNote({ orderId: selectedOrder._id, note: newNote }).then(() => setNewNote(''));
                      }
                    }}
                    className="bg-primary text-surface px-4 text-[10px] font-bold uppercase tracking-widest hover:bg-tertiary transition-colors"
                  >
                    Add
                  </button>
                </div>
                
                <OrderActivityList orderId={selectedOrder._id} />
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function OrderActivityList({ orderId }: { orderId: any }) {
  const activity = useQuery(api.orderActivity.getByOrder, { orderId }) || [];
  
  if (activity.length === 0) {
    return <p className="text-xs italic text-on-surface-variant">No notes yet.</p>;
  }
  
  return (
    <div className="space-y-4">
      {activity.map((log: any) => (
        <div key={log._id} className="text-sm border-l-2 border-primary/20 pl-3 py-1">
          <p className="text-primary">{log.note}</p>
          <p className="text-[10px] text-on-surface-variant mt-1 uppercase tracking-widest">
            <span className="font-bold">{log.performedByName}</span> • {new Date(log.timestamp).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}

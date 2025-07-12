import { Transition } from '@headlessui/react';
import React, { useEffect } from 'react';
import { useToastStore } from '../store/toastStore';

export default function ToastStack() {
    const toasts = useToastStore(s => s.toasts);
    const removeToast = useToastStore(s => s.removeToast);

    useEffect(() => {
        const timers = toasts.map(t => setTimeout(() => removeToast(t.id), t.duration || 4000));
        return () => timers.forEach(clearTimeout);
    }, [toasts, removeToast]);

    return (
        <div className="fixed bottom-4 right-4 z-50 space-y-2">
            {toasts.map(toast => (
                <Transition
                    key={toast.id}
                    appear
                    show
                    enter="transform transition duration-300"
                    enterFrom="translate-y-2 opacity-0"
                    enterTo="translate-y-0 opacity-100"
                    leave="transition duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div
                        className={`p-3 rounded shadow text-sm border ${toast.type === 'error' ? 'border-red-500 text-red-700 bg-red-50' : 'border-green-500 text-green-700 bg-green-50'}`}
                    >
                        {toast.message}
                    </div>
                </Transition>
            ))}
        </div>
    );
}

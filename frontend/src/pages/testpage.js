import { useState } from "react";


export default function TestPage() {
    const [count, setCount] = useState(0);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
            <h1 className="text-3xl font-bold mb-4">Test Page</h1>
            <p className="text-lg mb-4">Counter: {count}</p>
            <button
                onClick={() => setCount(count + 1)}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
                Increment
            </button>
        </div>
    );
}

export default function AuthPage() {
    return (
        <div className="flex h-screen items-center justify-center">
            <div className="p-6 rounded-2xl shadow-md bg-white">
                <h1 className="text-2xl font-bold mb-4">Sign In</h1>
                <form className="flex flex-col gap-4">
                    <input
                        type="email"
                        placeholder="Email"
                        className="border rounded px-3 py-2"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="border rounded px-3 py-2"
                    />
                    <button
                        type="submit"
                        className="bg-black text-white rounded px-4 py-2 hover:bg-gray-800"
                    >
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
}

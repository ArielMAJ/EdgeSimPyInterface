import { useState } from "react";

export type Algorithm = "smms" | "thea";

export type SimulationInput = {
    algorithm: Algorithm;
    url_or_json: string | object;
};

export const usePost = <T>(url: string, options?: RequestInit): [T | null, boolean, string | null, (body: SimulationInput) => Promise<void>] => {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const postData = async (body: SimulationInput) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
                ...options,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.detail || "Failed to fetch data");
            }

            setData(result);
        } catch (error: unknown) {
            if (error instanceof Error) {
                setError(error.message || "An unknown error occurred");
            } else {
                setError("An unknown error occurred");
            }
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return [data, loading, error, postData];
};

export default usePost;
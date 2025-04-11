import { useState } from "react";

export type Algorithm = "smms" | "thea";

export type SimulationInput = {
    algorithm: Algorithm;
    url_or_json: string | object;
};

export const usePost = <T>(url: string, options?: RequestInit): [T | null, boolean, (body: SimulationInput) => Promise<void>] => {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const postData = async (body: SimulationInput) => {
        setLoading(true);
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
            setData(result);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    return [data, loading, postData];
};

export default usePost;
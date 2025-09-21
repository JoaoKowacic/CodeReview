import { useState, useEffect, useCallback } from "react";
import {
  getAllProgramingLanguages,
  type getProgramingLanguageResponse
} from "@/api/programing-languages/get";

export function useAlarmes() {
  const [data, setData] = useState<getProgramingLanguageResponse["data"] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAllProgrammingLanguages = useCallback(async (): Promise<getProgramingLanguageResponse["data"]> => {
    try {
      const response = await getAllProgramingLanguages();
      return response;
    } catch (error) {
      console.error("Erro ao buscar Alarmes:", error);
      throw error;
    }
  }, []);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchAllProgrammingLanguages();
      setData(result);
      setIsLoading(false);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      setIsLoading(false);
      throw err;
    }
  }, [fetchAllProgrammingLanguages]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    data,
    isLoading,
    error,
    refetch,
    isError: error !== null,
    isSuccess: data !== null && error === null
  };
}
"use client";

import { useState, useRef, FormEvent } from "react";
import ReactMarkdown from 'react-markdown';

interface AnalysisResponse {
  explanation: {
    markdown: string;
    overall_analysis: string;
    important_functions: Array<{
      name: string;
      code: string;
      explanation: string;
    }>;
  };
  analysis: {
    results: Record<string, {
      file: string;
      functions: Array<{
        name: string;
        code: string;
        docstring: string;
        fan_in: number;
        fan_out: number;
        is_entry_point: boolean;
      }>;
    }>;
  };
}

export default function Home() {
  const [query, setQuery] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!query.trim()) {
      setError("Please enter a query");
      return;
    }

    if (!file) {
      setError("Please upload a file");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("query", query);
    formData.append("file", file);

    try {
      const response = await fetch(
        "https://analyzer-agent-api.onrender.com/code-explainer/all-in-one",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(`An error occurred while sending the request: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-[family-name:var(--font-geist-sans)]">

      <div className="w-1/4 p-6 bg-white border-r border-gray-200 shadow-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="space-y-2">
            <label htmlFor="query" className="block text-sm font-medium text-gray-700">
              Query
            </label>
            <textarea
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm"
              rows={4}
              placeholder="Enter your query for code analysis..."
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="file" className="block text-sm font-medium text-gray-700">
              Upload File
            </label>
            <div className="flex flex-col items-center justify-center px-6 py-4 border-2 border-gray-300 border-dashed rounded-md hover:bg-gray-50 cursor-pointer transition duration-150" onClick={() => fileInputRef.current?.click()}>
              <input
                id="file"
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                required
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="text-sm text-gray-500">
                {file ? file.name : "Click to select a file"}
              </span>
            </div>
          </div>

          <div className="space-y-2 mt-2">
            <div className="text-sm font-medium text-gray-700 mb-2">Example Queries:</div>
            <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
              <ul className="text-sm text-gray-600 space-y-1.5">
                <li>• Explain what this code does</li>
                <li>• What are the 5 most important functions?</li>
                <li>• Summarize the create_user function</li>
                <li>• Give me an overall analysis of this codebase</li>
                <li>• What does the initialize_app function do?</li>
              </ul>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !query.trim() || !file}
            className="px-4 py-2 text-white bg-black rounded-md shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </form>
      </div>

      <div className="w-3/4 p-6 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-black"></div>
          </div>
        ) : result ? (
          <div className="prose max-w-none">
            <div className="markdown-content bg-white p-8 rounded-lg shadow-sm">
              <ReactMarkdown>{result.explanation.markdown}</ReactMarkdown>
            </div>

            <div className="mt-8 p-8 bg-white rounded-lg shadow-sm">
              <h2 className="text-xl font-bold mb-4">Overall Analysis</h2>
              <div className="text-gray-800">
                <ReactMarkdown>{result.explanation.overall_analysis}</ReactMarkdown>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full bg-white p-12 rounded-lg shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-16 h-16 text-gray-400 mb-4">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="text-lg text-gray-500">Upload a file and submit a query to view your code analysis.</p>
          </div>
        )}
      </div>
    </div>
  );
}

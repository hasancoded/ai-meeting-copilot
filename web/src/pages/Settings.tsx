import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { apiKeyApi, ApiKeyStatus } from "@/lib/api";
import { toast } from "sonner";
import { KeyRound, Trash2, ShieldCheck, ShieldAlert } from "lucide-react";

// ── Model catalogue ───────────────────────────────────────────────────────────
interface ModelOption {
  value: string;
  label: string;
  description: string;
}

const MODEL_OPTIONS: Record<"gemini" | "openai", ModelOption[]> = {
  gemini: [
    {
      value: "models/gemini-2.5-flash",
      label: "Gemini 2.5 Flash",
      description: "Recommended — fast, accurate, 1M token context",
    },
    {
      value: "models/gemini-1.5-flash",
      label: "Gemini 1.5 Flash",
      description: "Stable — lower cost alternative",
    },
    {
      value: "models/gemini-1.5-pro",
      label: "Gemini 1.5 Pro",
      description: "Best quality — 2M token context, higher cost",
    },
  ],
  openai: [
    {
      value: "gpt-4o-mini",
      label: "GPT-4o Mini",
      description: "Recommended — fast and cost-effective",
    },
    {
      value: "gpt-4o",
      label: "GPT-4o",
      description: "Best quality — higher cost",
    },
  ],
};

const PROVIDER_KEY_URLS: Record<string, string> = {
  gemini: "https://makersuite.google.com/app/apikey",
  openai: "https://platform.openai.com/api-keys",
};

const PROVIDER_LABELS: Record<string, string> = {
  gemini: "Google Gemini",
  openai: "OpenAI",
};

export const Settings = () => {
  const [status, setStatus] = useState<ApiKeyStatus | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState<"openai" | "gemini">("gemini");
  const [model, setModel] = useState<string>(MODEL_OPTIONS.gemini[0].value);

  // Keep model in sync when provider changes
  const handleProviderChange = (newProvider: "openai" | "gemini") => {
    setProvider(newProvider);
    setModel(MODEL_OPTIONS[newProvider][0].value);
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      setIsFetching(true);
      const data = await apiKeyApi.getStatus();
      setStatus(data);
      if (data.provider) {
        setProvider(data.provider);
        // Restore saved model or fall back to provider default
        setModel(data.model ?? MODEL_OPTIONS[data.provider][0].value);
      }
    } catch {
      // Error handled by interceptor
    } finally {
      setIsFetching(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      toast.error("Please enter your API key");
      return;
    }
    try {
      setIsSaving(true);
      await apiKeyApi.save(apiKey.trim(), provider, model);
      toast.success("API key saved successfully");
      setApiKey(""); // Clear immediately — never persist the raw key in state
      await loadStatus();
    } catch {
      // Error handled by interceptor
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async () => {
    try {
      setIsRemoving(true);
      await apiKeyApi.remove();
      toast.success("API key removed");
      setStatus({ saved: false, provider: null, model: null });
    } catch {
      // Error handled by interceptor
    } finally {
      setIsRemoving(false);
    }
  };

  const currentModels = MODEL_OPTIONS[provider];

  return (
    <Layout>
      <div className="max-w-2xl mx-auto animate-fade-in">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-gray-600">
            Choose your AI provider, model, and API key. Your key is encrypted
            at rest and is never returned to the browser after saving.
          </p>
        </div>

        {/* Status Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <KeyRound className="h-5 w-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                API Key Status
              </h2>
            </div>
          </CardHeader>
          <CardBody>
            {isFetching ? (
              <div className="flex items-center space-x-3 text-gray-500">
                <Spinner size="sm" />
                <span className="text-sm">Loading status…</span>
              </div>
            ) : status?.saved ? (
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center space-x-3">
                  <ShieldCheck className="h-6 w-6 text-success-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Key configured</p>
                    {status.provider && (
                      <p className="text-sm text-gray-500">
                        {PROVIDER_LABELS[status.provider] ?? status.provider}
                        {status.model && (
                          <span className="ml-1 font-mono text-xs text-gray-400">
                            · {status.model}
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemove}
                  isLoading={isRemoving}
                  disabled={isRemoving}
                  className="flex items-center space-x-2 border-error-300 text-error-600 hover:bg-error-50 hover:border-error-400"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Remove Key</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <ShieldAlert className="h-6 w-6 text-warning-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">No key saved</p>
                  <p className="text-sm text-gray-500">
                    Add your API key below to enable AI processing.
                  </p>
                </div>
                <Badge variant="warning">Not configured</Badge>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Save / Update Key Form */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">
              {status?.saved ? "Update Configuration" : "Add API Key"}
            </h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSave} className="space-y-5">
              {/* Provider selector */}
              <div>
                <label
                  htmlFor="provider"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  AI Provider
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(["gemini", "openai"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handleProviderChange(p)}
                      className={`px-4 py-3 rounded-lg border-2 text-left transition-all duration-150 ${
                        provider === p
                          ? "border-primary-500 bg-primary-50 text-primary-800"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <p className="font-semibold text-sm">
                        {p === "gemini" ? "Google Gemini" : "OpenAI"}
                      </p>
                      <p className="text-xs mt-0.5 opacity-70">
                        {p === "gemini"
                          ? "Lower cost · 1M context"
                          : "GPT-4o · Whisper"}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Model selector */}
              <div>
                <label
                  htmlFor="model"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Model
                </label>
                <div className="space-y-2">
                  {currentModels.map((m) => (
                    <label
                      key={m.value}
                      className={`flex items-start gap-3 px-4 py-3 rounded-lg border-2 cursor-pointer transition-all duration-150 ${
                        model === m.value
                          ? "border-primary-500 bg-primary-50"
                          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="model"
                        value={m.value}
                        checked={model === m.value}
                        onChange={() => setModel(m.value)}
                        className="mt-0.5 accent-primary-600"
                      />
                      <div>
                        <p
                          className={`text-sm font-medium ${model === m.value ? "text-primary-800" : "text-gray-900"}`}
                        >
                          {m.label}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {m.description}
                        </p>
                        <p className="text-xs font-mono text-gray-400 mt-0.5">
                          {m.value}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* API key input */}
              <div>
                <label
                  htmlFor="apiKey"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  API Key
                </label>
                <input
                  id="apiKey"
                  type="password"
                  autoComplete="off"
                  spellCheck={false}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={
                    status?.saved
                      ? "Enter a new key to replace the existing one"
                      : "Paste your API key here"
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-mono text-gray-900 shadow-sm transition-colors placeholder:font-sans placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <p className="mt-1.5 text-xs text-gray-500">
                  Get your key at{" "}
                  <a
                    href={PROVIDER_KEY_URLS[provider]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 underline font-medium"
                  >
                    {PROVIDER_KEY_URLS[provider]}
                  </a>
                  {" — "}
                  encrypted with AES-256-GCM before storage.
                </p>
              </div>

              <Button
                type="submit"
                isLoading={isSaving}
                disabled={isSaving || !apiKey.trim()}
                className="w-full"
              >
                {status?.saved ? "Update Configuration" : "Save Configuration"}
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </Layout>
  );
};

'use client';

import { useState, useEffect } from 'react';

interface Test {
  id: string;
  name: string;
  status: string;
  testCode: string;
  aiSummary: string;
  createdAt: string;
  filePath: string;
  detectedActions: string;
  suggestedAssertions: string;
  user: { name: string; email: string };
}

type Step = 'details' | 'record' | 'paste' | 'generating' | 'done';

export default function DashboardPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<Step>('details');
  const [recordingName, setRecordingName] = useState('');
  const [recordingUrl, setRecordingUrl] = useState('https://school.eduio.io/login');
  const [recordingId, setRecordingId] = useState('');
  const [playwrightCode, setPlaywrightCode] = useState('');
  const [generating, setGenerating] = useState(false);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchTests(); }, []);

  const fetchTests = async () => {
    try {
      const res = await fetch('/api/tests');
      const data = await res.json();
      setTests(data.tests || []);
    } catch (e) {
      console.error('Failed to fetch tests:', e);
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    setStep('details');
    setRecordingName('');
    setRecordingUrl('https://school.eduio.io/login');
    setPlaywrightCode('');
    setError('');
    setShowModal(true);
  };

  const startRecording = async () => {
    if (!recordingName.trim()) { setError('Please enter a test name'); return; }
    if (!recordingUrl.trim()) { setError('Please enter a starting URL'); return; }
    setError('');
    try {
      const res = await fetch('/api/recordings/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'staff-user', name: recordingName, startUrl: recordingUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start recording');
      setRecordingId(data.recordingId);
      setStep('record');
    } catch (e: any) { setError(e.message); }
  };

  const generateTest = async () => {
    if (!playwrightCode.trim()) { setError('Please paste your Playwright code'); return; }
    setError('');
    setGenerating(true);
    setStep('generating');
    try {
      const res = await fetch(`/api/recordings/${recordingId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playwrightCode, actions: [], screenshots: [] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate test');
      setStep('done');
      await fetchTests();
    } catch (e: any) {
      setError(e.message);
      setStep('paste');
    } finally { setGenerating(false); }
  };

  const approveTest = async (testId: string) => {
    if (!confirm('Approve this test and commit to repository?')) return;
    setApproving(true);
    try {
      const res = await fetch(`/api/tests/${testId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvedBy: 'Admin' }),
      });
      if (res.ok) {
        await fetchTests();
        setSelectedTest(prev => prev ? { ...prev, status: 'approved' } : null);
        alert('Test approved and committed to repository!');
      }
    } catch (e) { alert('Failed to approve test'); }
    finally { setApproving(false); }
  };

  const closeModal = () => { setShowModal(false); setStep('details'); setError(''); };

  const statusColor = (s: string) =>
    s === 'approved' ? 'bg-green-100 text-green-700' :
    s === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600';

  const steps: Step[] = ['details', 'record', 'paste', 'generating', 'done'];
  const stepIdx = steps.indexOf(step);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">EDUIO Test Recorder</h1>
            <p className="text-sm text-gray-500">AI-powered test generation with Gemini</p>
          </div>
          <button onClick={openModal} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium">
            + New Recording
          </button>
        </div>
      </header>

      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-3 flex gap-6 text-sm">
          <span className="text-gray-600">Total: <strong>{tests.length}</strong></span>
          <span className="text-yellow-600">Pending: <strong>{tests.filter(t => t.status === 'pending').length}</strong></span>
          <span className="text-green-600">Approved: <strong>{tests.filter(t => t.status === 'approved').length}</strong></span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-base font-semibold text-gray-800 mb-4">Generated Tests</h2>
            {loading ? (
              <div className="text-center py-12 text-gray-400">
                <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                Loading...
              </div>
            ) : tests.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-3">🎬</div>
                <p className="font-medium">No tests yet</p>
                <p className="text-xs mt-1">Click "+ New Recording" to start</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tests.map(test => (
                  <div key={test.id} onClick={() => setSelectedTest(test)}
                    className={`p-3 rounded-lg cursor-pointer transition border ${selectedTest?.id === test.id ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-transparent hover:bg-gray-100'}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-medium text-sm text-gray-800 truncate">{test.name}</div>
                      <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${statusColor(test.status)}`}>{test.status}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">{new Date(test.createdAt).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            {!selectedTest ? (
              <div className="text-center py-20 text-gray-400">
                <div className="text-5xl mb-4">👈</div>
                <p className="font-medium text-gray-500">Select a test to view details</p>
                <p className="text-sm mt-1">or click "+ New Recording" to create one</p>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedTest.name}</h2>
                    <p className="text-sm text-gray-500 mt-1">{selectedTest.aiSummary}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${statusColor(selectedTest.status)}`}>{selectedTest.status}</span>
                      <span className="text-xs text-gray-400">📁 {selectedTest.filePath}</span>
                    </div>
                  </div>
                  {selectedTest.status === 'pending' && (
                    <button onClick={() => approveTest(selectedTest.id)} disabled={approving}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 shrink-0">
                      {approving ? 'Committing...' : '✅ Approve & Commit'}
                    </button>
                  )}
                  {selectedTest.status === 'approved' && (
                    <span className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-medium text-sm">✅ Committed to Repo</span>
                  )}
                </div>

                {selectedTest.detectedActions && (() => {
                  try {
                    const actions = JSON.parse(selectedTest.detectedActions || '[]');
                    const assertions = JSON.parse(selectedTest.suggestedAssertions || '[]');
                    return actions.length > 0 || assertions.length > 0 ? (
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-blue-50 rounded-lg p-3">
                          <div className="text-xs font-semibold text-blue-700 mb-2">🤖 AI Detected Actions</div>
                          {actions.slice(0, 3).map((a: string, i: number) => <div key={i} className="text-xs text-blue-600 truncate">• {a}</div>)}
                        </div>
                        <div className="bg-purple-50 rounded-lg p-3">
                          <div className="text-xs font-semibold text-purple-700 mb-2">👁️ AI Assertions</div>
                          {assertions.slice(0, 3).map((a: string, i: number) => <div key={i} className="text-xs text-purple-600 truncate">• {a}</div>)}
                        </div>
                      </div>
                    ) : null;
                  } catch { return null; }
                })()}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-700">Generated Midscene Test Code</h3>
                    <button onClick={() => navigator.clipboard.writeText(selectedTest.testCode)} className="text-xs text-blue-600 hover:text-blue-700">
                      📋 Copy Code
                    </button>
                  </div>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto text-xs leading-relaxed max-h-96 font-mono">
                    {selectedTest.testCode}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h3 className="text-xl font-bold text-gray-900">New Test Recording</h3>
                <p className="text-sm text-gray-500 mt-0.5">AI will generate a Midscene test from your recording</p>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>

            <div className="flex items-center px-6 py-4 bg-gray-50 border-b gap-1">
              {steps.map((s, i) => (
                <div key={s} className="flex items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${stepIdx === i ? 'bg-blue-600 text-white' : stepIdx > i ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {stepIdx > i ? '✓' : i + 1}
                  </div>
                  {i < 4 && <div className={`w-10 h-0.5 ${stepIdx > i ? 'bg-green-500' : 'bg-gray-200'}`} />}
                </div>
              ))}
              <span className="ml-3 text-sm font-medium text-gray-600">
                {step === 'details' && 'Enter Details'}
                {step === 'record' && 'Record Flow'}
                {step === 'paste' && 'Paste Code'}
                {step === 'generating' && 'Generating...'}
                {step === 'done' && 'Complete!'}
              </span>
            </div>

            <div className="p-6">
              {step === 'details' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Test Name *</label>
                    <input type="text" value={recordingName} onChange={e => setRecordingName(e.target.value)}
                      placeholder="e.g., Login with valid credentials"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Starting URL *</label>
                    <input type="text" value={recordingUrl} onChange={e => setRecordingUrl(e.target.value)}
                      placeholder="https://school.eduio.io/login"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>}
                  <div className="flex gap-3 pt-2">
                    <button onClick={startRecording} className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 font-medium">Continue →</button>
                    <button onClick={closeModal} className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                  </div>
                </div>
              )}

              {step === 'record' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                    <div className="text-blue-800 font-semibold mb-2">📋 Run this command on your PC:</div>
                    <div className="bg-blue-900 text-green-400 font-mono text-sm p-4 rounded-lg flex items-center justify-between">
                      <span>npx playwright codegen {recordingUrl}</span>
                      <button onClick={() => navigator.clipboard.writeText(`npx playwright codegen ${recordingUrl}`)} className="text-blue-300 hover:text-white ml-4 text-xs shrink-0">📋 Copy</button>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="font-semibold text-gray-700 mb-3">Steps:</div>
                    {['Run the command above in your terminal', 'Browser opens with recorder panel on the right', 'Perform your actions (click, type, navigate)', 'Copy ALL the generated code from the recorder panel', 'Come back here and click "I Have the Code"'].map((s, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm text-gray-600 mb-2">
                        <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs shrink-0 mt-0.5">{i + 1}</div>
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setStep('paste')} className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 font-medium">I Have the Code →</button>
                    <button onClick={() => setStep('details')} className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50">Back</button>
                  </div>
                </div>
              )}

              {step === 'paste' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Paste Your Playwright Code Here *</label>
                    <textarea value={playwrightCode} onChange={e => setPlaywrightCode(e.target.value)}
                      placeholder={"Paste your Playwright codegen output here...\n\nimport { test, expect } from '@playwright/test';\n\ntest('test', async ({ page }) => {\n  await page.goto('https://school.eduio.io/login');\n  // ... your recorded actions\n});"}
                      className="w-full h-56 px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
                    <div className="text-xs text-gray-400 mt-1">
                      {playwrightCode.length > 0 ? `✅ ${playwrightCode.split('\n').length} lines pasted` : 'Paste the complete code from Playwright Codegen'}
                    </div>
                  </div>
                  {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>}
                  <div className="flex gap-3">
                    <button onClick={generateTest} disabled={!playwrightCode.trim()}
                      className="flex-1 bg-purple-600 text-white py-2.5 rounded-lg hover:bg-purple-700 font-medium disabled:opacity-40">
                      🤖 Generate AI Test
                    </button>
                    <button onClick={() => setStep('record')} className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50">Back</button>
                  </div>
                </div>
              )}

              {step === 'generating' && (
                <div className="text-center py-10">
                  <div className="animate-spin w-14 h-14 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-5"></div>
                  <div className="text-xl font-bold text-gray-800 mb-3">Generating AI Test...</div>
                  <div className="text-gray-500 text-sm space-y-1">
                    <p>🧠 Gemini is analyzing your recording</p>
                    <p>🔄 Converting to Midscene.js format</p>
                    <p>👁️ Adding visual AI assertions</p>
                    <p className="text-xs text-gray-400 mt-3">This takes 10-30 seconds</p>
                  </div>
                </div>
              )}

              {step === 'done' && (
                <div className="text-center py-10">
                  <div className="text-6xl mb-4">🎉</div>
                  <div className="text-xl font-bold text-gray-800 mb-2">Test Generated Successfully!</div>
                  <div className="text-gray-500 text-sm mb-6">Your Midscene.js test is ready for review.<br />Check the dashboard and click "Approve & Commit" when ready.</div>
                  <button onClick={closeModal} className="bg-green-600 text-white px-8 py-2.5 rounded-lg hover:bg-green-700 font-medium">View Dashboard →</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
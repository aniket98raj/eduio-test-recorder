'use client';

import { useState, useEffect } from 'react';

interface Test {
  id: string;
  name: string;
  status: string;
  testCode: string;
  aiSummary: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

export default function DashboardPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [recordingName, setRecordingName] = useState('');
  const [recordingUrl, setRecordingUrl] = useState('https://school.eduio.io/login');
  const [showRecordModal, setShowRecordModal] = useState(false);

  // Fetch tests on load
  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await fetch('/api/tests');
      const data = await response.json();
      setTests(data.tests);
    } catch (error) {
      console.error('Failed to fetch tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    if (!recordingName || !recordingUrl) {
      alert('Please enter test name and URL');
      return;
    }

    try {
      const response = await fetch('/api/recordings/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo-user', // Replace with actual user ID from auth
          name: recordingName,
          startUrl: recordingUrl,
        }),
      });

      const data = await response.json();
      alert(`Recording started! Use this command:\n\n${data.codegenCommand}\n\nAfter recording, paste the generated code to complete the test.`);
      setShowRecordModal(false);
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Failed to start recording');
    }
  };

  const approveTest = async (testId: string) => {
    if (!confirm('Approve this test and commit to repository?')) return;

    try {
      const response = await fetch(`/api/tests/${testId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approvedBy: 'Admin', // Replace with actual user
        }),
      });

      if (response.ok) {
        alert('Test approved and committed!');
        fetchTests();
      }
    } catch (error) {
      console.error('Failed to approve test:', error);
      alert('Failed to approve test');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">EDUIO Test Recorder</h1>
            <button
              onClick={() => setShowRecordModal(true)}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              + New Recording
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Test List */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Generated Tests</h2>
            
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : tests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No tests yet</div>
            ) : (
              <div className="space-y-2">
                {tests.map(test => (
                  <div
                    key={test.id}
                    onClick={() => setSelectedTest(test)}
                    className={`p-3 rounded-lg cursor-pointer transition ${
                      selectedTest?.id === test.id
                        ? 'bg-blue-50 border-2 border-primary'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm truncate">{test.name}</div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        test.status === 'approved' ? 'bg-green-100 text-green-700' :
                        test.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {test.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      by {test.user.name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Test Details */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            {!selectedTest ? (
              <div className="text-center py-16 text-gray-500">
                Select a test to view details
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold">{selectedTest.name}</h2>
                    <p className="text-sm text-gray-600 mt-1">{selectedTest.aiSummary}</p>
                  </div>
                  {selectedTest.status === 'pending' && (
                    <button
                      onClick={() => approveTest(selectedTest.id)}
                      className="bg-success text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                    >
                      Approve & Commit
                    </button>
                  )}
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Generated Test Code</h3>
                  <pre className="code-editor bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                    {selectedTest.testCode}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* New Recording Modal */}
      {showRecordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Start New Recording</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Test Name
                </label>
                <input
                  type="text"
                  value={recordingName}
                  onChange={e => setRecordingName(e.target.value)}
                  placeholder="e.g., Login with valid credentials"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Starting URL
                </label>
                <input
                  type="text"
                  value={recordingUrl}
                  onChange={e => setRecordingUrl(e.target.value)}
                  placeholder="https://school.eduio.io/login"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={startRecording}
                className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Start Recording
              </button>
              <button
                onClick={() => setShowRecordModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

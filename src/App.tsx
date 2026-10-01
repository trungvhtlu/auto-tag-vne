/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { AutoTagger } from './components/AutoTagger';
import { SampleManager } from './components/SampleManager';
import { SampleDatabaseView } from './components/SampleDatabaseView';
import { MetricsExplorer } from './components/MetricsExplorer';
import { RulesGuide } from './components/RulesGuide';
import { SampleArticle } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'tagger' | 'sample-input' | 'database' | 'metrics' | 'rules'>('tagger');
  const [samples, setSamples] = useState<SampleArticle[]>([]);
  const [prefillArticle, setPrefillArticle] = useState<{
    url?: string;
    title: string;
    content: string;
  } | undefined>(undefined);

  const fetchSamples = async () => {
    try {
      const res = await fetch('/api/sample-tags');
      if (res.ok) {
        const data = await res.json();
        setSamples(data);
      }
    } catch (err) {
      console.error('Failed to load sample tags:', err);
    }
  };

  useEffect(() => {
    fetchSamples();
  }, []);

  const handleSaveSample = async (newSampleData: {
    url: string;
    title: string;
    content: string;
    category?: string;
    tags: Array<{ tag: string; reason: string }>;
  }) => {
    const res = await fetch('/api/sample-tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSampleData),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Lỗi khi lưu bài mẫu.');
    }

    const data = await res.json();
    if (data.allSamples) {
      setSamples(data.allSamples);
    } else {
      await fetchSamples();
    }
  };

  const handleDeleteSample = async (id: number) => {
    const res = await fetch(`/api/sample-tags/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Lỗi khi xoá bài mẫu.');
    }

    const data = await res.json();
    if (data.allSamples) {
      setSamples(data.allSamples);
    } else {
      await fetchSamples();
    }
  };

  const handleSelectForTest = (sample: SampleArticle) => {
    setPrefillArticle({
      url: sample.url,
      title: sample.title,
      content: sample.content,
    });
    setActiveTab('tagger');
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        samplesCount={samples.length}
      />

      <main className="flex-1 pb-16">
        {activeTab === 'tagger' && (
          <AutoTagger
            onSaveToSamples={handleSaveSample}
            prefillArticle={prefillArticle}
          />
        )}

        {activeTab === 'sample-input' && (
          <SampleManager
            onSaveSample={handleSaveSample}
            onViewDatabase={() => setActiveTab('database')}
          />
        )}

        {activeTab === 'database' && (
          <SampleDatabaseView
            samples={samples}
            onDeleteSample={handleDeleteSample}
            onSelectForTest={handleSelectForTest}
            onGoToInput={() => setActiveTab('sample-input')}
            onRefresh={fetchSamples}
          />
        )}

        {activeTab === 'metrics' && <MetricsExplorer />}

        {activeTab === 'rules' && <RulesGuide />}
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#9f224e] font-serif">VnExpress</span>
            <span>Hệ thống Đánh Tag Tự động (Auto-Tagging System)</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Dựa trên Search Volume Keywordtool (24 tháng) & Lịch sử View Tax/Tag VnExpress (2 năm qua)
          </div>
        </div>
      </footer>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import type { Asset } from './types/market';
import { ApiExplorer } from './components/ApiExplorer';
import { getAssets } from './services/api';

export default function App() {
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    async function initAssets() {
      try {
        const data = await getAssets();
        setAssets(data);
      } catch (err) {
        console.error('Failed to load assets', err);
      }
    }
    initAssets();
  }, []);

  return (
    <div className="min-h-[100dvh] w-full flex flex-col bg-[#0a0e16] text-slate-200 font-sans antialiased overflow-x-hidden">
      <ApiExplorer assets={assets} />
    </div>
  );
}

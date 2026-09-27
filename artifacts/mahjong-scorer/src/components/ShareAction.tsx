import { Share2 } from 'lucide-react';
import { useState } from 'react';

export const MAHJONG_REFERENCE_SHARE_TITLE = 'Mahjong Reference — your table companion';
export const MAHJONG_REFERENCE_SHARE_URL = 'https://mahjong.smooks.co.uk/';

type ShareNavigator = {
  clipboard: Pick<Clipboard, 'writeText'>;
  share?: (data: ShareData) => Promise<void>;
};

export async function shareMahjongReference(browser: ShareNavigator = navigator): Promise<'shared' | 'copied' | 'cancelled'> {
  if (typeof browser.share === 'function') {
    try {
      await browser.share({
        title: MAHJONG_REFERENCE_SHARE_TITLE,
        text: MAHJONG_REFERENCE_SHARE_TITLE,
        url: MAHJONG_REFERENCE_SHARE_URL,
      });
      return 'shared';
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled';
    }
  }

  await browser.clipboard.writeText(MAHJONG_REFERENCE_SHARE_URL);
  return 'copied';
}

const buttonClass = 'inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-[#cfc3aa] bg-[#fbf8ed] px-3 text-[14px] font-semibold text-[#284d45] transition hover:bg-[#efe8da] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ae6249] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70';

export function ShareAction() {
  const [status, setStatus] = useState('');
  const [pending, setPending] = useState(false);

  const share = async () => {
    setPending(true);
    setStatus('');
    try {
      const result = await shareMahjongReference();
      if (result === 'copied') setStatus('Link copied. Share it with your table.');
    } catch {
      setStatus('Sharing is unavailable in this browser.');
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="relative flex shrink-0 items-center gap-2">
      <button type="button" aria-label="Share Mahjong Reference" onClick={share} disabled={pending} className={buttonClass}>
        <Share2 size={17} aria-hidden="true" />
        <span className="hidden min-[320px]:inline">Share</span>
      </button>
      <span role="status" aria-live="polite" className={`absolute right-0 top-full z-50 mt-2 w-max max-w-[calc(100vw-1.5rem)] rounded-lg border border-[#d8ceb8] bg-[#fbf8ed] px-3 py-2 text-[13px] font-medium text-[#284d45] shadow-md ${status ? '' : 'sr-only'}`}>{status}</span>
    </div>
  );
}

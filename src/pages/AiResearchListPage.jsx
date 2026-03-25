import { useState } from 'react';
import { useAiResearch } from '../hooks/useAiResearch';
import { useWishlist } from '../hooks/useWishlist';
import { claudeExtractPlaces, claudeGeneratePlaceInfo } from '../lib/claude';
import styles from './AiResearchListPage.module.css';

export default function AiResearchListPage() {
  const { researches, loading, deleteResearch } = useAiResearch();
  const { addToWishlist } = useWishlist();
  const [expanded, setExpanded] = useState(null);

  const [wishlistStep, setWishlistStep] = useState(null);
  const [activeResearchId, setActiveResearchId] = useState(null);
  const [extractedPlaces, setExtractedPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState('');
  const [wishlistForm, setWishlistForm] = useState({ location: '', memo: '' });
  const [generatingInfo, setGeneratingInfo] = useState(false);
  const [wishlistMessage, setWishlistMessage] = useState('');

  const resetWishlist = () => {
    setWishlistStep(null);
    setActiveResearchId(null);
    setExtractedPlaces([]);
    setSelectedPlace('');
    setWishlistForm({ location: '', memo: '' });
  };

  const handleWishlistStart = async (research) => {
    setActiveResearchId(research.id);
    setWishlistStep('extracting');
    try {
      const places = await claudeExtractPlaces(research.result);
      setExtractedPlaces(places);
      setWishlistStep('selecting');
    } catch (e) {
      setExtractedPlaces([]);
      setWishlistStep('selecting');
    }
  };

  const handleSelectPlace = async (place) => {
    setSelectedPlace(place);
    setWishlistForm({ location: '', memo: '' });
    setGeneratingInfo(true);
    setWishlistStep('filling');
    try {
      const info = await claudeGeneratePlaceInfo(place);
      setWishlistForm({ location: info.address || '', memo: info.notes || '' });
    } catch (e) {
      setWishlistForm({ location: '', memo: '' });
    }
    setGeneratingInfo(false);
  };

  const handleAddWishlist = async (researchId) => {
    if (!selectedPlace.trim()) return;
    await addToWishlist({
      name: selectedPlace,
      location: wishlistForm.location,
      memo: wishlistForm.memo,
      research_id: researchId,
    });
    setWishlistMessage('⭐ 行きたい場所に追加しました！');
    resetWishlist();
    setTimeout(() => setWishlistMessage(''), 3000);
  };

  if (loading) return <div className={styles.container}>読み込み中...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>📚 保存済みAI調査</h1>

      {wishlistMessage && <p className={styles.globalMessage}>{wishlistMessage}</p>}

      {researches.length === 0 ? (
        <p className={styles.empty}>保存された調査結果はありません。<br />AI情報収集ページで調べた結果を保存してみましょう！</p>
      ) : (
        <div className={styles.list}>
          {researches.map(r => (
            <div key={r.id} className={styles.card}>
              <div className={styles.cardHeader} onClick={() => setExpanded(expanded === r.id ? null : r.id)}>
                <div>
                  <h2 className={styles.cardTitle}>{r.title}</h2>
                  <p className={styles.cardMeta}>🔍 {r.query} · {new Date(r.created_at).toLocaleDateString('ja-JP')}</p>
                </div>
                <span className={styles.toggle}>{expanded === r.id ? '▲' : '▼'}</span>
              </div>

              {expanded === r.id && (
                <div className={styles.cardBody}>

                  {/* ── スクロールしても上部に固定されるボタンバー ── */}
                  <div className={styles.stickyBar}>
                    {(activeResearchId === null || activeResearchId === r.id) && wishlistStep === null && (
                      <button className={styles.wishBtn} onClick={() => handleWishlistStart(r)}>
                        ⭐ 行きたい場所に追加
                      </button>
                    )}
                    <button className={styles.deleteBtn} onClick={() => deleteResearch(r.id)}>
                      🗑️ 削除
                    </button>
                  </div>

                  {/* 調査結果テキスト */}
                  <div className={styles.resultText}>{r.result}</div>

                  {activeResearchId === r.id && wishlistStep === 'extracting' && (
                    <div className={styles.extracting}>🔍 場所を抽出中...</div>
                  )}

                  {activeResearchId === r.id && wishlistStep === 'selecting' && (
                    <div className={styles.wishForm}>
                      <p className={styles.wishLabel}>どこに行きたいですか？</p>
                      <div className={styles.placeButtons}>
                        {extractedPlaces.map(place => (
                          <button key={place} className={styles.placeBtn} onClick={() => handleSelectPlace(place)}>
                            {place}
                          </button>
                        ))}
                      </div>
                      <button className={styles.cancelBtn} onClick={resetWishlist}>キャンセル</button>
                    </div>
                  )}

                  {activeResearchId === r.id && wishlistStep === 'filling' && (
                    <div className={styles.wishForm}>
                      <p className={styles.wishLabel}>📍 {selectedPlace}</p>
                      {generatingInfo ? (
                        <div className={styles.extracting}>✨ 情報を生成中...</div>
                      ) : (
                        <>
                          <input
                            className={styles.input}
                            placeholder="住所・地域"
                            value={wishlistForm.location}
                            onChange={e => setWishlistForm(f => ({ ...f, location: e.target.value }))}
                          />
                          <textarea
                            className={styles.textarea}
                            placeholder="見どころメモ"
                            value={wishlistForm.memo}
                            rows={4}
                            onChange={e => setWishlistForm(f => ({ ...f, memo: e.target.value }))}
                          />
                          <div className={styles.formBtns}>
                            <button className={styles.wishBtn} onClick={() => handleAddWishlist(r.id)}>追加する</button>
                            <button className={styles.cancelBtn} onClick={() => setWishlistStep('selecting')}>← 選び直す</button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
